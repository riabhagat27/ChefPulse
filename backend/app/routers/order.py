from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.menu import MenuItem
from app.models.order import Order, OrderItem
from app.schemas.order import OrderCreate, OrderOut, OrderStatusUpdate
from app.services.auth import get_current_user

router = APIRouter(prefix="/api/orders", tags=["orders"])

@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def place_order(
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
        # Admin can view all orders
        return db.query(Order).order_by(Order.created_at.desc()).all()
    else:
        # Customer can view only their own orders
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

    # Ensure customers can only inspect their own orders
    if current_user.role != "admin" and order.customer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="unauthorized to view this order details"
        )
        
    return order

@router.put("/{order_id}/status", response_model=OrderOut)
def update_order_status(
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
    return order
