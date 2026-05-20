// DamageList.jsx — lista wykrytych uszkodzeń z confidence score
// Reużywalny komponent używany w DamageReport

/**
 * @param {string[]} items     - lista stringów (uszkodzenia lub części)
 * @param {string}   title     - nagłówek sekcji
 * @param {string}   icon      - emoji ikona
 */
export default function DamageList({ items, title, icon }) {
  if (!items || items.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
        <span>{icon}</span>
        {title}
      </h3>
      <ul className="space-y-1.5">
        {items.map((item, index) => (
          <li
            key={index}
            className="flex items-start gap-2 text-sm text-slate-300"
          >
            {/* Mała kropka jako bullet point */}
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
