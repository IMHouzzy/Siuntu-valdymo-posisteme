import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import TableToolbar from "../../components/TableToolbar";
import RightDrawer from "../../components/RightDrawers/RightDrawerSidebar";
import {
  FiEdit, FiTrash2, FiUsers, FiCheckCircle, FiXCircle, FiSettings, FiMapPin,
} from "react-icons/fi";
import { useAuth } from "../../services/AuthContext";
import "../../styles/CompaniesList.css";

const API = "http://localhost:5065";

async function apiFetch(url, token, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: { ...(options.headers || {}), Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(t || `HTTP ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

function CompanyCard({ c, onClick }) {
  return (
    <button type="button" className="co-card" onClick={onClick}>
      <div className="co-card-top">
        <div className="co-card-title">
          <div className="co-card-name">{c.name}</div>
          <div className="co-card-code">{c.code || "—"}</div>
        </div>
        <div className={`co-card-status ${c.active ? "is-active" : "is-inactive"}`}>
          {c.active ? <><FiCheckCircle /> Aktyvi</> : <><FiXCircle /> Neaktyvi</>}
        </div>
      </div>
      <div className="co-card-meta">
        <div className="co-meta-row">
          <span className="co-meta-label">El. paštas</span>
          <span className="co-meta-value">{c.email || "—"}</span>
        </div>
        <div className="co-meta-row">
          <span className="co-meta-label">Telefonas</span>
          <span className="co-meta-value">{c.phoneNumber || "—"}</span>
        </div>
        <div className="co-meta-row">
          <span className="co-meta-label">Adresas</span>
          <span className="co-meta-value">{c.address || "—"}</span>
        </div>
      </div>
    </button>
  );
}

export default function CompaniesList() {
  const navigate = useNavigate();
  const { token, user, activeCompanyId, switchCompany } = useAuth();
  const isMaster = !!user?.isMasterAdmin;

  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    if (!token) return;
    apiFetch(`${API}/api/companies`, token)
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, [token]);

  const statusFilters = useMemo(() => {
    const activeCount = items.filter(x => !!x.active).length;
    return [
      { label: "Visos", value: "all", count: items.length },
      { label: "Aktyvios", value: "active", count: activeCount },
      { label: "Neaktyvios", value: "inactive", count: items.length - activeCount },
    ];
  }, [items]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return items
      .filter((c) => {
        if (status === "active") return !!c.active;
        if (status === "inactive") return !c.active;
        return true;
      })
      .filter((c) => {
        if (!s) return true;
        return [c.name, c.code, c.email, c.phoneNumber, c.address]
          .some(v => String(v ?? "").toLowerCase().includes(s));
      });
  }, [items, q, status]);

  const deleteCompany = async (c) => {
    const ok = window.confirm(`Ištrinti įmonę "${c.name}"?`);
    if (!ok) return;
    try {
      await apiFetch(`${API}/api/companies/${c.id_Company}`, token, { method: "DELETE" });
      setItems((prev) => prev.filter((x) => x.id_Company !== c.id_Company));
      setSelected(null);
    } catch (e) {
      console.error(e);
      alert("Nepavyko ištrinti įmonės");
    }
  };

  const withSwitch = async (id, cb) => {
    try {
      if (activeCompanyId !== id) await switchCompany(id);
    } catch (e) { console.error(e); }
    cb();
  };

  // ── Hero: logo initials + name + status badge ──────────────────────
  const companyHero = useMemo(() => {
    if (!selected) return null;
    const c = selected;
    const initials = c.name ? c.name.slice(0, 2).toUpperCase() : "?";

    return (
      <>
        <div className="company-logo-wrapper">
          {c.image ? (
            <img
              className="company-logo"
              src={`${API}${c.image}`}
              alt={c.name}
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          ) : (
            <div className="company-logo-initials">{initials}</div>
          )}

          {/* Status badge on logo */}
          <div className={`company-logo-status ${c.active ? "active" : "inactive"}`}>
            {c.active ? <FiCheckCircle /> : <FiXCircle />}
          </div>
        </div>

        <div className="company-hero-info">
          <div className="company-hero-name">{c.name}</div>

          <div className="company-hero-code">
            {c.code ? `Įmonės kodas: ${c.code}` : `ID: ${c.id_Company}`}
          </div>
        </div>

        <div className="company-hero-actions">
          <button
            className="rd-action-btn"
            title="Redaguoti"
            onClick={() =>
              withSwitch(c.id_Company, () =>
                navigate(`/companyEdit/${c.id_Company}`)
              )
            }
          >
            <FiEdit size={18} />
          </button>

          <button
            className="rd-action-btn"
            title="Nariai"
            onClick={() =>
              withSwitch(c.id_Company, () =>
                navigate(`/companyMembers/${c.id_Company}`)
              )
            }
          >
            <FiUsers size={18} />
          </button>

          {isMaster && (
            <button
              className="rd-action-btn danger"
              title="Ištrinti"
              onClick={() => deleteCompany(c)}
            >
              <FiTrash2 size={18} />
            </button>
          )}
        </div>
      </>
    );
  }, [selected]);

  const drawerSections = useMemo(() => {
    if (!selected) return [];
    const c = selected;
    return [
      {
        title: "Kontaktai",
        rows: [
          { label: "El. paštas", value: c.email || "—" },
          { label: "Telefonas", value: c.phoneNumber || "—" },
          { label: "Dokumento kodas", value: c.documentCode || "—" },
          {
            label: "Sukurta", value: c.creationDate
              ? new Date(c.creationDate).toLocaleDateString("lt-LT") : "—"
          },
        ],
      },
      {
        title: "Adresai",
        rows: [
          { label: "Adresas", value: c.address || "—" },
          { label: "Siuntimo adresas", value: c.shippingAddress || "—" },
          { label: "Grąžinimo adresas", value: c.returnAddress || "—" },
        ],
      },
    ];
  }, [selected]);

  return (
    <div className="co-page">
      <TableToolbar
        title="Įmonės"
        searchValue={q}
        onSearchChange={setQ}
        addLabel="Kurti įmonę"
        onAdd={() => navigate("/companyAdd")}
        filters={statusFilters}
        filterValue={status}
        onFilterChange={setStatus}
      />

      {!isMaster ? <style>{`.tb-header-right button{display:none;}`}</style> : null}

      <div className="co-grid">
        {filtered.length === 0
          ? <div className="co-empty">Nėra įmonių</div>
          : filtered.map((c) => (
            <CompanyCard key={c.id_Company} c={c} onClick={() => setSelected(c)} />
          ))
        }
      </div>

      <RightDrawer
        variant="company"
        open={!!selected}
        title={selected?.name ?? ""}
        subtitle={selected ? (selected.code ? `Kodas: ${selected.code}` : `ID: ${selected.id_Company}`) : ""}
        hero={companyHero}
        sections={drawerSections}
        onClose={() => setSelected(null)}
        actions={
          selected ? (
            <>
              <button className="rd-action-btn" title="Redaguoti"
                onClick={() => withSwitch(selected.id_Company, () => navigate(`/companyEdit/${selected.id_Company}`))}>
                <FiEdit size={15} />
              </button>
              <button className="rd-action-btn" title="Nariai"
                onClick={() => withSwitch(selected.id_Company, () => navigate(`/companyMembers/${selected.id_Company}`))}>
                <FiUsers size={15} />
              </button>
              <button className="rd-action-btn" title="Konfigūruoti"
                onClick={() => withSwitch(selected.id_Company, () => navigate(`/companyIntegrations/${selected.id_Company}`))}>
                <FiSettings size={15} />
              </button>
              {isMaster && (
                <button className="rd-action-btn danger" title="Ištrinti"
                  onClick={() => deleteCompany(selected)}>
                  <FiTrash2 size={15} />
                </button>
              )}
            </>
          ) : null
        }
      />
    </div>
  );
}