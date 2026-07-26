from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class ReservationCreate(BaseModel):
    reservation_date: str = Field(..., description="Date of reservation, e.g., YYYY-MM-DD")
    reservation_time: str = Field(..., description="Time of reservation, e.g., HH:MM")
    guests: int = Field(..., ge=1, description="Number of guests")
    special_request: Optional[str] = Field(None, description="Optional custom requests or preferences")

class ReservationStatusUpdate(BaseModel):
    status: str = Field(..., description="Status value: Pending, Confirmed, Cancelled")

class ReservationOut(BaseModel):
    id: int
    customer_id: int
    customer_name: str
    reservation_date: str
    reservation_time: str
    guests: int
    special_request: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
        orm_mode = True
