import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// Punkt wejścia React — odpowiednik Program.cs
// StrictMode pomaga wykrywać problemy w dev (renderuje komponenty dwa razy celowo)
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
