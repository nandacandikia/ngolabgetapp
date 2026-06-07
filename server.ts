import dotenv from "dotenv";
dotenv.config({ override: true });

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3001;

  app.use(express.json());

  // API Routes
  const KASIR_DOMAIN = process.env.KASIR_DOMAIN || "http://192.168.1.9:3001";
  const API_KASIR_URL = `${KASIR_DOMAIN}/api/menu`;
  const APPS_SCRIPT_URL = process.env.VITE_APPS_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbx7gVD2jM-XpZg5ZVkjSsp70RO0corDrUN9gM2SF-NkA2SMo0Iejt5wt8HF3Lw_WZqiYw/exec";
  const AIRGESTURE_DOMAIN = process.env.AIRGESTURE_DOMAIN || "http://192.168.1.9:3002";
  const AIRGESTURE_API_KEY = process.env.AIRGESTURE_API_KEY || "tangolab-secret-key-2026";


  app.post("/api/register", async (req, res) => {
    try {
      console.log("Registering user via Kasir MySQL...");
      const response = await fetch(`${KASIR_DOMAIN}/api/register`, {
        method: "POST",
        body: JSON.stringify(req.body),
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Bypass-Tunnel-Reminder": "true"
        }
      });
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Register Error:", error);
      res.status(500).json({ success: false, message: "Gagal menghubungkan ke database Kasir MySQL" });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      console.log("Logging in user via Kasir MySQL...");
      const response = await fetch(`${KASIR_DOMAIN}/api/login`, {
        method: "POST",
        body: JSON.stringify(req.body),
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Bypass-Tunnel-Reminder": "true"
        }
      });
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Login Error:", error);
      res.status(500).json({ success: false, message: "Gagal menghubungkan ke database Kasir MySQL" });
    }
  });

  app.get("/api/ratings", async (req, res) => {
    try {
      const response = await fetch(`${KASIR_DOMAIN}/api/ratings`, {
        method: "GET",
        headers: { 
          "Accept": "application/json",
          "Bypass-Tunnel-Reminder": "true"
        }
      });
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Get Ratings Error:", error);
      res.status(500).json({ success: false, message: "Gagal mengambil data ulasan" });
    }
  });

  app.post("/api/ratings", async (req, res) => {
    try {
      const response = await fetch(`${KASIR_DOMAIN}/api/ratings`, {
        method: "POST",
        body: JSON.stringify(req.body),
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Bypass-Tunnel-Reminder": "true"
        }
      });
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Submit Rating Error:", error);
      res.status(500).json({ success: false, message: "Gagal menghubungkan ke database Kasir MySQL" });
    }
  });

  app.get("/api/promos", async (req, res) => {
    try {
      console.log("[PROXY] Fetching promos from Kasir MySQL...");
      const response = await fetch(`${KASIR_DOMAIN}/api/promos`, {
        method: "GET",
        headers: { 
          "Accept": "application/json",
          "Bypass-Tunnel-Reminder": "true"
        }
      });
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Get Promos Error:", error);
      res.status(500).json({ success: false, message: "Gagal mengambil data promo" });
    }
  });

  app.get("/api/point-settings", async (req, res) => {
    try {
      console.log("[PROXY] Fetching point settings from Kasir MySQL...");
      const response = await fetch(`${KASIR_DOMAIN}/api/point-settings`, {
        method: "GET",
        headers: { 
          "Accept": "application/json",
          "Bypass-Tunnel-Reminder": "true"
        }
      });
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Get Point Settings Error:", error);
      res.status(500).json({ success: false, message: "Gagal mengambil aturan poin" });
    }
  });

  app.get("/api/point-rewards", async (req, res) => {
    try {
      console.log("[PROXY] Fetching point rewards from Kasir MySQL...");
      const response = await fetch(`${KASIR_DOMAIN}/api/point-rewards`, {
        method: "GET",
        headers: { 
          "Accept": "application/json",
          "Bypass-Tunnel-Reminder": "true"
        }
      });
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Get Point Rewards Error:", error);
      res.status(500).json({ success: false, message: "Gagal mengambil katalog hadiah" });
    }
  });

  app.get("/api/users/:id/points", async (req, res) => {
    try {
      console.log(`[PROXY] Fetching user points for ID ${req.params.id} from Kasir MySQL...`);
      const response = await fetch(`${KASIR_DOMAIN}/api/users/${req.params.id}/points`, {
        method: "GET",
        headers: { 
          "Accept": "application/json",
          "Bypass-Tunnel-Reminder": "true"
        }
      });
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Get User Points Error:", error);
      res.status(500).json({ success: false, message: "Gagal mengambil poin pengguna" });
    }
  });

  app.post("/api/users/:id/points", async (req, res) => {
    try {
      console.log(`[PROXY] Updating user points for ID ${req.params.id} via Kasir MySQL...`);
      const response = await fetch(`${KASIR_DOMAIN}/api/users/${req.params.id}/points`, {
        method: "POST",
        body: JSON.stringify(req.body),
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Bypass-Tunnel-Reminder": "true"
        }
      });
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Update User Points Error:", error);
      res.status(500).json({ success: false, message: "Gagal memperbarui poin pengguna" });
    }
  });

  app.get("/api/users/:id/orders", async (req, res) => {
    try {
      console.log(`[PROXY] Fetching order history for user ID ${req.params.id} from Kasir MySQL...`);
      const response = await fetch(`${KASIR_DOMAIN}/api/users/${req.params.id}/orders`, {
        method: "GET",
        headers: { 
          "Accept": "application/json",
          "Bypass-Tunnel-Reminder": "true"
        }
      });
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Get User Orders Error:", error);
      res.status(500).json({ success: false, message: "Gagal mengambil riwayat pesanan" });
    }
  });

  // Simulasi/Dummy Data jika backend kasir offline
  const DUMMY_MENU = [
    {
      id: 1,
      name: "Bakso Mas Yanto Spesial",
      price: 25000,
      category: "Bakso & Mie",
      image_url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400",
      status: "Tersedia",
      stock: 50,
      description: "Bakso sapi asli ukuran jumbo dengan kuah kaldu sapi yang gurih, lengkap dengan mie dan sayur segar.",
      displayed: 1
    },
    {
      id: 2,
      name: "Mie Ayam Pangsit",
      price: 18000,
      category: "Bakso & Mie",
      image_url: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=400",
      status: "Tersedia",
      stock: 30,
      description: "Mie ayam buatan sendiri dengan bumbu kecap manis gurih, ditambah pangsit basah yang lembut.",
      displayed: 1
    },
    {
      id: 3,
      name: "Nasi Goreng Spesial",
      price: 20000,
      category: "Aneka Nasi",
      image_url: "https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=400",
      status: "Tersedia",
      stock: 40,
      description: "Nasi goreng harum khas jawa dengan telur mata sapi, suwiran ayam, dan acar segar.",
      displayed: 1
    },
    {
      id: 4,
      name: "Nasi Bakar Ayam Suwir",
      price: 22000,
      category: "Aneka Nasi",
      image_url: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?q=80&w=400",
      status: "Tersedia",
      stock: 20,
      description: "Nasi gurih dibungkus daun pisang yang dibakar dengan isian ayam suwir kemangi pedas.",
      displayed: 1
    },
    {
      id: 5,
      name: "Batagor Bandung",
      price: 15000,
      category: "Gorengan",
      image_url: "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?q=80&w=400",
      status: "Tersedia",
      stock: 60,
      description: "Bakso tahu goreng renyah disiram dengan saus kacang kental yang pedas manis.",
      displayed: 1
    },
    {
      id: 6,
      name: "Es Teller Mas Yanto",
      price: 15000,
      category: "Ice Cream",
      image_url: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?q=80&w=400",
      status: "Tersedia",
      stock: 35,
      description: "Es campur segar dengan kelapa muda, nangka, alpukat, dan susu kental manis.",
      displayed: 1
    },
    {
      id: 7,
      name: "Es Jeruk Peras",
      price: 8000,
      category: "Minuman",
      image_url: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=400",
      status: "Tersedia",
      stock: 100,
      description: "Perasan jeruk asli segar yang kaya akan vitamin C dingin.",
      displayed: 1
    },
    {
      id: 8,
      name: "Teh Manis (Es / Hangat)",
      price: 5000,
      category: "Minuman",
      image_url: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=400",
      status: "Tersedia",
      stock: 100,
      description: "Teh wangi melati pilihan dengan gula asli.",
      displayed: 1
    }
  ];

  const dummyOrders = new Map<string, { status: string; timestamp: number }>();

  app.post("/api/order", async (req, res) => {
    try {
      console.log("Submitting order ke Kasir MySQL...");
      const response = await fetch(`${KASIR_DOMAIN}/api/orders`, {
        method: "POST",
        body: JSON.stringify(req.body),
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Bypass-Tunnel-Reminder": "true" // Wajib ditambah agar tidak diblokir
        }
      });
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.warn("[PROXY] Gagal kirim pesanan ke Kasir. Menggunakan simulasi order dummy.");
      const orderId = req.body.id || `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
      dummyOrders.set(orderId, { status: "PENDING", timestamp: Date.now() });

      // Simulasi transisi status pesanan
      setTimeout(() => {
        const order = dummyOrders.get(orderId);
        if (order) {
          order.status = "Diproses";
          console.log(`[SIMULASI] Status order ${orderId} berubah ke: Diproses`);
        }
      }, 5000);

      setTimeout(() => {
        const order = dummyOrders.get(orderId);
        if (order) {
          order.status = "Siap Disajikan";
          console.log(`[SIMULASI] Status order ${orderId} berubah ke: Siap Disajikan`);
        }
      }, 12000);

      res.json({ success: true, message: "Pesanan disimulasikan (Backend Offline)", orderId });
    }
  });

  app.get("/api/order/:id", async (req, res) => {
    const { id } = req.params;

    // Cek dulu apakah ada di memori dummyOrders
    if (dummyOrders.has(id)) {
      const order = dummyOrders.get(id);
      return res.json({ success: true, status: order?.status });
    }

    try {
      console.log(`[PROXY] Checking status for order: ${id}`);
      const response = await fetch(`${KASIR_DOMAIN}/api/orders/${id}`, {
        method: "GET",
        headers: { 
          "bypass-tunnel-reminder": "true",
          "Bypass-Tunnel-Reminder": "true",
          "Accept": "application/json"
        }
      });
      
      if (!response.ok) {
        return res.status(response.status).json({ success: false, message: "Gagal mengambil status pesanan" });
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.warn("[PROXY] Gagal cek status pesanan. Menggunakan fallback status dummy.");
      res.json({ success: true, status: "Siap Disajikan" });
    }
  });

  app.post("/api/scan", async (req, res) => {
    try {
      console.log("Tracking scan via GAS...");
      await fetch(`${APPS_SCRIPT_URL}?action=scan`, {
        method: "POST",
        body: JSON.stringify(req.body),
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        redirect: "follow"
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Scan Error:", error);
      res.status(500).json({ success: false });
    }
  });

  app.get("/api/menu", async (req, res) => {
    // Hindari loop rekursif jika server secara tidak sengaja memanggil dirinya sendiri
    if (req.headers["x-loop-prevent"] === "true") {
      console.warn("[PROXY] Loop terdeteksi dan dihentikan untuk request /api/menu");
      return res.json([]);
    }

    // Ambil menu dari NGOLAB Kasir dan AIR GESTURE secara paralel
    const fetchNgolab = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      try {
        console.log(`[PROXY] Mengambil menu NGOLAB dari: ${API_KASIR_URL}`);
        const response = await fetch(API_KASIR_URL, {
          method: "GET",
          signal: controller.signal,
          headers: {
            "bypass-tunnel-reminder": "true",
            "Bypass-Tunnel-Reminder": "true",
            "Accept": "application/json",
            "User-Agent": "Mozilla/5.0",
            "X-Loop-Prevent": "true"
          }
        });
        clearTimeout(timeoutId);
        if (!response.ok) throw new Error(`Status ${response.status}`);
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) throw new Error("Bukan JSON");
        const data = await response.json();
        console.log(`=== NGOLAB: ${data.length} menu diterima ===`);
        return Array.isArray(data) ? data : [];
      } catch (error) {
        clearTimeout(timeoutId);
        console.warn(`[PROXY] Gagal ambil menu NGOLAB: ${error instanceof Error ? error.message : String(error)}`);
        return [];
      }
    };

    const fetchAirGesture = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      try {
        const url = `${AIRGESTURE_DOMAIN}/api/menu?outlet=coworking`;
        console.log(`[PROXY] Mengambil menu AIR GESTURE dari: ${url}`);
        const response = await fetch(url, {
          method: "GET",
          signal: controller.signal,
          headers: {
            "Accept": "application/json",
            "x-api-key": AIRGESTURE_API_KEY,
            "X-Loop-Prevent": "true"
          }
        });
        clearTimeout(timeoutId);
        if (!response.ok) throw new Error(`Status ${response.status}`);
        const data = await response.json();
        const rawData = Array.isArray(data) ? data : [];
        // Saring hanya menu yang berstatus ditampilkan (displayed === 1)
        const activeData = rawData.filter((item: any) => item.displayed === 1 || item.displayed === true || item.displayed === undefined);

        // Beri prefix 'ag-' pada ID agar tidak tabrakan dengan NGOLAB
        const mapped = activeData.map((item: any) => ({
          id: `ag-${item.id}`,
          name: item.name,
          price: item.price,
          category: item.category || "Main Course",
          image_url: (() => {
            const rawImg = item.image || item.image_url || "";
            if (!rawImg) return "";
            if (rawImg.startsWith("http")) return rawImg;
            if (rawImg.startsWith("/")) return `${AIRGESTURE_DOMAIN}${rawImg}`;
            return `${AIRGESTURE_DOMAIN}/${rawImg}`;
          })(),
          status: item.inStock ? "Tersedia" : "Habis",
          stock: item.stock || 0,
          description: item.description || item.deskripsi || "",
          displayed: 1,
          isAirGesture: true
        }));
        console.log(`=== AIR GESTURE: ${mapped.length} menu diterima ===`);
        return mapped;
      } catch (error) {
        clearTimeout(timeoutId);
        console.warn(`[PROXY] Gagal ambil menu AIR GESTURE: ${error instanceof Error ? error.message : String(error)}`);
        return [];
      }
    };

    const [ngolabMenus, airGestureMenus] = await Promise.all([fetchNgolab(), fetchAirGesture()]);

    if (ngolabMenus.length === 0 && airGestureMenus.length === 0) {
      return res.status(503).json({ success: false, message: "Gagal terhubung ke semua server menu (Offline/Timeout)." });
    }

    res.json([...ngolabMenus, ...airGestureMenus]);
  });


  // Vite middleware for development
  const isProduction = process.env.NODE_ENV === "production";
  console.log(`Server starting in ${isProduction ? "PRODUCTION" : "DEVELOPMENT"} mode`);

  if (!isProduction) {
    const { default: tailwindcss } = await import('@tailwindcss/vite');
    const { default: react } = await import('@vitejs/plugin-react');
    const vite = await createViteServer({
      configFile: false,
      plugins: [react(), tailwindcss()],
      define: {
        'process.env.GEMINI_API_KEY': JSON.stringify(process.env.GEMINI_API_KEY),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        },
      },
      server: { 
        middlewareMode: true, 
        hmr: process.env.DISABLE_HMR !== 'true' ? { port: 24679 } : false 
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    console.log(`Serving static files from: ${distPath}`);
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();