import "../styles/StatusBadge.css";

const STATUS_KEY = (statusName) => {
  const s = (statusName || "").toLowerCase().trim();

  if (s === "awaiting confirmation") return "awaiting";
  if (s === "cancelled") return "cancelled";
  if (s === "completed") return "completed";
  if (s === "in progress") return "progress";
  if (s === "sent") return "sent";

  if (s === "sukurta") return "created";
  if (s === "pristatyta") return "delivered";
  if (s === "vėluoja") return "late";
  if (s === "vežama") return "intransit";
  if (s === "grąžinimas sukurtas") return "return-created";
  if (s === "grąžinimas vežamas") return "return-intransit";
  if (s === "grąžinimas vėluoja") return "return-late";
  if (s === "grąžinimas pristatytas") return "return-delivered";

  return "default";
};

export default function StatusBadge({ status }) {
  const key = STATUS_KEY(status);

  return <span className={`status-badge status-${key}`}>{status || "Unknown"}</span>;
}
