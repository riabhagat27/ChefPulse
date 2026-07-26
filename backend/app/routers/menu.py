from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.menu import MenuItem
from app.schemas.menu import MenuItemCreate, MenuItemUpdate, MenuItemOut
from app.services.auth import get_current_user

router = APIRouter(prefix="/api/menu", tags=["menu"])

def check_admin(current_user: User):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="operation restricted to restaurant administrators only"
        )

@router.get("", response_model=List[MenuItemOut])
def get_all_menu_items(db: Session = Depends(get_db)):
    return db.query(MenuItem).all()

@router.post("", response_model=MenuItemOut, status_code=status.HTTP_201_CREATED)
def create_menu_item(
    item_in: MenuItemCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    check_admin(current_user)
    
    new_item = MenuItem(
        name=item_in.name,
        description=item_in.description,
        price=item_in.price,
        category=item_in.category,
        is_available=item_in.is_available,
        image_url=item_in.image_url,
        is_veg=item_in.is_veg,
        prep_time=item_in.prep_time
    )
    
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@router.put("/{item_id}", response_model=MenuItemOut)
def update_menu_item(
    item_id: int, 
    item_in: MenuItemUpdate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    check_admin(current_user)
    
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="menu item not found"
        )
    
    # Update fields dynamically
    update_data = item_in.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(item, key, value)
        
    db.commit()
    db.refresh(item)
    return item

@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_menu_item(
    item_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    check_admin(current_user)
    
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="menu item not found"
        )
        
    db.delete(item)
    db.commit()
    return

@router.patch("/{item_id}/availability", response_model=MenuItemOut)
def toggle_menu_item_availability(
    item_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    check_admin(current_user)
    
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="menu item not found"
        )
        
    item.is_available = not item.is_available
    db.commit()
    db.refresh(item)
    return item
