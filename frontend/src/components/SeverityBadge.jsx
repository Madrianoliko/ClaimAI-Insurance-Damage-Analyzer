// SeverityBadge.jsx — badge z klasyfikacją powagi szkody
// Mały komponent, ale dobry przykład mapowania wartości na style

const SEVERITY_CONFIG = {
  MINOR: {
    label: "MINOR",
    bg: "bg-emerald-950",
    border: "border-emerald-700",
    text: "text-emerald-400",
    dot: "bg-emerald-400",
  },
  MODERATE: {
    label: "MODERATE",
    bg: "bg-yellow-950",
    border: "border-yellow-700",
    text: "text-yellow-400",
    dot: "bg-yellow-400",
  },
  SEVERE: {
    label: "SEVERE",
    bg: "bg-orange-950",
    border: "border-orange-700",
    text: "text-orange-400",
    dot: "bg-orange-400",
  },
  TOTAL_LOSS: {
    label: "TOTAL LOSS",
    bg: "bg-red-950",
    border: "border-red-700",
    text: "text-red-400",
    dot: "bg-red-400",
  },
};

/**
 * @param {string} severity - "MINOR" | "MODERATE" | "SEVERE" | "TOTAL_LOSS"
 */
export default function SeverityBadge({ severity }) {
  // Fallback na wypadek nieoczekiwanej wartości z API
  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.MODERATE;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${config.bg} ${config.border}`}>
      <span className={`w-2 h-2 rounded-full ${config.dot}`} />
      <span className={`text-xs font-bold tracking-wider ${config.text}`}>
        {config.label}
      </span>
    </div>
  );
}
