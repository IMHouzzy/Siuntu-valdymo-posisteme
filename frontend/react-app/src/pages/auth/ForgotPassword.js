import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { resetApi } from "../../services/api";
import "../../styles/Auth.css";
import Logo from "../../images/Full_track_sync_logo2.png";
import { authValidation } from "./authValidation";

function ForgotPassword() {
    const navigate = useNavigate();
    
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [serverError, setServerError] = useState("");

    // Real-time validation
    const validateField = (fieldName, value) => {
        const formData = { email: value };
        const allErrors = authValidation.validateForgotPasswordForm(formData);
        
        setErrors(prev => ({
            ...prev,
            [fieldName]: allErrors[fieldName] || null,
        }));
    };

    const handleBlur = (fieldName) => {
        setTouched(prev => ({ ...prev, [fieldName]: true }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError("");

        // Mark field as touched
        setTouched({ email: true });

        // Validate
        const validationErrors = authValidation.validateForgotPasswordForm({ email });
        setErrors(validationErrors);

        // Stop if there are validation errors
        if (Object.keys(validationErrors).length > 0) {
            return;
        }

        setLoading(true);
        try {
            await resetApi.request(email);
            setSent(true); // always show success — server never reveals if email exists
        } catch {
            setServerError("Įvyko klaida. Bandykite dar kartą.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-wrapper">
                <img className="login-logo" src={Logo} alt="Logo" />
                <div className="login-header">
                    <h2>Slaptažodžio atstatymas</h2>
                </div>

                {sent ? (
                    <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
                        <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", lineHeight: 1.6, margin: "0 0 16px" }}>
                            Jei šis el. pašto adresas yra registruotas sistemoje, išsiuntėme
                            nuorodą slaptažodžiui atstatyti. Patikrinkite savo pašto dėžutę.
                        </p>
                        <button
                            className="login-button"
                            style={{ background: "none", color: "var(--color-primary)", border: "1px solid var(--color-primary)" }}
                            onClick={() => navigate("/login")}
                        >
                            Grįžti į prisijungimą
                        </button>
                    </div>
                ) : (
                    <form className="login-form" onSubmit={handleSubmit}>
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
                        <span className="sub-text">* Įveskite paskyros el. paštą</span>

                        {serverError && (
                            <p style={{ color: "var(--color-danger)", fontSize: "0.8rem", margin: "4px 0" }}>
                                {serverError}
                            </p>
                        )}

                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading || (errors.email && touched.email)}
                        >
                            {loading ? "Siunčiama…" : "Siųsti nuorodą"}
                        </button>
                        <button
                            type="button"
                            className="login-button"
                            style={{ background: "none", color: "var(--color-primary)", border: "1px solid var(--color-primary)", marginTop: 4 }}
                            onClick={() => navigate("/login")}
                        >
                            Atgal
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default ForgotPassword;