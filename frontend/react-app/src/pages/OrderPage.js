import { useEffect, useMemo, useState } from "react";
import DataTable from "../components/DataTable";
import RightDrawer from "../components/RightDrawerSidebar";
import "../styles/UserPage.css";
import StatusBadge from "../components/StatusBadge";

function OrdersList() {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);

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

                // these will show only if you add them in API
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
            <DataTable
                columns={columns}
                rows={orders}
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
            />
        </div>
    );
}

export default OrdersList;
