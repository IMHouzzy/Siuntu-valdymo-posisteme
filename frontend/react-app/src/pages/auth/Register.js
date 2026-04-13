import "../../styles/Auth.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../../services/AuthContext";
import Logo from "../../images/Full_track_sync_logo2.png";

function Register() {
    const location = useLocation();
    const navigate = useNavigate();
    const { register, googleLogin } = useAuth();

    const [name, setName]                   = useState("");
    const [surname, setSurname]             = useState("");
    const [email, setEmail]                 = useState("");
    const [password, setPassword]           = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError]                 = useState("");
    const [loading, setLoading]             = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Slaptažodžiai nesutampa.");
            return;
        }

        setLoading(true);
        try {
            await register({ name, surname, email, password });
            navigate("/");
        } catch (err) {
            setError(err.message || "Registracija nepavyko.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleRegister = async (credentialResponse) => {
        try {
            await googleLogin(credentialResponse.credential);
            navigate("/");
        } catch (err) {
            setError(err.message || "Google registracija nepavyko.");
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

                <form className="login-form" onSubmit={handleRegister}>
                    <div className="form-group">
                        <input type="text" placeholder="Vardas" value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <input type="text" placeholder="Pavardė" value={surname} onChange={e => setSurname(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <input type="email" placeholder="El. paštas" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <input type="password" placeholder="Slaptažodis" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <input type="password" placeholder="Pakartokite slaptažodį" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                    </div>

                    {error && (
                        <p style={{ color: "var(--color-danger)", fontSize: "0.8rem", margin: "4px 0" }}>
                            {error}
                        </p>
                    )}

                    <button type="submit" className="login-button" disabled={loading}>
                        {loading ? "Registruojama…" : "Registruotis"}
                    </button>
                </form>

                <div className="other-login">
                    <div className="or-divider">
                        <span>Arba registruokitės su</span>
                    </div>
                    <GoogleLogin
                        onSuccess={handleGoogleRegister}
                        onError={() => setError("Google registracija nepavyko.")}
                    />
                </div>
            </div>
        </div>
    );
}

export default Register;