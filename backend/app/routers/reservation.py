from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import User, Reservation, Notification
from app.schemas.reservation import ReservationCreate, ReservationStatusUpdate, ReservationOut
from app.services.auth import get_current_user
from app.services.websocket import manager

router = APIRouter(prefix="/api/reservations", tags=["reservations"])

@router.post("", response_model=ReservationOut)
async def create_reservation(
    booking: ReservationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="authentication required"
        )
    
    try:
        new_res = Reservation(
            customer_id=current_user.id,
            customer_name=current_user.full_name,
            reservation_date=booking.reservation_date,
            reservation_time=booking.reservation_time,
            guests=booking.guests,
            special_request=booking.special_request,
            status="Pending"
        )
        db.add(new_res)
        db.commit()
        db.refresh(new_res)
        
        # Create notification for admin
        new_notif = Notification(
            user_id=None,
            text=f"New Reservation Request: {new_res.customer_name} ({new_res.guests} Guests) for {new_res.reservation_date} at {new_res.reservation_time}"
        )
        db.add(new_notif)
        db.commit()
        
        # Broadcast booking request
        await manager.broadcast({
            "event": "reservation_created",
            "reservation_id": new_res.id,
            "customer_name": new_res.customer_name
        })
        
        # Broadcast the admin real-time custom notification toast event
        await manager.broadcast({
            "event": "new_notification",
            "role": "admin",
            "text": f"New Table Reservation Request: {new_res.customer_name} ({new_res.guests} Guests)",
            "type": "reservation"
        })

        await manager.broadcast({"event": "notification_created"})
        
        return new_res
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"failed to record booking: {str(e)}"
        )

@router.get("", response_model=List[ReservationOut])
def get_reservations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="authentication required"
        )
        
    if current_user.role == "admin":
        return db.query(Reservation).order_by(Reservation.reservation_date.desc(), Reservation.reservation_time.desc()).all()
    else:
        return db.query(Reservation).filter(Reservation.customer_id == current_user.id).order_by(Reservation.reservation_date.desc(), Reservation.reservation_time.desc()).all()

@router.get("/{id}", response_model=ReservationOut)
def get_reservation_details(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="authentication required"
        )
        
    res = db.query(Reservation).filter(Reservation.id == id).first()
    if not res:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="reservation not found"
        )
        
    # Security scope check
    if current_user.role != "admin" and res.customer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="access restricted"
        )
        
    return res

@router.put("/{id}/status", response_model=ReservationOut)
async def update_reservation_status(
    id: int,
    status_update: ReservationStatusUpdate,
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
            detail="status updates are restricted to restaurant administration only"
        )
        
    res = db.query(Reservation).filter(Reservation.id == id).first()
    if not res:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="reservation booking not found"
        )
        
    new_status = status_update.status.strip()
    allowed_statuses = ["Pending", "Confirmed", "Cancelled"]
    if new_status not in allowed_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"invalid status. must be one of {allowed_statuses}"
        )
        
    try:
        res.status = new_status
        db.commit()
        db.refresh(res)
        
        # Create notification for customer
        status_text = {
            "Confirmed": f"Your table reservation for {res.reservation_date} at {res.reservation_time} has been confirmed.",
            "Cancelled": f"Your table reservation for {res.reservation_date} at {res.reservation_time} has been cancelled."
        }.get(new_status, f"Your reservation status is now {new_status}.")
        
        new_notif = Notification(
            user_id=res.customer_id,
            text=status_text
        )
        db.add(new_notif)
        db.commit()
        
        # Broadcast reservation status change
        await manager.broadcast({
            "event": "reservation_status_updated",
            "reservation_id": res.id,
            "customer_id": res.customer_id,
            "status": new_status
        })

        # Broadcast customer status toast notification event
        toast_text = {
            "Confirmed": "Your table has been confirmed.",
            "Cancelled": "Your reservation has been cancelled."
        }.get(new_status, f"Your reservation status is now {new_status}.")
        
        toast_type = {
            "Confirmed": "success",
            "Cancelled": "error"
        }.get(new_status, "success")
        
        await manager.broadcast({
            "event": "new_notification",
            "role": "customer",
            "customer_id": res.customer_id,
            "text": toast_text,
            "type": toast_type
        })

        await manager.broadcast({"event": "notification_created"})
        
        return res
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"failed to update booking: {str(e)}"
        )
