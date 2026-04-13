import { useState, useEffect, useMemo, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  FiX, FiRotateCcw, FiChevronRight, FiChevronLeft,
  FiCheck, FiAlertCircle, FiTruck, FiPackage,
  FiMapPin, FiMinus, FiPlus, FiBox, FiUpload, FiTrash2, FiImage,
} from "react-icons/fi";
import "../styles/ReturnFormModal.css";
import { lockerApi, companiesApi, clientReturnsApi } from "../services/api";
const ASSET_BASE = process.env.REACT_APP_API_BASE_URL

const RETURN_REASONS = [
  { id: 1, label: "Pažeistas" },
  { id: 2, label: "Neatitinka aprašymo" },
  { id: 3, label: "Netinkamas dydis" },
  { id: 4, label: "Apsigalvojau" },
  { id: 5, label: "Bloga kokybė" },
  { id: 6, label: "Neveikia" },
];


// ── Leaflet helper (same as SmartForm) ───────────────────────────────────────
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
    link.id = "leaflet-css"; link.rel = "stylesheet";
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
  } catch { return null; }
}

// ── Simple address map (read-only, shows pin) ────────────────────────────────
function AddressMapWidget({ address }) {
  const mapElRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setStatus("loading");
      try {
        const L = await getLeaflet();
        if (cancelled || !mapElRef.current) return;
        if (!mapRef.current) {
          const map = L.map(mapElRef.current, {
            center: [54.9, 23.9], zoom: 7,
            zoomControl: true, dragging: true,
            scrollWheelZoom: false, doubleClickZoom: false,
          });
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap", maxZoom: 19,
          }).addTo(map);
          mapRef.current = map;
        }
        if (!address) { setStatus("notfound"); return; }
        const coords = await geocodeAddress(address);
        if (cancelled) return;
        if (!coords) { setStatus("notfound"); return; }
        if (markerRef.current) markerRef.current.setLatLng([coords.lat, coords.lng]);
        else markerRef.current = _L.marker([coords.lat, coords.lng]).addTo(mapRef.current);
        mapRef.current.setView([coords.lat, coords.lng], 14);
        setStatus("ready");
      } catch { if (!cancelled) setStatus("error"); }
    })();
    return () => { cancelled = true; };
  }, [address]);

  return (
    <div className="rfm-map-wrap">
      <div ref={mapElRef} className="rfm-map" />
      {status === "loading" && (
        <div className="rfm-map-overlay"><div className="rfm-map-spinner" /><span>Ieškoma adreso…</span></div>
      )}
      <div className="rfm-map-hint">
        {status === "notfound" && "⚠️ Adresas nerastas žemėlapyje"}
        {status === "error" && "⚠️ Nepavyko užkrauti žemėlapio"}
        {status === "ready" && `📍 ${address}`}
      </div>
    </div>
  );
}

// ── Locker map (shows selected locker pin) ────────────────────────────────────
function LockerMapWidget({ locker }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;
    (async () => {
      const L = await getLeaflet();
      if (cancelled || !containerRef.current) return;
      if (!mapRef.current) {
        mapRef.current = L.map(containerRef.current, {
          zoomControl: true, dragging: true,
          scrollWheelZoom: false, doubleClickZoom: false,
        });
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap", maxZoom: 19,
        }).addTo(mapRef.current);
        mapRef.current.setView([55.1694, 23.8813], 7);
      }
      if (locker?.lat && locker?.lng) {
        const latlng = [locker.lat, locker.lng];
        if (!markerRef.current) markerRef.current = L.marker(latlng).addTo(mapRef.current);
        else markerRef.current.setLatLng(latlng);
        markerRef.current.bindPopup(`<strong>${locker.name}</strong><br/>${locker.street}, ${locker.city}`);
        mapRef.current.setView(latlng, 15);
      }
    })();
    return () => { cancelled = true; };
  }, [locker]);

  return <div ref={containerRef} className="rfm-map rfm-map--locker" />;
}

// ── Overlay root for portal ───────────────────────────────────────────────────
function getOverlayRoot() {
  let el = document.getElementById("rfm-overlay-root");
  if (!el) {
    el = document.createElement("div");
    el.id = "rfm-overlay-root";
    el.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:99999;overflow:visible;";
    document.body.appendChild(el);
  }
  return el;
}

// ── Locker portal panel ───────────────────────────────────────────────────────
function LockerPortalPanel({ triggerRef, children, onClose }) {
  const [rect, setRect] = useState(null);

  useLayoutEffect(() => {
    if (!triggerRef.current) return;
    const update = () => setRect(triggerRef.current.getBoundingClientRect());
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [triggerRef]);

  useEffect(() => {
    const handler = (e) => {
      if (triggerRef.current?.contains(e.target)) return;
      if (document.getElementById("rfm-locker-portal")?.contains(e.target)) return;
      onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose, triggerRef]);

  if (!rect) return null;

  return createPortal(
    <div id="rfm-locker-portal" className="rfm-locker-panel" style={{
      position: "absolute",
      top: rect.bottom + 4,
      left: rect.left,
      width: Math.max(rect.width, 380),
      pointerEvents: "auto",
    }}>
      {children}
    </div>,
    getOverlayRoot()
  );
}

// ── Locker picker widget ──────────────────────────────────────────────────────
function LockerPickerWidget({ companyId, courierType, value, onChange }) {
  const [lockers, setLockers] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const triggerRef = useRef(null);

  const selected = useMemo(() => {
    if (!value) return null;
    return lockers.find((l) => String(l.id) === String(value.lockerId)) || value;
  }, [lockers, value]);

  useEffect(() => {
    if (!companyId || !courierType) return;
    setLoading(true); setError(null);
    lockerApi.getLockers(companyId, courierType)
      .then(setLockers)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [companyId, courierType]);

  const filtered = lockers.filter((l) => {
    const term = search.toLowerCase();
    return !term || [l.name, l.street, l.city, l.postalCode].some((v) => v?.toLowerCase().includes(term));
  });

  const select = (locker) => {
    setSearch(""); setOpen(false);
    onChange?.({ ...locker, lockerId: locker.id, lat: Number(locker.lat), lng: Number(locker.lng) });
  };

  if (loading) return <div className="rfm-locker-state"><div className="rfm-map-spinner" /><span>Kraunami paštomatai…</span></div>;
  if (error) return <div className="rfm-locker-state rfm-locker-state--error">⚠ {error}</div>;

  return (
    <div className="rfm-locker-wrap">
      <button ref={triggerRef} type="button"
        className={`rfm-locker-trigger${open ? " is-open" : ""}${selected ? " has-value" : ""}`}
        onClick={() => { setOpen((o) => !o); if (!open) setSearch(""); }}>
        {selected ? (
          <span className="rfm-locker-trigger-value">
            <span className="rfm-locker-trigger-name">{selected.name}</span>
            <span className="rfm-locker-trigger-addr">{[selected.street, selected.city].filter(Boolean).join(", ")}</span>
          </span>
        ) : <span className="rfm-locker-trigger-placeholder">— Pasirinkite paštomatą —</span>}
        <span className="rfm-locker-chevron">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <LockerPortalPanel triggerRef={triggerRef} onClose={() => setOpen(false)}>
          <div className="rfm-locker-search-wrap">
            <input autoFocus className="rfm-locker-search" placeholder="Ieškoti pagal miestą ar adresą…"
              value={search} onChange={(e) => setSearch(e.target.value)} />
            {search && <button className="rfm-locker-clear" type="button" onClick={() => setSearch("")}>✕</button>}
          </div>
          <div className="rfm-locker-options">
            {filtered.length === 0
              ? <div className="rfm-locker-empty">Nerasta paštomatų</div>
              : filtered.map((l) => (
                <div key={l.id}
                  className={`rfm-locker-option${selected?.id === l.id ? " is-selected" : ""}`}
                  onMouseDown={(e) => { e.preventDefault(); select(l); }}>
                  <div className="rfm-locker-option-row">
                    <span className="rfm-locker-option-name">{l.name}</span>
                    <span className="rfm-locker-option-badge">{l.lockerType === "PickupStation" ? "Paštomatas" : "Siuntų taškas"}</span>
                  </div>
                  <div className="rfm-locker-option-addr">{[l.street, l.city, l.postalCode].filter(Boolean).join(", ")}</div>
                </div>
              ))}
          </div>
          <div className="rfm-locker-footer">{filtered.length} iš {lockers.length} taškų</div>
        </LockerPortalPanel>
      )}

      <div className="rfm-locker-map-wrap">
        <LockerMapWidget locker={value} />
        {value && (
          <div className="rfm-locker-caption">
            📍 <strong>{value.name}</strong>{" — "}
            {[value.street, value.city, value.postalCode].filter(Boolean).join(", ")}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Step indicator ────────────────────────────────────────────────────────────
function StepBar({ step }) {
  const steps = ["Prekės", "Grąžinimo būdas", "Patvirtinimas"];
  return (
    <div className="rfm-steps">
      {steps.map((s, i) => (
        <div key={i} className={`rfm-step ${step > i ? "rfm-step--done" : ""} ${step === i ? "rfm-step--active" : ""}`}>
          <div className="rfm-step-dot">{step > i ? <FiCheck size={11} /> : i + 1}</div>
          <span className="rfm-step-label">{s}</span>
          {i < steps.length - 1 && <div className="rfm-step-line" />}
        </div>
      ))}
    </div>
  );
}

// ── Step 1: Item selection + image upload per item ────────────────────────────
function StepItems({ order, selections, setSelections }) {
  const returnableProducts = order.products.filter(op => op.product.canReturn);

  if (returnableProducts.length === 0) {
    return (
      <div className="rfm-empty">
        <FiAlertCircle size={24} />
        <p>Šiame užsakyme nėra grąžinamų prekių.</p>
      </div>
    );
  }

  const toggle = (opId) => {
    setSelections(prev => {
      const existing = prev.find(s => s.OrdersProductId === opId);
      if (existing) return prev.filter(s => s.OrdersProductId !== opId);
      const op = order.products.find(p => p.id_OrdersProduct === opId);
      return [...prev, { OrdersProductId: opId, Quantity: 1, ReasonId: null, maxQty: op.quantity, images: [] }];
    });
  };

  const setQty = (opId, delta) => {
    setSelections(prev => prev.map(s => {
      if (s.OrdersProductId !== opId) return s;
      const newQty = Math.min(s.maxQty, Math.max(1, s.Quantity + delta));
      return { ...s, Quantity: newQty };
    }));
  };

  const setReason = (opId, reasonId) => {
    setSelections(prev => prev.map(s =>
      s.OrdersProductId === opId ? { ...s, ReasonId: Number(reasonId) } : s
    ));
  };

  const addImages = (opId, files) => {
    setSelections(prev => prev.map(s => {
      if (s.OrdersProductId !== opId) return s;
      const newImgs = Array.from(files).map(f => ({
        file: f,
        preview: URL.createObjectURL(f),
        key: `${Date.now()}-${f.name}`,
      }));
      return { ...s, images: [...(s.images || []), ...newImgs] };
    }));
  };

  const removeImage = (opId, key) => {
    setSelections(prev => prev.map(s => {
      if (s.OrdersProductId !== opId) return s;
      return { ...s, images: (s.images || []).filter(img => img.key !== key) };
    }));
  };

  return (
    <div className="rfm-items">
      <p className="rfm-hint">Pasirinkite prekes ir įkelkite nuotraukas darbuotojo peržiūrai:</p>
      {returnableProducts.map(op => {
        const sel = selections.find(s => s.OrdersProductId === op.id_OrdersProduct);
        const checked = !!sel;
        return (
          <div key={op.id_OrdersProduct} className={`rfm-item${checked ? " rfm-item--selected" : ""}`}>
            {/* Header row — clickable to toggle */}
            <div className="rfm-item-header" onClick={() => toggle(op.id_OrdersProduct)}>
              <div className="rfm-item-check">{checked ? <FiCheck size={12} /> : null}</div>
              {op.product.imageUrl
                ? <img src={`${ASSET_BASE}${op.product.imageUrl}`} className="rfm-item-img" alt={op.product.name} />
                : <div className="rfm-item-img rfm-item-img--ph"><FiBox size={16} /></div>
              }
              <div className="rfm-item-info">
                <div className="rfm-item-name">{op.product.name}</div>
                <div className="rfm-item-sub">
                  Užsakyta: {op.quantity} {op.product.unit} · €{Number(op.unitPrice).toFixed(2)}/vnt.
                </div>
              </div>
            </div>

            {/* Controls when selected */}
            {checked && (
              <div className="rfm-item-controls" onClick={e => e.stopPropagation()}>
                {/* Qty + reason */}
                <div className="rfm-item-ctrl-row">
                  <div className="rfm-qty-ctrl">
                    <button className="rfm-qty-btn" onClick={() => setQty(op.id_OrdersProduct, -1)}><FiMinus size={11} /></button>
                    <span className="rfm-qty-val">{sel.Quantity}</span>
                    <button className="rfm-qty-btn" onClick={() => setQty(op.id_OrdersProduct, 1)}><FiPlus size={11} /></button>
                  </div>
                  <select
                    className="rfm-reason-sel"
                    value={sel.ReasonId || ""}
                    onChange={e => setReason(op.id_OrdersProduct, e.target.value)}
                  >
                    <option value="">Priežastis...</option>
                    {RETURN_REASONS.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                  </select>
                </div>

                {/* Image upload */}
                <div className="rfm-img-upload-section">
                  <div className="rfm-img-upload-label">
                    <FiImage size={13} /> Prekės nuotraukos (darbuotojui peržiūrėti)
                  </div>
                  <label className="rfm-img-upload-btn">
                    <FiUpload size={13} /> Įkelti nuotraukas
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={e => addImages(op.id_OrdersProduct, e.target.files)}
                    />
                  </label>
                  {sel.images?.length > 0 && (
                    <div className="rfm-img-preview-grid">
                      {sel.images.map(img => (
                        <div key={img.key} className="rfm-img-preview-item">
                          <img src={img.preview} alt="preview" className="rfm-img-preview-thumb" />
                          <button
                            type="button"
                            className="rfm-img-preview-remove"
                            onClick={() => removeImage(op.id_OrdersProduct, img.key)}
                          >
                            <FiTrash2 size={11} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Step 2: courier selection + locker/address + note ─────────────────────────
function StepMethod({
  couriers, loadingCouriers,
  selectedCourier, setSelectedCourier,
  lockerValue, setLockerValue,
  address, setAddress,
  note, setNote,
  companyId,
}) {
  const needsLocker = selectedCourier?.supportsLockers;
  const isCustom = !selectedCourier || selectedCourier.type === "CUSTOM";

  // When courier changes, clear locker selection
  const prevCourierRef = useRef(null);
  useEffect(() => {
    if (prevCourierRef.current !== selectedCourier?.id) {
      setLockerValue(null);
      prevCourierRef.current = selectedCourier?.id;
    }
  }, [selectedCourier, setLockerValue]);

  const addressStr = [address.street, address.city, address.country].filter(Boolean).join(", ");

  return (
    <div className="rfm-method-step">
      <p className="rfm-hint">Pasirinkite grąžinimo būdą:</p>

      {loadingCouriers ? (
        <div className="rfm-locker-state"><div className="rfm-map-spinner" /><span>Kraunami kurjeriai…</span></div>
      ) : (
        <div className="rfm-methods">
          {couriers.map(c => {
            const id = c.id ?? c.id_Courier;
            const active = selectedCourier && (selectedCourier.id ?? selectedCourier.id_Courier) === id;
            const Icon = c.supportsLockers ? FiPackage : FiTruck;
            return (
              <button
                key={id}
                type="button"
                className={`rfm-method-card${active ? " rfm-method-card--active" : ""}`}
                onClick={() => setSelectedCourier(c)}
              >
                <div className="rfm-method-icon"><Icon size={18} /></div>
                <div className="rfm-method-info">
                  <div className="rfm-method-name">{c.name}</div>
                  <div className="rfm-method-desc">
                    {c.supportsLockers
                      ? "Pristatykite į paštomatą"
                      : c.type === "CUSTOM"
                        ? "Kurjeris atvyks pas jus"
                        : "Pristatymas į namus"}
                    {c.deliveryPrice != null && ` · €${Number(c.deliveryPrice).toFixed(2)}`}
                  </div>
                </div>
                {active && <FiCheck size={14} className="rfm-method-check" />}
              </button>
            );
          })}
        </div>
      )}

      {/* Locker picker for parcel-machine couriers */}
      {selectedCourier && needsLocker && (
        <div className="rfm-delivery-section">
          <p className="rfm-hint rfm-hint--sm"><FiMapPin size={12} /> Pasirinkite paštomatą:</p>
          <LockerPickerWidget
            companyId={companyId}
            courierType={selectedCourier.type}
            value={lockerValue}
            onChange={setLockerValue}
          />
        </div>
      )}

      {/* Address fields + map for home-delivery and custom couriers */}
      {selectedCourier && !needsLocker && (
        <div className="rfm-delivery-section">
          <p className="rfm-hint rfm-hint--sm">
            <FiMapPin size={12} />
            {isCustom ? " Paėmimo adresas (iš kur kurjeris paims):" : " Pristatymo adresas:"}
          </p>
          <div className="rfm-addr-grid">
            <div className="rfm-form-field">
              <label>Gatvė</label>
              <input value={address.street} onChange={e => setAddress(a => ({ ...a, street: e.target.value }))} placeholder="Gatvė, namas" />
            </div>
            <div className="rfm-form-field">
              <label>Miestas</label>
              <input value={address.city} onChange={e => setAddress(a => ({ ...a, city: e.target.value }))} placeholder="Miestas" />
            </div>
            <div className="rfm-form-field">
              <label>Pašto kodas</label>
              <input value={address.postalCode} onChange={e => setAddress(a => ({ ...a, postalCode: e.target.value }))} placeholder="LT-00000" />
            </div>
            <div className="rfm-form-field">
              <label>Šalis</label>
              <input value={address.country} onChange={e => setAddress(a => ({ ...a, country: e.target.value }))} placeholder="Lietuva" />
            </div>
          </div>

          {/* Map showing the address */}
          {addressStr && <AddressMapWidget address={addressStr} />}
        </div>
      )}

      {/* Note */}
      {selectedCourier && (
        <div className="rfm-form-field rfm-mt">
          <label>Jūsų pastaba (neprivaloma)</label>
          <textarea
            className="rfm-textarea"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Aprašykite grąžinimo priežastį, pakuotės būklę..."
            rows={3}
          />
        </div>
      )}
    </div>
  );
}

// ── Step 3: Confirmation ──────────────────────────────────────────────────────
function StepConfirm({ order, selections, selectedCourier, lockerValue, address, note }) {
  const addrStr = lockerValue
    ? `${lockerValue.name} — ${[lockerValue.street, lockerValue.city].filter(Boolean).join(", ")}`
    : [address.street, address.city, address.postalCode, address.country].filter(Boolean).join(", ");

  const totalImages = selections.reduce((s, sel) => s + (sel.images?.length || 0), 0);

  return (
    <div className="rfm-confirm">
      <div className="rfm-confirm-icon"><FiRotateCcw size={22} /></div>
      <p className="rfm-confirm-title">Patvirtinkite grąžinimą</p>

      <div className="rfm-confirm-section">
        <div className="rfm-confirm-label">Grąžinamos prekės</div>
        {selections.map(s => {
          const op = order.products.find(p => p.id_OrdersProduct === s.OrdersProductId);
          const reason = RETURN_REASONS.find(r => r.id === s.ReasonId);
          return (
            <div key={s.OrdersProductId} className="rfm-confirm-item">
              <span>{op?.product.name}</span>
              <span>{s.Quantity} vnt.</span>
              {reason && <span className="rfm-confirm-reason">{reason.label}</span>}
              {s.images?.length > 0 && (
                <span className="rfm-confirm-imgs">📷 {s.images.length} nuotr.</span>
              )}
            </div>
          );
        })}
        {totalImages > 0 && (
          <div className="rfm-confirm-img-note">
            <FiImage size={11} /> Iš viso {totalImages} nuotraukos bus pateiktos darbuotojui
          </div>
        )}
      </div>

      {selectedCourier && (
        <div className="rfm-confirm-section">
          <div className="rfm-confirm-label">Grąžinimo būdas</div>
          <div className="rfm-confirm-value">{selectedCourier.name}</div>
        </div>
      )}

      {addrStr && (
        <div className="rfm-confirm-section">
          <div className="rfm-confirm-label"><FiMapPin size={11} /> {lockerValue ? "Paštomatas" : "Grąžinimo adresas"}</div>
          <div className="rfm-confirm-value">{addrStr}</div>
        </div>
      )}

      {note && (
        <div className="rfm-confirm-section">
          <div className="rfm-confirm-label">Jūsų pastaba</div>
          <div className="rfm-confirm-value rfm-confirm-value--note">"{note}"</div>
        </div>
      )}

      <div className="rfm-confirm-notice">
        <FiAlertCircle size={13} />
        Grąžinimas bus peržiūrėtas darbuotojo. Etiketės bus sugeneruotos tik po patvirtinimo.
        Jei grąžinimas bus atmestas — jis bus atšauktas.
      </div>
    </div>
  );
}

// ── Main Modal ────────────────────────────────────────────────────────────────
export default function ReturnFormModal({ order, onClose, onCreated }) {
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState([]);

  // Courier state
  const [couriers, setCouriers] = useState([]);
  const [loadingCouriers, setLoadingCouriers] = useState(true);
  const [selectedCourier, setSelectedCourier] = useState(null);

  // Delivery state
  const [lockerValue, setLockerValue] = useState(null);
  const [address, setAddress] = useState({
    street: order.snapshotDeliveryAddress || "",
    city: order.snapshotCity || "",
    postalCode: "",
    country: order.snapshotCountry || "Lietuva",
  });
  const [note, setNote] = useState("");

  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [done, setDone] = useState(false);

  // ── Load company couriers (same endpoint as shipment form) ─────────────────
  // We get companyId from the order itself
  const companyId = order.companyId ?? order.fk_Companyid_Company;

  useEffect(() => {
    if (!companyId) return;
    setLoadingCouriers(true);
    companiesApi.getCouriers(companyId)
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        setCouriers(list);
        if (list.length > 0) setSelectedCourier(list[0]);
      })
      .catch(() => setCouriers([]))
      .finally(() => setLoadingCouriers(false));
  }, [companyId]);

  // ── Validation ─────────────────────────────────────────────────────────────
  const canNext = () => {
    if (step === 0) return selections.length > 0;
    if (step === 1) {
      if (!selectedCourier) return false;
      if (selectedCourier.supportsLockers) return !!lockerValue;
      // For home/custom: require at least street + city
      return !!(address.street?.trim() && address.city?.trim());
    }
    return true;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  // Upload images to a temp endpoint, then create the return
  const submit = async () => {
    setSubmitting(true);
    setSubmitError("");
    try {
      // 1. Upload images for each item that has them
      const itemsWithImageUrls = await Promise.all(
        selections.map(async s => {
          let imageUrls = [];
          if (s.images?.length > 0) {
            const form = new FormData();
            s.images.forEach(img => form.append("files", img.file));
            try {
              const data = await clientReturnsApi.uploadImages(form);
              imageUrls = data.urls ?? [];
            } catch {
              // Continue without images on upload failure
            }
          }
          return {
            OrdersProductId: s.OrdersProductId,
            Quantity: s.Quantity,
            ReasonId: s.ReasonId || null,
            ImageUrls: imageUrls,
          };
        })
      );

      // 2. Determine return method string from selected courier
      let returnMethod = "CUSTOM";
      if (selectedCourier) {
        const t = selectedCourier.type ?? "";
        if (t.startsWith("DPD")) returnMethod = "DPD";
        else if (t.startsWith("LP_EXPRESS")) returnMethod = "LP_EXPRESS";
        else if (t.startsWith("OMNIVA")) returnMethod = "OMNIVA";
        else returnMethod = "CUSTOM";
      }

      // 3. Build body
      const body = {
        Items: itemsWithImageUrls,
        ReturnMethod: returnMethod,
        CourierId: selectedCourier ? (selectedCourier.id ?? selectedCourier.id_Courier) : null,
        LockerId: lockerValue?.lockerId ?? null,
        ClientNote: note || null,
        ReturnStreet: lockerValue ? null : (address.street || null),
        ReturnCity: lockerValue ? lockerValue.city : (address.city || null),
        ReturnPostalCode: lockerValue ? lockerValue.postalCode : (address.postalCode || null),
        ReturnCountry: address.country || "LT",
        ReturnLockerId: lockerValue?.lockerId ?? null,
        ReturnLockerName: lockerValue?.name ?? null,
        ReturnLockerAddress: lockerValue
          ? [lockerValue.street, lockerValue.city].filter(Boolean).join(", ")
          : null,
        ReturnLat: lockerValue?.lat ?? null,
        ReturnLng: lockerValue?.lng ?? null,
      };

      const r = await clientReturnsApi.create(order.id_Orders, body);

     setDone(true);
        onCreated?.();
    } catch {
      setSubmitError("Serverio klaida.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success screen ─────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="rfm-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="rfm-modal rfm-modal--sm">
          <div className="rfm-success">
            <div className="rfm-success-icon"><FiCheck size={28} /></div>
            <div className="rfm-success-title">Grąžinimas pateiktas!</div>
            <p className="rfm-success-desc">
              Jūsų grąžinimas peržiūrimas. Gavę patvirtinimą, gausite grąžinimo etiketes.
            </p>
            <button className="rfm-btn rfm-btn--primary" onClick={onClose}>Uždaryti</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rfm-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="rfm-modal">
        {/* Header */}
        <div className="rfm-header">
          <span className="rfm-title"><FiRotateCcw size={15} /> Pateikti grąžinimą</span>
          <button className="rfm-close" onClick={onClose}><FiX size={16} /></button>
        </div>

        {/* Step bar */}
        <div className="rfm-stepbar-wrap"><StepBar step={step} /></div>

        {/* Body */}
        <div className="rfm-body">
          {step === 0 && (
            <StepItems order={order} selections={selections} setSelections={setSelections} />
          )}
          {step === 1 && (
            <StepMethod
              couriers={couriers}
              loadingCouriers={loadingCouriers}
              selectedCourier={selectedCourier}
              setSelectedCourier={setSelectedCourier}
              lockerValue={lockerValue}
              setLockerValue={setLockerValue}
              address={address}
              setAddress={setAddress}
              note={note}
              setNote={setNote}
              companyId={companyId}
            />
          )}
          {step === 2 && (
            <StepConfirm
              order={order}
              selections={selections}
              selectedCourier={selectedCourier}
              lockerValue={lockerValue}
              address={address}
              note={note}
            />
          )}
        </div>

        {/* Error */}
        {submitError && (
          <div className="rfm-submit-error"><FiAlertCircle size={13} /> {submitError}</div>
        )}

        {/* Footer */}
        <div className="rfm-footer">
          {step > 0 && (
            <button className="rfm-btn rfm-btn--ghost" onClick={() => setStep(s => s - 1)} disabled={submitting}>
              <FiChevronLeft size={13} /> Atgal
            </button>
          )}
          <div style={{ flex: 1 }} />
          {step < 2 ? (
            <button className="rfm-btn rfm-btn--primary" onClick={() => setStep(s => s + 1)} disabled={!canNext()}>
              Toliau <FiChevronRight size={13} />
            </button>
          ) : (
            <button className="rfm-btn rfm-btn--primary" onClick={submit} disabled={submitting}>
              {submitting ? <span className="rfm-spinner" /> : <><FiCheck size={13} /> Pateikti grąžinimą</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}