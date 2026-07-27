import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, RefreshCw, AlertCircle, ShoppingBag, CalendarDays, DollarSign } from 'lucide-react';
import api from '../services/api';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/api/customers');
      setCustomers(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to retrieve customer accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 text-left font-sans relative h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <span className="text-xs uppercase tracking-widest text-primary font-bold">User Directory</span>
          <h1 className="text-3xl sm:text-5xl font-serif font-light text-primary-text mt-1">
            Registered Customers
          </h1>
          <p className="text-xs text-secondary-text mt-1">
            Inspect customer transaction histories, total orders, spent values, and dining loyalty records.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg border border-danger/20 bg-danger/10 text-danger text-xs text-center font-medium shrink-0">
          {error}
        </div>
      )}

      {/* Search Bar */}
      <div className="flex items-center gap-2 bg-surface/50 border border-border-color px-4 py-2.5 rounded-xl text-xs text-secondary-text max-w-md focus-within:border-primary/50 transition-all shrink-0">
        <Search className="w-4 h-4 text-primary" />
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by customer name or email address..." 
          className="bg-transparent outline-none w-full placeholder:text-secondary-text/30 text-primary-text text-xs"
        />
      </div>

      {/* Customers Table */}
      <div className="flex-1 min-h-0 overflow-y-auto max-h-[600px] pr-1 py-2">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center text-secondary-text/50 gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
            <span className="text-xs uppercase tracking-widest">Loading customer logs...</span>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-secondary-text/30 gap-2 border border-dashed border-border-color rounded-card bg-surface/10">
            <Users className="w-10 h-10 stroke-[1.5]" />
            <span className="text-xs uppercase tracking-widest">No customers matched search terms.</span>
          </div>
        ) : (
          <div className="glass-card rounded-card border border-border-color bg-surface/30 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border-color pb-3 text-secondary-text uppercase tracking-widest text-[9px]">
                    <th className="p-4 font-semibold">Customer Details</th>
                    <th className="p-4 font-semibold text-center">Orders</th>
                    <th className="p-4 font-semibold text-center">Reservations</th>
                    <th className="p-4 font-semibold text-right">Total Spent</th>
                    <th className="p-4 font-semibold text-right">Loyalty Badge</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-color/30">
                  {filteredCustomers.map((cust) => {
                    // Determine loyalty tier
                    let badge = "Bronze";
                    let badgeColor = "bg-orange-950/20 text-orange-400 border-orange-900/30";
                    if (cust.total_spent > 500) {
                      badge = "Royal VIP";
                      badgeColor = "bg-primary/20 text-primary border-primary/30 font-bold";
                    } else if (cust.total_spent > 200) {
                      badge = "Silver Prestige";
                      badgeColor = "bg-secondary/20 text-secondary border-secondary/30";
                    }

                    return (
                      <tr key={cust.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 text-left">
                          <div className="font-bold text-primary-text text-sm">{cust.full_name}</div>
                          <div className="text-[10px] text-secondary-text">{cust.email}</div>
                        </td>
                        <td className="p-4 text-center">
                          <span className="inline-flex items-center gap-1 font-semibold text-primary-text bg-white/5 px-2 py-0.5 rounded border border-white/5">
                            <ShoppingBag className="w-3 h-3 text-primary" />
                            {cust.orders_count}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className="inline-flex items-center gap-1 font-semibold text-primary-text bg-white/5 px-2 py-0.5 rounded border border-white/5">
                            <CalendarDays className="w-3 h-3 text-secondary" />
                            {cust.reservations_count}
                          </span>
                        </td>
                        <td className="p-4 text-right font-bold text-primary">
                          ${cust.total_spent.toFixed(2)}
                        </td>
                        <td className="p-4 text-right">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${badgeColor}`}>
                            {badge}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
