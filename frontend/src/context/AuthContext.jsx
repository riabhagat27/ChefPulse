import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await api.get('/api/me');
        setUser(res.data);
      } catch (err) {
        console.error('Session restoration failed:', err);
        localStorage.removeItem('token');
        setUser(null);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/api/login', { email, password });
      const { access_token, user: userProfile } = res.data;
      localStorage.setItem('token', access_token);
      setUser(userProfile);
      return userProfile;
    } catch (error) {
      throw error.response?.data?.detail || 'Login failed. Please check credentials.';
    }
  };

  const register = async (fullName, email, password, confirmPassword, role, restaurantName) => {
    try {
      const payload = {
        full_name: fullName,
        email,
        password,
        confirm_password: confirmPassword,
        role,
        restaurant_name: role === 'admin' ? restaurantName : null
      };
      const res = await api.post('/api/register', payload);
      return res.data;
    } catch (error) {
      throw error.response?.data?.detail || 'Registration failed. Please check input parameters.';
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/logout');
    } catch (err) {
      console.error('Logout error on backend:', err);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/api/me');
      setUser(res.data);
      return res.data;
    } catch (err) {
      console.error('Failed to refresh user credentials:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
export default AuthContext;
