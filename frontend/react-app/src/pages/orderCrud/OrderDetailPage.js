// pages/Orders/OrderDetailPage.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ordersApi } from "../../services/api";
import StatusBadge from "../../components/StatusBadge";
import NoImage from "../../images/no-camera.png";
import {
    FiArrowLeft, FiEdit, FiTruck, FiPackage,
    FiUser, FiMapPin, FiDownload, FiShoppingCart,
    FiRotateCcw, FiAlertCircle, FiCheckCircle,
    FiImage, FiFileText, FiCalendar,
} from "react-icons/fi";
import "../../styles/OrderDetail.css";

const API = process.env.REACT_APP_API_BASE_URL || "http://localhost:5065";

const RETURN_STATUS = {
    1: { label: "Sukurtas", color: "var(--color-secondary)", icon: FiAlertCircle },
    2: { label: "Įvykdytas", color: "var(--color-accent)", icon: FiCheckCircle },
    3: { label: "Gauta", color: "var(--color-warning)", icon: FiAlertCircle },
    4: { label: "Patvirtintas", color: "var(--color-accent)", icon: FiCheckCircle },
    5: { label: "Atmestas", color: "var(--color-danger)", icon: FiAlertCircle },
    6: { label: "Atmestas", color: "var(--color-danger)", icon: FiAlertCircle },
    7: { label: "Etiketės paruoštos", color: "var(--color-primary)", icon: FiFileText },
};

function getReturnStatus(id) {
    return RETURN_STATUS[id] ?? { label: String(id), color: "var(--color-text-muted)", icon: FiAlertCircle };
}

function ReturnStatusBadge({ statusId }) {
    const cfg = getReturnStatus(statusId);
    const Icon = cfg.icon;
    return (
        <span className="od-badge" style={{
            "--badge-color": cfg.color,
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            padding: "4px 10px",
            borderRadius: "12px",
            fontSize: "11px",
            fontWeight: 500,
            backgroundColor: `${cfg.color}15`,
            color: cfg.color,
            border: `1px solid ${cfg.color}40`
        }}>
            <Icon size={11} /> {cfg.label}
        </span>
    );
}

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
            <div className="od-state"><div className="od-spinner" /><span>Kraunama…</span></div>
        </div>
    );

    if (error || !order) return (
        <div className="od-page">
            <div className="od-state od-state--error">⚠️ {error ?? "Užsakymas nerastas."}</div>
        </div>
    );

    const { client, products, shipment, returns } = order;

    // Delivery address — from ORDER snapshot, not client.companyData
    const deliveryAddress = order.snapshotDeliveryAddress;
    const deliveryCity = order.snapshotCity;
    const deliveryCountry = order.snapshotCountry;
    const isLocker = order.snapshotDeliveryMethod === "LOCKER";

    // FIXED: resolve snapshotCourierId to a name if we have it from the shipment,
    // otherwise show the courier name from the shipment itself, or hide the row
    // entirely rather than showing a raw integer ID to staff.
    const courierDisplay = shipment?.courierName
        || (order.snapshotCourierId ? `Kurjeris ID: ${order.snapshotCourierId}` : null);

    const vatTotal = (products || []).reduce(
        (s, p) => s + Number(p.vatValue ?? 0) * Number(p.quantity ?? 0), 0
    );

    return (
        <div className="od-page">
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

                {/* ── Left column ────────────────────────────────────────── */}
                <div className="od-col">

                    {/* Order info */}
                    <section className="od-card">
                        <div className="od-card-title">
                            <FiShoppingCart size={14} style={{ marginRight: 6 }} />
                            Užsakymo informacija
                        </div>
                        <div className="od-rows">
                            <Row label="Dokumento Nr." value={order.externalDocumentId || "—"} />
                            <Row label="Data" value={
                                order.OrdersDate
                                    ? new Date(order.OrdersDate).toLocaleDateString("lt-LT")
                                    : "—"
                            } />
                            <Row label="Apmokėjimas" value={order.paymentMethod || "—"} />
                            <Row label="Pristatymo kaina" value={
                                order.deliveryPrice != null
                                    ? `€${Number(order.deliveryPrice).toFixed(2)}`
                                    : "—"
                            } />
                        </div>
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
                    {/* Shipment */}
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
                                {shipment.courierName && <Row label="Kurjeris" value={shipment.courierName} />}
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

                {/* ── Right column ───────────────────────────────────────── */}
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

                            {/* Billing — from companyData (vat, bankCode, externalClientId only) */}
                            {client.companyData && (client.companyData.vat || client.companyData.bankCode || client.companyData.externalClientId) && (
                                <>
                                    <div className="od-card-subtitle">Atsiskaitymo duomenys</div>
                                    <div className="od-rows">
                                        {client.companyData.vat && <Row label="PVM kodas" value={client.companyData.vat} />}
                                        {client.companyData.bankCode && <Row label="Banko kodas" value={client.companyData.bankCode} />}
                                        {client.companyData.externalClientId && <Row label="Išorinis ID" value={client.companyData.externalClientId} />}
                                    </div>
                                </>
                            )}

                            {/* Delivery address — from ORDER snapshot */}
                            <div className="od-card-subtitle">
                                <FiMapPin size={12} style={{ marginRight: 4 }} />
                                {isLocker ? "Pristatymas į paštomatą" : "Pristatymo adresas"}
                            </div>
                            <div className="od-rows">
                                {isLocker ? (
                                    <>
                                        {order.snapshotLockerName && <Row label="Paštomatas" value={order.snapshotLockerName} />}
                                        {order.snapshotLockerAddress && <Row label="Adresas" value={order.snapshotLockerAddress} />}
                                    </>
                                ) : (
                                    <>
                                        <Row label="Gatvė" value={deliveryAddress || "—"} />
                                        <Row label="Miestas" value={deliveryCity || "—"} />
                                        <Row label="Šalis" value={deliveryCountry || "—"} />
                                    </>
                                )}
                                {order.snapshotPhone && <Row label="Tel." value={order.snapshotPhone} />}
                                {/* FIXED: show courier name not raw ID; hide if no courier info */}
                                {courierDisplay && <Row label="Kurjeris" value={courierDisplay} />}
                            </div>
                        </section>
                    )}
                    {/* Returns */}
                    {returns && returns.length > 0 && (
                        <section className="od-card">
                            <div className="od-card-title">
                                <FiRotateCcw size={14} style={{ marginRight: 6 }} />
                                Grąžinimai ({returns.length})
                            </div>
                            {returns.map((ret, idx) => (
                                <div key={ret.id_Returns} className="od-return-section">
                                    {idx > 0 && <div className="od-return-divider" />}

                                    <div className="od-return-header">
                                        <div className="od-return-header-left">
                                            <span className="od-return-id">Grąžinimas #{ret.id_Returns}</span>
                                            <ReturnStatusBadge statusId={ret.statusId} />
                                        </div>
                                        <span className="od-return-date">
                                            <FiCalendar size={11} />
                                            {new Date(ret.date).toLocaleDateString("lt-LT")}
                                        </span>
                                    </div>

                                    <div className="od-rows" style={{ marginTop: 8 }}>
                                        {ret.returnMethod && (
                                            <Row label="Metodas" value={
                                                <span className="od-return-method-tag">{ret.returnMethod}</span>
                                            } />
                                        )}
                                        {ret.courierName && <Row label="Kurjeris" value={ret.courierName} />}

                                        {/* Return address or locker */}
                                        {ret.returnLockerName ? (
                                            <>
                                                <Row label="Paštomatas" value={ret.returnLockerName} />
                                                {ret.returnLockerAddress && (
                                                    <Row label="Adresas" value={ret.returnLockerAddress} />
                                                )}
                                            </>
                                        ) : ret.returnStreet ? (
                                            <Row label="Adresas" value={
                                                [ret.returnStreet, ret.returnCity, ret.returnPostalCode, ret.returnCountry]
                                                    .filter(Boolean).join(", ")
                                            } />
                                        ) : null}
                                    </div>

                                    {/* Client note */}
                                    {ret.clientNote && (
                                        <div className="od-return-note">
                                            <div className="od-return-note-label">
                                                <FiUser size={11} /> Kliento pastaba:
                                            </div>
                                            <div className="od-return-note-text">"{ret.clientNote}"</div>
                                        </div>
                                    )}

                                    {/* Employee note */}
                                    {ret.employeeNote && (
                                        <div className="od-return-note od-return-note--employee">
                                            <div className="od-return-note-label">
                                                <FiAlertCircle size={11} /> Darbuotojo pastaba:
                                            </div>
                                            <div className="od-return-note-text">"{ret.employeeNote}"</div>
                                        </div>
                                    )}

                                    {/* Return items */}
                                    {ret.items && ret.items.length > 0 && (
                                        <>
                                            <div className="od-card-subtitle" style={{ marginTop: 12 }}>
                                                Grąžinamos prekės ({ret.items.length})
                                            </div>
                                            <div className="od-return-items">
                                                {ret.items.map(item => {
                                                    const imgSrc = item.product?.imageUrl
                                                        ? (item.product.imageUrl.startsWith("http")
                                                            ? item.product.imageUrl
                                                            : `${API}${item.product.imageUrl}`)
                                                        : null;

                                                    let images = [];
                                                    try {
                                                        images = item.imageUrls ? JSON.parse(item.imageUrls) : [];
                                                    } catch {
                                                        images = [];
                                                    }

                                                    return (
                                                        <div key={item.id_ReturnItem} className="od-return-item">
                                                            <div className="od-return-item-main">
                                                                <div className="od-product-img">
                                                                    <img src={imgSrc || NoImage} alt={item.product?.name || "Product"} />
                                                                </div>
                                                                <div className="od-return-item-info">
                                                                    <div className="od-product-name">
                                                                        {item.product?.name || "—"}
                                                                    </div>
                                                                    <div className="od-return-item-meta">
                                                                        <span>Kiekis: {item.quantity}</span>
                                                                        {item.reasonName && (
                                                                            <span className="od-return-reason">
                                                                                Priežastis: {item.reasonName}
                                                                            </span>
                                                                        )}
                                                                        {item.returnSubTotal != null && (
                                                                            <span className="od-return-subtotal">
                                                                                €{Number(item.returnSubTotal).toFixed(2)}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    {item.evaluationComment && (
                                                                        <div className="od-return-eval">
                                                                            <span className={`od-return-eval-badge ${item.evaluation ? "od-return-eval--approved" : "od-return-eval--rejected"}`}>
                                                                                {item.evaluation ? <FiCheckCircle size={11} /> : <FiAlertCircle size={11} />}
                                                                                {item.evaluation ? "Patvirtinta" : "Atmesta"}
                                                                            </span>
                                                                            <span className="od-return-eval-comment">
                                                                                {item.evaluationComment}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Item images */}
                                                            {images.length > 0 && (
                                                                <div className="od-return-item-images">
                                                                    <div className="od-return-images-label">
                                                                        <FiImage size={11} /> Kliento nuotraukos:
                                                                    </div>
                                                                    <div className="od-return-images-grid">
                                                                        {images.map((imgUrl, i) => {
                                                                            const fullUrl = imgUrl.startsWith("http")
                                                                                ? imgUrl
                                                                                : `${API}${imgUrl}`;
                                                                            return (
                                                                                <a
                                                                                    key={i}
                                                                                    href={fullUrl}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="od-return-image-thumb"
                                                                                >
                                                                                    <img src={fullUrl} alt={`Return ${i + 1}`} />
                                                                                </a>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </>
                                    )}

                                    {/* Return shipment labels */}
                                    {ret.returnShipment?.packages?.length > 0 && (
                                        <>
                                            <div className="od-card-subtitle" style={{ marginTop: 12 }}>
                                                Grąžinimo etiketės
                                            </div>
                                            <div className="od-return-labels">
                                                {ret.returnShipment.packages.map((pkg, i) => {
                                                    const href = pkg.labelFile
                                                        ? (pkg.labelFile.startsWith("http") ? pkg.labelFile : `${API}${pkg.labelFile}`)
                                                        : null;
                                                    return href ? (
                                                        <a
                                                            key={pkg.id_Package}
                                                            className="od-label-link"
                                                            href={href}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            download
                                                        >
                                                            <FiFileText size={12} /> Paketas {i + 1}
                                                        </a>
                                                    ) : null;
                                                })}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
}

function Row({ label, value }) {
    return (
        <div className="od-row">
            <span className="od-row-label">{label}</span>
            <span className="od-row-value">{value}</span>
        </div>
    );
}