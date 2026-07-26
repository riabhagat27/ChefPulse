import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { 
  TrendingUp, ShoppingBag, UtensilsCrossed, AlertTriangle, 
  Clock, CheckCircle2, ChevronRight, Sparkles 
} from 'lucide-react';

const salesData = [
  { name: 'Mon', revenue: 4200, orders: 32 },
  { name: 'Tue', revenue: 3800, orders: 28 },
  { name: 'Wed', revenue: 5400, orders: 45 },
  { name: 'Thu', revenue: 6200, orders: 49 },
  { name: 'Fri', revenue: 8900, orders: 74 },
  { name: 'Sat', revenue: 12400, orders: 110 },
  { name: 'Sun', revenue: 9500, orders: 85 },
];

const dishData = [
  { name: 'Truffle Pasta', quantity: 145 },
  { name: 'Seafood Paella', quantity: 112 },
  { name: 'Ribeye Steak', quantity: 98 },
  { name: 'Caviar Platter', quantity: 64 },
  { name: 'Foie Gras', quantity: 54 },
];

export default function AdminDashboard() {
  const { user } = useAuth();

  // Statistics items array
  const stats = [
    { label: "Today's Revenue", val: "$9,420", change: "+14.2% from yesterday", icon: TrendingUp, color: "text-primary bg-primary/10 border-primary/20" },
    { label: "Today's Orders", val: "85", change: "+8% from yesterday", icon: ShoppingBag, color: "text-secondary bg-secondary/10 border-secondary/20" },
    { label: "Tables Occupied", val: "18 / 25", change: "72% occupancy rate", icon: UtensilsCrossed, color: "text-success bg-success/10 border-success/20" },
    { label: "Inventory Alerts", val: "4 Items Low", change: "Critical stock levels", icon: AlertTriangle, color: "text-danger bg-danger/10 border-danger/20" }
  ];

  return (
    <div className="space-y-8 text-left">
      {/* Header Info */}
      <div>
        <span className="text-xs uppercase tracking-widest text-primary font-bold">Administration Suite</span>
        <h1 className="text-3xl sm:text-5xl font-serif font-light text-primary-text mt-1">
          Workspace Overview
        </h1>
        <p className="text-xs text-secondary-text mt-1">
          Monitor your restaurant's telemetry, operational metrics, and stock alerts.
        </p>
      </div>

      {/* Grid of Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="glass-card rounded-card p-5 border border-border-color hover:border-primary/20 transition-all duration-300"
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
        
        {/* Recent Orders List placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="p-6 rounded-card border border-border-color bg-surface/40 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg font-semibold text-primary-text">Recent Active Orders</h3>
              <span className="text-[10px] text-primary hover:underline cursor-pointer flex items-center gap-0.5">
                View Queue <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="space-y-3">
              {[
                { id: '#4092', name: 'Truffle Pasta x2, Wine bottle', status: 'Prepping', color: 'bg-warning/10 text-warning border-warning/20' },
                { id: '#4091', name: 'Ribeye Steak, Caesar Salad', status: 'Cooking', color: 'bg-primary/10 text-primary border-primary/20' },
                { id: '#4089', name: 'Seafood Paella x3', status: 'Ready', color: 'bg-success/10 text-success border-success/20' },
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 rounded-xl border border-border-color bg-background/30 hover:bg-background/60 transition-colors text-xs">
                  <div>
                    <span className="font-bold text-primary-text">{item.id}</span>
                    <span className="text-secondary-text"> | {item.name}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-semibold border ${item.color}`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
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
              <span className="text-[10px] text-primary hover:underline cursor-pointer flex items-center gap-0.5">
                Manage Stock <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="space-y-3">
              {[
                { name: 'White Truffle Oil', level: '1.2 liters', status: 'Critical', color: 'text-danger bg-danger/10 border-danger/20' },
                { name: 'Ribeye Prime Cut', level: '4 kg left', status: 'Low Stock', color: 'text-warning bg-warning/10 border-warning/20' },
                { name: 'Maine Lobster tails', level: '8 units left', status: 'Low Stock', color: 'text-warning bg-warning/10 border-warning/20' },
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 rounded-xl border border-border-color bg-background/30 hover:bg-background/60 transition-colors text-xs">
                  <div>
                    <span className="font-semibold text-primary-text">{item.name}</span>
                    <span className="text-secondary-text/80 text-[10px]"> (Current: {item.level})</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-semibold border ${item.color}`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
