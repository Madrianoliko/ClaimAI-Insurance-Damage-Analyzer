// roboflow.js — klient do Roboflow Inference API (hosted YOLO)
//
// Jak to działa:
// 1. Przyjmujemy Buffer obrazu (surowe bajty pliku)
// 2. Konwertujemy na base64 string (bo tak wymaga Roboflow API)
// 3. Wysyłamy POST do hosted inference endpoint
// 4. Odbieramy JSON z listą "predictions" — każda to wykryty obiekt z bbox i confidence
//
// Analogia z C#: to jest odpowiednik HttpClient.PostAsync() z StringContent(base64)

// Node 18+ ma fetch jako globalny built-in — nie trzeba importować
// (tak samo jak window.fetch w przeglądarce, tyle że po stronie serwera)

/**
 * Wysyła obraz do Roboflow YOLO i zwraca listę wykrytych uszkodzeń.
 *
 * @param {Buffer} imageBuffer - surowe bajty obrazu (z multer: file.buffer)
 * @param {string} mimeType    - np. "image/jpeg", "image/png"
 * @returns {Promise<Array>}   - lista predictions: [{ class, confidence, x, y, width, height }]
 */
export async function detectDamage(imageBuffer, mimeType) {
  const apiKey = process.env.ROBOFLOW_API_KEY;
  const modelId = process.env.ROBOFLOW_MODEL_ID; // np. "car-damage-detection-zber5/1"

  if (!apiKey || !modelId) {
    throw new Error("Missing ROBOFLOW_API_KEY or ROBOFLOW_MODEL_ID in .env");
  }

  // Konwersja Buffer → base64 string
  // W C# byłoby: Convert.ToBase64String(bytes)
  const base64Image = imageBuffer.toString("base64");

  // Roboflow Serverless Inference URL — format z dokumentacji:
  // https://serverless.roboflow.com/{model_id}?api_key={key}
  // Uwaga: to "serverless.roboflow.com", NIE "detect.roboflow.com"
  const url = `https://serverless.roboflow.com/${modelId}?api_key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    // Wysyłamy surowy base64 jako body (bez prefiksu "data:image/...;base64,")
    // Roboflow serverless API tego oczekuje zgodnie z dokumentacją
    body: base64Image,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Roboflow API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();

  // data.predictions to tablica obiektów:
  // { class: "dent", confidence: 0.91, x: 320, y: 240, width: 150, height: 100 }
  // x,y to środek bounding box (nie lewy górny róg!) — ważne dla canvas rendering
  return data.predictions || [];
}

/**
 * Formatuje predictions do czytelnego tekstu dla LLM.
 * Np. "- dent (confidence: 91%) — position: front area"
 *
 * @param {Array} predictions - wynik z detectDamage()
 * @returns {string}
 */
export function formatPredictionsForPrompt(predictions) {
  if (!predictions || predictions.length === 0) {
    return "No damage detected in images by visual analysis.";
  }

  return predictions
    .map((p) => {
      const confidence = Math.round(p.confidence * 100);
      return `- ${p.class} (confidence: ${confidence}%)`;
    })
    .join("\n");
}
