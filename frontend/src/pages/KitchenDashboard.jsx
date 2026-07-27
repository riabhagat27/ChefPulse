import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChefHat, AlertCircle, CheckCircle2, Inbox, ArrowRight } from 'lucide-react';
import api from '../services/api';
import useWebSocket from '../hooks/useWebSocket';

export default function KitchenDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/api/orders');
      setOrders(res.data);
    } catch (err) {
      console.error('Error fetching kitchen orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Listen to WebSocket broadcasts to update kitchen tickets instantly
  useWebSocket((data) => {
    if (data.event === 'order_created' || data.event === 'order_status_updated') {
      fetchOrders();
    }
  });

  const handleStatusTransition = async (orderId, newStatus) => {
    try {
      await api.put(`/api/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.detail || 'Invalid KDS status transition.');
    }
  };

  // Filter orders by column status groups
  // Pending orders include both 'Pending' and 'Accepted' for KDS visibility
  const pendingOrders = orders.filter(o => o.order_status === 'Pending' || o.order_status === 'Accepted');
  const preparingOrders = orders.filter(o => o.order_status === 'Preparing');
  const readyOrders = orders.filter(o => o.order_status === 'Ready');

  const columns = [
    { 
      name: 'Pending / Incoming', 
      icon: Inbox, 
      color: 'text-primary bg-primary/10 border-primary/20', 
      borderL: 'border-l-primary',
      orders: pendingOrders,
      action: { label: 'Start Prep', targetStatus: 'Preparing' }
    },
    { 
      name: 'Preparing', 
      icon: ChefHat, 
      color: 'text-warning bg-warning/10 border-warning/20', 
      borderL: 'border-l-warning',
      orders: preparingOrders,
      action: { label: 'Mark Ready', targetStatus: 'Ready' }
    },
    { 
      name: 'Ready', 
      icon: CheckCircle2, 
      color: 'text-success bg-success/10 border-success/20', 
      borderL: 'border-l-success',
      orders: readyOrders,
      action: null 
    }
  ];

  return (
    <div className="space-y-8 text-left h-full flex flex-col font-sans">
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
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary" /> {pendingOrders.length} Incoming</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-warning animate-pulse" /> {preparingOrders.length} Prepping</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-success" /> {readyOrders.length} Ready</span>
        </div>
      </div>

      {/* 3-column Board View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 overflow-x-auto pb-4">
        {columns.map((col, idx) => {
          const ColIcon = col.icon;

          return (
            <div key={idx} className="flex flex-col h-full min-w-[280px] space-y-4">
              
              {/* Column Title header */}
              <div className={`p-4 rounded-xl border flex items-center justify-between ${col.color}`}>
                <div className="flex items-center gap-2">
                  <ColIcon className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-widest font-bold">{col.name}</span>
                </div>
                <span className="text-xs bg-black/40 px-2 py-0.5 rounded font-mono font-bold">
                  {col.orders.length}
                </span>
              </div>

              {/* Column list items container */}
              <div className="flex-1 space-y-4 overflow-y-auto max-h-[600px] pr-1">
                {loading ? (
                  <div className="py-8 text-center text-xs text-secondary-text">Loading queue...</div>
                ) : col.orders.length === 0 ? (
                  <div className="h-32 rounded-xl border border-dashed border-border-color flex flex-col items-center justify-center text-secondary-text/30 text-xs gap-1.5">
                    <AlertCircle className="w-5 h-5 stroke-[1.5]" />
                    <span>No orders here</span>
                  </div>
                ) : (
                  col.orders.map((order, orderIdx) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: orderIdx * 0.05 }}
                      whileHover={{ y: -3 }}
                      className={`glass-card p-4 rounded-xl border border-border-color border-l-4 ${col.borderL} shadow-lg space-y-4 text-left cursor-pointer transition-all duration-200`}
                    >
                      <div className="flex justify-between items-center border-b border-border-color pb-2">
                        <div>
                          <span className="text-xs font-bold text-primary-text">Order #{order.id}</span>
                          <span className="text-[10px] text-secondary-text block font-medium">Cust: {order.customer_name}</span>
                        </div>
                        <span className="text-[9px] text-secondary-text/80 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-secondary-text/40" />
                          {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Display items list */}
                      <div className="space-y-1.5 text-xs text-primary-text font-medium">
                        {order.items.map((item, itemIdx) => (
                          <div key={itemIdx} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            {item.menu_item.name} <strong className="text-primary ml-1">x{item.quantity}</strong>
                          </div>
                        ))}
                      </div>

                      {/* Special instructions */}
                      {order.special_instructions && (
                        <div className="p-2 rounded bg-background/50 border border-white/5 text-[10px] text-primary font-light italic">
                          "Instructions: {order.special_instructions}"
                        </div>
                      )}

                      {/* Status transitions (revenue is excluded) */}
                      <div className="pt-2 flex justify-between items-center border-t border-border-color/30 text-[9px] uppercase tracking-widest font-semibold text-secondary-text">
                        <span>KDS Actions</span>
                        {col.action ? (
                          <button
                            onClick={() => handleStatusTransition(order.id, col.action.targetStatus)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded text-[9px] font-bold text-background bg-gradient-to-r from-primary to-secondary hover:brightness-110 shadow shadow-primary/10 transition-all border border-primary/20"
                          >
                            <span>{col.action.label}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[8px] border bg-success/5 text-success border-success/20 font-bold">
                            Ready to Pass
                          </span>
                        )}
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
