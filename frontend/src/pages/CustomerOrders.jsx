import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Clock, RefreshCw, AlertCircle, ShoppingCart, Check, ChevronDown, ChevronUp, Sparkles, X } from 'lucide-react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useWebSocket from '../hooks/useWebSocket';

export default function CustomerOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedOrders, setExpandedOrders] = useState({});

  // AI bill explanation modal state
  const [billExplanation, setBillExplanation] = useState(null);
  const [loadingBillId, setLoadingBillId] = useState(null);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/api/orders');
      setOrders(res.data);
    } catch (err) {
      console.error('Error fetching guest orders:', err);
      setError('Could not retrieve orders telemetry database records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useWebSocket((data) => {
    if (
      (data.event === 'order_status_updated' && data.customer_id === user?.id) ||
      data.event === 'order_created'
    ) {
      fetchOrders();
    }
  });

  const toggleExpand = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const getStatusIndex = (status) => {
    switch (status) {
      case 'Pending': return 0;
      case 'Accepted': return 1;
      case 'Preparing': return 2;
      case 'Ready': return 3;
      case 'Completed': return 4;
      default: return -1;
    }
  };

  const STEPS = [
    { label: 'Placed', desc: 'Order received' },
    { label: 'Accepted', desc: 'Chef confirmed' },
    { label: 'Preparing', desc: 'Cooking at pass line' },
    { label: 'Ready', desc: 'At service counter' },
    { label: 'Completed', desc: 'Delivered to table' }
  ];

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

  const handleExplainBill = async (orderId) => {
    setLoadingBillId(orderId);
    try {
      const res = await api.post('/api/assistant/explain-bill', { order_id: orderId });
      setBillExplanation({
        orderId,
        explanation: res.data.explanation
      });
    } catch (err) {
      console.error(err);
      alert("Failed to generate AI bill audit explanation. Please try again.");
    } finally {
      setLoadingBillId(null);
    }
  };

  return (
    <div className="space-y-8 text-left relative h-full flex flex-col font-sans">
      {/* Header */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <span className="text-xs uppercase tracking-widest text-primary font-bold">Your Culinary Orders</span>
          <h1 className="text-3xl sm:text-5xl font-serif font-light text-primary-text mt-1">
            Order Status & History
          </h1>
          <p className="text-xs text-secondary-text mt-1">
            Track real-time preparations, kitchen display systems pipelines, and dining transactions.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg border border-danger/20 bg-danger/10 text-danger text-xs text-center font-medium shrink-0 flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Orders List Container */}
      <div className="flex-1 min-h-0 overflow-y-auto max-h-[650px] pr-1 py-2">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center text-secondary-text/50 gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
            <span className="text-xs uppercase tracking-widest">Loading order timeline...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-secondary-text/30 gap-4 border border-dashed border-border-color rounded-card bg-surface/10">
            <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
            <div className="text-center space-y-1">
              <span className="text-xs uppercase tracking-widest block font-semibold text-primary-text">No orders yet</span>
              <p className="text-[10px] text-secondary-text max-w-xs font-light">Explore our digital menu to request your first fine dining creation.</p>
            </div>
            <Link
              to="/dashboard/customer/menu"
              className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-background bg-gradient-to-r from-primary to-secondary px-5 py-2.5 rounded-xl border border-primary/20"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Explore Menu
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const currentStepIndex = getStatusIndex(order.order_status);
              const isRejected = order.order_status === 'Cancelled';
              const isExpanded = !!expandedOrders[order.id];

              return (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-card rounded-card border border-border-color bg-surface/30 hover:border-primary/20 transition-all duration-300 overflow-hidden"
                >
                  {/* Summary Card Header */}
                  <div 
                    onClick={() => toggleExpand(order.id)}
                    className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer hover:bg-white/[0.02] transition-colors text-xs text-left"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-sm font-bold text-primary-text">Order #{order.id}</span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${getStatusBadge(order.order_status)}`}>
                          {order.order_status}
                        </span>
                        <span className="text-[10px] text-secondary-text flex items-center gap-1">
                          <Clock className="w-3 h-3 text-secondary-text/60" />
                          Placed: {new Date(order.created_at).toLocaleString()}
                        </span>
                      </div>
                      
                      <p className="text-xs text-primary-text font-medium line-clamp-1">
                        <strong className="text-secondary-text font-semibold">Items: </strong>
                        {order.items.map(i => `${i.menu_item.name} x${i.quantity}`).join(', ')}
                      </p>
                    </div>

                    <div className="flex items-center gap-6 shrink-0 justify-between sm:justify-end w-full sm:w-auto border-t sm:border-t-0 border-border-color/30 pt-2 sm:pt-0">
                      <div className="text-left sm:text-right">
                        <span className="text-[9px] uppercase tracking-widest text-secondary-text block">Total Price</span>
                        <span className="text-base font-bold text-primary">${order.total_amount.toFixed(2)}</span>
                      </div>
                      
                      <div className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-secondary-text">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details & Live Progress Tracking Timeline */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-border-color/30 bg-background/25"
                      >
                        <div className="p-5 space-y-6">
                          {isRejected ? (
                            <div className="p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs font-semibold flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 shrink-0 text-danger" />
                              <span>This order has been rejected or cancelled. Please request help at the dining concierge desk.</span>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="text-[10px] uppercase tracking-widest text-primary font-bold">Live Order Tracker</div>
                              
                              <div className="relative py-4 px-2">
                                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border-color -translate-y-1/2 z-0" />
                                <div 
                                  className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-primary to-secondary -translate-y-1/2 z-0 transition-all duration-500"
                                  style={{ width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%` }}
                                />

                                <div className="relative z-10 flex justify-between items-center">
                                  {STEPS.map((step, idx) => {
                                    const isCompleted = idx <= currentStepIndex;
                                    const isCurrent = idx === currentStepIndex;

                                    return (
                                      <div key={idx} className="flex flex-col items-center">
                                        <div 
                                          className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-300 ${
                                            isCompleted 
                                              ? 'bg-gradient-to-r from-primary to-secondary border-primary shadow shadow-primary/20 text-background font-bold' 
                                              : 'bg-surface border-border-color text-secondary-text'
                                          }`}
                                        >
                                          {isCompleted ? (
                                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                                          ) : (
                                            <span className="text-[10px] font-mono">{idx + 1}</span>
                                          )}
                                        </div>

                                        <div className="text-center mt-2.5 max-w-[80px]">
                                          <span className={`block text-[10px] font-bold uppercase tracking-wider ${
                                            isCompleted ? 'text-primary' : 'text-secondary-text'
                                          } ${isCurrent ? 'underline decoration-2 underline-offset-4' : ''}`}>
                                            {step.label}
                                          </span>
                                          <span className="block text-[8px] text-secondary-text/60 mt-0.5 leading-tight font-light hidden sm:block">
                                            {step.desc}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Full items list breakdown detail */}
                          <div className="border-t border-border-color/30 pt-4 space-y-3">
                            <div className="text-[10px] uppercase tracking-widest text-secondary-text font-semibold">Order Contents</div>
                            <div className="space-y-2">
                              {order.items.map((item, itemIdx) => (
                                <div key={itemIdx} className="flex justify-between items-center text-xs">
                                  <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                    <span className="text-primary-text">{item.menu_item.name}</span>
                                    <strong className="text-primary font-bold">x{item.quantity}</strong>
                                  </div>
                                  <span className="text-secondary-text">${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                            
                            {order.special_instructions && (
                              <div className="p-3 rounded bg-background border border-white/5 text-xs text-primary font-light italic mt-2">
                                <strong className="text-secondary-text font-semibold not-italic block mb-0.5 text-[10px] uppercase tracking-wider">Chef Instructions:</strong>
                                "{order.special_instructions}"
                              </div>
                            )}

                            {/* AI Bill Auditor trigger */}
                            <div className="flex justify-end pt-4 border-t border-border-color/20 mt-4">
                              <button
                                onClick={() => handleExplainBill(order.id)}
                                disabled={loadingBillId === order.id}
                                className="flex items-center gap-1.5 px-4 py-2 border border-primary/20 bg-primary/10 text-primary hover:bg-primary hover:text-background text-[10px] uppercase tracking-widest font-bold rounded-lg transition-all cursor-pointer disabled:opacity-50"
                              >
                                {loadingBillId === order.id ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Sparkles className="w-3.5 h-3.5" />
                                )}
                                Explain My Bill
                              </button>
                            </div>
                          </div>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* AI Bill Explanation Modal */}
      <AnimatePresence>
        {billExplanation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setBillExplanation(null)}
              className="absolute inset-0 bg-black/60"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-lg w-full glass border border-border-color rounded-card p-6 shadow-2xl bg-background/95 z-10 text-left flex flex-col justify-between"
            >
              <div className="flex justify-between items-center border-b border-border-color pb-3 mb-4">
                <h3 className="font-serif text-lg font-semibold text-primary-text flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                  AI Bill Explainer
                </h3>
                <button onClick={() => setBillExplanation(null)} className="p-1 rounded hover:bg-white/5 text-secondary-text hover:text-primary-text cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-xs text-secondary-text space-y-4 max-h-[60vh] overflow-y-auto pr-1 leading-relaxed whitespace-pre-line font-sans select-text">
                {billExplanation.explanation}
              </div>

              <button
                onClick={() => setBillExplanation(null)}
                className="w-full mt-6 text-[10px] font-bold uppercase tracking-widest text-background bg-gradient-to-r from-primary to-secondary hover:brightness-110 shadow-lg py-3 rounded-xl cursor-pointer text-center"
              >
                Acknowledge Explanation
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
