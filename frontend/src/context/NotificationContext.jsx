import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, AlertTriangle, X, ShoppingBag, CalendarDays, AlertCircle } from 'lucide-react';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((text, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, text, type }]);
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <div className="w-6 h-6 rounded-full bg-success/15 flex items-center justify-center border border-success/30"><Check className="w-3.5 h-3.5 text-success" /></div>;
      case 'warning':
        return <div className="w-6 h-6 rounded-full bg-warning/15 flex items-center justify-center border border-warning/30"><AlertTriangle className="w-3.5 h-3.5 text-warning" /></div>;
      case 'error':
        return <div className="w-6 h-6 rounded-full bg-danger/10 flex items-center justify-center border border-danger/20"><AlertCircle className="w-3.5 h-3.5 text-danger" /></div>;
      case 'order':
        return <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20"><ShoppingBag className="w-3.5 h-3.5 text-primary" /></div>;
      case 'reservation':
        return <div className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center border border-secondary/20"><CalendarDays className="w-3.5 h-3.5 text-secondary" /></div>;
      default:
        return <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20"><Check className="w-3.5 h-3.5 text-primary" /></div>;
    }
  };

  const getBorderColor = (type) => {
    switch (type) {
      case 'success':
        return 'border-success/20 shadow-success/5';
      case 'warning':
        return 'border-warning/20 shadow-warning/5';
      case 'error':
        return 'border-danger/20 shadow-danger/5';
      case 'order':
        return 'border-primary/20 shadow-primary/5';
      case 'reservation':
        return 'border-secondary/20 shadow-secondary/5';
      default:
        return 'border-border-color shadow-black/40';
    }
  };

  return (
    <NotificationContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Overlay Container */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3.5 w-full max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 80, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.9 }}
              className={`pointer-events-auto p-4 rounded-xl border bg-[#111111]/85 backdrop-blur-lg shadow-xl flex items-start gap-3.5 text-left ${getBorderColor(toast.type)}`}
            >
              <div className="shrink-0">
                {getIcon(toast.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-primary-text leading-relaxed">
                  {toast.text}
                </p>
              </div>
              <button 
                onClick={() => removeToast(toast.id)}
                className="text-secondary-text/40 hover:text-primary-text transition-colors shrink-0 p-0.5 rounded-lg hover:bg-white/5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
