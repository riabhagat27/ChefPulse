from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
from typing import List
from collections import Counter
from app.database import get_db
from app.models import User, Order, OrderItem, MenuItem, Reservation
from app.schemas.analytics import AnalyticsOut
from app.services.auth import get_current_user

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

@router.get("", response_model=AnalyticsOut)
def get_analytics(
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
            detail="access restricted to administration context only"
        )
        
    # Calculate order statuses counts
    total_orders = db.query(Order).count()
    pending_orders = db.query(Order).filter(Order.order_status == "Pending").count()
    completed_orders = db.query(Order).filter(Order.order_status == "Completed").count()
    
    # Calculate today counts
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    today_orders = db.query(Order).filter(Order.created_at >= today_start).count()
    
    today_str = datetime.now(timezone.utc).date().isoformat()
    today_reservations = db.query(Reservation).filter(Reservation.reservation_date == today_str).count()
    
    # Customer counts
    total_customers = db.query(User).filter(User.role == "customer").count()
    
    # Revenue and averages
    completed_orders_list = db.query(Order).filter(Order.order_status == "Completed").all()
    total_revenue = sum(o.total_amount for o in completed_orders_list)
    average_order_value = total_revenue / len(completed_orders_list) if completed_orders_list else 0.0
    
    # Item statistics
    item_counts = Counter()
    all_orders = db.query(Order).filter(Order.order_status != "Cancelled").all()
    for order in all_orders:
        for item in order.items:
            item_counts[item.menu_item.name] += item.quantity
            
    most_common = item_counts.most_common(5)
    most_ordered_item = {"name": most_common[0][0], "count": most_common[0][1]} if most_common else {"name": "None", "count": 0}
    top_items = [{"name": name, "count": count} for name, count in most_common]
    
    # Last 7 days time series
    orders_last_7 = []
    revenue_last_7 = []
    
    for i in range(6, -1, -1):
        target_date = datetime.now(timezone.utc) - timedelta(days=i)
        date_str = target_date.strftime("%b %d")
        
        # Midnight of that day in UTC
        day_start = target_date.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        
        day_orders = db.query(Order).filter(
            Order.created_at >= day_start,
            Order.created_at < day_end
        ).all()
        
        orders_last_7.append({"date": date_str, "count": len(day_orders)})
        
        day_rev = sum(o.total_amount for o in day_orders if o.order_status == "Completed")
        revenue_last_7.append({"date": date_str, "amount": float(day_rev)})
        
    return {
        "total_orders": total_orders,
        "pending_orders": pending_orders,
        "completed_orders": completed_orders,
        "today_orders": today_orders,
        "today_reservations": today_reservations,
        "total_customers": total_customers,
        "total_revenue": total_revenue,
        "average_order_value": average_order_value,
        "most_ordered_item": most_ordered_item,
        "top_items": top_items,
        "orders_last_7_days": orders_last_7,
        "revenue_last_7_days": revenue_last_7
    }
