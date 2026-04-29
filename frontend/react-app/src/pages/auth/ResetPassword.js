import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { resetApi } from "../../services/api";
import "../../styles/Auth.css";
import Logo from "../../images/Full_track_sync_logo2.png";
import { authValidation } from "./authValidation";

function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token") || "";

    const [status, setStatus] = useState("validating");
    const [form, setForm] = useState({ newPassword: "", repeat: "" });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [serverError, setServerError] = useState("");
    const [loading, setLoading] = useState(false);

    // Validate token on mount
    useEffect(() => {
        if (!token) { setStatus("invalid"); return; }

        resetApi.validate(token)
            .then(() => setStatus("valid"))
            .catch(err => {
                setStatus(err.message?.includes("410") || err.message?.includes("pasibaigė")
                    ? "expired"
                    : "invalid");
            });
    }, [token]);

    // Real-time validation
    const validateField = (fieldName, value) => {
        const formData = {
            ...form,
            [fieldName]: value,
        };
        
        const allErrors = authValidation.validateResetPasswordForm(formData);
        
        setErrors(prev => ({
            ...prev,
            [fieldName]: allErrors[fieldName] || null,
        }));
    };

    const handleBlur = (fieldName) => {
        setTouched(prev => ({ ...prev, [fieldName]: true }));
    };

    const handleChange = (fieldName, value) => {
        setForm(prev => ({ ...prev, [fieldName]: value }));
        if (touched[fieldName]) validateField(fieldName, value);
        
        // Revalidate repeat when newPassword changes
        if (fieldName === "newPassword" && touched.repeat) {
            validateField("repeat", form.repeat);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError("");

        // Mark all fields as touched
        setTouched({ newPassword: true, repeat: true });

        // Validate all fields
        const validationErrors = authValidation.validateResetPasswordForm(form);
        setErrors(validationErrors);

        // Stop if there are validation errors
        if (Object.keys(validationErrors).length > 0) {
            return;
        }

        setLoading(true);
        try {
            await resetApi.confirm(token, form.newPassword);
            setStatus("done");
        } catch (err) {
            setServerError(err.message || "Klaida keičiant slaptažodį.");
        } finally {
            setLoading(false);
        }
    };

    if (status === "validating") return (
        <div className="login-container"><div className="login-wrapper">
            <img className="login-logo" src={Logo} alt="Logo" />
            <p style={{ textAlign: "center", color: "var(--color-text-muted)", fontSize: "0.875rem" }}>Tikrinama nuoroda…</p>
        </div></div>
    );

    if (status === "invalid") return (
        <div className="login-container"><div className="login-wrapper">
            <img className="login-logo" src={Logo} alt="Logo" />
            <div className="login-header"><h2>Negaliojanti nuoroda</h2></div>
            <p style={{ textAlign: "center", fontSize: "0.875rem", color: "var(--color-text-secondary)", padding: "0 0 12px" }}>
                Ši nuoroda negaliojanti arba jau panaudota.
            </p>
            <button className="login-button" onClick={() => navigate("/forgot-password")}>Gauti naują nuorodą</button>
        </div></div>
    );

    if (status === "expired") return (
        <div className="login-container"><div className="login-wrapper">
            <img className="login-logo" src={Logo} alt="Logo" />
            <div className="login-header"><h2>Nuoroda pasibaigė</h2></div>
            <p style={{ textAlign: "center", fontSize: "0.875rem", color: "var(--color-text-secondary)", padding: "0 0 12px" }}>
                Ši nuoroda galiojo 1 valandą ir jau nebegalioja.
            </p>
            <button className="login-button" onClick={() => navigate("/forgot-password")}>Gauti naują nuorodą</button>
        </div></div>
    );

    if (status === "done") return (
        <div className="login-container"><div className="login-wrapper">
            <img className="login-logo" src={Logo} alt="Logo" />
            <div className="login-header"><h2>Slaptažodis pakeistas</h2></div>
            <p style={{ textAlign: "center", fontSize: "0.875rem", color: "var(--color-text-secondary)", padding: "0 0 12px" }}>
                Jūsų slaptažodis sėkmingai pakeistas.
            </p>
            <button className="login-button" onClick={() => navigate("/login")}>Prisijungti</button>
        </div></div>
    );

    return (
        <div className="login-container">
            <div className="login-wrapper">
                <img className="login-logo" src={Logo} alt="Logo" />
                <div className="login-header"><h2>Naujas slaptažodis</h2></div>
                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="password"
                            placeholder="Naujas slaptažodis"
                            value={form.newPassword}
                            onChange={e => handleChange("newPassword", e.target.value)}
                            onBlur={() => handleBlur("newPassword")}
                            className={touched.newPassword && errors.newPassword ? "error" : ""}
                        />
                        {touched.newPassword && errors.newPassword && (
                            <span className="error-text">{errors.newPassword}</span>
                        )}
                        {!errors.newPassword && touched.newPassword && form.newPassword && (
                            <span className="help-text" style={{ color: "var(--color-text-muted)", fontSize: "0.75rem" }}>
                                Min. 8 simboliai, 1 didžioji, 1 mažoji raidė, 1 skaičius
                            </span>
                        )}
                    </div>

                    <div className="form-group">
                        <input
                            type="password"
                            placeholder="Pakartokite slaptažodį"
                            value={form.repeat}
                            onChange={e => handleChange("repeat", e.target.value)}
                            onBlur={() => handleBlur("repeat")}
                            className={touched.repeat && errors.repeat ? "error" : ""}
                        />
                        {touched.repeat && errors.repeat && (
                            <span className="error-text">{errors.repeat}</span>
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
                        {loading ? "Keičiama…" : "Pakeisti slaptažodį"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ResetPassword;