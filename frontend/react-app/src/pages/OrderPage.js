import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../components/DataTable";
import RightDrawer from "../components/RightDrawerSidebar";
import "../styles/UserPage.css";
import StatusBadge from "../components/StatusBadge";
import TableToolbar from "../components/TableToolbar";
import { FiTrash2, FiEdit } from "react-icons/fi";
function OrdersList() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [q, setQ] = useState("");

    useEffect(() => {
        fetch("http://localhost:5065/api/orders/allOrdersFullInfo")
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return res.json();
            })
            .then((data) => setOrders(data))
            .catch(console.error);
        console.log(orders);
    }, []);

    const deleteOrder = async (p) => {
        const ok = window.confirm(`Delete order "${p.name}"?`);
        if (!ok) return;

        const res = await fetch(`http://localhost:5065/api/orders/deleteOrder/${p.id_Orders}`, {
            method: "DELETE",
        });

        if (!res.ok) {
            alert("Delete failed");
            return;
        }

        setOrders((prev) => prev.filter((x) => x.id_Orders !== p.id_Orders));
        setSelectedOrder(null);
    };
    const filtered = useMemo(() => {
        const s = q.trim().toLowerCase();
        if (!s) return orders;

        return orders.filter((p) => {
            const code = String(p.externalCode ?? "").toLowerCase();
            const id = String(p.id_Orders ?? "").toLowerCase();
            const date = String(p.creationDate ?? "").toLowerCase();
            const email = String(p.client?.email ?? "").toLowerCase();
            const clientName = String(p.client?.name ?? "").toLowerCase();
            const clientSurname = String(p.client?.surname ?? "").toLowerCase();
            const clientCity = String(p.client?.city ?? "").toLowerCase();
            const clientCountry = String(p.client?.country ?? "").toLowerCase();
            const clientDeliveryAddress = String(p.client?.deliveryAddress ?? "").toLowerCase();
            const productName = String(p.products?.map(p => p.name ?? "").join(" ") ?? "").toLowerCase();
            const status = String(p.statusName ?? "").toLowerCase();
            const totalAmmount = String(p.totalAmount ?? "").toLowerCase();

            return productName.includes(s) || code.includes(s) || id.includes(s) || date.includes(s) || email.includes(s) 
            || clientName.includes(s) || clientSurname.includes(s) || clientCity.includes(s) || clientCountry.includes(s) || clientDeliveryAddress.includes(s)
            || status.includes(s) || totalAmmount.includes(s);
        });
    }, [orders, q]);

    const columns = useMemo(
        () => [
            {
                key: "orderDoc",
                header: "Užsakymas / Dokumentas",
                sortable: true,
                accessor: (o) => o.id_Orders,
                cell: (_v, o) => (
                    <div className="dt-cell-stack">
                        <div className="dt-cell-primary">#{o.id_Orders}</div>
                        <div className="dt-cell-secondary">Dokumentas: {o.externalDocumentId ?? "-"}</div>
                    </div>
                ),
            },
            {
                key: "date",
                header: "Data",
                sortable: true,
                accessor: (o) => (o.ordersDate ? new Date(o.ordersDate) : null),
                cell: (v) => (v ? v.toLocaleDateString("lt-LT") : "-"),
            },
            {
                key: "client",
                header: "Klientas",
                sortable: true,
                accessor: (o) => `${o.client?.name ?? ""} ${o.client?.surname ?? ""}`.trim(),
                cell: (_v, o) => (
                    <div className="dt-cell-stack">
                        <div className="dt-cell-primary">
                            {o.client ? `${o.client.name ?? ""} ${o.client.surname ?? ""}`.trim() : "-"}
                        </div>
                        <div className="dt-cell-secondary">{o.client?.email ?? "-"}</div>
                    </div>
                ),
            },

            {
                key: "total",
                header: "Suma",
                align: "right",
                sortable: true,
                accessor: (o) => Number(o.totalAmount ?? 0).toFixed(2),
                cell: (_v, o) => (
                    <div className="dt-cell-stack">
                        <div className="dt-cell-primary">{Number(o.totalAmount ?? 0).toFixed(2)}</div>
                        <div className="dt-cell-secondary">{o.paymentMethod ?? "-"}</div>
                    </div>
                ),
            },
            {
                key: "status",
                header: "Statusas",
                sortable: true,
                accessor: (o) => o.statusName,
                cell: (_v, o) => <StatusBadge status={o.statusName} />,
            },

            {
                key: "items",
                header: "Prekių kiekis",
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
                        <button
                            className="dt-icon-btn"
                            title="Edit"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/orderEdit/${p.id_Orders}`);
                            }}
                        >
                            <FiEdit />
                        </button>

                        <button
                            className="dt-icon-btn danger"
                            title="Delete"
                            onClick={(e) => {
                                e.stopPropagation();
                                deleteOrder(p);
                            }}
                        >
                            <FiTrash2 />
                        </button>
                    </div>
                ),
            }
        ],
        []
    );

    const drawerSections = useMemo(() => {
        if (!selectedOrder) return [];
        const o = selectedOrder;

        const orderRows = [
            { label: "Užsakymo ID", value: o.id_Orders || "-" },
            { label: "Dokumento ID", value: o.externalDocumentId || "-" },
            {
                label: "Data", value: o.ordersDate
                    ? new Date(o.ordersDate).toLocaleDateString("lt-LT")
                    : "-",
            },
            { label: "Statusas", value: <StatusBadge status={o.statusName} /> },
            { label: "Apmokėjimo būdas", value: o.paymentMethod || "-" },
            { label: "Pristatymo kaina", value: o.deliveryPrice != null ? Number(o.deliveryPrice).toFixed(2) : "-" },
            { label: "Suma", value: o.totalAmount != null ? Number(o.totalAmount).toFixed(2) : "-" },
        ];

        const clientRows = o.client
            ? [
                { label: "Kliento ID", value: o.client.id_Users || "-" },
                { label: "Vardas", value: `${o.client.name || ""} ${o.client.surname || ""}`.trim() || "-" },
                { label: "El. paštas", value: o.client.email || "-" },


                { label: "Adresas", value: o.client.deliveryAddress || "-" },
                { label: "Miestas", value: o.client.city || "-" },
                { label: "Šalis", value: o.client.country || "-" },
                { label: "VAT", value: o.client.vat || "-" },
                { label: "Bank Code", value: o.client.bankCode || "-" },
                { label: "Max Debt", value: o.client.maxDebt || "-" },
                { label: "External Client ID", value: o.client.externalClientId || "-" },
            ]
            : [];

        const productRows = (o.products || []).map((p) => ({
            label: `${p.name || "Prekė"} (x${p.quantity || 0})`,
            value: `${p.price != null ? Number(p.price).toFixed(2) : "-"} Eur`,
        }));

        return [
            { title: "Užsakymo informacija", rows: orderRows },
            { title: "Kliento informacija", rows: clientRows, emptyText: "Nėra kliento duomenų." },
            { title: "Užsakytos prekės", rows: productRows, emptyText: "Nėra prekių." },
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
                open={!!selectedOrder}
                title={selectedOrder ? `Užsakymas #${selectedOrder.id_Orders}` : ""}
                subtitle={selectedOrder ? `Doc: ${selectedOrder.externalDocumentId || "-"}` : ""}
                sections={drawerSections}
                onClose={() => setSelectedOrder(null)}
                actions={
                    selectedOrder ? (
                        <>
                            <button
                                className="rd-action-btn"
                                onClick={() => navigate(`/orderEdit/${selectedOrder.id_Orders}`)}
                            >
                                <FiEdit /> Redaguoti
                            </button>

                            <button
                                className="rd-action-btn danger"
                                onClick={() => deleteOrder(selectedOrder)}
                            >
                                <FiTrash2 /> Ištrinti
                            </button>
                        </>
                    ) : null
                }
            />
        </div>
    );
}

export default OrdersList;
