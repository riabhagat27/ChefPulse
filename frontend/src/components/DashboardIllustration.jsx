import React from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, ShoppingBag, Clock, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';

const orderData = [
  { name: '08:00', orders: 12, revenue: 240 },
  { name: '10:00', orders: 18, revenue: 380 },
  { name: '12:00', orders: 45, revenue: 1100 },
  { name: '14:00', orders: 30, revenue: 750 },
  { name: '16:00', orders: 25, revenue: 600 },
  { name: '18:00', orders: 60, revenue: 1550 },
  { name: '20:00', orders: 85, revenue: 2100 },
  { name: '22:00', orders: 40, revenue: 950 },
];

export default function DashboardIllustration() {
  return (
    <div className="relative w-full max-w-5xl mx-auto rounded-card border border-border-color bg-surface/50 p-4 md:p-6 shadow-2xl backdrop-blur-md overflow-hidden">
      {/* Glow Effects - Gold accents */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-secondary/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Dashboard Top bar / Header Mock */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-border-color">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-danger/75" />
            <span className="w-3 h-3 rounded-full bg-warning/75" />
            <span className="w-3 h-3 rounded-full bg-success/75" />
          </div>
          <div className="h-4 w-[1px] bg-border-color hidden sm:block" />
          <div>
            <div className="text-xs text-secondary-text font-mono">WORKSPACE / CHEFPULSE</div>
            <div className="text-sm font-semibold text-primary-text flex items-center gap-2">
              Bistro_Center_NY
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary border border-primary/20">
                <span className="w-1 h-1 rounded-full bg-primary animate-pulse" /> Live
              </span>
            </div>
          </div>
        </div>

        {/* Action tabs mockup */}
        <div className="flex items-center gap-2 bg-background/60 p-1 rounded-lg border border-border-color text-xs text-secondary-text">
          <span className="px-2.5 py-1 rounded bg-surface text-primary border border-primary/20 cursor-pointer">Overview</span>
          <span className="px-2.5 py-1 hover:text-primary-text cursor-pointer transition-colors">Orders</span>
          <span className="px-2.5 py-1 hover:text-primary-text cursor-pointer transition-colors">Kitchen</span>
          <span className="px-2.5 py-1 hover:text-primary-text cursor-pointer transition-colors">AI Forecast</span>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Dashboard Stats & Chart Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Internal Mini Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: 'Active Orders', val: '24', change: '+12%', icon: ShoppingBag, color: 'text-primary' },
              { label: 'Kitchen Efficiency', val: '94.2%', change: '+1.5%', icon: Clock, color: 'text-success' },
              { label: 'Revenue Today', val: '$8,420', change: '+18.4%', icon: TrendingUp, color: 'text-secondary' },
            ].map((stat, i) => (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                key={i}
                className="p-4 rounded-xl border border-border-color bg-background/40 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-medium text-secondary-text uppercase tracking-wider">{stat.label}</span>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-primary-text">{stat.val}</span>
                  <span className="text-[10px] text-success font-medium">{stat.change}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Recharts Chart Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="p-5 rounded-xl border border-border-color bg-background/30"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-primary-text">Live Orders & Revenue Velocity</h3>
                <p className="text-xs text-secondary-text">Hourly order peaks with automated pipeline mapping</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-secondary-text">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary" /> Revenue
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-secondary" /> Orders
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={orderData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FACC15" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#FACC15" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="name" 
                    stroke="#555555" 
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#555555" 
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F1F1F', 
                      borderColor: '#333333',
                      borderRadius: '8px',
                      color: '#F5F5F5'
                    }} 
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                  <Area type="monotone" dataKey="orders" stroke="#FACC15" strokeWidth={1.5} fillOpacity={1} fill="url(#colorOrders)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Side Panel: Live Queue and Floating AI Insights */}
        <div className="space-y-6">
          {/* Active Orders List */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="p-5 rounded-xl border border-border-color bg-background/30 flex flex-col justify-between h-[48%]"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-primary-text uppercase tracking-wider">Live KDS Queue</span>
                <span className="text-xs text-primary font-medium hover:underline cursor-pointer flex items-center gap-0.5">
                  View KDS <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="space-y-3">
                {[
                  { id: '#4092', name: 'Truffle Pasta x2', status: 'Prepping', time: '4m ago', badge: 'bg-warning/10 text-warning border-warning/20' },
                  { id: '#4091', name: 'Ribeye Steak, Caesar Salad', status: 'Cooking', time: '8m ago', badge: 'bg-primary/10 text-primary border-primary/20' },
                  { id: '#4089', name: 'Seafood Paella x3', status: 'Completed', time: '14m ago', badge: 'bg-success/10 text-success border-success/20' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2.5 rounded-lg border border-border-color bg-surface/40 hover:bg-surface/60 transition-all duration-200">
                    <div>
                      <div className="text-xs font-bold text-primary-text flex items-center gap-1.5">
                        {item.id}
                        <span className="font-normal text-secondary-text">| {item.name}</span>
                      </div>
                      <span className="text-[10px] text-secondary-text">{item.time}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${item.badge}`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* AI Insights Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="p-5 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors relative overflow-hidden flex flex-col justify-between h-[48%] group"
          >
            {/* Sparkle background decoration */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-500" />
            
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1 rounded bg-primary/20 text-primary">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-primary tracking-wider uppercase">Pulse AI Insights</span>
              </div>
              <p className="text-xs text-primary-text leading-relaxed">
                "Ingredients waste reduced by <strong className="text-primary font-bold">14.8%</strong>. Seafood Paella ordering peaks predicted at 18:30 due to local concert. Preheating oven #3 automated."
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-primary/10 flex items-center justify-between text-[11px] text-secondary-text">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-success" /> Auto-optimizing
              </span>
              <span>Updated Just Now</span>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
