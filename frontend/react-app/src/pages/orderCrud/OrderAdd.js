import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import SmartForm from "../../components/SmartForm";
import FormPageLayout from "../../components/FormPageLayout";
import { FiArrowLeft } from "react-icons/fi";
import { ordersApi, usersApi } from "../../services/api";

export default function OrderCreatePage() {
  const navigate = useNavigate();

  const [statuses, setStatuses] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);

  const [patch, setPatch] = useState(null);
  const lastClientIdRef = useRef(null);
  const lastItemsKeyRef = useRef("");


  useEffect(() => {
    Promise.all([
      ordersApi.getStatuses(),
      usersApi.getAllWithClients(),
      ordersApi.getProducts(),
    ])
      .then(([sts, us, pr]) => { setStatuses(sts); setUsers(us); setProducts(pr); })
      .catch(console.error);
  }, []);

  const userOptions = useMemo(
    () =>
      (users || []).map((u) => ({
        value: String(u.id_Users),
        label: `${u.name ?? ""} ${u.surname ?? ""} (${u.email ?? "-"})`.trim(),
      })),
    [users]
  );

  const productOptions = useMemo(() => (
    products.map(p => ({
      value: String(p.id_Product),
      label: p.name
    }))
  ), [products]);

  const productPriceById = useMemo(() => {
    const m = new Map();
    products.forEach(p => m.set(String(p.id_Product), Number(p.price ?? 0)));
    return m;
  }, [products]);


  const fields = useMemo(() => [
    { type: "section", title: "Užsakymo informacija" },


    { name: "ordersDate", label: "Data", type: "date", required: true, colSpan: 1 },

    {
      name: "status",
      label: "Būsena",
      type: "select",
      required: true,
      colSpan: 1,
      options: statuses.map(s => ({ value: s.id_OrderStatus, label: s.name })),
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
    { name: "deliveryAddress", label: "Pristatymo adresas", colSpan: 2, disabled: v => !v.clientUserId },
    { name: "city", label: "Miestas", disabled: v => !v.clientUserId },
    { name: "country", label: "Šalis", disabled: v => !v.clientUserId },
    { name: "vat", label: "PVM kodas", disabled: v => !v.clientUserId },
    { name: "bankCode", label: "Banko kodas", type: "number", disabled: v => !v.clientUserId },

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

  ], [statuses, userOptions, productOptions]);

  const initialValues = useMemo(() => ({
    clientUserId: "",
    ordersDate: new Date().toISOString().slice(0, 10),
    paymentMethod: "",
    deliveryPrice: 0,
    status: "",
    totalAmount: 0,

    deliveryAddress: "",
    city: "",
    country: "",
    vat: "",
    bankCode: null,

    items: [{ productId: "", quantity: 1, price: 0 }],
  }), []);

  return (
    <FormPageLayout title="Kurti užsakymą" actions={<button className="od-back-btn" onClick={() => navigate(-1)}><FiArrowLeft size={16} /> Grįžti</button>}>
      <SmartForm
        fields={fields}
        initialValues={initialValues}
        patchValues={patch}
        submitLabel="Sukurti"
        cancelLabel="Atšaukti"
        onCancel={() => navigate("/orderList")}
        onValuesChange={async (v) => {
          const cid = v.clientUserId;

          // klientas pasikeitė -> fetch clientInfo
          if (!cid) {
            lastClientIdRef.current = null;
            setPatch({
              deliveryAddress: "",
              city: "",
              country: "",
              vat: "",
              bankCode: null,
            });
          } else {
            if (lastClientIdRef.current !== cid) {
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
          }

          // ✅ total skaičiavimas + preload price tik jei price 0
          try {
            const toNum = (x) => {
              const n = Number(x);
              return Number.isFinite(n) ? n : 0;
            };

            const items = Array.isArray(v.items) ? v.items : [];
            const VAT_RATE = 0.21;

            const nextItems = items.map((it) => {
              if (!it?.productId) return it;

              const currentPrice = toNum(it.price);
              if (currentPrice > 0) return it; // ✅ istorinių kainų / user įvestos neperrašom

              const p = productPriceById.get(String(it.productId)) ?? 0;
              return { ...it, price: p };
            });

            const itemsTotal = nextItems.reduce((sum, it) => {
              const qty = toNum(it?.quantity);
              const price = toNum(it?.price);
              const net = qty * price;
              const vat = net * VAT_RATE;
              return sum + net + vat;
            }, 0);

            const total = itemsTotal;


            const roundedTotal = Math.round(total * 100) / 100;

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

            const totalChanged = toNum(v.totalAmount) !== roundedTotal;

            if (itemsChanged || totalChanged) {
              setPatch((prev) => ({
                ...(prev ?? {}),
                items: nextItems,
                totalAmount: roundedTotal,
              }));
            }
          } catch (e) {
            console.error(e);
          }
        }}

        onSubmit={async (v) => {
          const payload = {
            OrdersDate: v.ordersDate,
            PaymentMethod: v.paymentMethod,
            DeliveryPrice: Number(v.deliveryPrice ?? 0),
            Status: Number(v.status),
            ClientUserId: Number(v.clientUserId),
            TotalAmount: Number(v.totalAmount ?? 0),

            ClientInfo: {
              DeliveryAddress: v.deliveryAddress,
              City: v.city,
              Country: v.country,
              Vat: v.vat,
              BankCode: v.bankCode === "" ? null : v.bankCode,
            },

            Items: (v.items ?? [])
              .filter(it => it.productId !== "" && Number(it.quantity) > 0)
              .map(it => ({
                ProductId: Number(it.productId),
                Quantity: Number(it.quantity),
                UnitPrice: Number(it.price ?? 0),
                VatValue: Number(it.price ?? 0) * 0.21, // vieneto PVM
              })),
          };

          const res = await ordersApi.create(payload);

          if (!res.ok) {
            console.log(await res.text());
            return;
          }

          navigate("/orderList");
        }}
      />
    </FormPageLayout>
  );
}
