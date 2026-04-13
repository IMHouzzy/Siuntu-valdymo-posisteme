// pages/Orders/OrderDetailPage.jsx

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../services/AuthContext";
import { ordersApi } from "../../services/api";
import StatusBadge from "../../components/StatusBadge";
import NoImage from "../../images/no-camera.png";
import {
    FiArrowLeft, FiEdit, FiTruck, FiPackage,
    FiUser, FiMapPin, FiDownload,
    FiShoppingCart,
} from "react-icons/fi";
import "../../styles/OrderDetail.css";

const API = process.env.REACT_APP_API_BASE_URL || "http://localhost:5065";


export default function OrderDetailPage() {
    const { orderId } = useParams();
    const navigate = useNavigate();


    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        ordersApi.getOneFull(orderId)
            .then(setOrder)
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, [orderId]);

    if (loading) return (
        <div className="od-page">
            <div className="od-state">
                <div className="od-spinner" /><span>Kraunama…</span>
            </div>
        </div>
    );

    if (error || !order) return (
        <div className="od-page">
            <div className="od-state od-state--error">⚠️ {error ?? "Užsakymas nerastas."}</div>
        </div>
    );

    const { client, products, shipment } = order;
    const vatTotal = (products || []).reduce(
        (s, p) => s + Number(p.vatValue ?? 0) * Number(p.quantity ?? 0), 0
    );

    return (
        <div className="od-page">

            {/* ── Top bar ───────────────────────────────────────────────── */}

            {/* ── Page title ────────────────────────────────────────────── */}
            <div className="od-header-wrapper">
                <div className="od-header">
                    <div className="od-title">Užsakymas #{order.id_Orders}</div>
                    <StatusBadge status={order.statusName} />
                </div>
                <div className="od-topbar">
                    <button className="od-back-btn" onClick={() => navigate(-1)}>
                        <FiArrowLeft size={16} /> Grįžti
                    </button>
                    <div className="od-topbar-actions">
                        <button className="od-back-btn-edit" onClick={() => navigate(`/orderEdit/${order.id_Orders}`)}>
                            <FiEdit size={15} /> Redaguoti
                        </button>
                        {!shipment && (
                            <button className="od-action-btn od-action-btn--primary"
                                onClick={() => navigate(`/orders/${order.id_Orders}/shipment/new`)}>
                                <FiTruck size={15} /> Registruoti siuntą
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <div className="od-body">

                {/* ── Left column ───────────────────────────────────────── */}
                <div className="od-col">

                    {/* Order info */}
                    <section className="od-card">
                        <div className="od-card-title"> <FiShoppingCart size={14} style={{ marginRight: 6 }} /> Užsakymo informacija</div>
                        <div className="od-rows">
                            <Row label="Dokumento Nr." value={order.externalDocumentId || "—"} />
                            <Row label="Data" value={order.OrdersDate
                                ? new Date(order.OrdersDate).toLocaleDateString("lt-LT") : "—"} />
                            <Row label="Apmokėjimas" value={order.paymentMethod || "—"} />
                            <Row label="Pristatymo kaina" value={
                                order.deliveryPrice != null
                                    ? `€${Number(order.deliveryPrice).toFixed(2)}` : "—"} />
                        </div>

                        {/* Totals strip */}
                        <div className="od-totals">
                            <div className="od-total-item">
                                <span className="od-total-label">Suma</span>
                                <span className="od-total-value">€{Number(order.totalAmount ?? 0).toFixed(2)}</span>
                            </div>
                            <div className="od-total-divider" />
                            <div className="od-total-item">
                                <span className="od-total-label">PVM</span>
                                <span className="od-total-value">€{vatTotal.toFixed(2)}</span>
                            </div>
                            <div className="od-total-divider" />
                            <div className="od-total-item">
                                <span className="od-total-label">Prekės</span>
                                <span className="od-total-value">{products?.length ?? 0}</span>
                            </div>
                        </div>
                    </section>
                    {/* Shipment — only if it exists */}
                    {shipment && (
                        <section className="od-card">
                            <div className="od-card-title-row">
                                <div className="od-card-title">
                                    <FiTruck size={14} style={{ marginRight: 6 }} />Siunta
                                </div>
                                {shipment.latestStatus && (
                                    <StatusBadge status={shipment.latestStatus.typeName} />
                                )}
                            </div>

                            <div className="od-rows">
                                {shipment.courierName && (
                                    <Row label="Kurjeris" value={shipment.courierName} />
                                )}
                                {shipment.providerParcelNumber && (
                                    <Row label="Sekimo nr." value={
                                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                            {shipment.providerParcelNumber.split(",").map((n, i) => (
                                                <span key={i} style={{ fontFamily: "var(--font-family-mono)", fontSize: "0.82rem" }}>
                                                    {n.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    } />
                                )}
                                <Row label="Siuntimo data" value={
                                    shipment.shippingDate
                                        ? new Date(shipment.shippingDate).toLocaleDateString("lt-LT") : "—"
                                } />
                                <Row label="Numatoma pristatymo" value={
                                    shipment.estimatedDeliveryDate
                                        ? new Date(shipment.estimatedDeliveryDate).toLocaleDateString("lt-LT") : "—"
                                } />
                                {shipment.DeliveryLat && shipment.DeliveryLng && (
                                    <Row label="Koordinatės" value={
                                        <a href={`https://www.google.com/maps?q=${shipment.DeliveryLat},${shipment.DeliveryLng}`}
                                            target="_blank" rel="noopener noreferrer" className="od-map-link">
                                            <FiMapPin size={12} />
                                            {`${Number(shipment.DeliveryLat).toFixed(5)}, ${Number(shipment.DeliveryLng).toFixed(5)}`}
                                        </a>
                                    } />
                                )}
                                {shipment.providerLockerId && (
                                    <Row label="Paštomatas" value={shipment.providerLockerId} />
                                )}
                            </div>

                            {/* Packages */}
                            {shipment.packages?.length > 0 && (
                                <>
                                    <div className="od-card-subtitle" style={{ marginTop: 12 }}>Pakuotės</div>
                                    <div className="od-package-list">
                                        {shipment.packages.map((pkg, i) => {
                                            const href = pkg.labelFile
                                                ? (pkg.labelFile.startsWith("http") ? pkg.labelFile : `${API}${pkg.labelFile}`)
                                                : null;
                                            return (
                                                <div key={pkg.id_Package} className="od-package-row">
                                                    <div className="od-package-index">{i + 1}</div>
                                                    <div className="od-package-info">
                                                        {pkg.trackingNumber && (
                                                            <span className="od-package-tracking">{pkg.trackingNumber}</span>
                                                        )}
                                                        {pkg.weight != null && (
                                                            <span className="od-package-weight">
                                                                {Number(pkg.weight).toFixed(2)} kg
                                                            </span>
                                                        )}
                                                    </div>
                                                    {href ? (
                                                        <a className="od-label-link" href={href}
                                                            target="_blank" rel="noopener noreferrer" download>
                                                            <FiDownload size={12} /> Etiketė
                                                        </a>
                                                    ) : (
                                                        <span className="od-label-missing">Nėra etiketės</span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </section>
                    )}
                </div>

                {/* ── Right column ──────────────────────────────────────── */}
                <div className="od-col">

                    {/* Client */}
                    {client && (
                        <section className="od-card">
                            <div className="od-card-title">
                                <FiUser size={14} style={{ marginRight: 6 }} />Klientas
                            </div>
                            <div className="od-rows">
                                <Row label="Vardas" value={`${client.name ?? ""} ${client.surname ?? ""}`.trim() || "—"} />
                                <Row label="El. paštas" value={client.email || "—"} />
                                <Row label="Telefonas" value={client.phone || "—"} />
                            </div>
                            {client.companyData && (
                                <>
                                    <div className="od-card-subtitle">
                                        <FiMapPin size={12} style={{ marginRight: 4 }} />Pristatymo adresas
                                    </div>
                                    <div className="od-rows">
                                        <Row label="Gatvė" value={client.companyData.deliveryAddress || "—"} />
                                        <Row label="Miestas" value={client.companyData.city || "—"} />
                                        <Row label="Šalis" value={client.companyData.country || "—"} />
                                        <Row label="PVM kodas" value={client.companyData.vat || "—"} />
                                        <Row label="Banko kodas" value={client.companyData.bankCode || "—"} />
                                    </div>
                                </>
                            )}
                        </section>
                    )}
                    {/* Products */}
                    <section className="od-card">
                        <div className="od-card-title">
                            <FiPackage size={14} style={{ marginRight: 6 }} />Užsakytos prekės
                        </div>
                        <div className="od-product-list">
                            {(products || []).map((p, i) => {
                                const imgSrc = p.product.imageUrl
                                    ? (p.product.imageUrl.startsWith("http")
                                        ? p.product.imageUrl
                                        : `${API}${p.product.imageUrl}`)
                                    : null;
                                const lineTotal = Number(p.quantity ?? 0) * Number(p.unitPrice ?? 0);
                                return (
                                    <div key={p.id_OrdersProduct ?? i} className="od-product-row">
                                        <div className="od-product-img">
                                            <img src={imgSrc || NoImage} alt={p.product.name} />
                                        </div>
                                        <div className="od-product-info">
                                            <div className="od-product-name">{p.product.name}</div>
                                            <div className="od-product-meta">
                                                {p.product.externalCode && (
                                                    <span className="od-product-code">{p.product.externalCode}</span>
                                                )}
                                                <span>
                                                    {p.quantity} {p.product.unit ?? "vnt"} × €{Number(p.unitPrice ?? 0).toFixed(2)}
                                                </span>
                                                {p.vatValue ? (
                                                    <span className="od-product-vat">+€{Number(p.vatValue).toFixed(2)} PVM</span>
                                                ) : null}
                                            </div>
                                        </div>
                                        <div className="od-product-total">€{lineTotal.toFixed(2)}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>



                </div>
            </div>
        </div>
    );
}

// Small helper for label/value rows
function Row({ label, value }) {
    return (
        <div className="od-row">
            <span className="od-row-label">{label}</span>
            <span className="od-row-value">{value}</span>
        </div>
    );
}