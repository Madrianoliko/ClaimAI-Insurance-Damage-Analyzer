// ClaimInput.jsx — formularz wejściowy: pole tekstowe + upload zdjęć
//
// Ten komponent jest "controlled" — stan formularza trzymamy w React (useState),
// nie w DOM. To jest fundamentalna różnica vs. Blazor gdzie @bind robi to samo.
// W React: value={state} + onChange={setter} = two-way binding

import { useState } from "react";
import ImageUpload from "./ImageUpload.jsx";

/**
 * @param {function} onAnalyze - callback do App.jsx: (description, images) => void
 * @param {boolean} isLoading  - czy analiza trwa (blokuje submit)
 */
export default function ClaimInput({ onAnalyze, isLoading }) {
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]); // array File objects

  function handleSubmit(e) {
    e.preventDefault(); // Zapobiega przeładowaniu strony — odpowiednik @onsubmit w Blazor

    if (!description.trim() && images.length === 0) return;
    onAnalyze(description, images);
  }

  const canSubmit = (description.trim() || images.length > 0) && !isLoading;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
        <span>🔍</span>
        Claim Submission
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Incident description field */}
        <div>
          <label className="block text-sm text-slate-400 mb-2">
            Incident Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="E.g. Head-on collision at intersection — front-end impact. Airbags deployed. Vehicle is not drivable and requires towing."
            rows={5}
            disabled={isLoading}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm text-slate-100 placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 transition-colors"
          />
        </div>

        {/* Drag & drop upload */}
        <div>
          <label className="block text-sm text-slate-400 mb-2">
            Damage Photos{" "}
            <span className="text-slate-600">(optional, max 5)</span>
          </label>
          <ImageUpload
            images={images}
            onImagesChange={setImages}
            disabled={isLoading}
          />
        </div>

        {/* Przycisk submit */}
        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium rounded-lg transition-colors text-sm"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Analyzing...
            </span>
          ) : (
            "Analyze Claim"
          )}
        </button>
      </form>
    </div>
  );
}
