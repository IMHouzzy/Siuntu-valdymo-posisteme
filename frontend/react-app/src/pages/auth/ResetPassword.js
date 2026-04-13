import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { resetApi } from "../../services/api";
import "../../styles/Auth.css";
import Logo from "../../images/Full_track_sync_logo2.png";

function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token") || "";

    const [status, setStatus]   = useState("validating"); // validating | valid | invalid | expired | done
    const [form, setForm]       = useState({ newPassword: "", repeat: "" });
    const [error, setError]     = useState("");
    const [loading, setLoading] = useState(false);

    // Validate token on mount
    useEffect(() => {
        if (!token) { setStatus("invalid"); return; }

        resetApi.validate(token)
            .then(() => setStatus("valid"))
            .catch(err => {
                // api.js throws with the server's text as the message
                setStatus(err.message?.includes("410") || err.message?.includes("pasibaigė")
                    ? "expired"
                    : "invalid");
            });
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (form.newPassword.length < 8) { setError("Slaptažodis turi būti bent 8 simbolių."); return; }
        if (form.newPassword !== form.repeat) { setError("Slaptažodžiai nesutampa."); return; }

        setLoading(true);
        try {
            await resetApi.confirm(token, form.newPassword);
            setStatus("done");
        } catch (err) {
            setError(err.message || "Klaida keičiant slaptažodį.");
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
                            onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="password"
                            placeholder="Pakartokite slaptažodį"
                            value={form.repeat}
                            onChange={e => setForm(f => ({ ...f, repeat: e.target.value }))}
                            required
                        />
                    </div>
                    {error && <p style={{ color: "var(--color-danger)", fontSize: "0.8rem", margin: "4px 0" }}>{error}</p>}
                    <button type="submit" className="login-button" disabled={loading}>
                        {loading ? "Keičiama…" : "Pakeisti slaptažodį"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ResetPassword;