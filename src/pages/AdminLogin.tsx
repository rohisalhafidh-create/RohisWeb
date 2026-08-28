import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function AdminLogin() {
  const { loginWithGoogle, user, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  if (loading) return null;
  if (user) return <Navigate to="/admin" replace />;

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setError('');
    try {
      await loginWithGoogle();
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Login failed');
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

        <div className="space-y-4">
          <button
            type="button"
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="w-full flex items-center justify-center gap-3 bg-white text-slate-700 py-3.5 px-4 rounded-xl hover:bg-slate-50 transition-all font-medium disabled:opacity-70 disabled:cursor-not-allowed shadow-sm border border-slate-200 mt-2"
          >
            {isLoggingIn ? (
              <span className="w-5 h-5 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
            ) : (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#4285F4] text-xs font-bold text-white">G</span>
            )}
            Lanjutkan dengan Google
          </button>
          <p className="text-xs text-slate-400">Gunakan akun Google yang sudah terdaftar sebagai admin.</p>
        </div>

      </motion.div>
    </div>
  );
}
