// analyze.js — route POST /api/analyze
//
// Tutaj łączymy wszystko:
// 1. multer odbiera multipart/form-data (tekst + pliki)
// 2. Roboflow analizuje każde zdjęcie przez YOLO
// 3. OpenAI streamuje raport przez SSE
//
// Multer w Node.js to odpowiednik IFormFile w ASP.NET Core
// — middleware który parsuje multipart/form-data i daje nam req.files i req.body

import express from "express";
import multer from "multer";
import { detectDamage, formatPredictionsForPrompt } from "../services/roboflow.js";
import { streamClaimAnalysis } from "../services/openai.js";

const router = express.Router();

// Konfiguracja multer — storage: memoryStorage() oznacza że pliki są w RAM (Buffer)
// Alternatywa: diskStorage() zapisuje na dysk — ale w Railway/serverless lepiej RAM
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max per file
    files: 5, // max 5 zdjęć
  },
  fileFilter: (req, file, cb) => {
    // Akceptujemy tylko obrazy
    // cb(error, accept) — to jest Node.js callback pattern (stary styl, ale multer go używa)
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

// POST /api/analyze
// upload.array("images", 5) — "images" to nazwa pola w FormData, 5 to max liczba plików
router.post("/", upload.array("images", 5), async (req, res) => {
  try {
    const { description } = req.body; // tekst z FormData
    const files = req.files || []; // array obiektów multer File

    // Walidacja — przynajmniej coś musi być
    if (!description?.trim() && files.length === 0) {
      return res.status(400).json({
        error: "Provide a claim description or at least one image.",
      });
    }

    // Krok 1: Równoległa analiza wszystkich zdjęć przez Roboflow
    // Promise.all() to odpowiednik Task.WhenAll() w C# — uruchamia wszystkie jednocześnie
    let allPredictions = [];

    if (files.length > 0) {
      const detectionResults = await Promise.all(
        files.map((file) => detectDamage(file.buffer, file.mimetype))
      );

      // Flatten: [[p1, p2], [p3]] → [p1, p2, p3]
      // W C# byłoby: results.SelectMany(x => x).ToList()
      allPredictions = detectionResults.flat();
    }

    // Krok 2: Formatujemy wyniki YOLO do tekstu dla LLM
    const yoloSummary = formatPredictionsForPrompt(allPredictions);

    // Krok 3: Streamujemy analizę przez GPT-4o (SSE)
    // Ta funkcja sama ustawia nagłówki i pisze do res — nie robimy res.json() po tym
    await streamClaimAnalysis(description || "", yoloSummary, res);
  } catch (error) {
    console.error("Error in /api/analyze:", error);

    // Jeśli SSE nie zostało jeszcze zainicjowane, możemy wysłać normalny HTTP error
    if (!res.headersSent) {
      return res.status(500).json({ error: error.message });
    }

    // Jeśli SSE już działa, wysyłamy błąd przez stream
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

export default router;
