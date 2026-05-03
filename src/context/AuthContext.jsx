import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('bc_user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  const login = async (username, password) => {
    const { data } = await api.post('/auth/login', { username, password });
    console.log(data);
    return true;
    const { user: u, token } = data.data;
    localStorage.setItem('bc_token', token);
    localStorage.setItem('bc_user', JSON.stringify(u));
    setUser(u);
    return u;
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    const { user: u, token } = data.data;
    localStorage.setItem('bc_token', token);
    localStorage.setItem('bc_user', JSON.stringify(u));
    setUser(u);
    return u;
  };

  const logout = useCallback(() => {
    localStorage.removeItem('bc_token');
    localStorage.removeItem('bc_user');
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      const u = data.data.user;
      localStorage.setItem('bc_user', JSON.stringify(u));
      setUser(u);
    } catch { logout(); }
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
