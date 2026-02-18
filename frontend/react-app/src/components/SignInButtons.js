import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../services/AuthContext";
import { useState } from "react";
import "../styles/SignInButtons.css";
import { FiUser, FiChevronDown, FiSettings } from "react-icons/fi";

function getInitials(name = "") {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "";
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function SignInButtons() {
    const { token, logout, user } = useAuth(); // <-- make sure your context provides user
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const displayName = user?.fullName || "";
    const initials = getInitials(displayName);

    const handleLogout = () => {
        logout();
        setOpen(false);
        navigate("/login");
    };

    return (
        <div className="signin-container" onMouseLeave={() => setOpen(false)}>
            <button
                className="signin-trigger"
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={open}
            >
                <span className={`avatar-circle ${token ? "is-logged" : ""}`}>
                    {token ? (
                        <span className="avatar-initials">{initials || "U"}</span>
                    ) : (
                        <FiUser size={16} />
                    )}
                </span>

                {token && <span className="user-name">{displayName}</span>}

                <FiChevronDown size={16} className={`chev ${open ? "open" : ""}`} />
            </button>

            <div className={`signin-content ${open ? "open" : ""}`} role="menu">
                {!token ? (
                    <div className="menu-header">

                        <h4>Sveiki, svečias!</h4>
                        <div className="menu-divider" />

                        <Link to="/login" className="menu-btn" onClick={() => setOpen(false)}>
                            Prisijungti
                        </Link>
                        <Link to="/register" className="menu-btn secondary" onClick={() => setOpen(false)}>
                            Registruotis
                        </Link>

                    </div>
                ) : (
                    <div className="menu-header">
                        <h4>Sveiki, {displayName}!</h4>
                        <div className="menu-divider" />
                          <Link to="/settings" className="menu-link" onClick={() => setOpen(false)}>
                            <FiSettings />
                            Nustatymai
                        </Link>
                        <div className="menu-divider" />
                        <button className="menu-btn danger" onClick={handleLogout}>
                            Atsijungti
                        </button>

                        

                      
                        {/* add more */}
                        {/* <Link to="/profile" className="menu-link" onClick={() => setOpen(false)}>Profilis</Link> */}
                    </div>
                )}
            </div>
        </div>
    );
}

export default SignInButtons;