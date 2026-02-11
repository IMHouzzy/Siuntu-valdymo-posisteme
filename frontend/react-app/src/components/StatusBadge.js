import "../styles/StatusBadge.css";

const STATUS_KEY = (statusName) => {
  const s = (statusName || "").toLowerCase().trim();

  if (s === "awaiting confirmation") return "awaiting";
  if (s === "cancelled") return "cancelled";
  if (s === "completed") return "completed";
  if (s === "in progress") return "progress";
  if (s === "sent") return "sent";

  return "default";
};

export default function StatusBadge({ status }) {
  const key = STATUS_KEY(status);

  return <span className={`status-badge status-${key}`}>{status || "Unknown"}</span>;
}
