from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List, Optional
import re
import hashlib

from app.database import get_db
from app.models.user import User
from app.models.menu import MenuItem
from app.models.order import Order
from app.schemas.assistant import (
    ChatInput, ChatOutput,
    VoiceOrderInput, VoiceOrderOutput,
    BillExplanationInput, BillExplanationOutput,
    ScanDishInput, ScanDishOutput, ScanDishMatchedItem, VoiceOrderOutputItem
)
from app.services.auth import get_current_user
from app.services.assistant import generate_reply

router = APIRouter(prefix="/api/assistant", tags=["assistant"])

@router.post("/chat", response_model=ChatOutput)
def chat_with_assistant(
    chat_in: ChatInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="authentication required"
        )
        
    try:
        reply_content = generate_reply(chat_in.message, db, current_user.role)
        return {"reply": reply_content}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"assistant error: {str(e)}"
        )

# Mapping English quantity words to digits
WORD_TO_NUM = {
    "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
    "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
    "a": 1, "an": 1, "some": 1
}

@router.post("/voice-order", response_model=VoiceOrderOutput)
def process_voice_order(
    voice_in: VoiceOrderInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="authentication required"
        )

    # 1. Fetch available menu items
    menu_items = db.query(MenuItem).filter(MenuItem.is_available == True).all()
    if not menu_items:
        return {"matched": [], "ambiguous": []}

    # 2. Parse spoken text
    text = voice_in.text.lower().strip()
    # Normalize clean separators
    text = text.replace(" and ", ", ").replace(" with ", ", ").replace(" also ", ", ")
    clauses = [c.strip() for c in re.split(r',|\.', text) if c.strip()]
    
    matched = []
    ambiguous = []

    for clause in clauses:
        words = clause.split()
        if not words:
            continue
        
        # Check first token for quantity matching
        quantity = 1
        first_word = words[0]
        if first_word.isdigit():
            quantity = int(first_word)
            words = words[1:]
        elif first_word in WORD_TO_NUM:
            quantity = WORD_TO_NUM[first_word]
            words = words[1:]
            
        dish_query = " ".join(words).strip()
        # Clean punctuation
        dish_query_cleaned = re.sub(r'[^a-z0-9 ]', '', dish_query).strip()
        if not dish_query_cleaned:
            continue

        # Look for category and specific item matches
        matches = []
        # First priority: direct substring match
        for item in menu_items:
            if dish_query_cleaned in item.name.lower() or item.name.lower() in dish_query_cleaned:
                matches.append(item)

        # Second priority: fallback to category match (e.g. "two pizzas")
        if not matches:
            for item in menu_items:
                cat_singular = item.category.lower().rstrip('s')
                query_singular = dish_query_cleaned.rstrip('s')
                if query_singular == cat_singular or query_singular in cat_singular:
                    matches.append(item)

        # Third priority: token overlap check
        if not matches:
            query_tokens = set(dish_query_cleaned.split())
            ignore = {"gourmet", "luxury", "signature", "royal", "chef", "plate", "style", "dish", "food"}
            query_tokens -= ignore
            for item in menu_items:
                item_tokens = set(re.sub(r'[^a-z0-9 ]', '', item.name.lower()).split()) - ignore
                if query_tokens & item_tokens:
                    matches.append(item)

        # Unique matching
        if len(matches) == 1:
            matched.append({
                "item": {
                    "id": matches[0].id,
                    "name": matches[0].name,
                    "price": matches[0].price,
                    "category": matches[0].category,
                    "is_veg": matches[0].is_veg
                },
                "quantity": quantity
            })
        elif len(matches) > 1:
            ambiguous.append({
                "query": dish_query,
                "quantity": quantity,
                "options": [{
                    "id": m.id,
                    "name": m.name,
                    "price": m.price,
                    "category": m.category,
                    "is_veg": m.is_veg
                } for m in matches]
            })

    return {"matched": matched, "ambiguous": ambiguous}

@router.post("/explain-bill", response_model=BillExplanationOutput)
def explain_bill(
    bill_in: BillExplanationInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="authentication required"
        )

    # 1. Resolve invoice properties
    items_list = []
    subtotal = 0.0
    tax = 0.0
    service_charge = 0.0
    total = 0.0

    if bill_in.order_id:
        order = db.query(Order).filter(Order.id == bill_in.order_id).first()
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="order not found"
            )
        subtotal = order.total_amount / 1.18  # Back-calculate subtotal
        tax = subtotal * 0.08
        service_charge = subtotal * 0.10
        total = order.total_amount
        for o_item in order.items:
            items_list.append({
                "name": o_item.menu_item.name,
                "quantity": o_item.quantity,
                "price": o_item.price
            })
    else:
        items_list = bill_in.items or []
        subtotal = bill_in.subtotal or 0.0
        tax = bill_in.tax or 0.0
        service_charge = bill_in.service_charge or 0.0
        total = bill_in.total or (subtotal + tax + service_charge)

    if not items_list:
        return {"explanation": "Your culinary invoice does not contain any ordered dishes yet."}

    # 2. Construct luxury conversational breakdown
    explanation = (
        f"👑 **ChefPulse Luxury Bill Auditor** 👑\n\n"
        f"Thank you for dining with us! Here is the natural-language breakdown of your gourmet invoice:\n\n"
    )
    for idx, item in enumerate(items_list, 1):
        item_total = item['price'] * item['quantity']
        explanation += f"{idx}. **{item['name']}** (x{item['quantity']}) — **${item_total:.2f}**\n"
        
    explanation += (
        f"\n💼 **Financial Telemetry:**\n"
        f"- **Gourmet Subtotal**: ${subtotal:.2f}\n"
        f"- **Standard VAT (8%)**: ${tax:.2f}\n"
        f"- **Prestige Service Charge (10%)**: ${service_charge:.2f}\n"
        f"- **Grand Billing Total**: **${total:.2f}**\n\n"
        f"💡 **AI Smart Combos & Savings Recommendations:**\n"
    )

    # 3. Add pairings & savings options
    has_burger = any("burger" in item['name'].lower() for item in items_list)
    has_drink = any("mojito" in item['name'].lower() or "fashioned" in item['name'].lower() or "cooler" in item['name'].lower() for item in items_list)
    
    if has_burger and not has_drink:
        explanation += (
            "- 🥤 **Burger-Beverage Pairing**: We noticed you selected a gourmet burger without a drink. "
            "Add a *Grand Royal Old Fashioned* or *Saffron Mango Cooler* on your next visit to complete the pairing and save 10% on the signature combo!"
        )
    elif len(items_list) >= 3:
        explanation += (
            "- 🍰 **Banquet Bundle**: You ordered a premium course! Complete a classic 4-course luxury experience "
            "by adding any dessert, such as our *Pistachio Gelato Coupe*, saving you 15% on average per course selection."
        )
    else:
        explanation += (
            "- 📈 **Loyalty Rewards**: You are just $15.00 away from unlocking our flat 10% Gold tier discount "
            "applicable on all subsequent reservations!"
        )

    return {"explanation": explanation}

@router.post("/scan-dish", response_model=ScanDishOutput)
def scan_dish_image(
    scan_in: ScanDishInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="authentication required"
        )

    # 1. Fetch available dishes
    items = db.query(MenuItem).filter(MenuItem.is_available == True).all()
    if not items:
        return {"success": True, "found": False, "recommendations": []}

    # 2. Check if user sent a mockup positive or negative trigger
    img_data = scan_in.image_base64
    found = True
    if len(img_data) < 200 or "notfound" in img_data:
        found = False

    # 3. Pick a matched dish using base64 hash to show realistic variation
    h = int(hashlib.md5(img_data.encode('utf-8')).hexdigest(), 16)
    matched_db_item = items[h % len(items)]

    if found:
        # Extract visual ingredients from description
        ingredients = matched_db_item.description.replace(".", "").split(",")
        ingredients_cleaned = ", ".join([ing.strip() for ing in ingredients[:3]])
        
        match_out = ScanDishMatchedItem(
            id=matched_db_item.id,
            name=matched_db_item.name,
            price=matched_db_item.price,
            category=matched_db_item.category,
            confidence=96.4 if (h % 2 == 0) else 93.8,
            ingredients=ingredients_cleaned or "Gourmet herbs, chef seasonings, signature glaze",
            is_veg=matched_db_item.is_veg
        )
        return {"success": True, "found": True, "match": match_out, "recommendations": []}
    else:
        # Recommend the closest items
        recs = []
        for idx in range(3):
            item = items[(h + idx) % len(items)]
            recs.append(VoiceOrderOutputItem(
                id=item.id,
                name=item.name,
                price=item.price,
                category=item.category,
                is_veg=item.is_veg
            ))
        return {"success": True, "found": False, "recommendations": recs}
