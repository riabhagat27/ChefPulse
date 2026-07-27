from fastapi import APIRouter, Depends, HTTPException, status, Request, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import os
import shutil
from app.database import get_db
from app.models.user import User
from app.models.menu import MenuItem
from app.schemas.menu import MenuItemCreate, MenuItemUpdate, MenuItemOut
from app.services.auth import get_current_user
from app.services.image_gen import generate_and_save_image

router = APIRouter(prefix="/api/menu", tags=["menu"])

def check_admin(current_user: User):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="operation restricted to restaurant administrators only"
        )

def format_item_out(item: MenuItem, request: Request, db: Session) -> MenuItemOut:
    # 1. Initialize image from local file or download it from Pollinations AI if missing
    if not item.image_url:
        local_filename = f"app/static/dish_images/{item.id}.jpg"
        if os.path.exists(local_filename):
            item.image_url = f"/static/dish_images/{item.id}.jpg"
            db.commit()
            db.refresh(item)
        else:
            generated_path = generate_and_save_image(item.name, item.id)
            if generated_path:
                item.image_url = generated_path
                db.commit()
                db.refresh(item)
                
    # 2. Make relative URL absolute for JSON response
    img = item.image_url
    if img and not (img.startswith("http://") or img.startswith("https://")):
        img = f"{request.base_url}{img.lstrip('/')}"
    elif not img:
        img = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=60"
        
    return MenuItemOut(
        id=item.id,
        name=item.name,
        description=item.description,
        price=item.price,
        category=item.category,
        is_available=item.is_available,
        image_url=img,
        is_veg=item.is_veg,
        prep_time=item.prep_time
    )

@router.get("", response_model=List[MenuItemOut])
def get_all_menu_items(request: Request, db: Session = Depends(get_db)):
    items = db.query(MenuItem).all()
    return [format_item_out(item, request, db) for item in items]

@router.post("", response_model=MenuItemOut, status_code=status.HTTP_201_CREATED)
def create_menu_item(
    item_in: MenuItemCreate, 
    request: Request,
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
    return format_item_out(new_item, request, db)

@router.put("/{item_id}", response_model=MenuItemOut)
def update_menu_item(
    item_id: int, 
    item_in: MenuItemUpdate, 
    request: Request,
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
    
    update_data = item_in.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(item, key, value)
        
    db.commit()
    db.refresh(item)
    return format_item_out(item, request, db)

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
        
    # Delete associated static file if it exists
    local_filename = f"app/static/dish_images/{item.id}.jpg"
    if os.path.exists(local_filename):
        try:
            os.remove(local_filename)
        except Exception:
            pass
            
    db.delete(item)
    db.commit()
    return

@router.patch("/{item_id}/availability", response_model=MenuItemOut)
def toggle_menu_item_availability(
    item_id: int, 
    request: Request,
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
    return format_item_out(item, request, db)

@router.post("/{item_id}/regenerate", response_model=MenuItemOut)
def regenerate_menu_item_image(
    item_id: int,
    request: Request,
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
        
    # Delete associated local file to force regeneration
    local_filename = f"app/static/dish_images/{item.id}.jpg"
    if os.path.exists(local_filename):
        try:
            os.remove(local_filename)
        except Exception:
            pass
            
    # Trigger image generation
    generated_path = generate_and_save_image(item.name, item.id)
    if generated_path:
        item.image_url = generated_path
        db.commit()
        db.refresh(item)
        
    return format_item_out(item, request, db)

@router.post("/{item_id}/upload-image", response_model=MenuItemOut)
def upload_custom_dish_image(
    item_id: int,
    request: Request,
    file: UploadFile = File(...),
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
        
    # Save file locally under static/dish_images, replacing whatever was there
    os.makedirs("app/static/dish_images", exist_ok=True)
    dest_path = f"app/static/dish_images/{item.id}.jpg"
    
    try:
        with open(dest_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save uploaded image file: {str(e)}"
        )
        
    item.image_url = f"/static/dish_images/{item.id}.jpg"
    db.commit()
    db.refresh(item)
    
    return format_item_out(item, request, db)
