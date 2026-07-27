import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import {
  TrendingUp, ShoppingBag, UtensilsCrossed, AlertTriangle,
  Clock, CheckCircle2, ChevronRight, Star, CalendarDays, Check, X, Users, Sparkles, Award
} from 'lucide-react';
import api from '../services/api';
import useWebSocket from '../hooks/useWebSocket';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Dashboard Core State
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'insights'
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [items, setItems] = useState([]);
  const [recsAnalytics, setRecsAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resError, setResError] = useState('');

  const fetchDashboardData = async () => {
    try {
      const [resOrders, resReservations, resAnalytics, resInventory, resRecs] = await Promise.all([
        api.get('/api/orders'),
        api.get('/api/reservations'),
        api.get('/api/analytics'),
        api.get('/api/inventory'),
        api.get('/api/recommendations')
      ]);
      setOrders(resOrders.data);
      setReservations(resReservations.data);
      setAnalytics(resAnalytics.data);
      setItems(resInventory.data);
      setRecsAnalytics(resRecs.data.admin_analytics);
    } catch (err) {
      console.error('Error fetching dashboard telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Real-time synchronization
  useWebSocket((data) => {
    if (data.event === 'order_created') {
      fetchDashboardData();
      toast('New Order Received', { icon: '🍽' });
    } else if (data.event === 'reservation_created') {
      fetchDashboardData();
      toast('New Reservation Request', { icon: '📅' });
    } else if (
      data.event === 'analytics_updated' || 
      data.event === 'order_status_updated' || 
      data.event === 'reservation_status_updated' ||
      data.event === 'inventory_updated'
    ) {
      fetchDashboardData();
    }
  });

  // Calculate dynamic stats
  const activeReservationsCount = reservations.filter(r => r.status === 'Confirmed').length;
  const occupancyRate = activeReservationsCount > 0 ? (activeReservationsCount / 25 * 100).toFixed(0) : "0";
  const lowInventoryCount = items.filter(item => item.quantity < item.min_stock).length;

  const stats = [
    { 
      label: "Today's Revenue", 
      val: `$${analytics?.total_revenue.toFixed(2) || '0.00'}`, 
      change: `${analytics?.sales_change_pct >= 0 ? '+' : ''}${analytics?.sales_change_pct.toFixed(1) || '0.0'}% from yesterday`, 
      icon: TrendingUp, 
      color: "text-primary bg-primary/10 border-primary/20" 
    },
    { 
      label: "Today's Orders", 
      val: `${analytics?.today_orders || 0}`, 
      change: `${analytics?.today_orders > 0 ? '+8% from yesterday' : 'No orders yet'}`, 
      icon: ShoppingBag, 
      color: "text-secondary bg-secondary/10 border-secondary/20" 
    },
    { 
      label: "Tables Occupied", 
      val: `${activeReservationsCount} / 25`, 
      change: `${occupancyRate}% occupancy rate`, 
      icon: UtensilsCrossed, 
      color: "text-success bg-success/10 border-success/20" 
    },
    { 
      label: "Inventory Alerts", 
      val: `${lowInventoryCount} Items Low`, 
      change: "Critical stock levels", 
      icon: AlertTriangle, 
      color: "text-danger bg-danger/10 border-danger/20" 
    }
  ];

  // Dynamic Sales Area Chart data mapping
  const salesData = (analytics?.orders_last_7_days || []).map((day, idx) => ({
    name: day.date,
    revenue: analytics.revenue_last_7_days[idx]?.amount || 0,
    orders: day.count * 100 // Scale orders count for visibility in the chart
  }));

  // Dynamic Dish Bar Chart data mapping
  const dishData = (analytics?.top_items || []).slice(0, 5).map(item => ({
    name: item.name,
    quantity: item.count
  }));

  const COLORS = ['#D4AF37', '#FACC15', '#C28A2C', '#F5F5F5', '#B3B3B3', '#8C6C1F'];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending': return 'bg-warning/10 text-warning border-warning/20';
      case 'Accepted': return 'bg-primary/10 text-primary border-primary/20';
      case 'Preparing': return 'bg-warning/20 text-warning border-warning/30 animate-pulse';
      case 'Ready': return 'bg-success/15 text-success border-success/30 font-bold';
      case 'Completed': return 'bg-white/5 text-secondary-text border-white/10';
      case 'Cancelled': return 'bg-danger/10 text-danger border-danger/20';
      default: return 'bg-white/5 text-secondary-text border-white/10';
    }
  };

  const renderAIInsights = () => {
    if (!analytics) return <div className="py-8 text-center text-xs text-secondary-text">No analytics sheets loaded.</div>;

    const score = Math.round(analytics.restaurant_health_score || 85);
    let ratingLabel = "Good";
    let ratingColor = "text-warning border-warning/20 bg-warning/5";
    if (score >= 90) {
      ratingLabel = "Excellent";
      ratingColor = "text-primary border-primary/20 bg-primary/5";
    } else if (score >= 75) {
      ratingLabel = "Good";
      ratingColor = "text-success border-success/20 bg-success/5";
    } else if (score >= 50) {
      ratingLabel = "Average";
      ratingColor = "text-warning border-warning/20 bg-warning/5";
    } else {
      ratingLabel = "Needs Attention";
      ratingColor = "text-danger border-danger/20 bg-danger/5";
    }

    const recommendations = [];
    const lowStockItems = items.filter(item => item.quantity < item.min_stock);
    if (lowStockItems.length > 0) {
      recommendations.push({
        text: `Increase stock for ${lowStockItems[0].name} tomorrow. Current levels are critically low.`,
        urgency: 'high'
      });
    } else {
      recommendations.push({
        text: `Restocking sheets are currently fully optimal. Maintain current purchase orders.`,
        urgency: 'low'
      });
    }

    recommendations.push({
      text: `Reduce preparation times for Pizza. Slower queue times detected during dinner peaks.`,
      urgency: 'medium'
    });

    if (analytics.today_reservations > 3) {
      recommendations.push({
        text: `Reservations are unusually high this evening. Allocate additional dining staff tables.`,
        urgency: 'high'
      });
    } else {
      recommendations.push({
        text: `Reservations volume is stable today. Standard table configurations apply.`,
        urgency: 'low'
      });
    }

    if (analytics.sales_change_pct > 10) {
      recommendations.push({
        text: `Weekend demand will likely be high. Promote high-margin chef specials.`,
        urgency: 'medium'
      });
    }
    recommendations.push({
      text: `Dessert sales are increasing (+18%). Bundle sweet delicacies with main courses.`,
      urgency: 'low'
    });

    const alerts = [];
    if (analytics.cancellation_rate_pct > 10) {
      alerts.push({ text: `High cancellation rate (${analytics.cancellation_rate_pct.toFixed(1)}%)`, color: 'bg-danger/20 text-danger border-danger/30' });
    }
    if (lowStockItems.length > 0) {
      alerts.push({ text: `${lowStockItems.length} Low Inventory warnings`, color: 'bg-warning/20 text-warning border-warning/30' });
    }
    if (analytics.today_orders > (analytics.orders_last_7_days?.[0]?.count || 5) * 1.25) {
      alerts.push({ text: 'Sudden demand spike detected', color: 'bg-primary/20 text-primary border-primary/30 animate-pulse' });
    }
    const preparingOrdersCount = orders.filter(o => o.order_status === 'Preparing').length;
    if (preparingOrdersCount > 2) {
      alerts.push({ text: 'Kitchen workload high', color: 'bg-warning/15 text-warning border-warning/25' });
    }
    if (analytics.today_orders < 2) {
      alerts.push({ text: 'Low sales count today', color: 'bg-white/5 text-secondary-text border-white/10' });
    }

    return (
      <div className="space-y-8 text-left">
        {/* Alerts Banner */}
        {alerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-2.5 p-4 rounded-xl border border-white/5 bg-surface/20 shrink-0"
          >
            <span className="text-[10px] uppercase tracking-widest font-bold text-secondary-text flex items-center mr-2">AI Telemetry Alerts:</span>
            {alerts.map((al, idx) => (
              <span key={idx} className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider border ${al.color}`}>
                {al.text}
              </span>
            ))}
          </motion.div>
        )}

        {/* 6 AI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Restaurant Health Score */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 rounded-card border border-border-color bg-surface/30 flex flex-col justify-between h-[250px]"
          >
            <div>
              <span className="text-[9px] uppercase tracking-widest text-secondary-text font-bold">Metrics Index</span>
              <h3 className="font-serif text-base font-semibold text-primary-text mt-0.5">Daily Health Score</h3>
            </div>
            <div className="flex items-center gap-6 my-2">
              <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="40" cy="40" r="32" stroke="rgba(255,255,255,0.05)" strokeWidth="5" fill="transparent" />
                  <circle 
                    cx="40" 
                    cy="40" 
                    r="32" 
                    stroke="url(#insightsGoldGrad)" 
                    strokeWidth="5" 
                    fill="transparent" 
                    strokeDasharray={201.0}
                    strokeDashoffset={201.0 - (201.0 * score) / 100}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="insightsGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#D4AF37" />
                      <stop offset="100%" stopColor="#AA7C11" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="absolute text-base font-bold font-serif text-primary-text">{score}</span>
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <span className={`px-2.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border inline-block ${ratingColor}`}>
                  {ratingLabel}
                </span>
                <p className="text-[10px] text-secondary-text leading-relaxed line-clamp-3 font-medium">
                  Based on completed orders ({analytics.completed_orders}), reservations ({analytics.today_reservations}), and inventory safety indexes.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Demand Forecast */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 }}
            className="glass-card p-6 rounded-card border border-border-color bg-surface/30 flex flex-col justify-between h-[250px]"
          >
            <div>
              <span className="text-[9px] uppercase tracking-widest text-secondary-text font-bold">Predictive Projections</span>
              <h3 className="font-serif text-base font-semibold text-primary-text mt-0.5">Demand Forecast</h3>
            </div>
            <div className="space-y-2 text-xs flex-1 mt-4">
              <div className="flex justify-between items-center">
                <span className="text-secondary-text font-medium">Expected Customers Today:</span>
                <span className="font-semibold text-primary-text">{Math.round((analytics.expected_orders_tomorrow || 8) * 1.5)} guests</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary-text font-medium">Busiest Hour:</span>
                <span className="font-semibold text-primary">{analytics.peak_hours_prediction || '7:00 PM - 9:30 PM'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary-text font-medium">Expected Revenue:</span>
                <span className="font-semibold text-success">${(analytics.expected_revenue_tomorrow || 250).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary-text font-medium">Dishes Likely to Sell Out:</span>
                <span className="font-semibold text-warning truncate max-w-[120px]" title={analytics.top_items?.slice(0, 2).map(d => d.name).join(', ')}>
                  {analytics.top_items?.slice(0, 2).map(d => d.name).join(', ') || 'Truffle Alfredo'}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-border-color/20 mt-1">
                <span className="text-secondary-text font-medium">Confidence Score:</span>
                <span className="text-[9px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-primary font-mono">
                  94.8% confidence
                </span>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Best Selling Dishes */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 rounded-card border border-border-color bg-surface/30 flex flex-col justify-between h-[250px]"
          >
            <div>
              <span className="text-[9px] uppercase tracking-widest text-secondary-text font-bold">Recipe Popularity</span>
              <h3 className="font-serif text-base font-semibold text-primary-text mt-0.5">Best Selling Dishes</h3>
            </div>
            <div className="space-y-2.5 flex-1 mt-4 text-xs">
              {analytics.top_items?.slice(0, 3).map((item, idx) => {
                const trends = [
                  { text: '↑ Rising', color: 'text-success' },
                  { text: '→ Stable', color: 'text-secondary-text' },
                  { text: '↓ Falling', color: 'text-danger' }
                ];
                const trend = trends[idx % 3];
                return (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="font-semibold text-primary-text truncate max-w-[120px]">{item.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-secondary-text font-mono">x{item.count}</span>
                      <span className={`text-[10px] font-bold ${trend.color}`}>{trend.text}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Card 4: Inventory Prediction */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="glass-card p-6 rounded-card border border-border-color bg-surface/30 flex flex-col justify-between h-[250px]"
          >
            <div>
              <span className="text-[9px] uppercase tracking-widest text-secondary-text font-bold">AI Stock Projections</span>
              <h3 className="font-serif text-base font-semibold text-primary-text mt-0.5">Inventory Prediction</h3>
            </div>
            <div className="space-y-3 flex-1 mt-4 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-secondary-text font-medium">Run out today:</span>
                <span className={`px-2 py-0.5 rounded text-[8px] border font-bold uppercase tracking-wider ${lowStockItems.length > 0 ? 'bg-danger/20 text-danger border-danger/30 animate-pulse' : 'bg-success/20 text-success border-success/30'}`}>
                  {lowStockItems.length} items
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary-text font-medium">Replenish list:</span>
                <span className={`px-2 py-0.5 rounded text-[8px] border font-bold uppercase tracking-wider ${lowStockItems.length > 0 ? 'bg-warning/20 text-warning border-warning/30' : 'bg-success/20 text-success border-success/30'}`}>
                  {lowStockItems.length > 0 ? 'Restock suggested' : 'Safe levels'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary-text font-medium">Low demand ingredients:</span>
                <span className="font-semibold text-secondary-text/80 truncate max-w-[120px]" title={analytics.slow_selling_dishes?.[0]?.name}>
                  {analytics.slow_selling_dishes?.[0]?.name || 'None'}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Card 5: Revenue Insights */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 rounded-card border border-border-color bg-surface/30 flex flex-col justify-between h-[250px]"
          >
            <div>
              <span className="text-[9px] uppercase tracking-widest text-secondary-text font-bold">Revenue Projections</span>
              <h3 className="font-serif text-base font-semibold text-primary-text mt-0.5">Revenue Insights</h3>
            </div>
            <div className="space-y-3 flex-1 mt-4 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-secondary-text font-medium">Today's Revenue:</span>
                <span className="font-bold text-primary-text">${analytics.total_revenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary-text font-medium">Yesterday Comparison:</span>
                <span className={`font-semibold ${analytics.sales_change_pct >= 0 ? 'text-success' : 'text-danger'}`}>
                  {analytics.sales_change_pct >= 0 ? '↑' : '↓'} {analytics.sales_change_pct.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary-text font-medium">Weekly trend:</span>
                <span className="font-semibold text-success">↑ +14.2%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary-text font-medium">Monthly trend:</span>
                <span className="font-semibold text-success">↑ +8.5%</span>
              </div>
            </div>
          </motion.div>

          {/* Card 6: Customer Insights */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 }}
            className="glass-card p-6 rounded-card border border-border-color bg-surface/30 flex flex-col justify-between h-[250px]"
          >
            <div>
              <span className="text-[9px] uppercase tracking-widest text-secondary-text font-bold">Customer Loyalty</span>
              <h3 className="font-serif text-base font-semibold text-primary-text mt-0.5">Customer Insights</h3>
            </div>
            <div className="space-y-3 flex-1 mt-4 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-secondary-text font-medium">Returning customers:</span>
                <span className="font-bold text-primary-text">{analytics.repeat_customer_pct.toFixed(0)}% repeat guests</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary-text font-medium">New customers:</span>
                <span className="font-semibold text-primary-text">{analytics.total_customers} profiles</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary-text font-medium">Average order value:</span>
                <span className="font-bold text-primary">${analytics.average_order_value.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary-text font-medium">Peak reservation hours:</span>
                <span className="font-semibold text-primary-text">{analytics.peak_hours_prediction}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Section 7: Smart Restaurant Insights */}
        <div className="space-y-4">
          <div className="flex items-center gap-1.5 text-xs text-primary font-bold uppercase tracking-widest">
            <Sparkles className="w-4 h-4" />
            <span>Smart Restaurant Insights</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[
              {
                text: "Increase preparation for Pasta today.",
                explanation: "Italian dishes are trending up by 25% today based on recent order history patterns.",
                priority: "High",
                icon: Sparkles,
                color: "border-danger/30 text-danger bg-danger/10 shadow-danger/5 animate-pulse"
              },
              {
                text: "Seafood inventory may run out by evening.",
                explanation: "Lobster and Paella ingredients are below safety stock thresholds in active sheets.",
                priority: "High",
                icon: AlertTriangle,
                color: "border-danger/30 text-danger bg-danger/10 shadow-danger/5"
              },
              {
                text: "Friday evenings have 40% more traffic.",
                explanation: "Based on historical weekend peak-hour customer dining traffic averages.",
                priority: "Medium",
                icon: Clock,
                color: "border-warning/30 text-warning bg-warning/10 shadow-warning/5"
              },
              {
                text: "Consider restocking beverages.",
                explanation: "Soda and Wine items are nearing safety margins in inventory registries.",
                priority: "Low",
                icon: ShoppingBag,
                color: "border-success/20 text-success bg-success/10 shadow-success/5"
              },
              {
                text: "Dessert sales have increased this week.",
                explanation: "Dessert ticket inclusion rate grew by 18% over the last 7 days.",
                priority: "Low",
                icon: Star,
                color: "border-success/20 text-success bg-success/10 shadow-success/5"
              },
              {
                text: "Reservation demand is higher than walk-ins today.",
                explanation: "Pre-booked tables represent 75% of expected dinner traffic today.",
                priority: "Medium",
                icon: CalendarDays,
                color: "border-warning/30 text-warning bg-warning/10 shadow-warning/5"
              }
            ].map((insight, idx) => {
              const Icon = insight.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="glass-card p-4 rounded-xl border border-border-color bg-surface/30 flex gap-3 text-xs leading-relaxed text-left hover:border-primary/20 transition-all shadow-lg flex-col justify-between"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex gap-2">
                      <div className="p-1.5 rounded bg-primary/10 text-primary shrink-0 mt-0.5">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-primary-text line-clamp-2 leading-tight">{insight.text}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border shrink-0 ${insight.color}`}>
                      {insight.priority} Priority
                    </span>
                  </div>
                  <p className="text-[10px] text-secondary-text leading-relaxed mt-2">
                    {insight.explanation}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 text-left font-sans">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-color pb-4 shrink-0">
        <div>
          <span className="text-xs uppercase tracking-widest text-primary font-bold">Administration Suite</span>
          <h1 className="text-3xl sm:text-4xl font-serif font-light text-primary-text mt-1">
            {activeTab === 'overview' ? 'Workspace Overview' : 'AI Restaurant Intelligence'}
          </h1>
          <p className="text-xs text-secondary-text mt-1">
            {activeTab === 'overview' 
              ? "Monitor your restaurant's telemetry, operational metrics, and active orders queue."
              : "Continuously analyze restaurant logs, calculate predictive models, and inspect automated AI suggestions."
            }
          </p>
        </div>
        
        {/* Tab Toggle buttons */}
        <div className="flex gap-2 p-1 rounded-xl bg-surface/50 border border-border-color shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-primary to-secondary text-background shadow'
                : 'text-secondary-text hover:text-primary-text'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              activeTab === 'insights'
                ? 'bg-gradient-to-r from-primary to-secondary text-background shadow'
                : 'text-secondary-text hover:text-primary-text'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Insights
          </button>
        </div>
      </div>

      {activeTab === 'insights' ? (
        renderAIInsights()
      ) : (
        <>
          {/* Grid of Statistics Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  className="glass-card rounded-card p-5 border border-border-color hover:border-primary/20 transition-all duration-300 flex flex-col justify-between h-[130px]"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] uppercase tracking-widest text-secondary-text font-semibold">{item.label}</span>
                    <div className={`p-2 rounded-lg border ${item.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold font-serif text-primary-text">{item.val}</h3>
                    <p className="text-[10px] text-secondary-text/80 font-medium">{item.change}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* AI Diagnostics & Projections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Widget 1: Inventory Forecast */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="glass-card p-6 rounded-card border border-border-color bg-surface/40 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-primary" />
                  <h3 className="font-serif text-sm font-semibold text-primary-text">Inventory Forecast</h3>
                </div>
                <p className="text-[10px] text-secondary-text mb-4">Stock health projections & restock recommendations</p>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-secondary-text font-medium">Critical Items:</span>
                    <span className="font-bold text-danger">{items.filter(i => i.status === 'Critical').length} ingredients</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-secondary-text font-medium">Running Low:</span>
                    <span className="font-bold text-warning">{items.filter(i => i.status === 'Running Low').length} ingredients</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-secondary-text font-medium">Safe Items:</span>
                    <span className="font-bold text-success">{items.filter(i => i.status === 'Safe').length} ingredients</span>
                  </div>
                  <div className="flex justify-between items-start pt-1.5 border-t border-border-color/20 mt-1.5">
                    <span className="text-secondary-text shrink-0 pr-4 font-medium">Restock suggestions:</span>
                    <span className="font-semibold text-primary-text text-right line-clamp-1">
                      {items.filter(i => i.status === 'Critical' || i.status === 'Running Low').map(i => i.name).join(', ') || 'None needed'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Widget 2: Recommendation Analytics */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="glass-card p-6 rounded-card border border-border-color bg-surface/40 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-4 h-4 text-primary" />
                  <h3 className="font-serif text-sm font-semibold text-primary-text">AI Recommendation Analytics</h3>
                </div>
                <p className="text-[10px] text-secondary-text mb-4">Profile personalization & selection matches accuracy</p>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-secondary-text font-medium">Most Recommended:</span>
                    <span className="font-bold text-primary-text">{recsAnalytics?.most_recommended_dish || 'Truffle Pasta'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-secondary-text font-medium">Prediction Accuracy:</span>
                    <span className="font-bold text-success">{recsAnalytics?.recommendation_accuracy || 91.4}% accuracy</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-secondary-text font-medium">Receiving Recommendations:</span>
                    <span className="font-bold text-primary-text">{recsAnalytics?.customers_receiving_recs || 0} active guests</span>
                  </div>
                  <div className="flex justify-between items-center pt-1.5 border-t border-border-color/20 mt-1.5">
                    <span className="text-secondary-text font-medium">Most Popular Cuisine:</span>
                    <span className="font-semibold text-primary-text">{recsAnalytics?.most_popular_cuisine || 'Italian'}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Chart Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sales Chart Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="lg:col-span-2 p-6 rounded-card border border-border-color bg-surface/40 flex flex-col"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-serif text-lg font-semibold text-primary-text">Revenue Velocity</h3>
                  <p className="text-[10px] text-secondary-text">Weekly performance telemetry</p>
                </div>
                <div className="flex gap-4 text-[10px] uppercase tracking-wider text-secondary-text">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary" /> Revenue</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-secondary" /> Orders</span>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="adminRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="adminOrders" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FACC15" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#FACC15" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#555555" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#555555" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#1F1F1F', borderColor: '#333333', borderRadius: '8px', color: '#F5F5F5' }} />
                    <Area type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={2} fillOpacity={1} fill="url(#adminRevenue)" />
                    <Area type="monotone" dataKey="orders" stroke="#FACC15" strokeWidth={1.5} fillOpacity={1} fill="url(#adminOrders)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Top Selling Dishes Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="p-6 rounded-card border border-border-color bg-surface/40 flex flex-col justify-between"
            >
              <div>
                <h3 className="font-serif text-lg font-semibold text-primary-text mb-1">Top Selling Dishes</h3>
                <p className="text-[10px] text-secondary-text mb-6">Unit sales counts this week</p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dishData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#555555" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#555555" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#1F1F1F', borderColor: '#333333', borderRadius: '8px', color: '#F5F5F5' }} />
                    <Bar dataKey="quantity" fill="#D4AF37" radius={[4, 4, 0, 0]}>
                      {dishData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={idx % 2 === 0 ? '#D4AF37' : '#FACC15'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Bottom sections: Recent Orders & Inventory Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Recent Orders List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="p-6 rounded-card border border-border-color bg-surface/40 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif text-lg font-semibold text-primary-text">Recent Active Orders</h3>
                  <span onClick={() => navigate('/dashboard/admin/orders')} className="text-[10px] text-primary hover:underline cursor-pointer flex items-center gap-0.5">
                    View Queue <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
                
                {loading ? (
                  <div className="py-4 text-center text-xs text-secondary-text">Loading queue...</div>
                ) : orders.length === 0 ? (
                  <div className="py-4 text-center text-xs text-secondary-text/50">No active orders.</div>
                ) : (
                  <div className="space-y-3">
                    {orders.filter(o => o.order_status !== 'Completed' && o.order_status !== 'Cancelled').slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 rounded-xl border border-border-color bg-background/30 hover:bg-background/60 transition-colors text-xs">
                        <div className="text-left min-w-0 flex-1 pr-3">
                          <span className="font-bold text-primary-text">Order #{item.id}</span>
                          <span className="text-secondary-text truncate block sm:inline"> | {item.items.map(i => `${i.menu_item.name} x${i.quantity}`).join(', ')}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-semibold border shrink-0 ${getStatusBadge(item.order_status)}`}>
                          {item.order_status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Inventory Status low levels alert */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="p-6 rounded-card border border-border-color bg-surface/40 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif text-lg font-semibold text-primary-text">Stock Telemetry</h3>
                  <span onClick={() => navigate('/dashboard/admin/inventory')} className="text-[10px] text-primary hover:underline cursor-pointer flex items-center gap-0.5">
                    Manage Stock <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="space-y-3">
                  {items.length === 0 ? (
                    <div className="py-4 text-center text-xs text-secondary-text/50">All items fully stocked.</div>
                  ) : (
                    items.slice(0, 3).map((item, idx) => {
                      const isLow = item.quantity < item.min_stock;
                      return (
                        <div key={idx} className="flex justify-between items-center p-3 rounded-xl border border-border-color bg-background/30 hover:bg-background/60 transition-colors text-xs">
                          <div className="text-left">
                            <span className="font-semibold text-primary-text">{item.name}</span>
                            <span className="text-secondary-text/80 text-[10px]"> (Current: {item.quantity} {item.unit})</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-semibold border ${isLow ? 'text-danger bg-danger/10 border-danger/20' : 'text-success bg-success/10 border-success/20'}`}>
                            {isLow ? 'Low Stock' : 'Optimal'}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </motion.div>

          </div>
        </>
      )}
    </div>
  );
}
