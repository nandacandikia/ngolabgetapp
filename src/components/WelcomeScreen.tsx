import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, LogIn, ChevronRight, Sparkles, QrCode, X } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

interface WelcomeScreenProps {
  onLogin: () => void;
  onRegister: () => void;
  onGuest: () => void;
}

export default function WelcomeScreen({ onLogin, onRegister, onGuest }: WelcomeScreenProps) {
  const [showScanner, setShowScanner] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scannerError, setScannerError] = useState<string | null>(null);

  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;
    
    if (showScanner) {
      html5QrCode = new Html5Qrcode("qr-reader");
      
      const startScanner = async () => {
        try {
          await html5QrCode?.start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
            },
            (decodedText: string) => {
              setScanResult(decodedText);
              
              // Handle result
              if (decodedText.includes('meja=')) {
                const url = new URL(decodedText.startsWith('http') ? decodedText : `http://dummy.com/${decodedText}`);
                const meja = url.searchParams.get('meja');
                if (meja) {
                  window.location.href = `/?meja=${meja}`;
                  return;
                }
              }
              
              // If not a table URL, stop after a delay
              setTimeout(() => {
                setShowScanner(false);
              }, 3000);
            },
            (errorMessage: string) => {
              // silence typical errors like "no QR code found"
            }
          );
        } catch (err) {
          console.error("Gagal start scanner:", err);
          setScannerError("Gagal mengakses kamera. Pastikan izin kamera diberikan.");
        }
      };

      startScanner();
    }

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(err => console.error("Gagal stop scanner:", err));
      }
    };
  }, [showScanner]);

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
          {/* Scan QR Option */}
          <button
            onClick={() => setShowScanner(true)}
            className="w-full bg-white border-2 border-slate-100 text-slate-800 p-4 rounded-[24px] font-black text-lg shadow-sm hover:border-[#FF6B00] hover:text-[#FF6B00] active:scale-[0.98] transition-all flex items-center justify-between px-8 mb-4"
          >
            <div className="flex items-center gap-4">
              <div className="bg-orange-50 p-2 rounded-xl">
                <QrCode size={22} className="text-[#FF6B00]" />
              </div>
              <span>Scan Meja</span>
            </div>
            <ChevronRight size={20} className="opacity-50" />
          </button>

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

      {/* QR Scanner Overlay */}
      <AnimatePresence>
        {showScanner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-6"
          >
            <div className="w-full max-w-md bg-white rounded-[40px] p-8 space-y-6 overflow-hidden relative">
              <button 
                onClick={() => setShowScanner(false)}
                className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="text-center space-y-2 pt-4">
                <h2 className="text-2xl font-black text-slate-800">Scan QR Meja</h2>
                <p className="text-slate-400 text-sm font-medium">Arahkan kamera ke kode QR di meja Anda</p>
              </div>

              <div id="qr-reader" className="rounded-3xl overflow-hidden shadow-inner bg-slate-50 border-2 border-slate-100" />

              {scannerError && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-2xl text-center">
                  <p className="text-red-500 font-bold text-sm">{scannerError}</p>
                </div>
              )}

              {scanResult && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="bg-green-50 border border-green-100 p-4 rounded-2xl text-center"
                >
                  <p className="text-green-600 font-black text-sm">Terdeteksi:</p>
                  <p className="text-green-800 font-bold break-all">{scanResult}</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
