import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SmartForm from "../../components/SmartForm";
import FormPageLayout from "../../components/FormPageLayout";
import { FiArrowLeft } from "react-icons/fi";
import { ordersApi, usersApi } from "../../services/api";
import { validateOrder } from "./orderValidation";
export default function OrderEditPage() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [statuses, setStatuses] = useState([]);
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [initialValues, setInitialValues] = useState(null);
    const [patch, setPatch] = useState(null);
    const [submitError, setSubmitError] = useState(null);

    const lastClientIdRef = useRef(null);

    const productPriceById = useMemo(() => {
        const m = new Map();
        products.forEach((p) => m.set(String(p.id_Product), Number(p.price ?? 0)));
        return m;
    }, [products]);

    // ── Load all data ─────────────────────────────────────────────────────────
    useEffect(() => {
        Promise.all([
            ordersApi.getStatuses(),
            usersApi.getAllWithClients(),
            ordersApi.getProducts(),
            ordersApi.getOne(id),
        ])
            .then(([sts, us, pr, order]) => {
                setStatuses(sts);
                setUsers(us);
                setProducts(pr);

                const clientId = String(order.clientUserId);
                const clientUser = (us || []).find((u) => String(u.id_Users) === String(clientId));
                const clientData = clientUser?.client ?? null;

                const VAT = 0.21;
                const itemsWithPrice =
                    order.items?.map((it) => ({
                        productId: String(it.productId),
                        quantity: Number(it.quantity ?? 1),
                        price: Number(it.unitPrice ?? 0),
                    })) ?? [{ productId: "", quantity: 1, price: 0 }];

                const roundedTotal = Math.round(
                    itemsWithPrice.reduce((sum, it) => {
                        const net = Number(it.quantity) * Number(it.price);
                        return sum + net + net * VAT;
                    }, 0) * 100
                ) / 100;

                setInitialValues({
                    clientUserId: clientId,
                    ordersDate: order.ordersDate?.slice(0, 10),
                    paymentMethod: order.paymentMethod ?? "",
                    deliveryPrice: order.deliveryPrice ?? 0,
                    status: String(order.status ?? ""),
                    totalAmount: order.totalAmount ?? roundedTotal,

                    // Pre-fill from order snapshot — this is what was chosen for THIS order,
                    // not the client's current profile address.
                    // Falls back to profile address only if snapshot is empty (e.g. old Butent orders).
                    deliveryAddress: order.snapshotDeliveryAddress ?? clientData?.deliveryAddress ?? "",
                    city: order.snapshotCity ?? clientData?.city ?? "",
                    country: order.snapshotCountry ?? clientData?.country ?? "",
                    vat: clientData?.vat ?? "",  // billing — always from profile
                    bankCode: clientData?.bankCode ?? null,

                    items: itemsWithPrice,
                });
            })
            .catch(console.error);
    }, [id]);

    const userOptions = useMemo(
        () =>
            (users || [])
                .filter((u) => !!u.client)
                .map((u) => ({
                    value: String(u.id_Users),
                    label: `${u.name ?? ""} ${u.surname ?? ""} (${u.email ?? "-"})`.trim(),
                })),
        [users]
    );

    const productOptions = useMemo(
        () => products.map((p) => ({ value: String(p.id_Product), label: p.name })),
        [products]
    );

    const fields = useMemo(
        () => [
            { type: "section", title: "Užsakymo informacija" },
            { name: "ordersDate", label: "Data", type: "date", required: true, colSpan: 1 },
            {
                name: "status",
                label: "Būsena",
                type: "select",
                required: true,
                colSpan: 1,
                options: statuses.map((s) => ({ value: s.id_OrderStatus, label: s.name })),
            },

            { type: "section", title: "Kliento informacija" },
            {
                name: "clientUserId",
                label: "Klientas",
                type: "searchselect",
                required: true,
                colSpan: 2,
                options: userOptions,
                placeholder: "Pasirinkite klientą",
            },
            { name: "deliveryAddress", label: "Pristatymo adresas", colSpan: 2, disabled: (v) => !v.clientUserId },
            { name: "city", label: "Miestas", disabled: (v) => !v.clientUserId },
            { name: "country", label: "Šalis", disabled: (v) => !v.clientUserId },
            { name: "vat", label: "PVM kodas", disabled: (v) => !v.clientUserId },
            { name: "bankCode", label: "Banko kodas", type: "number", disabled: (v) => !v.clientUserId },

            { type: "section", title: "Prekės" },
            {
                type: "array",
                name: "items",
                label: "",
                minRows: 1,
                addLabel: "+ Pridėti prekę",
                emptyRow: { productId: "", quantity: 1, price: 0 },
                rowFields: [
                    {
                        name: "productId",
                        label: "Prekė",
                        type: "searchselect",
                        required: true,
                        colSpan: 2,
                        options: productOptions,
                        placeholder: "Pasirinkite prekę",
                    },
                    {
                        name: "quantity",
                        label: "Kiekis",
                        type: "number",
                        required: true,
                        colSpan: 1,
                        validate: (v) => (Number(v) <= 0 ? "Kiekis turi būti > 0" : null),
                    },
                    {
                        name: "price",
                        label: "Kaina",
                        type: "number",
                        required: true,
                        colSpan: 1,
                        validate: (v) => (Number(v) <= 0 ? "Kaina turi būti > 0" : null),
                    },
                ],
            },
            { type: "spacer", colSpan: 1 },
            {
                name: "totalAmount",
                label: "Suma (su PVM)",
                type: "display",
                colSpan: 1,
                render: (val) => `${Number(val ?? 0).toFixed(2)} €`,
            },
        ],
        [statuses, userOptions, productOptions]
    );

    const handleValuesChange = async (v) => {
        const cid = v.clientUserId;

        // Client switched → reload address from their profile
        if (!cid) {
            lastClientIdRef.current = null;
            setPatch({ deliveryAddress: "", city: "", country: "", vat: "", bankCode: null });
        } else if (lastClientIdRef.current !== cid) {
            lastClientIdRef.current = cid;
            const clientUser = (users || []).find((u) => String(u.id_Users) === String(cid));
            const data = clientUser?.client ?? null;
            setPatch({
                deliveryAddress: data?.deliveryAddress ?? "",
                city: data?.city ?? "",
                country: data?.country ?? "",
                vat: data?.vat ?? "",
                bankCode: data?.bankCode ?? null,
            });
        }

        try {
            const toNum = (x) => { const n = Number(x); return Number.isFinite(n) ? n : 0; };
            const items = Array.isArray(v.items) ? v.items : [];
            const VAT = 0.21;

            const nextItems = items.map((it) => {
                if (!it?.productId) return it;
                if (toNum(it.price) > 0) return it; // preserve historical price
                return { ...it, price: productPriceById.get(String(it.productId)) ?? 0 };
            });

            const roundedTotal = Math.round(
                nextItems.reduce((sum, it) => {
                    const net = toNum(it?.quantity) * toNum(it?.price);
                    return sum + net + net * VAT;
                }, 0) * 100
            ) / 100;

            const itemsChanged =
                nextItems.length !== items.length ||
                nextItems.some((it, i) => {
                    const old = items[i] ?? {};
                    return (
                        String(it?.productId ?? "") !== String(old?.productId ?? "") ||
                        toNum(it?.quantity) !== toNum(old?.quantity) ||
                        toNum(it?.price) !== toNum(old?.price)
                    );
                });

            if (itemsChanged || toNum(v.totalAmount) !== roundedTotal) {
                setPatch((prev) => ({ ...(prev ?? {}), items: nextItems, totalAmount: roundedTotal }));
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleSubmit = async (v) => {
        setSubmitError(null);

        const payload = {
            OrdersDate: v.ordersDate,
            PaymentMethod: v.paymentMethod,
            DeliveryPrice: Number(v.deliveryPrice ?? 0),
            Status: Number(v.status),
            ClientUserId: Number(v.clientUserId),
            TotalAmount: Number(v.totalAmount ?? 0),

            // ClientInfo.DeliveryAddress updates THIS order's snapshot only.
            // It does NOT touch the client's profile address in client_companies.
            ClientInfo: {
                DeliveryAddress: v.deliveryAddress,
                City: v.city,
                Country: v.country,
                Vat: v.vat,
                BankCode: v.bankCode === "" ? null : v.bankCode,
            },

            Items: (v.items ?? [])
                .filter((it) => it.productId !== "" && Number(it.quantity) > 0)
                .map((it) => ({
                    ProductId: Number(it.productId),
                    Quantity: Number(it.quantity),
                    UnitPrice: Number(it.price ?? 0),
                    VatValue: Number(it.price ?? 0) * 0.21,
                })),
        };

        try {
            // req() in api.js throws on non-ok with the server's error message as err.message
            await ordersApi.update(id, payload);
            navigate("/orderList");
        } catch (err) {
            setSubmitError(err.message ?? "Serverio klaida. Bandykite dar kartą.");
        }
    };

    if (!initialValues) return <div>Loading…</div>;

    return (
        <FormPageLayout
            title="Redaguoti užsakymą"
            actions={
                <button className="od-back-btn" onClick={() => navigate(-1)}>
                    <FiArrowLeft size={16} /> Grįžti
                </button>
            }
        >
            {submitError && (
                <div className="form-error-banner" style={{
                    background: "#fef2f2", color: "#b91c1c", border: "1px solid #fca5a5",
                    borderRadius: 6, padding: "10px 14px", marginBottom: 16, fontSize: "0.875rem",
                }}>
                    {submitError}
                </div>
            )}
            <SmartForm
                fields={fields}
                initialValues={initialValues}
                patchValues={patch}
                submitLabel="Išsaugoti"
                cancelLabel="Atšaukti"
                onCancel={() => navigate("/orderList")}
                onValuesChange={handleValuesChange}
                onSubmit={handleSubmit}
                validate={validateOrder}
            />
        </FormPageLayout>
    );
}