import { MapPin, Search, Star, LogOut, History, User, Gamepad2, Ticket } from 'lucide-react';

interface HeaderProps {
  tableNumber: string;
  isGuest?: boolean;
  zoneName?: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  points: number;
  onPointsClick: () => void;
  onLogout: () => void;
  onProfileClick: () => void;
  activeTab?: string;
}

export default function Header({ tableNumber, isGuest, zoneName, searchQuery, setSearchQuery, points, onPointsClick, onLogout, onProfileClick, activeTab = 'dashboard' }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-slate-100 flex flex-col gap-3">
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#FF6B00] rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
            <h1 className="font-display text-white text-lg leading-none">M</h1>
          </div>
          <div className="flex flex-col">
            <h1 className="font-display text-base font-extrabold text-slate-800 leading-none tracking-tight">NGOLAB BAKSO</h1>
            <h1 className="font-display text-sm font-bold text-[#FF6B00] leading-none mt-0.5">MAS YANTO</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Points Badge */}
          {!isGuest && (
            <button 
              onClick={onPointsClick}
              className="bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-[15px] items-center gap-2 hover:bg-amber-100/50 transition-colors cursor-pointer active:scale-95 hidden md:flex"
            >
              <div className="bg-amber-400 p-1 rounded-full text-white">
                <Star size={10} fill="currentColor" strokeWidth={0} />
              </div>
              <div className="text-left">
                <p className="text-[8px] text-amber-600 font-black uppercase leading-none">Poin Saya</p>
                <p className="font-bold text-[11px] text-amber-700 leading-tight">{points.toLocaleString('id-ID')}</p>
              </div>
            </button>
          )}

          {!isGuest && (
            <button 
              onClick={onProfileClick}
              className="w-10 h-10 bg-slate-50 text-slate-600 rounded-xl items-center justify-center hover:bg-slate-100 transition-colors active:scale-95 border border-slate-200 hidden md:flex"
              title="Profil Saya"
            >
              <User size={18} />
            </button>
          )}

          <button 
            onClick={onLogout}
            className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-100 transition-colors active:scale-95 border border-red-100"
            title="Keluar"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {activeTab === 'dashboard' && tableNumber !== 'Belum Scan' && tableNumber !== 'Mode Tamu' && (
        <div className="max-w-4xl mx-auto w-full relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FF6B00] transition-colors" size={16} />
          <input
            type="text"
            placeholder="Mau makan apa hari ini?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100 border-none rounded-2xl py-3 pl-12 pr-4 text-xs font-medium focus:ring-2 focus:ring-[#FF6B00]/20 outline-none transition-all placeholder:text-slate-400"
          />
        </div>
      )}
    </header>
  );
}
