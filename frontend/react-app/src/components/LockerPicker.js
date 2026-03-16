// components/LockerPicker/LockerPicker.jsx
// Dropdown rendered via React portal so it always floats on top of the form,
// regardless of ancestor overflow/position/z-index.

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "../styles/LockerPicker.css";

const API = "http://localhost:5065";
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

// ── Leaflet lazy loader ───────────────────────────────────────────────────────
let _L = null;
async function getLeaflet() {
  if (_L) return _L;
  const mod = await import("leaflet");
  _L = mod.default ?? mod;
  delete _L.Icon.Default.prototype._getIconUrl;
  _L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
  if (!document.getElementById("leaflet-css")) {
    const link = document.createElement("link");
    link.id = "leaflet-css"; link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
  }
  return _L;
}

// ── Single-pin map ────────────────────────────────────────────────────────────
function LockerMap({ locker }) {
  const containerRef = useRef(null);
  const mapRef       = useRef(null);
  const markerRef    = useRef(null);

  useEffect(() => {
    if (!locker || !containerRef.current) return;
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
      }

      const latlng = [locker.lat, locker.lng];

      if (markerRef.current) {
        markerRef.current.setLatLng(latlng);
      } else {
        markerRef.current = L.marker(latlng)
          .addTo(mapRef.current)
          .bindPopup(
            `<strong>${locker.name}</strong><br/>${locker.street}, ${locker.city}`,
            { closeButton: false }
          );
      }

      mapRef.current.setView(latlng, 15);
      markerRef.current.openPopup();
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locker?.id]);

  // Invalidate size after mount/update so tiles load correctly
  useEffect(() => {
    const t = setTimeout(() => mapRef.current?.invalidateSize(), 80);
    return () => clearTimeout(t);
  });

  return <div ref={containerRef} className="lp-map" />;
}

// ── Portal dropdown panel ─────────────────────────────────────────────────────
// Measures the trigger button position and renders the panel at exactly that
// position in the document body, bypassing all ancestor clipping.
function PortalPanel({ triggerRef, children, onClose }) {
  const [style, setStyle] = useState({});

  // Position the panel beneath the trigger button
  useLayoutEffect(() => {
    if (!triggerRef.current) return;

    const update = () => {
      const rect = triggerRef.current.getBoundingClientRect();
      setStyle({
        position: "fixed",
        top:      rect.bottom + 4,
        left:     rect.left,
        width:    rect.width,
        zIndex:   9999,
      });
    };

    update();
    window.addEventListener("scroll",  update, true);
    window.addEventListener("resize",  update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [triggerRef]);

  // Close when clicking outside the panel
  useEffect(() => {
    const handler = (e) => {
      if (triggerRef.current?.contains(e.target)) return;
      const panel = document.getElementById("lp-portal-panel");
      if (panel && panel.contains(e.target)) return;
      onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose, triggerRef]);

  return createPortal(
    <div id="lp-portal-panel" className="lp-panel" style={style}>
      {children}
    </div>,
    document.body
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function LockerPicker({ companyId, courierType, onChange }) {
  const [lockers,  setLockers]  = useState([]);
  const [selected, setSelected] = useState(null);
  const [search,   setSearch]   = useState("");
  const [open,     setOpen]     = useState(false);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const triggerRef = useRef(null);

  // ── Fetch locker list ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!companyId || !courierType) return;
    setLoading(true);
    setError(null);
    setSelected(null);

    fetch(
      `${API}/api/companies/${companyId}/courier-provider/${courierType}/lockers`,
      { headers: auth() }
    )
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(setLockers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [companyId, courierType]);

  const filtered = lockers.filter((l) => {
    const term = search.toLowerCase();
    return !term || [l.name, l.street, l.city, l.postalCode]
      .some((v) => v?.toLowerCase().includes(term));
  });

  const select = (locker) => {
    setSelected(locker);
    setSearch("");
    setOpen(false);
    onChange?.({ lat: locker.lat, lng: locker.lng, lockerId: locker.id, lockerName: locker.name });
  };

  // ── Loading / error ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="lp-state">
        <div className="lp-spinner" />
        <span>Kraunami paštomatai…</span>
      </div>
    );
  }

  if (error) {
    return <div className="lp-state lp-state--error">⚠ {error}</div>;
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="lp-wrap">

      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        className={`lp-trigger${open ? " is-open" : ""}${selected ? " has-value" : ""}`}
        onClick={() => { setOpen((o) => !o); if (!open) setSearch(""); }}
      >
        {selected ? (
          <span className="lp-trigger-value">
            <span className="lp-trigger-name">{selected.name}</span>
            <span className="lp-trigger-addr">
              {[selected.street, selected.city].filter(Boolean).join(", ")}
            </span>
          </span>
        ) : (
          <span className="lp-trigger-placeholder">— Pasirinkite paštomatą —</span>
        )}
        <span className="lp-trigger-chevron">{open ? "▲" : "▼"}</span>
      </button>

      {/* Portal panel — renders in <body>, always on top */}
      {open && (
        <PortalPanel triggerRef={triggerRef} onClose={() => setOpen(false)}>
          <div className="lp-search-wrap">
            <input
              autoFocus
              className="lp-search"
              placeholder="Ieškoti pagal miestą ar adresą…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="lp-clear" type="button" onClick={() => setSearch("")}>✕</button>
            )}
          </div>

          <div className="lp-options">
            {filtered.length === 0 ? (
              <div className="lp-empty">Nerasta paštomatų</div>
            ) : (
              filtered.map((l) => (
                <div
                  key={l.id}
                  className={`lp-option${selected?.id === l.id ? " is-selected" : ""}`}
                  onMouseDown={(e) => { e.preventDefault(); select(l); }}
                >
                  <div className="lp-option-row">
                    <span className="lp-option-name">{l.name}</span>
                    <span className="lp-option-badge">
                      {l.lockerType === "PickupStation" ? "Paštomatas" : "Siuntų taškas"}
                    </span>
                  </div>
                  <div className="lp-option-addr">
                    {[l.street, l.city, l.postalCode].filter(Boolean).join(", ")}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="lp-panel-footer">
            {filtered.length} iš {lockers.length} taškų
          </div>
        </PortalPanel>
      )}

      {/* Map — shown after selection, in normal flow below the trigger */}
      {selected && (
        <div className="lp-map-wrap">
          <LockerMap locker={selected} />
          <div className="lp-map-caption">
            📍 <strong>{selected.name}</strong>
            {" — "}{[selected.street, selected.city, selected.postalCode].filter(Boolean).join(", ")}
          </div>
        </div>
      )}

    </div>
  );
}