from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from app.database import get_db
from app.models import User, Order, Reservation
from app.services.auth import get_current_user

router = APIRouter(prefix="/api/customers", tags=["customers"])

class CustomerOut(BaseModel):
    id: int
    full_name: str
    email: str
    orders_count: int
    reservations_count: int
    total_spent: float

@router.get("", response_model=List[CustomerOut])
def get_customers_list(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user or current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="access restricted to administration context only"
        )
        
    customers = db.query(User).filter(User.role == "customer").order_by(User.id.desc()).all()
    
    out = []
    for c in customers:
        orders_count = db.query(Order).filter(Order.customer_id == c.id).count()
        reservations_count = db.query(Reservation).filter(Reservation.customer_id == c.id).count()
        
        completed_orders = db.query(Order).filter(
            Order.customer_id == c.id, 
            Order.order_status == "Completed"
        ).all()
        total_spent = sum(o.total_amount for o in completed_orders)
        
        out.append(CustomerOut(
            id=c.id,
            full_name=c.full_name,
            email=c.email,
            orders_count=orders_count,
            reservations_count=reservations_count,
            total_spent=float(total_spent)
        ))
        
    return out
