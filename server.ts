import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  const KASIR_DOMAIN = "https://easy-hornets-pay.loca.lt";
  const API_KASIR_URL = `${KASIR_DOMAIN}/api/menu`;
  const APPS_SCRIPT_URL = process.env.VITE_APPS_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbx7gVD2jM-XpZg5ZVkjSsp70RO0corDrUN9gM2SF-NkA2SMo0Iejt5wt8HF3Lw_WZqiYw/exec";


  app.post("/api/register", async (req, res) => {
    try {
      console.log("Registering user via GAS...");
      const response = await fetch(`${APPS_SCRIPT_URL}?action=register`, {
        method: "POST",
        body: JSON.stringify(req.body),
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        redirect: "follow"
      });
      
      const text = await response.text();
      try {
        const data = JSON.parse(text);
        res.json(data);
      } catch (e) {
        console.error("GAS Register Response not JSON:", text);
        const isHtml = text.trim().startsWith("<");
        const errorMessage = isHtml 
          ? "Database mengembalikan halaman HTML. Pastikan App Script sudah di-deploy dengan akses 'Anyone'."
          : `Format tidak valid: ${text.substring(0, 100)}`;
        res.status(500).json({ success: false, message: errorMessage });
      }
    } catch (error) {
      console.error("Register Error:", error);
      res.status(500).json({ success: false, message: "Gagal menghubungkan ke database Google Sheets" });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      console.log("Logging in user via GAS...");
      const response = await fetch(`${APPS_SCRIPT_URL}?action=login`, {
        method: "POST",
        body: JSON.stringify(req.body),
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        redirect: "follow"
      });
      
      const text = await response.text();
      try {
        const data = JSON.parse(text);
        res.json(data);
      } catch (e) {
        console.error("GAS Login Response not JSON:", text);
        const isHtml = text.trim().startsWith("<");
        const errorMessage = isHtml 
          ? "Database mengembalikan halaman HTML. Pastikan App Script sudah di-deploy dengan akses 'Anyone'."
          : `Format tidak valid: ${text.substring(0, 100)}`;
        res.status(500).json({ success: false, message: errorMessage });
      }
    } catch (error) {
      console.error("Login Error:", error);
      res.status(500).json({ success: false, message: "Gagal menghubungkan ke database Google Sheets" });
    }
  });

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
    console.error("Order Error:", error);
    res.status(500).json({ success: false, message: "Gagal mengirim pesanan" });
  }
});


  app.get("/api/order/:id", async (req, res) => {
    try {
      const { id } = req.params;
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
      console.error("Check Order Status Error:", error);
      res.status(500).json({ success: false, message: "Server Kasir tidak terjangkau" });
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
        if (response.status === 503) {
          return res.status(503).json({ 
            success: false, 
            message: "Server Kasir (Admin) sedang Offline atau Terputus (Tunnel Unavailable)." 
          });
        }
        return res.status(response.status).json({ 
          success: false, 
          message: `Kasir Admin merespon dengan status ${response.status}` 
        });
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Kasir merespon dengan HTML (Localtunnel Reminder)");
        return res.status(403).json({ 
          success: false, 
          message: "Akses tertahan oleh Localtunnel Reminder. Silakan buka link Localtunnel di browser HP/Laptop kamu, klik 'Continue', lalu refresh aplikasi ini." 
        });
      }

      const data = await response.json();
      console.log("=== DATA DARI ADMIN BERHASIL DITERIMA ===");
      console.log("Format Data:", Array.isArray(data) ? "Array" : typeof data);
      console.log("Jumlah Item:", Array.isArray(data) ? data.length : "N/A");
      if (Array.isArray(data) && data.length > 0) {
        console.log("Contoh Item Pertama:", JSON.stringify(data[0], null, 2));
      }
      res.json(data);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        return res.status(504).json({ success: false, message: "Koneksi ke Kasir sangat lambat (Timeout 15s). Coba lagi?" });
      }
      res.status(500).json({ 
        success: false, 
        message: "Gagal terhubung ke link Localtunnel.",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });


  // Vite middleware for development
  const isProduction = process.env.NODE_ENV === "production";
  console.log(`Server starting in ${isProduction ? "PRODUCTION" : "DEVELOPMENT"} mode`);

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
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