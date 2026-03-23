import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../services/AuthContext";
import { FiUser, FiChevronDown, FiSettings, FiLogOut } from "react-icons/fi";
import "../styles/SignInButtons.css";

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function SignInButtons() {
  const { token, logout, user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const displayName = user?.fullName || user?.name || "";
  const initials = getInitials(displayName);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/login");
  };

  return (
    <div
      className="sb-user-wrap"
      onMouseLeave={() => setOpen(false)}
    >
      <button
        className="sb-user-btn"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="sb-avatar">
          {token ? <span>{initials}</span> : <FiUser size={14} />}
        </div>

        {token && (
          <span className="sb-user-name">{displayName}</span>
        )}

        <FiChevronDown
          size={14}
          className={`sb-chev ${open ? "sb-chev--open" : ""}`}
        />
      </button>

      <div className={`sb-dropdown ${open ? "sb-dropdown--open" : ""}`}>
        {token ? (
          <>
            <div className="sb-dropdown-top">
              <div className="sb-dropdown-avatar">{initials}</div>
              <div>
                <div className="sb-dropdown-name">{displayName}</div>
                <div className="sb-dropdown-email">{user?.email || ""}</div>
              </div>
            </div>

            <div className="sb-dropdown-divider" />

            <button
              className="sb-dropdown-item"
              onClick={() => {
                setOpen(false);
                navigate("/settings");
              }}
            >
              <FiSettings size={14} />
              Profilis
            </button>

            <div className="sb-dropdown-divider" />

            <button
              className="sb-dropdown-logout"
              onClick={handleLogout}
            >
              <FiLogOut size={14} />
              Atsijungti
            </button>
          </>
        ) : (
          <div className="sb-dropdown-top">
            <div className="sb-dropdown-avatar">
              <FiUser size={14} />
            </div>
            <div>
              <div className="sb-dropdown-name">Svečias</div>
              <div className="sb-dropdown-email">
                Neprisijungęs vartotojas
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}