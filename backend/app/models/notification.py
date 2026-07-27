from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from app.database import Base

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True, index=True)  # Null if Admin alert or general broadcast
    text = Column(String, nullable=False)
    unread = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
