import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, Clock, User, AlertCircle, RefreshCw, Check, X, ChefHat, CheckCircle2, Inbox 
} from 'lucide-react';
import api from '../services/api';
import useWebSocket from '../hooks/useWebSocket';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    try {
      const res = await api.get('/api/orders');
      setOrders(res.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to fetch orders from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Sync state dynamically on websocket broadcasts
  useWebSocket((data) => {
    if (data.event === 'order_created' || data.event === 'order_status_updated') {
      fetchOrders();
    }
  });

  const handleStatusChange = async (orderId, newStatus) => {
    setError('');
    try {
      await api.put(`/api/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid status transition.');
    }
  };

  const statusOptions = ['All', 'Pending', 'Accepted', 'Preparing', 'Ready', 'Completed', 'Cancelled'];

  const filteredOrders = filterStatus === 'All'
    ? orders
    : orders.filter(o => o.order_status === filterStatus);

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

  return (
    <div className="space-y-8 text-left relative h-full flex flex-col font-sans">
      {/* Header */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <span className="text-xs uppercase tracking-widest text-primary font-bold">Registry Console</span>
          <h1 className="text-3xl sm:text-5xl font-serif font-light text-primary-text mt-1">
            Order Management
          </h1>
          <p className="text-xs text-secondary-text mt-1">
            Review incoming dining tickets, specify preparation phases and finalize guest orders.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg border border-danger/20 bg-danger/10 text-danger text-xs text-center font-medium shrink-0 flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Status filter selection tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 shrink-0 border-b border-border-color">
        {statusOptions.map((opt) => (
          <button
            key={opt}
            onClick={() => setFilterStatus(opt)}
            className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-200 shrink-0 ${
              filterStatus === opt
                ? 'bg-gradient-to-r from-primary to-secondary text-background shadow-md border border-primary/20'
                : 'text-secondary-text hover:text-primary-text hover:bg-white/5'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      {/* Main content grid */}
      <div className="flex-1 min-h-0 overflow-y-auto max-h-[600px] pr-1 py-2">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center text-secondary-text/50 gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
            <span className="text-xs uppercase tracking-widest">Retrieving incoming tickets...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-secondary-text/30 gap-2 border border-dashed border-border-color rounded-card bg-surface/10">
            <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
            <span className="text-xs uppercase tracking-widest">No orders match state filter '{filterStatus}'</span>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-5 rounded-card border border-border-color bg-surface/30 hover:border-primary/20 transition-all flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 text-left"
              >
                {/* Details layout */}
                <div className="space-y-2.5 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm font-bold text-primary-text">Order #{order.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${getStatusBadge(order.order_status)}`}>
                      {order.order_status}
                    </span>
                    <span className="text-xs text-secondary-text flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-primary" />
                      Guest: <strong className="text-primary-text">{order.customer_name}</strong>
                    </span>
                    <span className="text-xs text-secondary-text flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-secondary-text/60" />
                      Placed: {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Items display */}
                  <div className="text-primary-text font-medium text-xs">
                    <strong className="text-secondary-text">Ordered Items: </strong>
                    {order.items.map(i => `${i.menu_item.name} x${i.quantity}`).join(', ')}
                  </div>

                  {order.special_instructions && (
                    <div className="text-xs text-primary font-light italic">
                      "Instructions: {order.special_instructions}"
                    </div>
                  )}
                </div>

                {/* Operations side */}
                <div className="flex flex-wrap items-center justify-between lg:justify-end gap-6 w-full lg:w-auto border-t lg:border-t-0 border-border-color/30 pt-3 lg:pt-0">
                  {/* Total Value */}
                  <div>
                    <div className="text-[9px] uppercase tracking-widest text-secondary-text text-left lg:text-right">Total Price</div>
                    <div className="text-lg font-bold text-primary text-left lg:text-right">${order.total_amount.toFixed(2)}</div>
                  </div>

                  {/* Operational status action buttons */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleStatusChange(order.id, 'Accepted')}
                      disabled={order.order_status === 'Completed' || order.order_status === 'Cancelled'}
                      className={`px-3 py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider border flex items-center gap-1 transition-all ${
                        order.order_status === 'Accepted'
                          ? 'bg-primary text-background border-primary/20'
                          : 'bg-background/40 text-success border-success/20 hover:bg-success/10 disabled:opacity-30'
                      }`}
                    >
                      <Check className="w-3 h-3" />
                      Accept
                    </button>

                    <button
                      onClick={() => handleStatusChange(order.id, 'Cancelled')}
                      disabled={order.order_status === 'Completed' || order.order_status === 'Cancelled'}
                      className={`px-3 py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider border flex items-center gap-1 transition-all ${
                        order.order_status === 'Cancelled'
                          ? 'bg-danger text-primary-text border-danger/20'
                          : 'bg-background/40 text-danger border-danger/20 hover:bg-danger/10 disabled:opacity-30'
                      }`}
                    >
                      <X className="w-3 h-3" />
                      Reject
                    </button>

                    <button
                      onClick={() => handleStatusChange(order.id, 'Preparing')}
                      disabled={order.order_status === 'Completed' || order.order_status === 'Cancelled'}
                      className={`px-3 py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider border flex items-center gap-1 transition-all ${
                        order.order_status === 'Preparing'
                          ? 'bg-warning text-background border-warning/20'
                          : 'bg-background/40 text-warning border-warning/20 hover:bg-warning/10 disabled:opacity-30'
                      }`}
                    >
                      <ChefHat className="w-3 h-3" />
                      Preparing
                    </button>

                    <button
                      onClick={() => handleStatusChange(order.id, 'Ready')}
                      disabled={order.order_status === 'Completed' || order.order_status === 'Cancelled'}
                      className={`px-3 py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider border flex items-center gap-1 transition-all ${
                        order.order_status === 'Ready'
                          ? 'bg-success text-background border-success/20'
                          : 'bg-background/40 text-success border-success/20 hover:bg-success/10 disabled:opacity-30'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      Ready
                    </button>

                    <button
                      onClick={() => handleStatusChange(order.id, 'Completed')}
                      disabled={order.order_status === 'Completed' || order.order_status === 'Cancelled'}
                      className={`px-3 py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider border flex items-center gap-1 transition-all ${
                        order.order_status === 'Completed'
                          ? 'bg-white/10 text-primary-text border-white/20'
                          : 'bg-background/40 text-secondary-text border-white/10 hover:bg-white/5 disabled:opacity-30'
                      }`}
                    >
                      <Inbox className="w-3 h-3" />
                      Completed
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
