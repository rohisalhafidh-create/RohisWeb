import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Menu, X, Home, Image as ImageIcon, Award, Users, LogIn } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Chatbot } from '../components/Chatbot';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', icon: Home },
  { label: 'Galeri Kegiatan', path: '/gallery', icon: ImageIcon },
  { label: 'Prestasi', path: '/achievements', icon: Award },
  { label: 'Struktur Organisasi', path: '/organization', icon: Users },
];

export const PublicLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const closeMenu = () => setMobileOpen(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-green-100 shadow-sm">
      <div className="p-6 flex flex-col items-center border-b border-green-50">
        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-green-600 font-bold text-2xl shadow-sm mb-3 border border-green-100 p-1 overflow-hidden">
          <img src="/logo.png" alt="Logo Rohis" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.src = "https://ui-avatars.com/api/?name=RA&background=ecfdf5&color=059669" }} />
        </div>
        <h1 className="text-lg font-bold text-slate-800 text-center">Rohis Al Hafidh</h1>
        <p className="text-xs text-slate-500 font-medium">SMKN 1 Semarang</p>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeMenu}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium",
                isActive 
                  ? "bg-green-600 text-white shadow-md shadow-green-600/20" 
                  : "text-slate-600 hover:bg-green-50 hover:text-green-700"
              )}
            >
              <Icon size={18} className={cn(isActive ? "text-white" : "text-slate-400 group-hover:text-green-600")} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-green-50">
        <NavLink
          to="/admin/login"
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-sm font-medium text-slate-600 hover:bg-amber-50 hover:text-amber-700 transition-colors border border-transparent hover:border-amber-200"
        >
          <LogIn size={16} />
          Admin Login
        </NavLink>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 flex font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 fixed inset-y-0 left-0 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-green-100 flex items-center justify-between px-4 z-40 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-green-600 font-bold text-xs border border-green-100 overflow-hidden">
            <img src="/logo.png" alt="Logo Rohis" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.src = "https://ui-avatars.com/api/?name=RA&background=ecfdf5&color=059669" }} />
          </div>
          <span className="font-bold text-slate-800 text-sm">Rohis Al Hafidh</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 -mr-2 text-slate-600 hover:bg-slate-100 rounded-lg"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
              className="lg:hidden fixed inset-0 bg-slate-900/40 z-50 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed inset-y-0 left-0 w-[280px] z-50 bg-white shadow-2xl"
            >
              <button
                onClick={closeMenu}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 rounded-full"
              >
                <X size={20} />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 lg:pl-72 pt-16 lg:pt-0 min-h-screen flex flex-col relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-green-50/50 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        
        <div className="flex-1">
          <Outlet />
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-100 py-8 px-6 mt-12 relative z-10">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
            <div>
              <h3 className="font-bold text-slate-800">Rohis Al Hafidh</h3>
              <p className="text-sm text-slate-500 mt-1">SMKN 1 Semarang</p>
            </div>
            <p className="text-sm text-slate-400">
              © {new Date().getFullYear()} Rohis Al Hafidh. All rights reserved.
            </p>
          </div>
        </footer>
      </main>

      <Chatbot />
    </div>
  );
};
