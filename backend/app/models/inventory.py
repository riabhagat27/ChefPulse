from sqlalchemy import Column, Integer, String, Float, DateTime, func
from app.database import Base

class InventoryItem(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    quantity = Column(Float, default=0.0)
    unit = Column(String, default="kg")
    min_stock = Column(Float, default=1.0)
    category = Column(String, default="Ingredients")
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
