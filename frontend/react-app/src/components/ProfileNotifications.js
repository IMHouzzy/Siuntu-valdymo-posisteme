// components/NotificationsPanel.jsx
// Full-page notifications panel used in ProfilePage under the "Pranešimai" tab.
// Mirrors the type icons / accent colours from SignInButtons but laid out as
// a scrollable page section rather than a dropdown.

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    FiBell, FiPackage, FiShoppingBag, FiRefreshCw,
    FiCheckCircle, FiInfo, FiCheck, FiTrash2, FiFilter,
    FiInbox,
} from "react-icons/fi";
import { notificationsApi } from "../services/api";
import "../styles/NotificationsPanel.css";

// ── Helpers (mirrored from SignInButtons) ─────────────────────────────────────
function formatRelativeTime(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60_000);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffMin < 1) return "Ką tik";
    if (diffMin < 60) return `prieš ${diffMin} min.`;
    if (diffHr < 24) return `prieš ${diffHr} val.`;
    if (diffDay === 1) return "Vakar";
    if (diffDay < 7) return `prieš ${diffDay} d.`;
    return date.toLocaleDateString("lt-LT", { day: "2-digit", month: "short", year: "numeric" });
}

function NotifIcon({ type }) {
    const p = { size: 16 };
    switch (type) {
        case "ORDER": return <FiShoppingBag {...p} />;
        case "SHIPMENT": return <FiPackage     {...p} />;
        case "RETURN": return <FiRefreshCw   {...p} />;
        case "INVOICE": return <FiCheckCircle {...p} />;
        default: return <FiInfo        {...p} />;
    }
}

function typeClass(type) {
    switch (type) {
        case "ORDER": return "np-item--order";
        case "SHIPMENT": return "np-item--shipment";
        case "RETURN": return "np-item--return";
        case "INVOICE": return "np-item--invoice";
        default: return "";
    }
}

function typeLabel(type) {
    switch (type) {
        case "ORDER": return "Užsakymas";
        case "SHIPMENT": return "Siunta";
        case "RETURN": return "Grąžinimas";
        case "INVOICE": return "Sąskaita";
        default: return "Pranešimas";
    }
}

const FILTERS = [
    { value: "all", label: "Visi" },
    { value: "unread", label: "Neskaityti" },
    { value: "ORDER", label: "Užsakymai" },
    { value: "SHIPMENT", label: "Siuntos" },
    { value: "RETURN", label: "Grąžinimai" },
];

const PAGE_SIZE = 20;

// ── Main component ────────────────────────────────────────────────────────────
export default function NotificationsPanel() {
    const navigate = useNavigate();

const [allNotifications, setAllNotifications] = useState([]);
const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState("all");
    // ── Fetch ──────────────────────────────────────────────────────────────────
   const load = useCallback(async () => {
    setLoading(true);

    try {
        const data = await notificationsApi.getAll(PAGE_SIZE);
        const items = data.items ?? data ?? [];

        setAllNotifications(items);
        setTotal(items.length);
        setVisibleCount(PAGE_SIZE);

    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
}, []);

    useEffect(() => { load(1); }, [load]);

    // ── Derived list ───────────────────────────────────────────────────────────
const filtered = allNotifications
    .filter(n => {
        if (filter === "all") return true;
        if (filter === "unread") return !n.isRead;
        return n.type === filter;
    })
    .slice(0, visibleCount);

   const unreadCount = allNotifications.filter(n => !n.isRead).length;
const hasMore = visibleCount < allNotifications.length;

    // ── Actions ────────────────────────────────────────────────────────────────
    const markRead = async (id) => {
        setAllNotifications(prev =>
            prev.map(n => n.id_Notification === id ? { ...n, isRead: true } : n)
        );
        try { await notificationsApi.markRead(id); } catch { /* silent */ }
    };

    const markAllRead = async () => {
        setAllNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        try { await notificationsApi.markAllRead(); } catch { /* silent */ }
    };

    const remove = async (e, id) => {
        e.stopPropagation();
        setAllNotifications(prev => prev.filter(n => n.id_Notification !== id));
        setTotal(t => Math.max(0, t - 1));
        try { await notificationsApi.remove(id); } catch { /* silent */ }
    };

    const handleClick = (n) => {
        if (!n.isRead) markRead(n.id_Notification);

        if (n.referenceType === "ORDER" && n.referenceId) {
            navigate(`/client/profile#orders?order=${n.referenceId}`);
        } else if (n.referenceType === "RETURN") {
            navigate(`/client/profile#orders?tab=returns`);
        } else if (n.referenceType === "SHIPMENT" && n.referenceId) {
            navigate(`/client/track/${n.referenceId}`);
        }
    };

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div className="np-panel">

            {/* ── Toolbar ─────────────────────────────────────────── */}
            <div className="np-toolbar">
                <div className="np-toolbar-left">
                    <span className="np-total-label">
                        {total} pranešim{total === 1 ? "as" : "ai"}
                    </span>
                    {unreadCount > 0 && (
                        <span className="np-unread-pill">{unreadCount} neskaityti</span>
                    )}
                </div>

                <div className="np-toolbar-right">
                    {unreadCount > 0 && (
                        <button className="np-btn np-btn--ghost" onClick={markAllRead}>
                            <FiCheck size={13} /> Visi perskaityti
                        </button>
                    )}
                    <button className="np-btn np-btn--ghost" onClick={() => load(1)} disabled={loading}>
                        <FiRefreshCw size={13} className={loading ? "np-spin" : ""} /> Atnaujinti
                    </button>
                </div>
            </div>

            {/* ── Filter tabs ──────────────────────────────────────── */}
            <div className="np-filters">
                <FiFilter size={13} className="np-filter-icon" />
                {FILTERS.map(f => (
                    <button
                        key={f.value}
                        className={`np-filter-tab${filter === f.value ? " np-filter-tab--active" : ""}`}
                        onClick={() => setFilter(f.value)}
                    >
                        {f.label}
                        {f.value === "unread" && unreadCount > 0 && (
                            <span className="np-filter-badge">{unreadCount}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* ── List ─────────────────────────────────────────────── */}
            <div className="np-list">
                {loading && allNotifications.length === 0 ? (
                    <div className="np-state">
                        <div className="np-spinner" />
                        <span>Kraunama…</span>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="np-state np-state--empty">
                        <FiInbox size={40} className="np-empty-icon" />
                        <span className="np-empty-title">
                            {filter === "unread" ? "Visi pranešimai perskaityti" : "Pranešimų nėra"}
                        </span>
                        <span className="np-empty-sub">
                            {filter !== "all" && "Pabandykite keisti filtrą"}
                        </span>
                    </div>
                ) : (
                    filtered.map(n => (
                        <div
                            key={n.id_Notification}
                            className={`np-item ${!n.isRead ? "np-item--unread" : ""} ${typeClass(n.type)}`}
                            onClick={() => handleClick(n)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={e => e.key === "Enter" && handleClick(n)}
                        >
                            {/* Unread dot */}
                            {!n.isRead && <span className="np-unread-dot" aria-label="Neskaitytas" />}

                            {/* Icon */}
                            <div className="np-item-icon">
                                <NotifIcon type={n.type} />
                            </div>

                            {/* Content */}
                            <div className="np-item-body">
                                <div className="np-item-meta">
                                    <span className="np-item-type">{typeLabel(n.type)}</span>
                                    <span className="np-item-time">{formatRelativeTime(n.date)}</span>
                                </div>
                                <p className="np-item-theme">{n.theme}</p>
                                <p className="np-item-text">{n.content}</p>
                            </div>

                            {/* Actions */}
                            <div className="np-item-actions">
                                {!n.isRead && (
                                    <button
                                        className="np-action-btn np-action-btn--read"
                                        title="Pažymėti kaip perskaitytą"
                                        onClick={e => { e.stopPropagation(); markRead(n.id_Notification); }}
                                    >
                                        <FiCheck size={12} />
                                    </button>
                                )}
                                <button
                                    className="np-action-btn np-action-btn--del"
                                    title="Ištrinti"
                                    onClick={e => remove(e, n.id_Notification)}
                                >
                                    <FiTrash2 size={12} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* ── Load more ─────────────────────────────────────────── */}
            {hasMore && filter === "all" && (
                <div className="np-load-more-wrap">
                    <button
                        className="np-btn np-btn--load-more"
                        onClick={() => setVisibleCount(prev => prev + PAGE_SIZE)}
                        disabled={loading}
                    >
                        {loading ? <><div className="np-spinner np-spinner--sm" /> Kraunama…</> : "Rodyti daugiau"}
                    </button>
                </div>
            )}
        </div>
    );
}