import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Gamepad2, Award } from 'lucide-react';

interface GameScreenProps {
  onClose: () => void;
  onGameComplete: (pointsEarned: number) => void;
  userId?: string | null;
  isInline?: boolean;
}

export default function GameScreen({ onClose, onGameComplete, userId, isInline = false }: GameScreenProps) {
  const [isPlaying, setIsPlaying] = useState(true);

  // Simulasi jika platform game mengirimkan event message kembali ke web kita
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Pastikan untuk memvalidasi origin di masa depan (misal: if (event.origin !== 'https://partner-game.com') return;)
      if (event.data && event.data.type === 'GAME_COMPLETED') {
        const points = event.data.points || 0;
        setIsPlaying(false);
        onGameComplete(points);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onGameComplete]);

  // Fungsi simulasi memenangkan game (digunakan karena API asli belum ada)
  const simulateWin = () => {
    const randomPoints = Math.floor(Math.random() * 50) + 10; // 10-60 poin
    setIsPlaying(false);
    onGameComplete(randomPoints);
  };

  const cardContent = (
    <div className={`w-full max-w-4xl ${isInline ? 'h-[70vh] rounded-[32px] border border-slate-100 shadow-xl' : 'h-[90vh] rounded-[32px] shadow-2xl'} bg-white overflow-hidden flex flex-col relative`}>
      <div className="flex items-center justify-between p-4 bg-slate-900 text-white">
        <div className="flex items-center gap-3">
          <Gamepad2 className="text-[#FF6B00]" />
          <h2 className="font-black tracking-widest uppercase">Platform Game Partner</h2>
        </div>
        {!isInline && (
          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <div className="flex-1 relative bg-slate-100 flex flex-col items-center justify-center">
        {/* Iframe Placeholder untuk Game Rekan */}
        {/* Ganti src ini nanti dengan URL game rekan Anda dan passing user ID ke URL params/query */}
        <iframe
          src="about:blank"
          className="w-full h-full absolute inset-0 opacity-10 pointer-events-none"
          title="Game Partner"
        />

        {isPlaying && (
          <div className="z-10 text-center space-y-6 max-w-md p-8 bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white">
            <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-purple-500/30">
              <Gamepad2 size={48} className="text-white animate-bounce" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-800">Bermain Game...</h3>
              <p className="text-slate-500 font-medium text-sm">
                User ID/Token: <span className="font-bold text-slate-700">{userId || 'GUEST'}</span>
              </p>
              <p className="text-slate-400 text-xs">
                Area ini nantinya akan memuat platform game secara utuh melalui iframe.
              </p>
            </div>
            <button
              onClick={simulateWin}
              className="w-full bg-gradient-to-r from-[#FF6B00] to-orange-500 text-white font-black py-4 rounded-2xl shadow-xl hover:shadow-orange-500/30 active:scale-95 transition-all flex justify-center items-center gap-2 cursor-pointer"
            >
              <Award size={20} />
              [DEV] Simulasi Menang Game
            </button>
          </div>
        )}
      </div>
    </div>
  );

  if (isInline) {
    return cardContent;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-4xl flex justify-center"
      >
        {cardContent}
      </motion.div>
    </div>
  );
}
