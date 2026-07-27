import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, Bell, Search, LogOut, ChevronDown, User, Sparkle,
  LayoutDashboard, UtensilsCrossed, CalendarDays, ClipboardList, 
  Settings, ChefHat, BarChart3, Users, MessageSquareCode, Layers
} from 'lucide-react';
import api from '../services/api';
import useWebSocket from '../hooks/useWebSocket';
import { useNotification } from '../context/NotificationContext';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Persistent SQLite Notifications
  const [notifications, setNotifications] = useState([]);
  const [notifFilter, setNotifFilter] = useState('all'); // 'all' | 'unread'

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/api/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Error fetching notifications telemetry:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // Connect live events to websocket broadcast
  useWebSocket((data) => {
    if (data.event === 'notification_created') {
      fetchNotifications();
    }
    if (data.event === 'new_notification') {
      if (data.role === 'admin' && user?.role === 'admin') {
        showToast(data.text, data.type);
      } else if (data.role === 'customer' && data.customer_id === user?.id) {
        showToast(data.text, data.type);
      }
    }
  });

  const handleClearNotifications = async () => {
    try {
      await api.put('/api/notifications/read');
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkSingleRead = async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const formatRelativeTime = (dateString) => {
    const diff = new Date() - new Date(dateString);
    const secs = Math.floor(diff / 1000);
    if (secs < 60) return 'Just now';
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Sidebar items mapped by role
  const menuItems = user?.role === 'admin' 
    ? [
        { label: 'Dashboard', path: '/dashboard/admin', icon: LayoutDashboard },
        { label: 'Orders', path: '/dashboard/admin/orders', icon: ClipboardList },
        { label: 'Reservations', path: '/dashboard/admin/reservations', icon: CalendarDays },
        { label: 'Menu Management', path: '/dashboard/admin/menu', icon: UtensilsCrossed },
        { label: 'Inventory', path: '/dashboard/admin/inventory', icon: Layers },
        { label: 'Analytics', path: '/dashboard/admin/analytics', icon: BarChart3 },
        { label: 'Kitchen (KDS)', path: '/dashboard/kitchen', icon: ChefHat },
        { label: 'Customers', path: '/dashboard/admin/customers', icon: Users },
        { label: 'AI Assistant', path: '/dashboard/admin/assistant', icon: MessageSquareCode },
        { label: 'Settings', path: '/dashboard/admin/settings', icon: Settings },
      ]
    : [
        { label: 'Dashboard', path: '/dashboard/customer', icon: LayoutDashboard },
        { label: 'Digital Menu', path: '/dashboard/customer/menu', icon: UtensilsCrossed },
        { label: 'Reservations', path: '/dashboard/customer', icon: CalendarDays },
        { label: 'Orders', path: '/dashboard/customer/orders', icon: ClipboardList },
        { label: 'AI Assistant', path: '/dashboard/customer/assistant', icon: MessageSquareCode },
        { label: 'Profile', path: '/dashboard/profile', icon: User },
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
                className="p-2.5 rounded-xl border border-border-color bg-background/30 text-secondary-text hover:text-primary hover:border-primary/30 transition-all relative cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {notifications.filter(n => n.unread).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-background font-bold text-[8px] h-4 w-4 rounded-full flex items-center justify-center border border-background shadow-md">
                    {notifications.filter(n => n.unread).length}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-3 w-80 glass border border-border-color rounded-xl shadow-2xl p-4 space-y-3 z-50 bg-background/95"
                  >
                    <div className="flex items-center justify-between border-b border-border-color pb-2 text-xs">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-primary">Alerts Queue</span>
                      <button 
                        onClick={handleClearNotifications}
                        className="text-[9px] uppercase tracking-widest text-secondary-text hover:text-primary font-bold transition-colors cursor-pointer"
                      >
                        Mark All as Read
                      </button>
                    </div>

                    {/* Filter Tabs (all vs unread) */}
                    <div className="flex gap-2 p-0.5 rounded-lg bg-surface/50 border border-white/5">
                      <button
                        type="button"
                        onClick={() => setNotifFilter('all')}
                        className={`flex-1 py-1 rounded text-[9px] uppercase font-bold tracking-wider transition-all cursor-pointer ${
                          notifFilter === 'all'
                            ? 'bg-primary text-background'
                            : 'text-secondary-text hover:text-primary-text'
                        }`}
                      >
                        All
                      </button>
                      <button
                        type="button"
                        onClick={() => setNotifFilter('unread')}
                        className={`flex-1 py-1 rounded text-[9px] uppercase font-bold tracking-wider transition-all cursor-pointer ${
                          notifFilter === 'unread'
                            ? 'bg-primary text-background'
                            : 'text-secondary-text hover:text-primary-text'
                        }`}
                      >
                        Unread ({notifications.filter(n => n.unread).length})
                      </button>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {notifications.filter(n => notifFilter === 'all' || n.unread).length === 0 ? (
                        <div className="py-8 text-center text-[10px] text-secondary-text/40 uppercase tracking-wider">No alerts in queue</div>
                      ) : (
                        notifications
                          .filter(n => notifFilter === 'all' || n.unread)
                          .map(notif => (
                            <div 
                              key={notif.id} 
                              onClick={() => handleMarkSingleRead(notif.id)}
                              className={`p-2.5 rounded-lg border transition-all text-left space-y-1 cursor-pointer ${
                                notif.unread 
                                  ? 'bg-surface border-primary/20 hover:border-primary/45' 
                                  : 'bg-surface/50 border-white/5 opacity-60 hover:opacity-100'
                              }`}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <p className={`text-xs leading-normal ${notif.unread ? 'text-primary-text font-semibold' : 'text-secondary-text'}`}>
                                  {notif.text}
                                </p>
                                {notif.unread && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1" />
                                )}
                              </div>
                              <span className="text-[9px] text-secondary-text/50 block">
                                {formatRelativeTime(notif.created_at)}
                              </span>
                            </div>
                          ))
                      )}
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
                    className="absolute right-0 mt-3 w-56 glass border border-border-color rounded-xl shadow-2xl p-2.5 space-y-1 z-50 text-left bg-background/95"
                  >
                    <div className="px-3.5 py-2 border-b border-border-color">
                      <div className="text-xs font-semibold text-primary-text">{user?.full_name}</div>
                      <div className="text-[10px] text-secondary-text truncate">{user?.email}</div>
                    </div>
                    <button 
                      onClick={() => {
                        setIsProfileOpen(false);
                        navigate('/dashboard/profile');
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-secondary-text hover:text-primary-text hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <User className="w-4 h-4" /> Profile Info
                    </button>
                    <button 
                      onClick={() => {
                        setIsProfileOpen(false);
                        navigate('/dashboard/admin/settings');
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-secondary-text hover:text-primary-text hover:bg-white/5 rounded-lg transition-colors"
                    >
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
