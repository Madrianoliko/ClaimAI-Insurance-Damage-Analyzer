// App.jsx — główny komponent, zarządza stanem i logiką biznesową
//
// Architektura: App trzyma cały stan (useState) i zawiera logikę fetch+streaming.
// Komponenty dzieci są "głupie" — tylko wyświetlają dane przez props.
// To jest wzorzec "lifting state up" — odpowiednik ViewModel w MVVM / Blazor.

import { useState } from "react";
import ClaimInput from "./components/ClaimInput.jsx";
import DamageReport from "./components/DamageReport.jsx";

// W dev: Vite proxy przekierowuje /api → localhost:3001 (vite.config.js)
// Na produkcji (Railway): VITE_API_URL wskazuje na URL backendu, np. https://claimai-backend.up.railway.app
// import.meta.env to odpowiednik IConfiguration w C# — zmienne środowiskowe Vite wstrzykuje w build time
const API_BASE = import.meta.env.VITE_API_URL || "";

// Stan aplikacji — co może się dziać
const STATUS = {
  IDLE: "idle",           // Nic się nie dzieje, formularz gotowy
  LOADING: "loading",     // Wysłano request, czekamy na YOLO
  STREAMING: "streaming", // Otrzymujemy streaming z GPT-4o
  DONE: "done",           // Analiza zakończona
  ERROR: "error",         // Coś poszło nie tak
};

export default function App() {
  const [status, setStatus] = useState(STATUS.IDLE);
  const [rawStreamText, setRawStreamText] = useState(""); // surowy JSON zbierany z chunków
  const [report, setReport] = useState(null);             // sparsowany obiekt raportu
  const [error, setError] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]); // File objects dla podglądu

  /**
   * Główna funkcja analizy — wywoływana przez ClaimInput po submit.
   *
   * @param {string} description - opis zdarzenia z formularza
   * @param {File[]} images      - array File objects z drag&drop
   */
  async function handleAnalyze(description, images) {
    // Reset stanu przed nową analizą
    setStatus(STATUS.LOADING);
    setRawStreamText("");
    setReport(null);
    setError(null);
    setUploadedImages(images);

    try {
      // Budujemy FormData — odpowiednik MultipartFormDataContent w C# HttpClient
      const formData = new FormData();
      formData.append("description", description);
      images.forEach((img) => formData.append("images", img));

      // Fetch z POST — nie ustawiamy Content-Type ręcznie!
      // Przeglądarka sama ustawi "multipart/form-data; boundary=..." gdy wykryje FormData
      const response = await fetch(`${API_BASE}/api/analyze`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Server error");
      }

      // SSE reading — przeglądarka dostarcza ReadableStream przez response.body
      // To NIE jest EventSource (który działa tylko z GET) — czytamy stream ręcznie
      setStatus(STATUS.STREAMING);

      const reader = response.body.getReader();
      const decoder = new TextDecoder(); // Konwertuje Uint8Array → string
      let accumulated = ""; // zbieramy cały JSON tutaj

      while (true) {
        // read() zwraca { done, value } — value to Uint8Array
        const { done, value } = await reader.read();
        if (done) break;

        // Dekodujemy bajty do stringa
        const chunk = decoder.decode(value, { stream: true });

        // SSE format: "data: {...}\n\ndata: {...}\n\n"
        // Splitujemy po linii i parsujemy każdy event
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6); // Usuwa "data: " prefix
          try {
            const event = JSON.parse(jsonStr);

            if (event.error) {
              throw new Error(event.error);
            }

            if (event.done) {
              // Streaming zakończony — parsujemy zebrany JSON
              try {
                const parsed = JSON.parse(accumulated);
                setReport(parsed);
                setStatus(STATUS.DONE);
              } catch {
                throw new Error("Failed to parse AI response as JSON");
              }
              return;
            }

            if (event.text) {
              accumulated += event.text;
              setRawStreamText(accumulated); // Pokazujemy surowy JSON podczas streamowania
            }
          } catch (parseErr) {
            if (parseErr.message !== "Unexpected end of JSON input") {
              throw parseErr;
            }
          }
        }
      }
    } catch (err) {
      console.error("Analysis failed:", err);
      setError(err.message);
      setStatus(STATUS.ERROR);
    }
  }

  const isAnalyzing = status === STATUS.LOADING || status === STATUS.STREAMING;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            CA
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">ClaimAI</h1>
            <p className="text-xs text-slate-400">Automated Vehicle Damage Assessment</p>
          </div>
        </div>
      </header>

      {/* Main layout — dwie kolumny na desktop, jedna na mobile */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Lewa kolumna: formularz wejściowy */}
          <div>
            <ClaimInput onAnalyze={handleAnalyze} isLoading={isAnalyzing} />
          </div>

          {/* Prawa kolumna: wyniki */}
          <div>
            {status === STATUS.IDLE && (
              <div className="flex flex-col items-center justify-center h-64 text-slate-600 border border-dashed border-slate-800 rounded-xl">
                <p className="text-4xl mb-3">📋</p>
                <p className="text-sm">Your damage report will appear here</p>
              </div>
            )}

            {status === STATUS.LOADING && (
              <div className="flex flex-col items-center justify-center h-64 gap-4">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-400 text-sm">Analyzing images (YOLO)...</p>
              </div>
            )}

            {status === STATUS.STREAMING && (
              <div className="flex flex-col items-center justify-center h-64 gap-4">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-400 text-sm">GPT-4o generating report...</p>
                <p className="text-xs text-slate-600 font-mono max-w-xs truncate">{rawStreamText.slice(-60)}</p>
              </div>
            )}

            {status === STATUS.ERROR && (
              <div className="p-6 bg-red-950 border border-red-800 rounded-xl">
                <p className="text-red-400 font-medium mb-1">Analysis error</p>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {status === STATUS.DONE && report && (
              <DamageReport report={report} images={uploadedImages} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
