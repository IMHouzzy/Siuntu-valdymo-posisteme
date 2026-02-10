import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../services/AuthContext";
import "../styles/SignInButtons.css";

function SignInButtons() {
    const { token, logout } = useAuth();
    const navigate = useNavigate();
    const { login } = useAuth();
    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="auth-buttons">
            {!token ? (
                <>
                    <Link to="/login"><button className="signin-button-login">Prisijungti</button></Link>
                    <Link to="/register"><button className="signup-button-register">Registruotis</button></Link>
                </>
            ) : (
                <button className="logout-button" onClick={handleLogout}>
                    Atsijungti
                </button>
            )}
        </div>
    );
}

export default SignInButtons;
