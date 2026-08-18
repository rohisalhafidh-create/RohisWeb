import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: any | null;
  loading: boolean;
  login: (email?: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  getToken: async () => null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token === 'ROHIS_ADMIN_SECRET_TOKEN') {
      setUser({ email: 'rohisalhafidh@gmail.com' });
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  const login = async (email?: string, password?: string) => {
    if (email === 'rohisalhafidh@gmail.com' && password === 'rohisstemsasmg2026') {
      localStorage.setItem('admin_token', 'ROHIS_ADMIN_SECRET_TOKEN');
      setUser({ email: 'rohisalhafidh@gmail.com' });
    } else {
      throw new Error('Email atau password salah');
    }
  };

  const logout = async () => {
    localStorage.removeItem('admin_token');
    setUser(null);
  };

  const getToken = async () => {
    return localStorage.getItem('admin_token');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
