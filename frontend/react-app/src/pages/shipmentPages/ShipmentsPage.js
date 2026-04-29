import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../../components/DataTable";
import RightDrawer from "../../components/RightDrawers/RightDrawerSidebar";
import StatusBadge from "../../components/StatusBadge";
import TableToolbar from "../../components/TableToolbar";
import { FiTrash2, FiMapPin, FiDownload, FiExternalLink, FiPackage } from "react-icons/fi";
import { useAuth } from "../../services/AuthContext";
import { shipmentsApi } from "../../services/api";
import "../../styles/UserPage.css";

const API = (process.env.REACT_APP_API_URL || "/api").replace(/\/api\/?$/, "");

function ShipmentsList() {
  const navigate = useNavigate();
  const { activeCompanyId } = useAuth();

  const [shipments, setShipments] = useState([]);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [packages, setPackages] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");


  useEffect(() => {
    if (!activeCompanyId) return;
    setShipments([]);
    setSelectedShipment(null);
    setPackages([]);
    shipmentsApi.getAll().then(setShipments).catch(console.error);
  }, [activeCompanyId]);

  // REPLACE second useEffect (packages):
  useEffect(() => {
    if (!selectedShipment) { setPackages([]); return; }
    setLoadingPackages(true);
    shipmentsApi.getPackages(selectedShipment.id_Shipment)
      .then(setPackages)
      .catch(() => setPackages([]))
      .finally(() => setLoadingPackages(false));
  }, [selectedShipment?.id_Shipment]);

  // REPLACE deleteShipment:
  const deleteShipment = async (s) => {
    if (!window.confirm(`Ištrinti siuntą užsakymui #${s.orderId}?`)) return;
    try {
      await shipmentsApi.remove(s.id_Shipment);
      setShipments(prev => prev.filter(x => x.id_Shipment !== s.id_Shipment));
      setSelectedShipment(null);
      setPackages([]);
    } catch { alert("Ištrinti nepavyko"); }
  };

  const statusFilters = useMemo(() => {
    const map = new Map();
    for (const s of shipments) {
      const key = s.latestStatus?.typeName || "Nežinoma";
      map.set(key, (map.get(key) || 0) + 1);
    }
    const items = [{ label: "Visi", value: "all", count: shipments.length }];
    Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0], "lt"))
      .forEach(([name, count]) => items.push({ label: name, value: name, count }));
    return items;
  }, [shipments]);

  const filtered = useMemo(() => {
    const byStatus = shipments.filter((s) =>
      statusFilter === "all" ? true : (s.latestStatus?.typeName || "Nežinoma") === statusFilter
    );
    const term = q.trim().toLowerCase();
    if (!term) return byStatus;
    return byStatus.filter((s) =>
      // Search by order ID, courier, status, dates, and also providerParcelNumber
      // (individual package tracking numbers are loaded lazily so not searched here)
      [s.id_Shipment, s.orderId, s.courier?.name, s.latestStatus?.typeName,
      s.shippingDate, s.estimatedDeliveryDate, s.providerParcelNumber]
        .some(v => String(v ?? "").toLowerCase().includes(term))
    );
  }, [shipments, q, statusFilter]);

  const columns = useMemo(() => [
    {
      key: "shipment",
      header: "Siunta",
      sortable: true,
      accessor: (s) => s.orderId,
      cell: (_v, s) => (
        <div className="dt-cell-stack">
          {/* Show providerParcelNumber (all DPD parcel numbers) or shipment ID */}
          <div className="dt-cell-primary" style={{ fontFamily: "var(--font-family-mono)", fontSize: "0.8rem" }}>
            {s.providerParcelNumber
              // If multiple parcel numbers, show first + count badge
              ? (() => {
                const nums = s.providerParcelNumber.split(",");
                return nums.length > 1
                  ? <>{nums[0]} <span className="dt-badge">+{nums.length - 1}</span></>
                  : nums[0];
              })()
              : `#${s.id_Shipment}`
            }
          </div>
          <div className="dt-cell-secondary">Užsakymas #{s.orderId}</div>
        </div>
      ),
    },
    {
      key: "courier",
      header: "Kurjeris",
      sortable: true,
      accessor: (s) => s.courier?.name ?? "—",
      cell: (_v, s) => (
        <div className="dt-cell-stack">
          <div className="dt-cell-primary">{s.courier?.name ?? "—"}</div>
          <div className="dt-cell-secondary">
            {s.courier?.deliveryPrice != null ? `€${Number(s.courier.deliveryPrice).toFixed(2)}` : ""}
          </div>
        </div>
      ),
    },
    {
      key: "shippingDate",
      header: "Siuntimo data",
      sortable: true,
      accessor: (s) => s.shippingDate ? new Date(s.shippingDate) : null,
      cell: (v) => v ? v.toLocaleDateString("lt-LT") : "—",
    },
    {
      key: "estimatedDeliveryDate",
      header: "Pristatymo data",
      sortable: true,
      accessor: (s) => s.estimatedDeliveryDate ? new Date(s.estimatedDeliveryDate) : null,
      cell: (v) => v ? v.toLocaleDateString("lt-LT") : "—",
    },
    {
      key: "status",
      header: "Būsena",
      sortable: true,
      accessor: (s) => s.latestStatus?.typeName ?? "Nežinoma",
      cell: (_v, s) => <StatusBadge status={s.latestStatus?.typeName ?? "Nežinoma"} />,
    },
    {
      key: "location",
      header: "Vieta",
      sortable: false,
      cell: (_v, s) =>
        s.DeliveryLat && s.DeliveryLng ? (
          <a className="dt-map-link"
            href={`https://www.google.com/maps?q=${s.DeliveryLat},${s.DeliveryLng}`}
            target="_blank" rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}>
            <FiMapPin size={13} /> Žemėlapis
          </a>
        ) : <span className="dt-cell-secondary">—</span>,
    },

    {
      key: "actions",
      header: "",
      width: 60,
      align: "right",
      cell: (_v, s) => (
        <div className="dt-actions">
          <button className="dt-icon-btn" title="Peržiūrėti"
            onClick={(e) => { e.stopPropagation(); navigate(`/orders/${s.orderId}/detail`); }}>
            <FiExternalLink />
          </button>
          <button className="dt-icon-btn danger" title="Ištrinti"
            onClick={(e) => { e.stopPropagation(); deleteShipment(s); }}>
            <FiTrash2 />
          </button>
        </div>
      ),
    },
  ], [shipments]);

  // ── Drawer hero ───────────────────────────────────────────────────
  const shipmentHero = useMemo(() => {
    if (!selectedShipment) return null;
    const s = selectedShipment;

    // Primary display: first parcel number if available, else shipment ID
    const primaryRef = s.providerParcelNumber
      ? s.providerParcelNumber.split(",")[0]
      : `#${s.id_Shipment}`;

    return (
      <>
        <div className="shipment-header-wrapper">
          <div>
            <div className="rd-title" style={{ fontFamily: "var(--font-family-mono)" }}>
              {primaryRef}
            </div>
            <div className="shipment-status-bar">
              <div className="rd-subtitle">Užsakymas #{s.orderId}</div>
              {s.shippingDate && (
                <span className="shipment-date-small">
                  {new Date(s.shippingDate).toLocaleDateString("lt-LT")}
                </span>
              )}
              <StatusBadge status={s.latestStatus?.typeName ?? "Nežinoma"} />
            </div>
          </div>
          <div className="shipment-hero-actions">

            <button className="rd-action-btn" title="Peržiūrėti"
              onClick={() => navigate(`/orders/${s.orderId}/detail`)}>
              <FiExternalLink size={18} />
            </button>
            <button className="rd-action-btn danger" title="Ištrinti"
              onClick={() => deleteShipment(s)}>
              <FiTrash2 size={18} />
            </button>
          </div>
        </div>

        <div className="shipment-dates">
          <div className="shipment-date-card">
            <div className="shipment-date-label">Siuntimo data</div>
            <div className="shipment-date-value">
              {s.shippingDate ? new Date(s.shippingDate).toLocaleDateString("lt-LT") : "—"}
            </div>
          </div>
          <div className="shipment-date-card">
            <div className="shipment-date-label">Numatoma pristatymo</div>
            <div className="shipment-date-value">
              {s.estimatedDeliveryDate
                ? new Date(s.estimatedDeliveryDate).toLocaleDateString("lt-LT")
                : "—"}
            </div>
          </div>
        </div>
      </>
    );
  }, [selectedShipment]);

  // ── Drawer sections ───────────────────────────────────────────────
  const drawerSections = useMemo(() => {
    if (!selectedShipment) return [];
    const s = selectedShipment;

    const shipmentRows = [
      { label: "Siuntos ID", value: `#${s.id_Shipment}` },
      { label: "Užsakymas", value: `#${s.orderId}` },
      // Show all parcel numbers if multiple, otherwise single value
      ...(s.providerParcelNumber ? [{
        label: "Sekimo nr.",
        value: (() => {
          const nums = s.providerParcelNumber.split(",").map(n => n.trim()).filter(Boolean);
          return nums.length === 1
            ? <span style={{ fontFamily: "var(--font-family-mono)", fontSize: "0.85rem" }}>{nums[0]}</span>
            : (
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {nums.map((n, i) => (
                  <span key={i} style={{ fontFamily: "var(--font-family-mono)", fontSize: "0.82rem" }}>
                    {n}
                  </span>
                ))}
              </div>
            );
        })(),
      }] : []),

    ];

    const courierRows = s.courier ? [
      { label: "Pavadinimas", value: s.courier.name ?? "—" },
      {
        label: "Pristatymo kaina",
        value: s.courier.deliveryPrice != null
          ? `€${Number(s.courier.deliveryPrice).toFixed(2)}` : "—"
      },
    ] : [];

    const packagesSection = {
      title: "Pakuotės ir etiketės",
      rows: loadingPackages
        ? [{ label: "Kraunama…", value: "" }]
        : packages.length === 0
          ? []
          : [{
            label: null,
            value: (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {packages.map((p, i) => {
                  const href = p.labelFile
                    ? (p.labelFile.startsWith("http") ? p.labelFile : `${API}${p.labelFile}`)
                    : null;
                  return (
                    <div key={p.id_Package ?? i} className="rd-package-card">
                      <div className="rd-package-index">
                        {i + 1}
                      </div>
                      <div className="rd-package-info" style={{ flex: 1, minWidth: 0 }}>
                        {/* Package tracking number — primary identifier */}
                        {p.trackingNumber ? (
                          <div style={{
                            fontFamily: "var(--font-family-mono)",
                            fontSize: "0.78rem",
                            fontWeight: "var(--font-semibold)",
                            color: "var(--color-text-primary)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}>
                            {p.trackingNumber}
                          </div>
                        ) : (
                          <div style={{
                            fontSize: "var(--text-sm)",
                            fontWeight: "var(--font-medium)",
                            color: "var(--color-text-primary)",
                          }}>
                            Paketas {i + 1}
                          </div>
                        )}
                        <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
                          <span className="rd-package-id">#{p.id_Package}</span>
                          {p.weight != null && (
                            <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
                              {Number(p.weight).toFixed(2)} kg
                            </span>
                          )}
                        </div>
                      </div>
                      {href ? (
                        <a className="rd-package-label-link"
                          href={href} target="_blank" rel="noopener noreferrer" download>
                          <FiDownload size={11} /> Etiketė
                        </a>
                      ) : (
                        <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
                          Nėra etiketės
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ),
          }],
      emptyText: "Paketų nerasta.",
    };

    return [
      { title: "Siuntos informacija", rows: shipmentRows },
      { title: "Kurjeris", rows: courierRows, emptyText: "Kurjeris nepriskirtas." },
      packagesSection,
    ];
  }, [selectedShipment, packages, loadingPackages]);

  return (
    <div className="user-cointainer">
      <TableToolbar
        title="Siuntos"
        searchValue={q}
        onSearchChange={setQ}
        filters={statusFilters}
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
        connectBottom
      />
      <DataTable
        columns={columns}
        rows={filtered}
        pageSize={25}
        getRowId={(s) => s.id_Shipment}
        onRowClick={(s) => setSelectedShipment(s)}
        emptyText="Nėra siuntų"
        initialSort={{ key: "shippingDate", dir: "desc" }}
      />
      <RightDrawer
        variant="shipment"
        open={!!selectedShipment}
        title={
          selectedShipment?.providerParcelNumber
            ? selectedShipment.providerParcelNumber.split(",")[0]
            : `#${selectedShipment?.id_Shipment ?? ""}`
        }
        subtitle={selectedShipment ? `Užsakymas #${selectedShipment.orderId}` : ""}
        hero={shipmentHero}
        sections={drawerSections}
        onClose={() => { setSelectedShipment(null); setPackages([]); }}
        actions={
          selectedShipment ? (
            <>
              <button className="rd-action-btn" title="Atidaryti užsakymą"
                onClick={() => navigate(`/orders/${selectedShipment.orderId}/shipment/new`)}>
                <FiExternalLink size={15} />
              </button>
              <button className="rd-action-btn danger" title="Ištrinti"
                onClick={() => deleteShipment(selectedShipment)}>
                <FiTrash2 size={15} />
              </button>
            </>
          ) : null
        }
      />
    </div>
  );
}

export default ShipmentsList;
