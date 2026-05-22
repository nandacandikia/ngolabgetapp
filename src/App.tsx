import React, { useState, useMemo, useEffect } from 'react';
import { ShoppingBag, Clock, LogIn, Bell, Sparkles, QrCode, X } from 'lucide-react';
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
import OrderHistoryModal from './components/OrderHistoryModal';
import { motion, AnimatePresence } from 'motion/react';
import { submitScanTracking } from './services/orderService';
import { Html5Qrcode } from 'html5-qrcode';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.has('meja') || localStorage.getItem('maslahat_auth') === 'true';
  });
  const [isGuest, setIsGuest] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('role') === 'guest') return true;
    if (params.has('meja') && !params.has('role')) return false;
    return localStorage.getItem('maslahat_role') === 'guest';
  });
  const [authView, setAuthView] = useState<'welcome' | 'login' | 'register'>('welcome');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [tableNumber, setTableNumber] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    const meja = params.get('meja');
    if (meja) return decodeURIComponent(meja);
    const savedTable = localStorage.getItem('maslahat_table');
    if (savedTable) return savedTable;
    return 'Belum Scan';
  });
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

  const [showScanner, setShowScanner] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scannerError, setScannerError] = useState<string | null>(null);

  const [zoneName, setZoneName] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    const zona = params.get('zona') || params.get('zone');
    if (zona) return decodeURIComponent(zona);
    const savedZone = localStorage.getItem('maslahat_zone');
    if (savedZone) return savedZone;
    return '';
  });

  // STATE BARU UNTUK MENU DARI DATABASE KASIR
  const [menuData, setMenuData] = useState<MenuItem[]>([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);
  const [menuError, setMenuError] = useState<string | null>(null);

  // STATE RIWAYAT PESANAN
  const [orderHistory, setOrderHistory] = useState<Order[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('maslahat_order_history') || '[]');
    } catch (e) {
      return [];
    }
  });
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const handleUpdateOrder = (updatedOrder: Order) => {
    setOrderHistory((prev) => {
      const next = prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o));
      localStorage.setItem('maslahat_order_history', JSON.stringify(next));
      return next;
    });
    if (completedOrder && completedOrder.id === updatedOrder.id) {
      setCompletedOrder(updatedOrder);
    }
  };

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
        const rawItems = Array.isArray(result) ? result : (result.data || result.items || []);
        
        // FILTER: Hanya ambil menu yang status displayed-nya tidak 0 / false (tidak disembunyikan oleh Admin)
        const activeItems = rawItems.filter((item: any) => item.displayed !== 0 && item.displayed !== false && item.displayed !== '0');
        
        if (activeItems.length === 0) {
          setMenuError(rawItems.length > 0 ? "Semua menu sedang dinonaktifkan/disembunyikan oleh Admin." : "Data menu di database admin masih kosong.");
        }

        const mappedMenu = activeItems.map((item: any) => {
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
              ? (item.image_url.startsWith('http') ? item.image_url : `http://localhost:5000/${item.image_url.replace(/^\//, '')}`)
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

  const handleAuth = (type: 'guest' | 'login' | 'table_scan') => {
    if (type === 'login' || type === 'table_scan') {
      setIsAuthenticated(true);
      setIsGuest(false);
      localStorage.setItem('maslahat_auth', 'true');
      localStorage.setItem('maslahat_role', type === 'table_scan' ? 'table' : 'user');
      localStorage.removeItem('maslahat_table');
      setTableNumber('Belum Scan');
    } else {
      setIsAuthenticated(true);
      setIsGuest(true);
      setTableNumber('Mode Tamu');
      localStorage.setItem('maslahat_auth', 'true');
      localStorage.setItem('maslahat_role', 'guest');
      localStorage.removeItem('maslahat_table');
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
    const role = params.get('role');
    const zona = params.get('zona') || params.get('zone');
    if (meja) {
      setTableNumber(meja);
      submitScanTracking(meja);
      localStorage.setItem('maslahat_table', meja);
      
      const parsedZone = zona ? decodeURIComponent(zona) : '';
      if (parsedZone) {
        setZoneName(parsedZone);
        localStorage.setItem('maslahat_zone', parsedZone);
      } else {
        // Fallback: ambil data zone dari database smart_tags
        fetch('/api/smart-tags')
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data)) {
              const matched = data.find((t: any) => t.number === meja);
              if (matched && matched.zone) {
                setZoneName(matched.zone);
                localStorage.setItem('maslahat_zone', matched.zone);
              } else {
                setZoneName('');
                localStorage.removeItem('maslahat_zone');
              }
            }
          })
          .catch(err => {
            console.warn("Gagal mengambil fallback zone:", err);
            setZoneName('');
            localStorage.removeItem('maslahat_zone');
          });
      }
      
      if (role === 'guest') {
        setIsGuest(true);
        setIsAuthenticated(true);
        localStorage.setItem('maslahat_auth', 'true');
        localStorage.setItem('maslahat_role', 'guest');
      } else {
        handleAuth('table_scan');
      }
    } else {
      const savedRole = localStorage.getItem('maslahat_role');
      if (savedRole === 'guest') {
        setIsGuest(true);
        const savedTable = localStorage.getItem('maslahat_table');
        setTableNumber(savedTable || 'Mode Tamu');
        setZoneName(localStorage.getItem('maslahat_zone') || '');
      } else {
        const savedTable = localStorage.getItem('maslahat_table');
        setTableNumber(savedTable || 'Belum Scan');
        setZoneName(localStorage.getItem('maslahat_zone') || '');
      }
    }
  }, []);

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
                const zona = url.searchParams.get('zona') || url.searchParams.get('zone');
                if (meja) {
                  const zoneQuery = zona ? `&zona=${encodeURIComponent(zona)}` : '';
                  window.location.href = `/?meja=${meja}&role=guest${zoneQuery}`;
                  return;
                }
              } else if (/^\d+$/.test(decodedText.trim())) {
                // If it is just a number, let's treat it as the table number
                window.location.href = `/?meja=${decodedText.trim()}&role=guest`;
                return;
              }
              
              // If not a table URL/number, stop after a delay
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
    setIsCartOpen(false);
    setIsPaymentOpen(true);
  };

  const handleConfirmPayment = async (method: PaymentMethod, customerName: string) => {
    const pointsEarned = isGuest ? 0 : cart.reduce((sum, item) => sum + item.quantity, 0);
    const finalCustomerName = customerName || "Pelanggan App";
    
    const newOrder: Order = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      items: [...cart],
      total: cartTotal,
      tableNumber,
      paymentMethod: method,
      timestamp: new Date().toLocaleString('id-ID'),
      status: 'PENDING',
      customerName: finalCustomerName,
      pointsEarned: pointsEarned,
    };

    // FORMAT DATA KERANJANG AGAR SESUAI DENGAN PERMINTAAN MYSQL ADMIN
    const orderDataKasir = {
      id: newOrder.id,
      table: (() => {
        const base = /^\d+$/.test(tableNumber) ? `Meja ${tableNumber}` : tableNumber;
        return zoneName && zoneName !== 'Area Meja' ? `${base} (${zoneName})` : base;
      })(),
      customer: finalCustomerName, 
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
      
      if (!isGuest) {
        const newPoints = points + pointsEarned;
        setPoints(newPoints);
        localStorage.setItem('maslahat_points', newPoints.toString());
      }

      setCompletedOrder(newOrder);
      setOrderHistory((prev) => {
        const next = [newOrder, ...prev];
        localStorage.setItem('maslahat_order_history', JSON.stringify(next));
        return next;
      });
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
    localStorage.removeItem('maslahat_table');
    localStorage.removeItem('maslahat_zone');
    setZoneName('');
  };

  // POLLING STATUS PESANAN & FITUR DERING
  useEffect(() => {
    if (!completedOrder) return;

    // Audio kring restoran yang khas dan renyah
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/995/995-preview.mp3');
    
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/order/${completedOrder.id}`);
        if (response.ok) {
          const data = await response.json();
          const newStatus = data.status || data.order_status || completedOrder.status;
          
          const isFinished = newStatus === 'Siap Disajikan' || newStatus === 'Selesai' || newStatus.toLowerCase().includes('antar') || newStatus === 'SELESAI';
          
          if (isFinished && completedOrder.status !== newStatus) {
            setIsRinging(true);
            audio.play().catch(e => console.log("Gagal putar suara (Butuh interaksi user):", e));
            
            // Putar kedua kali setelah 1.5 detik agar dering kring lebih berasa
            setTimeout(() => {
              audio.currentTime = 0;
              audio.play().catch(e => console.log(e));
            }, 1500);

            // Auto stop ringing setelah 15 detik
            setTimeout(() => setIsRinging(false), 15000);
          }

          if (newStatus !== completedOrder.status) {
            setCompletedOrder(prev => prev ? { ...prev, status: newStatus } : null);
          }
        }
      } catch (err) {
        console.warn("Gagal cek status pesanan:", err);
      }
    };

    const interval = setInterval(checkStatus, 3000); // Cek tiap 3 detik agar cepat responsif
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
              Pesanan kamu sudah dalam perjalanan ke {(() => {
                const base = /^\d+$/.test(tableNumber) ? `Meja ${tableNumber}` : tableNumber;
                return zoneName && zoneName !== 'Area Meja' ? `${base} (${zoneName})` : base;
              })()}. Siap-siap ya!
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
        isGuest={isGuest}
        zoneName={zoneName}
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        points={points} 
        onPointsClick={() => setIsPointsModalOpen(true)}
        onLogout={handleLogout}
        onHistoryClick={() => setIsHistoryOpen(true)}
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
        {tableNumber === 'Mode Tamu' || tableNumber === 'Belum Scan' ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-100 rounded-[32px] p-8 sm:p-12 text-center shadow-xl shadow-slate-100/50 flex flex-col items-center max-w-xl mx-auto my-8 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -z-10" />

            <div className="relative w-36 h-36 mb-8 flex items-center justify-center">
              <motion.div 
                animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="bg-gradient-to-tr from-orange-500 to-amber-500 text-white p-7 rounded-[32px] shadow-lg shadow-orange-500/25 relative z-10"
              >
                <QrCode size={56} strokeWidth={1.5} />
              </motion.div>
              <motion.div 
                animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                className="absolute inset-0 border-2 border-orange-500/30 rounded-[44px]"
              />
              <motion.div 
                animate={{ scale: [1, 1.7, 1], opacity: [0.15, 0, 0.15] }}
                transition={{ repeat: Infinity, duration: 2, delay: 0.5, ease: "easeOut" }}
                className="absolute inset-0 border border-orange-500/20 rounded-[56px]"
              />
            </div>

            <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-3">
              Scan QR di Meja Anda
            </h3>
            <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-sm mb-8">
              Pindai kode QR yang tertera di meja atau lokasi Anda terlebih dahulu untuk melihat menu hidangan dan mulai memesan.
            </p>

            <button
              onClick={() => {
                setScanResult(null);
                setScannerError(null);
                setShowScanner(true);
              }}
              className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm uppercase tracking-wider px-8 py-4 rounded-2xl shadow-lg shadow-orange-500/25 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <QrCode size={18} />
              Scan QR Code Sekarang
            </button>
            
            <p className="mt-8 text-xs text-slate-400 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Sistem Pemesanan Mandiri Maslahat
            </p>
          </motion.div>
        ) : (
          <>
            {tableNumber !== 'Mode Tamu' && tableNumber !== 'Belum Scan' && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent border border-orange-500/20 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm backdrop-blur-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-[#FF6B00] text-white p-3.5 rounded-2xl shadow-md shadow-orange-500/20">
                    <QrCode size={24} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-black text-slate-800 text-base">
                      {(() => {
                        const base = /^\d+$/.test(tableNumber) ? `Meja ${tableNumber}` : tableNumber;
                        return zoneName && zoneName !== 'Area Meja' ? `Terhubung ke ${base} (${zoneName})` : `Terhubung ke ${base}`;
                      })()}
                    </h3>
                    <p className="text-slate-500 text-xs font-semibold mt-0.5">
                      Pesanan akan diantar ke {/^\d+$/.test(tableNumber) ? 'meja' : 'lokasi'} ini. Salah nomor meja/lokasi? Scan QR kembali.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setScanResult(null);
                    setScannerError(null);
                    setShowScanner(true);
                  }}
                  className="bg-[#FF6B00] hover:bg-[#e66000] text-white font-black text-xs uppercase tracking-wider px-6 py-3.5 rounded-2xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all self-start sm:self-center flex items-center gap-2"
                >
                  <QrCode size={16} />
                  Scan Ulang
                </button>
              </motion.div>
            )}

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
          </>
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

      {/* QR Scanner Overlay */}
      <AnimatePresence>
        {showScanner && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowScanner(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-white rounded-[40px] p-8 space-y-6 overflow-hidden relative z-10"
            >
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
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {completedOrder && showStatus && (
        <Receipt 
          order={completedOrder} 
          onClose={() => setShowStatus(false)} 
          onUpdateOrder={handleUpdateOrder}
        />
      )}

      <OrderHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        orders={orderHistory}
        onViewReceipt={(order) => {
          setCompletedOrder(order);
          setShowStatus(true);
          setIsHistoryOpen(false);
        }}
      />

      {/* Modal Popup Notifikasi Kring Restoran */}
      <AnimatePresence>
        {isRinging && completedOrder && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ 
                scale: [1, 1.05, 1, 1.05, 1],
                rotate: [0, -3, 3, -3, 3, 0],
              }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="bg-gradient-to-br from-[#FF6B00] to-[#FF8C38] text-white w-full max-w-sm rounded-[40px] p-8 relative z-10 text-center shadow-[0_0_80px_rgba(255,107,0,0.6)] border-4 border-white/20"
            >
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-[#FF6B00] p-6 rounded-full shadow-2xl animate-bounce">
                <Bell size={48} className="animate-pulse" />
              </div>

              <div className="pt-8 space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-widest backdrop-blur-sm">
                  <Sparkles size={12} />
                  Kring Restoran
                </div>
                <h3 className="text-3xl font-black tracking-tight leading-none">PESANANMU SIAP!</h3>
                <p className="text-white/90 text-sm font-medium leading-relaxed px-2">
                  Hore! Hidangan lezatmu (#{completedOrder.id}) sudah selesai disiapkan dan siap untuk disajikan.
                </p>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => {
                    setIsRinging(false);
                    setShowStatus(true);
                  }}
                  className="w-full bg-white text-[#FF6B00] py-4 rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all hover:bg-orange-50 uppercase tracking-wider"
                >
                  Tutup & Lihat Struk
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}