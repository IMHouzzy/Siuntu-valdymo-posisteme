import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { profileApi } from "../../services/api";
import "../../styles/Auth.css";
import Logo from "../../images/Full_track_sync_logo2.png";
import { authValidation } from "./authValidation";

function ChangePassword() {
    const navigate = useNavigate();

    const [form, setForm] = useState({ currentPassword: "", newPassword: "", repeat: "" });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [serverError, setServerError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    // Real-time validation
    const validateField = (fieldName, value) => {
        const formData = {
            ...form,
            [fieldName]: value,
        };
        
        const allErrors = authValidation.validateChangePasswordForm(formData);
        
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
        setSuccess("");

        // Mark all fields as touched
        setTouched({
            currentPassword: true,
            newPassword: true,
            repeat: true,
        });

        // Validate all fields
        const validationErrors = authValidation.validateChangePasswordForm(form);
        setErrors(validationErrors);

        // Stop if there are validation errors
        if (Object.keys(validationErrors).length > 0) {
            return;
        }

        setLoading(true);
        try {
            await profileApi.changePassword(form.currentPassword, form.newPassword);
            setSuccess("Slaptažodis sėkmingai pakeistas.");
            setTimeout(() => navigate(-1), 1500);
        } catch (err) {
            setServerError(err.message || "Klaida keičiant slaptažodį.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-wrapper">
                <img className="login-logo" src={Logo} alt="Logo" />
                <div className="login-header">
                    <h2>Slaptažodžio keitimas</h2>
                </div>
                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="password"
                            placeholder="Dabartinis slaptažodis"
                            value={form.currentPassword}
                            onChange={e => handleChange("currentPassword", e.target.value)}
                            onBlur={() => handleBlur("currentPassword")}
                            className={touched.currentPassword && errors.currentPassword ? "error" : ""}
                        />
                        {touched.currentPassword && errors.currentPassword && (
                            <span className="error-text">{errors.currentPassword}</span>
                        )}
                    </div>

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
                            placeholder="Pakartokite naują slaptažodį"
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
                    {success && (
                        <p style={{ color: "var(--color-accent)", fontSize: "0.8rem", margin: "4px 0" }}>
                            {success}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading || Object.keys(errors).some(key => errors[key])}
                    >
                        {loading ? "Keičiama…" : "Keisti slaptažodį"}
                    </button>
                    <button
                        type="button"
                        className="login-button"
                        style={{ background: "none", color: "var(--color-primary)", border: "1px solid var(--color-primary)", marginTop: 4 }}
                        onClick={() => navigate(-1)}
                    >
                        Atgal
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ChangePassword;