import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Eye, EyeOff, User, Building } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('customer'); // 'customer' or 'admin'
  const [restaurantName, setRestaurantName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (role === 'admin' && !restaurantName.trim()) {
      setError('Restaurant name is required for administrators');
      return;
    }

    setLoading(true);

    try {
      await register(fullName, email, password, confirmPassword, role, restaurantName);
      setSuccess('Account registered successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Registration failed. Please check input parameters.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Decorative luxury backdrops */}
      <div className="absolute top-20 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-[300px] h-[300px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg"
      >
        {/* Logo Monogram */}
        <div className="text-center mb-8 space-y-3">
          <Link to="/" className="inline-flex items-center gap-2 cursor-pointer group justify-center">
            <div className="w-8 h-8 rounded-full border border-primary flex items-center justify-center transition-transform duration-500 group-hover:rotate-180">
              <span className="text-[10px] font-serif font-bold text-primary tracking-tighter">CP</span>
            </div>
            <span className="text-lg font-serif font-medium uppercase tracking-widest text-primary-text">
              Chef<span className="text-primary italic font-semibold">Pulse</span>
            </span>
          </Link>
          <h2 className="text-3xl font-serif font-light text-primary-text">Create Account</h2>
          <p className="text-xs text-secondary-text font-light tracking-wide">
            Enroll your establishment or sign up as a premium guest
          </p>
        </div>

        {/* Register Form Card */}
        <div className="glass-card rounded-card p-8 border border-border-color shadow-2xl relative">
          {error && (
            <div className="mb-4 p-3 rounded-lg border border-danger/20 bg-danger/10 text-danger text-xs text-center font-medium">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 rounded-lg border border-success/20 bg-success/10 text-success text-xs text-center font-medium">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selection Switch */}
            <div className="space-y-2 text-left">
              <label className="text-[10px] uppercase tracking-widest text-secondary-text font-semibold">
                Select Profile Role
              </label>
              <div className="grid grid-cols-2 gap-3 bg-background/50 p-1.5 rounded-xl border border-border-color">
                <button
                  type="button"
                  onClick={() => { setRole('customer'); setError(''); }}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                    role === 'customer'
                      ? 'bg-gradient-to-r from-primary to-secondary text-background shadow-md'
                      : 'text-secondary-text hover:text-primary-text'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  Guest / Customer
                </button>
                <button
                  type="button"
                  onClick={() => { setRole('admin'); setError(''); }}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                    role === 'admin'
                      ? 'bg-gradient-to-r from-primary to-secondary text-background shadow-md'
                      : 'text-secondary-text hover:text-primary-text'
                  }`}
                >
                  <Building className="w-3.5 h-3.5" />
                  Restaurant Admin
                </button>
              </div>
            </div>

            {/* Common Inputs */}
            <div className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] uppercase tracking-widest text-secondary-text font-semibold">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alexander Mercer"
                  className="w-full bg-background/50 border border-border-color focus:border-primary/50 rounded-xl px-4 py-3 text-sm text-primary-text outline-none placeholder:text-secondary-text/30 transition-all font-sans"
                />
              </div>

              {/* Dynamic Restaurant Name Input for Admin */}
              <AnimatePresence>
                {role === 'admin' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-1.5 text-left overflow-hidden"
                  >
                    <label className="text-[10px] uppercase tracking-widest text-secondary-text font-semibold">
                      Restaurant Name
                    </label>
                    <input
                      type="text"
                      required
                      value={restaurantName}
                      onChange={(e) => setRestaurantName(e.target.value)}
                      placeholder="L'Ambroisie NY"
                      className="w-full bg-background/50 border border-border-color focus:border-primary/50 rounded-xl px-4 py-3 text-sm text-primary-text outline-none placeholder:text-secondary-text/30 transition-all font-sans"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] uppercase tracking-widest text-secondary-text font-semibold">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alexander@mercer.com"
                  className="w-full bg-background/50 border border-border-color focus:border-primary/50 rounded-xl px-4 py-3 text-sm text-primary-text outline-none placeholder:text-secondary-text/30 transition-all font-sans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] uppercase tracking-widest text-secondary-text font-semibold">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-background/50 border border-border-color focus:border-primary/50 rounded-xl pl-4 pr-10 py-3 text-sm text-primary-text outline-none placeholder:text-secondary-text/30 transition-all font-sans"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-text/50 hover:text-primary transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] uppercase tracking-widest text-secondary-text font-semibold">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-background/50 border border-border-color focus:border-primary/50 rounded-xl px-4 py-3 text-sm text-primary-text outline-none placeholder:text-secondary-text/30 transition-all font-sans"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 text-xs uppercase tracking-widest font-semibold text-background bg-gradient-to-r from-primary to-secondary hover:brightness-110 shadow-lg shadow-primary/10 transition-all duration-300 py-4 rounded-xl disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Register Profile'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Access Login */}
        <p className="text-center mt-6 text-xs text-secondary-text font-light">
          Already registered?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Sign In Here
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
