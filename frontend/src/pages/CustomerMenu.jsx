import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import {
  Utensils, ShoppingBag, Plus, Minus, X, AlertCircle, ShoppingCart, Clock, Leaf, Sparkles, Mic, Camera, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

const PremiumImage = ({ src, alt }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const placeholder = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=60";

  return (
    <div className="relative w-full h-full bg-surface/30 overflow-hidden">
      {/* Loading Skeleton */}
      {!loaded && !error && (
        <div className="absolute inset-0 bg-gradient-to-r from-surface to-surface/60 animate-pulse flex items-center justify-center">
          <Utensils className="w-8 h-8 text-secondary-text/20 animate-bounce" />
        </div>
      )}

      {/* Image */}
      <img
        src={error || !src ? placeholder : src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`w-full h-full object-cover transition-all duration-700 ease-out hover:scale-110 ${loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
      />
    </div>
  );
};

export default function CustomerMenu() {
  const [menuItems, setMenuItems] = useState([]);
  const [recs, setRecs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Starters');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);

  // --- Voice Ordering State ---
  const [isListening, setIsListening] = useState(false);
  const [ambiguityData, setAmbiguityData] = useState(null);

  // --- Food Scan State ---
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const videoRef = useRef(null);

  // Fetch menu data and recommendations on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [menuRes, recsRes] = await Promise.all([
          api.get('/api/menu'),
          api.get('/api/recommendations')
        ]);
        setMenuItems(menuRes.data);
        setRecs(recsRes.data);
      } catch (err) {
        setError('Failed to load menu selections. Please refresh.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Camera stream controls
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn("Camera capture permissions not granted or camera not connected:", err);
      toast.error("Could not access camera. Please use local image upload instead.");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  useEffect(() => {
    if (isScanModalOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isScanModalOpen]);

  // Voice Ordering actions
  const startVoiceOrdering = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please try Google Chrome or Microsoft Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 3;
    recognition.onstart = () => {
      setIsListening(true);
      toast.success("Mic active. Please speak your order...");
    };

    recognition.onerror = (event) => {
      console.log("Speech Error:", event.error);

      setIsListening(false);

      if (event.error === "no-speech") {
        toast.error("No speech detected. Please speak louder and closer to the microphone.");
      } else if (event.error === "not-allowed") {
        toast.error("Microphone permission denied.");
      } else if (event.error === "audio-capture") {
        toast.error("No microphone detected.");
      } else {
        toast.error(`Speech recognition failed: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = async (event) => {
      const speechText = event.results[0][0].transcript;
      toast(`Heard: "${speechText}"`, { icon: '🎙️' });
      await handleVoiceOrder(speechText);
    };
    console.log("SpeechRecognition:", SpeechRecognition);
    console.log("Protocol:", window.location.protocol);
    console.log("Browser:", navigator.userAgent);
    recognition.start();
  };

  const handleVoiceOrder = async (text) => {
    try {
      const res = await api.post('/api/assistant/voice-order', { text });
      const { matched, ambiguous } = res.data;

      if (matched && matched.length > 0) {
        matched.forEach(({ item, quantity }) => {
          for (let i = 0; i < quantity; i++) {
            addToCart(item);
          }
          toast.success(`Added ${quantity}x ${item.name} to cart.`);
        });
      }

      if (ambiguous && ambiguous.length > 0) {
        setAmbiguityData(ambiguous[0]);
      } else if (!matched || matched.length === 0) {
        toast("No matches found. Try speaking more clearly.", { icon: '🤔' });
      }
    } catch (err) {
      console.error(err);
      toast.error("AI assistant failed to parse voice ordering instructions.");
    }
  };

  // Image Scan actions
  const captureImage = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const base64 = canvas.toDataURL('image/jpeg');
    handleScanImage(base64);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      handleScanImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleScanImage = async (base64) => {
    setScanning(true);
    setIsScanModalOpen(false);
    try {
      const res = await api.post('/api/assistant/scan-dish', { image_base64: base64 });
      setScanResult(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to parse dish image.");
    } finally {
      setScanning(false);
    }
  };

  // Cart operations
  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const categories = ['Starters', 'Main Course', 'Pizza', 'Burgers', 'Desserts', 'Drinks'];
  const filteredItems = menuItems.filter(item => item.category === selectedCategory);

  const handleCheckout = async () => {
    setPlacingOrder(true);
    try {
      const payload = {
        items: cart.map(item => ({
          menu_item_id: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        special_instructions: specialInstructions.trim() || null
      };

      await api.post('/api/orders', payload);
      alert('Your fine dining order request has been successfully submitted to the pass line!');
      setCart([]);
      setSpecialInstructions('');
      setIsCartOpen(false);
    } catch (err) {
      alert(err.response?.data?.detail || 'Checkout failed. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  const personalizedList = recs?.personalized || [];
  const popularList = recs?.popular || [];
  const displayRecs = personalizedList.length ? personalizedList : popularList;
  const recsLabel = personalizedList.length ? "Based on Order History" : "Popular Selections";

  return (
    <div className="space-y-6 text-left h-full flex flex-col font-sans relative">

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
          className="relative p-3.5 rounded-xl border border-primary/20 bg-primary/10 text-primary hover:border-primary/45 hover:shadow-lg hover:shadow-primary/5 transition-all flex items-center gap-2 font-semibold text-xs uppercase tracking-wider cursor-pointer"
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

      {/* AI Controls Panel (Voice & Vision) */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-surface/30 p-4 border border-border-color/40 rounded-card shrink-0">
        <div className="text-left">
          <h3 className="text-sm font-semibold text-primary-text flex items-center gap-1.5 font-serif">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            AI Chef Assistant
          </h3>
          <p className="text-[10px] text-secondary-text mt-0.5">
            Voice order your meals or scan a dish photo to find matching menu items.
          </p>
        </div>

        <div className="flex gap-2.5 w-full sm:w-auto justify-end">
          <button
            onClick={startVoiceOrdering}
            disabled={isListening}
            className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl border transition-all cursor-pointer ${isListening
              ? 'bg-danger/20 text-danger border-danger/40 animate-pulse'
              : 'bg-primary/10 text-primary border-primary/20 hover:bg-primary hover:text-background'
              }`}
          >
            <Mic className="w-3.5 h-3.5" />
            {isListening ? 'Listening...' : 'Voice Order'}
          </button>

          <button
            onClick={() => setIsScanModalOpen(true)}
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-background transition-all cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
            Scan Dish
          </button>
        </div>
      </div>

      {/* Loading States for Scan */}
      {scanning && (
        <div className="p-4 rounded-xl bg-surface/40 border border-primary/25 text-xs text-primary-text flex items-center gap-2 justify-center shrink-0">
          <RefreshCw className="w-4 h-4 animate-spin text-primary" />
          <span>AI Vision scanning image, checking menu coordinates...</span>
        </div>
      )}

      {/* Personalized Recommendations bar */}
      {recs && displayRecs.length > 0 && (
        <div className="space-y-2.5 shrink-0 bg-surface/10 p-4 rounded-xl border border-border-color/30">
          <div className="flex items-center gap-1.5 text-[10px] text-primary font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Chef's Choice ({recsLabel})</span>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 pr-1">
            {displayRecs.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="glass-card min-w-[250px] max-w-[250px] p-3 rounded-xl border border-border-color/40 flex flex-col justify-between h-[115px] bg-background/40 shrink-0 text-left"
              >
                <div>
                  <h4 className="text-xs font-bold text-primary-text line-clamp-1">{item.name}</h4>
                  <p className="text-[9px] text-secondary-text/80 line-clamp-2 mt-0.5 leading-relaxed">{item.description}</p>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-border-color/20">
                  <span className="text-xs font-bold text-primary">${item.price.toFixed(2)}</span>
                  <button
                    onClick={() => addToCart(item)}
                    disabled={!item.is_available}
                    className="px-2.5 py-1 text-[8px] font-bold uppercase tracking-wider text-background bg-gradient-to-r from-primary to-secondary hover:brightness-110 rounded disabled:opacity-50 cursor-pointer"
                  >
                    + Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categories Scroller */}
      <div className="flex gap-2.5 overflow-x-auto pb-2 shrink-0 border-b border-border-color">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 shrink-0 cursor-pointer ${selectedCategory === cat
              ? 'bg-gradient-to-r from-primary to-secondary text-background shadow-md border border-primary/20'
              : 'text-secondary-text hover:text-primary-text hover:bg-white/5 border border-transparent'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Digital Catalog Grid */}
      <div className="flex-1 min-h-0">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center text-secondary-text/50 gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
            <span className="text-xs uppercase tracking-widest">Retrieving catalog...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-secondary-text/30 gap-2">
            <Utensils className="w-10 h-10 stroke-[1.5]" />
            <span className="text-xs uppercase tracking-widest">Category holds no items</span>
          </div>
        ) : (
          /* Dish Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 overflow-y-auto max-h-[480px] pr-1 py-2">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="glass-card rounded-card border border-border-color overflow-hidden flex flex-col justify-between h-[420px]"
              >
                {/* Visual Header / Cover */}
                <div className="h-48 bg-surface/50 border-b border-border-color/30 relative overflow-hidden">
                  <PremiumImage src={item.image_url} alt={item.name} />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                    <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-primary/20 text-primary border border-primary/30">
                      {item.category}
                    </span>
                    {item.is_veg ? (
                      <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-success/20 text-success border border-success/30 flex items-center gap-1">
                        <Leaf className="w-2.5 h-2.5" />
                        Veg
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-danger/10 text-danger border border-danger/20">
                        Non-Veg
                      </span>
                    )}
                  </div>

                  {!item.is_available && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center">
                      <span className="px-3 py-1 rounded-lg bg-danger/25 text-danger border border-danger/40 font-bold uppercase tracking-widest text-[9px]">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>

                {/* Details Body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="font-serif text-base font-semibold text-primary-text line-clamp-1">{item.name}</h3>
                      <span className="text-sm font-bold text-primary shrink-0">${item.price.toFixed(2)}</span>
                    </div>
                    <p className="text-[10px] text-secondary-text font-light leading-relaxed line-clamp-3">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-border-color/30 mt-4 text-[9px] uppercase tracking-widest font-semibold text-secondary-text">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      {item.prep_time}
                    </span>

                    <button
                      onClick={() => addToCart(item)}
                      disabled={!item.is_available}
                      className="px-4 py-2 border border-primary/20 bg-primary/10 text-primary hover:bg-primary hover:text-background font-bold rounded-lg transition-all disabled:opacity-30 disabled:hover:bg-primary/10 disabled:hover:text-primary cursor-pointer"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black z-40"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md glass border-l border-border-color shadow-2xl p-6 z-50 flex flex-col justify-between bg-background/95"
            >
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex justify-between items-center shrink-0 border-b border-border-color pb-4 mb-6">
                  <h3 className="font-serif text-lg font-semibold text-primary-text">Culinary Cart</h3>
                  <button onClick={() => setIsCartOpen(false)} className="p-1 rounded bg-white/5 hover:bg-white/10 text-secondary-text hover:text-primary-text cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-1 space-y-4">
                  {cart.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center text-secondary-text/30 gap-2">
                      <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
                      <span className="text-[10px] uppercase tracking-wider font-semibold">Your cart is empty</span>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div key={item.id} className="flex justify-between items-center bg-surface/20 border border-border-color/30 p-3.5 rounded-xl">
                        <div className="text-left">
                          <h4 className="text-xs font-bold text-primary-text">{item.name}</h4>
                          <span className="text-[10px] text-primary font-semibold mt-0.5 block">${item.price.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateQuantity(item.id, -1)} className="p-1 rounded bg-white/5 hover:bg-white/10 text-secondary-text cursor-pointer">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-bold text-primary-text min-w-[16px] text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="p-1 rounded bg-white/5 hover:bg-white/10 text-secondary-text cursor-pointer">
                            <Plus className="w-3 h-3" />
                          </button>
                          <button onClick={() => removeFromCart(item.id)} className="p-1 rounded bg-danger/10 hover:bg-danger/20 text-danger ml-2 cursor-pointer">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {cart.length > 0 && (
                  <div className="space-y-4 shrink-0 border-t border-border-color/30 pt-4">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-widest text-secondary-text font-bold text-left block">Chef Instructions</label>
                      <input
                        type="text"
                        value={specialInstructions}
                        onChange={(e) => setSpecialInstructions(e.target.value)}
                        placeholder="Allergies, spices preferences..."
                        className="w-full bg-background border border-border-color focus:border-primary/50 rounded-lg px-3 py-2 text-xs text-primary-text outline-none placeholder:text-secondary-text/30"
                      />
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold pt-2">
                      <span className="text-primary-text">Subtotal Price</span>
                      <span className="text-primary text-base">${cartTotal.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-border-color shrink-0">
                <button
                  onClick={handleCheckout}
                  disabled={cart.length === 0 || placingOrder}
                  className="w-full flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-background bg-gradient-to-r from-primary to-secondary hover:brightness-110 shadow-lg shadow-primary/20 py-3 rounded-xl disabled:opacity-50 cursor-pointer"
                >
                  {placingOrder ? 'Submitting Order...' : 'Confirm order request'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Voice Ambiguity Modal */}
      <AnimatePresence>
        {ambiguityData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60"
              onClick={() => setAmbiguityData(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-md w-full glass border border-border-color rounded-card p-6 shadow-2xl bg-background/95 z-10 text-center"
            >
              <h3 className="font-serif text-lg font-semibold text-primary-text mb-2">Resolve Ambiguity</h3>
              <p className="text-xs text-secondary-text mb-4 leading-relaxed">
                We found multiple matches for <span className="text-primary font-bold">"{ambiguityData.query}"</span> (Quantity: {ambiguityData.quantity}). Which one did you mean?
              </p>
              <div className="flex flex-col gap-2.5">
                {ambiguityData.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      for (let i = 0; i < ambiguityData.quantity; i++) {
                        addToCart(option);
                      }
                      toast.success(`Added ${ambiguityData.quantity}x ${option.name} to cart.`);
                      setAmbiguityData(null);
                    }}
                    className="w-full text-xs font-semibold px-4 py-3 rounded-xl border border-border-color hover:border-primary bg-surface/50 text-primary-text hover:text-primary transition-all text-left flex justify-between items-center cursor-pointer"
                  >
                    <span>{option.name}</span>
                    <span className="text-primary font-bold">${option.price.toFixed(2)}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setAmbiguityData(null)}
                className="w-full mt-4 text-[10px] font-bold uppercase tracking-wider text-secondary-text hover:text-primary-text py-2 cursor-pointer"
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Webcam / Image Scan Setup Modal */}
      <AnimatePresence>
        {isScanModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60"
              onClick={() => setIsScanModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-lg w-full glass border border-border-color rounded-card p-6 shadow-2xl bg-background/95 z-10 text-center flex flex-col justify-between"
            >
              <div className="flex justify-between items-center border-b border-border-color pb-3 mb-4">
                <h3 className="font-serif text-lg font-semibold text-primary-text">Scan Culinary Plate</h3>
                <button onClick={() => setIsScanModalOpen(false)} className="p-1 rounded hover:bg-white/5 text-secondary-text hover:text-primary-text cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Camera Frame View */}
              <div className="relative rounded-xl overflow-hidden border border-border-color h-[280px] bg-black/40 flex items-center justify-center">
                {cameraStream ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-secondary-text/30 gap-2">
                    <Camera className="w-10 h-10 stroke-[1.5]" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">No Active Camera Feed</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <button
                  onClick={captureImage}
                  disabled={!cameraStream}
                  className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-background bg-gradient-to-r from-primary to-secondary hover:brightness-110 shadow-lg shadow-primary/10 py-3 rounded-xl disabled:opacity-40 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  Capture Photo
                </button>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <button
                    className="w-full flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary border border-primary/20 bg-primary/5 hover:bg-primary/10 py-3 rounded-xl cursor-pointer"
                  >
                    Upload File
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Vision Scan Result Dialog */}
      <AnimatePresence>
        {scanResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60"
              onClick={() => setScanResult(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-md w-full glass border border-border-color rounded-card p-6 shadow-2xl bg-background/95 z-10 text-center"
            >
              <div className="flex justify-between items-center border-b border-border-color pb-3 mb-4">
                <h3 className="font-serif text-lg font-semibold text-primary-text">AI Scanner Results</h3>
                <button onClick={() => setScanResult(null)} className="p-1 rounded hover:bg-white/5 text-secondary-text hover:text-primary-text cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {scanResult.found && scanResult.match ? (
                <div className="space-y-4 text-left">
                  <div className="flex justify-between items-center">
                    <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-success/20 text-success border border-success/30 flex items-center gap-1">
                      Matched ({scanResult.match.confidence.toFixed(1)}% match)
                    </span>
                    <span className="text-xs font-bold text-primary">${scanResult.match.price.toFixed(2)}</span>
                  </div>
                  <div>
                    <h4 className="text-base font-bold font-serif text-primary-text">{scanResult.match.name}</h4>
                    <p className="text-[10px] text-secondary-text mt-1.5">
                      <span className="font-bold text-primary-text uppercase tracking-widest text-[8px] block mb-0.5">Ingredients detected:</span>
                      {scanResult.match.ingredients}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      addToCart(scanResult.match);
                      toast.success(`Added ${scanResult.match.name} to cart.`);
                      setScanResult(null);
                    }}
                    className="w-full flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-background bg-gradient-to-r from-primary to-secondary hover:brightness-110 shadow-lg py-3 rounded-xl cursor-pointer"
                  >
                    Add matching item to cart
                  </button>
                </div>
              ) : (
                <div className="space-y-4 text-left">
                  <div className="p-3 bg-danger/10 border border-danger/25 rounded-xl text-xs text-danger text-center">
                    No exact dish matched our catalog coordinates. You may also like:
                  </div>
                  <div className="flex flex-col gap-2">
                    {scanResult.recommendations.map((item) => (
                      <div key={item.id} className="flex justify-between items-center bg-surface/20 border border-border-color/30 p-3 rounded-xl">
                        <div>
                          <h4 className="text-xs font-bold text-primary-text">{item.name}</h4>
                          <span className="text-[10px] text-primary font-semibold block mt-0.5">${item.price.toFixed(2)}</span>
                        </div>
                        <button
                          onClick={() => {
                            addToCart(item);
                            toast.success(`Added ${item.name} to cart.`);
                            setScanResult(null);
                          }}
                          className="px-3 py-1.5 text-[8px] font-bold uppercase tracking-wider text-background bg-gradient-to-r from-primary to-secondary hover:brightness-110 rounded-lg cursor-pointer"
                        >
                          + Add
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
