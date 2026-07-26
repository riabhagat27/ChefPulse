import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, Bell, Search, LogOut, ChevronDown, User, Sparkle,
  LayoutDashboard, UtensilsCrossed, CalendarDays, ClipboardList, 
  Settings, ChefHat, BarChart3, Users, MessageSquareCode, Layers
} from 'lucide-react';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Notifications placeholder data
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Order #4092 completed by Kitchen', time: '5m ago', unread: true },
    { id: 2, text: 'New booking: Table 4 (8:30 PM)', time: '12m ago', unread: true },
    { id: 3, text: 'Inventory Alert: White Truffle levels low', time: '1h ago', unread: false },
  ]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Sidebar items mapped by role
  const menuItems = user?.role === 'admin' 
    ? [
        { label: 'Dashboard', path: '/dashboard/admin', icon: LayoutDashboard },
        { label: 'Orders', path: '#orders', icon: ClipboardList },
        { label: 'Reservations', path: '#reservations', icon: CalendarDays },
        { label: 'Menu Management', path: '/dashboard/admin/menu', icon: UtensilsCrossed },
        { label: 'Inventory', path: '#inventory', icon: Layers },
        { label: 'Analytics', path: '#analytics', icon: BarChart3 },
        { label: 'Kitchen (KDS)', path: '/dashboard/kitchen', icon: ChefHat },
        { label: 'Customers', path: '#customers', icon: Users },
        { label: 'AI Assistant', path: '#ai', icon: MessageSquareCode },
        { label: 'Settings', path: '#settings', icon: Settings },
      ]
    : [
        { label: 'Dashboard', path: '/dashboard/customer', icon: LayoutDashboard },
        { label: 'Digital Menu', path: '/dashboard/customer/menu', icon: UtensilsCrossed },
        { label: 'Reservations', path: '#reservations', icon: CalendarDays },
        { label: 'Orders', path: '#orders', icon: ClipboardList },
        { label: 'Profile', path: '#profile', icon: User },
      ];

  const activeItem = menuItems.find(item => location.pathname === item.path) || menuItems[0];

  return (
    <div className="min-h-screen bg-background text-primary-text flex relative font-sans overflow-hidden">
      
      {/* 1. Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border-color bg-surface shrink-0 h-screen sticky top-0">
        {/* Monogram Monopole */}
        <div className="p-6 border-b border-border-color flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border border-primary flex items-center justify-center">
            <span className="text-[10px] font-serif font-bold text-primary tracking-tighter">CP</span>
          </div>
          <span className="text-sm font-serif font-semibold uppercase tracking-widest text-primary-text">
            Chef<span className="text-primary italic">Pulse</span>
          </span>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item, idx) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => {
                  if (item.path !== '#') navigate(item.path);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary/10 text-primary border-l-2 border-primary' 
                    : 'text-secondary-text hover:text-primary-text hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-secondary-text'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Footer Logout */}
        <div className="p-4 border-t border-border-color">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-danger hover:bg-danger/5 rounded-xl transition-all"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        
        {/* 2. Top Navbar */}
        <header className="h-20 border-b border-border-color bg-surface/50 backdrop-blur px-6 md:px-8 flex items-center justify-between sticky top-0 z-30 shrink-0">
          
          <div className="flex items-center gap-4">
            {/* Hamburger for mobile */}
            <button 
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-1.5 rounded-lg border border-border-color text-secondary-text hover:text-primary-text"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Context Workspace Info */}
            <div>
              <span className="text-[10px] uppercase tracking-widest text-secondary-text block">
                {user?.role === 'admin' ? 'Administration Console' : 'Premium Guest Workspace'}
              </span>
              <span className="text-sm font-serif font-semibold text-primary-text">
                {user?.role === 'admin' ? (user.restaurant_name || 'Bistro Workspace') : 'Table Reservation & Menu'}
              </span>
            </div>
          </div>

          {/* User controls / widgets */}
          <div className="flex items-center gap-4">
            
            {/* Search Widget */}
            <div className="hidden md:flex items-center gap-2 bg-background/50 border border-border-color px-3.5 py-2 rounded-xl text-xs text-secondary-text w-64 focus-within:border-primary/50 transition-all">
              <Search className="w-3.5 h-3.5" />
              <input 
                type="text" 
                placeholder="Search command or report..." 
                className="bg-transparent outline-none w-full placeholder:text-secondary-text/30"
              />
            </div>

            {/* Notification Bell + Dropdown */}
            <div className="relative">
              <button 
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setIsProfileOpen(false);
                }}
                className="p-2.5 rounded-xl border border-border-color bg-background/30 text-secondary-text hover:text-primary hover:border-primary/30 transition-all relative"
              >
                <Bell className="w-4 h-4" />
                {notifications.some(n => n.unread) && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
                )}
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-3 w-80 glass border border-border-color rounded-xl shadow-2xl p-4 space-y-3 z-50"
                  >
                    <div className="flex items-center justify-between border-b border-border-color pb-2">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-primary">Alerts Queue</span>
                      <button 
                        onClick={() => setNotifications(notifications.map(n => ({...n, unread: false})))}
                        className="text-[9px] uppercase tracking-widest text-secondary-text hover:text-primary"
                      >
                        Clear Unread
                      </button>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {notifications.map(notif => (
                        <div key={notif.id} className="p-2.5 rounded-lg bg-background/40 hover:bg-background/80 transition-colors text-left space-y-1">
                          <p className={`text-xs ${notif.unread ? 'text-primary-text font-medium' : 'text-secondary-text'}`}>{notif.text}</p>
                          <span className="text-[9px] text-secondary-text/50">{notif.time}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Avatar Trigger + Dropdown */}
            <div className="relative">
              <button 
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsNotificationsOpen(false);
                }}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-xl border border-border-color bg-background/30 text-secondary-text hover:text-primary hover:border-primary/30 transition-all"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center font-bold text-background text-xs">
                  {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="text-xs font-semibold text-primary-text hidden sm:block max-w-[100px] truncate">{user?.full_name}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-3 w-56 glass border border-border-color rounded-xl shadow-2xl p-2.5 space-y-1 z-50 text-left"
                  >
                    <div className="px-3.5 py-2 border-b border-border-color">
                      <div className="text-xs font-semibold text-primary-text">{user?.full_name}</div>
                      <div className="text-[10px] text-secondary-text truncate">{user?.email}</div>
                    </div>
                    <button className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-secondary-text hover:text-primary-text hover:bg-white/5 rounded-lg transition-colors">
                      <User className="w-4 h-4" /> Profile Info
                    </button>
                    <button className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-secondary-text hover:text-primary-text hover:bg-white/5 rounded-lg transition-colors">
                      <Settings className="w-4 h-4" /> Preferences
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-danger hover:bg-danger/5 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Logout session
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </header>

        {/* 3. Main Outlet wrapper */}
        <main className="flex-1 p-6 md:p-8 relative">
          <Outlet />
        </main>
      </div>

      {/* 4. Mobile Drawer Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black z-40 lg:hidden"
            />
            {/* Sidebar drawer content */}
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 left-0 w-64 bg-surface border-r border-border-color z-50 flex flex-col lg:hidden"
            >
              <div className="p-6 border-b border-border-color flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full border border-primary flex items-center justify-center">
                    <span className="text-[10px] font-serif font-bold text-primary tracking-tighter">CP</span>
                  </div>
                  <span className="text-sm font-serif font-semibold uppercase tracking-widest text-primary-text">
                    Chef<span className="text-primary italic">Pulse</span>
                  </span>
                </div>
                <button 
                  onClick={() => setIsMobileOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/5 text-secondary-text hover:text-primary-text"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
                {menuItems.map((item, idx) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setIsMobileOpen(false);
                        if (item.path !== '#') navigate(item.path);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                        isActive 
                          ? 'bg-primary/10 text-primary border-l-2 border-primary' 
                          : 'text-secondary-text hover:text-primary-text hover:bg-white/5'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-secondary-text'}`} />
                      {item.label}
                    </button>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-border-color">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-danger hover:bg-danger/5 rounded-xl transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
