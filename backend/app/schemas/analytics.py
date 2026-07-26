from pydantic import BaseModel, Field
from typing import List

class AnalyticsItem(BaseModel):
    name: str
    count: int

class AnalyticsTimeSeriesOrder(BaseModel):
    date: str
    count: int

class AnalyticsTimeSeriesRevenue(BaseModel):
    date: str
    amount: float

class AnalyticsOut(BaseModel):
    total_orders: int
    pending_orders: int
    completed_orders: int
    today_orders: int
    today_reservations: int
    total_customers: int
    total_revenue: float
    average_order_value: float
    most_ordered_item: AnalyticsItem
    top_items: List[AnalyticsItem]
    orders_last_7_days: List[AnalyticsTimeSeriesOrder]
    revenue_last_7_days: List[AnalyticsTimeSeriesRevenue]
