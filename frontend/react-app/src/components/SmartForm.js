import React, { useMemo, useState } from "react";
import "../styles/SmartForm.css";

/**
 * fields: [
 *  { name:"name", label:"Name", type:"text", required:true, placeholder:"...", colSpan?:1|2,
 *    options?: [{value,label}] (select),
 *    getValue?: (values)=>any (computed),
 *    visible?: (values)=>boolean,
 *    disabled?: (values)=>boolean,
 *    validate?: (value, values)=> string | null
 *  }
 * ]
 */
export default function SmartForm({
  fields,
  initialValues = {},
  submitLabel = "Save",
  cancelLabel = "Cancel",
  onSubmit,
  onCancel,
}) {
  const [values, setValues] = useState(() => ({ ...initialValues }));
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const errors = useMemo(() => {
    const next = {};
    for (const f of fields) {
      const isVisible = f.visible ? f.visible(values) : true;
      if (!isVisible) continue;

      const v = values[f.name];

      if (f.required) {
        const empty =
          v == null ||
          v === "" ||
          (Array.isArray(v) && v.length === 0) ||
          (typeof v === "number" && Number.isNaN(v));
        if (empty) next[f.name] = "Required";
      }

      if (!next[f.name] && typeof f.validate === "function") {
        const msg = f.validate(v, values);
        if (msg) next[f.name] = msg;
      }
    }
    return next;
  }, [fields, values]);

  const canSubmit = Object.keys(errors).length === 0;

  const setField = (name, value) => setValues((p) => ({ ...p, [name]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(Object.fromEntries(fields.map((f) => [f.name, true])));

    if (!canSubmit) return;

    try {
      setSubmitting(true);
      await onSubmit?.(values);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="sf" onSubmit={handleSubmit}>
      <div className="sf-grid">
        {fields.map((f) => {
          const isVisible = f.visible ? f.visible(values) : true;
          if (!isVisible) return null;

          const isDisabled = f.disabled ? f.disabled(values) : false;

          const value =
            typeof f.getValue === "function" ? f.getValue(values) : values[f.name] ?? "";

          const err = touched[f.name] ? errors[f.name] : null;

          return (
            <div
              key={f.name}
              className={`sf-field ${f.colSpan === 2 ? "span-2" : ""}`}
            >
              <label className="sf-label">
                {f.label}
                {f.required ? <span className="sf-req">*</span> : null}
              </label>

              {/* INPUT TYPES */}
              {f.type === "textarea" ? (
                <textarea
                  className={`sf-input ${err ? "is-error" : ""}`}
                  placeholder={f.placeholder}
                  value={value}
                  disabled={isDisabled}
                  onBlur={() => setTouched((p) => ({ ...p, [f.name]: true }))}
                  onChange={(e) => setField(f.name, e.target.value)}
                  rows={4}
                />
              ) : f.type === "select" ? (
                <select
                  className={`sf-input ${err ? "is-error" : ""}`}
                  value={value}
                  disabled={isDisabled}
                  onBlur={() => setTouched((p) => ({ ...p, [f.name]: true }))}
                  onChange={(e) => setField(f.name, e.target.value)}
                >
                  <option value="">— Select —</option>
                  {(f.options ?? []).map((opt) => (
                    <option key={String(opt.value)} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : f.type === "checkbox" ? (
                <label className="sf-check">
                  <input
                    type="checkbox"
                    checked={!!values[f.name]}
                    disabled={isDisabled}
                    onChange={(e) => setField(f.name, e.target.checked)}
                  />
                  <span>{f.help ?? ""}</span>
                </label>
              ) : (
                <input
                  className={`sf-input ${err ? "is-error" : ""}`}
                  type={f.type || "text"}
                  placeholder={f.placeholder}
                  value={value}
                  disabled={isDisabled}
                  onBlur={() => setTouched((p) => ({ ...p, [f.name]: true }))}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (f.type === "number") {
                      setField(f.name, raw === "" ? "" : Number(raw));
                    } else {
                      setField(f.name, raw);
                    }
                  }}
                />
              )}

              {err ? <div className="sf-error">{err}</div> : null}
            </div>
          );
        })}
      </div>

      <div className="sf-actions">
        <button type="button" className="sf-btn sf-btn-ghost" onClick={onCancel}>
          {cancelLabel}
        </button>

        <button type="submit" className="sf-btn" disabled={!canSubmit || submitting}>
          {submitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}