from sqlalchemy import Column, Integer, String, Float, Boolean
from app.database import Base

class MenuItem(Base):
    __tablename__ = "menu_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    category = Column(String, nullable=False, index=True)  # e.g., 'Starters', 'Main Course', 'Pizza', 'Burgers', 'Desserts', 'Drinks'
    is_available = Column(Boolean, nullable=False, default=True)
    image_url = Column(String, nullable=True)
    is_veg = Column(Boolean, nullable=False, default=True)
    prep_time = Column(String, nullable=False, default="15 mins")
