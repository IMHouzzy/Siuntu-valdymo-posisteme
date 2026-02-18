import { useEffect, useMemo, useState } from "react";

/**
 * props:
 * - value
 * - options: [{value,label}]
 * - onChange(value)
 * - placeholder
 * - disabled
 * - maxOptions
 */
export default function SearchSelect({
  value,
  options = [],
  onChange,
  placeholder = "— Pasirinkite —",
  disabled = false,
  maxOptions,
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    const onDocClick = (e) => {
      if (!e.target.closest(".sf-combo")) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const selectedLabel = useMemo(() => {
    const opt = options.find(o => String(o.value) === String(value));
    return opt?.label ?? "";
  }, [options, value]);

  const filtered = useMemo(() => {
    const query = q.toLowerCase().trim();
    const list = !query
      ? options
      : options.filter(o => String(o.label).toLowerCase().includes(query));
    return list.slice(0, maxOptions);
  }, [options, q, maxOptions]);

  return (
    <div className="sf-combo">
      <button
        type="button"
        className="sf-combo-btn"
        disabled={disabled}
        onClick={() => setOpen(v => !v)}
      >
        <span className={value ? "" : "sf-combo-placeholder"}>
          {value ? selectedLabel : placeholder}
        </span>
        <span className="sf-combo-caret">▾</span>
      </button>

      {open && (
        <div className="sf-combo-menu" role="listbox">
          <input
            className="sf-combo-search"
            placeholder="Ieškoti..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoFocus
          />

          <div className="sf-combo-options">
            {filtered.map(opt => (
              <button
                key={String(opt.value)}
                type="button"
                className={`sf-combo-option ${String(opt.value) === String(value) ? "active" : ""}`}
                onClick={() => {
                  onChange?.(opt.value);
                  setOpen(false);
                }}
              >
                {opt.label}
              </button>
            ))}

            {options.length === 0 && (
              <div className="sf-combo-empty">Nėra pasirinkimų</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
