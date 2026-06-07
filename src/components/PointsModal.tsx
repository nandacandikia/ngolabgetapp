import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, QrCode, Scan, Star, CheckCircle2, AlertCircle, Info,
  Gift, Ticket, Zap, ChevronRight, ShoppingBag
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Html5QrcodeScanner } from 'html5-qrcode';

import { Voucher, MyVoucher } from '../types';

interface PointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  points: number;
  onClaim: (points: number, source?: string) => void;
  myVouchers: MyVoucher[];
  setMyVouchers: React.Dispatch<React.SetStateAction<MyVoucher[]>>;
  promos?: any[];
  voucherCatalog?: Voucher[];
}

function generateBarcodeValue(voucherId: string): string {
  return `MASYANTO-VCR-${voucherId.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
}

// Visual barcode component using CSS bars
function BarcodeVisual({ value }: { value: string }) {
  // Generate deterministic bar widths from the value string
  const bars: number[] = [];
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    bars.push((code % 3) + 1); // 1, 2, or 3
    bars.push(((code >> 2) % 2) + 1); // 1 or 2 (gap)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="flex items-stretch gap-0 bg-white px-4 py-5 rounded-2xl border border-slate-100 shadow-inner"
        style={{ height: 90 }}
      >
        {bars.map((w, i) => (
          <div
            key={i}
            style={{
              width: w * 2.5,
              backgroundColor: i % 2 === 0 ? '#1e293b' : 'transparent',
              height: '100%',
              flexShrink: 0,
            }}
          />
        ))}
      </div>
      <p className="font-mono text-[10px] text-slate-400 tracking-widest uppercase">
        {value.slice(-16)}
      </p>
    </div>
  );
}

export default function PointsModal({ isOpen, onClose, points, onClaim, myVouchers, setMyVouchers, promos = [], voucherCatalog = [] }: PointsModalProps) {
  const [activeTab, setActiveTab] = useState<'KLAIM' | 'TUKAR' | 'VOUCHER_SAYA'>('KLAIM');
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [kioskSimStatus, setKioskSimStatus] = useState<'idle' | 'scanning' | 'success'>('idle');
  const [promoCode, setPromoCode] = useState('');
  const [selectedVoucher, setSelectedVoucher] = useState<MyVoucher | null>(null);
  const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null);

  // QR Scanner for receipt scan
  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;
    if (activeTab === 'KLAIM' && isOpen && !scanResult && !kioskSimStatus.startsWith('s')) {
      // Only mount scanner if user scrolls to it — keep minimal
    }
    return () => { scanner?.clear(); };
  }, [activeTab, isOpen, scanResult, kioskSimStatus]);

  const resetKiosk = () => {
    setKioskSimStatus('idle');
    setScanResult(null);
    setScanError(null);
  };

  const simulateKioskScan = () => {
    setKioskSimStatus('scanning');
    setTimeout(() => {
      setKioskSimStatus('success');
      onClaim(50, 'Simulasi Kiosk Scan');
    }, 1800);
  };

  const handleClaimPromo = () => {
    const cleanCode = promoCode.trim().toUpperCase();
    const foundPromo = promos.find(p => p.code && p.code.trim().toUpperCase() === cleanCode);
    
    if (foundPromo) {
      if (foundPromo.status !== 'Active') {
        alert('Kode voucher ini sedang dinonaktifkan.');
        return;
      }
      if (foundPromo.maxUsage && foundPromo.usageCount >= foundPromo.maxUsage) {
        alert('Kuota penggunaan kode voucher ini sudah habis.');
        return;
      }
      
      const voucherId = `db-redeem-${foundPromo.id}`;
      const isAlreadyClaimed = myVouchers.some((v) => v.id === voucherId || (v.code && v.code.toUpperCase() === cleanCode));
      
      if (isAlreadyClaimed) {
        alert('Anda sudah pernah menukarkan kode voucher ini sebelumnya.');
        return;
      }
      
      const newVoucher: MyVoucher = {
        id: voucherId,
        title: foundPromo.title,
        description: foundPromo.description || `Voucher potongan harga belanja minimum Rp${Number(foundPromo.minPurchase).toLocaleString('id-ID')}`,
        cost: 0,
        discount: foundPromo.type === 'Persentase' ? `${foundPromo.discount}%` : `Rp${Number(foundPromo.discount).toLocaleString('id-ID')}`,
        expiry: foundPromo.period || '30 hari',
        color: Number(foundPromo.discount) >= 50000 || Number(foundPromo.discount) >= 20 ? 'from-rose-500 to-red-600' : (Number(foundPromo.discount) >= 20000 || Number(foundPromo.discount) >= 15 ? 'from-[#FF6B00] to-yellow-500' : 'from-orange-400 to-red-400'),
        icon: foundPromo.type === 'Persentase' ? '🎫' : '💸',
        claimedAt: new Date().toLocaleString('id-ID'),
        code: foundPromo.code,
        used: false,
      };
      
      const updated = [newVoucher, ...myVouchers];
      setMyVouchers(updated);
      localStorage.setItem('maslahat_my_vouchers', JSON.stringify(updated));
      setRedeemSuccess(foundPromo.title);
      setTimeout(() => setRedeemSuccess(null), 2500);
    } else {
      alert('Kode voucher tidak valid atau sudah kedaluwarsa.');
    }
    setPromoCode('');
  };

  const handleRedeemVoucher = (voucher: Voucher, isPromo: boolean = false) => {
    if (!isPromo && points < voucher.cost) return;
    const newVoucher: MyVoucher = {
      ...voucher,
      claimedAt: new Date().toLocaleString('id-ID'),
      code: generateBarcodeValue(voucher.id),
      used: false,
    };
    const updated = [newVoucher, ...myVouchers];
    setMyVouchers(updated);
    localStorage.setItem('maslahat_my_vouchers', JSON.stringify(updated));
    if (!isPromo) {
      onClaim(-voucher.cost, `Penukaran Hadiah: ${voucher.title}`);
    }
    setRedeemSuccess(voucher.title);
    setTimeout(() => setRedeemSuccess(null), 2500);
  };

  if (!isOpen) return null;

  const tabs: { key: 'KLAIM' | 'TUKAR' | 'VOUCHER_SAYA'; label: string; icon: React.ReactNode }[] = [
    { key: 'KLAIM', label: 'Klaim', icon: <Zap size={14} /> },
    { key: 'TUKAR', label: 'Tukar', icon: <Gift size={14} /> },
    { key: 'VOUCHER_SAYA', label: 'Voucher', icon: <Ticket size={14} /> },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal — slides up from bottom on mobile */}
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="bg-white w-full max-w-md sm:rounded-[40px] rounded-t-[40px] overflow-hidden relative z-10 shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh]"
        >
          {/* Drag handle (mobile) */}
          <div className="flex justify-center pt-3 pb-1 sm:hidden">
            <div className="w-10 h-1 bg-slate-200 rounded-full" />
          </div>

          {/* Header */}
          <div className="px-6 pt-4 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-md shadow-orange-200">
                <Star size={18} fill="white" strokeWidth={0} />
              </div>
              <div>
                <h2 className="font-black text-base text-slate-800 leading-none">Mas Yanto Rewards</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Poin & Voucher Kamu</p>
              </div>
            </div>
            <button onClick={onClose} className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 active:scale-90 transition-all">
              <X size={18} />
            </button>
          </div>

          {/* Points banner */}
          <div className="px-6 pb-4">
            <div className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-400 rounded-[28px] px-6 py-4 flex items-center justify-between shadow-lg shadow-orange-200/60 relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-white/80 text-[10px] font-black uppercase tracking-[0.2em] leading-none">Saldo Poin</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-3xl font-black text-white">{points.toLocaleString('id-ID')}</p>
                  <Star size={18} fill="white" strokeWidth={0} className="mb-1" />
                </div>
              </div>
              <div className="relative z-10 text-right">
                <p className="text-white/70 text-[9px] font-bold uppercase tracking-wider">Setara dengan</p>
                <p className="text-white font-black text-sm">Rp {(points * 100).toLocaleString('id-ID')}</p>
              </div>
              {/* Decorative circles */}
              <div className="absolute -right-6 -top-6 w-28 h-28 bg-white/10 rounded-full" />
              <div className="absolute -right-2 -bottom-8 w-20 h-20 bg-white/10 rounded-full" />
            </div>
          </div>

          {/* Tabs */}
          <div className="px-6 pb-3">
            <div className="bg-slate-100 p-1 rounded-2xl flex gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-2.5 rounded-xl font-black text-[11px] transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === tab.key
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-400'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-6">
            <AnimatePresence mode="wait">

              {/* ─── Tab: KLAIM ─── */}
              {activeTab === 'KLAIM' && (
                <motion.div
                  key="klaim"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  {/* Simulate Kiosk Scan */}
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-3xl p-5 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#FF6B00] rounded-2xl flex items-center justify-center text-white shadow-md shadow-orange-300">
                        <Zap size={18} />
                      </div>
                      <div>
                        <p className="font-black text-slate-800 text-sm">Scan Barcode Kioska</p>
                        <p className="text-slate-500 text-[11px] font-semibold">Klaim +50 poin setelah transaksi</p>
                      </div>
                    </div>

                    <AnimatePresence mode="wait">
                      {kioskSimStatus === 'idle' && (
                        <motion.button
                          key="btn-scan"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          onClick={simulateKioskScan}
                          className="w-full bg-[#FF6B00] hover:bg-[#e66000] text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-orange-300/40 active:scale-95 transition-all flex items-center justify-center gap-2.5"
                        >
                          <Scan size={18} />
                          Simulasi Scan Barcode Kioska
                        </motion.button>
                      )}

                      {kioskSimStatus === 'scanning' && (
                        <motion.div
                          key="scanning"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex flex-col items-center py-4 gap-3"
                        >
                          <div className="relative w-14 h-14">
                            <div className="absolute inset-0 rounded-full border-4 border-orange-200 border-t-[#FF6B00] animate-spin" />
                            <div className="absolute inset-2 rounded-full bg-orange-50 flex items-center justify-center">
                              <Scan size={16} className="text-[#FF6B00]" />
                            </div>
                          </div>
                          <p className="text-[#FF6B00] font-black text-sm animate-pulse">Membaca barcode kioska...</p>
                        </motion.div>
                      )}

                      {kioskSimStatus === 'success' && (
                        <motion.div
                          key="success"
                          initial={{ scale: 0.85, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex flex-col items-center py-3 gap-2 text-center"
                        >
                          <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500">
                            <CheckCircle2 size={32} />
                          </div>
                          <p className="font-black text-slate-800 text-base">+50 Poin Berhasil Diklaim!</p>
                          <p className="text-slate-400 text-xs font-semibold">Saldo poin kamu sudah diperbarui.</p>
                          <button
                            onClick={resetKiosk}
                            className="mt-2 px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-black text-xs"
                          >
                            Scan Lagi
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Form Input Kode Promo */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4">
                    <p className="font-black text-slate-800 text-sm">Punya Kode Voucher?</p>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Masukkan kode..." 
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-bold text-sm uppercase outline-none focus:border-[#FF6B00] transition-colors"
                      />
                      <button 
                        onClick={handleClaimPromo}
                        disabled={!promoCode.trim()}
                        className="bg-slate-900 text-white px-5 rounded-xl font-black text-sm disabled:opacity-50 transition-opacity active:scale-95"
                      >
                        Klaim
                      </button>
                    </div>
                  </div>

                  {/* QR Code saya */}
                  <div className="border border-slate-100 rounded-3xl p-5 space-y-4">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Kode QR Saya</p>
                    <div className="flex justify-center">
                      <div className="bg-white p-4 rounded-3xl shadow-md border border-slate-100">
                        <QRCodeSVG
                          value={`USER-POINTS-${points}`}
                          size={160}
                          level="H"
                          includeMargin={true}
                        />
                      </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3 flex items-start gap-2.5">
                      <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />
                      <p className="text-[11px] text-blue-700 font-semibold leading-relaxed">
                        Tunjukkan QR ini ke kasir atau arahkan ke mesin kioska untuk mengumpulkan poin dari setiap pembelian.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ─── Tab: TUKAR ─── */}
              {activeTab === 'TUKAR' && (
                <motion.div
                  key="tukar"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-3"
                >
                  {/* Redeem success toast */}
                  <AnimatePresence>
                    {redeemSuccess && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center gap-3"
                      >
                        <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                        <p className="text-emerald-700 text-xs font-black">
                          Voucher "{redeemSuccess}" berhasil ditukar! Cek di tab Voucher.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {voucherCatalog.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed border-slate-200 rounded-[28px] bg-white">
                      <div className="bg-orange-50 p-4 rounded-full text-[#FF6B00] mb-3">
                        <Gift size={24} />
                      </div>
                      <h4 className="font-extrabold text-slate-700 text-xs sm:text-sm">Katalog Penukaran Kosong</h4>
                      <p className="text-slate-400 text-[10px] font-semibold mt-1.5 max-w-xs leading-relaxed">
                        Saat ini belum ada voucher penukaran poin yang tersedia.
                      </p>
                    </div>
                  ) : (
                    voucherCatalog.map((v, i) => {
                      const canAfford = points >= v.cost;
                      return (
                        <motion.div
                          key={v.id}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className={`border rounded-3xl overflow-hidden transition-all ${canAfford ? 'border-slate-100' : 'border-slate-100 opacity-60'}`}
                        >
                          <div className={`bg-gradient-to-r ${v.color} px-5 py-3.5 flex items-center gap-3`}>
                            <span className="text-2xl">{v.icon}</span>
                            <div className="flex-1">
                              <p className="text-white font-black text-sm leading-tight">{v.title}</p>
                              <p className="text-white/80 text-[11px] font-semibold">{v.description}</p>
                            </div>
                            <div className="bg-white/20 backdrop-blur px-3 py-1.5 rounded-xl text-center">
                              <p className="text-white font-black text-base leading-none">{v.discount}</p>
                            </div>
                          </div>
                          <div className="bg-white px-5 py-3.5 flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <Star size={14} fill="#f59e0b" className="text-amber-400" />
                              <p className="font-black text-slate-800 text-sm">{v.cost} Poin</p>
                              <span className="text-slate-300 text-xs">·</span>
                              <p className="text-slate-400 text-xs font-semibold">Berlaku {v.expiry}</p>
                            </div>
                            <button
                              disabled={!canAfford}
                              onClick={() => handleRedeemVoucher(v)}
                              className={`px-5 py-2.5 rounded-xl font-black text-xs transition-all active:scale-95 ${
                                canAfford
                                  ? 'bg-[#FF6B00] text-white shadow-md shadow-orange-200'
                                  : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                              }`}
                            >
                              {canAfford ? 'Tukar' : 'Kurang Poin'}
                            </button>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </motion.div>
              )}

              {/* ─── Tab: VOUCHER SAYA ─── */}
              {activeTab === 'VOUCHER_SAYA' && (
                <motion.div
                  key="voucher-saya"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-3"
                >
                  {myVouchers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="bg-slate-100 p-6 rounded-full text-slate-300 mb-4">
                        <Ticket size={40} />
                      </div>
                      <h4 className="font-black text-slate-700 text-base">Belum Ada Voucher</h4>
                      <p className="text-slate-400 text-xs font-semibold mt-1.5 max-w-xs leading-relaxed">
                        Tukar poin kamu dengan voucher menarik di tab <strong>Tukar Poin</strong>!
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pb-1">Voucher Aktif ({myVouchers.filter(v => !v.used).length})</p>
                      {myVouchers.filter(v => !v.used).map((v, i) => (
                        <motion.button
                          key={v.code}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.06 }}
                          onClick={() => setSelectedVoucher(v)}
                          className="w-full text-left border border-slate-100 rounded-3xl overflow-hidden active:scale-[0.98] transition-all shadow-sm hover:shadow-md"
                        >
                          <div className={`bg-gradient-to-r ${v.color} px-5 py-3 flex items-center gap-3`}>
                            <span className="text-xl">{v.icon}</span>
                            <div className="flex-1">
                              <p className="text-white font-black text-sm">{v.title}</p>
                              <p className="text-white/80 text-[11px] font-semibold">{v.description}</p>
                            </div>
                            <div className="bg-white/20 px-2.5 py-1 rounded-xl">
                              <p className="text-white font-black text-sm">{v.discount}</p>
                            </div>
                          </div>
                          <div className="bg-white px-5 py-3 flex items-center justify-between">
                            <div>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Diklaim</p>
                              <p className="text-slate-600 text-xs font-semibold">{v.claimedAt}</p>
                            </div>
                            <div className="flex items-center gap-1.5 bg-orange-50 px-3 py-1.5 rounded-xl">
                              <QrCode size={14} className="text-[#FF6B00]" />
                              <p className="text-[#FF6B00] text-[11px] font-black">Lihat Barcode</p>
                              <ChevronRight size={12} className="text-[#FF6B00]" />
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </>
                  )}
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-slate-50 bg-slate-50/50 flex items-center justify-center gap-1.5 opacity-40">
            <Star size={11} fill="currentColor" className="text-slate-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Mas Yanto Rewards</span>
          </div>
        </motion.div>

        {/* ─── Barcode Detail Modal ─── */}
        <AnimatePresence>
          {selectedVoucher && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedVoucher(null)}
                className="absolute inset-0 bg-slate-900/70 backdrop-blur-md"
              />
              <motion.div
                initial={{ y: 60, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 60, opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', damping: 26, stiffness: 300 }}
                className="bg-white w-full max-w-sm rounded-[36px] overflow-hidden shadow-2xl relative z-10"
              >
                {/* Header gradient */}
                <div className={`bg-gradient-to-r ${selectedVoucher.color} px-6 pt-8 pb-10 text-center relative`}>
                  <button
                    onClick={() => setSelectedVoucher(null)}
                    className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white active:scale-90 transition-all"
                  >
                    <X size={16} />
                  </button>
                  <p className="text-4xl mb-2">{selectedVoucher.icon}</p>
                  <h3 className="text-white font-black text-lg leading-tight">{selectedVoucher.title}</h3>
                  <p className="text-white/80 text-xs font-semibold mt-1">{selectedVoucher.description}</p>
                  <div className="absolute -bottom-px left-0 right-0 h-8 bg-white" style={{ borderRadius: '50% 50% 0 0 / 100% 100% 0 0', transform: 'scaleX(1.1)' }} />
                </div>

                {/* Barcode area */}
                <div className="px-6 pt-4 pb-8 space-y-5">
                  <div className="flex flex-col items-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Barcode Voucher</p>
                    <BarcodeVisual value={selectedVoucher.code} />
                  </div>

                  {/* Instruction */}
                  <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-3">
                    <ShoppingBag size={16} className="text-amber-500 mt-0.5 shrink-0" />
                    <p className="text-amber-800 text-[11px] font-semibold leading-relaxed">
                      Arahkan barcode ini ke kamera mesin kioska untuk mendapatkan potongan harga secara otomatis.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-2xl p-3 text-center">
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Nilai</p>
                      <p className="font-black text-slate-800 text-base mt-0.5">{selectedVoucher.discount}</p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-3 text-center">
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Berlaku</p>
                      <p className="font-black text-slate-800 text-base mt-0.5">{selectedVoucher.expiry}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedVoucher(null)}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm active:scale-95 transition-all"
                  >
                    Tutup
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
}
