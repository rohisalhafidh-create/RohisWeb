import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, Navigate } from 'react-router-dom';
import { Menu, X, LayoutDashboard, Image as ImageIcon, Award, Users, Settings, LogOut, ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../lib/AuthContext';

const ADMIN_NAV = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'Kelola Kegiatan', path: '/admin/activities', icon: ImageIcon },
  { label: 'Kelola Prestasi', path: '/admin/achievements', icon: Award },
  { label: 'Kelola Organisasi', path: '/admin/organization', icon: Users },
  { label: 'Pengaturan Website', path: '/admin/settings', icon: Settings },
];

export const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user, loading, logout } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/admin/login" replace />;

  const closeMenu = () => setMobileOpen(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-lg font-bold text-white flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-white flex items-center justify-center overflow-hidden">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain p-0.5" onError={(e) => { e.currentTarget.src = "https://ui-avatars.com/api/?name=RA&background=22c55e&color=fff" }} />
          </div>
          Admin Panel
        </h1>
        <p className="text-xs text-slate-400 mt-2 truncate">{user.email}</p>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        {ADMIN_NAV.map((item) => {
          const Icon = item.icon;
          // exact match for /admin
          const isActive = item.path === '/admin' 
            ? location.pathname === '/admin'
            : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeMenu}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium",
                isActive 
                  ? "bg-green-500/10 text-green-400" 
                  : "hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon size={18} className={cn(isActive ? "text-green-400" : "text-slate-500")} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-2">
        <NavLink
          to="/"
          className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <ArrowLeft size={18} className="text-slate-500" />
          Lihat Website
        </NavLink>
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium text-rose-400 hover:bg-rose-500/10"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <aside className="hidden lg:block w-64 fixed inset-y-0 left-0 z-40">
        <SidebarContent />
      </aside>

      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 z-40 text-white shadow-sm">
        <span className="font-bold text-sm">Admin Panel</span>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 -mr-2 text-slate-300 hover:bg-slate-800 rounded-lg"
        >
          <Menu size={24} />
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
              className="lg:hidden fixed inset-0 bg-slate-900/60 z-50 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed inset-y-0 left-0 w-[260px] z-50 bg-slate-900 shadow-2xl"
            >
              <button
                onClick={closeMenu}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-800 rounded-full z-50"
              >
                <X size={20} />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 lg:pl-64 pt-16 lg:pt-0 min-h-screen flex flex-col">
        <div className="flex-1 p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
