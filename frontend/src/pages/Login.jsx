import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Sparkle, ArrowRight, Eye, EyeOff, X, KeyRound, Mail } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Login() {
  const { login, setUser } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // OTP Login states
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpStep, setOtpStep] = useState(1); // 1 = enter email, 2 = enter otp
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Cooldown timer effect
  useEffect(() => {
    let timer = null;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userProfile = await login(email, password);
      if (userProfile.role === 'admin') {
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

  const handleRequestOTP = async (e) => {
    if (e) e.preventDefault();
    setOtpError('');
    setOtpLoading(true);
    try {
      const res = await api.post('/api/otp/request', { email: otpEmail });
      toast.success('Dispatched secure 6-digit OTP to your inbox!', { duration: 5000 });
      // For convenience in testing local setups, display OTP in a toast info
      if (res.data.otp_preview) {
        toast(`[TEST MODE] Generated OTP: ${res.data.otp_preview}`, { icon: '🔑', duration: 8000 });
      }
      setOtpStep(2);
      setCooldown(60);
    } catch (err) {
      setOtpError(err.response?.data?.detail || 'Failed to dispatch verification code.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setOtpError('');
    setOtpLoading(true);
    try {
      const res = await api.post('/api/otp/verify', { email: otpEmail, otp: otpCode });
      const { access_token, user: userProfile } = res.data;
      localStorage.setItem('token', access_token);
      setUser(userProfile);
      toast.success(`Welcome back, ${userProfile.full_name}!`);
      setShowOTPModal(false);
      if (userProfile.role === 'admin') {
        navigate('/dashboard/admin');
      } else {
        navigate('/dashboard/customer');
      }
    } catch (err) {
      setOtpError(err.response?.data?.detail || 'Verification code invalid or expired.');
    } finally {
      setOtpLoading(false);
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

            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 text-xs uppercase tracking-widest font-semibold text-background bg-gradient-to-r from-primary to-secondary hover:brightness-110 shadow-lg shadow-primary/10 transition-all duration-300 py-4 rounded-xl disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setError('');
                  setOtpError('');
                  setOtpEmail(email);
                  setOtpCode('');
                  setOtpStep(1);
                  setShowOTPModal(true);
                }}
                className="w-full flex items-center justify-center gap-2 text-xs uppercase tracking-widest font-semibold border border-border-color hover:bg-white/5 transition-all duration-300 py-3.5 rounded-xl text-primary-text cursor-pointer"
              >
                <KeyRound className="w-4 h-4 text-primary" />
                Login with OTP
              </button>
            </div>
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

      {/* OTP Login Dialog Modal */}
      <AnimatePresence>
        {showOTPModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowOTPModal(false)}
              className="absolute inset-0 bg-black"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md glass border border-border-color rounded-card p-8 shadow-2xl bg-background/95 text-left z-10"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-primary" />
                  <h3 className="font-serif text-lg font-semibold text-primary-text">
                    OTP Authentication
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowOTPModal(false)}
                  className="p-1 rounded-lg hover:bg-white/5 text-secondary-text"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {otpError && (
                <div className="mb-4 p-3 rounded-lg border border-danger/20 bg-danger/10 text-danger text-xs text-center font-medium">
                  {otpError}
                </div>
              )}

              {otpStep === 1 ? (
                /* Step 1: Request OTP email entry */
                <form onSubmit={handleRequestOTP} className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-widest text-secondary-text font-bold">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-text/40" />
                      <input
                        type="email"
                        required
                        value={otpEmail}
                        onChange={(e) => setOtpEmail(e.target.value)}
                        placeholder="name@restaurant.com"
                        className="w-full bg-surface/50 border border-border-color focus:border-primary/50 rounded-xl pl-10 pr-4 py-3 text-xs text-primary-text outline-none transition-all"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={otpLoading}
                    className="w-full flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-background bg-gradient-to-r from-primary to-secondary hover:brightness-110 shadow-lg shadow-primary/20 py-3 rounded-xl border border-primary/20 disabled:opacity-50 cursor-pointer"
                  >
                    {otpLoading ? 'Generating...' : 'Send OTP Code'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                /* Step 2: Verification of generated OTP */
                <form onSubmit={handleVerifyOTP} className="space-y-4 text-xs">
                  <p className="text-[11px] text-secondary-text leading-relaxed">
                    A secure verification code has been dispatched to <span className="text-primary-text font-semibold">{otpEmail}</span>.
                  </p>
                  
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-widest text-secondary-text font-bold">Verification Code (6-digit)</label>
                    <input
                      type="text"
                      maxLength="6"
                      required
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 123456"
                      className="w-full bg-surface/50 border border-border-color focus:border-primary/50 rounded-xl px-4 py-3 text-center text-sm font-mono tracking-[0.4em] font-bold text-primary-text outline-none transition-all placeholder:tracking-normal placeholder:font-normal"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={otpLoading}
                      className="flex-1 flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-background bg-gradient-to-r from-primary to-secondary hover:brightness-110 shadow-lg py-3 rounded-xl cursor-pointer"
                    >
                      {otpLoading ? 'Verifying...' : 'Verify & Log In'}
                    </button>
                    <button
                      type="button"
                      disabled={cooldown > 0 || otpLoading}
                      onClick={handleRequestOTP}
                      className="px-4 py-3 border border-border-color hover:bg-white/5 rounded-xl text-[10px] uppercase tracking-widest font-bold text-secondary-text disabled:opacity-50 cursor-pointer"
                    >
                      {cooldown > 0 ? `Resend (${cooldown}s)` : 'Resend'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
