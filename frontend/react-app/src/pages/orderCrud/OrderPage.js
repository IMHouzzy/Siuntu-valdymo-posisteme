import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../../components/DataTable";
import RightDrawer from "../../components/RightDrawers/RightDrawerSidebar";
import "../../styles/UserPage.css";
import StatusBadge from "../../components/StatusBadge";
import TableToolbar from "../../components/TableToolbar";
import { FiTrash2, FiEdit, FiTruck, FiExternalLink } from "react-icons/fi";
import { useAuth } from "../../services/AuthContext";
import { ordersApi } from "../../services/api";
import NoImage from "../../images/no-camera.png";

const API = process.env.REACT_APP_API_BASE_URL || "http://localhost:5065";
function OrdersList() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [q, setQ] = useState("");
    const [status, setStatus] = useState("all");
    const { activeCompanyId } = useAuth();

    useEffect(() => {
        if (!activeCompanyId) return;
        setOrders([]);
        setSelectedOrder(null);
        ordersApi.getAll().then(setOrders).catch(console.error);
    }, [activeCompanyId]);

    // REPLACE deleteOrder:
    const deleteOrder = async (p) => {
        if (!window.confirm(`Ištrinti užsakymą #${p.id_Orders}?`)) return;
        try {
            await ordersApi.remove(p.id_Orders);
            setOrders(prev => prev.filter(x => x.id_Orders !== p.id_Orders));
            setSelectedOrder(null);
        } catch { alert("Ištrinti nepavyko"); }
    };

    const sumVatTotal = (o) =>
        (o.products || []).reduce((acc, p) => acc + Number(p.vatValue ?? 0) * Number(p.quantity ?? 0), 0);

    const statusFilters = useMemo(() => {
        const map = new Map();
        for (const o of orders) {
            const key = o.statusName || "Nežinoma";
            map.set(key, (map.get(key) || 0) + 1);
        }
        const items = [{ label: "Visi", value: "all", count: orders.length }];
        Array.from(map.entries())
            .sort((a, b) => a[0].localeCompare(b[0], "lt"))
            .forEach(([name, count]) => items.push({ label: name, value: name, count }));
        return items;
    }, [orders]);

    const filtered = useMemo(() => {
        const byStatus = orders.filter((o) =>
            status === "all" ? true : (o.statusName || "Nežinoma") === status
        );
        const s = q.trim().toLowerCase();
        if (!s) return byStatus;
        return byStatus.filter((p) =>
            [p.externalCode, p.id_Orders, p.creationDate, p.client?.email,
            p.client?.name, p.client?.surname, p.client?.city, p.client?.country,
            p.client?.deliveryAddress, p.products?.map(x => x.name).join(" "),
            p.statusName, p.totalAmount]
                .some(v => String(v ?? "").toLowerCase().includes(s))
        );
    }, [orders, q, status]);

    const columns = useMemo(() => [
        {
            key: "orderDoc",
            header: "Užsakymas / Dokumentas",
            sortable: true,
            accessor: (o) => o.id_Orders,
            cell: (_v, o) => (
                <div className="dt-cell-stack">
                    <div className="dt-cell-primary">#{o.id_Orders}</div>
                    <div className="dt-cell-secondary">Dok: {o.externalDocumentId ?? "—"}</div>
                </div>
            ),
        },
        {
            key: "date",
            header: "Data",
            sortable: true,
            accessor: (o) => o.ordersDate ? new Date(o.ordersDate) : null,
            cell: (v) => v ? v.toLocaleDateString("lt-LT") : "—",
        },
        {
            key: "client",
            header: "Klientas",
            sortable: true,
            accessor: (o) => `${o.client?.name ?? ""} ${o.client?.surname ?? ""}`.trim(),
            cell: (_v, o) => (
                <div className="dt-cell-stack">
                    <div className="dt-cell-primary">
                        {o.client ? `${o.client.name ?? ""} ${o.client.surname ?? ""}`.trim() : "—"}
                    </div>
                    <div className="dt-cell-secondary">{o.client?.email ?? "—"}</div>
                </div>
            ),
        },
        {
            key: "total",
            header: "Suma",
            align: "right",
            sortable: true,
            accessor: (o) => Number(o.totalAmount ?? 0),
            cell: (_v, o) => (
                <div className="dt-cell-stack">
                    <div className="dt-cell-primary">{Number(o.totalAmount ?? 0).toFixed(2) + " €"}</div>
                    <div className="dt-cell-secondary">{o.paymentMethod ?? "—"}</div>
                </div>
            ),
        },
        {
            key: "status",
            header: "Būsena",
            sortable: true,
            accessor: (o) => o.statusName,
            cell: (_v, o) => <StatusBadge status={o.statusName} />,
        },
        {
            key: "items",
            header: "Prekės",
            sortable: true,
            align: "right",
            accessor: (o) => o.products?.length ?? 0,
            cell: (v) => v ?? 0,
        },
        {
            key: "actions",
            header: "",
            width: 80,
            align: "right",
            cell: (_v, p) => (
                <div className="dt-actions">
                    <button className="dt-icon-btn" title="Peržiūrėti"
                        onClick={(e) => { e.stopPropagation(); navigate(`/orders/${p.id_Orders}/detail`); }}>
                        <FiExternalLink />
                    </button>
                    <button className="dt-icon-btn" title="Redaguoti"
                        onClick={(e) => { e.stopPropagation(); navigate(`/orderEdit/${p.id_Orders}`); }}>
                        <FiEdit />
                    </button>
                    <button className="dt-icon-btn danger" title="Ištrinti"
                        onClick={(e) => { e.stopPropagation(); deleteOrder(p); }}>
                        <FiTrash2 />
                    </button>
                </div>
            ),
        },
    ], [orders]);

    // ── Drawer hero — totals strip ─────────────────────────────────────
    const orderHero = useMemo(() => {
        if (!selectedOrder) return null;
        const o = selectedOrder;
        const vat = sumVatTotal(o);

        return (
            <div className="order-hero">
                <div className="order-hero-header">
                    <div>
                        <div className="order-hero-title">Užsakymas #{o.id_Orders}</div>
                        <div className="rd-subtitle"><span>Doc: {o.externalDocumentId || "—"}</span> </div>
                    </div>
                    <div className="order-hero-actions">
                        <button className="rd-action-btn" title="Peržiūrėti"
                            onClick={() => navigate(`/orders/${o.id_Orders}/detail`)}>
                            <FiExternalLink size={18} />
                        </button>
                        <button className="rd-action-btn" title="Redaguoti" onClick={() => navigate(`/orderEdit/${o.id_Orders}`)}>
                            <FiEdit size={18} />
                        </button>
                        {!o.hasShipment && (
                            <button
                                className="rd-action-btn"
                                title="Registruoti siuntą"
                                onClick={() => navigate(`/orders/${o.id_Orders}/shipment/new`)}>
                                <FiTruck size={18} />
                            </button>
                        )}
                        <button className="rd-action-btn danger" title="Ištrinti" onClick={() => deleteOrder(o)}>
                            <FiTrash2 size={18} />
                        </button>
                    </div>
                </div>



                {/* stats */}
                <div className="order-stats-strip">
                    <div className="order-hero-stat">
                        <div className="order-hero-stat-label">Suma</div>
                        <div className="order-hero-stat-value">
                            {Number(o.totalAmount ?? 0).toFixed(2)} €
                        </div>
                    </div>

                    <div className="order-hero-divider" />

                    <div className="order-hero-stat">
                        <div className="order-hero-stat-label">PVM</div>
                        <div className="order-hero-stat-value">
                            {vat.toFixed(2)} €
                        </div>
                    </div>

                    <div className="order-hero-divider" />

                    <div className="order-hero-stat">
                        <div className="order-hero-stat-label">Prekės</div>
                        <div className="order-hero-stat-value">
                            {o.products?.length ?? 0}
                        </div>
                    </div>

                    <div className="order-hero-divider" />
                    <div className="order-hero-stat">
                        <div className="order-hero-stat-label">Būsena</div>
                        <div className="order-hero-stat-value">
                            <StatusBadge status={o.statusName} />
                        </div>
                    </div>
                </div>

            </div>
        );
    }, [selectedOrder]);

    const drawerSections = useMemo(() => {
        if (!selectedOrder) return [];
        const o = selectedOrder;

        const orderRows = [
            { label: "Užsakymo ID", value: o.id_Orders },
            { label: "Dokumento ID", value: o.externalDocumentId || "—" },
            { label: "Data", value: o.ordersDate ? new Date(o.ordersDate).toLocaleDateString("lt-LT") : "—" },
            { label: "Apmokėjimo būdas", value: o.paymentMethod || "—" },
            { label: "Pristatymo kaina", value: o.deliveryPrice != null ? `${Number(o.deliveryPrice).toFixed(2)} €` : "—" },
        ];

        const clientRows = o.client ? [
            { label: "Vardas", value: `${o.client.name || ""} ${o.client.surname || ""}`.trim() || "—" },
            { label: "El. paštas", value: o.client.email || "—" },
            { label: "Adresas", value: o.client.companyData?.deliveryAddress || "—" },
            { label: "Miestas", value: o.client.companyData?.city || "—" },
            { label: "Šalis", value: o.client.companyData?.country || "—" },
            { label: "PVM kodas", value: o.client.companyData?.vat || "—" },
        ] : [];

        // Custom product rows — rendered using special class in CSS
        const productSection = {
            title: "Užsakytos prekės",
            rows: (o.products || []).length === 0 ? [] : [
                {
                    label: null,
                    value: (
                        <div>
                            {(o.products || []).map((p, i) => (
                                <div key={i} className="rd-product-row">
                                    <div className={`rd-product-img ${!p.imageUrl ? "rd-product-img-placeholder" : ""}`}>
                                        {p.imageUrl ? (
                                            <img src={`${API}/${p.imageUrl}`} alt={p.name} />
                                        ) : (
                                            <img src={NoImage} alt="No image" />
                                        )}
                                    </div>

                                    <span className="rd-product-name">{p.name || "Prekė"}</span>
                                    <span className="rd-product-qty">x{p.quantity || 0}</span>

                                    <span className="rd-product-price">
                                        {p.unitPrice != null ? `${Number(p.unitPrice).toFixed(2)} €` : "—"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ),
                },
            ],
            emptyText: "Nėra prekių.",
        };

        return [
            { title: "Užsakymo informacija", rows: orderRows },
            { title: "Kliento informacija", rows: clientRows, emptyText: "Nėra kliento duomenų." },
            productSection,
        ];
    }, [selectedOrder]);

    return (
        <div className="user-cointainer">
            <TableToolbar
                title="Užsakymai"
                searchValue={q}
                onSearchChange={setQ}
                addLabel="Kurti užsakymą"
                onAdd={() => navigate("/orderAdd")}
                filters={statusFilters}
                filterValue={status}
                onFilterChange={setStatus}
                connectBottom
            />
            <DataTable
                columns={columns}
                rows={filtered}
                pageSize={25}
                getRowId={(o) => o.id_Orders}
                onRowClick={(o) => setSelectedOrder(o)}
                emptyText="Nėra užsakymų"
                initialSort={{ key: "date", dir: "desc" }}
            />
            <RightDrawer
                variant="order"
                open={!!selectedOrder}
                hero={orderHero}
                width={600}
                sections={drawerSections}
                onClose={() => setSelectedOrder(null)}
            />
        </div>
    );
}

export default OrdersList;