import { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import StatusBadge from "../../components/StatusBadge";
import "../../styles/CourierPages.css";
import { courierApi } from "../../services/api";
import {
  FiArrowLeft, FiUser, FiMapPin, FiPhone, FiMail,
  FiPackage, FiTruck, FiClock, FiCalendar, FiHash,
  FiDownload, FiCheckCircle, FiAlertCircle, FiEdit3,
  FiX, FiSave, FiNavigation, FiTag, FiBox,
} from "react-icons/fi";

const ASSET_BASE = process.env.REACT_APP_API_URL?.replace(/\/api$/, "") ?? "http://localhost:5065";

const DONE_STATUSES = ["Pristatyta", "Grąžinimas pristatytas"];

const ALLOWED_NEXT = {
  "Sukurta": ["Vežama", "Vėluoja"],
  "Vežama": ["Vežama", "Vėluoja", "Pristatyta"],
  "Vėluoja": ["Vežama", "Pristatyta"],
  "Grąžinimas sukurtas": ["Grąžinimas vežamas", "Grąžinimas vėluoja"],
  "Grąžinimas vežamas": ["Grąžinimas vežamas", "Grąžinimas vėluoja", "Grąžinimas pristatytas"],
  "Grąžinimas vėluoja": ["Grąžinimas vežamas", "Grąžinimas pristatytas"],
};

const SIGNATURE_STATUSES = ["Pristatyta", "Grąžinimas pristatytas"];

export default function CourierShipmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [shipment, setShipment] = useState(null);
  const [statusTypes, setStatusTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState(null);

  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const [hasSig, setHasSig] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      courierApi.getShipment(id),
      courierApi.getStatusTypes(),
    ])
      .then(([s, types]) => { setShipment(s); setStatusTypes(types); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const allowedStatusTypes = useMemo(() => {
    if (!statusTypes.length || !shipment) return [];
    const currentName = shipment.statuses?.[0]?.typeName ?? "Sukurta";
    return statusTypes.filter(t => (ALLOWED_NEXT[currentName] ?? []).includes(t.name));
  }, [statusTypes, shipment]);

  useEffect(() => {
    if (selectedStatus && !allowedStatusTypes.find(t => t.id_ShipmentStatusType === selectedStatus))
      setSelectedStatus(null);
  }, [allowedStatusTypes, selectedStatus]);

  // ── Signature helpers ──────────────────────────────────────────────────────
  function getPos(e, canvas) {
    const rect = canvas.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - rect.left) * (canvas.width / rect.width),
      y: (src.clientY - rect.top) * (canvas.height / rect.height),
    };
  }
  function startDraw(e) {
    e.preventDefault();
    const c = canvasRef.current; if (!c) return;
    isDrawing.current = true;
    const ctx = c.getContext("2d");
    const pos = getPos(e, c);
    ctx.beginPath(); ctx.moveTo(pos.x, pos.y);
  }
  function draw(e) {
    e.preventDefault();
    if (!isDrawing.current) return;
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d");
    const pos = getPos(e, c);
    ctx.lineWidth = 2.5; ctx.lineCap = "round"; ctx.strokeStyle = "#0b1220";
    ctx.lineTo(pos.x, pos.y); ctx.stroke();
    setHasSig(true);
  }
  function stopDraw() { isDrawing.current = false; }
  function clearSig() {
    const c = canvasRef.current; if (!c) return;
    c.getContext("2d").clearRect(0, 0, c.width, c.height);
    setHasSig(false);
  }

  async function handleSave() {
    if (!selectedStatus) return;
    const selectedType = statusTypes.find(t => t.id_ShipmentStatusType === selectedStatus);
    if (SIGNATURE_STATUSES.includes(selectedType?.name) && !hasSig) {
      setSaveResult({ ok: false, msg: "Pristatymo parašas privalomas." });
      return;
    }
    setSaving(true); setSaveResult(null);
    const signatureDataUrl = (hasSig && canvasRef.current)
      ? canvasRef.current.toDataURL("image/png")
      : null;
    try {
      // req() throws on error — result is already parsed
      const r = await courierApi.updateStatus(id, {
        StatusTypeId: selectedStatus,
        SignatureDataUrl: signatureDataUrl,
      });
      setSaveResult({ ok: true, msg: `Būsena atnaujinta: ${r.newStatusName}` });
      setShipment(await courierApi.getShipment(id));
      setSelectedStatus(null); setHasSig(false); clearSig();
    } catch (e) {
      setSaveResult({ ok: false, msg: e.message });
    } finally { setSaving(false); }
  }

  function fmtDate(d) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("lt-LT", {
      year: "numeric", month: "2-digit", day: "2-digit",
    });
  }
  function fmtDateTime(d) {
    if (!d) return "—";
    return new Date(d).toLocaleString("lt-LT", {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit",
    });
  }

  const latestStatusName = shipment?.statuses?.[0]?.typeName ?? null;
  const isDone = DONE_STATUSES.includes(latestStatusName);
  const selectedTypeObj = statusTypes.find(t => t.id_ShipmentStatusType === selectedStatus);
  const needsSignature = SIGNATURE_STATUSES.includes(selectedTypeObj?.name);

  if (loading) return (
    <div className="cr-page cr-page--detail">
      <div className="cr-empty"><div className="cr-spinner" /><span>Kraunama…</span></div>
    </div>
  );
  if (error || !shipment) return (
    <div className="cr-page cr-page--detail">
      <div className="cr-empty cr-empty--error">
        <FiAlertCircle size={44} /><span>{error ?? "Siunta nerasta"}</span>
      </div>
    </div>
  );

  const refLabel = shipment.providerParcelNumber
    ? shipment.providerParcelNumber.split(",")[0].trim()
    : `#${shipment.id_Shipment}`;

  // ── Delivery address resolution ────────────────────────────────────────────
  // CourierShipmentController returns clientCompany (from client_companies).
  // The order snapshot data isn't available here — but the courier sees the
  // address from client_companies which is still the client's profile/billing address.
  // For locker deliveries providerLockerId is set instead.
  const isLockerDelivery = !!shipment.providerLockerId;
  const hasHomeAddress = !isLockerDelivery && (
    shipment.clientCompany?.deliveryAddress ||
    shipment.clientCompany?.city ||
    shipment.clientCompany?.country
  );

  return (
    <div className="cr-page cr-page--detail">
      <div className="cr-topbar">
        <button className="cr-back-btn" onClick={() => navigate(-1)}>
          <FiArrowLeft size={18} />
        </button>
        <div className="cr-topbar-info">
          <div className="cr-topbar-title">
            {shipment.client?.name} {shipment.client?.surname}
          </div>
          <div className="cr-topbar-sub">{refLabel}</div>
        </div>
        {latestStatusName && <StatusBadge status={latestStatusName} />}
      </div>

      <div className="cr-detail-grid">

        {/* ── Client info ────────────────────────────────────────────── */}
        <div className="cr-section">
          <div className="cr-section-header">
            <FiUser size={14} /><span className="cr-section-title">Klientas</span>
          </div>
          <div className="cr-info-list">
            <div className="cr-info-row">
              <span className="cr-info-label"><FiUser size={12} />Vardas</span>
              <span className="cr-info-value">{shipment.client?.name} {shipment.client?.surname}</span>
            </div>
            {shipment.client?.phone && (
              <div className="cr-info-row">
                <span className="cr-info-label"><FiPhone size={12} />Telefonas</span>
                <a href={`tel:${shipment.client.phone}`} className="cr-info-value cr-info-value--link">
                  {shipment.client.phone}
                </a>
              </div>
            )}
            {shipment.client?.email && (
              <div className="cr-info-row">
                <span className="cr-info-label"><FiMail size={12} />El. paštas</span>
                <a href={`mailto:${shipment.client.email}`} className="cr-info-value cr-info-value--link">
                  {shipment.client.email}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* ── Delivery address ────────────────────────────────────────── */}
        <div className="cr-section">
          <div className="cr-section-header">
            <FiMapPin size={14} />
            <span className="cr-section-title">
              {isLockerDelivery ? "Pristatymas į paštomatą" : (shipment.isReturn ? "Paėmimo adresas" : "Pristatymo adresas")}
            </span>
          </div>
          <div className="cr-info-list">
            {isLockerDelivery ? (
              // Locker delivery — show locker ID
              <div className="cr-info-row">
                <span className="cr-info-label"><FiBox size={12} />Paštomatas</span>
                <span className="cr-info-value cr-info-value--mono">{shipment.providerLockerId}</span>
              </div>
            ) : hasHomeAddress ? (
              // Home delivery — show address from client_companies
              <>
                {shipment.clientCompany?.deliveryAddress && (
                  <div className="cr-info-row">
                    <span className="cr-info-label"><FiMapPin size={12} />Adresas</span>
                    <span className="cr-info-value">{shipment.clientCompany.deliveryAddress}</span>
                  </div>
                )}
                {shipment.clientCompany?.city && (
                  <div className="cr-info-row">
                    <span className="cr-info-label"><FiNavigation size={12} />Miestas</span>
                    <span className="cr-info-value">{shipment.clientCompany.city}</span>
                  </div>
                )}
                {shipment.clientCompany?.country && (
                  <div className="cr-info-row">
                    <span className="cr-info-label"><FiNavigation size={12} />Šalis</span>
                    <span className="cr-info-value">{shipment.clientCompany.country}</span>
                  </div>
                )}
              </>
            ) : (
              <div className="cr-info-row">
                <span className="cr-info-value" style={{ color: "var(--color-text-muted)" }}>
                  Adresas nenurodytas
                </span>
              </div>
            )}
            {/* GPS coordinates always shown if available */}
            {shipment.DeliveryLat && shipment.DeliveryLng && (
              <div className="cr-info-row">
                <span className="cr-info-label"><FiNavigation size={12} />GPS</span>
                <a
                  href={`https://maps.google.com/?q=${shipment.DeliveryLat},${shipment.DeliveryLng}`}
                  target="_blank" rel="noreferrer"
                  className="cr-info-value cr-info-value--link"
                >
                  Atidaryti žemėlapyje
                </a>
              </div>
            )}
          </div>
        </div>

        {/* ── Shipment info ───────────────────────────────────────────── */}
        <div className="cr-section cr-section--wide">
          <div className="cr-section-header">
            <FiTruck size={14} /><span className="cr-section-title">
              {shipment.isReturn ? "Grąžinimo informacija" : "Siuntos informacija"}
            </span>
          </div>
          <div className="cr-info-list">
            <div className="cr-info-row">
              <span className="cr-info-label"><FiHash size={12} />Siuntos ID</span>
              <span className="cr-info-value cr-info-value--mono">#{shipment.id_Shipment}</span>
            </div>
            <div className="cr-info-row">
              <span className="cr-info-label"><FiHash size={12} />Užsakymas</span>
              <span className="cr-info-value cr-info-value--mono">#{shipment.orderId}</span>
            </div>
            {shipment.trackingNumber && (
              <div className="cr-info-row">
                <span className="cr-info-label"><FiTag size={12} />Sekimo nr.</span>
                <span className="cr-info-value cr-info-value--mono">{shipment.trackingNumber}</span>
              </div>
            )}
            {shipment.providerParcelNumber && (
              <div className="cr-info-row">
                <span className="cr-info-label"><FiTag size={12} />Tiekėjo nr.</span>
                <span className="cr-info-value cr-info-value--mono">{shipment.providerParcelNumber}</span>
              </div>
            )}
            {shipment.providerLockerId && (
              <div className="cr-info-row">
                <span className="cr-info-label"><FiBox size={12} />Pašto dėž.</span>
                <span className="cr-info-value cr-info-value--mono">{shipment.providerLockerId}</span>
              </div>
            )}
            {shipment.courierName && (
              <div className="cr-info-row">
                <span className="cr-info-label"><FiTruck size={12} />Kurjeris</span>
                <span className="cr-info-value">
                  {shipment.courierName}
                  {shipment.courierType ? ` (${shipment.courierType})` : ""}
                </span>
              </div>
            )}
            <div className="cr-info-row">
              <span className="cr-info-label"><FiCalendar size={12} />Siuntimo data</span>
              <span className="cr-info-value">{fmtDate(shipment.shippingDate)}</span>
            </div>
            <div className="cr-info-row">
              <span className="cr-info-label"><FiCalendar size={12} />Pristatyti iki</span>
              <span className="cr-info-value">{fmtDate(shipment.estimatedDeliveryDate)}</span>
            </div>
          </div>
        </div>

        {/* ── Packages ─────────────────────────────────────────────────── */}
        <div className="cr-section cr-section--wide">
          <div className="cr-section-header">
            <FiPackage size={14} />
            <span className="cr-section-title">Pakuotės ({shipment.packages?.length ?? 0})</span>
          </div>
          {!shipment.packages?.length ? (
            <div style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
              Pakuočių nėra
            </div>
          ) : (
            <div className="cr-packages">
              {shipment.packages.map((pkg, i) => (
                <div key={pkg.id_Package} className="cr-package-row">
                  <div className="cr-package-icon"><FiPackage size={16} /></div>
                  <div className="cr-package-info">
                    <div className="cr-package-num">Pakuotė #{i + 1}</div>
                    <div
                      className="cr-package-tracking"
                      style={!pkg.trackingNumber ? { opacity: 0.4 } : {}}
                    >
                      {pkg.trackingNumber || "Sekimo nr. nėra"}
                    </div>
                  </div>
                  {pkg.weight != null && (
                    <span className="cr-package-weight">{pkg.weight} kg</span>
                  )}
                  {pkg.labelFile && (
                    <a
                      href={`${ASSET_BASE}${pkg.labelFile}`}
                      target="_blank" rel="noreferrer"
                      className="cr-label-btn"
                      onClick={e => e.stopPropagation()}
                    >
                      <FiDownload size={12} /> Etiketė
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Status history ───────────────────────────────────────────── */}
        <div className="cr-section cr-section--wide">
          <div className="cr-section-header">
            <FiClock size={14} /><span className="cr-section-title">Būsenų istorija</span>
          </div>
          {!shipment.statuses?.length ? (
            <div style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
              Būsenų nėra
            </div>
          ) : (
            <div className="cr-timeline">
              {shipment.statuses.map((st, i) => (
                <div
                  key={st.id_ShipmentStatus}
                  className={`cr-timeline-row ${i === 0 ? "is-latest" : ""}`}
                >
                  <div className="cr-timeline-dot" />
                  <div className="cr-timeline-body">
                    <div className="cr-timeline-name">{st.typeName}</div>
                    <div className="cr-timeline-date">{fmtDateTime(st.date)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Update status ────────────────────────────────────────────── */}
        {isDone ? (
          <div className="cr-section cr-section--wide">
            <div className="cr-final-badge"><FiCheckCircle size={18} /> {shipment.isReturn ? "Grąžinimas pristatytas" : "Siunta pristatyta"}</div>
          </div>
        ) : allowedStatusTypes.length === 0 ? (
          <div className="cr-section cr-section--wide">
            <div className="cr-alert cr-alert--error">
              <FiAlertCircle size={15} /> Šiai būsenai nėra galimų perėjimų.
            </div>
          </div>
        ) : (
          <div className="cr-section cr-section--wide cr-section--action">
            <div className="cr-section-header">
              <FiEdit3 size={14} /><span className="cr-section-title">Atnaujinti būseną</span>
            </div>
            {saveResult && (
              <div className={`cr-alert ${saveResult.ok ? "cr-alert--success" : "cr-alert--error"}`}>
                {saveResult.ok ? <FiCheckCircle size={15} /> : <FiAlertCircle size={15} />}
                {saveResult.msg}
              </div>
            )}
            <div className="cr-status-options">
              {allowedStatusTypes.map(t => {
                const requiresSig = SIGNATURE_STATUSES.includes(t.name);
                return (
                  <button
                    key={t.id_ShipmentStatusType}
                    className={`cr-status-option ${selectedStatus === t.id_ShipmentStatusType ? "is-selected" : ""}`}
                    onClick={() => {
                      setSelectedStatus(t.id_ShipmentStatusType);
                      setSaveResult(null);
                      if (!requiresSig) clearSig();
                    }}
                  >
                    {t.name}
                    {requiresSig && <span className="cr-sig-badge">Parašas</span>}
                  </button>
                );
              })}
            </div>
            {needsSignature && (
              <div className="cr-sig-wrap">
                <div className="cr-sig-header">
                  <span className="cr-sig-label">Gavėjo parašas</span>
                  <button className="cr-sig-clear" onClick={clearSig}>
                    <FiX size={13} /> Išvalyti
                  </button>
                </div>
                <div className="cr-sig-canvas-wrap">
                  <canvas
                    ref={canvasRef}
                    className={`cr-sig-canvas ${hasSig ? "has-sig" : ""}`}
                    width={640} height={160}
                    onMouseDown={startDraw} onMouseMove={draw}
                    onMouseUp={stopDraw} onMouseLeave={stopDraw}
                    onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
                  />
                  {!hasSig && <div className="cr-sig-placeholder">Pasirašykite čia</div>}
                </div>
                <div className="cr-sig-hint">
                  <FiAlertCircle size={13} /> Parašas privalomas pristatymui patvirtinti
                </div>
              </div>
            )}
            <button
              className="cr-save-btn"
              disabled={!selectedStatus || saving}
              onClick={handleSave}
            >
              {saving
                ? <><div className="cr-spinner cr-spinner--sm" /> Saugoma…</>
                : <><FiSave size={16} /> Išsaugoti būseną</>
              }
            </button>
          </div>
        )}
      </div>
    </div>
  );
}