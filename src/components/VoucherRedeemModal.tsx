import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Ticket, Gift, CheckCircle2, AlertCircle, Sparkles, ChevronRight, Copy } from 'lucide-react';
import { Voucher, MyVoucher } from '../types';

interface VoucherRedeemModalProps {
  isOpen: boolean;
  onClose: () => void;
  myVouchers: MyVoucher[];
  setMyVouchers: React.Dispatch<React.SetStateAction<MyVoucher[]>>;
  isInline?: boolean;
}

const REDEEMABLE_CODES: Record<string, Omit<Voucher, 'id'>> = {
  'MANTAP5K': {
    title: 'Potongan Rp5.000',
    description: 'Voucher potongan harga belanja minimum Rp25.000',
    cost: 0,
    discount: 'Rp5.000',
    expiry: '30 hari',
    color: 'from-orange-400 to-red-400',
    icon: '🎫',
  },
  'ESJERUKGRATIS': {
    title: 'Gratis Es Jeruk Peras',
    description: 'Voucher gratis 1 Es Jeruk Peras',
    cost: 0,
    discount: 'GRATIS',
    expiry: '14 hari',
    color: 'from-yellow-400 to-orange-400',
    icon: '🍊',
  },
  'POTONGAN10K': {
    title: 'Potongan Rp10.000',
    description: 'Voucher potongan harga belanja minimum Rp50.000',
    cost: 0,
    discount: 'Rp10.000',
    expiry: '30 hari',
    color: 'from-emerald-400 to-teal-500',
    icon: '💸',
  },
  'BATAGORFREE': {
    title: 'Gratis Batagor Bandung',
    description: 'Voucher gratis 1 porsi Batagor Bandung',
    cost: 0,
    discount: 'GRATIS',
    expiry: '14 hari',
    color: 'from-purple-400 to-pink-500',
    icon: '🥢',
  },
  'NGOLAB20': {
    title: 'Potongan Rp20.000',
    description: 'Spesial Ngolab! Potongan Rp20.000 minimum belanja Rp100.000',
    cost: 0,
    discount: 'Rp20.000',
    expiry: '30 hari',
    color: 'from-[#FF6B00] to-yellow-500',
    icon: '🍲',
  },
  'DISKON25': {
    title: 'Diskon Rp25.000',
    description: 'Diskon akhir pekan! Potongan Rp25.000 minimum belanja Rp120.000',
    cost: 0,
    discount: 'Rp25.000',
    expiry: '30 hari',
    color: 'from-blue-600 to-indigo-600',
    icon: '💰',
  },
  'BERKAH50': {
    title: 'Voucher Berkah Rp50.000',
    description: 'Voucher Berkah Mas Yanto! Potongan Rp50.000 minimum belanja Rp200.000',
    cost: 0,
    discount: 'Rp50.000',
    expiry: '30 hari',
    color: 'from-rose-500 to-red-600',
    icon: '👑',
  }
};

export default function VoucherRedeemModal({ isOpen, onClose, myVouchers, setMyVouchers, isInline = false }: VoucherRedeemModalProps) {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'validating' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [successVoucher, setSuccessVoucher] = useState<MyVoucher | null>(null);

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return;

    setStatus('validating');
    setErrorMessage('');

    // Simulate backend network latency (1.2s) for a premium feel
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const voucherData = REDEEMABLE_CODES[cleanCode];

    if (!voucherData) {
      setStatus('error');
      setErrorMessage('Kode voucher tidak valid atau sudah kedaluwarsa. Periksa kembali penulisan kode Anda.');
      return;
    }

    const voucherId = `redeem-${cleanCode.toLowerCase()}`;
    const isAlreadyClaimed = myVouchers.some((v) => v.id === voucherId);

    if (isAlreadyClaimed) {
      setStatus('error');
      setErrorMessage('Anda sudah pernah menukarkan kode voucher ini sebelumnya.');
      return;
    }

    // Generate specific voucher instance linked to user
    const newVoucher: MyVoucher = {
      id: voucherId,
      title: voucherData.title,
      description: voucherData.description,
      cost: 0,
      discount: voucherData.discount,
      expiry: voucherData.expiry,
      color: voucherData.color,
      icon: voucherData.icon,
      claimedAt: new Date().toLocaleString('id-ID'),
      code: `MASYANTO-RED-${cleanCode}-${Date.now().toString(36).toUpperCase()}`,
      used: false,
    };

    const updated = [newVoucher, ...myVouchers];
    setMyVouchers(updated);
    localStorage.setItem('maslahat_my_vouchers', JSON.stringify(updated));

    setSuccessVoucher(newVoucher);
    setStatus('success');
  };

  const handleSuggestionClick = (suggestedCode: string) => {
    if (status === 'validating') return;
    setCode(suggestedCode);
    setStatus('idle');
    setErrorMessage('');
  };

  const resetState = () => {
    setCode('');
    setStatus('idle');
    setErrorMessage('');
    setSuccessVoucher(null);
  };

  if (!isOpen && !isInline) return null;

  const cardContent = (
    <div className={`bg-white w-full max-w-2xl mx-auto rounded-[36px] overflow-hidden relative z-10 ${isInline ? 'shadow-xl shadow-slate-100/50 border border-slate-100' : 'shadow-2xl'} flex flex-col`}>
      {/* Drag Handle for Mobile */}
      {!isInline && (
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>
      )}

      {/* Header */}
      <div className="px-6 pt-4 pb-3 flex items-center justify-between border-b border-slate-50 bg-gradient-to-r from-orange-500/5 to-amber-500/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B00] to-amber-500 rounded-2xl flex items-center justify-center shadow-md shadow-orange-100">
            <Ticket size={18} className="text-white" />
          </div>
          <div className="text-left">
            <h2 className="font-black text-base text-slate-800 leading-none">Penukaran Voucher</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Klaim Kode Promo Anda</p>
          </div>
        </div>
        {!isInline && (
          <button
            onClick={onClose}
            disabled={status === 'validating'}
            className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 active:scale-90 transition-all disabled:opacity-50 cursor-pointer"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-6">
            <AnimatePresence mode="wait">
              {status !== 'success' ? (
                <motion.div
                  key="redeem-form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-3xl p-5 flex gap-4">
                    <div className="bg-[#FF6B00] text-white p-3 rounded-2xl h-fit shadow-md shadow-orange-200">
                      <Gift size={20} />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800 text-sm">Punya Kode Voucher Spesifik?</h4>
                      <p className="text-slate-500 text-[11px] font-semibold leading-relaxed mt-1">
                        Masukkan kode voucher unik yang Anda dapatkan dari event, promo kasir, atau sosial media untuk dikaitkan ke akun Anda.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleRedeem} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                        Masukkan Kode Voucher
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="CONTOH: NGOLAB20"
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          disabled={status === 'validating'}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-black text-slate-800 uppercase tracking-wider text-sm outline-none focus:bg-white focus:border-[#FF6B00] focus:ring-2 focus:ring-orange-100 transition-all disabled:opacity-60"
                        />
                        {status === 'validating' && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
                            <div className="w-5 h-5 border-2 border-orange-200 border-t-[#FF6B00] rounded-full animate-spin" />
                          </div>
                        )}
                      </div>
                    </div>

                    {status === 'error' && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-start gap-3 text-red-700"
                      >
                        <AlertCircle size={18} className="shrink-0 mt-0.5" />
                        <p className="text-xs font-semibold leading-relaxed">{errorMessage}</p>
                      </motion.div>
                    )}

                    <button
                      type="submit"
                      disabled={!code.trim() || status === 'validating'}
                      className="w-full bg-[#FF6B00] hover:bg-[#e66000] text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-orange-200 disabled:opacity-50 disabled:scale-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                      {status === 'validating' ? 'Memvalidasi Kode...' : 'Tukarkan Sekarang'}
                      <ChevronRight size={16} />
                    </button>
                  </form>

                  {/* Suggestion list */}
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                      Kode Promo Aktif Hari Ini (Klik untuk menyalin)
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {Object.entries(REDEEMABLE_CODES).map(([promoKey, promoVal]) => {
                        const isClaimed = myVouchers.some((v) => v.id === `redeem-${promoKey.toLowerCase()}`);
                        return (
                          <button
                            key={promoKey}
                            type="button"
                            onClick={() => handleSuggestionClick(promoKey)}
                            disabled={status === 'validating'}
                            className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all active:scale-[0.97] group ${isClaimed
                                ? 'bg-slate-50 border-slate-100 opacity-60'
                                : 'bg-white border-slate-100 hover:border-orange-200 hover:bg-orange-50/20'
                              }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="text-base shrink-0">{promoVal.icon}</span>
                              <div className="min-w-0">
                                <p className="font-black text-xs text-slate-800 truncate">{promoKey}</p>
                                <p className="text-[9px] font-bold text-slate-400 truncate">{promoVal.title}</p>
                              </div>
                            </div>
                            <span className="text-[10px] font-black text-[#FF6B00] bg-orange-50 group-hover:bg-[#FF6B00] group-hover:text-white px-2 py-0.5 rounded transition-all">
                              {isClaimed ? 'Klaim ✓' : 'Salin'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="redeem-success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col items-center py-6 text-center space-y-6"
                >
                  <div className="relative">
                    <motion.div
                      animate={{ scale: [1, 1.15, 1], rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                      className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 shadow-inner"
                    >
                      <CheckCircle2 size={44} />
                    </motion.div>
                    <motion.div
                      animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute inset-0 border-2 border-emerald-400 rounded-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest">
                      <Sparkles size={12} />
                      Berhasil Ditukarkan
                    </div>
                    <h3 className="text-xl font-black text-slate-800 leading-tight">Voucher Ditambahkan ke Akun!</h3>
                    <p className="text-slate-500 text-xs font-semibold leading-relaxed max-w-xs mx-auto">
                      Voucher resmi menjadi hak milik Anda dan dapat segera digunakan sebagai potongan harga di halaman checkout.
                    </p>
                  </div>

                  {/* Visual Voucher Card */}
                  {successVoucher && (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="w-full max-w-sm border border-slate-100 rounded-3xl overflow-hidden shadow-md text-left"
                    >
                      <div className={`bg-gradient-to-r ${successVoucher.color} px-5 py-4 flex items-center gap-4`}>
                        <span className="text-3xl">{successVoucher.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-black text-base truncate leading-tight">{successVoucher.title}</p>
                          <p className="text-white/80 text-[11px] font-semibold mt-0.5 truncate">{successVoucher.description}</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur px-3 py-1.5 rounded-xl text-center flex-shrink-0">
                          <p className="text-white font-black text-sm leading-none">{successVoucher.discount}</p>
                        </div>
                      </div>
                      <div className="bg-white px-5 py-3.5 flex items-center justify-between text-xs">
                        <div>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Masa Berlaku</p>
                          <p className="text-slate-600 font-semibold mt-0.5">{successVoucher.expiry}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider text-right">Kode Klaim</p>
                          <p className="text-[#FF6B00] font-black mt-0.5 tracking-wider font-mono">
                            {successVoucher.code.slice(-10)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="flex flex-col w-full gap-3 pt-4">
                    <button
                      onClick={onClose}
                      className="w-full bg-[#FF6B00] text-white py-4 rounded-2xl font-black text-sm shadow-md shadow-orange-100 active:scale-95 transition-all"
                    >
                      Kembali ke Menu
                    </button>
                    <button
                      onClick={resetState}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 py-3.5 rounded-2xl font-black text-xs active:scale-95 transition-all"
                    >
                      Tukarkan Kode Lain
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer banner */}
          <div className="px-6 py-3 border-t border-slate-50 bg-slate-50/50 flex items-center justify-center gap-1.5 opacity-40">
            <Sparkles size={11} fill="currentColor" className="text-slate-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Mas Yanto Promo</span>
          </div>
        </div>
      );

  if (isInline) {
    return cardContent;
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={status !== 'validating' ? onClose : undefined}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="w-full max-w-md flex flex-col"
        >
          {cardContent}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
