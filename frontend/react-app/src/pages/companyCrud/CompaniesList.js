import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import TableToolbar from "../../components/TableToolbar";
import RightDrawer from "../../components/RightDrawers/RightDrawerSidebar";
import {
  FiEdit, FiTrash2, FiUsers, FiCheckCircle, FiXCircle, FiSettings, FiMapPin, FiHash, FiMail, FiPhone
} from "react-icons/fi";
import { useAuth } from "../../services/AuthContext";
import "../../styles/CompaniesList.css";
import { companiesApi } from "../../services/api";
const API = (process.env.REACT_APP_API_URL || "/api").replace(/\/api\/?$/, "");


// Deterministic hue from company name — gives each card a unique accent colour
function nameToHue(name = "") {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return h % 360;
}
function CompanyAvatar({ name, imageUrl, size = 48 }) {
  const hue = nameToHue(name);
  const initials = name ? name.slice(0, 2).toUpperCase() : "?";
  const [imgErr, setImgErr] = useState(false);

  if (imageUrl && !imgErr) {
    const src = imageUrl.startsWith("http") ? imageUrl : `${API}${imageUrl}`;
    return (
      <img
        className="co-avatar co-avatar--img"
        src={src}
        alt={name}
        style={{ width: size, height: size }}
        onError={() => setImgErr(true)}
      />
    );
  }
  return (
    <div
      className="co-avatar co-avatar--initials"
      style={{
        width: size, height: size,
        background: `hsl(${hue} 60% 92%)`,
        color: `hsl(${hue} 55% 35%)`,
        fontSize: size * 0.33,
      }}
    >
      {initials}
    </div>
  );
}
function CompanyCard({ c, index, onClick }) {
  const hue = nameToHue(c.name);

  return (
    <button
      type="button"
      className="co-card"
      onClick={onClick}
      style={{ "--card-hue": hue, animationDelay: `${index * 40}ms` }}
    >
      <div className="co-card-accent" />

      <div className="co-card-inner">
        {/* Head: avatar + name + status */}
        <div className="co-card-head">
          <CompanyAvatar name={c.name} imageUrl={c.image} size={44} />
          <div className="co-card-title">
            <div className="co-card-name">{c.name}</div>
            <div className="co-card-code">
              <FiHash size={9} />
              {c.code || c.id_Company}
            </div>
          </div>
          <div className={`co-card-status ${c.active ? "is-active" : "is-inactive"}`}>
            {c.active ? <FiCheckCircle size={10} /> : <FiXCircle size={10} />}
            {c.active ? "Aktyvi" : "Neaktyvi"}
          </div>
        </div>

        <div className="co-card-divider" />

        {/* Foot: contact details */}
        <div className="co-card-foot">
          {c.email && (
            <span className="co-detail">
              <FiMail size={11} />{c.email}
            </span>
          )}
          {c.phoneNumber && (
            <span className="co-detail">
              <FiPhone size={11} />{c.phoneNumber}
            </span>
          )}
          {(c.shippingStreet || c.shippingCity) && (
            <span className="co-detail">
              <FiMapPin size={11} />
              {[c.shippingStreet, c.shippingCity].filter(Boolean).join(", ")}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

export default function CompaniesList() {
  const navigate = useNavigate();
  const { user, activeCompanyId, switchCompany } = useAuth();
  const isMaster = !!user?.isMasterAdmin;

  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    companiesApi.getAll().then(data => setItems(Array.isArray(data) ? data : [])).catch(console.error);
  }, []);

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
    if (!window.confirm(`Ištrinti įmonę "${c.name}"?`)) return;
    try {
      await companiesApi.remove(c.id_Company);
      setItems(prev => prev.filter(x => x.id_Company !== c.id_Company));
      setSelected(null);
    } catch (e) { console.error(e); alert("Nepavyko ištrinti įmonės"); }
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

          <button className="rd-action-btn" title="Konfigūruoti"
            onClick={() => withSwitch(selected.id_Company, () => navigate(`/companyIntegrations/${selected.id_Company}`))}>
            <FiSettings size={15} />
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

    // Build addresses from structured fields, fall back to legacy
    const shippingParts = [
      c.shippingStreet,
      c.shippingCity,
      c.shippingPostalCode,
      c.shippingCountry,
    ].filter(Boolean);
    const shippingAddr = shippingParts.length
      ? shippingParts.join(", ")
      : (c.shippingAddress || "—");

    const returnParts = [
      c.returnStreet,
      c.returnCity,
      c.returnPostalCode,
      c.returnCountry,
    ].filter(Boolean);
    const returnAddr = returnParts.length
      ? returnParts.join(", ")
      : (c.returnAddress || "—");

    return [
      {
        title: "Bendra informacija",
        rows: [
          { label: "Įmonės kodas", value: c.code || "—" },
          { label: "Dokumento kodas", value: c.documentCode || "—" },
          { label: "Būsena", value: c.active ? "Aktyvi" : "Neaktyvi" },
          {
            label: "Sukurta",
            value: c.creationDate
              ? new Date(c.creationDate).toLocaleDateString("lt-LT")
              : "—",
          },
        ],
      },
      {
        title: "Kontaktai",
        rows: [
          { label: "El. paštas", value: c.email || "—" },
          { label: "Telefonas", value: c.phoneNumber || "—" },
        ],
      },
      {
        title: "Adresai",
        rows: [
          { label: "Juridinis adresas", value: c.address || "—" },
          { label: "Siuntimo", value: shippingAddr },
          { label: "Grąžinimo", value: returnAddr },
        ],
      },
    ];
  }, [selected]);
  return (
    <div className="user-cointainer">
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

      {!isMaster && <style>{`.tb-header-right button{display:none;}`}</style>}

      <div className="co-grid">
        {filtered.length === 0
          ? <div className="co-empty">Nėra įmonių pagal pasirinktus filtrus</div>
          : filtered.map((c, i) => (
            <CompanyCard
              key={c.id_Company}
              c={c}
              index={i}
              onClick={() => setSelected(c)}
            />
          ))
        }
      </div>

      <RightDrawer
        variant="company"
        open={!!selected}
        title={selected?.name ?? ""}
        subtitle={selected
          ? (selected.code ? `Kodas: ${selected.code}` : `ID: ${selected.id_Company}`)
          : ""}
        hero={companyHero}
        sections={drawerSections}
        onClose={() => setSelected(null)}
      />
    </div>

  );
}
