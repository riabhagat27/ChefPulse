import sys
import os
import urllib.request
import urllib.parse
import re
from pathlib import Path

# Add backend directory to python path
backend_path = Path(__file__).resolve().parent / "backend"
sys.path.append(str(backend_path))

# Change working directory to backend folder so SQLite database resolves correctly
os.chdir(str(backend_path))

from app.database import SessionLocal
from app.models.menu import MenuItem

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

# Fallbacks for premium Unsplash food images
CATEGORY_FALLBACKS = {
    "Starters": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80",
    "Main Course": "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80",
    "Pizza": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80",
    "Burgers": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80",
    "Desserts": "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&auto=format&fit=crop&q=80",
    "Drinks": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&auto=format&fit=crop&q=80",
}
DEFAULT_FALLBACK = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80"

def get_royalty_free_url(query: str, category: str, used_urls: set) -> str:
    # 1. Try DuckDuckGo image search to get Unsplash direct hotlinks
    search_query = f"site:unsplash.com food {query}"
    url = "https://html.duckduckgo.com/html/?q=" + urllib.parse.quote(search_query)
    try:
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
        )
        with urllib.request.urlopen(req, timeout=8) as response:
            html = response.read().decode('utf-8')
            matches = re.findall(r'unsplash\.com/photos/([a-zA-Z0-9_-]+)', html)
            for photo_id in matches:
                candidate = f"https://images.unsplash.com/photo-{photo_id}?w=800&auto=format&fit=crop&q=80"
                if candidate not in used_urls:
                    used_urls.add(candidate)
                    return candidate
    except Exception as e:
        print(f"  Unsplash search failed: {e}")
        
    # 2. Try DuckDuckGo standard search for Pexels as alternative
    search_query = f"site:pexels.com food {query}"
    url = "https://html.duckduckgo.com/html/?q=" + urllib.parse.quote(search_query)
    try:
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
        )
        with urllib.request.urlopen(req, timeout=8) as response:
            html = response.read().decode('utf-8')
            matches = re.findall(r'pexels\.com/photos/([0-9]+)', html)
            for photo_id in matches:
                candidate = f"https://images.pexels.com/photos/{photo_id}/pexels-photo-{photo_id}.jpeg?auto=compress&cs=tinysrgb&w=800"
                if candidate not in used_urls:
                    used_urls.add(candidate)
                    return candidate
    except Exception as e:
        print(f"  Pexels search failed: {e}")

    # 3. Fallback to premium category image
    fallback_candidate = CATEGORY_FALLBACKS.get(category, DEFAULT_FALLBACK)
    return fallback_candidate

def main():
    db = SessionLocal()
    try:
        images_dir = Path("app/static/dish_images")
        images_dir.mkdir(parents=True, exist_ok=True)
        
        items = db.query(MenuItem).all()
        print(f"Found {len(items)} items in the database catalog.")
        
        # Track used URLs to ensure we never reuse images
        used_urls = set()
        
        for item in items:
            dest_file = images_dir / f"{item.id}.jpg"
            
            # Skip downloading if the local image file already exists on disk
            if dest_file.exists():
                print(f"Downloading image for {item.name}...\nSaved as {item.id}.jpg (Skipped - already exists)")
                expected_url = f"/static/dish_images/{item.id}.jpg"
                if item.image_url != expected_url:
                    item.image_url = expected_url
                    db.commit()
                continue
                
            # Use search phrase mapping based on dish name
            search_phrase = SEARCH_MAPPING.get(item.name, f"{item.name} gourmet food")
            
            print(f"Downloading image for {item.name}...")
            img_url = get_royalty_free_url(search_phrase, item.category, used_urls)
            
            try:
                req = urllib.request.Request(
                    img_url,
                    headers={"User-Agent": "Mozilla/5.0"}
                )
                with urllib.request.urlopen(req, timeout=12) as response:
                    img_data = response.read()
                    if len(img_data) > 1000:
                        with open(dest_file, "wb") as f:
                            f.write(img_data)
                        item.image_url = f"/static/dish_images/{item.id}.jpg"
                        db.commit()
                        print(f"Saved as {item.id}.jpg\n")
                    else:
                        print(f"Failed: Downloaded image too small.\n")
            except Exception as e:
                print(f"Failed to download from {img_url}: {e}\n")
                
    finally:
        db.close()

if __name__ == "__main__":
    main()
