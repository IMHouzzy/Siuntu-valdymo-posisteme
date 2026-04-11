// pages/Dashboard.jsx
import { useState, useEffect, useCallback } from "react";
import {
  FiPackage, FiTruck, FiRotateCcw,
  FiRefreshCw, FiAlertTriangle,
  FiArrowUp, FiArrowDown, FiMinus, FiActivity,
} from "react-icons/fi";
import { FaEuroSign } from "react-icons/fa";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import "../styles/Dashboard.css";

const API = "http://localhost:5065";

// ── Palette ───────────────────────────────────────────────────────────────────
const ORDER_COLORS = {
  "Awaiting confirmation": "#d97706",
  "Cancelled":             "#dc2626",
  "Completed":             "#16a34a",
  "In progress":           "#1d4ed8",
  "Sent":                  "#7c3aed",
};

const SHIPMENT_COLORS = {
  "Sukurta":                "#64748b",
  "Vežama":                 "#1d4ed8",
  "Pristatyta":             "#16a34a",
  "Vėluoja":                "#dc2626",
  "Grąžinimas sukurtas":    "#f59e0b",
  "Grąžinimas vežamas":     "#8b5cf6",
  "Grąžinimas pristatytas": "#10b981",
  "Grąžinimas vėluoja":     "#ef4444",
};

const CHART_COLORS = ["#1d4ed8","#16a34a","#d97706","#7c3aed","#ef4444","#10b981","#f59e0b","#64748b"];

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(n, dec = 0) {
  if (n == null) return "—";
  return Number(n).toLocaleString("lt-LT", { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

// Formats chart axis / tooltip labels based on the active period.
// API label formats:
//   all   → "2023", "2024"        (year string)
//   year  → "2024-03"             (yyyy-MM)
//   month → "2024-03-15"          (yyyy-MM-dd)
//   week  → "2024-03-15"          (yyyy-MM-dd)
//   day   → "2024-03-15 14"       (yyyy-MM-dd HH)
function formatLabel(raw, period) {
  if (!raw) return "";

  if (period === "all") {
    return raw; // already "2023", "2024", …
  }

  if (period === "day") {
    const hour = raw.slice(-2);
    return `${hour}:00`;
  }

  if (period === "year") {
    // "yyyy-MM" — parse as first day of that month
    const d = new Date(`${raw}-01`);
    return d.toLocaleDateString("lt-LT", { month: "short" });
  }

  // week / month — "yyyy-MM-dd"
  const d = new Date(raw);
  return d.toLocaleDateString("lt-LT", { day: "2-digit", month: "short" });
}

// ── Custom Tooltip ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label, period, isCurrency }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="dash-tooltip">
      <div className="dash-tooltip-label">{formatLabel(label, period)}</div>
      {payload.map((p, i) => (
        <div key={i} className="dash-tooltip-row" style={{ color: p.color }}>
          <span>{p.name}:</span>
          <strong>{isCurrency ? `€${fmt(p.value, 2)}` : fmt(p.value)}</strong>
        </div>
      ))}
    </div>
  );
};

const PieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="dash-tooltip">
      <div className="dash-tooltip-row">
        <span>{name}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
};

// ── KPI Summary Card ──────────────────────────────────────────────────────────
function KpiCard({ icon, label, value, sub, accent, delta, loading, prefix = "" }) {
  const isPositive = delta > 0;
  const isNeutral  = delta === 0 || delta == null;

  return (
    <div className={`dash-kpi-card dash-kpi-card--${accent}`}>
      <div className="dash-kpi-header">
        <div className={`dash-kpi-icon dash-kpi-icon--${accent}`}>{icon}</div>
        {!loading && !isNeutral && (
          <div className={`dash-kpi-delta dash-kpi-delta--${isPositive ? "up" : "down"}`}>
            {isPositive ? <FiArrowUp size={11} /> : <FiArrowDown size={11} />}
            <span>{Math.abs(delta).toFixed(1)}%</span>
          </div>
        )}
        {!loading && isNeutral && delta != null && (
          <div className="dash-kpi-delta dash-kpi-delta--neutral">
            <FiMinus size={11} /><span>0%</span>
          </div>
        )}
      </div>
      <div className="dash-kpi-body">
        {loading
          ? <span className="dash-skeleton dash-skeleton--val" />
          : <div className="dash-kpi-value">{prefix}{value}</div>
        }
        <div className="dash-kpi-label">{label}</div>
        {sub && (
          loading
            ? <span className="dash-skeleton dash-skeleton--sub" />
            : <div className="dash-kpi-sub">{sub}</div>
        )}
      </div>
    </div>
  );
}

// ── Status Legend ─────────────────────────────────────────────────────────────
function StatusLegend({ items, colorMap }) {
  const total = items.reduce((s, x) => s + x.count, 0);
  return (
    <div className="dash-legend">
      {items.filter(x => x.count > 0).map((item) => (
        <div className="dash-legend-row" key={item.name}>
          <div className="dash-legend-left">
            <span className="dash-legend-dot" style={{ background: colorMap[item.name] ?? "#94a3b8" }} />
            <span className="dash-legend-name">{item.name}</span>
          </div>
          <div className="dash-legend-right">
            <span className="dash-legend-count">{item.count}</span>
            <div className="dash-legend-bar-wrap">
              <div
                className="dash-legend-bar"
                style={{
                  width: total > 0 ? `${(item.count / total) * 100}%` : "0%",
                  background: colorMap[item.name] ?? "#94a3b8",
                }}
              />
            </div>
            <span className="dash-legend-pct">
              {total > 0 ? `${Math.round((item.count / total) * 100)}%` : "0%"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Courier Rows ──────────────────────────────────────────────────────────────
function CourierRows({ items }) {
  if (!items?.length) return <div className="dash-empty">Nėra duomenų</div>;
  const max = Math.max(...items.map(x => x.count), 1);
  return (
    <div className="dash-courier-list">
      {items.map((item, i) => (
        <div className="dash-courier-row" key={item.courier}>
          <div className="dash-courier-rank">{i + 1}</div>
          <div className="dash-courier-info">
            <span className="dash-courier-name">{item.courier}</span>
            <div className="dash-courier-track">
              <div
                className="dash-courier-fill"
                style={{
                  width: `${(item.count / max) * 100}%`,
                  background: CHART_COLORS[i % CHART_COLORS.length],
                }}
              />
            </div>
          </div>
          <span className="dash-courier-count">{item.count}</span>
        </div>
      ))}
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [period,  setPeriod]  = useState("month");
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const load = useCallback(async (p) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/api/dashboard/stats?period=${p}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(period); }, [period, load]);

  const kpi = data?.kpi ?? {};

  // Merge orders + shipments over time by label (labels are guaranteed identical
  // for the same period since the controller fills every bucket)
  const overTimeData = (() => {
    if (!data) return [];
    const ott = new Map(data.orders.overTime.map(x => [x.label, x.count]));
    const rtt = new Map(data.orders.revenueOverTime.map(x => [x.label, x.revenue]));
    const stt = new Map(data.shipments.overTime.map(x => [x.label, x.count]));
    const labels = [...new Set([...ott.keys(), ...rtt.keys(), ...stt.keys()])].sort();
    return labels.map(l => ({
      label:     l,
      orders:    ott.get(l) ?? 0,
      revenue:   rtt.get(l) ?? 0,
      shipments: stt.get(l) ?? 0,
    }));
  })();

  const orderDonutData    = (data?.orders.byStatus    ?? []).filter(x => x.count > 0);
  const shipmentDonutData = (data?.shipments.byStatus ?? []).filter(x => x.count > 0);

  const PERIODS = [
    { key: "day",   label: "24h" },
    { key: "week",  label: "7d" },
    { key: "month", label: "30d" },
    { key: "year",  label: "1y" },
    { key: "all",   label: "Visas" },
  ];

  const periodLabel = {
    day:   "paskutinę parą",
    week:  "paskutines 7 dienas",
    month: "paskutinius 30 dienų",
    year:  "paskutinius 12 mėnesių",
    all:   "visą laikotarpį",
  }[period];

  return (
    <div className="dash-page">

      {/* ── Top bar ── */}
      <div className="dash-topbar">
        <div className="dash-topbar-left">
          <div className="dash-topbar-icon-wrap">
            <FiActivity size={18} />
          </div>
          <div>
            <h1 className="dash-topbar-title">Suvestinė</h1>
            <p className="dash-topbar-sub">Duomenys už {periodLabel}</p>
          </div>
        </div>
        <div className="dash-topbar-right">
          <div className="dash-period-tabs">
            {PERIODS.map(p => (
              <button
                key={p.key}
                className={`dash-period-tab${period === p.key ? " dash-period-tab--active" : ""}`}
                onClick={() => setPeriod(p.key)}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button
            className="dash-refresh-btn"
            onClick={() => load(period)}
            disabled={loading}
            title="Atnaujinti"
          >
            <FiRefreshCw size={14} className={loading ? "dash-spin" : ""} />
          </button>
        </div>
      </div>

      {error && (
        <div className="dash-error">
          <FiAlertTriangle size={16} />
          <span>Nepavyko įkelti duomenų: {error}</span>
        </div>
      )}

      {/* ── KPI Row ── */}
      <div className="dash-kpi-row">
        <KpiCard
          loading={loading}
          icon={<FiPackage size={25} />}
          label="Užsakymai"
          value={fmt(kpi.newOrdersInPeriod)}
          sub={`${fmt(kpi.totalOrders)} išviso per visą laikotarpį`}
          accent="blue"
          delta={null}
        />
        <KpiCard
          loading={loading}
          icon={<FaEuroSign size={25} />}
          label="Pajamos"
          prefix="€"
          value={fmt(kpi.periodRevenue, 2)}
          sub={`€${fmt(kpi.totalRevenue, 2)} išviso per visą laikotarpį`}
          accent="green"
          delta={null}
        />
        <KpiCard
          loading={loading}
          icon={<FiTruck size={25} />}
          label="Siuntos"
          value={fmt(kpi.newShipmentsInPeriod)}
          sub={`${fmt(kpi.deliverySuccessRate, 1)}% pristatyta laiku`}
          accent="purple"
          delta={null}
        />
        <KpiCard
          loading={loading}
          icon={<FiRotateCcw size={25} />}
          label="Grąžinimai"
          value={fmt(kpi.newReturnsInPeriod)}
          sub={`${fmt(kpi.pendingReturns)} laukia vertinimo`}
          accent="orange"
          delta={null}
        />
      </div>

      {/* ── Hero Chart ── */}
      <div className="dash-hero-card">
        <div className="dash-hero-header">
          <div>
            <div className="dash-hero-title">Veiklos apžvalga</div>
            <div className="dash-hero-sub">Užsakymai, pajamos ir siuntos per laikotarpį</div>
          </div>
          <div className="dash-hero-legend">
            <span className="dash-hero-leg-item">
              <span className="dash-hero-leg-dot" style={{ background: "#1d4ed8" }} />Užsakymai
            </span>
            <span className="dash-hero-leg-item">
              <span className="dash-hero-leg-dot" style={{ background: "#16a34a" }} />Siuntos
            </span>
          </div>
        </div>

        {loading
          ? <div className="dash-skeleton dash-skeleton--hero" />
          : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={overTimeData} barGap={1} barCategoryGap="30%">
                <defs>
                  <linearGradient id="gradOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#1d4ed8" stopOpacity={1} />
                    <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.7} />
                  </linearGradient>
                  <linearGradient id="gradShipments" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#16a34a" stopOpacity={1} />
                    <stop offset="100%" stopColor="#16a34a" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tickFormatter={l => formatLabel(l, period)}
                  tick={{ fontSize: 11, fill: "var(--color-text-muted)", fontFamily: "var(--font-family-mono)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--color-text-muted)", fontFamily: "var(--font-family-mono)" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip period={period} />} cursor={{ fill: "var(--color-bg)", radius: 4 }} />
                <Bar dataKey="orders"    name="Užsakymai" fill="url(#gradOrders)"    radius={[4,4,0,0]} />
                <Bar dataKey="shipments" name="Siuntos"   fill="url(#gradShipments)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )
        }

        {!loading && (
          <div className="dash-revenue-strip">
            <div className="dash-revenue-strip-label">
              <FaEuroSign size={12} />
              <span>Pajamos</span>
            </div>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={overTimeData}>
                <defs>
                  <linearGradient id="gradRevLine" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%"   stopColor="#16a34a" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#16a34a" stopOpacity={1} />
                  </linearGradient>
                </defs>
                <Line type="monotone" dataKey="revenue" name="Pajamos (€)" stroke="url(#gradRevLine)" strokeWidth={2} dot={false} />
                     <XAxis
                  dataKey="label"
                  tickFormatter={l => formatLabel(l, period)}
                  tick={{ fontSize: 11, fill: "var(--color-text-muted)", fontFamily: "var(--font-family-mono)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip period={period} isCurrency />} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* ── Orders + Shipments donuts ── */}
      <div className="dash-two-col-grid">

        <div className="dash-panel">
          <div className="dash-panel-header">
            <div className="dash-panel-icon dash-panel-icon--blue"><FiPackage size={18} /></div>
            <div>
              <div className="dash-panel-title">Užsakymų būsenos</div>
              <div className="dash-panel-sub">Visi užsakymai pagal statusą</div>
            </div>
          </div>
          {loading
            ? <div className="dash-skeleton dash-skeleton--chart" />
            : (
              <div className="dash-donut-layout">
                <div className="dash-donut-chart-wrap">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={orderDonutData}
                        dataKey="count" nameKey="name"
                        cx="50%" cy="75%"
                        startAngle={180} endAngle={0}
                        innerRadius={70} outerRadius={100}
                        paddingAngle={2}
                      >
                        {orderDonutData.map((e, i) => (
                          <Cell key={e.name} fill={ORDER_COLORS[e.name] ?? CHART_COLORS[i % CHART_COLORS.length]} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                      <text x="50%" y="73%" textAnchor="middle" dominantBaseline="middle" className="donut-center-value-half">
                        {fmt(kpi.totalOrders)}
                      </text>
                      <text x="50%" y="83%" textAnchor="middle" dominantBaseline="middle" className="donut-center-label-half">
                        iš viso
                      </text>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <StatusLegend items={data?.orders.byStatus ?? []} colorMap={ORDER_COLORS} />
              </div>
            )
          }
        </div>

        <div className="dash-panel">
          <div className="dash-panel-header">
            <div className="dash-panel-icon dash-panel-icon--purple"><FiTruck size={18} /></div>
            <div>
              <div className="dash-panel-title">Siuntų būsenos</div>
              <div className="dash-panel-sub">Visos siuntos pagal statusą</div>
            </div>
          </div>
          {loading
            ? <div className="dash-skeleton dash-skeleton--chart" />
            : (
              <div className="dash-donut-layout">
                <div className="dash-donut-chart-wrap">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={shipmentDonutData}
                        dataKey="count" nameKey="name"
                        cx="50%" cy="50%"
                        innerRadius={65} outerRadius={95}
                        paddingAngle={2}
                      >
                        {shipmentDonutData.map((e, i) => (
                          <Cell key={e.name} fill={SHIPMENT_COLORS[e.name] ?? CHART_COLORS[i % CHART_COLORS.length]} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                      <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle" className="donut-center-value-half">
                        {fmt(kpi.totalShipments)}
                      </text>
                      <text x="50%" y="56%" textAnchor="middle" dominantBaseline="middle" className="donut-center-label-half">
                        iš viso
                      </text>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <StatusLegend items={data?.shipments.byStatus ?? []} colorMap={SHIPMENT_COLORS} />
              </div>
            )
          }
        </div>

      </div>

      {/* ── Couriers + Returns ── */}
      <div className="dash-two-col-grid dash-two-col-grid--asymmetric">

        <div className="dash-panel">
          <div className="dash-panel-header">
            <div className="dash-panel-icon dash-panel-icon--teal"><FiTruck size={18} /></div>
            <div>
              <div className="dash-panel-title">Kurjeriai</div>
              <div className="dash-panel-sub">Populiariausi pagal siuntų kiekį</div>
            </div>
          </div>
          {loading
            ? <div className="dash-skeleton dash-skeleton--chart" />
            : <CourierRows items={data?.shipments.courierUsage} />
          }
        </div>

        <div className="dash-panel">
          <div className="dash-panel-header">
            <div className="dash-panel-icon dash-panel-icon--orange"><FiRotateCcw size={18} /></div>
            <div>
              <div className="dash-panel-title">Grąžinimų dinamika</div>
              <div className="dash-panel-sub">Grąžinimai per pasirinktą laikotarpį</div>
            </div>
          </div>
          {loading
            ? <div className="dash-skeleton dash-skeleton--chart" />
            : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={data?.returns.overTime ?? []}
                  barSize={period === "year" || period === "all" ? 22 : 14}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tickFormatter={l => formatLabel(l, period)}
                    tick={{ fontSize: 11, fill: "var(--color-text-muted)", fontFamily: "var(--font-family-mono)" }}
                    axisLine={false} tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "var(--color-text-muted)", fontFamily: "var(--font-family-mono)" }}
                    axisLine={false} tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip period={period} />} />
                  <defs>
                    <linearGradient id="gradReturns" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#d97706" stopOpacity={1} />
                      <stop offset="100%" stopColor="#d97706" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <Bar dataKey="count" name="Grąžinimai" fill="url(#gradReturns)" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )
          }
        </div>

      </div>

    </div>
  );
}