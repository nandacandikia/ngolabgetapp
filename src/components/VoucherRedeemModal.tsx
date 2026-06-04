import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Ticket, Gift, CheckCircle2, AlertCircle, Sparkles, 
  ChevronRight, Copy, Check, Star, Lock, Clock, History, 
  ArrowRight, Info, AlertTriangle
} from 'lucide-react';
import { Voucher, MyVoucher } from '../types';

interface VoucherRedeemModalProps {
  isOpen: boolean;
  onClose: () => void;
  myVouchers: MyVoucher[];
  setMyVouchers: React.Dispatch<React.SetStateAction<MyVoucher[]>>;
  isInline?: boolean;
  points?: number;
  onClaimPoints?: (amount: number) => void;
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

const VOUCHER_CATALOG: Voucher[] = [
  {
    id: 'v1',
    title: 'Potongan Rp5.000',
    description: 'Berlaku untuk pembelian minimum Rp25.000',
    cost: 100,
    discount: 'Rp5.000',
    expiry: '30 hari',
    color: 'from-orange-400 to-red-400',
    icon: '🎫',
  },
  {
    id: 'v2',
    title: 'Gratis Es Jeruk Peras',
    description: 'Tambah 1 Es Jeruk Peras gratis ke pesananmu',
    cost: 50,
    discount: 'GRATIS',
    expiry: '14 hari',
    color: 'from-yellow-400 to-orange-400',
    icon: '🍊',
  },
  {
    id: 'v3',
    title: 'Potongan Rp10.000',
    description: 'Berlaku untuk pembelian minimum Rp50.000',
    cost: 180,
    discount: 'Rp10.000',
    expiry: '30 hari',
    color: 'from-emerald-400 to-teal-500',
    icon: '💸',
  },
  {
    id: 'v4',
    title: 'Gratis Batagor Bandung',
    description: 'Tambah 1 porsi Batagor Bandung gratis',
    cost: 150,
    discount: 'GRATIS',
    expiry: '14 hari',
    color: 'from-purple-400 to-pink-500',
    icon: '🥢',
  },
];

function generateBarcodeValue(voucherId: string): string {
  return `MASYANTO-VCR-${voucherId.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
}

// Visual barcode component using CSS bars
function BarcodeVisual({ value }: { value: string }) {
  const bars: number[] = [];
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    bars.push((code % 3) + 1); // 1, 2, or 3
    bars.push(((code >> 2) % 2) + 1); // 1 or 2 (gap)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="flex items-stretch gap-0 bg-white px-5 py-6 rounded-2xl border border-slate-100 shadow-inner"
        style={{ height: 95 }}
      >
        {bars.map((w, i) => (
          <div
            key={i}
            style={{
              width: w * 2.2,
              backgroundColor: i % 2 === 0 ? '#1e293b' : 'transparent',
              height: '100%',
              flexShrink: 0,
            }}
          />
        ))}
      </div>
      <p className="font-mono text-[10px] text-slate-400 tracking-[0.25em] uppercase font-bold">
        {value.slice(-16)}
      </p>
    </div>
  );
}

export default function VoucherRedeemModal({ 
  isOpen, 
  onClose, 
  myVouchers, 
  setMyVouchers, 
  isInline = false,
  points = 0,
  onClaimPoints
}: VoucherRedeemModalProps) {
  // Navigation: my_vouchers, redeem_points, promo_code
  const [activeSubTab, setActiveSubTab] = useState<'my_vouchers' | 'redeem_points' | 'promo_code'>('my_vouchers');
  
  // Redeem Code States
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'validating' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [successVoucher, setSuccessVoucher] = useState<MyVoucher | null>(null);

  // Points Exchange States
  const [exchangingId, setExchangingId] = useState<string | null>(null);
  const [exchangeSuccessVoucher, setExchangeSuccessVoucher] = useState<MyVoucher | null>(null);

  // Clipboard Copied feedback
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Selected Voucher Detail Modal
  const [selectedVoucher, setSelectedVoucher] = useState<MyVoucher | null>(null);

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

  const handleExchangingPoints = async (voucher: Voucher) => {
    if (points < voucher.cost || !onClaimPoints) return;

    setExchangingId(voucher.id);
    
    // Simulate transaction latency
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newVoucher: MyVoucher = {
      ...voucher,
      claimedAt: new Date().toLocaleString('id-ID'),
      code: generateBarcodeValue(voucher.id),
      used: false,
    };

    // Deduct points
    onClaimPoints(-voucher.cost);

    // Save to user wallet
    const updated = [newVoucher, ...myVouchers];
    setMyVouchers(updated);
    localStorage.setItem('maslahat_my_vouchers', JSON.stringify(updated));

    setExchangeSuccessVoucher(newVoucher);
    setExchangingId(null);
  };

  const handleSuggestionClick = (suggestedCode: string) => {
    if (status === 'validating') return;
    setCode(suggestedCode);
    setStatus('idle');
    setErrorMessage('');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const resetState = () => {
    setCode('');
    setStatus('idle');
    setErrorMessage('');
    setSuccessVoucher(null);
  };

  if (!isOpen && !isInline) return null;

  // Render a beautifully formatted ticket voucher
  const renderTicketCard = (v: MyVoucher | Voucher, onClick?: () => void, isUsed: boolean = false, isClaimed: boolean = false) => {
    return (
      <div 
        key={v.id + (('code' in v) ? v.code : '')}
        onClick={onClick}
        className={`relative flex bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm transition-all ${
          isUsed 
            ? 'grayscale opacity-60' 
            : 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer'
        }`}
      >
        {/* Left Side Accent */}
        <div className={`w-24 bg-gradient-to-br ${v.color} shrink-0 flex flex-col items-center justify-center text-white p-3 text-center relative`}>
          <span className="text-2xl mb-1">{v.icon}</span>
          <span className="font-black text-xs leading-none uppercase tracking-wider">{v.discount}</span>
          
          {/* Ticket notch punches (aligned perfectly with divider line) */}
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-slate-50 border border-slate-100 rounded-full z-10" />
          <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-slate-50 border border-slate-100 rounded-full z-10" />
        </div>

        {/* Dashed Separator */}
        <div className="w-0.5 border-r-2 border-dashed border-slate-200/80 my-3 z-10" />

        {/* Right Side Content */}
        <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-black text-slate-800 text-xs sm:text-sm truncate leading-tight">{v.title}</h4>
              {isClaimed && (
                <span className="bg-emerald-50 text-emerald-600 text-[8px] font-bold px-2 py-0.5 rounded-full shrink-0">
                  Aktif
                </span>
              )}
            </div>
            <p className="text-slate-500 text-[10px] font-semibold mt-1 leading-relaxed line-clamp-2">
              {v.description}
            </p>
          </div>

          <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-50">
            <div className="flex items-center gap-1 text-slate-400">
              <Clock size={10} />
              <span className="text-[9px] font-bold">Masa Berlaku: {v.expiry}</span>
            </div>
            {onClick && !isUsed && (
              <span className="text-[9px] font-black text-[#FF6B00] bg-orange-50 group-hover:bg-[#FF6B00] group-hover:text-white px-2.5 py-1 rounded-lg transition-all">
                Gunakan →
              </span>
            )}
            {isUsed && (
              <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
                Telah Dipakai
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const cardContent = (
    <div className={`bg-white w-full max-w-2xl mx-auto rounded-[36px] overflow-hidden relative z-10 ${isInline ? 'shadow-xl shadow-slate-100/50 border border-slate-100' : 'shadow-2xl'} flex flex-col`}>
      
      {/* Drag Handle for Mobile */}
      {!isInline && (
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>
      )}

      {/* Header */}
      <div className="px-6 pt-5 pb-4 flex items-center justify-between border-b border-slate-50 bg-gradient-to-r from-orange-500/5 to-amber-500/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B00] to-amber-500 rounded-2xl flex items-center justify-center shadow-md shadow-orange-100">
            <Ticket size={18} className="text-white" />
          </div>
          <div className="text-left">
            <h2 className="font-black text-base text-slate-800 leading-none">Voucher Hub</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Kelola & Klaim Promo</p>
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

      {/* Sub-tab Navigation pills */}
      <div className="px-6 pt-4 pb-2 border-b border-slate-50 bg-slate-50/20">
        <div className="bg-slate-100/80 p-1.5 rounded-2xl flex gap-1 shadow-inner border border-slate-200/20">
          <button
            onClick={() => setActiveSubTab('my_vouchers')}
            className={`flex-1 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              activeSubTab === 'my_vouchers'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Ticket size={14} />
            Voucher Saya
          </button>
          <button
            onClick={() => setActiveSubTab('redeem_points')}
            className={`flex-1 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              activeSubTab === 'redeem_points'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Gift size={14} />
            Tukar Poin
          </button>
          <button
            onClick={() => setActiveSubTab('promo_code')}
            className={`flex-1 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              activeSubTab === 'promo_code'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Sparkles size={14} />
            Klaim Kode
          </button>
        </div>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 bg-slate-50">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: VOUCHER SAYA (Wallet) */}
          {activeSubTab === 'my_vouchers' && (
            <motion.div
              key="tab-my-vouchers"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-4"
            >
              {myVouchers.filter(v => !v.used).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed border-slate-200 rounded-[28px] bg-white">
                  <div className="bg-orange-50 p-6 rounded-full text-[#FF6B00] mb-4">
                    <Ticket size={36} className="animate-pulse" />
                  </div>
                  <h4 className="font-black text-slate-700 text-sm sm:text-base">Dompet Voucher Kosong</h4>
                  <p className="text-slate-400 text-xs font-semibold mt-2 max-w-xs leading-relaxed">
                    Kamu belum memiliki voucher aktif. Yuk, tukarkan poin reward-mu atau klaim kode promo sekarang!
                  </p>
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setActiveSubTab('redeem_points')}
                      className="px-5 py-2.5 bg-[#FF6B00] hover:bg-[#e66000] text-white rounded-xl font-black text-xs shadow-md shadow-orange-100 active:scale-95 transition-all flex items-center gap-1.5"
                    >
                      <Gift size={13} />
                      Tukar Poin
                    </button>
                    <button
                      onClick={() => setActiveSubTab('promo_code')}
                      className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-black text-xs active:scale-95 transition-all flex items-center gap-1.5"
                    >
                      <Sparkles size={13} />
                      Klaim Kode
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pl-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Voucher Aktif ({myVouchers.filter(v => !v.used).length})
                    </p>
                    <span className="text-[9px] text-slate-400 font-semibold">Klik voucher untuk melihat barcode</span>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {myVouchers.filter(v => !v.used).map((v) => 
                      renderTicketCard(v, () => setSelectedVoucher(v), false, true)
                    )}
                  </div>
                </div>
              )}

              {/* Accordion for Used/Expired Vouchers history */}
              {myVouchers.filter(v => v.used).length > 0 && (
                <div className="pt-2">
                  <details className="group border border-slate-100 rounded-3xl bg-white/60 overflow-hidden transition-all">
                    <summary className="flex items-center justify-between p-4 font-black text-[10px] text-slate-400 uppercase tracking-widest cursor-pointer select-none outline-none">
                      <div className="flex items-center gap-2">
                        <History size={13} />
                        <span>Riwayat Voucher ({myVouchers.filter(v => v.used).length})</span>
                      </div>
                      <ChevronRight size={14} className="text-slate-400 group-open:rotate-90 transition-transform" />
                    </summary>
                    <div className="px-4 pb-4 space-y-3 border-t border-slate-100/50 pt-3 bg-slate-50/50">
                      {myVouchers.filter(v => v.used).map((v) => 
                        renderTicketCard(v, undefined, true, false)
                      )}
                    </div>
                  </details>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 2: TUKAR POIN (Redeem points catalogue) */}
          {activeSubTab === 'redeem_points' && (
            <motion.div
              key="tab-redeem-points"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-5"
            >
              {/* Points Card Banner */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-[#FF6B00] rounded-[28px] px-6 py-5 flex items-center justify-between shadow-lg shadow-slate-200 relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-white/60 text-[9px] font-black uppercase tracking-[0.2em] leading-none">Saldo Poin Anda</p>
                  <div className="flex items-baseline gap-1.5 mt-1.5">
                    <p className="text-3xl font-black text-white leading-none">{points.toLocaleString('id-ID')}</p>
                    <Star size={18} fill="#f59e0b" strokeWidth={0} className="text-amber-400" />
                  </div>
                </div>
                <div className="relative z-10 text-right">
                  <p className="text-white/50 text-[9px] font-bold uppercase tracking-wider leading-none">Estimasi Nilai</p>
                  <p className="text-[#FF6B00] font-black text-base mt-1.5">Rp {(points * 100).toLocaleString('id-ID')}</p>
                </div>
                {/* Decorative circles */}
                <div className="absolute -right-6 -top-6 w-28 h-28 bg-white/5 rounded-full" />
                <div className="absolute -right-2 -bottom-8 w-20 h-20 bg-white/5 rounded-full" />
              </div>

              {/* Exchange Success Announcement */}
              <AnimatePresence>
                {exchangeSuccessVoucher && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-emerald-50 border border-emerald-100 p-4 rounded-3xl flex flex-col gap-3 relative overflow-hidden"
                  >
                    <div className="flex items-start gap-3">
                      <div className="bg-emerald-500 text-white p-1.5 rounded-full shrink-0">
                        <CheckCircle2 size={16} />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-xs">Penukaran Poin Berhasil!</h4>
                        <p className="text-slate-500 text-[10px] font-semibold mt-0.5">
                          Voucher <strong>{exchangeSuccessVoucher.title}</strong> telah ditambahkan ke dompet voucher Anda.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setExchangeSuccessVoucher(null);
                        setActiveSubTab('my_vouchers');
                      }}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl font-black text-[10px] uppercase tracking-wider shadow-sm transition-all"
                    >
                      Buka Dompet Voucher
                    </button>
                    <button
                      onClick={() => setExchangeSuccessVoucher(null)}
                      className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Catalog list */}
              <div className="space-y-3.5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                  Pilih Voucher untuk Ditukar
                </p>
                <div className="grid grid-cols-1 gap-4">
                  {VOUCHER_CATALOG.map((v) => {
                    const canAfford = points >= v.cost;
                    const isExchanging = exchangingId === v.id;

                    return (
                      <div 
                        key={v.id}
                        className={`relative rounded-3xl overflow-hidden bg-white border border-slate-100 shadow-sm flex flex-col transition-all ${
                          !canAfford && 'opacity-65'
                        }`}
                      >
                        {/* Upper Ticket Part */}
                        <div className={`bg-gradient-to-r ${v.color} px-5 py-4 flex items-center gap-3.5 relative`}>
                          <span className="text-2xl shrink-0">{v.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-black text-sm truncate leading-tight">{v.title}</p>
                            <p className="text-white/80 text-[10px] font-semibold truncate mt-0.5">{v.description}</p>
                          </div>
                          <div className="bg-white/20 backdrop-blur px-3 py-1.5 rounded-xl flex-shrink-0 text-center">
                            <p className="text-white font-black text-xs sm:text-sm leading-none uppercase">{v.discount}</p>
                          </div>

                          {/* Notch circle cuts */}
                          <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-slate-50 border border-slate-100 rounded-full z-10" />
                          <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-slate-50 border border-slate-100 rounded-full z-10" />
                        </div>

                        {/* Dashed boundary */}
                        <div className="w-full border-b-2 border-dashed border-slate-200/80 z-10" />

                        {/* Lower Control Part */}
                        <div className="px-5 py-3 flex items-center justify-between bg-slate-50/30">
                          <div className="flex items-center gap-1.5">
                            <Star size={13} fill="#f59e0b" strokeWidth={0} className="text-amber-400" />
                            <span className="font-extrabold text-slate-800 text-xs leading-none">{v.cost} Poin</span>
                            <span className="text-slate-300">·</span>
                            <span className="text-[10px] text-slate-400 font-semibold">Masa aktif {v.expiry}</span>
                          </div>

                          <button
                            disabled={!canAfford || isExchanging}
                            onClick={() => handleExchangingPoints(v)}
                            className={`px-5 py-2 rounded-xl font-black text-xs tracking-wide transition-all active:scale-95 flex items-center gap-1.5 ${
                              canAfford
                                ? 'bg-[#FF6B00] hover:bg-[#e66000] text-white shadow-md shadow-orange-100 cursor-pointer'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200/50'
                            }`}
                          >
                            {isExchanging ? (
                              <>
                                <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                Proses...
                              </>
                            ) : canAfford ? (
                              'Tukar Poin'
                            ) : (
                              <>
                                <Lock size={11} className="text-slate-400" />
                                Poin Kurang
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: KLAIM KODE (Manual promo input) */}
          {activeSubTab === 'promo_code' && (
            <motion.div
              key="tab-promo-code"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {status !== 'success' ? (
                <div className="space-y-5">
                  
                  {/* Banner */}
                  <div className="bg-white border border-slate-200/60 rounded-[28px] p-5 flex gap-4 shadow-sm">
                    <div className="bg-[#FF6B00] text-white p-3.5 rounded-2xl h-fit shadow-md shadow-orange-100 flex items-center justify-center shrink-0">
                      <Gift size={20} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm">Punya Kode Voucher Spesifik?</h4>
                      <p className="text-slate-500 text-[11px] font-semibold leading-relaxed mt-1">
                        Masukkan kode voucher unik yang Anda dapatkan dari event, promo kasir, atau sosial media untuk dikaitkan ke dompet voucher Anda.
                      </p>
                    </div>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleRedeem} className="space-y-4 bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm">
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
                          className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-5 py-4 font-black text-slate-800 uppercase tracking-widest text-sm outline-none focus:bg-white focus:border-[#FF6B00] focus:ring-2 focus:ring-orange-100 transition-all disabled:opacity-60 font-mono"
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
                      className="w-full bg-[#FF6B00] hover:bg-[#e66000] text-white py-4 rounded-2xl font-black text-sm tracking-wider uppercase shadow-lg shadow-orange-100 disabled:opacity-50 disabled:scale-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {status === 'validating' ? 'Memvalidasi Kode...' : 'Tukarkan Sekarang'}
                      <ChevronRight size={16} />
                    </button>
                  </form>

                  {/* Suggestion list */}
                  <div className="space-y-3 pt-3 border-t border-slate-200/50">
                    <div className="pl-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Kode Promo Aktif Hari Ini
                      </p>
                      <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Klik kode untuk memasukkan secara otomatis</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {Object.entries(REDEEMABLE_CODES).map(([promoKey, promoVal]) => {
                        const isClaimed = myVouchers.some((v) => v.id === `redeem-${promoKey.toLowerCase()}`);
                        return (
                          <button
                            key={promoKey}
                            type="button"
                            onClick={() => handleSuggestionClick(promoKey)}
                            disabled={status === 'validating'}
                            className={`flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all active:scale-[0.97] group ${
                              isClaimed
                                ? 'bg-slate-100/50 border-slate-200/50 opacity-60 cursor-default'
                                : 'bg-white border-slate-100 hover:border-orange-200 hover:bg-orange-50/10 cursor-pointer shadow-sm'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="text-lg shrink-0">{promoVal.icon}</span>
                              <div className="min-w-0">
                                <p className="font-black text-xs text-slate-800 truncate font-mono tracking-wide">{promoKey}</p>
                                <p className="text-[9px] font-bold text-slate-400 truncate mt-0.5">{promoVal.title}</p>
                              </div>
                            </div>
                            <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg transition-all ${
                              isClaimed 
                                ? 'bg-slate-100 text-slate-400' 
                                : 'text-[#FF6B00] bg-orange-50 group-hover:bg-[#FF6B00] group-hover:text-white'
                            }`}>
                              {isClaimed ? 'Klaim ✓' : 'Salin'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                // Success claim screen
                <motion.div
                  key="redeem-success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center py-6 text-center space-y-6 bg-white border border-slate-100 rounded-[36px] p-6 shadow-sm"
                >
                  <div className="relative">
                    <motion.div
                      animate={{ scale: [1, 1.12, 1], rotate: [0, 8, -8, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                      className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 shadow-inner"
                    >
                      <CheckCircle2 size={36} />
                    </motion.div>
                    <motion.div
                      animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute inset-0 border-2 border-emerald-400 rounded-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-widest">
                      <Sparkles size={11} />
                      Klaim Kode Berhasil
                    </div>
                    <h3 className="text-lg font-black text-slate-800 leading-tight">Voucher Baru Diklaim!</h3>
                    <p className="text-slate-500 text-xs font-semibold leading-relaxed max-w-xs mx-auto">
                      Kode berhasil ditukarkan. Voucher resmi disimpan ke dompet akun Anda dan siap digunakan.
                    </p>
                  </div>

                  {/* Render Visual Ticket Card */}
                  {successVoucher && (
                    <div className="w-full max-w-md text-left">
                      {renderTicketCard(successVoucher, undefined, false, false)}
                    </div>
                  )}

                  <div className="flex flex-col w-full gap-2.5 pt-2">
                    <button
                      onClick={() => {
                        resetState();
                        setActiveSubTab('my_vouchers');
                      }}
                      className="w-full bg-[#FF6B00] hover:bg-[#e66000] text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-md shadow-orange-100 transition-all cursor-pointer"
                    >
                      Buka Dompet Voucher
                    </button>
                    <button
                      onClick={resetState}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Klaim Kode Lain
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Footer Banner */}
      <div className="px-6 py-4 border-t border-slate-50 bg-slate-50/50 flex items-center justify-center gap-1.5 opacity-40">
        <Sparkles size={11} fill="currentColor" className="text-slate-500" />
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Mas Yanto Loyalty System</span>
      </div>

      {/* ─── Voucher Barcode Detail Overlay Modal ─── */}
      <AnimatePresence>
        {selectedVoucher && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            {/* Modal clickout backdrop */}
            <div className="absolute inset-0" onClick={() => setSelectedVoucher(null)} />
            
            <motion.div
              initial={{ y: 50, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 50, opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white w-full max-w-sm rounded-[36px] overflow-hidden shadow-2xl relative z-10 border border-slate-100"
            >
              {/* Header Gradient */}
              <div className={`bg-gradient-to-br ${selectedVoucher.color} px-6 pt-7 pb-9 text-center relative`}>
                <button
                  onClick={() => setSelectedVoucher(null)}
                  className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-all cursor-pointer"
                >
                  <X size={15} />
                </button>
                <p className="text-4xl mb-2">{selectedVoucher.icon}</p>
                <h3 className="text-white font-black text-base sm:text-lg leading-tight">{selectedVoucher.title}</h3>
                <p className="text-white/80 text-[11px] font-semibold mt-1 max-w-xs mx-auto leading-relaxed">{selectedVoucher.description}</p>
                
                {/* Curve bottom decorator */}
                <div className="absolute -bottom-px left-0 right-0 h-8 bg-white" style={{ borderRadius: '50% 50% 0 0 / 100% 100% 0 0', transform: 'scaleX(1.15)' }} />
              </div>

              {/* Barcode Area */}
              <div className="px-6 pt-3 pb-7 space-y-5">
                <div className="flex flex-col items-center">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Barcode Voucher Anda</span>
                  <BarcodeVisual value={selectedVoucher.code} />
                </div>

                {/* Claim code box with copy button */}
                <div className="bg-slate-50 border border-slate-200/50 rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[8px] text-slate-400 font-black uppercase tracking-wider leading-none mb-1">Kode Klaim</p>
                    <p className="font-mono font-black text-xs text-slate-800 truncate tracking-wider">{selectedVoucher.code}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(selectedVoucher.code)}
                    className="p-2 bg-white hover:bg-slate-100 text-[#FF6B00] rounded-xl border border-slate-200/60 transition-all cursor-pointer shrink-0"
                    title="Salin Kode"
                  >
                    {copiedText === selectedVoucher.code ? (
                      <Check size={14} className="text-emerald-500 animate-scale-up" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>

                {/* Instruction */}
                <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 flex items-start gap-3">
                  <Info size={16} className="text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-amber-800 text-[11px] font-semibold leading-relaxed">
                    Tunjukkan barcode ini ke kasir saat membayar, atau salin kode klaim di atas untuk dimasukkan pada halaman checkout pesanan Anda.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 rounded-2xl p-3 text-center border border-slate-100">
                    <p className="text-[8px] text-slate-400 font-black uppercase tracking-wider">Tipe Potongan</p>
                    <p className="font-black text-slate-800 text-sm mt-0.5 leading-none uppercase">{selectedVoucher.discount}</p>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-3 text-center border border-slate-100">
                    <p className="text-[8px] text-slate-400 font-black uppercase tracking-wider">Status Masa Aktif</p>
                    <p className="font-black text-slate-800 text-sm mt-0.5 leading-none">{selectedVoucher.expiry}</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedVoucher(null)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-slate-100"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
