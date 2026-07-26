from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base

class Reservation(Base):
    __tablename__ = "reservations"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    customer_name = Column(String, nullable=False)
    reservation_date = Column(String, nullable=False)
    reservation_time = Column(String, nullable=False)
    guests = Column(Integer, nullable=False)
    special_request = Column(String, nullable=True)
    status = Column(String, default="Pending", nullable=False)  # Pending, Confirmed, Cancelled
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User")
