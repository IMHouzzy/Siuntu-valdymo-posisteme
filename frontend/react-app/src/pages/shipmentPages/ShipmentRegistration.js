import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FormPageLayout from "../../components/FormPageLayout";
import SmartForm from "../../components/SmartForm";
import ShipmentLabels from "../../components/ShipmentLabels";
import "../../styles/ShipmentRegistration.css";
import { FiTruck, FiUser, FiPackage, FiMapPin, FiBox } from "react-icons/fi";
const API = "http://localhost:5065";
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

export default function ShipmentFormPage() {
  const [patchValues, setPatchValues] = useState({});
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [couriers, setCouriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // After successful creation we show the labels panel
  const [createdShipment, setCreatedShipment] = useState(null); // { shipmentId, trackingNumber, packages }

  // ── Fetch order + couriers ────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/shipments/order-for-shipment/${orderId}`, { headers: auth() }).then((r) => {
        if (!r.ok) throw new Error(`Order fetch failed: ${r.status}`);
        return r.json();
      }),
      fetch(`${API}/api/shipments/couriers`, { headers: auth() }).then((r) => r.json()),
    ])
      .then(([ord, crs]) => {
        setOrder(ord);
        setCouriers(Array.isArray(crs) ? crs : []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [orderId]);

  const handleValuesChange = (vals) => {
    const courier = couriers.find((c) => c.id_Courier == vals.courierId);
    if (!courier?.deliveryTermDays || !vals.shippingDate) return;

    const shipping = new Date(vals.shippingDate);
    shipping.setDate(shipping.getDate() + courier.deliveryTermDays);

    setPatchValues({ estimatedDeliveryDate: shipping.toISOString().slice(0, 10) });
  };

  // ── Delivery address string ───────────────────────────────────────────────
  const deliveryAddress = useMemo(() => {
    if (!order) return "";
    const cc = order.clientCompany ?? {};
    return [cc.deliveryAddress, cc.city, cc.country].filter(Boolean).join(", ");
  }, [order]);

  // ── SmartForm fields ──────────────────────────────────────────────────────
  const fields = useMemo(() => {
    if (!order) return [];

    const client = order.client ?? {};
    const cc = order.clientCompany ?? {};

    return [
      // ── Client info ───────────────────────────────────────────────────────
      {
        type: "section", title: (<span><FiUser size={20} /> Kliento informacija</span>)
      },
      {
        name: "_clientName", label: "Klientas", type: "display",
        render: () => `${client.name ?? ""} ${client.surname ?? ""}`.trim() || "—",
      },
      { name: "_clientEmail", label: "El. paštas", type: "display", render: () => client.email || "—" },
      { name: "_clientPhone", label: "Telefonas", type: "display", render: () => client.phoneNumber || "—" },
      { name: "_clientVat", label: "PVM kodas", type: "display", render: () => cc.vat || "—" },
      { name: "deliveryAddress", label: "Pristatymo adresas", colSpan: 2, placeholder: "Įveskite adresą" },

      // ── Products ──────────────────────────────────────────────────────────
      { type: "section",  title: (<span><FiPackage size={20} /> Prekės</span>) },
      { name: "_products", label: null, type: "product-view", colSpan: 2, getItems: () => order.items ?? [] },

      // ── Map ───────────────────────────────────────────────────────────────
      {
        type: "section",
         title: (<span><FiMapPin size={20} /> Pristatymo vieta</span>),
        subtitle: "Pristatymo vieta pažymima pagal adresą automatiškai",
      },
      { name: "deliveryCoords", label: null, type: "map", colSpan: 2, getAddress: (values) => values.deliveryAddress },

      // ── Shipment data ─────────────────────────────────────────────────────
      { type: "section", title: (<span><FiTruck size={20} /> Siuntos duomenys</span>) },
      {
        name: "courierId", label: "Kurjeris", type: "select", required: true,
        options: couriers.map((c) => ({
          value: c.id_Courier,
          label: c.deliveryPrice != null
            ? `${c.name} — €${c.deliveryPrice}${c.deliveryTermDays ? ` (${c.deliveryTermDays} d.)` : ""}`
            : c.name,
        })),
      },
      { name: "shippingDate", label: "Siuntimo data", type: "date", required: true },
      {
        name: "estimatedDeliveryDate", label: "Numatoma pristatymo data",
        type: "display", colSpan: 2, placeholder: "Pasirinkite siuntimo datą ir kurjerį",
      },

      // ── Packages ──────────────────────────────────────────────────────────
      { type: "section", title: (<span><FiBox size={20} /> Siuntos duomenys</span>) },
      {
        name: "packageCount",
        label: "Pakuočių skaičius",
        type: "number",
        required: true,
        placeholder: "1",
        validate: (v) => {
          const n = Number(v);
          if (!v && v !== 0) return "Privaloma";
          if (!Number.isInteger(n) || n < 1) return "Turi būti bent 1";
          if (n > 99) return "Maksimalus skaičius — 99";
          return undefined;
        },
      },
    ];
  }, [order, couriers]);

  // ── Initial values ────────────────────────────────────────────────────────
  const initialValues = useMemo(() => ({
    _clientName: "", _clientEmail: "", _clientPhone: "", _clientVat: "", _products: [],
    deliveryAddress: deliveryAddress || "",
    deliveryCoords: null,
    courierId: "",
    shippingDate: new Date().toISOString().slice(0, 10),
    estimatedDeliveryDate: "",
    packageCount: 1,
  }), [deliveryAddress]);

  // ── Loading / error states ────────────────────────────────────────────────
  if (loading) {
    return (
      <FormPageLayout title="Registruoti siuntą">
        <div className="shp-state"><div className="shp-spinner" /><span>Kraunama…</span></div>
      </FormPageLayout>
    );
  }

  if (error || !order) {
    return (
      <FormPageLayout title="Registruoti siuntą">
        <div className="shp-state shp-state--error">⚠️ {error ?? "Užsakymas nerastas."}</div>
      </FormPageLayout>
    );
  }

  // ── After creation — show labels ──────────────────────────────────────────
  if (createdShipment) {
    return (
      <FormPageLayout title={`Siuntos etiketės — #${createdShipment.trackingNumber}`}>
        <ShipmentLabels
          shipmentId={createdShipment.shipmentId}
          trackingNumber={createdShipment.trackingNumber}
          packages={createdShipment.packages}
          onClose={() => navigate(-1)}
        />
      </FormPageLayout>
    );
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (values) => {
    const body = {
      orderId: Number(orderId),
      courierId: Number(values.courierId),
      shippingDate: values.shippingDate || null,
      estimatedDeliveryDate: values.estimatedDeliveryDate || null,
      deliveryLat: values.deliveryCoords?.lat ?? null,
      deliveryLng: values.deliveryCoords?.lng ?? null,
      packageCount: Number(values.packageCount) || 1,
    };

    const res = await fetch(`${API}/api/shipments/create`, {
      method: "POST",
      headers: { ...auth(), "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || `Klaida: ${res.status}`);
    }

    const data = await res.json();
    // data: { shipmentId, trackingNumber, packageCount, packages: [{ id_Package, labelFile, packageIndex }] }
    setCreatedShipment(data);
  };

  return (
    <FormPageLayout title={`Registruoti siuntą — Užsakymas #${order.id_Orders ?? orderId}`}>
      <SmartForm
        fields={fields}
        initialValues={initialValues}
        patchValues={patchValues}
        submitLabel="Registruoti siuntą"
        cancelLabel="Atšaukti"
        onCancel={() => navigate(-1)}
        onSubmit={handleSubmit}
        onValuesChange={handleValuesChange}
      />
    </FormPageLayout>
  );
}