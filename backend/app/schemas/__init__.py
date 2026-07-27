from app.schemas.user import UserRegister, UserLogin, UserOut, Token, ProfileUpdate
from app.schemas.menu import MenuItemCreate, MenuItemUpdate, MenuItemOut
from app.schemas.order import OrderItemCreate, OrderCreate, OrderItemOut, OrderOut, OrderStatusUpdate
from app.schemas.assistant import ChatInput, ChatOutput
from app.schemas.reservation import ReservationCreate, ReservationStatusUpdate, ReservationOut
from app.schemas.analytics import AnalyticsItem, AnalyticsTimeSeriesOrder, AnalyticsTimeSeriesRevenue, AnalyticsOut
from app.schemas.inventory import InventoryItemCreate, InventoryItemUpdate, InventoryItemOut
from app.schemas.notification import NotificationOut
