import React, { useMemo, useState, useEffect } from "react";
import "../styles/SmartForm.css";
import SearchSelect from "./SearchSelect";

/**
 * fields:
 *  - normal fields as before
 *  - plus:
 *    { type:"array", name:"items", label:"Prekės", addLabel:"+ Pridėti", minRows?:1,
 *      rowFields: [
 *        { name:"productId", type:"searchselect", options:[...], required:true, colSpan?:1|2 },
 *        { name:"quantity", type:"number", required:true, colSpan?:1|2 }
 *      ]
 *    }
 */

export default function SmartForm({
  fields,
  initialValues = {},
  patchValues = null,      // ✅ allows prefill (client info)
  submitLabel = "Save",
  cancelLabel = "Cancel",
  onSubmit,
  onCancel,
  onValuesChange,
}) {
  const [values, setValues] = useState(() => ({ ...initialValues }));
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // reset when initialValues changes (edit page)
  useEffect(() => {
    setValues({ ...initialValues });
    setTouched({});
  }, [initialValues]);

  // merge patchValues (do not overwrite touched fields)
  useEffect(() => {
    if (!patchValues) return;

    setValues((prev) => {
      let changed = false;
      const next = { ...prev };

      for (const [k, v] of Object.entries(patchValues)) {
        if (touched[k]) continue;
        if (next[k] !== v) {
          next[k] = v;
          changed = true;
        }
      }

      if (changed) onValuesChange?.(next);
      return changed ? next : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patchValues]);

  const setField = (name, value) => {
    setValues((prev) => {
      const next = { ...prev, [name]: value };
      onValuesChange?.(next);
      return next;
    });
  };

  const markTouched = (name) =>
    setTouched((p) => ({ ...p, [name]: true }));

  // ✅ array helpers
  const setArrayRowField = (arrName, idx, fieldName, value) => {
    setValues((prev) => {
      const arr = Array.isArray(prev[arrName]) ? prev[arrName] : [];
      const nextArr = arr.map((row, i) =>
        i === idx ? { ...row, [fieldName]: value } : row
      );
      const next = { ...prev, [arrName]: nextArr };
      onValuesChange?.(next);
      return next;
    });
  };

  const addArrayRow = (arrName, emptyRow) => {
    setValues((prev) => {
      const arr = Array.isArray(prev[arrName]) ? prev[arrName] : [];
      const next = { ...prev, [arrName]: [...arr, { ...emptyRow }] };
      onValuesChange?.(next);
      return next;
    });
  };

  const removeArrayRow = (arrName, idx, minRows = 0) => {
    setValues((prev) => {
      const arr = Array.isArray(prev[arrName]) ? prev[arrName] : [];
      if (arr.length <= minRows) return prev;

      const nextArr = arr.filter((_, i) => i !== idx);
      const next = { ...prev, [arrName]: nextArr };
      onValuesChange?.(next);
      return next;
    });
  };

  // ✅ validation (normal + array row validation)
  const errors = useMemo(() => {
    const next = {};

    const isEmpty = (v) =>
      v == null ||
      v === "" ||
      (Array.isArray(v) && v.length === 0) ||
      (typeof v === "number" && Number.isNaN(v));

    for (const f of fields) {
      const visible = f.visible ? f.visible(values) : true;
      if (!visible) continue;

      // array validation
      if (f.type === "array") {
        const arr = Array.isArray(values[f.name]) ? values[f.name] : [];
        const rowFields = f.rowFields ?? [];

        if (f.required && arr.length === 0) {
          next[f.name] = "Required";
        }

        arr.forEach((row, idx) => {
          rowFields.forEach((rf) => {
            const rowVisible = rf.visible ? rf.visible(row, values) : true;
            if (!rowVisible) return;

            const v = row?.[rf.name];

            if (rf.required && isEmpty(v)) {
              next[`${f.name}[${idx}].${rf.name}`] = "Required";
              return;
            }

            if (typeof rf.validate === "function") {
              const msg = rf.validate(v, row, values);
              if (msg) next[`${f.name}[${idx}].${rf.name}`] = msg;
            }
          });
        });

        continue;
      }

      // normal validation
      if (!f.name) continue;

      const v = values[f.name];

      if (f.required && isEmpty(v)) {
        next[f.name] = "Required";
        continue;
      }

      if (typeof f.validate === "function") {
        const msg = f.validate(v, values);
        if (msg) next[f.name] = msg;
      }
    }

    return next;
  }, [fields, values]);

  const canSubmit = Object.keys(errors).length === 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // mark all normal fields touched
    const t = {};
    fields.forEach((f) => {
      if (f.type === "array") {
        const arr = Array.isArray(values[f.name]) ? values[f.name] : [];
        const rowFields = f.rowFields ?? [];
        arr.forEach((_, idx) => {
          rowFields.forEach((rf) => {
            if (!rf.name) return;
            t[`${f.name}[${idx}].${rf.name}`] = true;
          });
        });
      } else if (f.name) {
        t[f.name] = true;
      }
    });
    setTouched(t);

    if (!canSubmit) return;

    try {
      setSubmitting(true);
      await onSubmit?.(values);
    } finally {
      setSubmitting(false);
    }
  };

  const renderInput = (f, value, err, disabled, onChange, onBlur) => {
    if (f.type === "textarea") {
      return (
        <textarea
          className={`sf-input ${err ? "is-error" : ""}`}
          placeholder={f.placeholder}
          value={value}
          disabled={disabled}
          onBlur={onBlur}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
        />
      );
    }

    if (f.type === "select") {
      return (
        <select
          className={`sf-input ${err ? "is-error" : ""}`}
          value={value}
          disabled={disabled}
          onBlur={onBlur}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">— Select —</option>
          {(f.options ?? []).map((opt) => (
            <option key={String(opt.value)} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    }

    if (f.type === "searchselect") {
      return (
        <SearchSelect
          value={value}
          options={f.options ?? []}
          placeholder={f.placeholder ?? "Pasirinkite..."}
          onChange={(val) => onChange(val)}
        />
      );
    }

    if (f.type === "checkbox") {
      return (
        <label className="sf-check">
          <input
            type="checkbox"
            checked={!!value}
            disabled={disabled}
            onChange={(e) => onChange(e.target.checked)}
            onBlur={onBlur}
          />
          <span>{f.help ?? ""}</span>
        </label>
      );
    }

    return (
      <input
        className={`sf-input ${err ? "is-error" : ""}`}
        type={f.type || "text"}
        placeholder={f.placeholder}
        value={value}
        disabled={disabled}
        onBlur={onBlur}
        onChange={(e) => {
          const raw = e.target.value;
          if (f.type === "number") onChange(raw === "" ? "" : Number(raw));
          else onChange(raw);
        }}
      />
    );
  };

  return (
    <form className="sf" onSubmit={handleSubmit}>
      <div className="sf-grid">
        {fields.map((f, idx) => {
          const show = f.visible ? f.visible(values) : true;
          if (!show) return null;

          // SECTION
          if (f.type === "section") {
            return (
              <div key={`section-${idx}`} className="sf-block span-2">
                <div className="sf-section-title">{f.title}</div>
                {f.subtitle ? <div className="sf-section-sub">{f.subtitle}</div> : null}
                <div className="sf-divider span-2" />
              </div>
            );
          }

          // ARRAY FIELD
          if (f.type === "array") {
            const arr = Array.isArray(values[f.name]) ? values[f.name] : [];
            const rowFields = f.rowFields ?? [];
            const minRows = f.minRows ?? 0;

            const arrayErr = touched[f.name] ? errors[f.name] : null;

            return (
              <div key={f.name} className="sf-field span-2">
                <label className="sf-label">
                  {f.label}
                  {f.required ? <span className="sf-req">*</span> : null}
                </label>

                {arrayErr ? <div className="sf-error">{arrayErr}</div> : null}

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {arr.map((row, rowIdx) => (
                    <div
                      key={`${f.name}-row-${rowIdx}`}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr auto",
                        gap: 10,
                        alignItems: "start",
                      }}
                    >
                      {/* render row fields (two-column feel) */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        {rowFields.map((rf) => {
                          const rowVisible = rf.visible ? rf.visible(row, values) : true;
                          if (!rowVisible) return null;

                          const key = `${f.name}[${rowIdx}].${rf.name}`;
                          const rowErr = touched[key] ? errors[key] : null;
                          const disabled = rf.disabled ? rf.disabled(row, values) : false;

                          const rfValue = row?.[rf.name] ?? "";

                          return (
                            <div
                              key={key}
                              className={`sf-field ${rf.colSpan === 2 ? "span-2" : ""}`}
                              style={rf.colSpan === 2 ? { gridColumn: "span 2" } : undefined}
                            >
                              <label className="sf-label">
                                {rf.label}
                                {rf.required ? <span className="sf-req">*</span> : null}
                              </label>

                              {renderInput(
                                rf,
                                rfValue,
                                rowErr,
                                disabled,
                                (val) => setArrayRowField(f.name, rowIdx, rf.name, val),
                                () => setTouched((p) => ({ ...p, [key]: true }))
                              )}

                              {rowErr ? <div className="sf-error">{rowErr}</div> : null}
                            </div>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        className="sf-btn sf-btn-ghost"
                        style={{ height: 42, marginTop: 22 }}
                        onClick={() => removeArrayRow(f.name, rowIdx, minRows)}
                        disabled={arr.length <= minRows}
                      >
                        Šalinti
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    className="sf-btn sf-btn-ghost"
                    onClick={() => addArrayRow(f.name, f.emptyRow ?? {})}
                  >
                    {f.addLabel ?? "+ Pridėti"}
                  </button>
                </div>
              </div>
            );
          }

          // NORMAL FIELD
          if (!f.name) return null;

          const disabled = f.disabled ? f.disabled(values) : false;
          const value = typeof f.getValue === "function" ? f.getValue(values) : values[f.name] ?? "";
          const err = touched[f.name] ? errors[f.name] : null;

          return (
            <div
              key={f.name}
              className={`sf-field ${f.colSpan === 2 ? "span-2" : ""}`}
            >
              {f.label ? (
                <label className="sf-label">
                  {f.label}
                  {f.required ? <span className="sf-req">*</span> : null}
                </label>
              ) : null}

              {renderInput(
                f,
                value,
                err,
                disabled,
                (val) => setField(f.name, val),
                () => markTouched(f.name)
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
