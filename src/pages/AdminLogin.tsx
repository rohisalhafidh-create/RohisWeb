import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminLogin() {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  if (loading) return null;
  if (user) return <Navigate to="/admin" replace />;

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setError('');
    try {
      await login();
      navigate('/admin');
    } catch (e: any) {
      setError(e.message || 'Login failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-green-400 to-green-600" />
        
        <div className="w-20 h-20 bg-white rounded-2xl mx-auto flex items-center justify-center mb-6 border border-slate-100 shadow-sm p-2 overflow-hidden">
          <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.src = "https://ui-avatars.com/api/?name=RA&background=ecfdf5&color=059669" }} />
        </div>

        <h1 className="text-2xl font-bold text-slate-800">Admin Login</h1>
        <p className="text-slate-500 mt-2 mb-8 text-sm">
          Akses khusus pengurus Rohis Al Hafidh SMKN 1 Semarang
        </p>

        {error && (
          <div className="bg-rose-50 text-rose-600 p-3 rounded-lg text-sm mb-6 border border-rose-100">
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={isLoggingIn}
          className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white py-3.5 px-4 rounded-xl hover:bg-slate-800 transition-all font-medium disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-slate-900/10"
        >
          {isLoggingIn ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <LogIn size={20} />
          )}
          Login dengan Akun Google
        </button>

        <p className="mt-6 text-xs text-slate-400">
          Pastikan Anda menggunakan akun yang telah didaftarkan sebagai Admin.
        </p>
      </motion.div>
    </div>
  );
}