from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class NotificationOut(BaseModel):
    id: int
    user_id: Optional[int] = None
    text: str
    unread: bool
    created_at: datetime

    class Config:
        from_attributes = True
