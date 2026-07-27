import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Clock, User, AlertCircle, RefreshCw, Check, X } from 'lucide-react';
import api from '../services/api';
import useWebSocket from '../hooks/useWebSocket';

export default function AdminReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [error, setError] = useState('');

  const fetchReservations = async () => {
    try {
      const res = await api.get('/api/reservations');
      setReservations(res.data);
    } catch (err) {
      console.error('Error fetching reservations:', err);
      setError('Failed to fetch reservations database logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  // Sync state dynamically on WebSocket updates
  useWebSocket((data) => {
    if (data.event === 'reservation_created' || data.event === 'reservation_status_updated') {
      fetchReservations();
    }
  });

  const handleStatusChange = async (resId, newStatus) => {
    setError('');
    try {
      await api.put(`/api/reservations/${resId}/status`, { status: newStatus });
      fetchReservations();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update reservation status.');
    }
  };

  const statusOptions = ['All', 'Pending', 'Confirmed', 'Cancelled'];

  const filteredReservations = filterStatus === 'All'
    ? reservations
    : reservations.filter(r => r.status === filterStatus);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending': return 'bg-warning/10 text-warning border-warning/20';
      case 'Confirmed': return 'bg-success/15 text-success border-success/30 font-bold';
      case 'Cancelled': return 'bg-danger/10 text-danger border-danger/20';
      default: return 'bg-white/5 text-secondary-text border-white/10';
    }
  };

  return (
    <div className="space-y-8 text-left relative h-full flex flex-col font-sans">
      {/* Header */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <span className="text-xs uppercase tracking-widest text-primary font-bold">Booking Administration</span>
          <h1 className="text-3xl sm:text-5xl font-serif font-light text-primary-text mt-1">
            Reservations Queue
          </h1>
          <p className="text-xs text-secondary-text mt-1">
            Review guest table requests, assign seating preferences, and manage seating limits.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg border border-danger/20 bg-danger/10 text-danger text-xs text-center font-medium shrink-0 flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 shrink-0 border-b border-border-color">
        {statusOptions.map((opt) => (
          <button
            key={opt}
            onClick={() => setFilterStatus(opt)}
            className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-200 shrink-0 ${
              filterStatus === opt
                ? 'bg-gradient-to-r from-primary to-secondary text-background shadow-md border border-primary/20'
                : 'text-secondary-text hover:text-primary-text hover:bg-white/5'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      {/* Grid of Reservation requests */}
      <div className="flex-1 min-h-0 overflow-y-auto max-h-[600px] pr-1 py-2">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center text-secondary-text/50 gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
            <span className="text-xs uppercase tracking-widest">Retrieving guest reservations...</span>
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-secondary-text/30 gap-2 border border-dashed border-border-color rounded-card bg-surface/10">
            <CalendarDays className="w-10 h-10 stroke-[1.5]" />
            <span className="text-xs uppercase tracking-widest">No reservations found matching '{filterStatus}'</span>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReservations.map((res) => (
              <motion.div
                key={res.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-5 rounded-card border border-border-color bg-surface/30 hover:border-primary/20 transition-all flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 text-left"
              >
                {/* Information Area */}
                <div className="space-y-2.5 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs text-secondary-text flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-primary" />
                      Guest: <strong className="text-primary-text">{res.customer_name}</strong>
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${getStatusBadge(res.status)}`}>
                      {res.status}
                    </span>
                    <span className="text-xs text-secondary-text flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-secondary-text/60" />
                      Booked for: <strong className="text-primary-text">{res.reservation_date}</strong> at <strong className="text-primary">{res.reservation_time}</strong>
                    </span>
                  </div>

                  <div className="text-primary-text font-medium text-xs">
                    <strong className="text-secondary-text">Party Size: </strong>
                    {res.guests} Guests
                  </div>

                  {res.special_request && (
                    <div className="text-xs text-primary font-light italic">
                      "Special Request: {res.special_request}"
                    </div>
                  )}
                </div>

                {/* Confirm/Cancel Action Buttons */}
                <div className="flex items-center gap-3 shrink-0 w-full lg:w-auto justify-end border-t lg:border-t-0 border-border-color/30 pt-3 lg:pt-0">
                  <button
                    onClick={() => handleStatusChange(res.id, 'Confirmed')}
                    disabled={res.status === 'Confirmed'}
                    className={`px-3 py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider border flex items-center gap-1 transition-all ${
                      res.status === 'Confirmed'
                        ? 'bg-success text-background border-success/20 disabled:opacity-50'
                        : 'bg-background/40 text-success border-success/20 hover:bg-success/10'
                    }`}
                  >
                    <Check className="w-3 h-3" />
                    Confirm
                  </button>

                  <button
                    onClick={() => handleStatusChange(res.id, 'Cancelled')}
                    disabled={res.status === 'Cancelled'}
                    className={`px-3 py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider border flex items-center gap-1 transition-all ${
                      res.status === 'Cancelled'
                        ? 'bg-danger text-primary-text border-danger/20 disabled:opacity-50'
                        : 'bg-background/40 text-danger border-danger/20 hover:bg-danger/10'
                    }`}
                  >
                    <X className="w-3 h-3" />
                    Cancel
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
