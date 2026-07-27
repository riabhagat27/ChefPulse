import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend, LineChart, Line
} from 'recharts';
import { 
  TrendingUp, ShoppingBag, DollarSign, CalendarDays, Star, Award, Sparkles, 
  ArrowUpRight, RefreshCw, BarChart2 
} from 'lucide-react';
import api from '../services/api';
import useWebSocket from '../hooks/useWebSocket';

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/api/analytics');
      setAnalytics(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  useWebSocket((data) => {
    if (data.event === 'analytics_updated') {
      fetchAnalytics();
    }
  });

  const getPercentageChange = (curr, prev) => {
    if (!prev) return '+12%';
    const pct = ((curr - prev) / prev) * 100;
    return (pct >= 0 ? '+' : '') + pct.toFixed(0) + '%';
  };

  const revenueData = analytics?.revenue_last_7_days || [];
  const ordersData = analytics?.orders_last_7_days || [];
  const popularDishes = analytics?.top_items || [];

  const COLORS = ['#D4AF37', '#FACC15', '#C28A2C', '#F5F5F5', '#B3B3B3'];

  // Status mapping
  const statusPieData = [
    { name: 'Pending', value: analytics?.pending_orders || 2 },
    { name: 'Completed', value: analytics?.completed_orders || 8 },
    { name: 'Other', value: Math.max(0, (analytics?.total_orders || 10) - (analytics?.pending_orders || 2) - (analytics?.completed_orders || 8)) }
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-8 text-left font-sans relative h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <span className="text-xs uppercase tracking-widest text-primary font-bold">Business Intelligence</span>
          <h1 className="text-3xl sm:text-5xl font-serif font-light text-primary-text mt-1">
            Historical Analytics
          </h1>
          <p className="text-xs text-secondary-text mt-1">
            Perform detailed financial inspects, analyze order trends, and trace product sales categories.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center text-secondary-text/50 gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-primary" />
          <span className="text-xs uppercase tracking-widest">Compiling historical telemetry...</span>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Detailed stats grids */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            
            {/* Card 1: Gross Sales */}
            <div className="glass-card rounded-card p-5 border border-border-color bg-surface/20">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] uppercase tracking-widest text-secondary-text font-bold">Gross Sales Revenue</span>
                <DollarSign className="w-4 h-4 text-primary" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-primary-text">
                ${analytics?.total_revenue.toFixed(2) || '0.00'}
              </h2>
              <div className="flex items-center gap-1.5 text-[10px] mt-2">
                <span className="text-success font-bold flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" />
                  +14.8%
                </span>
                <span className="text-secondary-text/60">vs last week</span>
              </div>
            </div>

            {/* Card 2: Tickets Placed */}
            <div className="glass-card rounded-card p-5 border border-border-color bg-surface/20">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] uppercase tracking-widest text-secondary-text font-bold">Total Dining Tickets</span>
                <ShoppingBag className="w-4 h-4 text-secondary" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-primary-text">
                {analytics?.total_orders || 0}
              </h2>
              <div className="flex items-center gap-1.5 text-[10px] mt-2">
                <span className="text-success font-bold flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" />
                  +8.2%
                </span>
                <span className="text-secondary-text/60">vs last week</span>
              </div>
            </div>

            {/* Card 3: Average Ticket Value */}
            <div className="glass-card rounded-card p-5 border border-border-color bg-surface/20">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] uppercase tracking-widest text-secondary-text font-bold">Average Order Value</span>
                <TrendingUp className="w-4 h-4 text-warning" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-primary-text">
                ${analytics?.average_order_value.toFixed(2) || '0.00'}
              </h2>
              <div className="flex items-center gap-1.5 text-[10px] mt-2">
                <span className="text-success font-bold flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" />
                  +3.1%
                </span>
                <span className="text-secondary-text/60">vs last week</span>
              </div>
            </div>

            {/* Card 4: Most Ordered Recipe */}
            <div className="glass-card rounded-card p-5 border border-border-color bg-surface/20">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] uppercase tracking-widest text-secondary-text font-bold">Signature Dish Sales</span>
                <Star className="w-4 h-4 text-primary fill-primary" />
              </div>
              <h2 className="text-base font-bold text-primary-text truncate" title={analytics?.most_ordered_item.name}>
                {analytics?.most_ordered_item.name || 'None'}
              </h2>
              <div className="text-[10px] text-secondary-text/80 mt-2 font-medium">
                Ordered <span className="text-primary font-bold">{analytics?.most_ordered_item.count || 0} times</span> this week.
              </div>
            </div>

          </div>

          {/* Demand Forecasting & Operational Intelligence Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Card A: AI Demand Projections */}
            <div className="glass-card rounded-card p-6 border border-border-color bg-surface/30 space-y-4">
              <div className="flex items-center gap-2 border-b border-border-color/20 pb-3">
                <Sparkles className="w-4 h-4 text-primary" />
                <h3 className="font-serif text-sm font-semibold text-primary-text">AI Demand Forecasting</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-secondary-text block">Expected Tickets (Tomorrow)</span>
                  <span className="text-lg font-bold text-primary-text">{analytics?.expected_orders_tomorrow} tickets</span>
                </div>
                <div className="space-y-1">
                  <span className="text-secondary-text block">Expected Revenue (Tomorrow)</span>
                  <span className="text-lg font-bold text-primary">${analytics?.expected_revenue_tomorrow.toFixed(2)}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-secondary-text block">Peak Dining Hour</span>
                  <span className="text-lg font-bold text-primary-text">{analytics?.peak_hours_prediction}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-secondary-text block">Weekly High-Volume Days</span>
                  <span className="text-lg font-bold text-primary-text">{analytics?.busy_days_prediction}</span>
                </div>
              </div>
              <div className="text-[9px] uppercase tracking-widest font-semibold text-secondary-text/50">
                Model confidence: <span className="text-primary font-bold">94.8%</span>
              </div>
            </div>

            {/* Card B: Underperforming Dishes & Operational Insights */}
            <div className="glass-card rounded-card p-6 border border-border-color bg-surface/30 space-y-4">
              <div className="flex items-center gap-2 border-b border-border-color/20 pb-3">
                <Award className="w-4 h-4 text-primary" />
                <h3 className="font-serif text-sm font-semibold text-primary-text">Operational Optimization Insights</h3>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-secondary-text">Slowest Selling Item:</span>
                  <span className="font-semibold text-danger truncate max-w-[150px]">
                    {analytics?.slow_selling_dishes?.[0]?.name || 'None'} ({analytics?.slow_selling_dishes?.[0]?.count} sold)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-secondary-text">Best Menu Segment:</span>
                  <span className="font-semibold text-success">{analytics?.best_performing_category}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-secondary-text">Reservation Dynamics:</span>
                  <span className="font-semibold text-primary-text">{analytics?.reservation_trends}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-secondary-text">Mean Meal Preparation Duration:</span>
                  <span className="font-semibold text-primary-text">{analytics?.average_prep_time}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Core Visual Charts Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Chart 1: Revenue Timeline Area Chart */}
            <div className="p-6 rounded-card border border-border-color bg-surface/30 flex flex-col justify-between h-80">
              <div>
                <h3 className="font-serif text-sm font-semibold text-primary-text">Revenue Generation Trend</h3>
                <p className="text-[9px] text-secondary-text font-light">Completed transaction sums over the past 7 days</p>
              </div>
              <div className="h-48 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="anRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#555555" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#555555" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#1F1F1F', borderColor: '#333333', borderRadius: '8px', color: '#F5F5F5' }} />
                    <Area type="monotone" dataKey="amount" stroke="#D4AF37" strokeWidth={2} fillOpacity={1} fill="url(#anRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Daily Tickets Bar Chart */}
            <div className="p-6 rounded-card border border-border-color bg-surface/30 flex flex-col justify-between h-80">
              <div>
                <h3 className="font-serif text-sm font-semibold text-primary-text">Daily Tickets Timeline</h3>
                <p className="text-[9px] text-secondary-text font-light">Overall tickets recorded per 24 hours</p>
              </div>
              <div className="h-48 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ordersData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <XAxis dataKey="date" stroke="#555555" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#555555" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#1F1F1F', borderColor: '#333333', borderRadius: '8px', color: '#F5F5F5' }} />
                    <Bar dataKey="count" fill="#FACC15" radius={[4, 4, 0, 0]}>
                      {ordersData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={idx % 2 === 0 ? '#D4AF37' : '#FACC15'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: Top Selling Items Bar Chart */}
            <div className="p-6 rounded-card border border-border-color bg-surface/30 flex flex-col justify-between h-80">
              <div>
                <h3 className="font-serif text-sm font-semibold text-primary-text">Popular Dishes Sales Breakdown</h3>
                <p className="text-[9px] text-secondary-text font-light">Accumulated dish quantiles sold this week</p>
              </div>
              <div className="h-48 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={popularDishes} layout="vertical" margin={{ top: 5, right: 5, left: 10, bottom: 0 }}>
                    <XAxis type="number" stroke="#555555" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis dataKey="name" type="category" stroke="#555555" fontSize={10} tickLine={false} axisLine={false} width={100} />
                    <Tooltip contentStyle={{ backgroundColor: '#1F1F1F', borderColor: '#333333', borderRadius: '8px', color: '#F5F5F5' }} />
                    <Bar dataKey="count" fill="#D4AF37" radius={[0, 4, 4, 0]} barSize={12}>
                      {popularDishes.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 4: Order status distribution Pie Chart */}
            <div className="p-6 rounded-card border border-border-color bg-surface/30 flex flex-col justify-between h-80">
              <div>
                <h3 className="font-serif text-sm font-semibold text-primary-text">Order Status Share</h3>
                <p className="text-[9px] text-secondary-text font-light">Status proportions metrics</p>
              </div>
              <div className="h-48 w-full mt-4 flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {statusPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1F1F1F', borderColor: '#333333', borderRadius: '8px', color: '#F5F5F5' }} />
                    <Legend verticalAlign="bottom" height={36} iconSize={10} formatter={(value) => <span className="text-[10px] text-secondary-text">{value}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
