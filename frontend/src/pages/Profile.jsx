import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Key, Save, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  
  // Local state
  const [fullName, setFullName] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setRestaurantName(user.restaurant_name || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password && password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        full_name: fullName.trim()
      };

      if (user?.role === 'admin') {
        payload.restaurant_name = restaurantName.trim();
      }

      if (password) {
        payload.password = password;
      }

      await api.put('/api/profile', payload);
      await refreshUser();
      
      setPassword('');
      setConfirmPassword('');
      toast.success('Profile details updated successfully.');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to update profile details.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 text-left font-sans max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <span className="text-xs uppercase tracking-widest text-primary font-bold">Personal Account</span>
        <h1 className="text-3xl sm:text-4xl font-serif font-light text-primary-text mt-1">
          Profile Settings
        </h1>
        <p className="text-xs text-secondary-text mt-1">
          Configure your personal name credentials, email identifiers, and passcodes.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg border border-danger/20 bg-danger/10 text-danger text-xs flex items-center gap-1.5 font-medium">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        
        {/* Core Profile Credentials */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-card p-6 border border-border-color bg-surface/30 space-y-4"
        >
          <div className="flex items-center gap-2 border-b border-border-color/30 pb-3">
            <User className="w-4 h-4 text-primary" />
            <h3 className="font-serif text-sm font-semibold text-primary-text">Profile Information</h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full name input */}
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-secondary-text font-bold">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-background/50 border border-border-color focus:border-primary/50 rounded-lg px-3 py-2 text-xs text-primary-text outline-none"
                />
              </div>

              {/* Email (Readonly) */}
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-secondary-text font-bold">Email Address (Readonly)</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full bg-surface border border-border-color rounded-lg px-3 py-2 text-xs text-secondary-text/50 outline-none cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Account role */}
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-secondary-text font-bold">Account Role</label>
                <span className="w-full inline-block bg-surface border border-border-color rounded-lg px-3 py-2 text-xs text-secondary-text/50 capitalize">
                  {user?.role}
                </span>
              </div>

              {/* Restaurant name (Admin only, editable) */}
              {user?.role === 'admin' && (
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-secondary-text font-bold">Restaurant Name</label>
                  <input
                    type="text"
                    required
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    className="w-full bg-background/50 border border-border-color focus:border-primary/50 rounded-lg px-3 py-2 text-xs text-primary-text outline-none"
                  />
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Change Password Panel */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-card p-6 border border-border-color bg-surface/30 space-y-4"
        >
          <div className="flex items-center gap-2 border-b border-border-color/30 pb-3">
            <Key className="w-4 h-4 text-secondary" />
            <h3 className="font-serif text-sm font-semibold text-primary-text">Modify Password (Optional)</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-widest text-secondary-text font-bold">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current"
                className="w-full bg-background/50 border border-border-color focus:border-primary/50 rounded-lg px-3 py-2 text-xs text-primary-text outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-widest text-secondary-text font-bold">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Leave blank to keep current"
                className="w-full bg-background/50 border border-border-color focus:border-primary/50 rounded-lg px-3 py-2 text-xs text-primary-text outline-none"
              />
            </div>
          </div>
        </motion.div>

        {/* Save button */}
        <div className="flex justify-end pt-2 shrink-0">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-[10px] uppercase tracking-widest font-bold text-background bg-gradient-to-r from-primary to-secondary hover:brightness-110 shadow-lg shadow-primary/20 border border-primary/20 disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                Save Changes
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
