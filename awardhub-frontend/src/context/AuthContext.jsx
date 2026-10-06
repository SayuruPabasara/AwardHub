import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/auth';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('awardhub_token'));
  const [loading, setLoading] = useState(true);

  /* On mount or token change, fetch user profile */
  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    authApi.getMe()
      .then((data) => setUser(data))
      .catch(() => {
        /* Token expired or invalid */
        localStorage.removeItem('awardhub_token');
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = useCallback(async (username, password) => {
    const data = await authApi.login({ username, email: username, password });
    if (data.token) {
      localStorage.setItem('awardhub_token', data.token);
      setToken(data.token);
    }
    const loggedUser = data.user || data;
    setUser(loggedUser);
    return loggedUser;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await authApi.register(payload);
    if (data.token) {
      localStorage.setItem('awardhub_token', data.token);
      setToken(data.token);
    }
    const regUser = data.user || data;
    setUser(regUser);
    return regUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('awardhub_token');
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    const data = await authApi.getMe();
    setUser(data);
  }, [token]);

  const getRoleDisplay = useCallback(() => {
    if (!user?.role) return 'Guest';
    switch (user.role) {
      case 'ADMIN':
        return 'Administrator';
      case 'ORGANIZER':
        return 'Award Committee';
      case 'JUDGE':
        return 'Accredited Judge';
      case 'NOMINEE':
        return 'Award Nominee';
      case 'VOTER':
        return 'Registered Voter';
      case 'IT_COORDINATOR':
        return 'IT Coordinator';
      default:
        return user.role;
    }
  }, [user]);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    refreshUser,
    getRoleDisplay,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
