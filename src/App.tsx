import React, { useState, useMemo, useEffect } from 'react';
import { ShoppingBag, Clock, LogIn } from 'lucide-react';
import { MenuItem, CartItem, Category, Order, PaymentMethod } from './types';
import Header from './components/Header';
import CategoryFilter from './components/CategoryFilter';
import MenuCard from './components/MenuCard';
import CartModal from './components/CartModal';
import PaymentModal from './components/PaymentModal';
import Receipt from './components/Receipt';
import WelcomeScreen from './components/WelcomeScreen';
import LoginView from './components/LoginView';
import RegisterView from './components/RegisterView';
import PointsModal from './components/PointsModal';
import { motion, AnimatePresence } from 'motion/react';
import { submitScanTracking } from './services/orderService';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [authView, setAuthView] = useState<'welcome' | 'login' | 'register'>('welcome');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [tableNumber, setTableNumber] = useState<string>('01');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('Semua');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedItemForNote, setSelectedItemForNote] = useState<MenuItem | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [showStatus, setShowStatus] = useState(false);
  const [isRinging, setIsRinging] = useState(false);
  const [isPointsModalOpen, setIsPointsModalOpen] = useState(false);
  const [points, setPoints] = useState<number>(() => {
    return parseInt(localStorage.getItem('maslahat_points') || '0');
  });

  // STATE BARU UNTUK MENU DARI DATABASE KASIR
  const [menuData, setMenuData] = useState<MenuItem[]>([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);
  const [menuError, setMenuError] = useState<string | null>(null);

  useEffect(() => {
    // Fungsi untuk narik data LANGSUNG dari MySQL Kasir via Localtunnel
    const fetchMenu = async () => {
      setIsLoadingMenu(true);
      setMenuError(null);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 detik di frontend

      try {
        const response = await fetch('/api/menu', { signal: controller.signal });
        clearTimeout(timeoutId);
        
        let result;
        const text = await response.text();
        try {
          result = JSON.parse(text);
        } catch (e) {
          console.warn("Respon bukan JSON:", text.substring(0, 50));
          throw new Error("Respon server tidak valid (Bukan JSON). Pastikan Localtunnel sudah aktif.");
        }

        if (!response.ok) {
           throw new Error(result.message || `Error ${response.status}`);
        }
        
        console.log("Data Berhasil di-load:", result);
        const items = Array.isArray(result) ? result : (result.data || result.items || []);
        
        if (items.length === 0) {
          setMenuError("Data menu di database admin masih kosong.");
        }

        const mappedMenu = items.map((item: any) => {
          // Normalisasi Kategori agar cocok dengan Tab UI
          let category = item.category || 'Bakso & Mie';
          
          // Mapping sederhana jika kategori di database berbeda bahasa atau singkatan
          const cat = category.toString().toLowerCase();
          if (cat.includes('mie') || cat.includes('bakso')) category = 'Bakso & Mie';
          else if (cat.includes('nasi')) category = 'Aneka Nasi';
          else if (cat.includes('goreng')) category = 'Gorengan';
          else if (cat.includes('ice') || cat.includes('es')) category = 'Ice Cream';
          else if (cat.includes('minum')) category = 'Minuman';

          return {
            id: String(item.id || Math.random()), 
            name: item.name || 'Produk Tanpa Nama',
            price: Number(item.price || 0),
            category,
            image: item.image_url 
              ? (item.image_url.startsWith('http') ? item.image_url : `https://easy-hornets-pay.loca.lt/${item.image_url.replace(/^\//, '')}`)
              : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400',
            // Gunakan checking 'Tersedia' sesuai instruksi Admin
            inStock: item.status === 'Tersedia' || Number(item.stock) > 0,
            stock: Number(item.stock || 0),
            description: item.description || '',
            isPromo: false,
            discountPrice: undefined
          };
        });
          
        setMenuData(mappedMenu);
      } catch (error) {
        clearTimeout(timeoutId);
        console.error("Gagal load menu:", error);
        if (error instanceof Error && error.name === 'AbortError') {
          setMenuError("Koneksi sangat lambat (Timeout 20 detik). Coba refresh?");
        } else {
          setMenuError(error instanceof Error ? error.message : "Gagal terhubung ke Kasir Admin.");
        }
      } finally {
        setIsLoadingMenu(false);
      }
    };
    fetchMenu();
  }, []);

  const handleAuth = (type: 'guest' | 'login') => {
    if (type === 'login') {
      setIsAuthenticated(true);
      setIsGuest(false);
      localStorage.setItem('maslahat_auth', 'true');
      localStorage.setItem('maslahat_role', 'user');
    } else {
      setIsAuthenticated(true);
      setIsGuest(true);
      localStorage.setItem('maslahat_auth', 'true');
      localStorage.setItem('maslahat_role', 'guest');
    }
    setAuthView('welcome');
  };

  const handleClaimPoints = (amount: number) => {
    const newPoints = points + amount;
    setPoints(newPoints);
    localStorage.setItem('maslahat_points', newPoints.toString());
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const meja = params.get('meja');
    if (meja) {
      setTableNumber(meja);
      submitScanTracking(meja);
      
      // PERBAIKAN: OTOMATIS LOGIN TAMU JIKA MEJA TERDETEKSI DARI SCANNER
      handleAuth('guest');
      
    } else {
      setTableNumber('01');
    }
  }, []);

  const filteredMenu = useMemo(() => {
    return menuData.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'Semua' || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory, menuData]);

  const addToCartWithNote = (item: MenuItem, note: string) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id && c.note === note);
      if (existing) {
        return prev.map((c) =>
          c.id === item.id && c.note === note ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { ...item, quantity: 1, note }];
    });
    setSelectedItemForNote(null);
  };

  const updateQuantity = (id: string, note: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id && item.note === note ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    if (isGuest) {
      setShowLoginPrompt(true);
      return;
    }
    setIsCartOpen(false);
    setIsPaymentOpen(true);
  };

  const handleConfirmPayment = async (method: PaymentMethod) => {
    const pointsEarned = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const newOrder: Order = {
      id: `TRX-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      items: [...cart],
      total: cartTotal,
      tableNumber,
      paymentMethod: method,
      timestamp: new Date().toLocaleString('id-ID'),
      status: 'PENDING',
      pointsEarned: pointsEarned,
    };

    // FORMAT DATA KERANJANG AGAR SESUAI DENGAN PERMINTAAN MYSQL ADMIN
    const orderDataKasir = {
      id: newOrder.id,
      table: `Meja ${tableNumber}`, // Tambahkan kata Meja agar sinkron dengan tabel Admin
      customer: "Pelanggan App", 
      type: "Dine In",
      paymentMethod: method,
      amountPaid: cartTotal,
      change: 0,
      total: cartTotal,
      items: cart.map(item => ({
        id: item.id, // ID Asli dari MySQL
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        note: item.note || "" 
      }))
    };

    try {
      // Tembak Data Pesanan LANGSUNG ke Sistem Admin via Localtunnel
      await fetch('/api/order', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderDataKasir)
      });
      
      const newPoints = points + pointsEarned;
      setPoints(newPoints);
      localStorage.setItem('maslahat_points', newPoints.toString());

      setCompletedOrder(newOrder);
      setShowStatus(true);
      setCart([]);
      setIsPaymentOpen(false);

    } catch (error) {
      console.error("Gagal checkout:", error);
      alert("Gagal mengirim pesanan ke Dapur/Kasir!");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsGuest(false);
    setAuthView('welcome');
    localStorage.removeItem('maslahat_auth');
    localStorage.removeItem('maslahat_role');
  };

  // POLLING STATUS PESANAN & FITUR DERING
  useEffect(() => {
    if (!completedOrder || completedOrder.status === 'SELESAI') return;

    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/order/${completedOrder.id}`);
        if (response.ok) {
          const data = await response.json();
          const newStatus = data.status || data.order_status || 'PENDING';
          
          // Jika status berubah jadi "Diantar" dan sebelumnya bukan itu
          if (newStatus.toLowerCase().includes('antar') && completedOrder.status.toLowerCase() !== newStatus.toLowerCase()) {
            setIsRinging(true);
            audio.play().catch(e => console.log("Gagal putar suara (Butuh interaksi user):", e));
            
            // Auto stop ringing setelah 10 detik
            setTimeout(() => setIsRinging(false), 10000);
          }

          if (newStatus !== completedOrder.status) {
            setCompletedOrder(prev => prev ? { ...prev, status: newStatus } : null);
          }
        }
      } catch (err) {
        console.warn("Gagal cek status pesanan:", err);
      }
    };

    const interval = setInterval(checkStatus, 5000); // Cek tiap 5 detik
    return () => {
      clearInterval(interval);
      audio.pause();
    };
  }, [completedOrder?.id, completedOrder?.status]);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 pb-32">
      <AnimatePresence>
        {!isAuthenticated && (
          <>
            {authView === 'welcome' && (
              <WelcomeScreen 
                onLogin={() => setAuthView('login')} 
                onRegister={() => setAuthView('register')}
                onGuest={() => handleAuth('guest')} 
              />
            )}
            {authView === 'login' && (
              <LoginView 
                onBack={() => setAuthView('welcome')} 
                onSuccess={(user) => {
                  handleAuth('login');
                }} 
              />
            )}
            {authView === 'register' && (
              <RegisterView 
                onBack={() => setAuthView('welcome')} 
                onSuccess={() => setAuthView('login')} 
              />
            )}
          </>
        )}
      </AnimatePresence>

      {/* Overlay Dering / Ringing */}
      <AnimatePresence>
        {isRinging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex flex-col items-center justify-center p-6 bg-orange-600/90 text-white text-center"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 10, -10, 0]
              }}
              transition={{ repeat: Infinity, duration: 0.5 }}
              className="bg-white/20 p-8 rounded-full mb-8 backdrop-blur-md"
            >
              <div className="bg-white p-6 rounded-full text-orange-600 shadow-2xl">
                <ShoppingBag size={64} className="animate-bounce" />
              </div>
            </motion.div>
            
            <h2 className="text-4xl font-black mb-4">PESANAN DI ANTAR!</h2>
            <p className="text-xl font-bold opacity-90 max-w-md">
              Pesanan kamu sudah dalam perjalanan ke Meja {tableNumber}. Siap-siap ya!
            </p>
            
            <button 
              onClick={() => setIsRinging(false)}
              className="mt-12 bg-white text-orange-600 px-12 py-5 rounded-full font-black text-xl shadow-2xl active:scale-95 transition-all"
            >
              OKE, SAYA TUNGGU!
            </button>
            
            <div className="absolute inset-0 -z-10 overflow-hidden">
               <motion.div 
                 animate={{ opacity: [0.1, 0.3, 0.1] }}
                 transition={{ repeat: Infinity, duration: 2 }}
                 className="absolute inset-0 bg-white"
               />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Header 
        tableNumber={tableNumber} 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        points={points} 
        onPointsClick={() => setIsPointsModalOpen(true)}
        onLogout={handleLogout}
      />

      <PointsModal 
        isOpen={isPointsModalOpen}
        onClose={() => setIsPointsModalOpen(false)}
        points={points}
        onClaim={handleClaimPoints}
      />
      
      {/* Floating Order Status Tracker */}
      <AnimatePresence>
        {completedOrder && !showStatus && (
          <motion.button
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            onClick={() => setShowStatus(true)}
            className="fixed top-24 right-4 z-40 bg-white shadow-2xl border border-slate-100 rounded-2xl p-3 flex items-center gap-3 active:scale-95 transition-all"
          >
            <div className="bg-orange-100 p-2 rounded-xl text-[#FF6B00]">
              <Clock size={20} className="animate-spin-slow" />
            </div>
            <div className="text-left pr-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Status Pesanan</p>
              <p className="text-xs font-bold text-slate-700">{completedOrder.status === 'PENDING' ? 'Menunggu Konfirmasi' : completedOrder.status}</p>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      <main className="max-w-4xl mx-auto px-4 mt-6 space-y-8">
        <CategoryFilter activeCategory={activeCategory} setActiveCategory={setActiveCategory} />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredMenu.map((item) => (
            <MenuCard key={item.id} item={item} onAdd={(item) => setSelectedItemForNote(item)} />
          ))}
        </div>

        {isLoadingMenu && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-orange-200 border-t-[#FF6B00] rounded-full animate-spin mb-4" />
            <p className="font-bold text-slate-400">Menghubungkan ke Kasir...</p>
          </div>
        )}

        {!isLoadingMenu && filteredMenu.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 grayscale opacity-40">
            <ShoppingBag size={64} />
            <p className="mt-4 font-bold text-slate-400">
              {menuData.length === 0 ? (menuError || "Menu tidak ditemukan di database") : "Menu tidak ditemukan"}
            </p>
            {menuData.length === 0 && (
               <button 
                onClick={() => window.location.reload()}
                className="mt-4 text-[#FF6B00] font-bold underline"
               >
                 Coba Lagi
               </button>
            )}
          </div>
        )}
      </main>

      <AnimatePresence>
        {cart.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-4 right-4 z-40 flex justify-center pointer-events-none"
          >
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsCartOpen(true)}
              className="w-full max-w-lg bg-[#FF6B00] text-white py-4 rounded-[28px] flex items-center justify-between px-6 shadow-[0_20px_50px_rgba(255,107,0,0.3)] pointer-events-auto group relative overflow-hidden"
            >
              <div className="flex items-center gap-4 relative z-10">
                <div className="bg-white/20 p-2.5 rounded-2xl relative">
                  <ShoppingBag size={20} />
                  <motion.span 
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    key={cart.length}
                    className="absolute -top-1 -right-1 bg-white text-[#FF6B00] text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg"
                  >
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </motion.span>
                </div>
                <div className="text-left leading-none">
                  <p className="text-[10px] text-white/70 font-black uppercase tracking-[0.2em] mb-1">Check Keranjang</p>
                  <p className="font-black text-xl italic tracking-tight">Rp {cartTotal.toLocaleString('id-ID')}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 relative z-10">
                <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10 group-hover:bg-white/20 transition-colors">
                  <span className="font-black text-sm uppercase tracking-widest">Lihat</span>
                </div>
              </div>

              <motion.div 
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 w-32 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
              />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <CartModal
        isOpen={isCartOpen}
        onClose={() => { setIsCartOpen(false); setSelectedItemForNote(null); }}
        cart={cart}
        updateQuantity={updateQuantity}
        onCheckout={handleCheckout}
        selectedItemForNote={selectedItemForNote}
        setSelectedItemForNote={setSelectedItemForNote}
        addToCartWithNote={addToCartWithNote}
      />

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        total={cartTotal}
        onConfirm={handleConfirmPayment}
      />

      {/* Guest Login Prompt Modal */}
      <AnimatePresence>
        {showLoginPrompt && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLoginPrompt(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-[40px] p-8 relative z-10 text-center space-y-6"
            >
              <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mx-auto">
                <LogIn size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-800">Login Diperlukan</h3>
                <p className="text-slate-400 text-sm font-medium leading-relaxed">
                  Maaf, fitur pemesanan hanya tersedia untuk pengguna terdaftar. Silakan login untuk melanjutkan pesanan Anda.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setIsAuthenticated(false);
                    setIsGuest(false);
                    setShowLoginPrompt(false);
                    localStorage.removeItem('maslahat_auth');
                  }}
                  className="w-full bg-[#FF6B00] text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-orange-100"
                >
                  HALAMAN LOGIN
                </button>
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="w-full bg-slate-100 text-slate-500 py-4 rounded-2xl font-black text-sm"
                >
                  KEMBALI KE MENU
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {completedOrder && showStatus && (
        <Receipt order={completedOrder} onClose={() => setShowStatus(false)} />
      )}
    </div>
  );
}