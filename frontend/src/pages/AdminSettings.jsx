import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Shield, Sliders, ToggleLeft, ToggleRight, Check, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const [restName, setRestName] = useState('ChefPulse Bistro & Lounge');
  const [restLocation, setRestLocation] = useState('45 Rockefeller Plaza, New York, NY');
  const [seatingCapacity, setSeatingCapacity] = useState('45');
  const [maxGuests, setMaxGuests] = useState('12');
  const [autoConfirm, setAutoConfirm] = useState(false);
  const [kdsNotification, setKdsNotification] = useState(true);

  // Load from localStorage on load if exists
  useEffect(() => {
    const savedName = localStorage.getItem('cp_rest_name');
    const savedLoc = localStorage.getItem('cp_rest_loc');
    const savedCap = localStorage.getItem('cp_seating_cap');
    const savedMax = localStorage.getItem('cp_max_guests');
    const savedConfirm = localStorage.getItem('cp_auto_confirm');
    const savedKds = localStorage.getItem('cp_kds_notif');

    if (savedName) setRestName(savedName);
    if (savedLoc) setRestLocation(savedLoc);
    if (savedCap) setSeatingCapacity(savedCap);
    if (savedMax) setMaxGuests(savedMax);
    if (savedConfirm) setAutoConfirm(savedConfirm === 'true');
    if (savedKds) setKdsNotification(savedKds === 'true');
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('cp_rest_name', restName);
    localStorage.setItem('cp_rest_loc', restLocation);
    localStorage.setItem('cp_seating_cap', seatingCapacity);
    localStorage.setItem('cp_max_guests', maxGuests);
    localStorage.setItem('cp_auto_confirm', autoConfirm.toString());
    localStorage.setItem('cp_kds_notif', kdsNotification.toString());

    toast.success('System preferences saved successfully.');
  };

  return (
    <div className="space-y-8 text-left font-sans max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <span className="text-xs uppercase tracking-widest text-primary font-bold">Preferences Console</span>
        <h1 className="text-3xl sm:text-4xl font-serif font-light text-primary-text mt-1">
          System Settings
        </h1>
        <p className="text-xs text-secondary-text mt-1">
          Configure restaurant metadata details, reservation limits, notifications toggles, and assistant behaviors.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        
        {/* Section 1: Restaurant info */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-card p-6 border border-border-color bg-surface/30 space-y-4"
        >
          <div className="flex items-center gap-2 border-b border-border-color/30 pb-3">
            <Sliders className="w-4 h-4 text-primary" />
            <h3 className="font-serif text-sm font-semibold text-primary-text">Restaurant Details</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-widest text-secondary-text font-bold">Restaurant Display Name</label>
              <input
                type="text"
                required
                value={restName}
                onChange={(e) => setRestName(e.target.value)}
                className="w-full bg-background/50 border border-border-color focus:border-primary/50 rounded-lg px-3 py-2 text-xs text-primary-text outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-widest text-secondary-text font-bold">Valet Location Address</label>
              <input
                type="text"
                required
                value={restLocation}
                onChange={(e) => setRestLocation(e.target.value)}
                className="w-full bg-background/50 border border-border-color focus:border-primary/50 rounded-lg px-3 py-2 text-xs text-primary-text outline-none"
              />
            </div>
          </div>
        </motion.div>

        {/* Section 2: Seating & Reservations */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-card p-6 border border-border-color bg-surface/30 space-y-4"
        >
          <div className="flex items-center gap-2 border-b border-border-color/30 pb-3">
            <Shield className="w-4 h-4 text-secondary" />
            <h3 className="font-serif text-sm font-semibold text-primary-text">Seating & Reservation Limits</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-widest text-secondary-text font-bold">Total Dining Tables</label>
              <input
                type="number"
                required
                value={seatingCapacity}
                onChange={(e) => setSeatingCapacity(e.target.value)}
                className="w-full bg-background/50 border border-border-color focus:border-primary/50 rounded-lg px-3 py-2 text-xs text-primary-text outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-widest text-secondary-text font-bold">Max Guests per Booking</label>
              <input
                type="number"
                required
                value={maxGuests}
                onChange={(e) => setMaxGuests(e.target.value)}
                className="w-full bg-background/50 border border-border-color focus:border-primary/50 rounded-lg px-3 py-2 text-xs text-primary-text outline-none"
              />
            </div>
          </div>
        </motion.div>

        {/* Section 3: Switches toggles */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-card p-6 border border-border-color bg-surface/30 space-y-4"
        >
          <div className="flex items-center gap-2 border-b border-border-color/30 pb-3">
            <Settings className="w-4 h-4 text-warning" />
            <h3 className="font-serif text-sm font-semibold text-primary-text">General Toggles</h3>
          </div>

          <div className="space-y-4">
            {/* Auto confirm reservations */}
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-primary-text text-xs">Auto-Confirm Bookings</span>
                <p className="text-[10px] text-secondary-text font-light">Automatically confirm incoming table requests if tables are free.</p>
              </div>
              <button
                type="button"
                onClick={() => setAutoConfirm(!autoConfirm)}
                className="text-secondary hover:text-primary transition-colors focus:outline-none"
              >
                {autoConfirm ? (
                  <ToggleRight className="w-8 h-8 text-primary" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-secondary-text/40" />
                )}
              </button>
            </div>

            {/* KDS Alerts */}
            <div className="flex items-center justify-between border-t border-border-color/30 pt-3">
              <div>
                <span className="font-semibold text-primary-text text-xs">KDS Sound Alerts</span>
                <p className="text-[10px] text-secondary-text font-light">Play warning chime sounds inside the kitchen panel on new order entries.</p>
              </div>
              <button
                type="button"
                onClick={() => setKdsNotification(!kdsNotification)}
                className="text-secondary hover:text-primary transition-colors focus:outline-none"
              >
                {kdsNotification ? (
                  <ToggleRight className="w-8 h-8 text-primary" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-secondary-text/40" />
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Submit */}
        <div className="flex justify-end pt-2 shrink-0">
          <button
            type="submit"
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-[10px] uppercase tracking-widest font-bold text-background bg-gradient-to-r from-primary to-secondary hover:brightness-110 shadow-lg shadow-primary/20 border border-primary/20"
          >
            <Save className="w-3.5 h-3.5" />
            Save Preferences
          </button>
        </div>

      </form>
    </div>
  );
}
