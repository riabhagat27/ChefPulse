import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { ShoppingBag, CalendarDays, UtensilsCrossed, Clock, ChevronRight, Check } from 'lucide-react';
import api from '../services/api';
import useWebSocket from '../hooks/useWebSocket';
import toast from 'react-hot-toast';

export default function CustomerDashboard() {
  const { user } = useAuth();

  // Orders State
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Reservations State
  const [reservations, setReservations] = useState([]);
  const [resLoading, setResLoading] = useState(true);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingGuests, setBookingGuests] = useState(2);
  const [specialRequest, setSpecialRequest] = useState('');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);

  // Recommendations State
  const [recs, setRecs] = useState(null);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/api/orders');
      setOrders(res.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReservations = async () => {
    try {
      const res = await api.get('/api/reservations');
      setReservations(res.data);
    } catch (err) {
      console.error('Error fetching reservations:', err);
    } finally {
      setResLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const res = await api.get('/api/recommendations');
      setRecs(res.data);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchReservations();
    fetchRecommendations();
  }, []);

  // Listen to live updates from WebSocket connection
  useWebSocket((data) => {
    if (data.event === 'order_status_updated' && data.customer_id === user?.id) {
      fetchOrders();
      fetchRecommendations(); // Refresh recommendation matrices
      if (data.status === 'Accepted') {
        toast.success("Your order has been accepted.");
      } else if (data.status === 'Preparing') {
        toast("Your order is now being prepared.", { icon: '🟡' });
      } else if (data.status === 'Ready') {
        toast.success("Your order is ready.", { icon: '🔵' });
      } else if (data.status === 'Completed') {
        toast.success("Your order has been served.", { icon: '🟢' });
      } else if (data.status === 'Cancelled') {
        toast.error("Your order has been cancelled.", { icon: '🔴' });
      }
    } else if (data.event === 'reservation_status_updated' && data.customer_id === user?.id) {
      fetchReservations();
      if (data.status === 'Confirmed') {
        toast.success("Your reservation has been confirmed.");
      } else if (data.status === 'Cancelled') {
        toast.error("Your reservation has been cancelled.");
      }
    }
  });

  const handleBookTable = async (e) => {
    e.preventDefault();
    if (!bookingDate || !bookingTime) {
      alert('Please specify date and time inputs.');
      return;
    }
    setBookingSubmitting(true);
    try {
      const payload = {
        reservation_date: bookingDate,
        reservation_time: bookingTime,
        guests: parseInt(bookingGuests),
        special_request: specialRequest.trim() || null
      };
      await api.post('/api/reservations', payload);
      alert('Your fine table reservation request has been successfully placed!');
      setBookingDate('');
      setBookingTime('');
      setBookingGuests(2);
      setSpecialRequest('');
      setShowBookingForm(false);
      fetchReservations();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to request reservation. Please try again.');
    } finally {
      setBookingSubmitting(false);
    }
  };

  const activeOrders = orders.filter(o => o.order_status !== 'Completed' && o.order_status !== 'Cancelled');
  const pastOrders = orders.filter(o => o.order_status === 'Completed' || o.order_status === 'Cancelled');
  const latestActiveOrder = activeOrders[0];

  // Retrieve active reservation (Pending or Confirmed)
  const activeReservations = reservations.filter(r => r.status === 'Pending' || r.status === 'Confirmed');
  const latestActiveRes = activeReservations[0];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'Accepted':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'Preparing':
        return 'bg-warning/20 text-warning border-warning/30 animate-pulse';
      case 'Ready':
        return 'bg-success/15 text-success border-success/30 font-bold';
      case 'Completed':
        return 'bg-white/5 text-secondary-text border-white/10';
      case 'Cancelled':
        return 'bg-danger/10 text-danger border-danger/20';
      default:
        return 'bg-white/5 text-secondary-text border-white/10';
    }
  };

  const getResStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'Confirmed':
        return 'bg-success/15 text-success border-success/30 font-bold';
      case 'Cancelled':
        return 'bg-danger/10 text-danger border-danger/20';
      default:
        return 'bg-white/5 text-secondary-text border-white/10';
    }
  };

  // Determine recommendation list to display
  const personalizedList = recs?.personalized || [];
  const popularList = recs?.popular || [];
  const displaysRecs = personalizedList.length ? personalizedList : popularList;
  const recsLabel = personalizedList.length ? "Tailored to your orders" : "Popular selections today";

  return (
    <div className="space-y-8 text-left font-sans">
      {/* Page greeting */}
      <div>
        <span className="text-xs uppercase tracking-widest text-primary font-bold">Workspace Overview</span>
        <h1 className="text-3xl sm:text-5xl font-serif font-light text-primary-text mt-1">
          Welcome back, <span className="text-primary italic font-normal">{user?.full_name}</span>
        </h1>
        <p className="text-xs text-secondary-text mt-1">
          View your premium dining reservations, live order trackers, and chef recommendations
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Card 1: Current Orders */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-card rounded-card p-6 border border-border-color flex flex-col justify-between"
        >
          <div className="flex items-center justify-between border-b border-border-color pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-semibold text-primary-text">Current Orders</h3>
                <p className="text-[10px] text-secondary-text">Real-time status tracking</p>
              </div>
            </div>
            {latestActiveOrder && (
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-semibold border ${getStatusBadge(latestActiveOrder.order_status)}`}>
                {latestActiveOrder.order_status}
              </span>
            )}
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-secondary-text">Loading active orders...</div>
          ) : latestActiveOrder ? (
            <div className="space-y-3 flex-1 mb-6">
              <div className="flex justify-between items-center text-xs">
                <span className="text-secondary-text">Order Number:</span>
                <span className="font-semibold text-primary-text">#{latestActiveOrder.id}</span>
              </div>
              <div className="flex justify-between items-start text-xs">
                <span className="text-secondary-text shrink-0 pr-4">Items Placed:</span>
                <span className="font-semibold text-primary-text text-right line-clamp-2">
                  {latestActiveOrder.items.map(item => `${item.menu_item.name} x${item.quantity}`).join(', ')}
                </span>
              </div>
              {latestActiveOrder.special_instructions && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-secondary-text">Instructions:</span>
                  <span className="font-semibold text-primary italic">"{latestActiveOrder.special_instructions}"</span>
                </div>
              )}
              <div className="flex justify-between items-center text-xs border-t border-border-color/30 pt-2">
                <span className="text-secondary-text">Total Value:</span>
                <span className="font-semibold text-primary">${latestActiveOrder.total_amount.toFixed(2)}</span>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-secondary-text/50">
              No active orders. Navigate to Digital Menu to order.
            </div>
          )}

          <Link
            to="/dashboard/customer/orders"
            className="w-full flex items-center justify-center gap-1 text-[10px] uppercase tracking-widest font-bold text-primary hover:underline mt-auto"
          >
            Track Orders History <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>

        {/* Card 2: Table Reservations Manager */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="glass-card rounded-card p-6 border border-border-color flex flex-col justify-between min-h-[250px]"
        >
          <div className="flex items-center justify-between border-b border-border-color pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-secondary/10 text-secondary border border-secondary/20">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-semibold text-primary-text">Reservations</h3>
                <p className="text-[10px] text-secondary-text">Book & manage fine-dining tables</p>
              </div>
            </div>
            {latestActiveRes && !showBookingForm && (
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-semibold border ${getResStatusBadge(latestActiveRes.status)}`}>
                {latestActiveRes.status}
              </span>
            )}
          </div>

          {resLoading ? (
            <div className="py-8 text-center text-xs text-secondary-text">Loading reservations...</div>
          ) : latestActiveRes && !showBookingForm ? (
            /* Active Reservation card display */
            <div className="space-y-3 flex-1 mb-6 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-secondary-text">Date & Time:</span>
                <span className="font-semibold text-primary-text">
                  {latestActiveRes.reservation_date} at {latestActiveRes.reservation_time}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary-text">Party Size:</span>
                <span className="font-semibold text-primary-text">{latestActiveRes.guests} Guests</span>
              </div>
              {latestActiveRes.special_request && (
                <div className="flex justify-between items-start">
                  <span className="text-secondary-text shrink-0 pr-4">Special Requests:</span>
                  <span className="font-semibold text-primary italic text-right line-clamp-1">
                    "{latestActiveRes.special_request}"
                  </span>
                </div>
              )}

              <button
                onClick={() => setShowBookingForm(true)}
                className="w-full flex items-center justify-center gap-1 text-[9px] uppercase tracking-widest font-bold text-primary hover:underline mt-4"
              >
                Book Another Table <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          ) : (
            /* Booking Form display */
            <form onSubmit={handleBookTable} className="space-y-3 flex-1 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-secondary-text font-bold">Select Date</label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-background/50 border border-border-color focus:border-primary/50 rounded-lg px-2.5 py-1.5 text-xs text-primary-text outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-secondary-text font-bold">Select Time</label>
                  <input
                    type="time"
                    required
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full bg-background/50 border border-border-color focus:border-primary/50 rounded-lg px-2.5 py-1.5 text-xs text-primary-text outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1 space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-secondary-text font-bold">Guests</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    required
                    value={bookingGuests}
                    onChange={(e) => setBookingGuests(e.target.value)}
                    className="w-full bg-background/50 border border-border-color focus:border-primary/50 rounded-lg px-2.5 py-1.5 text-xs text-primary-text outline-none"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-secondary-text font-bold">Special Requests (Optional)</label>
                  <input
                    type="text"
                    value={specialRequest}
                    onChange={(e) => setSpecialRequest(e.target.value)}
                    placeholder="Window seat, allergies..."
                    className="w-full bg-background/50 border border-border-color focus:border-primary/50 rounded-lg px-2.5 py-1.5 text-xs text-primary-text outline-none placeholder:text-secondary-text/30"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={bookingSubmitting}
                  className="flex-1 flex items-center justify-center gap-1 text-[9px] uppercase tracking-widest font-bold text-background bg-gradient-to-r from-primary to-secondary hover:brightness-110 shadow-lg shadow-primary/20 py-2 rounded-xl disabled:opacity-50"
                >
                  {bookingSubmitting ? 'Booking...' : 'Confirm Request'}
                </button>
                {latestActiveRes && (
                  <button
                    type="button"
                    onClick={() => setShowBookingForm(false)}
                    className="px-4 py-2 border border-border-color hover:bg-white/5 rounded-xl text-[9px] uppercase tracking-widest font-bold text-secondary-text"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}
        </motion.div>

        {/* Card 3: Recommended For You */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="glass-card rounded-card p-6 border border-border-color flex flex-col justify-between"
        >
          <div className="flex items-center gap-3 border-b border-border-color pb-4 mb-4">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-semibold text-primary-text">Recommended For You</h3>
              <p className="text-[10px] text-secondary-text">AI tailored culinary matches</p>
            </div>
          </div>

          <div className="space-y-3 flex-1 mb-6">
            {recs?.detailed && recs.detailed.slice(0, 3).map((dish, idx) => (
              <div key={idx} className="flex gap-3.5 p-3 rounded-xl bg-background/30 border border-white/5 hover:border-primary/15 transition-all text-xs">
                {dish.image_url && (
                  <img 
                    src={dish.image_url} 
                    alt={dish.name} 
                    className="w-14 h-14 rounded-lg object-cover border border-white/10 shrink-0" 
                  />
                )}
                <div className="text-left flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-primary-text truncate">{dish.name}</h4>
                    <span className="text-xs font-bold text-primary shrink-0 ml-2">${dish.price.toFixed(2)}</span>
                  </div>
                  <p className="text-[10px] text-secondary-text font-light mt-0.5 line-clamp-1">{dish.description}</p>
                  <span className="text-[9px] font-bold text-primary flex items-center mt-1">
                    {dish.reason}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <Link
            to="/dashboard/customer/menu"
            className="w-full flex items-center justify-center gap-1 text-[10px] uppercase tracking-widest font-bold text-primary hover:underline mt-auto"
          >
            Explore Menu <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>

        {/* Card 4: Recent Order History */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="glass-card rounded-card p-6 border border-border-color flex flex-col justify-between"
        >
          <div className="flex items-center gap-3 border-b border-border-color pb-4 mb-4">
            <div className="p-2 rounded-xl bg-secondary/10 text-secondary border border-secondary/20">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-semibold text-primary-text">Recent Orders</h3>
              <p className="text-[10px] text-secondary-text">Past visits and transactions</p>
            </div>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-secondary-text">Loading records...</div>
          ) : pastOrders.length > 0 ? (
            <div className="space-y-3 flex-1 mb-6 overflow-y-auto max-h-[150px] pr-1">
              {pastOrders.slice(0, 3).map((pastOrder) => (
                <div key={pastOrder.id} className="p-2.5 rounded-lg bg-background/30 border border-white/5 text-left text-xs space-y-0.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-primary-text">Order #{pastOrder.id}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] border ${getStatusBadge(pastOrder.order_status)}`}>
                      {pastOrder.order_status}
                    </span>
                  </div>
                  <p className="text-[10px] text-secondary-text font-light">
                    Value: ${pastOrder.total_amount.toFixed(2)} | Items: {pastOrder.items.map(i => i.menu_item.name).join(', ')}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-secondary-text/50">
              No previous orders found.
            </div>
          )}

          <Link
            to="/dashboard/customer/orders"
            className="w-full flex items-center justify-center gap-1 text-[10px] uppercase tracking-widest font-bold text-primary hover:underline mt-auto"
          >
            View All History <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>

      </div>
    </div>
  );
}
