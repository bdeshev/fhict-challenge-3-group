import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi, getToken, setToken, clearToken, setUnauthorizedHandler } from '../api';
import { User } from '../types';

type Ctx = {
  user: User | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<Ctx>({} as Ctx);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUnauthorizedHandler(() => { setUser(null); });
    (async () => {
      try {
        const t = await getToken();
        if (t) {
          const u = await authApi.me();
          setUser(u);
        }
      } catch {
        await clearToken();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (identifier: string, password: string) => {
    const res = await authApi.login({ identifier, password });
    await setToken(res.token);
    setUser(res.user);
  };

  const register = async (username: string, email: string, password: string) => {
    await authApi.register({ username, email, password });
    await login(email, password);
  };

  const logout = async () => {
    await clearToken();
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}
