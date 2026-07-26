import React from 'react';
import { motion } from 'framer-motion';
import { Clock, ChefHat, AlertCircle, CheckCircle2, Inbox } from 'lucide-react';

const placeholderKdsOrders = [
  // Incoming Orders
  { id: '#4095', table: 'Table 7', items: ['Truffle Pasta x2', 'Seafood Paella x1'], time: '2m ago', state: 'Incoming', color: 'border-l-primary' },
  { id: '#4096', table: 'Table 12', items: ['Ribeye Steak x1', 'Caesar Salad x2'], time: 'Just Now', state: 'Incoming', color: 'border-l-primary' },
  
  // Preparing Orders
  { id: '#4092', table: 'Table 4', items: ['Foie Gras Terrine x1', 'Truffle Pasta x1'], time: '6m ago', state: 'Preparing', color: 'border-l-warning' },
  { id: '#4091', table: 'Table 2', items: ['Maine Lobster Tail x2'], time: '11m ago', state: 'Preparing', color: 'border-l-warning' },
  
  // Ready Orders
  { id: '#4089', table: 'Table 9', items: ['Caviar Platter x1', 'Ribeye Steak x2'], time: '15m ago', state: 'Ready', color: 'border-l-success' },
  
  // Completed Orders
  { id: '#4088', table: 'Table 15', items: ['Sea Bass Roast x1'], time: '22m ago', state: 'Completed', color: 'border-l-secondary-text' }
];

export default function KitchenDashboard() {
  const states = [
    { name: 'Incoming', icon: Inbox, color: 'text-primary bg-primary/10 border-primary/20' },
    { name: 'Preparing', icon: ChefHat, color: 'text-warning bg-warning/10 border-warning/20' },
    { name: 'Ready', icon: CheckCircle2, color: 'text-success bg-success/10 border-success/20' },
    { name: 'Completed', icon: Clock, color: 'text-secondary-text bg-white/5 border-white/10' }
  ];

  return (
    <div className="space-y-8 text-left h-full flex flex-col">
      {/* Header telemetry details */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <span className="text-xs uppercase tracking-widest text-primary font-bold">Kitchen Operations Console</span>
          <h1 className="text-3xl sm:text-5xl font-serif font-light text-primary-text mt-1">
            Kitchen Display System
          </h1>
          <p className="text-xs text-secondary-text mt-1">
            Live telemetry tracking of active food prep cycles and pass queues.
          </p>
        </div>
        
        {/* Simple mini KDS status indicators */}
        <div className="flex gap-4 text-xs font-semibold uppercase tracking-wider text-secondary-text">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary" /> 2 Incoming</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-warning animate-pulse" /> 2 Prepping</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-success" /> 1 Ready</span>
        </div>
      </div>

      {/* 4-column Board View */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 flex-1 overflow-x-auto pb-4">
        {states.map((col, idx) => {
          const ColIcon = col.icon;
          const filteredOrders = placeholderKdsOrders.filter(order => order.state === col.name);

          return (
            <div key={idx} className="flex flex-col h-full min-w-[250px] space-y-4">
              
              {/* Column Title header */}
              <div className={`p-4 rounded-xl border flex items-center justify-between ${col.color}`}>
                <div className="flex items-center gap-2">
                  <ColIcon className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-widest font-bold">{col.name}</span>
                </div>
                <span className="text-xs bg-black/40 px-2 py-0.5 rounded font-mono font-bold">
                  {filteredOrders.length}
                </span>
              </div>

              {/* Column list items container */}
              <div className="flex-1 space-y-4 overflow-y-auto max-h-[600px] pr-1">
                {filteredOrders.length === 0 ? (
                  <div className="h-32 rounded-xl border border-dashed border-border-color flex flex-col items-center justify-center text-secondary-text/30 text-xs gap-1.5">
                    <AlertCircle className="w-5 h-5 stroke-[1.5]" />
                    <span>No orders here</span>
                  </div>
                ) : (
                  filteredOrders.map((order, orderIdx) => (
                    <motion.div
                      key={orderIdx}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: orderIdx * 0.05 }}
                      whileHover={{ y: -3 }}
                      className={`glass-card p-4 rounded-xl border border-border-color border-l-4 ${order.color} shadow-lg space-y-4 text-left cursor-pointer transition-all duration-200`}
                    >
                      <div className="flex justify-between items-center border-b border-border-color pb-2">
                        <div>
                          <span className="text-xs font-bold text-primary-text">{order.id}</span>
                          <span className="text-[10px] text-secondary-text block font-medium">{order.table}</span>
                        </div>
                        <span className="text-[9px] text-secondary-text/80 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-secondary-text/40" />
                          {order.time}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs text-primary-text font-medium">
                        {order.items.map((food, foodIdx) => (
                          <div key={foodIdx} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            {food}
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 flex justify-between items-center border-t border-border-color/30 text-[9px] uppercase tracking-widest font-semibold text-secondary-text">
                        <span>Status Badge</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] border font-bold ${
                          order.state === 'Incoming' ? 'bg-primary/5 text-primary border-primary/20' :
                          order.state === 'Preparing' ? 'bg-warning/5 text-warning border-warning/20' :
                          order.state === 'Ready' ? 'bg-success/5 text-success border-success/20' :
                          'bg-white/5 text-secondary-text border-white/10'
                        }`}>
                          {order.state}
                        </span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
