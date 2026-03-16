// pages/Shipments/ShipmentFormPage.jsx

import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FormPageLayout from "../../components/FormPageLayout";
import SmartForm from "../../components/SmartForm";
import ShipmentLabels from "../../components/ShipmentLabels";
import "../../styles/ShipmentRegistration.css";
import { FiTruck, FiUser, FiPackage, FiMapPin, FiArrowLeft  } from "react-icons/fi";
import { useAuth } from "../../services/AuthContext";

const API = "http://localhost:5065";
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

export default function ShipmentFormPage() {
  const [patchValues, setPatchValues] = useState({});
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { activeCompanyId } = useAuth();

  const [order, setOrder] = useState(null);
  const [couriers, setCouriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCourier, setSelectedCourier] = useState(null);
  const [createdShipment, setCreatedShipment] = useState(null);
  const prevCourierIdRef = React.useRef(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!activeCompanyId) return;
    Promise.all([
      fetch(`${API}/api/shipments/order-for-shipment/${orderId}`, { headers: auth() })
        .then((r) => { if (!r.ok) throw new Error(`${r.status}`); return r.json(); }),
      fetch(`${API}/api/companies/${activeCompanyId}/couriers`, { headers: auth() })
        .then((r) => { if (!r.ok) throw new Error(`${r.status}`); return r.json(); }),
    ])
      .then(([ord, crs]) => { setOrder(ord); setCouriers(Array.isArray(crs) ? crs : []); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [orderId, activeCompanyId]);

  // ── Derived flags ─────────────────────────────────────────────────────────
  const needsLockerPicker = !!selectedCourier?.supportsLockers;
  const needsHomeAddress = selectedCourier?.type?.endsWith("_HOME") &&
    selectedCourier?.type !== "CUSTOM";

  // ── Client address prefill ────────────────────────────────────────────────
  const clientAddress = useMemo(() => {
    if (!order) return {};
    const cc = order.clientCompany ?? {};
    return { street: cc.deliveryAddress || "", city: cc.city || "", country: cc.country || "" };
  }, [order]);

  // ── onValuesChange ────────────────────────────────────────────────────────
  // IMPORTANT: wrap all setState calls in setTimeout(fn, 0).
  // onValuesChange is called from inside SmartForm's setField state-updater,
  // so calling setState synchronously here triggers React's
  // "Cannot update a component while rendering a different component" warning.
  const handleValuesChange = (vals) => {
    setTimeout(() => {
      const c = couriers.find((c) => (c.id ?? c.id_Courier) === vals.courierId);
      setSelectedCourier(c ?? null);

      // When courier changes, clear deliveryCoords so stale locker/address
      // data from the previous courier doesn't get submitted
      const courierChanged = prevCourierIdRef.current !== vals.courierId;
      prevCourierIdRef.current = vals.courierId;

      const patch = {};
      if (courierChanged) patch.deliveryCoords = null;
      if (c?.deliveryTermDays && vals.shippingDate) {
        const d = new Date(vals.shippingDate);
        d.setDate(d.getDate() + c.deliveryTermDays);
        patch.estimatedDeliveryDate = d.toISOString().slice(0, 10);
      }
      setPatchValues(patch);
    }, 0);
  };

  // ── Fields ────────────────────────────────────────────────────────────────
  const fields = useMemo(() => {
    if (!order) return [];
    const client = order.client ?? {};

    return [
      // 1. Courier cards
      { type: "section", title: <span><FiTruck size={18} /> Kurjeris</span> },
      {
        name: "courierId",
        label: null,
        type: "courier-cards",
        colSpan: 2,
        couriers,
        onSelect: (c) => {
          setTimeout(() => setSelectedCourier(c), 0);
        },
      },

      // 2. Delivery location
      {
        type: "section",
        title: <span><FiMapPin size={18} /> Pristatymo vieta</span>,
        subtitle: needsLockerPicker
          ? "Pasirinkite paštomatą arba siuntų tašką"
          : "Pristatymo vieta pagal kliento adresą",
      },

      // Locker picker — parcel-machine couriers
      ...(needsLockerPicker ? [{
        name: "deliveryCoords",
        label: null,
        type: "locker-picker",
        colSpan: 2,
        courierType: selectedCourier?.type,
        companyId: activeCompanyId,
      }] : []),

      // Address + map — home-delivery and custom couriers
      ...(!needsLockerPicker ? [
        { name: "street", label: "Gatvė", placeholder: "pvz. Studentų g. 50", colSpan: 1, required: true },
        {
          name: "city", label: "Miestas", placeholder: "pvz. Kaunas", required: true,
          validate: (v) => (!v?.trim() ? "Privalomas miestas" : undefined)
        },
        { name: "country", label: "Šalis", placeholder: "pvz. Lietuva", required: true },
        {
          name: "postalCode", label: "Pašto kodas", placeholder: "pvz. LT-44001", required: true,
          validate: (v) => (!v?.trim() ? "Privalomas pašto kodas" : undefined)
        },
        {
          name: "deliveryCoords",
          label: null,
          type: "map",
          colSpan: 2,
          getAddress: (vals) => [vals.street, vals.city, vals.country].filter(Boolean).join(", "),
        },
      ] : []),

      // Dates
      { name: "shippingDate", label: "Siuntimo data", type: "date", required: true },
      { name: "estimatedDeliveryDate", label: "Numatoma pristatymo", type: "display", placeholder: "—" },

      // 3. Recipient info (read-only)
      { type: "section", title: <span><FiUser size={18} /> Gavėjas</span> },
      {
        name: "_clientName", label: "Vardas pavardė", type: "display", colSpan: 2,
        render: () => `${client.name ?? ""} ${client.surname ?? ""}`.trim() || "—"
      },
      {
        name: "_clientPhone", label: "Telefonas", type: "display",
        render: () => client.phoneNumber || "—"
      },
      {
        name: "_clientEmail", label: "El. paštas", type: "display",
        render: () => client.email || "—"
      },

      // 4. Products + packages
      { type: "section", title: <span><FiPackage size={18} /> Prekės ir pakuotės</span> },
      {
        name: "_products", label: null, type: "product-view", colSpan: 2,
        getItems: () => order.items ?? []
      },
      { type: "section", title: <span><FiPackage size={18} /> Pakuotės</span> },
      
      { name: "packages", type: "packages", colSpan: 2 },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order, couriers, needsLockerPicker, needsHomeAddress, selectedCourier, activeCompanyId]);

  // ── Initial values ────────────────────────────────────────────────────────
  const initialValues = useMemo(() => ({
    courierId: null,
    deliveryCoords: null,
    street: clientAddress.street || "",
    city: clientAddress.city || "",
    country: clientAddress.country || "",
    postalCode: "",
    shippingDate: new Date().toISOString().slice(0, 10),
    estimatedDeliveryDate: "",
    _clientName: "",
    _clientPhone: "",
    _clientEmail: "",
    _products: [],
    packages: [{ weight: "" }],
  }), [clientAddress]);

  // ── States ────────────────────────────────────────────────────────────────
  if (loading) return (
    <FormPageLayout title="Registruoti siuntą" actions={<button className="od-back-btn" onClick={() => navigate(-1)}><FiArrowLeft size={16} /> Grįžti</button>}>
      <div className="shp-state"><div className="shp-spinner" /><span>Kraunama…</span></div>
    </FormPageLayout>
  );

  if (error || !order) return (
    <FormPageLayout title="Registruoti siuntą"actions={<button className="od-back-btn" onClick={() => navigate(-1)}><FiArrowLeft size={16} /> Grįžti</button>} >
      <div className="shp-state shp-state--error">⚠️ {error ?? "Užsakymas nerastas."}</div>
    </FormPageLayout>
  );

  if (createdShipment) return (
    <FormPageLayout title={`Siuntos etiketės — #${createdShipment.trackingNumber}`}>
      <ShipmentLabels
        shipmentId={createdShipment.shipmentId}
        trackingNumber={createdShipment.trackingNumber}
        packages={createdShipment.packages}
        onClose={() => navigate(-1)}
      />
    </FormPageLayout>
  );

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (values) => {
    const pkgs = Array.isArray(values.packages) ? values.packages : [{ weight: "" }];

    // deliveryCoords shape depends on which picker was used:
    //   map picker    → { lat, lng }  OR  { latitude, longitude }  OR  { position: { lat, lng } }
    //   locker picker → { lockerId, lat, lng }
    // Be defensive about all known shapes.
    const coords = values.deliveryCoords;
    const deliveryLat =
      coords?.lat ??
      coords?.latitude ??
      coords?.position?.lat ??
      null;
    const deliveryLng =
      coords?.lng ??
      coords?.longitude ??
      coords?.position?.lng ??
      null;

    // Debug — remove once confirmed working
    console.log("[ShipmentForm] deliveryCoords raw:", coords);
    console.log("[ShipmentForm] resolved lat/lng:", deliveryLat, deliveryLng);

    const body = {
      orderId: Number(orderId),
      courierId: values.courierId ?? null,
      shippingDate: values.shippingDate || null,
      estimatedDeliveryDate: values.estimatedDeliveryDate || null,
      deliveryLat,
      deliveryLng,
      packageCount: pkgs.length,
      lockerId: coords?.lockerId ?? null,
      recipientPostalCode: values.postalCode || null,
      recipientCity: values.city || null,
      recipientStreet: values.street || null,
      senderStreet: order?.shippingStreet || order?.shippingAddress || null,
      senderCity: order?.shippingCity || null,
      senderPostalCode: order?.shippingPostalCode || null,
      packageWeightKg: pkgs[0]?.weight ? Number(pkgs[0].weight) : null,
      packageWeights: pkgs.map((p) => p.weight ? Number(p.weight) : null),
    };

    const res = await fetch(`${API}/api/shipments/create`, {
      method: "POST",
      headers: { ...auth(), "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) { const msg = await res.text(); throw new Error(msg || `Klaida: ${res.status}`); }
    setCreatedShipment(await res.json());
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <FormPageLayout title={`Registruoti siuntą — Užsakymas #${order.id_Orders ?? orderId}`} actions={<button className="od-back-btn" onClick={() => navigate(-1)}><FiArrowLeft size={16} /> Grįžti</button>}>
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