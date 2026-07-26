import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// View Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerDashboard from './pages/CustomerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import KitchenDashboard from './pages/KitchenDashboard';
import CustomerMenu from './pages/CustomerMenu';
import AdminMenu from './pages/AdminMenu';

// Layout shells
import DashboardLayout from './layouts/DashboardLayout';

function App() {
  return (
    <AuthProvider>
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
    </AuthProvider>
  );
}

export default App;
