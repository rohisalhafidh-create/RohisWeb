import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onCancel} />
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="relative bg-white w-full max-w-sm rounded-2xl shadow-xl p-6">
            <h3 className="font-bold text-slate-800 text-lg mb-2">{title}</h3>
            <p className="text-slate-600 mb-6 text-sm">{message}</p>
            <div className="flex justify-end gap-3">
              <button onClick={onCancel} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors text-sm">Batal</button>
              <button onClick={onConfirm} className="px-4 py-2 bg-rose-600 text-white rounded-xl font-medium hover:bg-rose-700 transition-colors text-sm">Hapus</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
