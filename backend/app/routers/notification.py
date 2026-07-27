from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import User, Notification
from app.schemas.notification import NotificationOut
from app.services.auth import get_current_user
from app.services.websocket import manager

router = APIRouter(prefix="/api/notifications", tags=["notifications"])

@router.get("", response_model=List[NotificationOut])
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="authentication required"
        )
        
    if current_user.role == "admin":
        # Admins receive both system notifications (where user_id is null) and their specific notifications
        return db.query(Notification).filter(
            (Notification.user_id == None) | (Notification.user_id == current_user.id)
        ).order_by(Notification.created_at.desc()).limit(50).all()
    else:
        # Customers see only their specific notifications
        return db.query(Notification).filter(
            Notification.user_id == current_user.id
        ).order_by(Notification.created_at.desc()).limit(50).all()

@router.put("/read")
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="authentication required"
        )
        
    if current_user.role == "admin":
        notifs = db.query(Notification).filter(
            (Notification.user_id == None) | (Notification.user_id == current_user.id)
        ).all()
    else:
        notifs = db.query(Notification).filter(
            Notification.user_id == current_user.id
        ).all()
        
    for n in notifs:
        n.unread = False
        
    db.commit()
    return {"message": "all notifications marked as read"}

@router.put("/{id}/read")
def mark_single_read(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="authentication required"
        )
        
    notif = db.query(Notification).filter(Notification.id == id).first()
    if not notif:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="notification not found"
        )
        
    # Check security scope
    if notif.user_id is not None and notif.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="access restricted"
        )
        
    notif.unread = False
    db.commit()
    return {"message": "notification marked as read"}
