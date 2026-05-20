import React from 'react';
import { motion } from 'motion/react';
import { User, LogIn, ChevronRight, Sparkles } from 'lucide-react';

interface WelcomeScreenProps {
  onLogin: () => void;
  onRegister: () => void;
  onGuest: () => void;
}

export default function WelcomeScreen({ onLogin, onRegister, onGuest }: WelcomeScreenProps) {
  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] aspect-square bg-orange-50 rounded-full blur-3xl opacity-50" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] aspect-square bg-blue-50 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="w-full max-w-sm flex flex-col items-center text-center relative z-10">
        {/* Logo/Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-[#FF6B00] rounded-[32px] flex items-center justify-center shadow-2xl shadow-orange-200 mb-8 relative"
        >
          <Sparkles size={40} className="text-white" />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-[#FF6B00] rounded-[32px]"
          />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-3 mb-10"
        >
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">
            Menu <span className="text-[#FF6B00]">Mas Yanto</span>
          </h1>
          <p className="text-slate-400 font-bold text-sm leading-relaxed px-4">
            Nikmati kelezatan Bakso Mas Yanto dengan pemesanan yang mudah dan cepat.
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full space-y-3"
        >
          {/* Login Option */}
          <button
            onClick={onLogin}
            className="w-full bg-[#FF6B00] text-white p-4 rounded-[24px] font-black text-lg shadow-xl shadow-orange-100 hover:bg-[#e66000] active:scale-[0.98] transition-all flex items-center justify-between px-8"
          >
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-2 rounded-xl">
                <LogIn size={22} />
              </div>
              <span>Login</span>
            </div>
            <ChevronRight size={20} className="opacity-50" />
          </button>

          {/* Register Option */}
          <button
            onClick={onRegister}
            className="w-full bg-slate-800 text-white p-4 rounded-[24px] font-black text-lg shadow-xl shadow-slate-100 hover:bg-slate-900 active:scale-[0.98] transition-all flex items-center justify-between px-8"
          >
            <div className="flex items-center gap-4">
              <div className="bg-white/10 p-2 rounded-xl">
                <User size={22} />
              </div>
              <span>Register</span>
            </div>
            <ChevronRight size={20} className="opacity-50" />
          </button>

          {/* Guest Option */}
          <button
            onClick={onGuest}
            className="w-full bg-blue-50 text-blue-600 p-4 rounded-[24px] font-black text-lg hover:bg-blue-100 active:scale-[0.98] transition-all flex items-center justify-between px-8 group border border-blue-100"
          >
            <div className="flex items-center gap-4">
              <div className="bg-white p-2 rounded-xl border border-blue-100">
                <User size={22} className="text-blue-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <span>Guest</span>
            </div>
            <ChevronRight size={20} className="text-blue-300 group-hover:text-blue-400" />
          </button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]"
        >
          Bakso Mas Yanto • Est. 2024
        </motion.p>
      </div>
    </div>
  );
}
