import re
from sqlalchemy.orm import Session
from app.models.menu import MenuItem

def generate_reply(message: str, db: Session) -> str:
    msg = message.lower().strip()
    
    # 1. Fetch active menu items from database
    menu_items = db.query(MenuItem).filter(MenuItem.is_available == True).all()
    
    # 2. General FAQ Checks
    if any(k in msg for k in ["hour", "open", "time", "schedule"]):
        return (
            "ChefPulse fine dining operations run daily from **5:00 PM to 11:30 PM**. "
            "For reservations or custom events, please contact the dashboard front desk console."
        )
    if any(k in msg for k in ["location", "address", "where", "find"]):
        return (
            "ChefPulse Luxury Restaurant is situated at the prestigious **45 Rockefeller Plaza, New York, NY**.\n"
            "Valet parking is available for all reservations."
        )
    if any(k in msg for k in ["about", "concept", "who is the chef", "style"]):
        return (
            "ChefPulse is an elite restaurant platform marrying modern AI-driven guest concierge services "
            "with top-tier luxury culinary crafting. Every recipe is synchronized to order timelines."
        )

    # 3. Parameter Parsing (Dietary, Budget, Category)
    # Dietary classification
    is_veg_query = None
    if "non-veg" in msg or "non veg" in msg or "meat" in msg or "steak" in msg or "octopus" in msg:
        is_veg_query = False
    elif "veg" in msg or "vegetarian" in msg or "plant" in msg:
        is_veg_query = True
        
    # Budget classification
    budget_limit = None
    digits = re.findall(r'\d+', msg)
    if digits:
        val = int(digits[0])
        # INR conversion heuristic (e.g. ₹500 becomes $50 for matching)
        if "₹" in msg or "rs" in msg or "rupee" in msg or val >= 100:
            budget_limit = val / 10
        else:
            budget_limit = float(val)

    # Category classification
    target_category = None
    if "starter" in msg or "appetizer" in msg:
        target_category = "Starters"
    elif "main" in msg or "course" in msg:
        target_category = "Main Course"
    elif "pizza" in msg:
        target_category = "Pizza"
    elif "burger" in msg:
        target_category = "Burgers"
    elif "dessert" in msg or "sweet" in msg:
        target_category = "Desserts"
    elif "drink" in msg or "beverage" in msg or "wine" in msg or "cooler" in msg:
        target_category = "Drinks"

    # Chef specials check
    chef_special_requested = any(k in msg for k in ["special", "chef recommendation", "signature", "best"])
    
    # Add-on suggestions check
    add_on_requested = any(k in msg for k in ["add-on", "add on", "side", "accompaniment", "suggest"])

    # 4. Filters Filtering logic
    filtered = menu_items
    
    if is_veg_query is not None:
        filtered = [item for item in filtered if item.is_veg == is_veg_query]
        
    if target_category is not None:
        filtered = [item for item in filtered if item.category.lower() == target_category.lower()]
        
    if budget_limit is not None:
        filtered = [item for item in filtered if item.price <= budget_limit]

    # 5. Formulate Response
    # Heuristic: Chef Special
    if chef_special_requested:
        specials = [item for item in menu_items if item.name in ["Wagyu Ribeye Steak", "Gold Leaf Chocolate Soufflé"]]
        if not specials:
            specials = menu_items[:2]
        
        reply = "✨ **Today's Chef Specials:**\n\n"
        for item in specials:
            tag = "🟢 Veg" if item.is_veg else "🔴 Non-Veg"
            reply += f"- **{item.name}** ({tag}) — **${item.price:.2f}**\n  _{item.description}_ (Prep: {item.prep_time})\n\n"
        reply += "Would you like me to add one of these to your cart selection?"
        return reply

    # Heuristic: Add-ons
    if add_on_requested:
        drinks = [item for item in menu_items if item.category == "Drinks"]
        reply = "🍹 **Recommended Premium Accompaniments:**\n\n"
        for item in drinks[:2]:
            reply += f"- **{item.name}** — **${item.price:.2f}**\n  _{item.description}_\n\n"
        reply += "These coordinate beautifully as pairing selections!"
        return reply

    # If menu items list is parsed
    if filtered:
        # Title summary of search filters applied
        summary_parts = []
        if is_veg_query is True: summary_parts.append("Vegetarian")
        elif is_veg_query is False: summary_parts.append("Non-Vegetarian")
        if target_category: summary_parts.append(target_category)
        if budget_limit: summary_parts.append(f"under ${budget_limit:.2f}")
        
        filter_summary = " ".join(summary_parts) if summary_parts else "curated"
        
        reply = f"🤵 **ChefPulse recommendations for {filter_summary} dishes:**\n\n"
        # Return max 4 items for readability
        for item in filtered[:4]:
            tag = "🟢 Veg" if item.is_veg else "🔴 Non-Veg"
            reply += f"- **{item.name}** ({tag}) — **${item.price:.2f}**\n  _{item.description}_ (Prep: {item.prep_time})\n\n"
        
        reply += "You can order any of these selections directly from the Digital Menu."
        return reply
    else:
        # Fallback if no matching records
        return (
            "I could not locate items matching your exact specifications. "
            "Please view the **Digital Menu** section to inspect all available options, "
            "or ask for our *signature chef specials*!"
        )
