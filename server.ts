import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API ROUTES ---

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // M-Pesa Callback Endpoint
  app.post("/api/mpesa/callback", async (req, res) => {
    console.log("M-Pesa Callback Received:", JSON.stringify(req.body));
    
    // In a real application, you would:
    // 1. Verify the request (security)
    // 2. Parse the STK Push result
    // 3. Update the 'donations' table in Supabase via service role
    
    // Simplified logic:
    const result = req.body?.Body?.stkCallback;
    if (result && result.ResultCode === 0) {
      console.log("Transaction Successful:", result.MerchantRequestID);
    }

    res.status(200).json({ ResultCode: 0, ResultDesc: "Success" });
  });

  // --- VITE MIDDLEWARE ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer();
