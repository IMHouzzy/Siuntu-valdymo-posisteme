// pages/Courier/CourierShipmentsList.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../services/AuthContext";
import StatusBadge from "../../components/StatusBadge";
import "../../styles/CourierPages.css";
import {
  FiPackage,
  FiMapPin,
  FiPhone,
  FiChevronRight,
  FiSearch,
  FiTruck,
  FiCalendar,
} from "react-icons/fi";

const API = import.meta.env.VITE_API_URL || "http://localhost:5065";

const STATUS_ORDER = {
  "Sukurta": 0,
  "Vežama": 1,
  "Vėluoja": 2,
  "Pristatyta": 3,
  "Grąžinimas sukurtas": 4,
  "Grąžinimas vežamas": 5,
  "Grąžinimas vėluoja": 6,
  "Grąžinimas pristatytas": 7,
};

const DONE_STATUSES = ["Pristatyta", "Grąžinimas pristatytas"];

export default function CourierShipmentsList() {
  const navigate = useNavigate();
  const { token, activeCompanyId } = useAuth();

  const [shipments, setShipments] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [q, setQ]                 = useState("");
  const [filterStatus, setFilterStatus] = useState("active");

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    fetch(`${API}/api/courier/shipments`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setShipments)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token, activeCompanyId]);

  const statusFilters = useMemo(() => {
    const active = shipments.filter(
      (s) => !DONE_STATUSES.includes(s.latestStatus?.typeName)
    ).length;
    const done = shipments.length - active;
    return [
      { label: "Aktyvios",    value: "active", count: active },
      { label: "Pristatytos", value: "done",   count: done },
      { label: "Visos",       value: "all",    count: shipments.length },
    ];
  }, [shipments]);

  const filtered = useMemo(() => {
    let list = shipments;

    if (filterStatus === "active")
      list = list.filter((s) => !DONE_STATUSES.includes(s.latestStatus?.typeName));
    else if (filterStatus === "done")
      list = list.filter((s) => DONE_STATUSES.includes(s.latestStatus?.typeName));

    const term = q.trim().toLowerCase();
    if (term)
      list = list.filter((s) =>
        [
          s.clientName,
          s.clientSurname,
          s.clientPhone,
          s.deliveryAddress,
          s.providerParcelNumber,
          s.trackingNumber,
          String(s.orderId),
        ].some((v) => String(v ?? "").toLowerCase().includes(term))
      );

    return list.sort((a, b) => {
      const sa = STATUS_ORDER[a.latestStatus?.typeName] ?? 99;
      const sb = STATUS_ORDER[b.latestStatus?.typeName] ?? 99;
      if (sa !== sb) return sa - sb;
      return b.id_Shipment - a.id_Shipment;
    });
  }, [shipments, q, filterStatus]);

  return (
    <div className="cr-page">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="cr-page-header">
        <div className="cr-page-title">
          <FiTruck size={22} />
          <span>Mano siuntos</span>
        </div>
        <div className="cr-page-meta">{filtered.length} / {shipments.length}</div>
      </div>

      {/* ── Filter tabs ───────────────────────────────────────── */}
      <div className="cr-tabs">
        {statusFilters.map((f) => (
          <button
            key={f.value}
            className={`cr-tab ${filterStatus === f.value ? "is-active" : ""}`}
            onClick={() => setFilterStatus(f.value)}
          >
            {f.label}
            <span className="cr-tab-count">{f.count}</span>
          </button>
        ))}
      </div>

      {/* ── Search ────────────────────────────────────────────── */}
      <div className="cr-search-wrap">
        <FiSearch size={15} className="cr-search-icon" />
        <input
          className="cr-search"
          placeholder="Ieškoti pagal klientą, adresą, sekimo nr…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {/* ── Content ───────────────────────────────────────────── */}
      {loading ? (
        <div className="cr-empty">
          <div className="cr-spinner" />
          <span>Kraunama…</span>
        </div>
      ) : error ? (
        <div className="cr-empty cr-empty--error">
          <FiPackage size={40} />
          <span>Klaida: {error}</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="cr-empty">
          <FiPackage size={44} />
          <span>Siuntų nerasta</span>
        </div>
      ) : (
        <div className="cr-list">
          {filtered.map((s) => {
            const statusName = s.latestStatus?.typeName ?? "Sukurta";
            const isDone     = DONE_STATUSES.includes(statusName);
            const ref        = s.providerParcelNumber
              ? s.providerParcelNumber.split(",")[0].trim()
              : `#${s.id_Shipment}`;

            return (
              <button
                key={s.id_Shipment}
                className={`cr-card ${isDone ? "cr-card--done" : ""}`}
                onClick={() => navigate(`/courier/shipments/${s.id_Shipment}`)}
              >
                <div className="cr-card-top">
                  <div className="cr-card-client">
                    {s.clientName} {s.clientSurname}
                  </div>
                  <span className="cr-card-ref">{ref}</span>
                </div>

                <div className="cr-card-details">
                  <StatusBadge status={statusName} />
                  {s.deliveryAddress && (
                    <span className="cr-card-detail">
                      <FiMapPin size={12} /> {s.deliveryAddress}
                    </span>
                  )}
                  {s.clientPhone && (
                    <span className="cr-card-detail">
                      <FiPhone size={12} /> {s.clientPhone}
                    </span>
                  )}
                  {s.packages?.length > 0 && (
                    <span className="cr-card-detail">
                      <FiPackage size={12} /> {s.packages.length} pakuot{s.packages.length === 1 ? "ė" : "ės"}
                    </span>
                  )}
                </div>

                <div className="cr-card-footer">
                  <span>Užsakymas #{s.orderId}</span>
                  {s.shippingDate && (
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <FiCalendar size={11} />
                      {new Date(s.shippingDate).toLocaleDateString("lt-LT")}
                    </span>
                  )}
                  <span className="cr-card-footer-spacer" />
                  <FiChevronRight size={15} className="cr-card-arrow" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}