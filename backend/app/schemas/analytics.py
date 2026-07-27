from pydantic import BaseModel
from typing import List, Dict

class AnalyticsItem(BaseModel):
    name: str
    count: int

class AnalyticsTimeSeriesOrder(BaseModel):
    date: str
    count: int

class AnalyticsTimeSeriesRevenue(BaseModel):
    date: str
    amount: float

class TrafficSegment(BaseModel):
    count: int
    confidence: int

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

    # Demand Forecasting
    expected_orders_tomorrow: int
    expected_revenue_tomorrow: float
    peak_hours_prediction: str
    busy_days_prediction: str
    most_likely_best_selling_dishes: List[AnalyticsItem]

    # Operational Insights
    sales_change_pct: float
    slow_selling_dishes: List[AnalyticsItem]
    best_performing_category: str
    reservation_trends: str
    average_prep_time: str
    repeat_customer_pct: float
    inventory_health_score: float
    restaurant_health_score: float

    # AI Intelligence Panel Extensions
    cancellation_rate_pct: float
    traffic_forecast: Dict[str, TrafficSegment]
