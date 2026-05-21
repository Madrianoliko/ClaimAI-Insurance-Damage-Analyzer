// index.js — punkt wejścia serwera Express
//
// Analogia z C#: to jest odpowiednik Program.cs z builder.Build() i app.Run()
// Express = Kestrel + middleware pipeline w jednym

import "dotenv/config"; // Ładuje .env do process.env — musi być PIERWSZE
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import analyzeRouter from "./routes/analyze.js";

const app = express();
const PORT = process.env.PORT || 3001;

// __dirname nie istnieje w ES modules — trzeba je odtworzyć
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Middleware ---

// CORS — tylko w dev (localhost:5173)
// Na produkcji frontend serwowany jest przez ten sam serwer → CORS niepotrzebny
app.use(
  cors({
    origin: "http://localhost:5173",
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

// --- Serwowanie frontendu (produkcja) ---
// Na Railway: Express serwuje zbudowany React z frontend/dist
// W dev: Vite działa osobno na :5173 (ten blok nie jest aktywny)
const frontendDist = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendDist));

// Catch-all: React Router obsługuje routing po stronie klienta
// Każde nieznane GET / zwraca index.html zamiast "Cannot GET /"
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendDist, "index.html"));
});

// --- Start ---

app.listen(PORT, () => {
  console.log(`ClaimAI backend running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
