import React, { useMemo, useState, useEffect, useRef } from "react";
import "../styles/SmartForm.css";
import SearchSelect from "./SearchSelect";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const API_BASE = "http://localhost:5065";

// ─── Leaflet helper (lazy-loaded) ─────────────────────────────────────────────
let _L = null;
async function getLeaflet() {
  if (_L) return _L;
  const mod = await import("leaflet");
  _L = mod.default ?? mod;
  delete _L.Icon.Default.prototype._getIconUrl;
  _L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
  if (!document.getElementById("leaflet-css")) {
    const link = document.createElement("link");
    link.id = "leaflet-css";
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
  }
  return _L;
}

async function geocodeAddress(address) {
  if (!address) return null;
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`,
      { headers: { "Accept-Language": "lt,en" } }
    );
    const data = await res.json();
    if (!data?.[0]) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
}

// ─── MapWidget — READ-ONLY, shows pin from geocoded address ──────────────────
// The map is NOT interactive. Clicking does nothing.
// The address prop drives where the pin appears.
function MapWidget({ address }) {
  const mapElRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [status, setStatus] = useState("loading"); // loading | ready | notfound | error

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setStatus("loading");
      try {
        const L = await getLeaflet();
        if (cancelled || !mapElRef.current) return;

        // Init map once
        if (!mapRef.current) {
          const map = L.map(mapElRef.current, {
            center: [54.9, 23.9],
            zoom: 7,
            zoomControl: true,
            dragging: true,   // allow pan/zoom for inspection
            scrollWheelZoom: true,
            doubleClickZoom: false,
            // disable click handler entirely — no point capture
          });
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap",
            maxZoom: 19,
          }).addTo(map);
          mapRef.current = map;
        }

        if (!address) { setStatus("notfound"); return; }

        const coords = await geocodeAddress(address);
        if (cancelled) return;

        if (!coords) { setStatus("notfound"); return; }

        // Place / move pin
        if (markerRef.current) {
          markerRef.current.setLatLng([coords.lat, coords.lng]);
        } else {
          markerRef.current = _L.marker([coords.lat, coords.lng]).addTo(mapRef.current);
        }
        mapRef.current.setView([coords.lat, coords.lng], 14);
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();

    return () => { cancelled = true; };
    // Re-run when address changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  return (
    <div className="sf-map-wrap">
      <div ref={mapElRef} className="sf-map" />

      {/* Overlay only while loading */}
      {status === "loading" && (
        <div className="sf-map-overlay">
          <div className="sf-map-spinner" />
          <span>Ieškoma adreso…</span>
        </div>
      )}

      <div className="sf-map-hint">
        {status === "notfound" && "⚠️ Adresas nerastas žemėlapyje"}
        {status === "error" && "⚠️ Nepavyko užkrauti žemėlapio"}
        {status === "ready" && `📍 ${address}`}
        {status === "loading" && ""}
      </div>
    </div>
  );
}

// ─── ProductViewWidget ────────────────────────────────────────────────────────
// Expects items in the shape returned by the API:
//   { quantity, unitPrice, vatValue, product: { name, unit, images: [{ url, isPrimary }] } }
function ProductViewWidget({ items }) {
  if (!items?.length) {
    return <div className="sf-pv-empty">Nėra prekių</div>;
  }

  const total = items.reduce((s, it) => s + (it.quantity ?? 1) * (it.unitPrice ?? 0) + (it.vatValue ?? 0), 0);

  return (
    <div className="sf-pv-list">
      {items.map((it, idx) => {
        const product = it.product ?? {};
        const images = product.images ?? [];

        // Find primary image, fall back to first
        const primary = images.find((i) => i.isPrimary) ?? images[0];
        const imgSrc = primary?.url
          ? (primary.url.startsWith("http") ? primary.url : `${API_BASE}${primary.url}`)
          : null;

        return (
          <div key={it.id_OrdersProduct ?? idx} className="sf-pv-row">
            <div className="sf-pv-img-wrap">
              {imgSrc
                ? <img src={imgSrc} alt={product.name} className="sf-pv-img" />
                : <div className="sf-pv-img-ph">📷</div>}
            </div>
            <div className="sf-pv-info">
              <span className="sf-pv-name">{product.name ?? "—"}</span>
              <span className="sf-pv-meta">
                {it.quantity} {product.unit ?? "vnt"} × €{Number(it.unitPrice ?? 0).toFixed(2)}
                {it.vatValue
                  ? <span className="sf-pv-vat"> (+€{Number(it.vatValue).toFixed(2)} PVM)</span>
                  : null}
              </span>
            </div>
            <div className="sf-pv-total">
              €{(Number(it.quantity ?? 1) * Number(it.unitPrice ?? 0)).toFixed(2)}
            </div>
          </div>
        );
      })}
      <div className="sf-pv-footer">
        <span>Iš viso</span>
        <span className="sf-pv-sum">€{total.toFixed(2)}</span>
      </div>
    </div>
  );
}

// ─── SmartForm ────────────────────────────────────────────────────────────────
export default function SmartForm({
  fields,
  initialValues = {},
  patchValues = null,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  onSubmit,
  onCancel,
  onValuesChange,
}) {
  const [values, setValues] = useState(() => ({ ...initialValues }));
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setValues({ ...initialValues });
    setTouched({});
  }, [initialValues]);

  useEffect(() => {
    if (!patchValues) return;
    setValues((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const [k, v] of Object.entries(patchValues)) {
        if (touched[k]) continue;
        if (next[k] !== v) { next[k] = v; changed = true; }
      }
      return changed ? next : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patchValues]);

  const setField = (name, value) =>
    setValues((prev) => {
      const next = { ...prev, [name]: value };
      onValuesChange?.(next);
      return next;
    });

  const markTouched = (name) => setTouched((p) => ({ ...p, [name]: true }));

  const setArrayRowField = (arrName, idx, fieldName, value) =>
    setValues((prev) => {
      const arr = Array.isArray(prev[arrName]) ? prev[arrName] : [];
      const nextArr = arr.map((row, i) => i === idx ? { ...row, [fieldName]: value } : row);
      const next = { ...prev, [arrName]: nextArr };
      onValuesChange?.(next);
      return next;
    });

  const addArrayRow = (arrName, emptyRow) =>
    setValues((prev) => {
      const arr = Array.isArray(prev[arrName]) ? prev[arrName] : [];
      const next = { ...prev, [arrName]: [...arr, { ...emptyRow }] };
      onValuesChange?.(next);
      return next;
    });

  const removeArrayRow = (arrName, idx, minRows = 0) =>
    setValues((prev) => {
      const arr = Array.isArray(prev[arrName]) ? prev[arrName] : [];
      if (arr.length <= minRows) return prev;
      const next = { ...prev, [arrName]: arr.filter((_, i) => i !== idx) };
      onValuesChange?.(next);
      return next;
    });

  const errors = useMemo(() => {
    const next = {};
    const isEmpty = (v) =>
      v == null || v === "" ||
      (Array.isArray(v) && v.length === 0) ||
      (typeof v === "number" && Number.isNaN(v));

    for (const f of fields) {
      const visible = f.visible ? f.visible(values) : true;
      if (!visible) continue;

      if (f.type === "array") {
        const arr = Array.isArray(values[f.name]) ? values[f.name] : [];
        const rowFields = f.rowFields ?? [];
        if (f.required && arr.length === 0) next[f.name] = "Required";
        arr.forEach((row, idx) => {
          rowFields.forEach((rf) => {
            if (!(rf.visible ? rf.visible(row, values) : true)) return;
            const v = row?.[rf.name];
            if (rf.required && isEmpty(v)) { next[`${f.name}[${idx}].${rf.name}`] = "Required"; return; }
            if (typeof rf.validate === "function") {
              const msg = rf.validate(v, row, values);
              if (msg) next[`${f.name}[${idx}].${rf.name}`] = msg;
            }
          });
        });
        continue;
      }

      // These types have no validation
      if (f.type === "map" || f.type === "product-view" || f.type === "display") continue;
      if (!f.name) continue;

      const v = values[f.name];
      if (f.required && isEmpty(v)) { next[f.name] = "Required"; continue; }
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
    const t = {};
    fields.forEach((f) => {
      if (f.type === "array") {
        const arr = Array.isArray(values[f.name]) ? values[f.name] : [];
        (f.rowFields ?? []).forEach((rf) => {
          arr.forEach((_, idx) => { if (rf.name) t[`${f.name}[${idx}].${rf.name}`] = true; });
        });
      } else if (f.name) {
        t[f.name] = true;
      }
    });
    setTouched(t);
    if (!canSubmit) return;
    try { setSubmitting(true); await onSubmit?.(values); }
    finally { setSubmitting(false); }
  };

  // ── renderInput ─────────────────────────────────────────────────────────────
  const renderInput = (f, value, err, disabled, onChange, onBlur) => {

    if (f.type === "map") {
      // Read-only — address drives the pin, no click handler
      const addr = typeof f.getAddress === "function" ? f.getAddress(values) : (f.address ?? "");
      return <MapWidget address={addr} />;
    }

    if (f.type === "product-view") {
      const items = typeof f.getItems === "function" ? f.getItems(values) : (value ?? []);
      return <ProductViewWidget items={items} />;
    }

    if (f.type === "display") {
      const content = typeof f.render === "function"
        ? f.render(value, values)
        : value;

      return (
        <div className={`sf-display ${!content ? "is-placeholder" : ""}`}>
          {content || f.placeholder || "—"}
        </div>
      );
    }

    if (f.type === "file") {
      return (
        <input
          className={`sf-input ${err ? "is-error" : ""}`}
          type="file"
          multiple={!!f.multiple}
          accept={f.accept ?? "image/*"}
          disabled={disabled}
          onBlur={onBlur}
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            onChange(f.multiple ? files : (files[0] ?? null));
          }}
        />
      );
    }

    if (f.type === "images") {
      const list = Array.isArray(value) ? value : [];
      const move = (from, to) => {
        if (to < 0 || to >= list.length) return;
        const copy = [...list];
        const [item] = copy.splice(from, 1);
        copy.splice(to, 0, item);
        onChange(copy);
      };
      const removeAt = (idx) => { const copy = [...list]; copy.splice(idx, 1); onChange(copy); };
      const addFiles = (files) => {
        const added = files.map((file, i) => ({
          type: "new", file,
          tempKey: `${Date.now()}-${i}-${file.name}`,
          previewUrl: URL.createObjectURL(file),
        }));
        onChange([...list, ...added]);
      };
      return (
        <div className="sf-images">
          <input
            className={`sf-input ${err ? "is-error" : ""}`}
            type="file" multiple accept={f.accept ?? "image/*"}
            disabled={disabled} onBlur={onBlur}
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              if (files.length) addFiles(files);
              e.target.value = "";
            }}
          />
          {list.length === 0
            ? <div className="sf-images-empty">Nuotraukų nėra</div>
            : (
              <div className="sf-images-grid">
                {list.map((img, idx) => (
                  <div key={img.type === "existing" ? `ex-${img.id}` : img.tempKey} className="sf-img-card">
                    <div className="sf-img-top">
                      <div className="sf-img-index">{idx + 1}</div>
                      {idx === 0 ? <div className="sf-img-badge">Pagrindinė</div> : null}
                    </div>
                    <img
                      className="sf-img-thumb"
                      src={img.type === "existing"
                        ? (img.url?.startsWith("http") ? img.url : `${API_BASE}${img.url}`)
                        : img.previewUrl}
                      alt={`img-${idx}`}
                    />
                    <div className="sf-img-actions">
                      <button type="button" className="sf-btn sf-btn-ghost"
                        onClick={() => move(idx, idx - 1)} disabled={idx === 0}><FaArrowLeft /></button>
                      <button type="button" className="sf-btn sf-btn-ghost"
                        onClick={() => move(idx, idx + 1)} disabled={idx === list.length - 1}><FaArrowRight /></button>
                      <button type="button" className="sf-btn sf-btn-ghost danger"
                        onClick={() => removeAt(idx)}>Ištrinti</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>
      );
    }

    if (f.type === "textarea") {
      return (
        <textarea
          className={`sf-input ${err ? "is-error" : ""}`}
          placeholder={f.placeholder} value={value} disabled={disabled}
          onBlur={onBlur} onChange={(e) => onChange(e.target.value)} rows={4}
        />
      );
    }

    if (f.type === "select") {
      return (
        <select
          className={`sf-input ${err ? "is-error" : ""}`}
          value={value} disabled={disabled} onBlur={onBlur}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">— Pasirinkite —</option>
          {(f.options ?? []).map((opt) => (
            <option key={String(opt.value)} value={opt.value}>{opt.label}</option>
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
          <input type="checkbox" checked={!!value} disabled={disabled}
            onChange={(e) => onChange(e.target.checked)} onBlur={onBlur} />
          <span>{f.help ?? ""}</span>
        </label>
      );
    }

    return (
      <input
        className={`sf-input ${err ? "is-error" : ""}`}
        type={f.type || "text"} placeholder={f.placeholder}
        value={value} disabled={disabled} onBlur={onBlur}
        onChange={(e) => {
          const raw = e.target.value;
          if (f.type === "number") onChange(raw === "" ? "" : Number(raw));
          else onChange(raw);
        }}
      />
    );
  };

  // ── render ──────────────────────────────────────────────────────────────────
  return (
    <form className="sf" onSubmit={handleSubmit}>
      <div className="sf-grid">
        {fields.map((f, idx) => {
          const show = f.visible ? f.visible(values) : true;
          if (!show) return null;

          if (f.type === "section") {
            return (
              <div key={`section-${idx}`} className="sf-block span-2">
                <div className="sf-section-title">{f.title}</div>
                {f.subtitle ? <div className="sf-section-sub">{f.subtitle}</div> : null}
                <div className="sf-divider span-2" />
              </div>
            );
          }

          if (f.type === "spacer") {
            return <div key={`spacer-${idx}`} className={`sf-field ${f.colSpan === 2 ? "span-2" : ""}`} />;
          }

          if (f.type === "array") {
            const arr = Array.isArray(values[f.name]) ? values[f.name] : [];
            const rowFields = f.rowFields ?? [];
            const minRows = f.minRows ?? 0;
            const arrayErr = touched[f.name] ? errors[f.name] : null;
            return (
              <div key={f.name} className="sf-field span-2">
                <label className="sf-label">
                  {f.label}{f.required ? <span className="sf-req">*</span> : null}
                </label>
                {arrayErr ? <div className="sf-error">{arrayErr}</div> : null}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {arr.map((row, rowIdx) => (
                    <div key={`${f.name}-row-${rowIdx}`}
                      style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10, alignItems: "start" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr auto", gap: 10 }}>
                        {rowFields.map((rf) => {
                          if (!(rf.visible ? rf.visible(row, values) : true)) return null;
                          const key = `${f.name}[${rowIdx}].${rf.name}`;
                          const rowErr = touched[key] ? errors[key] : null;
                          const dis = rf.disabled ? rf.disabled(row, values) : false;
                          return (
                            <div key={key}
                              className={`sf-field ${rf.colSpan === 2 ? "span-2" : ""}`}
                              style={rf.colSpan === 2 ? { gridColumn: "span 2" } : undefined}>
                              <label className="sf-label">
                                {rf.label}{rf.required ? <span className="sf-req">*</span> : null}
                              </label>
                              {renderInput(rf, row?.[rf.name] ?? "", rowErr, dis,
                                (val) => setArrayRowField(f.name, rowIdx, rf.name, val),
                                () => setTouched((p) => ({ ...p, [key]: true })))}
                              {rowErr ? <div className="sf-error">{rowErr}</div> : null}
                            </div>
                          );
                        })}
                      </div>
                      <button type="button" className="sf-btn sf-btn-ghost"
                        style={{ height: 42, marginTop: 22 }}
                        onClick={() => removeArrayRow(f.name, rowIdx, minRows)}
                        disabled={arr.length <= minRows}>
                        Šalinti
                      </button>
                    </div>
                  ))}
                  <button type="button" className="sf-btn sf-btn-ghost"
                    onClick={() => addArrayRow(f.name, f.emptyRow ?? {})}>
                    {f.addLabel ?? "+ Pridėti"}
                  </button>
                </div>
              </div>
            );
          }

          // MAP — read-only, full-width, no stored value needed
          if (f.type === "map") {
            const addr = typeof f.getAddress === "function" ? f.getAddress(values) : (f.address ?? "");
            return (
              <div key={`map-${idx}`} className="sf-field span-2">
                {f.label ? <label className="sf-label">{f.label}</label> : null}
                <MapWidget address={addr} />
              </div>
            );
          }

          // PRODUCT-VIEW — full-width, read-only
          if (f.type === "product-view") {
            const items = typeof f.getItems === "function" ? f.getItems(values) : (values[f.name] ?? []);
            return (
              <div key={`pv-${idx}`} className="sf-field span-2">
                {f.label ? <label className="sf-label">{f.label}</label> : null}
                <ProductViewWidget items={items} />
              </div>
            );
          }

          if (!f.name) return null;
          const disabled = f.disabled ? f.disabled(values) : false;
          const value = typeof f.getValue === "function" ? f.getValue(values) : (values[f.name] ?? "");
          const err = touched[f.name] ? errors[f.name] : null;

          return (
            <div key={f.name} className={`sf-field ${f.colSpan === 2 ? "span-2" : ""}`}>
              {f.label ? (
                <label className="sf-label">
                  {f.label}{f.required ? <span className="sf-req">*</span> : null}
                </label>
              ) : null}
              {renderInput(f, value, err, disabled,
                (val) => setField(f.name, val),
                () => markTouched(f.name))}
              {err ? <div className="sf-error">{err}</div> : null}
            </div>
          );
        })}
      </div>

      <div className="sf-actions">
        <button type="button" className="sf-btn sf-btn-ghost" onClick={onCancel}>{cancelLabel}</button>
        <button type="submit" className="sf-btn" disabled={!canSubmit || submitting}>
          {submitting ? "Išsaugoma..." : submitLabel}
        </button>
      </div>
    </form>
  );
}