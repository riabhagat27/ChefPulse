import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Sparkle, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'admin') {
        navigate('/dashboard/admin');
      } else {
        navigate('/dashboard/customer');
      }
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative luxury backgrounds */}
      <div className="absolute top-20 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-[300px] h-[300px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Monogram header */}
        <div className="text-center mb-8 space-y-3">
          <Link to="/" className="inline-flex items-center gap-2 cursor-pointer group justify-center">
            <div className="w-8 h-8 rounded-full border border-primary flex items-center justify-center transition-transform duration-500 group-hover:rotate-180">
              <span className="text-[10px] font-serif font-bold text-primary tracking-tighter">CP</span>
            </div>
            <span className="text-lg font-serif font-medium uppercase tracking-widest text-primary-text">
              Chef<span className="text-primary italic font-semibold">Pulse</span>
            </span>
          </Link>
          <h2 className="text-3xl font-serif font-light text-primary-text">Welcome Back</h2>
          <p className="text-xs text-secondary-text font-light tracking-wide">
            Enter your credentials to access the management console
          </p>
        </div>

        {/* Login form card */}
        <div className="glass-card rounded-card p-8 border border-border-color shadow-2xl relative">
          {error && (
            <div className="mb-4 p-3 rounded-lg border border-danger/20 bg-danger/10 text-danger text-xs text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] uppercase tracking-widest text-secondary-text font-semibold">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@restaurant.com"
                className="w-full bg-background/50 border border-border-color focus:border-primary/50 rounded-xl px-4 py-3 text-sm text-primary-text outline-none placeholder:text-secondary-text/30 transition-all font-sans"
              />
            </div>

            <div className="space-y-1.5 text-left relative">
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
                  className="w-full bg-background/50 border border-border-color focus:border-primary/50 rounded-xl pl-4 pr-12 py-3 text-sm text-primary-text outline-none placeholder:text-secondary-text/30 transition-all font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-text/50 hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 text-xs uppercase tracking-widest font-semibold text-background bg-gradient-to-r from-primary to-secondary hover:brightness-110 shadow-lg shadow-primary/10 transition-all duration-300 py-4 rounded-xl disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Link to Register */}
        <p className="text-center mt-6 text-xs text-secondary-text font-light">
          New to ChefPulse?{' '}
          <Link to="/register" className="text-primary font-semibold hover:underline">
            Request an Invitation
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
