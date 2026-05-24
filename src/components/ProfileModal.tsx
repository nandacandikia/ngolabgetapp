import React from 'react';
import { X, User, Mail, Phone, Shield, Star, ShoppingBag, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    name: string;
    email: string;
    nim?: string;
    phone?: string;
    role?: string;
  } | null;
  points: number;
  onPointsClick: () => void;
  onHistoryClick: () => void;
  onLogout: () => void;
}

export default function ProfileModal({
  isOpen,
  onClose,
  user,
  points,
  onPointsClick,
  onHistoryClick,
  onLogout
}: ProfileModalProps) {
  if (!user) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl flex flex-col relative z-10 border border-slate-100"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-orange-500/5 to-amber-500/5">
              <div className="flex items-center gap-3">
                <div className="bg-[#FF6B00] text-white p-2.5 rounded-2xl shadow-md shadow-orange-500/10">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-lg">Profil Saya</h3>
                  <p className="text-slate-400 text-xs font-semibold">Detail akun dan layanan Anda</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-full flex items-center justify-center border border-slate-100 transition-colors active:scale-90"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 bg-slate-50/30">
              {/* Profile Card */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl" />
                
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-black text-lg leading-tight tracking-tight">{user.name}</h4>
                    <span className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-bold uppercase tracking-wider">
                      <Shield size={10} />
                      {user.role || 'Member'}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
                  <div className="flex items-center gap-3 text-slate-300 text-xs font-medium">
                    <Mail size={14} className="text-slate-400" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  {user.nim && (
                    <div className="flex items-center gap-3 text-slate-300 text-xs font-medium">
                      <span className="w-3.5 h-3.5 flex items-center justify-center text-[10px] font-black bg-slate-700 rounded-full text-slate-400">N</span>
                      <span>NIM: {user.nim}</span>
                    </div>
                  )}
                  {user.phone && (
                    <div className="flex items-center gap-3 text-slate-300 text-xs font-medium">
                      <Phone size={14} className="text-slate-400" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Points Box */}
              <button
                onClick={() => {
                  onClose();
                  onPointsClick();
                }}
                className="w-full bg-amber-50/50 border border-amber-100 hover:bg-amber-50 rounded-2xl p-5 flex items-center justify-between transition-colors text-left active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-amber-400 text-white p-2.5 rounded-xl shadow-md shadow-amber-400/10">
                    <Star size={16} fill="currentColor" strokeWidth={0} />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-700 text-sm">Poin Loyalitas</h5>
                    <p className="text-slate-400 text-xs font-semibold">Kumpulkan untuk klaim voucher</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-black text-amber-600 text-lg">{points.toLocaleString('id-ID')}</span>
                  <span className="block text-[8px] font-black uppercase text-amber-500/80 tracking-wider">Poin</span>
                </div>
              </button>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    onClose();
                    onHistoryClick();
                  }}
                  className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 py-4 px-5 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <ShoppingBag size={18} className="text-[#FF6B00]" />
                    <span>Riwayat Pesanan</span>
                  </div>
                  <span className="text-slate-400 text-xs">➔</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onLogout();
                  }}
                  className="w-full bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 py-4 px-5 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <LogOut size={18} />
                    <span>Keluar Akun</span>
                  </div>
                  <span className="text-red-400 text-xs">➔</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
