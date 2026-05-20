// DetectionOverlay.jsx — Canvas nakładający bounding boxes na zdjęcie
//
// Używamy HTML5 Canvas API do rysowania prostokątów detekcji.
// To jest odpowiednik System.Drawing lub SkiaSharp w .NET.
//
// Uwaga: Roboflow zwraca x,y jako ŚRODEK bbox (nie lewy górny róg).
// Dlatego przeliczamy: leftX = x - width/2, topY = y - height/2

import { useEffect, useRef } from "react";

/**
 * @param {File}    imageFile   - File object ze zdjęciem
 * @param {Array}   predictions - wyniki Roboflow: [{ class, confidence, x, y, width, height }]
 */
export default function DetectionOverlay({ imageFile, predictions }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!imageFile || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Ładujemy obraz przez Image API
    const img = new Image();
    img.src = URL.createObjectURL(imageFile);

    img.onload = () => {
      // Ustawiamy rozmiar canvas na rozmiar obrazu
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      // Rysujemy obraz jako tło
      ctx.drawImage(img, 0, 0);

      // Rysujemy bounding boxes dla każdej detekcji
      if (predictions && predictions.length > 0) {
        predictions.forEach((pred) => {
          // Przeliczenie środka na lewy górny róg
          const x = pred.x - pred.width / 2;
          const y = pred.y - pred.height / 2;

          // Prostokąt detekcji
          ctx.strokeStyle = "#3b82f6"; // blue-500
          ctx.lineWidth = Math.max(2, img.naturalWidth / 400); // skalujemy grubość linii
          ctx.strokeRect(x, y, pred.width, pred.height);

          // Tło dla etykiety
          const label = `${pred.class} ${Math.round(pred.confidence * 100)}%`;
          const fontSize = Math.max(12, img.naturalWidth / 60);
          ctx.font = `bold ${fontSize}px sans-serif`;
          const textWidth = ctx.measureText(label).width;
          const textHeight = fontSize + 6;

          ctx.fillStyle = "#3b82f6";
          ctx.fillRect(x, y - textHeight, textWidth + 8, textHeight);

          // Tekst etykiety
          ctx.fillStyle = "#ffffff";
          ctx.fillText(label, x + 4, y - 4);
        });
      }
    };

    // Cleanup: zwalniamy blob URL żeby nie wyciekać pamięci
    return () => {
      URL.revokeObjectURL(img.src);
    };
  }, [imageFile, predictions]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full rounded-lg border border-slate-700"
      style={{ maxHeight: "300px", objectFit: "contain" }}
    />
  );
}
