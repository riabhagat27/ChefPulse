import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { 
  Plus, Edit, Trash2, X, AlertCircle, RefreshCw, Eye, EyeOff, Utensils, Clock, Leaf 
} from 'lucide-react';

export default function AdminMenu() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentItemId, setCurrentItemId] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Main Course');
  const [isAvailable, setIsAvailable] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [isVeg, setIsVeg] = useState(true);
  const [prepTime, setPrepTime] = useState('15 mins');

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/menu');
      setMenuItems(res.data);
    } catch (err) {
      setError('Failed to retrieve the digital menu. Please refresh.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const openAddModal = () => {
    setModalMode('add');
    setName('');
    setDescription('');
    setPrice('');
    setCategory('Main Course');
    setIsAvailable(true);
    setImageUrl('');
    setIsVeg(true);
    setPrepTime('15 mins');
    setError('');
    setSuccess('');
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setModalMode('edit');
    setCurrentItemId(item.id);
    setName(item.name);
    setDescription(item.description);
    setPrice(item.price.toString());
    setCategory(item.category);
    setIsAvailable(item.is_available);
    setImageUrl(item.image_url || '');
    setIsVeg(item.is_veg);
    setPrepTime(item.prep_time || '15 mins');
    setError('');
    setSuccess('');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setError('Please specify a positive price.');
      return;
    }

    const payload = {
      name,
      description,
      price: parsedPrice,
      category,
      is_available: isAvailable,
      image_url: imageUrl.trim() || null,
      is_veg: isVeg,
      prep_time: prepTime.trim() || '15 mins'
    };

    try {
      if (modalMode === 'add') {
        const res = await api.post('/api/menu', payload);
        setMenuItems([...menuItems, res.data]);
        setSuccess('Dish added successfully!');
      } else {
        const res = await api.put(`/api/menu/${currentItemId}`, payload);
        setMenuItems(menuItems.map(item => item.id === currentItemId ? res.data : item));
        setSuccess('Dish updated successfully!');
      }
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccess('');
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit changes. Please verify inputs.');
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you certain you wish to delete this item?')) return;
    setError('');
    try {
      await api.delete(`/api/menu/${itemId}`);
      setMenuItems(menuItems.filter(item => item.id !== itemId));
    } catch (err) {
      setError('Failed to delete item.');
    }
  };

  const handleToggleAvailability = async (itemId) => {
    setError('');
    try {
      const res = await api.patch(`/api/menu/${itemId}/availability`);
      setMenuItems(menuItems.map(item => item.id === itemId ? res.data : item));
    } catch (err) {
      setError('Failed to update availability.');
    }
  };

  return (
    <div className="space-y-8 text-left relative h-full flex flex-col">
      {/* Header controls */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <span className="text-xs uppercase tracking-widest text-primary font-bold">Restaurant Catalog</span>
          <h1 className="text-3xl sm:text-5xl font-serif font-light text-primary-text mt-1">
            Menu Management
          </h1>
          <p className="text-xs text-secondary-text mt-1">
            Create, edit, delete, and toggle availability of your culinary inventory
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-background bg-gradient-to-r from-primary to-secondary hover:brightness-110 shadow-lg shadow-primary/10 transition-all duration-300 px-5 py-3 rounded-xl border border-primary/20"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Add New Dish
        </button>
      </div>

      {/* Message alerts */}
      {error && (
        <div className="p-3 rounded-lg border border-danger/20 bg-danger/10 text-danger text-xs text-center font-medium shrink-0 flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Table view */}
      <div className="flex-1 min-h-0 bg-surface/30 border border-border-color rounded-card shadow-2xl p-6 overflow-hidden flex flex-col justify-between">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center text-secondary-text/50 gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
            <span className="text-xs uppercase tracking-widest">Retrieving records...</span>
          </div>
        ) : menuItems.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-secondary-text/30 gap-2">
            <Utensils className="w-10 h-10 stroke-[1.5]" />
            <span className="text-xs uppercase tracking-widest">Catalog is empty</span>
          </div>
        ) : (
          <div className="overflow-y-auto max-h-[550px] pr-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border-color pb-3 text-secondary-text uppercase tracking-widest text-[10px]">
                  <th className="py-3 font-semibold">Dish Details</th>
                  <th className="py-3 font-semibold">Category</th>
                  <th className="py-3 font-semibold">Prep Time</th>
                  <th className="py-3 font-semibold">Price</th>
                  <th className="py-3 font-semibold text-center">Status</th>
                  <th className="py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color/30">
                {menuItems.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    {/* Details column */}
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="font-bold text-primary-text">{item.name}</div>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border flex items-center gap-0.5 ${
                          item.is_veg
                            ? 'bg-success/10 text-success border-success/20'
                            : 'bg-danger/10 text-danger border-danger/20'
                        }`}>
                          {item.is_veg ? <Leaf className="w-2.5 h-2.5 fill-success" /> : <span className="w-1.5 h-1.5 rounded-full bg-danger inline-block shrink-0" />}
                          {item.is_veg ? 'Veg' : 'Non-Veg'}
                        </span>
                      </div>
                      <div className="text-[10px] text-secondary-text font-light line-clamp-1 mt-0.5">{item.description}</div>
                    </td>
                    {/* Category */}
                    <td className="py-4 text-secondary-text font-medium">{item.category}</td>
                    {/* Prep Time */}
                    <td className="py-4 text-secondary-text font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                      {item.prep_time}
                    </td>
                    {/* Price */}
                    <td className="py-4 text-primary font-bold">${item.price.toFixed(2)}</td>
                    {/* Availability Switch */}
                    <td className="py-4 text-center">
                      <button
                        onClick={() => handleToggleAvailability(item.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] uppercase tracking-wider font-semibold transition-all duration-300 ${
                          item.is_available
                            ? 'bg-success/10 text-success border-success/20 hover:bg-success/20'
                            : 'bg-danger/10 text-danger border-danger/20 hover:bg-danger/20'
                        }`}
                      >
                        {item.is_available ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        {item.is_available ? 'Available' : 'Out of Stock'}
                      </button>
                    </td>
                    {/* Actions buttons */}
                    <td className="py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-2 rounded-lg border border-border-color text-secondary-text hover:text-primary hover:border-primary/30 bg-background/20 transition-all"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 rounded-lg border border-border-color text-secondary-text hover:text-danger hover:border-danger/30 bg-background/20 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Save Dish Overlay Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black z-40"
            />
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className="w-full max-w-lg glass border border-border-color rounded-card shadow-2xl p-8 flex flex-col justify-between max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center border-b border-border-color pb-4 mb-6">
                  <h3 className="font-serif text-xl font-semibold text-primary-text">
                    {modalMode === 'add' ? 'Add Culinary Dish' : 'Edit Dish Specifications'}
                  </h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-1 rounded-lg hover:bg-white/5 text-secondary-text hover:text-primary-text"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {success && (
                  <div className="mb-4 p-3 rounded-lg border border-success/20 bg-success/10 text-success text-xs text-center font-medium">
                    {success}
                  </div>
                )}

                <form onSubmit={handleSave} className="space-y-4">
                  {/* Name field */}
                  <div className="space-y-1 text-left">
                    <label className="text-[9px] uppercase tracking-widest text-secondary-text font-semibold">Dish Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Oysters Rockefeller"
                      className="w-full bg-background/50 border border-border-color focus:border-primary/50 rounded-xl px-4 py-3 text-sm text-primary-text outline-none transition-all font-sans"
                    />
                  </div>

                  {/* Description field */}
                  <div className="space-y-1 text-left">
                    <label className="text-[9px] uppercase tracking-widest text-secondary-text font-semibold">Description</label>
                    <textarea
                      required
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the dish ingredients, allergens, preparation..."
                      className="w-full bg-background/50 border border-border-color focus:border-primary/50 rounded-xl px-4 py-3 text-sm text-primary-text outline-none transition-all font-sans resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Price field */}
                    <div className="space-y-1 text-left">
                      <label className="text-[9px] uppercase tracking-widest text-secondary-text font-semibold">Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="24.50"
                        className="w-full bg-background/50 border border-border-color focus:border-primary/50 rounded-xl px-4 py-3 text-sm text-primary-text outline-none transition-all font-sans"
                      />
                    </div>
                    {/* Category selection */}
                    <div className="space-y-1 text-left">
                      <label className="text-[9px] uppercase tracking-widest text-secondary-text font-semibold">Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-surface border border-border-color focus:border-primary/50 rounded-xl px-4 py-3 text-sm text-primary-text outline-none transition-all font-sans"
                      >
                        {['Starters', 'Main Course', 'Pizza', 'Burgers', 'Desserts', 'Drinks'].map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Prep time field */}
                    <div className="space-y-1 text-left">
                      <label className="text-[9px] uppercase tracking-widest text-secondary-text font-semibold">Prep Time (e.g. '15 mins')</label>
                      <input
                        type="text"
                        required
                        value={prepTime}
                        onChange={(e) => setPrepTime(e.target.value)}
                        placeholder="15 mins"
                        className="w-full bg-background/50 border border-border-color focus:border-primary/50 rounded-xl px-4 py-3 text-sm text-primary-text outline-none transition-all font-sans"
                      />
                    </div>
                    {/* Veg/Non-Veg Checkbox */}
                    <div className="space-y-1 text-left flex flex-col justify-center">
                      <label className="text-[9px] uppercase tracking-widest text-secondary-text font-semibold mb-2">Dietary Classification</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="is-veg-checkbox"
                          checked={isVeg}
                          onChange={(e) => setIsVeg(e.target.checked)}
                          className="w-4 h-4 accent-primary rounded bg-surface border-border-color"
                        />
                        <label htmlFor="is-veg-checkbox" className="text-xs text-primary-text font-semibold select-none cursor-pointer">
                          Mark as Vegetarian (Veg)
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Image Url field */}
                  <div className="space-y-1 text-left">
                    <label className="text-[9px] uppercase tracking-widest text-secondary-text font-semibold">Image URL (Optional)</label>
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://image-server.com/lobster.png"
                      className="w-full bg-background/50 border border-border-color focus:border-primary/50 rounded-xl px-4 py-3 text-sm text-primary-text outline-none transition-all font-sans"
                    />
                  </div>

                  {/* Availability toggle checkbox */}
                  <div className="flex items-center gap-2 py-2">
                    <input
                      type="checkbox"
                      id="modal-available"
                      checked={isAvailable}
                      onChange={(e) => setIsAvailable(e.target.checked)}
                      className="w-4 h-4 accent-primary rounded bg-surface border-border-color"
                    />
                    <label htmlFor="modal-available" className="text-xs text-primary-text font-semibold select-none cursor-pointer">
                      Mark as immediately available in digital catalog
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 text-xs uppercase tracking-widest font-semibold text-background bg-gradient-to-r from-primary to-secondary hover:brightness-110 shadow-lg shadow-primary/10 transition-all duration-300 py-3.5 rounded-xl mt-4"
                  >
                    {modalMode === 'add' ? 'Confirm Addition' : 'Apply Specifications'}
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
