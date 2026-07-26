import React from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { ShoppingBag, CalendarDays, UtensilsCrossed, Clock, ChevronRight } from 'lucide-react';

export default function CustomerDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-8 text-left">
      {/* Page greeting */}
      <div>
        <span className="text-xs uppercase tracking-widest text-primary font-bold">Workspace Overview</span>
        <h1 className="text-3xl sm:text-5xl font-serif font-light text-primary-text mt-1">
          Welcome back, <span className="text-primary italic font-normal">{user?.full_name}</span>
        </h1>
        <p className="text-xs text-secondary-text mt-1">
          View your premium dining reservations, live order trackers, and chef recommendations
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Current Orders */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-card rounded-card p-6 border border-border-color flex flex-col justify-between"
        >
          <div className="flex items-center justify-between border-b border-border-color pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-semibold text-primary-text">Current Orders</h3>
                <p className="text-[10px] text-secondary-text">Real-time status tracking</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold border bg-primary/10 text-primary border-primary/20 animate-pulse">
              Prepping
            </span>
          </div>

          <div className="space-y-3 flex-1 mb-6">
            <div className="flex justify-between items-center text-xs">
              <span className="text-secondary-text">Order Number:</span>
              <span className="font-semibold text-primary-text">#4092</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-secondary-text">Item Placed:</span>
              <span className="font-semibold text-primary-text">Truffle Pasta x2, Ribeye Steak</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-secondary-text">Est. Delivery Time:</span>
              <span className="font-semibold text-primary">15 - 20 mins</span>
            </div>
          </div>

          <button className="w-full flex items-center justify-center gap-1 text-[10px] uppercase tracking-widest font-bold text-primary hover:underline mt-auto">
            View Live Tracker <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>

        {/* Card 2: Upcoming Reservation */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="glass-card rounded-card p-6 border border-border-color flex flex-col justify-between"
        >
          <div className="flex items-center justify-between border-b border-border-color pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-secondary/10 text-secondary border border-secondary/20">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-semibold text-primary-text">Upcoming Reservation</h3>
                <p className="text-[10px] text-secondary-text">Confirmed booking details</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold border bg-success/10 text-success border-success/20">
              Confirmed
            </span>
          </div>

          <div className="space-y-3 flex-1 mb-6">
            <div className="flex justify-between items-center text-xs">
              <span className="text-secondary-text">Date & Time:</span>
              <span className="font-semibold text-primary-text">Tonight, 8:30 PM</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-secondary-text">Table Assignment:</span>
              <span className="font-semibold text-primary-text">Table 4 (Window Seat)</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-secondary-text">Party Size:</span>
              <span className="font-semibold text-primary-text">2 Guests</span>
            </div>
          </div>

          <button className="w-full flex items-center justify-center gap-1 text-[10px] uppercase tracking-widest font-bold text-primary hover:underline mt-auto">
            Modify Reservation <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>

        {/* Card 3: Recommended Dishes */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="glass-card rounded-card p-6 border border-border-color flex flex-col justify-between"
        >
          <div className="flex items-center gap-3 border-b border-border-color pb-4 mb-4">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-semibold text-primary-text">Recommended Dishes</h3>
              <p className="text-[10px] text-secondary-text">Curated by our Chef for you</p>
            </div>
          </div>

          <div className="space-y-3 flex-1 mb-6">
            {[
              { name: 'Foie Gras Terrine', desc: 'Served with sweet fig compote & toasted brioche.', price: '$42' },
              { name: 'Pan-Seared Sea Bass', desc: 'Accented with saffron fennel and tomato coulis.', price: '$58' },
            ].map((dish, idx) => (
              <div key={idx} className="flex justify-between items-start gap-4 p-2 rounded-lg bg-background/30 border border-white/5 hover:border-primary/10 transition-colors">
                <div className="text-left">
                  <h4 className="text-xs font-bold text-primary-text">{dish.name}</h4>
                  <p className="text-[10px] text-secondary-text font-light leading-relaxed mt-0.5">{dish.desc}</p>
                </div>
                <span className="text-xs font-bold text-primary shrink-0">{dish.price}</span>
              </div>
            ))}
          </div>

          <button className="w-full flex items-center justify-center gap-1 text-[10px] uppercase tracking-widest font-bold text-primary hover:underline mt-auto">
            Explore Menu <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>

        {/* Card 4: Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="glass-card rounded-card p-6 border border-border-color flex flex-col justify-between"
        >
          <div className="flex items-center gap-3 border-b border-border-color pb-4 mb-4">
            <div className="p-2 rounded-xl bg-secondary/10 text-secondary border border-secondary/20">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-semibold text-primary-text">Recent Activity</h3>
              <p className="text-[10px] text-secondary-text">Past visits and transactions</p>
            </div>
          </div>

          <div className="space-y-3 flex-1 mb-6">
            {[
              { type: 'Dining Reservation', date: 'July 24, 2026', details: 'Spent $240 at Table 2' },
              { type: 'Special Request', date: 'July 18, 2026', details: 'Allergies updated in profile' },
            ].map((activity, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-background/30 border border-white/5 text-left text-xs space-y-0.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-primary-text">{activity.type}</span>
                  <span className="text-[9px] text-secondary-text">{activity.date}</span>
                </div>
                <p className="text-[10px] text-secondary-text font-light">{activity.details}</p>
              </div>
            ))}
          </div>

          <button className="w-full flex items-center justify-center gap-1 text-[10px] uppercase tracking-widest font-bold text-primary hover:underline mt-auto">
            View All History <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>

      </div>
    </div>
  );
}
