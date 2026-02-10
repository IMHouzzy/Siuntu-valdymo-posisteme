import "../styles/Auth.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../services/AuthContext";

function Register() {
    const location = useLocation();
    const navigate = useNavigate();
    const { login } = useAuth();

    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleRegister = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, surname, email, password }),
            });
            const data = await res.json();
            login(data.token);
            navigate("/");
        } catch (err) {
            console.error(err);
        }
    };

    const handleGoogleRegister = async (credentialResponse) => {
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

                <form className="login-form" onSubmit={handleRegister}>
                    <div className="form-group">
                        <input type="text" placeholder="Vardas" value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <input type="text" placeholder="Pavardė" value={surname} onChange={e => setSurname(e.target.value)} required />
                    </div>

                    <div className="form-group">
                        <input type="email" placeholder="El.paštas" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <input type="password" placeholder="Slaptažodis" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <input type="password" placeholder="Pakartokite slaptažodį" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                    </div>

                    <button type="submit" className="login-button">Registruotis</button>
                </form>

                <div className="other-login">
                    <div className="or-divider">
                        <span>Arba registruokitės su</span>
                    </div>

                    <GoogleLogin
                        onSuccess={handleGoogleRegister}
                        onError={() => console.log("Google registration failed")}
                    />
                </div>
            </div>
        </div>
    );
}

export default Register;
