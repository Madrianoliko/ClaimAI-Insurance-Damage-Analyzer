// ImageUpload.jsx — drag & drop komponent do uploadu zdjęć
//
// Kluczowe koncepty JS/Browser API używane tutaj:
// - DataTransfer API: e.dataTransfer.files przy drag&drop
// - FileReader API: czytanie pliku do base64/URL dla podglądu
// - URL.createObjectURL(): tworzy tymczasowy URL do pliku (szybszy niż FileReader dla podglądu)

import { useState, useRef } from "react";

/**
 * @param {File[]} images           - aktualnie wybrane pliki
 * @param {function} onImagesChange - setter: (newImages: File[]) => void
 * @param {boolean} disabled
 */
export default function ImageUpload({ images, onImagesChange, disabled }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null); // Ref do ukrytego <input type="file">

  // Obsługa plików — wspólna logika dla drag&drop i kliknięcia
  function processFiles(fileList) {
    // FileList nie jest zwykłą tablicą — konwertujemy przez Array.from()
    // W C# byłoby: fileList.Cast<File>().ToArray()
    const newFiles = Array.from(fileList).filter((f) =>
      f.type.startsWith("image/")
    );

    // Nie przekraczamy limitu 5 zdjęć
    const combined = [...images, ...newFiles].slice(0, 5);
    onImagesChange(combined);
  }

  // Drag events — musimy obsłużyć wszystkie 4 żeby działało poprawnie
  function handleDragOver(e) {
    e.preventDefault(); // Bez tego przeglądarka nie pozwoli na drop
    setIsDragging(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    if (!disabled) {
      processFiles(e.dataTransfer.files);
    }
  }

  function handleFileInput(e) {
    processFiles(e.target.files);
    // Reset input value — pozwala na wybranie tego samego pliku ponownie
    e.target.value = "";
  }

  function removeImage(index) {
    onImagesChange(images.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      {/* Strefa drag & drop */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragging
            ? "border-blue-500 bg-blue-950"
            : "border-slate-700 hover:border-slate-600 bg-slate-800"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <p className="text-2xl mb-2">📸</p>
        <p className="text-sm text-slate-400">
          Drag photos here or{" "}
          <span className="text-blue-400 underline">click to browse</span>
        </p>
        <p className="text-xs text-slate-600 mt-1">JPG, PNG, WEBP — max 10MB each</p>

        {/* Ukryty input — klikamy go programowo przez ref */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileInput}
          disabled={disabled}
        />
      </div>

      {/* Podgląd wybranych zdjęć */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((file, index) => (
            <div key={index} className="relative group">
              <img
                // URL.createObjectURL tworzy tymczasowy blob: URL — szybki podgląd bez uploadu
                src={URL.createObjectURL(file)}
                alt={`Zdjęcie ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg border border-slate-700"
              />
              {/* Przycisk usuwania — pojawia się na hover */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation(); // Nie propaguj kliknięcia do drag zone
                  removeImage(index);
                }}
                className="absolute top-1 right-1 w-5 h-5 bg-red-600 rounded-full text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                ×
              </button>
              <p className="text-xs text-slate-500 truncate mt-1 px-1">{file.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
