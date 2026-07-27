import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';

// View Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerDashboard from './pages/CustomerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import KitchenDashboard from './pages/KitchenDashboard';
import CustomerMenu from './pages/CustomerMenu';
import AdminMenu from './pages/AdminMenu';
import AdminOrders from './pages/AdminOrders';
import CustomerOrders from './pages/CustomerOrders';
import CustomerAssistant from './pages/CustomerAssistant';
import AdminReservations from './pages/AdminReservations';
import AdminInventory from './pages/AdminInventory';
import AdminCustomers from './pages/AdminCustomers';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminAssistant from './pages/AdminAssistant';
import AdminSettings from './pages/AdminSettings';
import Profile from './pages/Profile';

// Layout shells
import DashboardLayout from './layouts/DashboardLayout';
import { NotificationProvider } from './context/NotificationContext';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
        <Routes>
          {/* Public Views */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Dashboards */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Redirect /dashboard to the right route handled dynamically inside layout/guard */}
            <Route index element={<Navigate to="customer" replace />} />
            
            {/* Shared Profile Route */}
            <Route
              path="profile"
              element={
                <ProtectedRoute allowedRoles={['customer', 'admin']}>
                  <Profile />
                </ProtectedRoute>
              }
            />
            
            {/* Customer Routes */}
            <Route
              path="customer"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="customer/menu"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CustomerMenu />
                </ProtectedRoute>
              }
            />
            <Route
              path="customer/orders"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CustomerOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="customer/assistant"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CustomerAssistant />
                </ProtectedRoute>
              }
            />
            
            {/* Admin Routes */}
            <Route
              path="admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/menu"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminMenu />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/orders"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/reservations"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminReservations />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/inventory"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminInventory />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/customers"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminCustomers />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/analytics"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminAnalytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/assistant"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminAssistant />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/settings"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="kitchen"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <KitchenDashboard />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Fallback Catch-All */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      
      {/* Premium Notification Toaster Overlay */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1F1F1F',
            color: '#F5F5F5',
            border: '1px solid #333333',
            fontSize: '12px',
            borderRadius: '12px',
            fontFamily: 'Inter, sans-serif'
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#1F1F1F'
            }
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#1F1F1F'
            }
          }
        }}
      />
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
