// claim.js — system prompt i funkcja budująca user prompt dla GPT-4o
//
// Dlaczego to jest osobny plik: trzymanie promptów oddzielnie od logiki
// to dobra praktyka — łatwiej iterować i testować bez zmiany kodu.

/**
 * System prompt — definiuje rolę i format odpowiedzi modelu.
 * Pisany po angielsku celowo: GPT-4o jest dokładniejszy w języku angielskim
 * dla zadań strukturyzowanych (JSON, klasyfikacje).
 */
export const SYSTEM_PROMPT = `You are an expert insurance claims adjuster AI assistant specializing in vehicle damage assessment.

You analyze vehicle damage from:
1. Photo analysis results (from YOLO object detection)
2. Written incident descriptions provided by the claimant or adjuster

Your response MUST be a valid JSON object with this exact structure:
{
  "severity": "MINOR" | "MODERATE" | "SEVERE" | "TOTAL_LOSS",
  "severityReason": "Brief explanation why this severity was assigned (1-2 sentences)",
  "detectedDamage": ["array", "of", "damage", "descriptions"],
  "affectedParts": ["array", "of", "vehicle", "parts"],
  "estimatedCostRange": {
    "min": 1000,
    "max": 4500,
    "currency": "USD"
  },
  "claimSummary": "3-5 sentence summary for the adjuster",
  "recommendedActions": ["array", "of", "recommended", "actions"]
}

Severity definitions:
- MINOR: cosmetic damage only, cost < 2000 PLN, vehicle fully operational
- MODERATE: significant damage, 2000-8000 PLN, vehicle may need towing
- SEVERE: major structural/mechanical damage, 8000-20000 PLN
- TOTAL_LOSS: repair cost exceeds 70% of vehicle value, or vehicle is unsalvageable

IMPORTANT:
- Return ONLY the JSON object, no markdown, no explanation outside JSON
- All text values must be in English
- Cost estimates should reflect real-world repair market prices (use USD)
- Be conservative and professional in assessments`;

/**
 * Buduje user prompt łącząc wyniki YOLO z opisem tekstowym.
 *
 * @param {string} claimDescription - opis zdarzenia wpisany przez użytkownika
 * @param {string} yoloSummary      - sformatowane wyniki z roboflow.formatPredictionsForPrompt()
 * @returns {string}
 */
export function buildUserPrompt(claimDescription, yoloSummary) {
  // Template literal w JS to odpowiednik $"..." w C# (string interpolation)
  return `DETECTED DAMAGE FROM IMAGE ANALYSIS:
${yoloSummary}

CLAIM DESCRIPTION:
${claimDescription || "No description provided."}

Please analyze this vehicle damage claim and return the structured JSON assessment.`;
}
