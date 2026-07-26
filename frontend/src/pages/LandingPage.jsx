import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, 
  Package, 
  ChefHat, 
  Sparkles, 
  ArrowRight, 
  Play, 
  Twitter, 
  Linkedin,
  Github,
  Sparkle
} from 'lucide-react';
import Navbar from '../components/Navbar';
import DashboardIllustration from '../components/DashboardIllustration';

// Import generated luxury food/kitchen assets
import michelinDish from '../assets/michelin_dish.png';
import kitchenPrep from '../assets/kitchen_prep.png';

// Smooth Animated Counter component using native IntersectionObserver
function AnimatedCounter({ target, suffix = '', duration = 1500 }) {
  const [count, setCount] = useState(0);
  const [inView, setInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.unobserve(el);
      }
    }, { threshold: 0.1 });

    observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, []);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const end = parseInt(target, 10);
    if (isNaN(end)) return;
    
    const incrementTime = 30;
    const steps = duration / incrementTime;
    const increment = end / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(Math.floor(start));
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return (
    <span ref={ref} className="font-serif font-light text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
      {count}{suffix}
    </span>
  );
}

export default function LandingPage() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    }
  }, [location]);

  const featureItems = [
    {
      icon: ShoppingBag,
      title: 'Smart Order Flow',
      desc: 'Synchronize dining room bookings, VIP requests, and delivery lines into a singular, high-precision queue.',
      color: 'from-primary/10 to-transparent',
      iconColor: 'text-primary',
    },
    {
      icon: Package,
      title: 'Intelligent Inventory',
      desc: 'Automated stock and pantry tracking. Triggers ordering cycles for premium ingredients before supply depletes.',
      color: 'from-secondary/10 to-transparent',
      iconColor: 'text-secondary',
    },
    {
      icon: ChefHat,
      title: 'KDS Mastery',
      desc: 'Seamless kitchen display workflows that pace dishes based on live cooking speeds, ensuring synchronized plating.',
      color: 'from-primary/10 to-transparent',
      iconColor: 'text-primary',
    },
    {
      icon: Sparkles,
      title: 'Predictive Ordering',
      desc: 'AI modeling that forecasts seasonal guest volume, ingredient utilization, and optimal workforce scheduling.',
      color: 'from-secondary/10 to-transparent',
      iconColor: 'text-secondary',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-primary-text selection:bg-primary/20 selection:text-primary">
      <Navbar />

      {/* Hero Section - Luxury Fine Dining Style */}
      <section id="home" className="relative pt-44 pb-24 px-6 md:px-12 max-w-7xl mx-auto overflow-hidden">
        {/* Warm gold ambient glow backdrop */}
        <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-20 left-10 w-[300px] h-[300px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text details */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] uppercase tracking-widest font-semibold glass border border-primary/25 text-primary"
            >
              <Sparkle className="w-3 h-3 fill-primary animate-pulse" />
              <span>Modern Restaurant Operations Software</span>
            </motion.div>

            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="text-5xl sm:text-7xl font-serif font-light leading-[1.1] tracking-tight text-primary-text"
              >
                AI-Powered Restaurant <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-text to-secondary italic font-normal">
                  Operations Platform
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="text-base sm:text-lg text-secondary-text max-w-xl font-light leading-relaxed font-sans"
              >
                Manage orders, reservations, inventory and restaurant operations through one intelligent dashboard.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-wrap gap-5 pt-2"
            >
              <Link 
                to="/register" 
                className="text-xs uppercase tracking-widest font-semibold text-background bg-gradient-to-r from-primary to-secondary hover:brightness-110 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 px-8 py-4 rounded-xl text-center flex items-center justify-center"
              >
                Get Started
              </Link>
              <Link 
                to="/login" 
                className="flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-primary-text glass hover:bg-white/5 transition-colors px-8 py-4 rounded-xl border border-border-color justify-center"
              >
                <Play className="w-3.5 h-3.5 text-primary fill-primary" />
                View Cinema
              </Link>
            </motion.div>
          </div>

          {/* Right Cinematic Plating Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.3 }}
            className="lg:col-span-5 relative group"
          >
            {/* Soft gold frame glow */}
            <div className="absolute -inset-1 bg-gradient-to-tr from-primary to-secondary rounded-card opacity-20 blur-xl group-hover:opacity-35 transition duration-500" />
            <div className="relative rounded-card overflow-hidden border border-primary/20 aspect-[4/5] bg-surface">
              <img 
                src={michelinDish} 
                alt="Michelin Star Dish Plating" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
              
              {/* Floating Monogram Label */}
              <div className="absolute bottom-6 left-6 right-6 p-4 glass rounded-xl border border-primary/10 flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-sm font-semibold text-primary-text tracking-wide">Signature Plating</h4>
                  <p className="text-[10px] uppercase tracking-widest text-secondary-text">Automated Temperature Control</p>
                </div>
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center border border-primary/35">
                  <Sparkle className="w-3.5 h-3.5 text-primary" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Alternating Cinematic Section 1 - Chef Prep */}
      <section id="about" className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-border-color">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Image Left */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-5 relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-tr from-secondary to-primary rounded-card opacity-10 blur-xl" />
            <div className="relative rounded-card overflow-hidden border border-border-color aspect-[4/3] bg-surface">
              <img 
                src={kitchenPrep} 
                alt="Chef Preparing Food in Kitchen" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
            </div>
          </motion.div>

          {/* Text Right */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <span className="text-[10px] uppercase tracking-widest text-primary font-bold">Precision Performance</span>
            <h2 className="text-3xl sm:text-5xl font-serif font-light tracking-tight">
              Synchronized Kitchen Operations
            </h2>
            <p className="text-secondary-text text-base leading-relaxed font-light font-sans">
              Coordinate recipes, cook times, and line stations in absolute synchronicity. ChefPulse KDS routes ticketing with intelligent priority, ensuring every dish is prepared accurately and served fresh.
            </p>
            <div className="pt-2">
              <a 
                href="#features" 
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-semibold text-primary hover:underline"
              >
                Explore KDS Operations <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Alternating Cinematic Section 2 - Michelin Dish */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-border-color">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Text Left */}
          <div className="lg:col-span-7 space-y-6 text-left order-2 lg:order-1">
            <span className="text-[10px] uppercase tracking-widest text-secondary font-bold">Waste Reduction AI</span>
            <h2 className="text-3xl sm:text-5xl font-serif font-light tracking-tight">
              Data-Driven Operational Control
            </h2>
            <p className="text-secondary-text text-base leading-relaxed font-light font-sans">
              Minimize food waste and maximize margins without compromising quality. ChefPulse’s predictive models forecast seasonal ingredient demand, automated inventory orders, and optimal staff hours.
            </p>
            <div className="pt-2">
              <a 
                href="#features" 
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-semibold text-primary hover:underline"
              >
                Explore AI Telemetry <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Image Right */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-5 relative group order-1 lg:order-2"
          >
            <div className="absolute -inset-1 bg-gradient-to-tr from-primary to-secondary rounded-card opacity-10 blur-xl" />
            <div className="relative rounded-card overflow-hidden border border-border-color aspect-[4/3] bg-surface">
              <img 
                src={michelinDish} 
                alt="Culinary Creation Closeup" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="py-24 px-6 md:px-12 bg-surface/30 border-y border-border-color relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/5 rounded-full blur-[140px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-[10px] uppercase tracking-widest text-primary font-bold">The Live Operations Dashboard</span>
            <h2 className="text-3xl sm:text-5xl font-serif font-light tracking-tight">
              Restaurant Operations Dashboard
            </h2>
            <p className="text-secondary-text text-sm sm:text-base font-light">
              Designed specifically for high-pressure hospitality atmospheres, combining aesthetic elegance with real-time operational efficiency.
            </p>
          </div>

          <div className="relative">
            <DashboardIllustration />
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="features" className="py-24 px-6 md:px-12 max-w-7xl mx-auto relative">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-[10px] uppercase tracking-widest text-secondary font-bold">Curated Features</span>
          <h2 className="text-3xl sm:text-5xl font-serif font-light tracking-tight">
            Crafted for Extraordinary Establishments
          </h2>
          <p className="text-secondary-text text-sm sm:text-base font-light">
            Each interface is crafted with precision to match the excellence of your dining experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featureItems.map((feature, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -6, borderColor: 'rgba(212, 175, 55, 0.35)' }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="glass-card rounded-card p-8 border border-border-color transition-all duration-300 relative overflow-hidden group flex flex-col justify-between"
            >
              {/* Gold gradient accent on hover */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${feature.color} opacity-20 blur-2xl group-hover:scale-125 transition-transform duration-500`} />
              
              <div className="space-y-6">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-border-color">
                  <feature.icon className={`w-5 h-5 ${feature.iconColor}`} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-serif font-semibold text-primary-text">{feature.title}</h3>
                  <p className="text-secondary-text text-sm leading-relaxed font-light">{feature.desc}</p>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-border-color flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-primary font-bold cursor-pointer hover:underline">
                Request Specifications <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 border-t border-border-color relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { val: '1000', suffix: '+', label: 'Covers Served' },
              { val: '98', suffix: '%', label: 'Guest Sentiment' },
              { val: '50', suffix: '+', label: 'Fine Establishments' },
              { val: '24', suffix: '/7', label: 'AI Monitoring' },
            ].map((stat, idx) => (
              <div key={idx} className="space-y-3 p-6 glass border border-border-color rounded-2xl">
                <div className="text-3xl sm:text-5xl font-serif font-light tracking-tight text-primary">
                  {stat.suffix === '/7' ? (
                    <>
                      <AnimatedCounter target={stat.val} />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">/7</span>
                    </>
                  ) : (
                    <AnimatedCounter target={stat.val} suffix={stat.suffix} />
                  )}
                </div>
                <div className="text-[10px] uppercase tracking-widest font-semibold text-secondary-text">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call To Action - Michelin Star Invitation look */}
      <section id="contact" className="py-24 px-6 md:px-12 max-w-5xl mx-auto text-center relative">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="glass-card rounded-card p-10 md:p-16 border border-primary/20 relative overflow-hidden space-y-8">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
          
          <span className="text-[10px] uppercase tracking-widest text-primary font-bold">Limited Enrollment</span>
          <h2 className="text-3xl sm:text-5xl font-serif font-light tracking-tight leading-tight">
            Ready to Elevate Your Establishment?
          </h2>
          <p className="text-secondary-text text-sm sm:text-base max-w-xl mx-auto font-light">
            Acquire access to ChefPulse operational intelligence. Elevate guest satisfaction, coordinate kitchen timings, and secure profitability metrics.
          </p>
          
          <div className="pt-4 flex justify-center">
            <Link 
              to="/register" 
              className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-background bg-gradient-to-r from-primary to-secondary hover:brightness-110 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 px-8 py-4 rounded-xl justify-center text-center"
            >
              Launch ChefPulse Console
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface/80 border-t border-border-color py-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5 cursor-pointer">
            <div className="w-8 h-8 rounded-full border border-primary flex items-center justify-center">
              <span className="text-[10px] font-serif font-bold text-primary tracking-tighter">CP</span>
            </div>
            <span className="text-base font-serif font-medium uppercase tracking-widest text-primary-text">
              Chef<span className="text-primary italic">Pulse</span>
            </span>
          </div>

          <p className="text-xs text-secondary-text font-light">
            © {new Date().getFullYear()} ChefPulse Inc. All rights reserved. Fine-dining software excellence.
          </p>

          <div className="flex items-center gap-4">
            <a href="#" className="p-2.5 rounded-full bg-[#1A1A1A] border border-border-color text-secondary-text hover:text-primary hover:bg-white/5 transition-all duration-300">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#" className="p-2.5 rounded-full bg-[#1A1A1A] border border-border-color text-secondary-text hover:text-primary hover:bg-white/5 transition-all duration-300">
              <Linkedin className="w-4 h-4" />
            </a>
            <a href="#" className="p-2.5 rounded-full bg-[#1A1A1A] border border-border-color text-secondary-text hover:text-primary hover:bg-white/5 transition-all duration-300">
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
