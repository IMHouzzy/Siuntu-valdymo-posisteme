// pages/Returns/ReturnsList.jsx
// Changes vs previous version:
//   1. Table never shows "Atmesta" if evaluation hasn't been submitted yet
//      (backend now returns displayStatusId / evaluationSubmitted flag — we use statusName directly
//       since the backend already clamps it)
//   2. Opening the evaluation form calls PUT /evaluate/open → sets status to "Vertinamas"
//   3. Evaluation form no longer has a manual status dropdown — status is auto-derived server-side
//   4. Client-uploaded images are shown prominently inside the evaluation form
//   5. On successful submit the drawer reloads and shows the final auto status

import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../../components/DataTable";
import RightDrawer from "../../components/RightDrawers/RightDrawerSidebar";
import TableToolbar from "../../components/TableToolbar";
import StatusBadge from "../../components/StatusBadge";
import "../../styles/UserPage.css";
import "../../styles/ReturnsList.css";
import {
    FiRotateCcw, FiExternalLink, FiPackage, FiUser,
    FiMapPin, FiCheck, FiX, FiImage, FiBox, FiAlertCircle,
    FiCalendar, FiMessageSquare, FiChevronDown, FiChevronUp,
} from "react-icons/fi";
import { useAuth } from "../../services/AuthContext";
import NoImage from "../../images/no-camera.png";

const API = "http://localhost:5065";
const authH = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

// ── Status config ─────────────────────────────────────────────────────────────
const RETURN_STATUS = {
    1: { label: "Sukurtas",            color: "var(--color-secondary)" },
    2: { label: "Vertinamas",          color: "var(--color-warning)" },
    3: { label: "Gauta",               color: "var(--color-warning)" },
    4: { label: "Užbaigta",            color: "var(--color-accent)" },
    5: { label: "Patvirtinta",         color: "var(--color-accent)" },
    6: { label: "Atmesta",             color: "var(--color-danger)" },
    7: { label: "Etiketės paruoštos",  color: "var(--color-primary)" },
};

const METHOD_LABELS = {
    CUSTOM: "Įmonės kurjeris",
    DPD: "DPD",
    LP_EXPRESS: "LP Express",
    OMNIVA: "Omniva",
};

function fmtDate(d) {
    if (!d) return "—";
    const dt = new Date(d);
    return isNaN(dt) ? "—" : dt.toLocaleDateString("lt-LT");
}
function fmtEur(v) {
    return `€${Number(v ?? 0).toFixed(2)}`;
}

// ── Item image gallery (used inside evaluation form) ──────────────────────────
function ItemImages({ imageUrls, expanded, onToggle }) {
    let urls = [];
    if (typeof imageUrls === "string") {
        try { urls = JSON.parse(imageUrls); } catch { urls = []; }
    } else if (Array.isArray(imageUrls)) {
        urls = imageUrls;
    }

    if (!urls.length) return (
        <span className="rl-no-images">
            <FiImage size={11} /> Kliento nuotraukų nėra
        </span>
    );

    return (
        <div className="rl-img-section">
            <button type="button" className="rl-img-toggle" onClick={onToggle}>
                <FiImage size={13} />
                <span>Kliento nuotraukos ({urls.length})</span>
                {expanded ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />}
            </button>
            {expanded && (
                <div className="rl-img-grid">
                    {urls.map((u, i) => {
                        const src = u.startsWith("http") ? u : `${API}${u}`;
                        return (
                            <a key={i} href={src} target="_blank" rel="noopener noreferrer">
                                <img src={src} alt={`img-${i}`} className="rl-img-thumb" />
                            </a>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ── Drawer hero ───────────────────────────────────────────────────────────────
function ReturnHero({ ret, onNavigate }) {
    if (!ret) return null;
    const cfg   = RETURN_STATUS[ret.displayStatusId ?? ret.fk_ReturnStatusTypeid_ReturnStatusType] ?? { label: "—", color: "var(--color-text-muted)" };
    const total = (ret.items ?? []).reduce((s, i) => s + Number(i.returnSubTotal ?? 0), 0);

    return (
        <div className="rl-hero">
            <div className="rl-hero-header">
                <div>
                    <div className="rl-hero-title">Grąžinimas #{ret.id_Returns}</div>
                    <div className="rd-subtitle">
                        <span>Užsakymas #{ret.orderId ?? "—"}</span>
                        {ret.returnMethod && (
                            <span className="rl-method-tag">{METHOD_LABELS[ret.returnMethod] ?? ret.returnMethod}</span>
                        )}
                    </div>
                </div>
                <div className="rl-hero-actions">
                    {ret.orderId && (
                        <button className="rd-action-btn" title="Peržiūrėti užsakymą"
                            onClick={() => onNavigate(`/orders/${ret.orderId}/detail`)}>
                            <FiExternalLink size={17} />
                        </button>
                    )}
                </div>
            </div>

            <div className="order-stats-strip">
                <div className="order-hero-stat">
                    <div className="order-hero-stat-label">Suma</div>
                    <div className="order-hero-stat-value">{fmtEur(total)}</div>
                </div>
                <div className="order-hero-divider" />
                <div className="order-hero-stat">
                    <div className="order-hero-stat-label">Prekės</div>
                    <div className="order-hero-stat-value">{(ret.items ?? []).length}</div>
                </div>
                <div className="order-hero-divider" />
                <div className="order-hero-stat">
                    <div className="order-hero-stat-label">Data</div>
                    <div className="order-hero-stat-value" style={{ fontSize: "var(--text-md)" }}>
                        {fmtDate(ret.date)}
                    </div>
                </div>
                <div className="order-hero-divider" />
                <div className="order-hero-stat">
                    <div className="order-hero-stat-label">Būsena</div>
                    <div className="order-hero-stat-value">
                        <span className="rl-status-pill" style={{ "--sc": cfg.color }}>
                            {cfg.label}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Evaluation form ───────────────────────────────────────────────────────────
// No manual status picker — status is auto-derived by the backend.
function EvaluationForm({ ret, onDone }) {
    // Per-item state: { [returnItemId]: { eval: true|false|null, comment: "" } }
    const [itemState, setItemState] = useState(() => {
        const init = {};
        (ret.items ?? []).forEach(item => {
            init[item.id_ReturnItem] = {
                eval:    item.evaluation != null ? !!item.evaluation : null,
                comment: item.evaluationComment ?? "",
            };
        });
        return init;
    });
    const [employeeNote, setEmployeeNote] = useState(ret.employeeNote ?? "");
    const [expandedImages, setExpandedImages] = useState({});
    const [submitting, setSubmitting]   = useState(false);
    const [error, setError]             = useState("");

    const setItemEval = (itemId, val) =>
        setItemState(prev => ({ ...prev, [itemId]: { ...prev[itemId], eval: val } }));
    const setItemComment = (itemId, val) =>
        setItemState(prev => ({ ...prev, [itemId]: { ...prev[itemId], comment: val } }));
    const toggleImages = (itemId) =>
        setExpandedImages(prev => ({ ...prev, [itemId]: !prev[itemId] }));

    // All items must have an evaluation before submit is enabled
    const allEvaluated = (ret.items ?? []).every(
        item => itemState[item.id_ReturnItem]?.eval !== null && itemState[item.id_ReturnItem]?.eval !== undefined
    );

    // Preview of what the auto-derived status will be
    const previewStatus = useMemo(() => {
        const items = ret.items ?? [];
        if (!items.length) return null;
        const allDeclined = items.every(i => itemState[i.id_ReturnItem]?.eval === false);
        const anyApproved = items.some(i => itemState[i.id_ReturnItem]?.eval === true);
        if (!allEvaluated) return null;
        if (allDeclined)  return { id: 6, ...RETURN_STATUS[6] };
        if (anyApproved)  return { id: 7, ...RETURN_STATUS[7] }; // optimistic — may be 5 if labels fail
        return null;
    }, [itemState, ret.items, allEvaluated]);

    const handleSubmit = async () => {
        setSubmitting(true);
        setError("");
        try {
            const itemEvals = (ret.items ?? []).map(item => ({
                ReturnItemId:      item.id_ReturnItem,
                Evaluation:        itemState[item.id_ReturnItem]?.eval ?? false,
                EvaluationComment: itemState[item.id_ReturnItem]?.comment?.trim() || null,
            }));

            const body = {
                EmployeeNote: employeeNote.trim() || null,
                Items:        itemEvals,
            };

            const r = await fetch(`${API}/api/returns/${ret.id_Returns}/evaluate`, {
                method:  "PUT",
                headers: { ...authH(), "Content-Type": "application/json" },
                body:    JSON.stringify(body),
            });

            if (!r.ok) {
                const txt = await r.text();
                setError(txt || "Klaida išsaugant vertinimą.");
                return;
            }
            onDone?.();
        } catch {
            setError("Serverio klaida.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="rl-eval-form">
            {error && (
                <div className="rl-eval-error"><FiAlertCircle size={13} /> {error}</div>
            )}

            {/* Per-item evaluation */}
            <div className="rl-eval-items">
                {(ret.items ?? []).map((item, idx) => {
                    const st   = itemState[item.id_ReturnItem] ?? {};
                    const name = item.product?.name ?? `Prekė ${idx + 1}`;
                    const imgExpanded = !!expandedImages[item.id_ReturnItem];

                    return (
                        <div key={item.id_ReturnItem}
                            className={`rl-eval-item${st.eval === true ? " rl-eval-item--approved" : st.eval === false ? " rl-eval-item--declined" : ""}`}>

                            {/* Product row */}
                            <div className="rl-eval-item-header">
                                <div className={`rl-eval-item-img ${!item.product?.imageUrl ? "rl-eval-item-img--ph" : ""}`}>
                                    {item.product?.imageUrl
                                        ? <img src={item.product.imageUrl.startsWith("http") ? item.product.imageUrl : `${API}${item.product.imageUrl}`} alt={name} />
                                        : <img src={NoImage} alt="No image" />
                                    }
                                </div>
                                <div className="rl-eval-item-info">
                                    <div className="rl-eval-item-name">{name}</div>
                                    <div className="rl-eval-item-meta">
                                        {item.quantity} {item.product?.unit ?? "vnt."}
                                        {" · "}{fmtEur(item.returnSubTotal)}
                                        {item.reason && <span className="rl-eval-reason-tag">{item.reason}</span>}
                                    </div>
                                    {/* Client images toggle */}
                                    <ItemImages
                                        imageUrls={item.imageUrls}
                                        expanded={imgExpanded}
                                        onToggle={() => toggleImages(item.id_ReturnItem)}
                                    />
                                </div>
                            </div>

                            {/* Approve / Decline buttons */}
                            <div className="rl-eval-btns">
                                <button
                                    type="button"
                                    className={`rl-eval-btn rl-eval-btn--approve${st.eval === true ? " is-active" : ""}`}
                                    onClick={() => setItemEval(item.id_ReturnItem, true)}
                                >
                                    <FiCheck size={13} /> Priimti
                                </button>
                                <button
                                    type="button"
                                    className={`rl-eval-btn rl-eval-btn--decline${st.eval === false ? " is-active" : ""}`}
                                    onClick={() => setItemEval(item.id_ReturnItem, false)}
                                >
                                    <FiX size={13} /> Atmesti
                                </button>
                            </div>

                            {/* Comment */}
                            <textarea
                                className="rl-eval-comment"
                                rows={2}
                                placeholder="Komentaras darbuotojui (neprivaloma)…"
                                value={st.comment ?? ""}
                                onChange={e => setItemComment(item.id_ReturnItem, e.target.value)}
                            />
                        </div>
                    );
                })}
            </div>

            {/* General employee note */}
            <div className="rl-eval-note-wrap">
                <label className="rl-eval-note-label">
                    <FiMessageSquare size={13} /> Bendras darbuotojo komentaras
                </label>
                <textarea
                    className="rl-eval-comment"
                    rows={3}
                    placeholder="Bendra pastaba klientui…"
                    value={employeeNote}
                    onChange={e => setEmployeeNote(e.target.value)}
                />
            </div>

            {/* Status preview */}
            {previewStatus && (
                <div className="rl-eval-status-preview">
                    <span>Po pateikimo statusas bus:</span>
                    <span className="rl-status-pill" style={{ "--sc": previewStatus.color }}>
                        {previewStatus.label}
                    </span>
                    {previewStatus.id !== 6 && (
                        <span className="rl-eval-labels-hint">
                            + etiketės bus sugeneruotos automatiškai
                        </span>
                    )}
                </div>
            )}

            {/* Actions */}
            <div className="rl-eval-actions">
                <button
                    className="rl-eval-open-btn rl-eval-open-btn--cancel"
                    type="button"
                    onClick={() => onDone?.()}
                    disabled={submitting}
                >
                    <FiX size={14} /> Atšaukti
                </button>
                <button
                    className="rl-eval-open-btn"
                    type="button"
                    onClick={handleSubmit}
                    disabled={!allEvaluated || submitting}
                >
                    {submitting
                        ? <span className="rl-spinner" />
                        : <><FiCheck size={14} /> Pateikti vertinimą</>
                    }
                </button>
            </div>
        </div>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ReturnsList() {
    const navigate = useNavigate();
    const { token, activeCompanyId } = useAuth();

    const [returns, setReturns]             = useState([]);
    const [selectedReturn, setSelectedReturn] = useState(null);
    const [detailData, setDetailData]       = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [showEvalForm, setShowEvalForm]   = useState(false);
    const [q, setQ]       = useState("");
    const [status, setStatus] = useState("all");

    // ── Load list ─────────────────────────────────────────────────────────────
    const loadList = useCallback(() => {
        if (!token) return;
        fetch(`${API}/api/returns/all`, { headers: authH() })
            .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
            .then(setReturns)
            .catch(console.error);
    }, [token, activeCompanyId]);

    useEffect(() => {
        setReturns([]);
        setSelectedReturn(null);
        setDetailData(null);
        loadList();
    }, [loadList]);

    // ── Load detail when row clicked ──────────────────────────────────────────
    useEffect(() => {
        if (!selectedReturn) { setDetailData(null); return; }
        setLoadingDetail(true);
        setShowEvalForm(false);
        fetch(`${API}/api/returns/${selectedReturn.id_Returns}`, { headers: authH() })
            .then(r => r.ok ? r.json() : null)
            .then(d => setDetailData(d))
            .catch(console.error)
            .finally(() => setLoadingDetail(false));
    }, [selectedReturn]);

    // ── Open eval form → immediately call /evaluate/open ─────────────────────
    const openEvalForm = useCallback(async () => {
        if (!detailData) return;
        setShowEvalForm(true);
        try {
            await fetch(`${API}/api/returns/${detailData.id_Returns}/evaluate/open`, {
                method:  "PUT",
                headers: authH(),
            });
            // Refresh detail so the status pill in the hero updates to "Vertinamas"
            const r = await fetch(`${API}/api/returns/${detailData.id_Returns}`, { headers: authH() });
            if (r.ok) setDetailData(await r.json());
            loadList();
        } catch {
            // non-critical — just open the form anyway
        }
    }, [detailData, loadList]);

    // ── Status filter pills ───────────────────────────────────────────────────
    const statusFilters = useMemo(() => {
        const map = new Map();
        for (const r of returns) {
            const key = r.statusName || "Nežinoma";
            map.set(key, (map.get(key) || 0) + 1);
        }
        const items = [{ label: "Visi", value: "all", count: returns.length }];
        Array.from(map.entries())
            .sort((a, b) => a[0].localeCompare(b[0], "lt"))
            .forEach(([name, count]) => items.push({ label: name, value: name, count }));
        return items;
    }, [returns]);

    // ── Filter ────────────────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        const byStatus = returns.filter(r =>
            status === "all" ? true : (r.statusName || "Nežinoma") === status
        );
        const s = q.trim().toLowerCase();
        if (!s) return byStatus;
        return byStatus.filter(r =>
            [r.id_Returns, r.orderId, r.clientName, r.clientEmail,
             r.returnMethod, r.statusName, r.clientNote]
                .some(v => String(v ?? "").toLowerCase().includes(s))
        );
    }, [returns, q, status]);

    // ── Columns ───────────────────────────────────────────────────────────────
    const columns = useMemo(() => [
        {
            key: "id",
            header: "Grąžinimas",
            sortable: true,
            accessor: r => r.id_Returns,
            cell: (_v, r) => (
                <div className="dt-cell-stack">
                    <div className="dt-cell-primary">#{r.id_Returns}</div>
                    <div className="dt-cell-secondary">Už. #{r.orderId ?? "—"}</div>
                </div>
            ),
        },
        {
            key: "date",
            header: "Data",
            sortable: true,
            accessor: r => r.date ? new Date(r.date) : null,
            cell: v => v ? v.toLocaleDateString("lt-LT") : "—",
        },
        {
            key: "client",
            header: "Klientas",
            sortable: true,
            accessor: r => r.clientName ?? "",
            cell: (_v, r) => (
                <div className="dt-cell-stack">
                    <div className="dt-cell-primary">{r.clientName || "—"}</div>
                    <div className="dt-cell-secondary">{r.clientEmail || "—"}</div>
                </div>
            ),
        },
        {
            key: "method",
            header: "Būdas",
            sortable: true,
            accessor: r => r.returnMethod ?? "",
            cell: (_v, r) => (
                <span className="rl-method-tag">
                    {METHOD_LABELS[r.returnMethod] ?? r.returnMethod ?? "—"}
                </span>
            ),
        },
        {
            key: "items",
            header: "Prekės",
            sortable: true,
            align: "right",
            accessor: r => r.itemCount ?? 0,
            cell: v => v,
        },
        {
            key: "total",
            header: "Suma",
            sortable: true,
            align: "right",
            accessor: r => Number(r.totalAmount ?? 0),
            cell: (_v, r) => fmtEur(r.totalAmount),
        },
        {
            key: "status",
            header: "Būsena",
            sortable: true,
            accessor: r => r.statusName ?? "",
            cell: (_v, r) => <StatusBadge status={r.statusName} />,
        },
    ], []);

    // ── Drawer detail sections ────────────────────────────────────────────────
    const drawerSections = useMemo(() => {
        if (!detailData) return [];
        const d = detailData;

        const infoRows = [
            { label: "Grąžinimo ID", value: d.id_Returns },
            { label: "Užsakymas",    value: d.orderId ? `#${d.orderId}` : "—" },
            { label: "Data",         value: fmtDate(d.date) },
            { label: "Grąžinimo būdas", value: METHOD_LABELS[d.returnMethod] ?? d.returnMethod ?? "—" },
            ...(d.returnLockerId == null ? [{
                label: "Adresas",
                value: [d.returnStreet, d.returnCity, d.returnPostalCode, d.returnCountry]
                    .filter(Boolean).join(", ") || "—",
            }] : [
                { label: "Paštomato ID",       value: d.returnLockerId },
                { label: "Paštomato pavadinimas", value: d.returnLockerName ?? "—" },
                { label: "Paštomato adresas",  value: d.returnLockerAddress ?? "—" },
            ]),
        ];

        const clientRows = [
            { label: "Vardas",    value: d.clientName  ?? "—" },
            { label: "El. paštas", value: d.clientEmail ?? "—" },
            { label: "Telefonas", value: d.clientPhone  ?? "—" },
        ];

        const noteRows = [];
        if (d.clientNote)   noteRows.push({ label: "Kliento pastaba",        value: d.clientNote });
        if (d.employeeNote) noteRows.push({ label: "Darbuotojo komentaras", value: d.employeeNote });

        // Items — show product + client images
        const itemsSection = {
            title: "Grąžinamos prekės",
            rows: (d.items ?? []).length === 0 ? [] : [{
                label: null,
                value: (
                    <div>
                        {(d.items ?? []).map((item, idx) => {
                            const evalCfg = item.evaluation === true
                                ? { icon: FiCheck, color: "var(--color-accent)", label: "Priimta" }
                                : item.evaluation === false
                                    ? { icon: FiX, color: "var(--color-danger)", label: "Atmesta" }
                                    : null;

                            let imageUrls = [];
                            if (typeof item.imageUrls === "string") {
                                try { imageUrls = JSON.parse(item.imageUrls); } catch {}
                            } else if (Array.isArray(item.imageUrls)) {
                                imageUrls = item.imageUrls;
                            }

                            return (
                                <div key={item.id_ReturnItem ?? idx} className="rl-item-row">
                                    <div className={`rd-product-img ${!item.product?.imageUrl ? "rd-product-img-placeholder" : ""}`}>
                                        {item.product?.imageUrl
                                            ? <img src={item.product.imageUrl.startsWith("http") ? item.product.imageUrl : `${API}${item.product.imageUrl}`} alt={item.product.name} />
                                            : <img src={NoImage} alt="No image" />
                                        }
                                    </div>

                                    <div className="rl-item-info">
                                        <div className="rl-item-name">{item.product?.name ?? "—"}</div>
                                        <div className="rl-item-meta">
                                            <span>{item.quantity} {item.product?.unit ?? "vnt."}</span>
                                            <span>· {fmtEur(item.returnSubTotal)}</span>
                                            {item.reason && <span>· {item.reason}</span>}
                                        </div>
                                        {item.evaluationComment && (
                                            <div className="rl-item-comment"><FiMessageSquare size={12}/> {item.evaluationComment}</div>
                                        )}
                                        {/* Client-uploaded images in detail view */}
                                        {imageUrls.length > 0 && (
                                            <div className="rl-img-grid rl-img-grid--detail">
                                                {imageUrls.map((u, i) => {
                                                    const src = u.startsWith("http") ? u : `${API}${u}`;
                                                    return (
                                                        <a key={i} href={src} target="_blank" rel="noopener noreferrer">
                                                            <img src={src} alt={`img-${i}`} className="rl-img-thumb" />
                                                        </a>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    {evalCfg && (
                                        <div className="rl-eval-badge" style={{ "--ec": evalCfg.color }}>
                                            <evalCfg.icon size={11} /> {evalCfg.label}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ),
            }],
            emptyText: "Nėra prekių.",
        };

        const sections = [
            { title: "Grąžinimo informacija", rows: infoRows },
            { title: "Klientas", rows: clientRows },
            itemsSection,
        ];
        if (noteRows.length) sections.push({ title: "Pastabos", rows: noteRows });
        return sections;
    }, [detailData]);

    // ── Hero with eval button ─────────────────────────────────────────────────
    const heroWithEvalBtn = useMemo(() => {
        if (!detailData) return null;
        // Don't show "Vertinti" button if already fully evaluated
        const alreadyDone = detailData.evaluationSubmitted;

        return (
            <div>
                <ReturnHero ret={detailData} onNavigate={navigate} />
                {!alreadyDone && (
                    <div className="rl-eval-toggle">
                        {!showEvalForm ? (
                            <button className="rl-eval-open-btn" onClick={openEvalForm}>
                                <FiRotateCcw size={14} /> Vertinti grąžinimą
                            </button>
                        ) : (
                            <button
                                className="rl-eval-open-btn rl-eval-open-btn--cancel"
                                onClick={() => setShowEvalForm(false)}
                            >
                                <FiX size={14} /> Uždaryti vertinimą
                            </button>
                        )}
                    </div>
                )}
            </div>
        );
    }, [detailData, showEvalForm, navigate, openEvalForm]);

    // ── Active drawer sections ────────────────────────────────────────────────
    const activeSections = useMemo(() => {
        if (showEvalForm && detailData) {
            return [{
                title: "Vertinimas",
                rows: [{
                    label: null,
                    value: (
                        <EvaluationForm
                            ret={detailData}
                            onDone={() => {
                                setShowEvalForm(false);
                                // Reload detail + list
                                setSelectedReturn(prev => ({ ...prev }));
                                loadList();
                            }}
                        />
                    ),
                }],
            }];
        }
        return drawerSections;
    }, [showEvalForm, detailData, drawerSections, loadList]);

    return (
        <div className="user-cointainer">
            <TableToolbar
                title="Grąžinimai"
                searchValue={q}
                onSearchChange={setQ}
                filters={statusFilters}
                filterValue={status}
                onFilterChange={setStatus}
                connectBottom
            />

            <DataTable
                columns={columns}
                rows={filtered}
                pageSize={25}
                getRowId={r => r.id_Returns}
                onRowClick={r => setSelectedReturn(r)}
                emptyText="Nėra grąžinimų"
                initialSort={{ key: "date", dir: "desc" }}
            />

            <RightDrawer
                variant="order"
                open={!!selectedReturn}
                hero={loadingDetail ? (
                    <div className="rl-hero-loading"><div className="uh-spinner" /><span>Kraunama…</span></div>
                ) : heroWithEvalBtn}
                width={620}
                sections={loadingDetail ? [] : activeSections}
                onClose={() => { setSelectedReturn(null); setDetailData(null); setShowEvalForm(false); }}
            />
        </div>
    );
}