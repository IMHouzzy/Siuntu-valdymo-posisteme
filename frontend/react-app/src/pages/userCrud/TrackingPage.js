// pages/userCrud/TrackingPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiPackage, FiTruck, FiCheckCircle, FiAlertCircle,
  FiClock, FiMapPin, FiArrowLeft, FiRotateCcw,
  FiBox, FiCalendar,
} from "react-icons/fi";
import "../../styles/TrackingPage.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:5065";

const STATUS_CONFIG = {
  "Sukurta": {
    icon: <FiPackage size={16} />,
    color: "var(--color-secondary)",
    message: () => "Jūsų siuntai buvo sukurti etiketės ir ji paruošta išsiuntimui.",
  },
  "Vežama": {
    icon: <FiTruck size={16} />,
    color: "var(--color-primary)",
    message: (addr) =>
      addr
        ? `Jūsų siunta keliauja į jūsų namus: ${addr}.`
        : "Jūsų siunta šiuo metu yra vežama.",
  },
  "Pristatyta": {
    icon: <FiCheckCircle size={16} />,
    color: "var(--color-accent)",
    message: (addr) =>
      addr ? `Siunta sėkmingai pristatyta į ${addr}.` : "Siunta sėkmingai pristatyta.",
  },
  "Vėluoja": {
    icon: <FiAlertCircle size={16} />,
    color: "var(--color-warning)",
    message: () =>
      "Deja, jūsų siunta vėluoja. Atsiprašome už nepatogumus — ji bus pristatyta kuo greičiau.",
  },
  "Grąžinimas sukurtas": {
    icon: <FiRotateCcw size={16} />,
    color: "var(--color-secondary)",
    message: () => "Grąžinimo procesas pradėtas. Jūsų siunta bus grąžinta siuntėjui.",
  },
  "Grąžinimas vežamas": {
    icon: <FiRotateCcw size={16} />,
    color: "var(--color-warning)",
    message: () => "Jūsų siunta šiuo metu grąžinama siuntėjui.",
  },
  "Grąžinimas pristatytas": {
    icon: <FiCheckCircle size={16} />,
    color: "var(--color-secondary)",
    message: () => "Siunta sėkmingai grąžinta siuntėjui.",
  },
  "Grąžinimas vėluoja": {
    icon: <FiAlertCircle size={16} />,
    color: "var(--color-danger)",
    message: () => "Grąžinimas vėluoja. Mes sprendžiame šią situaciją.",
  },
};

function getStatusConfig(typeName) {
  return STATUS_CONFIG[typeName] ?? {
    icon: <FiClock size={16} />,
    color: "var(--color-text-muted)",
    message: () => "Statusas atnaujintas.",
  };
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleString("lt-LT", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatDateOnly(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("lt-LT");
}

function TRow({ label, value }) {
  return (
    <div className="tp-row">
      <span className="tp-row-label">{label}</span>
      <span className="tp-row-value">{value}</span>
    </div>
  );
}

export default function TrackingPage() {
  const { trackingNumber } = useParams();
  const navigate = useNavigate();

  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/api/tracking/${encodeURIComponent(trackingNumber)}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error(r.status === 404 ? "notfound" : "error");
        return r.json();
      })
      .then((d) => {
        if (d.type === "dpd") {
          window.open(d.dpdUrl, "_blank", "noopener,noreferrer");
          navigate(-1);
          return;
        }
        setData(d);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [trackingNumber]);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="tp-page">
      <div className="tp-state">
        <div className="tp-spinner" />
        <span>Kraunama siunta…</span>
      </div>
    </div>
  );

  // ── Error ────────────────────────────────────────────────────────────────
  if (error || !data) return (
    <div className="tp-page">
      <div className="tp-state tp-state--error">
        <FiAlertCircle size={32} />
        <span>
          {error === "notfound"
            ? "Siunta su šiuo sekimo numeriu nerasta."
            : "Įvyko klaida. Bandykite vėliau."}
        </span>
        <button className="tp-back-btn" onClick={() => navigate("/client")}>
          <FiArrowLeft size={15} /> Grįžti
        </button>
      </div>
    </div>
  );

  const { statuses, shipment, packages, deliveryAddress, order, courierName } = data;
  const latestStatus = statuses?.[0];
  const latestConfig = latestStatus ? getStatusConfig(latestStatus.typeName) : null;

  return (
    <div className="tp-page">

      {/* ── Topbar ───────────────────────────────────────────────────────── */}
      <div className="tp-topbar">
        <button className="tp-back-btn" onClick={() => navigate("/client")}>
          <FiArrowLeft size={15} /> Grįžti
        </button>
      </div>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="tp-header">
        <div className="tp-header-left">
          <div className="tp-label">Sekimo numeris</div>
          <div className="tp-tracking-num">{trackingNumber}</div>
          {courierName && <div className="tp-courier">{courierName}</div>}
        </div>
        {latestStatus && (
          <div
            className="tp-status-badge"
            style={{ "--status-color": latestConfig.color }}
          >
            {latestConfig.icon}
            <span>{latestStatus.typeName}</span>
          </div>
        )}
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="tp-body">

        {/* ── Left — timeline ──────────────────────────────────────────── */}
        <div className="tp-col tp-col--left">
          <div className="tp-card">
            <div className="tp-card-title">
              <FiClock size={14} /> Siuntos istorija
            </div>

            {statuses?.length > 0 ? (
              <div className="tp-timeline">
                {statuses.map((s, i) => {
                  const cfg      = getStatusConfig(s.typeName);
                  const isLatest = i === 0;
                  const msg      = cfg.message(deliveryAddress);

                  return (
                    <div
                      key={s.id_ShipmentStatus}
                      className={`tp-timeline-item${isLatest ? " tp-timeline-item--active" : ""}`}
                    >
                      {/* dot + line */}
                      <div className="tp-timeline-left">
                        <div
                          className="tp-timeline-dot"
                          style={{ "--dot-color": isLatest ? cfg.color : "var(--color-border)" }}
                        >
                          <span style={{ color: isLatest ? cfg.color : "var(--color-text-muted)" }}>
                            {cfg.icon}
                          </span>
                        </div>
                        {i < statuses.length - 1 && <div className="tp-timeline-line" />}
                      </div>

                      {/* content */}
                      <div className="tp-timeline-content">
                        <div
                          className="tp-timeline-status"
                          style={{ color: isLatest ? cfg.color : "var(--color-text-primary)" }}
                        >
                          {s.typeName}
                        </div>
                        <div className="tp-timeline-date">{formatDate(s.date)}</div>
                        <div
                          className={`tp-timeline-msg${isLatest ? " tp-timeline-msg--active" : ""}`}
                          style={isLatest ? { "--msg-color": cfg.color } : {}}
                        >
                          {msg}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="tp-empty">Statuso istorija tuščia.</div>
            )}
          </div>
        </div>

        {/* ── Right — details ──────────────────────────────────────────── */}
        <div className="tp-col tp-col--right">

          {/* Delivery info */}
          <div className="tp-card">
            <div className="tp-card-title">
              <FiTruck size={14} /> Pristatymo informacija
            </div>
            <div className="tp-rows">
              <TRow label="Siuntimo data"       value={formatDateOnly(shipment.shippingDate)} />
              <TRow
                label="Numatoma pristatyti"
                value={shipment.estimatedDeliveryDate
                  ? formatDateOnly(shipment.estimatedDeliveryDate)
                  : "—"}
              />
              {deliveryAddress && (
                <TRow
                  label="Pristatymo adresas"
                  value={
                    <span className="tp-address">
                      <FiMapPin size={12} /> {deliveryAddress}
                    </span>
                  }
                />
              )}
              {shipment.providerLockerId && (
                <TRow label="Paštomatas" value={shipment.providerLockerId} />
              )}
              {shipment.DeliveryLat && shipment.DeliveryLng && (
                <TRow
                  label="Žemėlapis"
                  value={
                    <a
                      className="tp-map-link"
                      href={`https://www.google.com/maps?q=${shipment.DeliveryLat},${shipment.DeliveryLng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FiMapPin size={12} /> Atidaryti žemėlapyje
                    </a>
                  }
                />
              )}
            </div>
          </div>

          {/* Packages */}
          {packages?.length > 0 && (
            <div className="tp-card">
              <div className="tp-card-title">
                <FiBox size={14} /> Pakuotės
              </div>
              <div className="tp-packages">
                {packages.map((p, i) => (
                  <div key={p.id_Package} className="tp-package-row">
                    <div className="tp-package-num">{i + 1}</div>
                    <div className="tp-package-info">
                      <div className="tp-package-tracking">
                        {p.trackingNumber || `Paketas ${i + 1}`}
                      </div>
                      {p.weight != null && (
                        <div className="tp-package-weight">
                          {Number(p.weight).toFixed(2)} kg
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Order summary */}
          {order && (
            <div className="tp-card">
              <div className="tp-card-title">
                <FiCalendar size={14} /> Užsakymo informacija
              </div>
              <div className="tp-rows">
                <TRow label="Užsakymo Nr." value={`#${order.id_Orders}`} />
                <TRow label="Data"         value={formatDateOnly(order.OrdersDate)} />
                <TRow label="Suma"         value={`€${Number(order.totalAmount ?? 0).toFixed(2)}`} />
                <TRow label="Apmokėjimas"  value={order.paymentMethod || "—"} />
                <TRow label="Būsena"       value={order.statusName || "—"} />
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}