import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { auth, googleAuthProvider, isFirebaseConfigured } from './firebase';

const allowedAdminEmails = (import.meta.env.VITE_ADMIN_EMAILS || '')
  .split(',')
  .map((value: string) => value.trim().toLowerCase())
  .filter(Boolean);

const isAllowedAdmin = (email: string | null) =>
  Boolean(email && allowedAdminEmails.includes(email.toLowerCase()));

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  loginWithGoogle: async () => {},
  logout: async () => {},
  getToken: async () => null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(isAllowedAdmin(firebaseUser?.email ?? null) ? firebaseUser : null);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loginWithGoogle = async () => {
    if (!isFirebaseConfigured) {
      throw new Error('Konfigurasi Firebase web belum lengkap. Lengkapi variabel VITE_FIREBASE_* di file .env.');
    }

    if (!allowedAdminEmails.length) {
      throw new Error('Daftar admin belum diatur. Isi VITE_ADMIN_EMAILS di file .env.');
    }

    const result = await signInWithPopup(auth, googleAuthProvider);
    if (!isAllowedAdmin(result.user.email)) {
      await signOut(auth);
      throw new Error('Akun Google ini belum memiliki akses admin.');
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const getToken = async () => {
    return user ? user.getIdToken() : null;
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
