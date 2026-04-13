import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../services/AuthContext";
import { profileApi } from "../../services/api";
import {
    FiUser, FiLock, FiTrash2, FiChevronRight,
    FiEdit2, FiSave, FiX, FiMapPin, FiPhone,
    FiMail, FiBriefcase, FiShield, FiAlertTriangle, FiChevronDown, FiCheck
} from "react-icons/fi";
import { FaRegBuilding } from "react-icons/fa";
import "../../styles/Profile.css";

function getInitials(name = "") {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "U";
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function ProfileInfo({ profile, onSaved }) {
    const [editing, setEditing]           = useState(false);
    const [form, setForm]                 = useState({});
    const [saving, setSaving]             = useState(false);
    const [error, setError]               = useState("");
    const [success, setSuccess]           = useState("");
    const [openCompany, setOpenCompany]   = useState(null);
    const [clientForms, setClientForms]   = useState({});
    const [savingClient, setSavingClient] = useState(null);

    useEffect(() => {
        if (!profile) return;
        setForm({ name: profile.name || "", surname: profile.surname || "", phoneNumber: profile.phoneNumber || "" });
        const cf = {};
        (profile.memberships || []).forEach(m => {
            cf[m.companyId] = m.clientInfo
                ? { deliveryAddress: m.clientInfo.deliveryAddress || "", city: m.clientInfo.city || "", country: m.clientInfo.country || "", vat: m.clientInfo.vat || "", bankCode: m.clientInfo.bankCode || "" }
                : { deliveryAddress: "", city: "", country: "", vat: "", bankCode: "" };
        });
        setClientForms(cf);
    }, [profile]);

    const saveBaseInfo = async () => {
        setSaving(true); setError(""); setSuccess("");
        try {
            await profileApi.updateInfo(form);
            setSuccess("Informacija išsaugota.");
            setEditing(false);
            onSaved();
        } catch (e) { setError(e.message || "Klaida išsaugant."); }
        finally { setSaving(false); }
    };

    const saveClientInfo = async (companyId) => {
        setSavingClient(companyId);
        try {
            await profileApi.updateClient(companyId, clientForms[companyId]);
            onSaved();
        } catch (e) { setError(e.message || "Klaida išsaugant adresą."); }
        finally { setSavingClient(null); }
    };

    if (!profile) return <div className="prof-loading">Kraunama...</div>;
    const memberships = profile.memberships || [];

    return (
        <div className="prof-section">
            <div className="prof-hero">
                <div className="prof-avatar-lg">{getInitials(`${profile.name} ${profile.surname}`)}</div>
                <div>
                    <h2 className="prof-hero-name">{profile.name} {profile.surname}</h2>
                    <p className="prof-hero-email">{profile.email}</p>
                    <span className={`prof-provider-badge prof-provider--${(profile.authProvider || "LOCAL").toLowerCase()}`}>
                        {profile.authProvider === "GOOGLE" ? "Google paskyra" : "Vietinė paskyra"}
                    </span>
                </div>
                {!editing && <button className="prof-edit-btn" onClick={() => setEditing(true)}><FiEdit2 size={14} /> Redaguoti</button>}
            </div>

            <div className="prof-card">
                <div className="prof-card-header"><FiUser size={15} /><span>Asmeninė informacija</span></div>
                <div className="prof-fields">
                    <Field label="Vardas" icon={<FiUser size={13} />}>
                        {editing ? <input className="prof-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /> : <span>{profile.name}</span>}
                    </Field>
                    <Field label="Pavardė" icon={<FiUser size={13} />}>
                        {editing ? <input className="prof-input" value={form.surname} onChange={e => setForm(f => ({ ...f, surname: e.target.value }))} /> : <span>{profile.surname}</span>}
                    </Field>
                    <Field label="El. paštas" icon={<FiMail size={13} />}>
                        <span className="prof-readonly">{profile.email}</span>
                        <span className="prof-locked-hint">Neredaguojama</span>
                    </Field>
                    <Field label="Telefono nr." icon={<FiPhone size={13} />}>
                        {editing ? <input className="prof-input" value={form.phoneNumber} onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value }))} /> : <span>{profile.phoneNumber || <em className="prof-empty">Nenurodyta</em>}</span>}
                    </Field>
                </div>
                {editing && (
                    <div className="prof-actions">
                        {error && <p className="prof-error">{error}</p>}
                        <button className="prof-btn prof-btn--ghost" onClick={() => { setEditing(false); setError(""); }}><FiX size={14} /> Atšaukti</button>
                        <button className="prof-btn prof-btn--primary" onClick={saveBaseInfo} disabled={saving}><FiSave size={14} /> {saving ? "Saugoma…" : "Išsaugoti"}</button>
                    </div>
                )}
                {success && <p className="prof-success"><FiCheck size={13} /> {success}</p>}
            </div>

            {memberships.length > 0 && (
                <>
                    <h3 className="prof-section-label"><FaRegBuilding size={14} /> Įmonių duomenys</h3>
                    <div className="prof-company-grid">
                        {memberships.map(m => {
                            const isOpen = openCompany === m.companyId;
                            return (
                                <div key={m.companyId} className={`prof-card prof-card--company${isOpen ? " prof-card--company-open" : ""}`}>
                                    <button className="prof-company-toggle" onClick={() => setOpenCompany(isOpen ? null : m.companyId)}>
                                        <div className="prof-company-toggle-left">
                                            <FaRegBuilding size={15} />
                                            <div>
                                                <span className="prof-company-name">{m.companyName}</span>
                                                <span className="prof-role-badge">{m.role}</span>
                                            </div>
                                        </div>
                                        <FiChevronDown size={15} className={`prof-chevron${isOpen ? " prof-chevron--open" : ""}`} />
                                    </button>

                                    {isOpen && (
                                        <div className="prof-company-body">
                                            {(m.role === "STAFF" || m.role === "ADMIN" || m.role === "OWNER" || m.role === "COURIER") && (
                                                <div className="prof-subsection">
                                                    <h4 className="prof-subsection-title"><FiBriefcase size={13} /> Darbuotojo duomenys</h4>
                                                    <div className="prof-fields">
                                                        <Field label="Pareigos" icon={<FiBriefcase size={13} />}><span>{m.position || <em className="prof-empty">—</em>}</span></Field>
                                                        <Field label="Pradžios data" icon={<FiShield size={13} />}><span>{m.startDate ? new Date(m.startDate).toLocaleDateString("lt-LT") : <em className="prof-empty">—</em>}</span></Field>
                                                        <Field label="Statusas" icon={<FiShield size={13} />}>
                                                            <span className={`prof-status-dot ${m.active ? "prof-status--active" : "prof-status--inactive"}`}>{m.active ? "Aktyvus" : "Neaktyvus"}</span>
                                                        </Field>
                                                        <Field label="Rolė" icon={<FiShield size={13} />}>
                                                            <span className="prof-readonly">{m.role}</span>
                                                            <span className="prof-locked-hint">Neredaguojama</span>
                                                        </Field>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="prof-subsection">
                                                <h4 className="prof-subsection-title"><FiMapPin size={13} /> Kliento adresas šioje įmonėje</h4>
                                                <div className="prof-fields">
                                                    <Field label="Pristatymo adresas" icon={<FiMapPin size={13} />}>
                                                        <input className="prof-input" value={clientForms[m.companyId]?.deliveryAddress || ""} onChange={e => setClientForms(f => ({ ...f, [m.companyId]: { ...f[m.companyId], deliveryAddress: e.target.value } }))} placeholder="Gatvė, namas…" />
                                                    </Field>
                                                    <Field label="Miestas" icon={<FiMapPin size={13} />}>
                                                        <input className="prof-input" value={clientForms[m.companyId]?.city || ""} onChange={e => setClientForms(f => ({ ...f, [m.companyId]: { ...f[m.companyId], city: e.target.value } }))} placeholder="Miestas" />
                                                    </Field>
                                                    <Field label="Šalis" icon={<FiMapPin size={13} />}>
                                                        <input className="prof-input" value={clientForms[m.companyId]?.country || ""} onChange={e => setClientForms(f => ({ ...f, [m.companyId]: { ...f[m.companyId], country: e.target.value } }))} placeholder="Šalis" />
                                                    </Field>
                                                    <Field label="PVM kodas" icon={<FiShield size={13} />}>
                                                        <input className="prof-input" value={clientForms[m.companyId]?.vat || ""} onChange={e => setClientForms(f => ({ ...f, [m.companyId]: { ...f[m.companyId], vat: e.target.value } }))} placeholder="LT000000000" />
                                                    </Field>
                                                    <Field label="Banko kodas" icon={<FiShield size={13} />}>
                                                        <input className="prof-input" value={clientForms[m.companyId]?.bankCode || ""} onChange={e => setClientForms(f => ({ ...f, [m.companyId]: { ...f[m.companyId], bankCode: e.target.value } }))} placeholder="73000" type="number" />
                                                    </Field>
                                                </div>
                                                <div className="prof-actions">
                                                    <button className="prof-btn prof-btn--primary" onClick={() => saveClientInfo(m.companyId)} disabled={savingClient === m.companyId}>
                                                        <FiSave size={14} /> {savingClient === m.companyId ? "Saugoma…" : "Išsaugoti adresą"}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}

function ProfileSettings({ profile, onDeleted }) {
    const navigate = useNavigate();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting]                   = useState(false);
    const [deleteError, setDeleteError]             = useState("");

    const handleDelete = async () => {
        setDeleting(true); setDeleteError("");
        try {
            await profileApi.deleteAccount();
            onDeleted();
        } catch (e) {
            setDeleteError(e.message || "Klaida trinant paskyrą.");
            setDeleting(false);
        }
    };

    return (
        <div className="prof-section">
            <div className="prof-card">
                <div className="prof-card-header"><FiLock size={15} /><span>Slaptažodis</span></div>
                <p className="prof-card-desc">
                    Norėdami pakeisti slaptažodį, spauskite žemiau esantį mygtuką.
                    {profile?.authProvider === "GOOGLE" && <span className="prof-google-note"> Google paskyros slaptažodis keičiamas per Google.</span>}
                </p>
                <div className="prof-btn-wrap">
                    <button className="prof-btn prof-btn--secondary" onClick={() => navigate("/change-password")} disabled={profile?.authProvider === "GOOGLE"}>
                        <FiLock size={14} /> Keisti slaptažodį
                    </button>
                </div>
            </div>

            <div className="prof-card prof-card--danger">
                <div className="prof-card-header prof-card-header--danger"><FiAlertTriangle size={15} /><span>Pavojinga zona</span></div>
                <p className="prof-card-desc">Ištrynus paskyrą visi duomenys bus pašalinti visam laikui. Šio veiksmo atšaukti nebus galima.</p>
                <div className="prof-btn-wrap">
                    {!showDeleteConfirm ? (
                        <button className="prof-btn prof-btn--danger" onClick={() => setShowDeleteConfirm(true)}><FiTrash2 size={14} /> Ištrinti paskyrą</button>
                    ) : (
                        <div className="prof-delete-confirm">
                            <p className="prof-delete-warn"><FiAlertTriangle size={14} /> Ar tikrai norite ištrinti paskyrą? Šio veiksmo atšaukti nebus galima.</p>
                            {deleteError && <p className="prof-error">{deleteError}</p>}
                            <div className="prof-actions" style={{ padding: 0, border: "none", background: "none" }}>
                                <button className="prof-btn prof-btn--ghost" onClick={() => setShowDeleteConfirm(false)} disabled={deleting}><FiX size={14} /> Atšaukti</button>
                                <button className="prof-btn prof-btn--danger" onClick={handleDelete} disabled={deleting}><FiTrash2 size={14} /> {deleting ? "Trinama…" : "Taip, ištrinti"}</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function Field({ label, icon, children }) {
    return (
        <div className="prof-field">
            <span className="prof-field-label">{icon}{label}</span>
            <div className="prof-field-value">{children}</div>
        </div>
    );
}

const NAV = [
    { id: "info",     label: "Profilio informacija", icon: FiUser },
    { id: "settings", label: "Nustatymai",           icon: FiLock },
];

export default function ProfilePage() {
    const { logout } = useAuth();
    const navigate   = useNavigate();
    const location   = useLocation();

    const hashPage = location.hash.replace("#", "") || "info";
    const [page, setPage]             = useState(NAV.find(n => n.id === hashPage) ? hashPage : "info");
    const [profile, setProfile]       = useState(null);
    const [loading, setLoading]       = useState(true);
    const [fetchError, setFetchError] = useState("");

    const fetchProfile = useCallback(async () => {
        try {
            setProfile(await profileApi.get());
        } catch {
            setFetchError("Nepavyko įkelti profilio duomenų.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchProfile(); }, [fetchProfile]);

    const handleNav = (id) => { setPage(id); navigate(`#${id}`, { replace: true }); };

    return (
        <div className="prof-layout">
            <div className="prof-wrapper">
                <aside className="prof-sidebar">
                    <div className="prof-sidebar-top">
                        <div className="prof-sidebar-avatar">{getInitials(`${profile?.name || ""} ${profile?.surname || ""}`)}</div>
                        <div className="prof-sidebar-meta">
                            <span className="prof-sidebar-name">{profile ? `${profile.name} ${profile.surname}` : "…"}</span>
                            <span className="prof-sidebar-email">{profile?.email || ""}</span>
                        </div>
                    </div>
                    <nav className="prof-nav">
                        {NAV.map(({ id, label, icon: Icon }) => (
                            <button key={id} className={`prof-nav-item ${page === id ? "prof-nav-item--active" : ""}`} onClick={() => handleNav(id)}>
                                <Icon size={15} /><span>{label}</span>
                                <FiChevronRight size={13} className="prof-nav-arrow" />
                            </button>
                        ))}
                    </nav>
                </aside>

                <main className="prof-main">
                    <div className="prof-main-header">
                        <h1 className="prof-main-title">{NAV.find(n => n.id === page)?.label}</h1>
                    </div>
                    {loading ? (
                        <div className="prof-loading"><div className="prof-spinner" /><span>Kraunama…</span></div>
                    ) : fetchError ? (
                        <div className="prof-error-state">{fetchError}</div>
                    ) : page === "info" ? (
                        <ProfileInfo profile={profile} onSaved={fetchProfile} />
                    ) : (
                        <ProfileSettings profile={profile} onDeleted={() => { logout(); navigate("/login"); }} />
                    )}
                </main>
            </div>
        </div>
    );
}