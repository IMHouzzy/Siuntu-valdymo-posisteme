import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import SmartForm from "../components/SmartForm";
import FormPageLayout from "../components/FormPageLayout";

export default function OrderCreatePage() {
  const navigate = useNavigate();

  const [statuses, setStatuses] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);

  const [patch, setPatch] = useState(null);
  const lastClientIdRef = useRef(null);

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:5065/api/orders/order-statuses").then(r => r.json()),
      fetch("http://localhost:5065/api/users/allUsers").then(r => r.json()),
      fetch("http://localhost:5065/api/orders/products?q=").then(r => r.json()),
    ])
      .then(([sts, us, pr]) => {
        setStatuses(sts);
        setUsers(us);
        setProducts(pr);
      })
      .catch(console.error);
  }, []);

  const userOptions = useMemo(() => (
    users.map(u => ({
      value: String(u.id_Users),
      label: `${u.name} ${u.surname} (${u.email})`
    }))
  ), [users]);

  const productOptions = useMemo(() => (
    products.map(p => ({
      value: String(p.id_Product),
      label: p.name
    }))
  ), [products]);

  const fields = useMemo(() => [
    { type: "section", title: "Užsakymo informacija" },

    {
      name: "clientUserId",
      label: "Klientas",
      type: "searchselect",
      required: true,
      colSpan: 2,
      options: userOptions,
      placeholder: "Pasirinkite klientą",
    },

    { name: "ordersDate", label: "Data", type: "date", required: true, colSpan: 1 },
    { name: "paymentMethod", label: "Mokėjimo būdas", required: true, colSpan: 1 },
    { name: "deliveryPrice", label: "Pristatymo kaina", type: "number", required: true, colSpan: 1 },

    {
      name: "status",
      label: "Statusas",
      type: "select",
      required: true,
      colSpan: 1,
      options: statuses.map(s => ({ value: s.id_OrderStatus, label: s.name })),
    },

    { name: "totalAmount", label: "Suma", type: "number", required: true, colSpan: 2 },

    { type: "section", title: "Kliento informacija" },

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
      required: true,
      minRows: 1,
      addLabel: "+ Pridėti prekę",
      emptyRow: { productId: "", quantity: 1 },
      rowFields: [
        {
          name: "productId",
          label: "Prekė",
          type: "searchselect",
          required: true,
          colSpan: 1,
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
      ],
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

    items: [{ productId: "", quantity: 1 }],
  }), []);

  return (
    <FormPageLayout title="Kurti užsakymą">
      <SmartForm
        fields={fields}
        initialValues={initialValues}
        patchValues={patch}
        submitLabel="Sukurti"
        cancelLabel="Atšaukti"
        onCancel={() => navigate("/orderList")}
        onValuesChange={async (v) => {
          const cid = v.clientUserId;
          if (!cid) {
            lastClientIdRef.current = null;
            setPatch({
              deliveryAddress: "",
              city: "",
              country: "",
              vat: "",
              bankCode: null,
            });
            return;
          }

          if (lastClientIdRef.current === cid) return;
          lastClientIdRef.current = cid;

          try {
            const r = await fetch(`http://localhost:5065/api/orders/clientInfo/${cid}`);
            const text = await r.text();
            const data = text ? JSON.parse(text) : null;

            setPatch({
              deliveryAddress: data?.deliveryAddress ?? "",
              city: data?.city ?? "",
              country: data?.country ?? "",
              vat: data?.vat ?? "",
              bankCode: data?.bankCode ?? null,
            });
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
              })),
          };

          const res = await fetch("http://localhost:5065/api/orders/createOrder", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

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
