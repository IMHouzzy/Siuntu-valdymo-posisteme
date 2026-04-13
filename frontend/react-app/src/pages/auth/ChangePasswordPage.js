import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { profileApi } from "../../services/api";
import "../../styles/Auth.css";
import Logo from "../../images/Full_track_sync_logo2.png";

function ChangePassword() {
    const navigate = useNavigate();

    const [form, setForm]       = useState({ currentPassword: "", newPassword: "", repeat: "" });
    const [error, setError]     = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(""); setSuccess("");

        if (form.newPassword.length < 8) { setError("Naujas slaptažodis turi būti bent 8 simbolių."); return; }
        if (form.newPassword !== form.repeat) { setError("Slaptažodžiai nesutampa."); return; }

        setLoading(true);
        try {
            await profileApi.changePassword(form.currentPassword, form.newPassword);
            setSuccess("Slaptažodis sėkmingai pakeistas.");
            setTimeout(() => navigate(-1), 1500);
        } catch (err) {
            setError(err.message || "Klaida keičiant slaptažodį.");
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
                            onChange={e => setForm(f => ({ ...f, currentPassword: e.target.value }))}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="password"
                            placeholder="Naujas slaptažodis"
                            value={form.newPassword}
                            onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="password"
                            placeholder="Pakartokite naują slaptažodį"
                            value={form.repeat}
                            onChange={e => setForm(f => ({ ...f, repeat: e.target.value }))}
                            required
                        />
                    </div>

                    {error   && <p style={{ color: "var(--color-danger)", fontSize: "0.8rem", margin: "4px 0" }}>{error}</p>}
                    {success && <p style={{ color: "var(--color-accent)", fontSize: "0.8rem", margin: "4px 0" }}>{success}</p>}

                    <button type="submit" className="login-button" disabled={loading}>
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