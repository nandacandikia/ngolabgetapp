import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3001;

  app.use(express.json());

  // API Routes
  const KASIR_DOMAIN = "http://localhost:5000";
  const API_KASIR_URL = `${KASIR_DOMAIN}/api/menu`;
  const APPS_SCRIPT_URL = process.env.VITE_APPS_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbx7gVD2jM-XpZg5ZVkjSsp70RO0corDrUN9gM2SF-NkA2SMo0Iejt5wt8HF3Lw_WZqiYw/exec";


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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // Naikkan ke 15 detik

    try {
      console.log(`[PROXY] Mengambil data menu dari: ${API_KASIR_URL}`);
      const response = await fetch(API_KASIR_URL, {
        method: "GET",
        signal: controller.signal,
        headers: { 
          "bypass-tunnel-reminder": "true",
          "Bypass-Tunnel-Reminder": "true",
          "Accept": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`[PROXY] Kasir Admin merespon dengan status ${response.status}. Menggunakan fallback menu dummy.`);
        return res.json(DUMMY_MENU);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.warn("[PROXY] Kasir merespon dengan HTML (Localtunnel Reminder). Menggunakan fallback menu dummy.");
        return res.json(DUMMY_MENU);
      }

      const data = await response.json();
      console.log("=== DATA DARI ADMIN BERHASIL DITERIMA ===");
      res.json(data);
    } catch (error) {
      clearTimeout(timeoutId);
      console.warn(`[PROXY] Gagal terhubung ke Kasir Admin (${error instanceof Error ? error.message : String(error)}). Menggunakan fallback menu dummy.`);
      res.json(DUMMY_MENU);
    }
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
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
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