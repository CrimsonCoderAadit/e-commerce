import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import api, { setToken } from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Ref so the 401 retry interceptor always reads the latest token synchronously
  const tokenRef = useRef(null);

  // Update every token location in one call
  const storeToken = useCallback((token) => {
    tokenRef.current = token;
    setToken(token); // module var in axios.js — read by the request interceptor
  }, []);

  // ── 401 auto-refresh interceptor (registered once) ─────────────────────
  useEffect(() => {
    const resId = api.interceptors.response.use(
      (res) => res,
      async (error) => {
        const original = error.config;
        if (error.response?.status === 401 && !original._retry) {
          original._retry = true;
          try {
            const { data } = await api.post('/auth/refresh');
            storeToken(data.accessToken);
            original.headers.Authorization = 'Bearer ' + data.accessToken;
            return api(original);
          } catch {
            storeToken(null);
            setUser(null);
          }
        }
        return Promise.reject(error);
      }
    );
    return () => api.interceptors.response.eject(resId);
  }, [storeToken]);

  // ── Silent session restore on mount ────────────────────────────────────
  useEffect(() => {
    const restore = async () => {
      try {
        const { data: refreshData } = await api.post('/auth/refresh', {}, { _retry: true });
        storeToken(refreshData.accessToken);

        const { data: meData } = await api.get('/auth/me');
        setUser(meData.user ?? meData);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, [storeToken]);

  // ── Auth actions ────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setToken(data.accessToken); // set BEFORE any state update so next request is authenticated
    storeToken(data.accessToken);
    setUser(data.user);
    return data;
  }, [storeToken]);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // swallow — clear state regardless
    }
    storeToken(null);
    setUser(null);
  }, [storeToken]);

  const register = useCallback(async (username, email, password) => {
    const { data } = await api.post('/auth/register', { username, email, password });
    return data;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
