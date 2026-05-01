import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../../features/auth/services/auth';
import profileService from '../../features/profile/services/profile';


const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await profileService.getProfile();
      const userData = res.data.data || res.data;
      setUser(userData);
      return userData;
    } catch (err) {
      localStorage.removeItem('token');
      setUser(null);
      throw err;
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchProfile().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [fetchProfile]);

  const login = async (email, password) => {
    setError(null);
    const res = await authService.login({ email, password });
    localStorage.setItem('token', res.data.token);
    const userData = res.data.data || res.data.user;
    setUser(userData);
    return res.data;
  };

  const register = async (data) => {
    setError(null);
    const res = await authService.register(data);
    localStorage.setItem('token', res.data.token);
    const userData = res.data.data || res.data.user;
    setUser(userData);
    return res.data;
  };

  const logout = async () => {
    try { await authService.logout(); } catch { /* ignore logout errors */ }
    localStorage.removeItem('token');
    setUser(null);
  };

  const refreshUser = () => fetchProfile();

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, error, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};