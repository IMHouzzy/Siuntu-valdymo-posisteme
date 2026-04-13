// pages/client/ClientOrdersPage.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiPackage, FiChevronDown, FiChevronRight, FiEdit2,
  FiRotateCcw, FiTruck, FiCheckCircle, FiClock,
  FiAlertCircle, FiXCircle, FiArrowLeft, FiBox,
  FiMapPin, FiPhone, FiUser, FiCalendar, FiShoppingBag,
  FiX, FiSave, FiExternalLink, FiFileText,
} from "react-icons/fi";
import ReturnFormModal from "../../components/ReturnFormModal";
import "../../styles/ClientOrdersPage.css";
import { clientApi } from "../../services/api";

const API = process.env.REACT_APP_API_BASE_URL || "http://localhost:5065";

// ── Status helpers ────────────────────────────────────────────────────────────
const ORDER_STATUS = {
  1: { label: "Laukia patvirtinimo", color: "var(--color-warning)", icon: FiClock },
  2: { label: "Atšauktas", color: "var(--color-danger)", icon: FiXCircle },
  3: { label: "Įvykdytas", color: "var(--color-accent)", icon: FiCheckCircle },
  4: { label: "Vykdomas", color: "var(--color-secondary)", icon: FiPackage },
  5: { label: "Išsiųstas", color: "var(--color-primary)", icon: FiTruck },
};

const RETURN_STATUS = {
  1: { label: "Sukurtas", color: "var(--color-secondary)", icon: FiClock },
  2: { label: "Įvykdytas", color: "var(--color-accent)", icon: FiCheckCircle },
  3: { label: "Vertinamas", color: "var(--color-warning)", icon: FiAlertCircle },
  4: { label: "Patvirtintas", color: "var(--color-accent)", icon: FiCheckCircle },
  5: { label: "Atmestas", color: "var(--color-danger)", icon: FiXCircle },
  6: { label: "Etiketės paruoštos", color: "var(--color-primary)", icon: FiFileText },
};

function getOrderStatus(id) {
  return ORDER_STATUS[id] ?? { label: id, color: "var(--color-text-muted)", icon: FiClock };
}
function getReturnStatus(id) {
  return RETURN_STATUS[id] ?? { label: id, color: "var(--color-text-muted)", icon: FiClock };
}

function fmtDate(d) {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date)) return "—";
  return date.toLocaleDateString("lt-LT");
}
function fmtDateTime(d) {
  if (!d) return "—";
  return new Date(d).toLocaleString("lt-LT", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
}
function fmtEur(v) {
  return `€${Number(v ?? 0).toFixed(2)}`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ statusId, type = "order" }) {
  const cfg = type === "return" ? getReturnStatus(statusId) : getOrderStatus(statusId);
  const Icon = cfg.icon;
  return (
    <span className="uh-badge" style={{ "--badge-color": cfg.color }}>
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="uh-info-row">
      <Icon size={13} className="uh-info-icon" />
      <span className="uh-info-label">{label}</span>
      <span className="uh-info-value">{value}</span>
    </div>
  );
}

// ── Edit Contact Modal ────────────────────────────────────────────────────────
function EditContactModal({ order, onClose, onSaved }) {
  const [form, setForm] = useState({
    DeliveryAddress: order.snapshotDeliveryAddress || "",
    City: order.snapshotCity || "",
    Country: order.snapshotCountry || "",
    Phone: order.snapshotPhone || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      await clientApi.updateContact(order.id_Orders, form);
      onSaved(); onClose();
    } catch {
      setError("Serverio klaida.");
    } finally {
      setSaving(false);
    }
  };

  const field = (key, label, placeholder) => (
    <div className="uh-form-field">
      <label className="uh-form-label">{label}</label>
      <input
        className="uh-form-input"
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <div className="uh-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="uh-modal">
        <div className="uh-modal-header">
          <span className="uh-modal-title"><FiEdit2 size={15} /> Redaguoti kontaktus</span>
          <button className="uh-modal-close" onClick={onClose}><FiX size={16} /></button>
        </div>
        <div className="uh-modal-body">
          <p className="uh-modal-note">
            Galite keisti pristatymo adresą ir kontaktinius duomenis.
          </p>
          {field("DeliveryAddress", "Pristatymo adresas", "Gatvė, namas, butas")}
          {field("City", "Miestas", "Miestas")}
          {field("Country", "Šalis", "Lietuva")}
          {field("Phone", "Telefono numeris", "+370...")}
          {error && <div className="uh-form-error">{error}</div>}
        </div>
        <div className="uh-modal-footer">
          <button className="uh-btn uh-btn--ghost" onClick={onClose} disabled={saving}>Atšaukti</button>
          <button className="uh-btn uh-btn--primary" onClick={save} disabled={saving}>
            {saving ? <span className="uh-spinner-sm" /> : <><FiSave size={13} /> Išsaugoti</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Order Detail Panel ────────────────────────────────────────────────────────
function OrderDetail({ orderId, onReturnCreated }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editContact, setEditContact] = useState(false);
  const [showReturn, setShowReturn] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setData(await clientApi.getOrderDetail(orderId)); }
    finally { setLoading(false); }
  }, [orderId]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="uh-detail-loading"><span className="uh-spinner" /></div>;
  if (!data) return <div className="uh-detail-empty">Nepavyko įkelti užsakymo.</div>;

  const {
    id_Orders, OrdersDate, totalAmount, deliveryPrice, paymentMethod,
    status, statusName, snapshotDeliveryAddress, snapshotCity, snapshotCountry, snapshotPhone,
    products, shipment, existingReturn, canReturn, hasLabels,
  } = data;

  return (
    <div className="uh-detail">

      {/* ── Order date & status ──────────────────────────────── */}
      <div className="uh-detail-section">
        <div className="uh-detail-section-header">
          <FiCalendar size={13} /> Užsakymo informacija
        </div>
        <div className="uh-info-rows">
          <InfoRow icon={FiCalendar} label="Data" value={fmtDate(data.ordersDate)} />
          <InfoRow icon={FiPackage} label="Statusas" value={statusName} />
          {paymentMethod && (
            <InfoRow icon={FiShoppingBag} label="Apmokėjimas" value={paymentMethod} />
          )}
        </div>
      </div>

      {/* ── Contact / delivery address ───────────────────────── */}
      <div className="uh-detail-section">
        <div className="uh-detail-section-header">
          <FiUser size={13} /> Pristatymo duomenys
          {!hasLabels ? (
            <button className="uh-btn-icon" onClick={() => setEditContact(true)} title="Redaguoti">
              <FiEdit2 size={13} />
            </button>
          ) : (
            <span className="uh-locked-hint">
              <FiAlertCircle size={11} /> Etiketės sukurtos – redagavimas užblokuotas
            </span>
          )}
        </div>
        <div className="uh-info-rows">
          <InfoRow
            icon={FiMapPin}
            label="Adresas"
            value={
              [snapshotDeliveryAddress, snapshotCity, snapshotCountry]
                .filter(Boolean).join(", ") || "—"
            }
          />
          <InfoRow icon={FiPhone} label="Telefonas" value={snapshotPhone} />
        </div>
      </div>

      {/* ── Products ─────────────────────────────────────────── */}
      <div className="uh-detail-section">
        <div className="uh-detail-section-header"><FiBox size={13} /> Produktai</div>
        <div className="uh-products-list">
          {products.map(op => (
            <div key={op.id_OrdersProduct} className="uh-product-row">
              {op.product.imageUrl
                ? <img src={`${API}${op.product.imageUrl}`} alt={op.product.name} className="uh-product-img" />
                : <div className="uh-product-img uh-product-img--placeholder"><FiBox size={16} /></div>
              }
              <div className="uh-product-info">
                <div className="uh-product-name">{op.product.name}</div>
                <div className="uh-product-meta">
                  {op.quantity} {op.product.unit} × {fmtEur(op.unitPrice)}
                  {!op.product.canReturn && (
                    <span className="uh-no-return-tag">Negrąžintinas</span>
                  )}
                </div>
              </div>
              <div className="uh-product-total">{fmtEur(op.quantity * op.unitPrice)}</div>
            </div>
          ))}
        </div>
        <div className="uh-detail-totals">
          <span>Pristatymas: {fmtEur(deliveryPrice)}</span>
          <strong>Iš viso: {fmtEur(totalAmount)}</strong>
        </div>
      </div>

      {/* ── Shipment ─────────────────────────────────────────── */}
      {shipment && (
        <div className="uh-detail-section">
          <div className="uh-detail-section-header"><FiTruck size={13} /> Siunta</div>
          <div className="uh-info-rows">
            <InfoRow icon={FiCalendar} label="Išsiųsta" value={fmtDate(shipment.shippingDate)} />
            <InfoRow icon={FiCalendar} label="Numatoma" value={fmtDate(shipment.estimatedDeliveryDate)} />
            <InfoRow icon={FiTruck} label="Kurjeris" value={shipment.courierName} />
            <InfoRow icon={FiMapPin} label="Paštomatas" value={shipment.providerLockerId} />
          </div>
          {shipment.latestStatus && (
            <div className="uh-shipment-status">
              <FiClock size={12} />
              {shipment.latestStatus.typeName} · {fmtDateTime(shipment.latestStatus.date)}
            </div>
          )}
          {shipment.packages?.length > 0 && (
            <div className="uh-packages">
              {shipment.packages.map((p, i) => (
                <div key={p.id_Package} className="uh-package-chip">
                  <FiPackage size={11} />
                  <span>{p.trackingNumber || `Paketas ${i + 1}`}</span>
                  {p.labelFile && (
                    <a href={`${API}${p.labelFile}`} target="_blank" rel="noopener noreferrer" className="uh-label-link">
                      <FiFileText size={11} /> Etiketė
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
          {shipment.packages?.[0]?.trackingNumber && (
            <a
              href={`/client/track/${encodeURIComponent(shipment.packages[0].trackingNumber)}`}
              className="uh-track-link"
            >
              <FiExternalLink size={12} /> Sekti siuntą
            </a>
          )}
        </div>
      )}

      {/* ── Return section ────────────────────────────────────── */}
      <div className="uh-detail-section">
        <div className="uh-detail-section-header">
          <FiRotateCcw size={13} /> Grąžinimas
        </div>

        {existingReturn ? (
          /* Show the single existing return status */
          <div className="uh-return-chip">
            {(() => {
              const cfg = getReturnStatus(existingReturn.fk_ReturnStatusTypeid_ReturnStatusType);
              const Icon = cfg.icon;
              return (
                <>
                  <Icon size={12} style={{ color: cfg.color }} />
                  <span>#{existingReturn.id_Returns}</span>
                  <StatusBadge statusId={existingReturn.fk_ReturnStatusTypeid_ReturnStatusType} type="return" />
                  <span className="uh-return-chip-date">{fmtDate(existingReturn.date)}</span>
                </>
              );
            })()}
          </div>
        ) : canReturn ? (
          /* No return yet and order qualifies — show the button */
          <button
            className="uh-btn uh-btn--outline uh-btn--sm"
            onClick={() => setShowReturn(true)}
          >
            <FiRotateCcw size={13} /> Pateikti grąžinimą
          </button>
        ) : (
          /* Order status doesn't qualify (e.g. still in progress / cancelled) */
          <p className="uh-detail-empty-text">Grąžinimas negalimas šiam užsakymui.</p>
        )}
      </div>

      {/* ── Modals ───────────────────────────────────────────── */}
      {editContact && (
        <EditContactModal
          order={data}
          onClose={() => setEditContact(false)}
          onSaved={load}
        />
      )}
      {showReturn && (
        <ReturnFormModal
          order={data}
          onClose={() => setShowReturn(false)}
          onCreated={async () => {
            await load();
            onReturnCreated?.();
          }}
        />
      )}
    </div>
  );
}

// ── Order Card ────────────────────────────────────────────────────────────────
function OrderCard({ order, onReturnCreated }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`uh-order-card${expanded ? " uh-order-card--open" : ""}`}>
      <button className="uh-order-card-header" onClick={() => setExpanded(e => !e)}>
        <div className="uh-order-card-left">
          <div className="uh-order-id">
            <FiShoppingBag size={13} />
            Užsakymas #{order.id_Orders}
          </div>
          <div className="uh-order-meta">
            <span><FiCalendar size={11} /> {fmtDate(order.ordersDate)}</span>
            <span>{order.itemCount} prек.</span>
            <span>{fmtEur(order.totalAmount)}</span>
            {order.hasLabels && (
              <span className="uh-label-dot"><FiFileText size={11} /> Etiketės</span>
            )}
            {order.hasReturn && (
              <span className="uh-return-dot"><FiRotateCcw size={11} /> Grąžinimas</span>
            )}
          </div>
        </div>
        <div className="uh-order-card-right">
          <StatusBadge statusId={order.status} />
          {expanded ? <FiChevronDown size={15} /> : <FiChevronRight size={15} />}
        </div>
      </button>

      {expanded && (
        <div className="uh-order-card-body">
          <OrderDetail orderId={order.id_Orders} onReturnCreated={onReturnCreated} />
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ClientOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("orders");
  const [returns, setReturns] = useState([]);
  const [loadingReturns, setLoadingReturns] = useState(false);
  const navigate = useNavigate();

  const loadOrders = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      setOrders(await clientApi.getOrders());
    } catch (e) {
      setError(e.message === "HTTP 401" ? "Prisijunkite iš naujo." : "Klaida įkeliant užsakymus.");
    } finally { setLoading(false); }
  }, []);

  const loadReturns = useCallback(async () => {
    setLoadingReturns(true);
    try { setReturns(await clientApi.getReturns()); }
    catch { /* silent */ }
    finally { setLoadingReturns(false); }
  }, []);

  useEffect(() => { loadOrders(); }, [loadOrders]);
  useEffect(() => {
    if (activeTab === "returns") loadReturns();
  }, [activeTab, loadReturns]);

  return (
    <div className="uh-page">

      {/* Header */}
      <div className="uh-page-header">
        <button className="uh-back-btn" onClick={() => navigate(-1)}>
          <FiArrowLeft size={14} />
        </button>
        <div className="uh-page-title-wrap">
          <h1 className="uh-page-title">Mano užsakymai</h1>
          <p className="uh-page-sub">Peržiūrėkite užsakymų istoriją ir valdykite grąžinimus</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="uh-tabs">
        <button
          className={`uh-tab${activeTab === "orders" ? " uh-tab--active" : ""}`}
          onClick={() => setActiveTab("orders")}
        >
          <FiShoppingBag size={14} /> Užsakymai
          {orders.length > 0 && <span className="co-tab-count">{orders.length}</span>}
        </button>
        <button
          className={`uh-tab${activeTab === "returns" ? " uh-tab--active" : ""}`}
          onClick={() => setActiveTab("returns")}
        >
          <FiRotateCcw size={14} /> Grąžinimai
          {returns.length > 0 && <span className="uh-tab-count">{returns.length}</span>}
        </button>
      </div>

      {/* Content */}
      <div className="uh-content">
        {activeTab === "orders" && (
          <>
            {loading && (
              <div className="uh-state">
                <span className="uh-spinner" />
                <span>Kraunami užsakymai…</span>
              </div>
            )}
            {!loading && error && (
              <div className="uh-state uh-state--error">
                <FiAlertCircle size={28} />
                <span>{error}</span>
              </div>
            )}
            {!loading && !error && orders.length === 0 && (
              <div className="uh-state uh-state--empty">
                <FiShoppingBag size={36} />
                <span>Jūs dar neturite užsakymų.</span>
              </div>
            )}
            {!loading && !error && orders.length > 0 && (
              <div className="uh-orders-list">
                {orders.map(o => (
                  <OrderCard key={o.id_Orders} order={o} onReturnCreated={loadOrders} />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "returns" && (
          <>
            {loadingReturns && (
              <div className="uh-state">
                <span className="uh-spinner" />
                <span>Kraunami grąžinimai…</span>
              </div>
            )}
            {!loadingReturns && returns.length === 0 && (
              <div className="uh-state uh-state--empty">
                <FiRotateCcw size={36} />
                <span>Grąžinimų nėra.</span>
              </div>
            )}
            {!loadingReturns && returns.length > 0 && (
              <div className="uh-returns-all">
                {returns.map(r => (
                  <div key={r.id_Returns} className="uh-return-card">
                    <div className="uh-return-card-header">
                      <span className="uh-return-card-id">
                        <FiRotateCcw size={13} /> Grąžinimas #{r.id_Returns}
                      </span>
                      <StatusBadge statusId={r.fk_ReturnStatusTypeid_ReturnStatusType} type="return" />
                    </div>
                    <div className="uh-return-card-meta">
                      <span><FiCalendar size={11} /> {fmtDate(r.date)}</span>
                      {r.orderId && <span>Užsakymas #{r.orderId}</span>}
                      <span>{r.itemCount} prек.</span>
                      <span className="uh-return-method-tag">{r.returnMethod}</span>
                    </div>
                    {r.clientNote && (
                      <p className="uh-return-card-note">"{r.clientNote}"</p>
                    )}
                    {r.employeeNote && (
                      <div className="uh-employee-note">
                        <FiUser size={11} /> <strong>Darbuotojo komentaras:</strong> {r.employeeNote}
                      </div>
                    )}
                    {r.returnShipment?.packages?.length > 0 && (
                      <div className="uh-return-labels">
                        <span className="uh-return-labels-title">
                          <FiFileText size={11} /> Grąžinimo etiketės:
                        </span>
                        {r.returnShipment.packages.map((p, i) =>
                          p.labelFile ? (
                            <a
                              key={p.id_Package}
                              href={`${API}${p.labelFile}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="uh-label-btn"
                            >
                              <FiFileText size={11} /> Paketas {i + 1}
                            </a>
                          ) : null
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}