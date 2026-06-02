import React from 'react';
import { X, Calendar, ShoppingBag, Star, MessageSquare } from 'lucide-react';
import { Order } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onViewReceipt: (order: Order) => void;
}

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onViewReceipt: (order: Order) => void;
  isInline?: boolean;
}

export default function OrderHistoryModal({ isOpen, onClose, orders, onViewReceipt, isInline = false }: OrderHistoryModalProps) {
  const cardContent = (
    <div className={`bg-white w-full max-w-2xl mx-auto rounded-[32px] overflow-hidden ${isInline ? 'shadow-xl shadow-slate-100/50 border border-slate-100' : 'shadow-2xl border border-slate-100'} flex flex-col relative z-10`}>
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-orange-500/5 to-amber-500/5">
        <div className="flex items-center gap-3">
          <div className="bg-[#FF6B00] text-white p-2.5 rounded-2xl shadow-md shadow-orange-500/10">
            <ShoppingBag size={20} />
          </div>
          <div>
            <h3 className="font-black text-slate-800 text-lg">Riwayat Pesanan</h3>
            <p className="text-slate-400 text-xs font-semibold">Daftar pesanan kuliner Anda</p>
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

      {/* Content list */}
      <div className={`flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 no-scrollbar ${isInline ? 'max-h-[68vh]' : ''}`}>
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-slate-100 p-6 rounded-full text-slate-300 mb-4">
              <ShoppingBag size={48} />
            </div>
            <h4 className="font-bold text-slate-700 text-base">Belum Ada Pesanan</h4>
            <p className="text-slate-400 text-xs font-medium max-w-xs mt-1.5 leading-relaxed">
              Anda belum memesan makanan apa pun. Pesan menu favorit Anda sekarang dan nikmati kelezatannya!
            </p>
          </div>
        ) : (
          orders.map((order) => (
            <motion.div
              key={order.id}
              className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow relative overflow-hidden group text-left"
            >
              {/* Top Order Meta */}
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {order.id}
                    </span>
                    <span className="text-[10px] bg-green-50 text-green-600 px-2.5 py-1 rounded-lg font-black uppercase tracking-wider">
                      LUNAS
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400 text-[11px] font-semibold mt-2">
                    <Calendar size={12} />
                    <span>{order.timestamp}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none mb-1">
                    Total Bayar
                  </p>
                  <p className="font-black text-[#FF6B00] text-lg">
                    Rp {order.total.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>

              {/* Order items summary */}
              <div className="border-t border-slate-100 pt-3.5 space-y-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>
                      {item.name} <span className="text-[#FF6B00]">x{item.quantity}</span>
                    </span>
                    <span className="text-slate-400">
                      Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Rating / Review display */}
              <div className="border-t border-slate-100 pt-3.5 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Ulasan & Rating
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
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-xs text-slate-600 flex items-start gap-2 italic">
                    <MessageSquare size={14} className="text-[#FF6B00] shrink-0 mt-0.5" />
                    <span>"{order.review}"</span>
                  </div>
                )}
              </div>

              {/* View receipt action */}
              <button
                onClick={() => onViewReceipt(order)}
                className="w-full mt-2 bg-gradient-to-r from-orange-500/10 to-amber-500/10 hover:from-orange-500/15 hover:to-amber-500/15 text-[#FF6B00] py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2 border border-orange-500/10 cursor-pointer"
              >
                Lihat Struk & Ulasan
              </button>
            </motion.div>
          ))
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
