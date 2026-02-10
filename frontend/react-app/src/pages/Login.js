import "../styles/Auth.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../services/AuthContext";

function Login() {
    const location = useLocation();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login } = useAuth();

    const handleLogin = async (e) => {
        
        e.preventDefault();
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            login(data.token);
            navigate("/");
        } catch (err) {
            console.error(err);
        }
    };

    const handleGoogleLogin = async (credentialResponse) => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/auth/google`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idToken: credentialResponse.credential }),
            });
            const data = await res.json();
            login(data.token);
            navigate("/");
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="login-container">
            <div className="login-wrapper">
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
                        <input type="email" placeholder="El.paštas" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <input type="password" placeholder="Slaptažodis" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                    <div className="forgot-password">
                        <Link to="#">Pamiršote slaptažodį?</Link>
                    </div>

                    <button type="submit" className="login-button">Prisijungti</button>
                </form>

                <div className="other-login">
                    <div className="or-divider">
                        <span>Arba prisijunkite su</span>
                    </div>

                    <GoogleLogin
                        onSuccess={handleGoogleLogin}
                        onError={() => console.log("Google login failed")}
                    />
                </div>
            </div>
        </div>
    );
}

export default Login;
