from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timezone, timedelta
from app.database import get_db
from app.models import User, Order, OrderItem, MenuItem, Notification, InventoryItem
from app.schemas.order import OrderCreate, OrderOut, OrderStatusUpdate
from app.services.auth import get_current_user
from app.services.websocket import manager

router = APIRouter(prefix="/api/orders", tags=["orders"])

@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
async def place_order(
    order_in: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="authentication required"
        )
        
    if not order_in.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="cannot place order with empty cart"
        )

    # 1. Verify items and calculate total amount
    calculated_total = 0.0
    items_to_create = []
    
    for item in order_in.items:
        menu_item = db.query(MenuItem).filter(MenuItem.id == item.menu_item_id).first()
        if not menu_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"menu item with id {item.menu_item_id} not found"
            )
            
        if not menu_item.is_available:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"menu item '{menu_item.name}' is currently out of stock"
            )
            
        calculated_total += menu_item.price * item.quantity
        items_to_create.append((menu_item, item.quantity))

    # 2. Create the main Order record
    new_order = Order(
        customer_id=current_user.id,
        customer_name=current_user.full_name,
        total_amount=calculated_total,
        order_status="Pending",
        special_instructions=order_in.special_instructions
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    # 3. Create the OrderItem records
    for menu_item, quantity in items_to_create:
        order_item = OrderItem(
            order_id=new_order.id,
            menu_item_id=menu_item.id,
            quantity=quantity,
            price=menu_item.price
        )
        db.add(order_item)
        
    db.commit()
    db.refresh(new_order)
    
    # Create notification for admin
    new_notif = Notification(
        user_id=None,
        text=f"New Order Received: Order #{new_order.id} for {new_order.customer_name} (${new_order.total_amount:.2f})"
    )
    db.add(new_notif)
    db.commit()
    
    # Broadcast order creation to connections
    await manager.broadcast({
        "event": "order_created",
        "order_id": new_order.id,
        "customer_name": new_order.customer_name
    })
    
    # Broadcast the admin real-time custom notification toast event
    await manager.broadcast({
        "event": "new_notification",
        "role": "admin",
        "text": f"New Customer Order Placed: Order #{new_order.id} by {new_order.customer_name} (${new_order.total_amount:.2f})",
        "type": "order"
    })

    # High sales milestone check
    if new_order.total_amount >= 100.0:
        milestone_text = f"High sales milestone reached: Order #{new_order.id} exceeded $100 with total ${new_order.total_amount:.2f}!"
        milestone_notif = Notification(user_id=None, text=milestone_text)
        db.add(milestone_notif)
        db.commit()
        await manager.broadcast({
            "event": "new_notification",
            "role": "admin",
            "text": milestone_text,
            "type": "success"
        })

    # Check for low inventory warnings, run out predictions, and AI recommendations
    low_items = db.query(InventoryItem).filter(InventoryItem.quantity < InventoryItem.min_stock).all()
    for item in low_items:
        text = f"Low inventory detected for {item.name}: {item.quantity} {item.unit} remaining!"
        inv_notif = Notification(user_id=None, text=text)
        db.add(inv_notif)
        db.commit()
        await manager.broadcast({
            "event": "new_notification",
            "role": "admin",
            "text": text,
            "type": "warning"
        })

        # Inventory predicted to run out soon
        runout_text = f"Inventory predicted to run out soon: {item.name} has only {item.quantity} {item.unit} left."
        runout_notif = Notification(user_id=None, text=runout_text)
        db.add(runout_notif)
        db.commit()
        await manager.broadcast({
            "event": "new_notification",
            "role": "admin",
            "text": runout_text,
            "type": "warning"
        })

        # AI inventory recommendations
        rec_text = f"AI Inventory Recommendation: Order restock for {item.name}. Safety margins are critically low."
        rec_notif = Notification(user_id=None, text=rec_text)
        db.add(rec_notif)
        db.commit()
        await manager.broadcast({
            "event": "new_notification",
            "role": "admin",
            "text": rec_text,
            "type": "warning"
        })

    # AI detects unusual demand
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    today_orders_count = db.query(Order).filter(Order.created_at >= today_start).count()
    
    day_counts = []
    for i in range(1, 8):
        d_start = today_start - timedelta(days=i)
        d_end = d_start + timedelta(days=1)
        cnt = db.query(Order).filter(Order.created_at >= d_start, Order.created_at < d_end).count()
        day_counts.append(cnt)
        
    avg_orders = sum(day_counts) / len(day_counts) if day_counts else 5
    if today_orders_count >= max(2, int(avg_orders * 1.25)):
        demand_text = f"AI Demand Alert: High volume of {today_orders_count} orders placed today (exceeds average by {int((today_orders_count - avg_orders) / (avg_orders or 1) * 100)}%)!"
        demand_notif = Notification(user_id=None, text=demand_text)
        db.add(demand_notif)
        db.commit()
        await manager.broadcast({
            "event": "new_notification",
            "role": "admin",
            "text": demand_text,
            "type": "warning"
        })
        
    await manager.broadcast({"event": "analytics_updated"})
    await manager.broadcast({"event": "notification_created"})
    
    return new_order

@router.get("", response_model=List[OrderOut])
def get_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="authentication required"
        )

    if current_user.role == "admin":
        return db.query(Order).order_by(Order.created_at.desc()).all()
    else:
        return db.query(Order).filter(Order.customer_id == current_user.id).order_by(Order.created_at.desc()).all()

@router.get("/{order_id}", response_model=OrderOut)
def get_order_details(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="authentication required"
        )
        
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="order not found"
        )
        
    if current_user.role != "admin" and order.customer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="unauthorized to view this order details"
        )
        
    return order

@router.put("/{order_id}/status", response_model=OrderOut)
async def update_order_status(
    order_id: int,
    status_update: OrderStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="authentication required"
        )
        
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="status updates are restricted to restaurant staff only"
        )
        
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="order not found"
        )

    allowed_statuses = ["Pending", "Accepted", "Preparing", "Ready", "Completed", "Cancelled"]
    new_status = status_update.status.strip()
    
    if new_status not in allowed_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"invalid status. must be one of {allowed_statuses}"
        )

    valid_transitions = {
        "Pending": ["Accepted", "Preparing", "Cancelled", "Ready", "Completed"],
        "Accepted": ["Preparing", "Cancelled", "Ready", "Completed"],
        "Preparing": ["Ready", "Cancelled", "Completed"],
        "Ready": ["Completed", "Cancelled"],
        "Completed": [],
        "Cancelled": []
    }
    
    current_status = order.order_status
    if new_status != current_status and new_status not in valid_transitions.get(current_status, []):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"invalid transition from status '{current_status}' to '{new_status}'"
        )

    order.order_status = new_status
    db.commit()
    db.refresh(order)
    
    # Create notification for customer
    status_text = {
        "Accepted": f"Your order #{order.id} has been accepted.",
        "Preparing": f"Your order #{order.id} is now being prepared in the kitchen.",
        "Ready": f"Your order #{order.id} is ready for pick up or service!",
        "Completed": f"Your order #{order.id} is completed and served. Enjoy your meal!",
        "Cancelled": f"Your order #{order.id} has been cancelled."
    }.get(new_status, f"Your order #{order.id} status is now {new_status}.")
    
    new_notif = Notification(
        user_id=order.customer_id,
        text=status_text
    )
    db.add(new_notif)
    db.commit()
    
    # Broadcast status change to connections
    await manager.broadcast({
        "event": "order_status_updated",
        "order_id": order.id,
        "customer_id": order.customer_id,
        "status": new_status
    })

    # Broadcast customer status toast notification event
    toast_text = {
        "Accepted": "Your order has been accepted by the restaurant.",
        "Preparing": "Our chefs have started preparing your meal.",
        "Ready": "Your order is ready for pickup/serving.",
        "Completed": "Thank you for dining with us.",
        "Cancelled": "Your order has been cancelled."
    }.get(new_status, f"Your order status is now {new_status}.")

    toast_type = {
        "Accepted": "success",
        "Preparing": "order",
        "Ready": "order",
        "Completed": "success",
        "Cancelled": "error"
    }.get(new_status, "success")

    await manager.broadcast({
        "event": "new_notification",
        "role": "customer",
        "customer_id": order.customer_id,
        "text": toast_text,
        "type": toast_type
    })
    
    # Loyalty reward check on completed order status transition
    if new_status == "Completed":
        user_orders = db.query(Order).filter(
            Order.customer_id == order.customer_id,
            Order.order_status == "Completed"
        ).all()
        total_spent = sum(o.total_amount for o in user_orders)
        prev_spent = total_spent - order.total_amount
        
        reward_text = None
        if total_spent >= 500.0 and prev_spent < 500.0:
            reward_text = "Loyalty reward earned: Congratulations! You have been promoted to the Royal VIP tier!"
        elif total_spent >= 200.0 and prev_spent < 200.0:
            reward_text = "Loyalty reward earned: Congratulations! You have been promoted to the Silver Prestige tier!"
            
        if reward_text:
            reward_notif = Notification(user_id=order.customer_id, text=reward_text)
            db.add(reward_notif)
            db.commit()
            
            await manager.broadcast({
                "event": "new_notification",
                "role": "customer",
                "customer_id": order.customer_id,
                "text": reward_text,
                "type": "success"
            })
            await manager.broadcast({"event": "notification_created"})

    if new_status == "Completed" or current_status == "Completed":
        await manager.broadcast({"event": "analytics_updated"})
        
    await manager.broadcast({"event": "notification_created"})
        
    return order
