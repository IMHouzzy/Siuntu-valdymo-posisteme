import "../../styles/Auth.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../../services/AuthContext";
import Logo from "../../images/Full_track_sync_logo2.png";
import { authValidation } from "./authValidation";

function Register() {
    const location = useLocation();
    const navigate = useNavigate();
    const { register, googleLogin } = useAuth();

    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [serverError, setServerError] = useState("");
    const [loading, setLoading] = useState(false);

    // Real-time validation as user types (only for touched fields)
    const validateField = (fieldName, value) => {
        const formData = {
            name,
            surname,
            email,
            password,
            confirmPassword,
            [fieldName]: value,
        };
        
        const allErrors = authValidation.validateRegisterForm(formData);
        
        setErrors(prev => ({
            ...prev,
            [fieldName]: allErrors[fieldName] || null,
        }));
    };

    const handleBlur = (fieldName) => {
        setTouched(prev => ({ ...prev, [fieldName]: true }));
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setServerError("");

        // Mark all fields as touched
        setTouched({
            name: true,
            surname: true,
            email: true,
            password: true,
            confirmPassword: true,
        });

        // Validate all fields
        const validationErrors = authValidation.validateRegisterForm({
            name,
            surname,
            email,
            password,
            confirmPassword,
        });

        setErrors(validationErrors);

        // Stop if there are validation errors
        if (Object.keys(validationErrors).length > 0) {
            return;
        }

        setLoading(true);
        try {
            await register({ name, surname, email, password });
            navigate("/client");
        } catch (err) {
            setServerError(err.message || "Registracija nepavyko.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleRegister = async (credentialResponse) => {
        try {
            await googleLogin(credentialResponse.credential);
            navigate("/client");
        } catch (err) {
            setServerError(err.message || "Google registracija nepavyko.");
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
                        <input
                            type="text"
                            placeholder="Vardas"
                            value={name}
                            onChange={e => {
                                setName(e.target.value);
                                if (touched.name) validateField("name", e.target.value);
                            }}
                            onBlur={() => handleBlur("name")}
                            className={touched.name && errors.name ? "error" : ""}
                        />
                        {touched.name && errors.name && (
                            <span className="error-text">{errors.name}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Pavardė"
                            value={surname}
                            onChange={e => {
                                setSurname(e.target.value);
                                if (touched.surname) validateField("surname", e.target.value);
                            }}
                            onBlur={() => handleBlur("surname")}
                            className={touched.surname && errors.surname ? "error" : ""}
                        />
                        {touched.surname && errors.surname && (
                            <span className="error-text">{errors.surname}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <input
                            type="email"
                            placeholder="El. paštas"
                            value={email}
                            onChange={e => {
                                setEmail(e.target.value);
                                if (touched.email) validateField("email", e.target.value);
                            }}
                            onBlur={() => handleBlur("email")}
                            className={touched.email && errors.email ? "error" : ""}
                        />
                        {touched.email && errors.email && (
                            <span className="error-text">{errors.email}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <input
                            type="password"
                            placeholder="Slaptažodis"
                            value={password}
                            onChange={e => {
                                setPassword(e.target.value);
                                if (touched.password) validateField("password", e.target.value);
                                // Also revalidate confirmation if it was touched
                                if (touched.confirmPassword) validateField("confirmPassword", confirmPassword);
                            }}
                            onBlur={() => handleBlur("password")}
                            className={touched.password && errors.password ? "error" : ""}
                        />
                        {touched.password && errors.password && (
                            <span className="error-text">{errors.password}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <input
                            type="password"
                            placeholder="Pakartokite slaptažodį"
                            value={confirmPassword}
                            onChange={e => {
                                setConfirmPassword(e.target.value);
                                if (touched.confirmPassword) validateField("confirmPassword", e.target.value);
                            }}
                            onBlur={() => handleBlur("confirmPassword")}
                            className={touched.confirmPassword && errors.confirmPassword ? "error" : ""}
                        />
                        {touched.confirmPassword && errors.confirmPassword && (
                            <span className="error-text">{errors.confirmPassword}</span>
                        )}
                    </div>

                    {serverError && (
                        <p style={{ color: "var(--color-danger)", fontSize: "0.8rem", margin: "4px 0" }}>
                            {serverError}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading || Object.keys(errors).some(key => errors[key])}
                    >
                        {loading ? "Registruojama…" : "Registruotis"}
                    </button>
                </form>

                <div className="other-login">
                    <div className="or-divider">
                        <span>Arba registruokitės su</span>
                    </div>
                    <GoogleLogin
                        onSuccess={handleGoogleRegister}
                        onError={() => setServerError("Google registracija nepavyko.")}
                    />
                </div>
            </div>
        </div>
    );
}

export default Register;