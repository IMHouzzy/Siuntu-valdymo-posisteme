// pages/userCrud/ProfilePage.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../services/AuthContext";
import { profileApi } from "../../services/api";
import ClientOrders from "../../components/ClientOrdersPage";
import NotificationsPanel from "../../components/ProfileNotifications";
import {
    FiUser, FiLock, FiTrash2, FiChevronRight,
    FiEdit2, FiSave, FiX, FiMapPin, FiPhone,
    FiMail, FiBriefcase, FiShield, FiAlertTriangle,
    FiChevronDown, FiCheck, FiShoppingCart, FiSettings, FiBell,
} from "react-icons/fi";
import { FaRegBuilding } from "react-icons/fa";
import "../../styles/Profile.css";

function getInitials(name = "") {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "U";
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ── Profile Info tab ──────────────────────────────────────────────────────────
function ProfileInfo({ profile, onSaved }) {
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [openCompany, setOpenCompany] = useState(null);

    const [form, setForm] = useState({
        name: "", surname: "", phoneNumber: "",
        deliveryAddress: "", city: "", country: "", vat: "", bankCode: "",
    });

    useEffect(() => {
        if (!profile) return;
        setForm({
            name: profile.name || "",
            surname: profile.surname || "",
            phoneNumber: profile.phoneNumber || "",
            deliveryAddress: profile.deliveryAddress || "",
            city: profile.city || "",
            country: profile.country || "",
            vat: profile.vat || "",
            bankCode: profile.bankCode || "",
        });
    }, [profile]);

    const handleChange = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

    const saveAll = async () => {
        setSaving(true); setError(""); setSuccess("");
        try {
            await profileApi.updateInfo(form);
            setSuccess("Informacija išsaugota.");
            setEditing(false);
            onSaved();
        } catch (e) { setError(e.message || "Klaida išsaugant."); }
        finally { setSaving(false); }
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
                {!editing && (
                    <button className="prof-edit-btn" onClick={() => setEditing(true)}>
                        <FiEdit2 size={14} /> Redaguoti
                    </button>
                )}
            </div>

            <div className="prof-card">
                <div className="prof-card-header"><FiUser size={15} /><span>Profilio informacija</span></div>
                <div className="prof-fields">
                    <Field label="Vardas" icon={<FiUser size={13} />}>
                        {editing ? <input className="prof-input" value={form.name} onChange={e => handleChange("name", e.target.value)} /> : <span>{profile.name}</span>}
                    </Field>
                    <Field label="Pavardė" icon={<FiUser size={13} />}>
                        {editing ? <input className="prof-input" value={form.surname} onChange={e => handleChange("surname", e.target.value)} /> : <span>{profile.surname}</span>}
                    </Field>
                    <Field label="El. paštas" icon={<FiMail size={13} />}>
                        <span className="prof-readonly">{profile.email}</span>
                        <span className="prof-locked-hint">Neredaguojama</span>
                    </Field>
                    <Field label="Telefono nr." icon={<FiPhone size={13} />}>
                        {editing ? <input className="prof-input" value={form.phoneNumber} onChange={e => handleChange("phoneNumber", e.target.value)} /> : <span>{profile.phoneNumber || "—"}</span>}
                    </Field>
                    <Field label="Adresas" icon={<FiMapPin size={13} />}>
                        {editing ? <input className="prof-input" value={form.deliveryAddress} onChange={e => handleChange("deliveryAddress", e.target.value)} /> : <span>{profile.deliveryAddress || "—"}</span>}
                    </Field>
                    <Field label="Miestas" icon={<FiMapPin size={13} />}>
                        {editing ? <input className="prof-input" value={form.city} onChange={e => handleChange("city", e.target.value)} /> : <span>{profile.city || "—"}</span>}
                    </Field>
                    <Field label="Šalis" icon={<FiMapPin size={13} />}>
                        {editing ? <input className="prof-input" value={form.country} onChange={e => handleChange("country", e.target.value)} /> : <span>{profile.country || "—"}</span>}
                    </Field>
                    <Field label="PVM kodas" icon={<FiShield size={13} />}>
                        {editing ? <input className="prof-input" value={form.vat} onChange={e => handleChange("vat", e.target.value)} /> : <span>{profile.vat || "—"}</span>}
                    </Field>
                    <Field label="Banko kodas" icon={<FiShield size={13} />}>
                        {editing ? <input className="prof-input" value={form.bankCode} onChange={e => handleChange("bankCode", e.target.value)} /> : <span>{profile.bankCode || "—"}</span>}
                    </Field>
                    <Field />
                </div>

                {editing && (
                    <div className="prof-actions">
                        {error && <p className="prof-error">{error}</p>}
                        <button className="prof-btn prof-btn--ghost" onClick={() => { setEditing(false); setError(""); }}>
                            <FiX size={14} /> Atšaukti
                        </button>
                        <button className="prof-btn prof-btn--primary" onClick={saveAll} disabled={saving}>
                            <FiSave size={14} /> {saving ? "Saugoma..." : "Išsaugoti"}
                        </button>
                    </div>
                )}
                {success && <p className="prof-success"><FiCheck size={13} /> {success}</p>}
            </div>

            {memberships.length > 0 && (
                <>
                    <h3 className="prof-section-label"><FaRegBuilding size={14} /> Darbuotojo duomenys įmonėse</h3>
                    <div className="prof-company-grid">
                        {memberships.map(m => {
                            const isOpen = openCompany === m.companyId;
                            return (
                                <div key={m.companyId}
                                    className={`prof-card prof-card--company${isOpen ? " prof-card--company-open" : ""}`}>
                                    <button className="prof-company-toggle"
                                        onClick={() => setOpenCompany(isOpen ? null : m.companyId)}>
                                        <div className="prof-company-toggle-left">
                                            <FaRegBuilding size={15} />
                                            <div>
                                                <span className="prof-company-name">{m.companyName}</span>
                                                <span className="prof-role-badge">{m.role}</span>
                                            </div>
                                        </div>
                                        <FiChevronDown size={15}
                                            className={`prof-chevron${isOpen ? " prof-chevron--open" : ""}`} />
                                    </button>

                                    <div className={`prof-company-body${isOpen ? " prof-company-body--open" : ""}`}>
                                        {(m.role === "STAFF" || m.role === "ADMIN" || m.role === "OWNER" || m.role === "COURIER") && (
                                            <div className="prof-subsection">
                                                <div className="prof-fields">
                                                    <Field label="Pareigos" icon={<FiBriefcase size={13} />}><span>{m.position || <em className="prof-empty">—</em>}</span></Field>
                                                    <Field label="Pradžios data" icon={<FiShield size={13} />}><span>{m.startDate ? new Date(m.startDate).toLocaleDateString("lt-LT") : <em className="prof-empty">—</em>}</span></Field>
                                                    <Field label="Statusas" icon={<FiShield size={13} />}>
                                                        <span className={`prof-status-dot ${m.active ? "prof-status--active" : "prof-status--inactive"}`}>
                                                            {m.active ? "Aktyvus" : "Neaktyvus"}
                                                        </span>
                                                    </Field>
                                                    <Field label="Rolė" icon={<FiShield size={13} />}>
                                                        <span className="prof-readonly">{m.role}</span>
                                                    </Field>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}

// ── Settings tab ──────────────────────────────────────────────────────────────
function ProfileSettings({ profile, onDeleted }) {
    const navigate = useNavigate();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    const handleDelete = async () => {
        setDeleting(true); setDeleteError("");
        try { await profileApi.deleteAccount(); onDeleted(); }
        catch (e) { setDeleteError(e.message || "Klaida trinant paskyrą."); setDeleting(false); }
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
                    <button className="prof-btn prof-btn--secondary"
                        onClick={() => navigate("/change-password")}
                        disabled={profile?.authProvider === "GOOGLE"}>
                        <FiLock size={14} /> Keisti slaptažodį
                    </button>
                </div>
            </div>

            <div className="prof-card prof-card--danger">
                <div className="prof-card-header prof-card-header--danger"><FiAlertTriangle size={15} /><span>Pavojinga zona</span></div>
                <p className="prof-card-desc">Ištrynus paskyrą visi duomenys bus pašalinti visam laikui. Šio veiksmo atšaukti nebus galima.</p>
                <div className="prof-btn-wrap">
                    {!showDeleteConfirm ? (
                        <button className="prof-btn prof-btn--danger" onClick={() => setShowDeleteConfirm(true)}>
                            <FiTrash2 size={14} /> Ištrinti paskyrą
                        </button>
                    ) : (
                        <div className="prof-delete-confirm">
                            <p className="prof-delete-warn"><FiAlertTriangle size={14} /> Ar tikrai norite ištrinti paskyrą?</p>
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

// ── Field helper ──────────────────────────────────────────────────────────────
function Field({ label, icon, children }) {
    return (
        <div className="prof-field">
            <span className="prof-field-label">{icon}{label}</span>
            <div className="prof-field-value">{children}</div>
        </div>
    );
}

// ── Nav config ────────────────────────────────────────────────────────────────
const NAV = [
    { id: "info", label: "Profilio informacija", icon: FiUser, subtitle: "Peržiūrėkite ir redaguokite savo asmeninę informaciją" },
    { id: "notifications", label: "Pranešimai", icon: FiBell, subtitle: "Visi pranešimai apie užsakymus, siuntas ir grąžinimus" },
    { id: "orders", label: "Mano užsakymai", icon: FiShoppingCart, subtitle: "Peržiūrėkite užsakymų istoriją ir valdykite grąžinimus" },
    { id: "settings", label: "Nustatymai", icon: FiSettings, subtitle: "Valdykite paskyros nustatymus ir saugumą" },
];

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ProfilePage() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const rawHash = location.hash.replace("#", "") || "info";
    const [hashPage, hashQuery = ""] = rawHash.split("?");
    const params = new URLSearchParams(hashQuery);
    const orderIdFromHash = params.get("order");
    const tabFromHash = params.get("tab");

    const [page, setPage] = useState(NAV.find(n => n.id === hashPage) ? hashPage : "info");
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState("");

    const fetchProfile = useCallback(async () => {
        try { setProfile(await profileApi.get()); }
        catch { setFetchError("Nepavyko įkelti profilio duomenų."); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchProfile(); }, [fetchProfile]);

    // Sync page with URL hash changes (e.g. from notifications click → #orders)
    useEffect(() => {
        const raw = location.hash.replace("#", "") || "info";
        const [newPage] = raw.split("?");
        if (NAV.find(n => n.id === newPage)) setPage(newPage);
    }, [location.hash]);

    const handleNav = (id) => {
        setPage(id);
        navigate(`#${id}`, { replace: true });
    };

    const currentNav = NAV.find(n => n.id === page);

    return (
        <div className="prof-layout">
            <div className="prof-wrapper">
                <aside className="prof-sidebar">
                    <div className="prof-sidebar-top">
                        <div className="prof-sidebar-avatar">
                            {getInitials(`${profile?.name || ""} ${profile?.surname || ""}`)}
                        </div>
                        <div className="prof-sidebar-meta">
                            <span className="prof-sidebar-name">{profile ? `${profile.name} ${profile.surname}` : "…"}</span>
                            <span className="prof-sidebar-email">{profile?.email || ""}</span>
                        </div>
                    </div>
                    <nav className="prof-nav">
                        {NAV.map(({ id, label, icon: Icon }) => (
                            <button key={id}
                                className={`prof-nav-item ${page === id ? "prof-nav-item--active" : ""}`}
                                onClick={() => handleNav(id)}>
                                <Icon size={15} />
                                <span>{label}</span>
                                <FiChevronRight size={13} className="prof-nav-arrow" />
                            </button>
                        ))}
                    </nav>
                </aside>

                <main className="prof-main">
                    <div className="prof-main-header">
                        <h1 className="prof-main-title">{currentNav?.label}</h1>
                        {currentNav?.subtitle && (
                            <p className="uh-page-sub">{currentNav.subtitle}</p>
                        )}
                    </div>

                    {loading ? (
                        <div className="prof-loading"><div className="prof-spinner" /><span>Kraunama…</span></div>
                    ) : fetchError ? (
                        <div className="prof-error-state">{fetchError}</div>
                    ) : page === "info" ? (
                        <ProfileInfo profile={profile} onSaved={fetchProfile} />
                    ) : page === "notifications" ? (
                        // NotificationsPanel handles its own data fetching
                        <NotificationsPanel />
                    ) : page === "orders" ? (
                        <ClientOrders
                            openOrderId={orderIdFromHash}
                            defaultTab={tabFromHash || "orders"}
                        />
                    ) : page === "settings" ? (
                        <ProfileSettings profile={profile} onDeleted={() => { logout(); navigate("/login"); }} />
                    ) : null}
                </main>
            </div>
        </div>
    );
}