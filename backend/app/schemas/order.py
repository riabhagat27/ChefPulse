from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from app.schemas.menu import MenuItemOut

class OrderItemCreate(BaseModel):
    menu_item_id: int
    quantity: int = Field(..., gt=0)

class OrderCreate(BaseModel):
    items: List[OrderItemCreate]
    special_instructions: Optional[str] = None

class OrderItemOut(BaseModel):
    id: int
    menu_item_id: int
    quantity: int
    price: float
    menu_item: MenuItemOut

    class Config:
        from_attributes = True

class OrderStatusUpdate(BaseModel):
    status: str = Field(..., description="Order status")

class OrderOut(BaseModel):
    id: int
    customer_id: int
    customer_name: str
    total_amount: float
    order_status: str
    created_at: datetime
    special_instructions: Optional[str] = None
    items: List[OrderItemOut]

    class Config:
        from_attributes = True
