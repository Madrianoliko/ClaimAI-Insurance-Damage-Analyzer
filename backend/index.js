// index.js — punkt wejścia serwera Express
//
// Analogia z C#: to jest odpowiednik Program.cs z builder.Build() i app.Run()
// Express = Kestrel + middleware pipeline w jednym

import "dotenv/config"; // Ładuje .env do process.env — musi być PIERWSZE
import express from "express";
import cors from "cors";
import analyzeRouter from "./routes/analyze.js";

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middleware ---

// CORS — lista dozwolonych originów
// W dev: localhost:5173 (Vite)
// Na Railway: FRONTEND_URL wskazuje na URL frontendu (np. https://claimai-frontend.up.railway.app)
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean); // filter(Boolean) usuwa undefined jeśli FRONTEND_URL nie ustawione

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  })
);

// Parsowanie JSON body dla zwykłych requestów (nie multipart — to robi multer)
app.use(express.json());

// --- Routes ---

// Wszystkie endpointy pod /api/analyze obsługuje nasz router
app.use("/api/analyze", analyzeRouter);

// Health check — prosty endpoint do sprawdzenia czy serwer żyje
// Użyteczne na Railway i w CI/CD
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// --- Start ---

app.listen(PORT, () => {
  console.log(`ClaimAI backend running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
