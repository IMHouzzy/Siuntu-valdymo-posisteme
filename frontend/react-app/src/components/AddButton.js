import { FiPlus } from "react-icons/fi";
import "../styles/AddButton.css";

export default function AddButton({
  label = "Add",
  onClick,
  fullWidth = false,
  disabled = false,
}) {
  return (
    <button
      type="button"
      className={`add-btn ${fullWidth ? "is-full" : ""}`}
      onClick={onClick}
      disabled={disabled}
    >
      <FiPlus className="add-btn-icon" />
      <span>{label}</span>
    </button>
  );
}