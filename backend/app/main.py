from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base, SessionLocal
from app.models import User, MenuItem, Order, OrderItem, Reservation, InventoryItem, Notification
from app.services.auth import get_password_hash
from app.routers.auth import router as auth_router
from app.routers.menu import router as menu_router
from app.routers.order import router as order_router
from app.routers.assistant import router as assistant_router
from app.routers.reservation import router as reservation_router
from app.routers.analytics import router as analytics_router
from app.routers.inventory import router as inventory_router
from app.routers.customers import router as customers_router
from app.routers.notification import router as notification_router
from app.routers.recommendations import router as recommendations_router
from app.services.websocket import manager
from fastapi.middleware.cors import CORSMiddleware

# Initialize SQLite database schema
Base.metadata.create_all(bind=engine)

# Seed database with gourmet menu items if empty on startup
def seed_database():
    db = SessionLocal()
    try:
        if db.query(MenuItem).count() == 0:
            seed_items = [
                # Starters
                MenuItem(
                    name="Truffle Burrata",
                    description="Creamy burrata cheese, heirloom cherry tomatoes, shaved Italian black truffles, aged balsamic glaze.",
                    price=24.0,
                    category="Starters",
                    is_available=True,
                    image_url="",
                    is_veg=True,
                    prep_time="10 mins"
                ),
                MenuItem(
                    name="Stuffed Portobello Mushrooms",
                    description="Grilled Portobello caps stuffed with cream cheese, fresh herbs, spinach, and a crispy parmesan crust.",
                    price=18.0,
                    category="Starters",
                    is_available=True,
                    image_url="",
                    is_veg=True,
                    prep_time="12 mins"
                ),
                MenuItem(
                    name="Charred Octopus",
                    description="Tender Spanish octopus, smoked paprika oil, fingerling potatoes, saffron aioli.",
                    price=28.0,
                    category="Starters",
                    is_available=True,
                    image_url="",
                    is_veg=False,
                    prep_time="15 mins"
                ),
                # Main Course
                MenuItem(
                    name="Wagyu Ribeye Steak",
                    description="A5 Japanese Wagyu ribeye, truffle-infused potato puree, charred baby asparagus, red wine reduction.",
                    price=95.0,
                    category="Main Course",
                    is_available=True,
                    image_url="",
                    is_veg=False,
                    prep_time="25 mins"
                ),
                MenuItem(
                    name="Pan-Seared Sea Bass",
                    description="Crisp-skinned Atlantic sea bass, slow-roasted saffron fennel, heirloom tomato coulis.",
                    price=48.0,
                    category="Main Course",
                    is_available=True,
                    image_url="",
                    is_veg=False,
                    prep_time="20 mins"
                ),
                MenuItem(
                    name="Wild Mushroom Risotto",
                    description="Creamy Carnaroli rice, forest wild mushrooms, black truffle paste, freshly grated parmigiano-reggiano.",
                    price=38.0,
                    category="Main Course",
                    is_available=True,
                    image_url="",
                    is_veg=True,
                    prep_time="22 mins"
                ),
                # Pizza
                MenuItem(
                    name="Margherita Luxury Pizza",
                    description="San Marzano tomato base, fresh buffalo mozzarella, organic sweet basil leaves, drizzle of extra virgin olive oil.",
                    price=26.0,
                    category="Pizza",
                    is_available=True,
                    image_url="",
                    is_veg=True,
                    prep_time="15 mins"
                ),
                MenuItem(
                    name="Truffle Prosciutto Pizza",
                    description="White sauce base, fresh mozzarella, thinly sliced Prosciutto di Parma, wild rocket, shaved white truffles.",
                    price=34.0,
                    category="Pizza",
                    is_available=True,
                    image_url="",
                    is_veg=False,
                    prep_time="18 mins"
                ),
                # Burgers
                MenuItem(
                    name="ChefPulse Signature Burger",
                    description="Dry-aged Wagyu beef patty, melted gruyère cheese, caramelized onions, truffle mayonnaise on a toasted brioche bun.",
                    price=32.0,
                    category="Burgers",
                    is_available=True,
                    image_url="",
                    is_veg=False,
                    prep_time="15 mins"
                ),
                MenuItem(
                    name="Smoked Jackfruit Burger",
                    description="Hickory smoked pulled jackfruit, sweet BBQ glaze, crisp red cabbage slaw on a toasted vegan bun.",
                    price=28.0,
                    category="Burgers",
                    is_available=True,
                    image_url="",
                    is_veg=True,
                    prep_time="15 mins"
                ),
                # Desserts
                MenuItem(
                    name="Gold Leaf Chocolate Soufflé",
                    description="Molten dark chocolate soufflé topped with edible 24k gold leaf, Tahitian vanilla bean gelato.",
                    price=25.0,
                    category="Desserts",
                    is_available=True,
                    image_url="",
                    is_veg=True,
                    prep_time="20 mins"
                ),
                MenuItem(
                    name="Pistachio Gelato Coupe",
                    description="House-churned Sicilian pistachio gelato, roasted pistachio dust, crispy wafer cookie curl.",
                    price=16.0,
                    category="Desserts",
                    is_available=True,
                    image_url="",
                    is_veg=True,
                    prep_time="8 mins"
                ),
                # Drinks
                MenuItem(
                    name="Grand Royal Old Fashioned",
                    description="Premium bourbon whiskey, organic aromatic bitters, orange peel twist, large slow-melting ice sphere.",
                    price=22.0,
                    category="Drinks",
                    is_available=True,
                    image_url="",
                    is_veg=True,
                    prep_time="5 mins"
                ),
                MenuItem(
                    name="Saffron Mango Cooler",
                    description="Fresh mango nectar, organic saffron strands, cardamoms, sparkling soda water, fresh mint leaves.",
                    price=14.0,
                    category="Drinks",
                    is_available=True,
                    image_url="",
                    is_veg=True,
                    prep_time="6 mins"
                )
            ]
            db.add_all(seed_items)
            db.commit()
            
        if db.query(InventoryItem).count() == 0:
            seed_inventory = [
                InventoryItem(name="White Truffle", quantity=0.5, unit="kg", min_stock=2.0, category="Luxury Oils & Spices"),
                InventoryItem(name="A5 Wagyu Beef", quantity=15.0, unit="kg", min_stock=5.0, category="Meats"),
                InventoryItem(name="Beluga Caviar", quantity=1.2, unit="kg", min_stock=2.5, category="Luxury Oils & Spices"),
                InventoryItem(name="24k Edible Gold Leaf", quantity=50.0, unit="sheets", min_stock=10.0, category="Garnishes"),
                InventoryItem(name="Buffalo Mozzarella", quantity=8.0, unit="kg", min_stock=3.0, category="Dairy"),
                InventoryItem(name="Fresh Mangoes", quantity=25.0, unit="units", min_stock=10.0, category="Produce")
            ]
            db.add_all(seed_inventory)
            db.commit()
                    # ------------------------------------------------------------------
        # Seed demo accounts (only if they don't already exist)
        # ------------------------------------------------------------------

        admin = db.query(User).filter(User.email == "admin@chefpulse.com").first()
        if not admin:
            admin = User(
                full_name="Demo Admin",
                email="admin@chefpulse.com",
                hashed_password=get_password_hash("Admin@123"),
                role="admin",
                restaurant_name="ChefPulse Demo"
            )
            db.add(admin)

        customer = db.query(User).filter(User.email == "customer@chefpulse.com").first()
        if not customer:
            customer = User(
                full_name="Demo Customer",
                email="customer@chefpulse.com",
                hashed_password=get_password_hash("Customer@123"),
                role="customer",
                restaurant_name=None
            )
            db.add(customer)

        db.commit()
    except Exception as e:
        print(f"Error seeding database: {e}")
    finally:
        db.close()

seed_database()

app = FastAPI(
    title="ChefPulse API",
    description="Backend API for ChefPulse Restaurant Operations Platform",
    version="1.0.0"
)

# CORS configuration
origins = [
    "http://localhost:5173",  # Default Vite development port
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://chef-pulse.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
from fastapi.staticfiles import StaticFiles
import os

# Ensure static directories exist
os.makedirs("app/static/dish_images", exist_ok=True)
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# Register routes
app.include_router(auth_router)
app.include_router(menu_router)
app.include_router(order_router)
app.include_router(assistant_router)
app.include_router(reservation_router)
app.include_router(analytics_router)
app.include_router(inventory_router)
app.include_router(customers_router)
app.include_router(notification_router)
app.include_router(recommendations_router)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass
    except Exception:
        pass
    finally:
        manager.disconnect(websocket)

@app.get("/")
def read_root():
    return {"message": "ChefPulse API Running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
