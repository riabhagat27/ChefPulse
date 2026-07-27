from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import User, InventoryItem
from app.schemas.inventory import InventoryItemCreate, InventoryItemUpdate, InventoryItemOut
from app.services.auth import get_current_user
from app.services.websocket import manager

router = APIRouter(prefix="/api/inventory", tags=["inventory"])

def map_projections(item: InventoryItem):
    avg_usage = 3.0
    lower_name = item.name.lower()
    if "truffle" in lower_name:
        avg_usage = 0.5
    elif "prime" in lower_name or "ribeye" in lower_name or "steak" in lower_name:
        avg_usage = 3.0
    elif "lobster" in lower_name:
        avg_usage = 2.0
    elif "pasta" in lower_name:
        avg_usage = 4.0
    elif "cheese" in lower_name:
        avg_usage = 2.5
    elif "breast" in lower_name or "chicken" in lower_name:
        avg_usage = 3.5
    elif "tomatoes" in lower_name or "tomato" in lower_name:
        avg_usage = 4.5
    elif "rice" in lower_name:
        avg_usage = 5.0
    else:
        avg_usage = max(1.0, float(item.min_stock * 0.5))

    days_rem = float(item.quantity / avg_usage) if avg_usage > 0 else 99.0
    
    status_val = "Safe"
    if days_rem <= 2.0 or item.quantity < item.min_stock:
        status_val = "Critical"
    elif days_rem <= 5.0:
        status_val = "Running Low"
        
    return {
        "id": item.id,
        "name": item.name,
        "quantity": item.quantity,
        "unit": item.unit,
        "min_stock": item.min_stock,
        "category": item.category,
        "updated_at": item.updated_at,
        "avg_daily_usage": avg_usage,
        "days_remaining": days_rem,
        "status": status_val
    }

@router.get("", response_model=List[InventoryItemOut])
def get_inventory(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user or current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="access restricted to administration context only"
        )
    raw_items = db.query(InventoryItem).order_by(InventoryItem.name.asc()).all()
    return [map_projections(item) for item in raw_items]

@router.post("", response_model=InventoryItemOut)
async def create_inventory_item(
    item_in: InventoryItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user or current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="access restricted to administration context only"
        )
        
    existing = db.query(InventoryItem).filter(InventoryItem.name == item_in.name.strip()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ingredient item with this name already exists in inventory registry"
        )
        
    new_item = InventoryItem(
        name=item_in.name.strip(),
        quantity=item_in.quantity,
        unit=item_in.unit.strip(),
        min_stock=item_in.min_stock,
        category=item_in.category.strip()
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    
    # Broadcast inventory change update
    await manager.broadcast({"event": "inventory_updated"})
    return map_projections(new_item)

@router.put("/{id}", response_model=InventoryItemOut)
async def update_inventory_item(
    id: int,
    item_in: InventoryItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user or current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="access restricted to administration context only"
        )
        
    item = db.query(InventoryItem).filter(InventoryItem.id == id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="inventory item not found"
        )
        
    if item_in.name is not None:
        item.name = item_in.name.strip()
    if item_in.quantity is not None:
        item.quantity = item_in.quantity
    if item_in.unit is not None:
        item.unit = item_in.unit.strip()
    if item_in.min_stock is not None:
        item.min_stock = item_in.min_stock
    if item_in.category is not None:
        item.category = item_in.category.strip()
        
    db.commit()
    db.refresh(item)
    
    # Broadcast inventory change update
    await manager.broadcast({"event": "inventory_updated"})
    return map_projections(item)

@router.delete("/{id}")
async def delete_inventory_item(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user or current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="access restricted to administration context only"
        )
        
    item = db.query(InventoryItem).filter(InventoryItem.id == id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="inventory item not found"
        )
        
    db.delete(item)
    db.commit()
    
    # Broadcast inventory change update
    await manager.broadcast({"event": "inventory_updated"})
    return {"message": "inventory item deleted successfully"}
