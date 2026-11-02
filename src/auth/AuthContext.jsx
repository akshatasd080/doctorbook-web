import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { adminApi } from '../api/adminApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('db_admin_token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    let active = true;

    async function hydrate() {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const res = await adminApi.me();
        if (!active) return;
        if (res.data?.role !== 'admin') {
          throw new Error('Admin access only');
        }
        setUser(res.data);
      } catch {
        if (!active) return;
        localStorage.removeItem('db_admin_token');
        setToken(null);
        setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    hydrate();
    return () => {
      active = false;
    };
  }, [token]);

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      async login(email, password) {
        const res = await adminApi.login(email, password);
        if (res.data?.user?.role !== 'admin') {
          throw new Error('Only admin accounts can access this panel');
        }
        localStorage.setItem('db_admin_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return res.data;
      },
      logout() {
        localStorage.removeItem('db_admin_token');
        setToken(null);
        setUser(null);
      },
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
