import "../../styles/Auth.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../../services/AuthContext";
import Logo from "../../images/Full_track_sync_logo2.png";

function Login() {
    const location = useLocation();
    const navigate = useNavigate();
    const { login, googleLogin } = useAuth();

    const [email, setEmail]       = useState("");
    const [password, setPassword] = useState("");
    const [error, setError]       = useState("");
    const [loading, setLoading]   = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await login(email, password);
            navigate("/");
        } catch (err) {
            setError(err.message || "Prisijungimas nepavyko.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async (credentialResponse) => {
        try {
            await googleLogin(credentialResponse.credential);
            navigate("/");
        } catch (err) {
            setError(err.message || "Google prisijungimas nepavyko.");
        }
    };

    return (
        <div className="login-container">
            <div className="login-wrapper">
                <img className="login-logo" src={Logo} alt="Logo" />
                <div className="login-select">
                    <Link
                        to="/login"
                        className={location.pathname === "/login" ? "login-select-button active" : "login-select-button"}>
                        Prisijungimas
                    </Link>
                    <Link
                        to="/register"
                        className={location.pathname === "/register" ? "register-select-button active" : "register-select-button"}>
                        Registracija
                    </Link>
                </div>

                <form className="login-form" onSubmit={handleLogin}>
                    <div className="form-group">
                        <input
                            type="email"
                            placeholder="El. paštas"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="password"
                            placeholder="Slaptažodis"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="forgot-password">
                        <Link to="/forgot-password">Pamiršote slaptažodį?</Link>
                    </div>

                    {error && (
                        <p style={{ color: "var(--color-danger)", fontSize: "0.8rem", margin: "4px 0" }}>
                            {error}
                        </p>
                    )}

                    <button type="submit" className="login-button" disabled={loading}>
                        {loading ? "Jungiamasi…" : "Prisijungti"}
                    </button>
                </form>

                <div className="other-login">
                    <div className="or-divider">
                        <span>Arba prisijunkite su</span>
                    </div>
                    <GoogleLogin
                        onSuccess={handleGoogleLogin}
                        onError={() => setError("Google prisijungimas nepavyko.")}
                    />
                </div>
            </div>
        </div>
    );
}

export default Login;