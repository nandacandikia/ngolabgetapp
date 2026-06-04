import React, { useState, useMemo } from 'react';
import { 
  X, 
  Calendar, 
  ShoppingBag, 
  Star, 
  MessageSquare, 
  Search, 
  Award, 
  TrendingUp, 
  Wallet, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw, 
  Eye, 
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { Order } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onViewReceipt: (order: Order) => void;
  isInline?: boolean;
  onReorder?: (order: Order) => void;
  onStartOrdering?: () => void;
}

export default function OrderHistoryModal({ 
  isOpen, 
  onClose, 
  orders, 
  onViewReceipt, 
  isInline = false,
  onReorder,
  onStartOrdering
}: OrderHistoryModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

  // Toggle order expansion
  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  // Helper status mapping
  const getStatusConfig = (status: string) => {
    const s = (status || '').toUpperCase();
    if (s === 'PENDING' || s === 'MENUNGGU') {
      return {
        label: 'Menunggu',
        bgColor: 'bg-amber-50 border border-amber-100',
        textColor: 'text-amber-600',
        dotColor: 'bg-amber-500',
        icon: <Clock size={10} className="animate-spin-slow" />,
        pulse: true
      };
    }
    if (s === 'DIPROSES' || s === 'SEDANG DISIAPKAN' || s === 'PROSES' || s === 'SIAP DISAJIKAN' || s === 'SIAP') {
      return {
        label: s === 'SIAP DISAJIKAN' || s === 'SIAP' ? 'Siap Sajikan' : 'Dimasak',
        bgColor: 'bg-blue-50 border border-blue-100',
        textColor: 'text-blue-600',
        dotColor: 'bg-blue-500',
        icon: <Clock size={10} className="animate-pulse" />,
        pulse: true
      };
    }
    if (s === 'SELESAI') {
      return {
        label: 'Selesai',
        bgColor: 'bg-emerald-50 border border-emerald-100',
        textColor: 'text-emerald-600',
        dotColor: 'bg-emerald-500',
        icon: <CheckCircle2 size={10} />,
        pulse: false
      };
    }
    if (s === 'DIBATALKAN' || s === 'BATAL') {
      return {
        label: 'Batal',
        bgColor: 'bg-rose-50 border border-rose-100',
        textColor: 'text-rose-600',
        dotColor: 'bg-rose-500',
        icon: <XCircle size={10} />,
        pulse: false
      };
    }
    return {
      label: status,
      bgColor: 'bg-slate-50 border border-slate-100',
      textColor: 'text-slate-600',
      dotColor: 'bg-slate-400',
      icon: <HelpCircle size={10} />,
      pulse: false
    };
  };

  // Compute stats metrics
  const stats = useMemo(() => {
    let totalSpend = 0;
    let totalOrders = orders.length;
    let totalPoints = 0;

    orders.forEach(order => {
      const s = (order.status || '').toUpperCase();
      if (s !== 'DIBATALKAN' && s !== 'BATAL') {
        totalSpend += order.total;
        totalPoints += order.pointsEarned || 0;
      }
    });

    return { totalSpend, totalOrders, totalPoints };
  }, [orders]);

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // 1. Status Filter Tab
      const s = (order.status || '').toUpperCase();
      const isCancelled = s === 'DIBATALKAN' || s === 'BATAL';
      const isCompleted = s === 'SELESAI';
      const isActive = !isCancelled && !isCompleted;

      if (statusFilter === 'ACTIVE' && !isActive) return false;
      if (statusFilter === 'COMPLETED' && !isCompleted) return false;
      if (statusFilter === 'CANCELLED' && !isCancelled) return false;

      // 2. Search Query Filter
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchId = order.id.toLowerCase().includes(q);
        const matchItem = order.items.some(item => item.name.toLowerCase().includes(q));
        const matchTable = order.tableNumber.toLowerCase().includes(q);
        const matchCustomer = order.customerName?.toLowerCase().includes(q);
        return matchId || matchItem || matchTable || matchCustomer;
      }

      return true;
    });
  }, [orders, statusFilter, searchQuery]);

  const cardContent = (
    <div className={`bg-white w-full max-w-2xl mx-auto rounded-[32px] overflow-hidden ${isInline ? 'shadow-xl shadow-slate-100/50 border border-slate-100' : 'shadow-2xl border border-slate-100'} flex flex-col relative z-10`}>
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-orange-500/5 to-amber-500/5 shrink-0">
        <div className="flex items-center gap-3 text-left">
          <div className="bg-[#FF6B00] text-white p-2.5 rounded-2xl shadow-md shadow-orange-500/10">
            <ShoppingBag size={20} />
          </div>
          <div>
            <h3 className="font-black text-slate-800 text-lg">Riwayat Pesanan</h3>
            <p className="text-slate-400 text-xs font-semibold">Daftar transaksi kuliner Anda</p>
          </div>
        </div>
        {!isInline && (
          <button
            onClick={onClose}
            className="w-10 h-10 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-full flex items-center justify-center border border-slate-100 transition-colors active:scale-90 cursor-pointer"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Sticky Search, Filters, and Stats */}
      {orders.length > 0 && (
        <div className="p-5 pb-3 border-b border-slate-100 bg-white space-y-4 shrink-0 shadow-sm shadow-slate-500/5">
          {/* Mini Dashboard Stats */}
          <div className="grid grid-cols-3 gap-2 bg-gradient-to-br from-slate-50 to-slate-100/60 p-3 rounded-2xl border border-slate-100 text-left">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-orange-100/70 text-[#FF6B00] rounded-xl shrink-0">
                <Wallet size={14} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-none">Total Belanja</p>
                <p className="font-extrabold text-slate-800 text-xs sm:text-sm mt-1 truncate">Rp {stats.totalSpend.toLocaleString('id-ID')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 border-l border-slate-200 pl-2">
              <div className="p-2 bg-blue-100/70 text-blue-600 rounded-xl shrink-0">
                <TrendingUp size={14} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-none">Transaksi</p>
                <p className="font-extrabold text-slate-800 text-xs sm:text-sm mt-1 truncate">{stats.totalOrders} Pesanan</p>
              </div>
            </div>
            <div className="flex items-center gap-2 border-l border-slate-200 pl-2">
              <div className="p-2 bg-amber-100/70 text-amber-600 rounded-xl shrink-0">
                <Award size={14} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-none">Poin Reward</p>
                <p className="font-extrabold text-slate-800 text-xs sm:text-sm mt-1 truncate">+{stats.totalPoints} Poin</p>
              </div>
            </div>
          </div>

          {/* Search bar & filter tabs */}
          <div className="space-y-2.5">
            <div className="relative flex items-center">
              <Search size={15} className="absolute left-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari ID transaksi, nama makanan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-100 hover:border-slate-200 focus:border-orange-500 focus:bg-white rounded-xl text-xs font-semibold focus:outline-none transition-all placeholder-slate-400 text-slate-700 shadow-inner"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 p-1 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
                >
                  <X size={10} />
                </button>
              )}
            </div>

            <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {[
                { key: 'ALL', label: 'Semua' },
                { key: 'ACTIVE', label: 'Dalam Proses' },
                { key: 'COMPLETED', label: 'Selesai' },
                { key: 'CANCELLED', label: 'Batal' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    statusFilter === tab.key
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/15 scale-[1.03]'
                      : 'bg-slate-100 hover:bg-slate-200/80 text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Content list */}
      <div className={`flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50 no-scrollbar ${isInline ? 'max-h-[60vh]' : 'max-h-[65vh]'}`}>
        {orders.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-orange-100 rounded-full scale-150 blur-xl opacity-60 animate-pulse" />
              <div className="relative bg-gradient-to-tr from-orange-500 to-amber-400 text-white p-7 rounded-full shadow-lg shadow-orange-500/10">
                <ShoppingBag size={48} strokeWidth={1.5} />
              </div>
            </div>
            <h4 className="font-extrabold text-slate-800 text-lg">Belum Ada Pesanan</h4>
            <p className="text-slate-400 text-xs font-semibold max-w-xs mt-2 leading-relaxed">
              Dapur kami menanti pesanan pertama Anda! Temukan menu lezat hari ini dan pesan langsung dari meja Anda.
            </p>
            {onStartOrdering && (
              <button
                onClick={onStartOrdering}
                className="mt-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs uppercase tracking-widest px-8 py-3.5 rounded-2xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all cursor-pointer"
              >
                Pesan Sekarang
              </button>
            )}
          </div>
        ) : filteredOrders.length === 0 ? (
          /* Search/Filter Empty State */
          <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-3xl border border-slate-100 p-6">
            <div className="bg-slate-100 p-4 rounded-full text-slate-300 mb-3">
              <Search size={28} />
            </div>
            <h4 className="font-bold text-slate-700 text-sm">Pesanan Tidak Ditemukan</h4>
            <p className="text-slate-400 text-xs font-medium max-w-xs mt-1 leading-relaxed">
              Tidak ada riwayat transaksi yang sesuai dengan kata kunci atau filter yang Anda pilih.
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const statusConfig = getStatusConfig(order.status);
            const isExpanded = !!expandedOrders[order.id];
            
            // Format order summary string
            const summaryString = order.items.map(i => `${i.name} (${i.quantity}x)`).join(', ');

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow relative overflow-hidden group text-left"
              >
                {/* Dynamic Status Glow Bar */}
                <div className={`absolute top-0 left-0 right-0 h-[3px] bg-slate-100 ${
                  order.status === 'PENDING' || order.status === 'Menunggu' ? 'bg-amber-400' :
                  order.status === 'SELESAI' ? 'bg-emerald-500' :
                  order.status === 'DIBATALKAN' || order.status === 'Batal' ? 'bg-rose-500' : 'bg-blue-500'
                }`} />

                {/* Top Order Meta */}
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[10px] font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                        {order.id}
                      </span>
                      <div className={`inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-lg font-bold uppercase tracking-wider ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                        {statusConfig.icon}
                        <span>{statusConfig.label}</span>
                        {statusConfig.pulse && (
                          <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotColor} animate-ping absolute ml-[3px] opacity-75`} style={{ position: 'relative' }} />
                        )}
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-lg flex items-center gap-1 border border-slate-100">
                        <MapPin size={9} />
                        Meja {order.tableNumber}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 text-[10px] font-semibold">
                      <Calendar size={11} />
                      <span>{order.timestamp}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-none mb-1">
                      Total Bayar
                    </p>
                    <p className="font-black text-[#FF6B00] text-base">
                      Rp {order.total.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>

                {/* Order Item Summary / Collage */}
                <div 
                  onClick={() => toggleOrderExpand(order.id)}
                  className="border-t border-dashed border-slate-100 pt-3 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 p-1.5 -mx-1.5 rounded-xl transition-all"
                >
                  {!isExpanded ? (
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Image Thumbnail Collage */}
                      <div className="flex -space-x-2 shrink-0">
                        {order.items.slice(0, 3).map((item, idx) => (
                          <div 
                            key={idx} 
                            className="relative inline-block h-8 w-8 rounded-xl ring-2 ring-white overflow-hidden bg-slate-100 shadow-sm border border-slate-100"
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 ring-2 ring-white text-[9px] font-black text-slate-500 shadow-sm border border-slate-100">
                            +{order.items.length - 3}
                          </div>
                        )}
                      </div>
                      {/* Truncated Text Summary */}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-700 truncate max-w-[280px] sm:max-w-[340px]">
                          {summaryString}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {order.items.reduce((sum, i) => sum + i.quantity, 0)} item dipesan
                        </p>
                      </div>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Detail Makanan & Minuman
                    </span>
                  )}
                  
                  <div className="text-slate-400 shrink-0 bg-slate-50 p-1 rounded-lg">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {/* Detailed Collapsible Items List */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t border-slate-100 pt-3 space-y-3"
                    >
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-start gap-3 bg-slate-50/50 p-2.5 rounded-2xl border border-slate-100/50 text-xs">
                          <div className="flex items-center gap-3">
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="w-10 h-10 object-cover rounded-xl border border-slate-200 bg-white"
                            />
                            <div>
                              <p className="font-bold text-slate-800">
                                {item.name}
                              </p>
                              <p className="text-slate-400 text-[10px] font-semibold mt-0.5">
                                Rp {item.price.toLocaleString('id-ID')} x{item.quantity}
                              </p>
                              {item.note && (
                                <div className="flex items-start gap-1 text-[9px] text-[#FF6B00] bg-orange-50/60 px-2 py-1 rounded-lg mt-1 border border-orange-100/30">
                                  <MessageSquare size={10} className="shrink-0 mt-0.5" />
                                  <span className="italic font-medium">"{item.note}"</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <span className="font-bold text-slate-700">
                            Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                          </span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Rating / Review display */}
                <div className="border-t border-slate-100 pt-3.5 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                      Ulasan & Rating Anda
                    </span>
                    {order.rating ? (
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={12}
                            className={star <= (order.rating || 0) ? "text-yellow-400 fill-yellow-400" : "text-slate-200"}
                          />
                        ))}
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic font-semibold">
                        Belum diulas
                      </span>
                    )}
                  </div>

                  {order.review && (
                    <div className="bg-gradient-to-r from-slate-50 to-slate-100/40 border border-slate-100 rounded-2xl p-3 text-xs text-slate-600 flex items-start gap-2.5 italic">
                      <MessageSquare size={14} className="text-[#FF6B00] shrink-0 mt-0.5" />
                      <span className="font-medium text-slate-600">"{order.review}"</span>
                    </div>
                  )}
                </div>

                {/* Actions: Reorder and View Receipt */}
                <div className="flex gap-3 pt-1">
                  {onReorder && (order.status === 'SELESAI' || order.status === 'Selesai') && (
                    <button
                      onClick={() => onReorder(order)}
                      className="flex-1 bg-white hover:bg-orange-50 text-[#FF6B00] border border-orange-500/20 hover:border-orange-500/40 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <RefreshCw size={13} />
                      Pesan Lagi
                    </button>
                  )}
                  <button
                    onClick={() => onViewReceipt(order)}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-orange-500/10"
                  >
                    <Eye size={13} />
                    Detail Struk
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );

  if (isInline) {
    return cardContent;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
            className="w-full max-w-lg flex flex-col max-h-[85vh] relative z-10"
          >
            {cardContent}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
