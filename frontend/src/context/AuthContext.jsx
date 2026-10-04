import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState({
    nurseryName: 'ANNADATA NURSERY',
    tagline: 'Quality Seedlings • Better Yield • Farmer Trust',
    currencySymbol: '₹',
    lowStockThreshold: 1000
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
    checkAuth();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await API.get('/settings');
      if (res.data) {
        setSettings(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch nursery settings', err);
    }
  };

  const checkAuth = async () => {
    const token = localStorage.getItem('annadata_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await API.get('/auth/me');
      setUser(res.data);
    } catch (err) {
      localStorage.removeItem('annadata_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    localStorage.setItem('annadata_token', res.data.token);
    setUser(res.data);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('annadata_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, settings, setSettings, login, logout, loading, fetchSettings }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
