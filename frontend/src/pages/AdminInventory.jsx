import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, AlertTriangle, Plus, Edit3, Trash2, Check, RefreshCw, X, Sparkles, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import useWebSocket from '../hooks/useWebSocket';
import toast from 'react-hot-toast';

export default function AdminInventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemName, setItemName] = useState('');
  const [itemQty, setItemQty] = useState('');
  const [itemUnit, setItemUnit] = useState('kg');
  const [itemMinStock, setItemMinStock] = useState('1.0');
  const [itemCategory, setItemCategory] = useState('Ingredients');

  const fetchInventory = async () => {
    try {
      const res = await api.get('/api/inventory');
      setItems(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to retrieve inventory logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Real-time synchronization
  useWebSocket((data) => {
    if (data.event === 'inventory_updated') {
      fetchInventory();
    }
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setItemName('');
    setItemQty('');
    setItemUnit('kg');
    setItemMinStock('1.0');
    setItemCategory('Ingredients');
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemQty(item.quantity.toString());
    setItemUnit(item.unit);
    setItemMinStock(item.min_stock.toString());
    setItemCategory(item.category);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    const payload = {
      name: itemName,
      quantity: parseFloat(itemQty),
      unit: itemUnit,
      min_stock: parseFloat(itemMinStock),
      category: itemCategory
    };

    try {
      if (editingItem) {
        await api.put(`/api/inventory/${editingItem.id}`, payload);
        toast.success('Stock item updated successfully.');
      } else {
        await api.post('/api/inventory', payload);
        toast.success('New stock item added.');
      }
      setShowModal(false);
      fetchInventory();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save item.');
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to remove this item from the inventory?')) return;
    try {
      await api.delete(`/api/inventory/${itemId}`);
      toast.success('Stock item deleted.');
      fetchInventory();
    } catch (err) {
      toast.error('Failed to delete item.');
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Critical': return 'bg-danger/25 text-danger border-danger/35 font-bold';
      case 'Running Low': return 'bg-warning/20 text-warning border-warning/30';
      case 'Safe': return 'bg-success/20 text-success border-success/30';
      default: return 'bg-white/5 text-secondary-text border-white/10';
    }
  };

  // Generate Restock Suggestions dynamically based on database properties
  const restockSuggestions = items.map(item => {
    if (item.status === 'Critical' || item.quantity < item.min_stock) {
      return { text: `⚠ ${item.name} stock is critically low.`, type: 'critical' };
    }
    if (item.days_remaining <= 2) {
      return { text: `⚠ Restock ${item.name} within ${Math.ceil(item.days_remaining)} days.`, type: 'low' };
    }
    if (item.status === 'Safe') {
      return { text: `✓ ${item.name} has sufficient stock.`, type: 'safe' };
    }
    return null;
  }).filter(Boolean);

  return (
    <div className="space-y-8 text-left font-sans relative h-full flex flex-col">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <span className="text-xs uppercase tracking-widest text-primary font-bold">Stock Control</span>
          <h1 className="text-3xl sm:text-5xl font-serif font-light text-primary-text mt-1">
            Ingredient Inventory
          </h1>
          <p className="text-xs text-secondary-text mt-1">
            Monitor and replenish gourmet food stocks, set safety margins, and trace levels.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1 px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest font-bold text-background bg-gradient-to-r from-primary to-secondary hover:brightness-110 shadow-lg shadow-primary/20 border border-primary/20"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Item
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg border border-danger/20 bg-danger/10 text-danger text-xs text-center font-medium shrink-0">
          {error}
        </div>
      )}

      {/* Restock suggestions panel */}
      {!loading && restockSuggestions.length > 0 && (
        <div className="space-y-3 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-primary font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Smart Restock Suggestions</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {restockSuggestions.slice(0, 3).map((sug, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`p-4 rounded-xl border flex items-start gap-2.5 text-xs font-semibold leading-relaxed bg-[#111111]/60 backdrop-blur-md ${
                  sug.type === 'critical' ? 'border-danger/30 text-danger shadow-danger/5' :
                  sug.type === 'low' ? 'border-warning/30 text-warning shadow-warning/5' :
                  'border-success/20 text-success shadow-success/5'
                }`}
              >
                <div className="mt-0.5">
                  {sug.type === 'safe' ? <CheckCircle2 className="w-4 h-4 shrink-0 text-success" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                </div>
                <div>
                  <p>{sug.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Grid view of stock items */}
      <div className="flex-1 min-h-0 overflow-y-auto max-h-[600px] pr-1 py-2">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center text-secondary-text/50 gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
            <span className="text-xs uppercase tracking-widest">Retrieving stock sheets...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-secondary-text/30 gap-2 border border-dashed border-border-color rounded-card bg-surface/10">
            <Layers className="w-10 h-10 stroke-[1.5]" />
            <span className="text-xs uppercase tracking-widest">No stock entries registered.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {items.map((item) => {
              const isLow = item.status === 'Critical' || item.status === 'Running Low';
              return (
                <motion.div
                  key={item.id}
                  layout
                  className={`glass-card p-5 rounded-card border ${
                    item.status === 'Critical' ? 'border-danger/35 bg-danger/5' :
                    item.status === 'Running Low' ? 'border-warning/30 bg-warning/5' :
                    'border-border-color bg-surface/30'
                  } hover:border-primary/20 transition-all flex flex-col justify-between`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-widest text-secondary-text">{item.category}</span>
                      <span className={`px-2.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border flex items-center gap-1 ${getStatusBadgeColor(item.status)}`}>
                        {item.status === 'Critical' && <AlertTriangle className="w-2.5 h-2.5 animate-pulse" />}
                        {item.status === 'Running Low' && <AlertTriangle className="w-2.5 h-2.5" />}
                        {item.status === 'Safe' && <Check className="w-2.5 h-2.5" />}
                        {item.status}
                      </span>
                    </div>

                    <h3 className="font-serif text-lg font-semibold text-primary-text">{item.name}</h3>

                    <div className="flex justify-between items-end pt-2">
                      <div>
                        <span className="text-[9px] uppercase tracking-widest text-secondary-text block">Current Stock</span>
                        <span className="text-xl font-bold text-primary-text">
                          {item.quantity} <span className="text-xs font-normal text-secondary-text">{item.unit}</span>
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] uppercase tracking-widest text-secondary-text block">Safety Limit</span>
                        <span className="text-xs font-bold text-secondary-text">
                          {item.min_stock} {item.unit}
                        </span>
                      </div>
                    </div>

                    {/* Projections */}
                    <div className="mt-4 pt-3 border-t border-border-color/20 text-[10px] space-y-1.5 bg-background/20 p-2.5 rounded-lg border border-white/5">
                      <div className="flex items-center gap-1 text-[8px] uppercase tracking-widest text-primary font-bold">
                        <Sparkles className="w-3 h-3" />
                        <span>AI Predictions & Metrics</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-secondary-text">Daily Avg Usage:</span>
                        <span className="font-semibold text-primary-text">{item.avg_daily_usage} {item.unit}/day</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-secondary-text">Predicted Days Remaining:</span>
                        <span className={`font-semibold ${item.status === 'Critical' ? 'text-danger font-bold' : item.status === 'Running Low' ? 'text-warning' : 'text-success'}`}>
                          {item.days_remaining.toFixed(1)} Days
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-secondary-text">Health Status:</span>
                        <span className={`font-semibold uppercase tracking-wider text-[9px] ${item.status === 'Critical' ? 'text-danger font-bold' : item.status === 'Running Low' ? 'text-warning' : 'text-success'}`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 border-t border-border-color/30 pt-3 mt-4">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-2 rounded bg-white/5 border border-white/5 hover:bg-primary/10 hover:border-primary/20 hover:text-primary transition-all text-secondary-text"
                      title="Edit Stock Item"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded bg-danger/10 border border-danger/20 hover:bg-danger/20 text-danger transition-all"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md glass border border-border-color rounded-card p-6 shadow-2xl bg-background text-left"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-serif text-lg font-semibold text-primary-text">
                  {editingItem ? 'Edit Ingredient' : 'New Ingredient'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded-lg hover:bg-white/5 text-secondary-text"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-secondary-text font-bold">Ingredient Name</label>
                  <input
                    type="text"
                    required
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="e.g. White Truffle, A5 Wagyu"
                    className="w-full bg-surface/50 border border-border-color focus:border-primary/50 rounded-lg px-3 py-2 text-xs text-primary-text outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest text-secondary-text font-bold">Quantity</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={itemQty}
                      onChange={(e) => setItemQty(e.target.value)}
                      placeholder="e.g. 5.0"
                      className="w-full bg-surface/50 border border-border-color focus:border-primary/50 rounded-lg px-3 py-2 text-xs text-primary-text outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest text-secondary-text font-bold">Unit</label>
                    <input
                      type="text"
                      required
                      value={itemUnit}
                      onChange={(e) => setItemUnit(e.target.value)}
                      placeholder="e.g. kg, units, sheets"
                      className="w-full bg-surface/50 border border-border-color focus:border-primary/50 rounded-lg px-3 py-2 text-xs text-primary-text outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest text-secondary-text font-bold">Safety Limit (Min)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={itemMinStock}
                      onChange={(e) => setItemMinStock(e.target.value)}
                      placeholder="e.g. 2.0"
                      className="w-full bg-surface/50 border border-border-color focus:border-primary/50 rounded-lg px-3 py-2 text-xs text-primary-text outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest text-secondary-text font-bold">Category</label>
                    <select
                      value={itemCategory}
                      onChange={(e) => setItemCategory(e.target.value)}
                      className="w-full bg-surface/50 border border-border-color focus:border-primary/50 rounded-lg px-3 py-2 text-xs text-primary-text outline-none"
                    >
                      <option value="Ingredients">Ingredients</option>
                      <option value="Luxury Oils & Spices">Luxury Oils & Spices</option>
                      <option value="Meats">Meats</option>
                      <option value="Dairy">Dairy</option>
                      <option value="Produce">Produce</option>
                      <option value="Garnishes">Garnishes</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-1 text-[9px] uppercase tracking-widest font-bold text-background bg-gradient-to-r from-primary to-secondary hover:brightness-110 shadow-lg shadow-primary/20 py-2.5 rounded-xl border border-primary/20"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Save Ingredient
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 border border-border-color hover:bg-white/5 rounded-xl text-[9px] uppercase tracking-widest font-bold text-secondary-text"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
