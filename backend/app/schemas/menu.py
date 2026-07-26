from pydantic import BaseModel, Field
from typing import Optional

class MenuItemBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1)
    price: float = Field(..., gt=0.0)
    category: str = Field(..., min_length=1, max_length=50)
    is_available: bool = True
    image_url: Optional[str] = None
    is_veg: bool = True
    prep_time: str = Field("15 mins", min_length=1, max_length=30)

class MenuItemCreate(MenuItemBase):
    pass

class MenuItemUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0.0)
    category: Optional[str] = Field(None, min_length=1, max_length=50)
    is_available: Optional[bool] = None
    image_url: Optional[str] = None
    is_veg: Optional[bool] = None
    prep_time: Optional[str] = Field(None, min_length=1, max_length=30)

class MenuItemOut(MenuItemBase):
    id: int

    class Config:
        from_attributes = True
