from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class InventoryItemCreate(BaseModel):
    name: str
    quantity: float
    unit: str
    min_stock: float
    category: str

class InventoryItemUpdate(BaseModel):
    name: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    min_stock: Optional[float] = None
    category: Optional[str] = None

class InventoryItemOut(BaseModel):
    id: int
    name: str
    quantity: float
    unit: str
    min_stock: float
    category: str
    updated_at: datetime
    # Projections
    avg_daily_usage: float
    days_remaining: float
    status: str

    class Config:
        from_attributes = True
