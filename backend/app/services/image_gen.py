import os
import urllib.request
import urllib.parse
import re
import time

# Search phrase mapping for unique, premium-quality food queries
SEARCH_MAPPING = {
    "Truffle Burrata": "truffle burrata gourmet cheese salad",
    "Stuffed Portobello Mushrooms": "stuffed portobello mushrooms gourmet restaurant",
    "Charred Octopus": "charred octopus fine dining",
    "Wagyu Ribeye Steak": "A5 wagyu ribeye steak fine dining",
    "Pan-Seared Sea Bass": "pan seared sea bass restaurant",
    "Wild Mushroom Risotto": "wild mushroom risotto gourmet",
    "Margherita Luxury Pizza": "margherita pizza wood fired gourmet",
    "Truffle Prosciutto Pizza": "truffle prosciutto pizza restaurant",
    "ChefPulse Signature Burger": "gourmet beef burger restaurant",
    "Smoked BBQ Burger": "smoked bbq burger gourmet",
    "Smoked Jackfruit Burger": "smoked bbq burger gourmet",
    "Gold Leaf Chocolate Soufflé": "molten chocolate lava cake",
    "Pistachio Gelato Coupe": "pistachio gelato dessert",
    "Molten Chocolate Lava Cake": "molten chocolate lava cake",
    "Grand Royal Old Fashioned": "old fashioned cocktail luxury",
    "Signature Mojito": "classic mojito cocktail",
    "Saffron Mango Cooler": "classic mojito cocktail"
}

CATEGORY_FALLBACKS = {
    "Starters": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80",
    "Main Course": "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80",
    "Pizza": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80",
    "Burgers": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80",
    "Desserts": "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&auto=format&fit=crop&q=80",
    "Drinks": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&auto=format&fit=crop&q=80",
}
DEFAULT_FALLBACK = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80"

def get_royalty_free_urls(query: str) -> list:
    """Fetch potential royalty-free image hotlink URLs based on search query."""
    urls = []
    
    # 1. Search Unsplash
    search_query = f"site:unsplash.com food {query}"
    ddg_url = "https://html.duckduckgo.com/html/?q=" + urllib.parse.quote(search_query)
    try:
        req = urllib.request.Request(
            ddg_url,
            headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
        )
        with urllib.request.urlopen(req, timeout=6) as response:
            html = response.read().decode('utf-8')
            matches = re.findall(r'unsplash\.com/photos/([a-zA-Z0-9_-]+)', html)
            for photo_id in matches:
                urls.append(f"https://images.unsplash.com/photo-{photo_id}?w=800&auto=format&fit=crop&q=80")
    except Exception as e:
        print(f"[DOWNLOADER] Unsplash search failed for '{query}': {e}")

    # 2. Search Pexels as alternative
    search_query = f"site:pexels.com food {query}"
    ddg_url = "https://html.duckduckgo.com/html/?q=" + urllib.parse.quote(search_query)
    try:
        req = urllib.request.Request(
            ddg_url,
            headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
        )
        with urllib.request.urlopen(req, timeout=6) as response:
            html = response.read().decode('utf-8')
            matches = re.findall(r'pexels\.com/photos/([0-9]+)', html)
            for photo_id in matches:
                urls.append(f"https://images.pexels.com/photos/{photo_id}/pexels-photo-{photo_id}.jpeg?auto=compress&cs=tinysrgb&w=800")
    except Exception as e:
        print(f"[DOWNLOADER] Pexels search failed for '{query}': {e}")
        
    return urls

def generate_and_save_image(dish_name: str, item_id: int) -> str:
    """Download a unique royalty-free image for a dish name and save locally."""
    # Ensure static directory exists
    os.makedirs("app/static/dish_images", exist_ok=True)
    dest_path = f"app/static/dish_images/{item_id}.jpg"
    
    # Check mapping or fallback
    search_phrase = SEARCH_MAPPING.get(dish_name, f"{dish_name} gourmet food")
    candidates = get_royalty_free_urls(search_phrase)
    
    # Pick a candidate uniquely using item_id as offset to prevent duplicates
    if candidates:
        match_index = item_id % len(candidates)
        img_url = candidates[match_index]
    else:
        img_url = DEFAULT_FALLBACK

    # Download image with up to 3 retries
    for attempt in range(3):
        try:
            req = urllib.request.Request(
                img_url,
                headers={"User-Agent": "Mozilla/5.0"}
            )
            with urllib.request.urlopen(req, timeout=10) as response:
                image_bytes = response.read()
                if len(image_bytes) > 1000:
                    with open(dest_path, "wb") as f:
                        f.write(image_bytes)
                    print(f"[DOWNLOADER] Successfully downloaded image for {dish_name} to {dest_path}")
                    return f"/static/dish_images/{item_id}.jpg"
        except Exception as e:
            print(f"[DOWNLOADER WARNING] Attempt {attempt + 1} failed to download image for {dish_name}: {e}")
            time.sleep(1)
            
    # Fallback to category fallback if direct download fails
    try:
        fallback_url = DEFAULT_FALLBACK
        req = urllib.request.Request(
            fallback_url,
            headers={"User-Agent": "Mozilla/5.0"}
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            image_bytes = response.read()
            if len(image_bytes) > 1000:
                with open(dest_path, "wb") as f:
                    f.write(image_bytes)
                print(f"[DOWNLOADER] Saved default fallback image for {dish_name} to {dest_path}")
                return f"/static/dish_images/{item_id}.jpg"
    except Exception as e:
        print(f"[DOWNLOADER ERROR] Failed to save default placeholder image for {dish_name}: {e}")
        
    return ""
