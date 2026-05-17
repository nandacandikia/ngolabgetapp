import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, QrCode, Scan, Star, Camera, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface PointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  points: number;
  onClaim: (points: number) => void;
}

export default function PointsModal({ isOpen, onClose, points, onClaim }: PointsModalProps) {
  const [activeTab, setActiveTab] = useState<'MY_CODE' | 'SCAN'>('MY_CODE');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;

    if (activeTab === 'SCAN' && isOpen && !scanResult) {
      scanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );

      scanner.render((decodedText) => {
        setScanResult(decodedText);
        // Mock logic for point codes: "POIN-XXXX"
        if (decodedText.startsWith('MASYANTO-POIN-')) {
          const amount = parseInt(decodedText.split('-')[2]);
          if (!isNaN(amount)) {
            onClaim(amount);
            setScanResult('SUCCESS');
          } else {
            setError('Format kode poin tidak valid.');
          }
        } else {
          setError('QR Code bukan kode poin resmi Bakso Mas Yanto.');
        }
        scanner?.clear();
      }, (err) => {
        // console.error(err);
      });
    }

    return () => {
      scanner?.clear();
    };
  }, [activeTab, isOpen, scanResult, onClaim]);

  const resetScanner = () => {
    setScanResult(null);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white w-full max-w-md rounded-[40px] overflow-hidden relative z-10 shadow-2xl flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-50 flex items-center justify-between sticky top-0 bg-white z-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
                <Star size={20} fill="currentColor" strokeWidth={0} />
              </div>
              <div>
                <h2 className="font-black text-lg text-slate-800 leading-none">Poin Reward</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Klaim & Kumpulkan</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2.5 hover:bg-slate-50 rounded-2xl text-slate-400">
              <X size={20} />
            </button>
          </div>

          {/* Points Display */}
          <div className="px-6 pt-6 pb-2">
            <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-[32px] p-6 text-center shadow-lg shadow-amber-100 flex flex-col items-center">
              <p className="text-white/80 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Saldo Poin Saya</p>
              <div className="flex items-center gap-2">
                 <p className="text-4xl font-black text-white tracking-tight">{points.toLocaleString('id-ID')}</p>
                 <Star size={24} fill="white" strokeWidth={0} />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-6 pt-6">
            <div className="bg-slate-100 p-1.5 rounded-3xl flex gap-1">
              <button
                onClick={() => { setActiveTab('MY_CODE'); resetScanner(); }}
                className={`flex-1 py-3 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'MY_CODE' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'
                }`}
              >
                <QrCode size={16} />
                KODE SAYA
              </button>
              <button
                onClick={() => setActiveTab('SCAN')}
                className={`flex-1 py-3 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'SCAN' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'
                }`}
              >
                <Scan size={16} />
                SCAN KODE
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
            {activeTab === 'MY_CODE' ? (
              <div className="flex flex-col items-center space-y-6">
                <div className="bg-white p-6 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-slate-50">
                  <QRCodeSVG 
                    value={`USER-POINTS-${points}`} 
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm font-black text-slate-800 tracking-tight">Tunjukkan Pada Kasir</p>
                  <p className="text-[11px] text-slate-400 font-medium px-10 leading-relaxed">
                    Scan barcode di atas saat pembayaran untuk mendapatkan atau menukar poin belanja Anda.
                  </p>
                </div>
                <div className="w-full bg-blue-50 border border-blue-100 rounded-3xl p-4 flex items-start gap-3">
                  <Info size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-[10px] text-blue-700 font-bold leading-relaxed">
                    Dapatkan 1 poin untuk setiap menu yang Anda beli. Tukarkan poinmu dengan diskon menarik!
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-6 min-h-[300px]">
                {scanResult === 'SUCCESS' ? (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center text-center py-12"
                  >
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-4">
                      <CheckCircle2 size={40} />
                    </div>
                    <h3 className="text-xl font-black text-slate-800">Poin Berhasil Diklaim!</h3>
                    <p className="text-slate-400 text-sm font-medium mt-1">Saldo poin Anda telah diperbarui.</p>
                    <button 
                      onClick={resetScanner}
                      className="mt-8 px-8 py-3 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm"
                    >
                      Scan Lagi
                    </button>
                  </motion.div>
                ) : error ? (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center text-center py-12"
                  >
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-4">
                      <AlertCircle size={40} />
                    </div>
                    <h3 className="text-xl font-black text-slate-800">Gagal Scan</h3>
                    <p className="text-slate-400 text-sm font-medium mt-1">{error}</p>
                    <button 
                      onClick={resetScanner}
                      className="mt-8 px-8 py-3 bg-red-500 text-white rounded-2xl font-black text-sm shadow-lg shadow-red-100"
                    >
                      Coba Lagi
                    </button>
                  </motion.div>
                ) : (
                  <div className="w-full space-y-4">
                    <div id="qr-reader" className="overflow-hidden rounded-[32px] border-2 border-slate-100" />
                    <div className="text-center space-y-1">
                      <p className="text-sm font-black text-slate-800">Scan QR Receipt</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Arahkan kamera ke QR Code di struk</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="p-6 border-t border-slate-50 bg-slate-50/50">
             <div className="flex items-center justify-center gap-1.5 opacity-40">
                <Star size={12} fill="currentColor" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Mas Yanto Rewards</span>
             </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
