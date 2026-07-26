import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { 
  Utensils, ShoppingBag, Plus, Minus, X, AlertCircle, ShoppingCart, Clock, Leaf 
} from 'lucide-react';

export default function CustomerMenu() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Starters');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Fetch menu data on mount
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await api.get('/api/menu');
        setMenuItems(res.data);
      } catch (err) {
        setError('Failed to retrieve the digital menu. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  // Standard category options
  const categories = ['Starters', 'Main Course', 'Pizza', 'Burgers', 'Desserts', 'Drinks'];

  const filteredItems = menuItems.filter(
    item => item.category.toLowerCase() === selectedCategory.toLowerCase()
  );

  // Cart operations
  const addToCart = (item) => {
    if (!item.is_available) return;
    
    setCart((prevCart) => {
      const existing = prevCart.find(cartItem => cartItem.id === item.id);
      if (existing) {
        return prevCart.map(cartItem => 
          cartItem.id === item.id 
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId, amount) => {
    setCart((prevCart) => {
      return prevCart.map(cartItem => {
        if (cartItem.id === itemId) {
          const newQty = cartItem.quantity + amount;
          return newQty > 0 ? { ...cartItem, quantity: newQty } : null;
        }
        return cartItem;
      }).filter(Boolean);
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="space-y-8 text-left relative h-full flex flex-col">
      {/* Header and Floating Cart Trigger */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <span className="text-xs uppercase tracking-widest text-primary font-bold">Gastronomic Selection</span>
          <h1 className="text-3xl sm:text-5xl font-serif font-light text-primary-text mt-1">
            Digital Menu
          </h1>
          <p className="text-xs text-secondary-text mt-1">
            Browse our curated selections and add premium creations to your order
          </p>
        </div>

        {/* Floating Cart Button */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="relative p-3.5 rounded-xl border border-primary/20 bg-primary/10 text-primary hover:border-primary/45 hover:shadow-lg hover:shadow-primary/5 transition-all flex items-center gap-2 font-semibold text-xs uppercase tracking-wider"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Cart</span>
          {cartItemCount > 0 && (
            <span className="bg-primary text-background font-bold px-2 py-0.5 rounded-full text-[10px] ml-1">
              {cartItemCount}
            </span>
          )}
        </button>
      </div>

      {/* Categories Scroller */}
      <div className="flex gap-2.5 overflow-x-auto pb-2 shrink-0 border-b border-border-color">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 shrink-0 ${
              selectedCategory === cat
                ? 'bg-gradient-to-r from-primary to-secondary text-background shadow-md border border-primary/20'
                : 'text-secondary-text hover:text-primary-text hover:bg-white/5 border border-transparent'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Area */}
      <div className="flex-1 min-h-0">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center text-secondary-text/50 gap-2">
            <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            <span className="text-xs uppercase tracking-widest">Loading selections...</span>
          </div>
        ) : error ? (
          <div className="h-64 flex flex-col items-center justify-center text-danger gap-2">
            <AlertCircle className="w-8 h-8 stroke-[1.5]" />
            <span className="text-xs font-semibold uppercase tracking-wider">{error}</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-secondary-text/30 gap-2">
            <Utensils className="w-10 h-10 stroke-[1.5]" />
            <span className="text-xs uppercase tracking-widest">No dishes under this category</span>
          </div>
        ) : (
          /* Dish Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 overflow-y-auto max-h-[650px] pr-1 py-2">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="glass-card rounded-card border border-border-color overflow-hidden flex flex-col justify-between h-[380px]"
              >
                {/* Visual Header / Cover */}
                <div className="h-32 bg-surface/50 border-b border-border-color/30 relative flex items-center justify-center text-secondary-text/25 overflow-hidden">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <Utensils className="w-10 h-10 stroke-[1.5]" />
                  )}
                  
                  {/* Badges container */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
                    {/* Veg/Non-Veg Badge */}
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border flex items-center gap-1 ${
                      item.is_veg
                        ? 'bg-success/10 text-success border-success/20'
                        : 'bg-danger/10 text-danger border-danger/20'
                    }`}>
                      {item.is_veg ? <Leaf className="w-2.5 h-2.5 fill-success" /> : <span className="w-2 h-2 rounded-full bg-danger inline-block shrink-0" />}
                      {item.is_veg ? 'Veg' : 'Non-Veg'}
                    </span>

                    {/* Availability Status Badge */}
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${
                      item.is_available
                        ? 'bg-success/10 text-success border-success/20'
                        : 'bg-danger/15 text-danger border-danger/30 font-semibold'
                    }`}>
                      {item.is_available ? 'Available' : 'Out of Stock'}
                    </span>
                  </div>
                </div>

                {/* Details Section */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5 text-left">
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="font-serif font-semibold text-base text-primary-text max-w-[70%] truncate">
                        {item.name}
                      </h3>
                      <span className="text-sm font-bold text-primary shrink-0">${item.price.toFixed(2)}</span>
                    </div>
                    <p className="text-[11px] text-secondary-text font-light leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  {/* Preparation time & Buttons */}
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-1.5 text-[10px] text-secondary-text font-semibold">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      <span>Prep: {item.prep_time}</span>
                    </div>

                    <button
                      disabled={!item.is_available}
                      onClick={() => addToCart(item)}
                      className="w-full flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest font-semibold text-background bg-gradient-to-r from-primary to-secondary hover:brightness-110 shadow-lg shadow-primary/10 transition-all duration-300 py-3 rounded-xl disabled:opacity-50 disabled:from-secondary-text/20 disabled:to-secondary-text/20 disabled:text-secondary-text/50 disabled:border-transparent"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      Add to cart
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Cart Sidebar Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black z-40"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 right-0 w-full max-w-md bg-surface border-l border-border-color z-50 flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-border-color flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                  <h3 className="font-serif font-semibold text-primary-text">Your Selection</h3>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/5 text-secondary-text hover:text-primary-text"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cart List */}
              <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                {cart.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-secondary-text/30 gap-1.5">
                    <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
                    <span className="text-xs uppercase tracking-widest">Cart is empty</span>
                  </div>
                ) : (
                  cart.map((cartItem) => (
                    <div
                      key={cartItem.id}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-border-color bg-background/30"
                    >
                      <div className="text-left max-w-[60%]">
                        <h4 className="text-xs font-bold text-primary-text truncate">{cartItem.name}</h4>
                        <span className="text-[10px] text-primary font-bold">${(cartItem.price * cartItem.quantity).toFixed(2)}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 bg-background p-1.5 rounded-lg border border-border-color">
                          <button
                            onClick={() => updateQuantity(cartItem.id, -1)}
                            className="p-1 text-secondary-text hover:text-primary-text transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold px-1.5 text-primary-text">{cartItem.quantity}</span>
                          <button
                            onClick={() => updateQuantity(cartItem.id, 1)}
                            className="p-1 text-secondary-text hover:text-primary-text transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(cartItem.id)}
                          className="text-secondary-text/50 hover:text-danger p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer Total */}
              {cart.length > 0 && (
                <div className="p-6 border-t border-border-color space-y-5 bg-background/20">
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <span className="text-secondary-text font-medium uppercase tracking-wider text-xs">Total Order Value</span>
                    <span className="text-lg font-serif text-primary">${cartTotal.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={() => {
                      alert('Order Placed Successfully! (This is a layout prototype demonstration)');
                      setCart([]);
                      setIsCartOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 text-xs uppercase tracking-widest font-bold text-background bg-gradient-to-r from-primary to-secondary hover:brightness-110 shadow-lg shadow-primary/20 py-4 rounded-xl"
                  >
                    Submit Premium Order
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
