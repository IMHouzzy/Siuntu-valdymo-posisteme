import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import TableToolbar from "../../components/TableToolbar";
import RightDrawer from "../../components/RightDrawerSidebar";
import { FiEdit, FiTrash2, FiUsers, FiCheckCircle, FiXCircle, FiSettings } from "react-icons/fi";
import { useAuth } from "../../services/AuthContext";
import "../../styles/CompaniesList.css";

const API = "http://localhost:5065";

async function apiFetch(url, token, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
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
          {c.active ? (
            <>
              <FiCheckCircle /> Aktyvi
            </>
          ) : (
            <>
              <FiXCircle /> Neaktyvi
            </>
          )}
        </div>
      </div>

      <div className="co-card-meta">
        <div className="co-meta-row">
          <span className="co-meta-label">El. paštas</span>
          <span className="co-meta-value">{c.email || "-"}</span>
        </div>
        <div className="co-meta-row">
          <span className="co-meta-label">Telefonas</span>
          <span className="co-meta-value">{c.phoneNumber || "-"}</span>
        </div>
        <div className="co-meta-row">
          <span className="co-meta-label">Adresas</span>
          <span className="co-meta-value">{c.address || "-"}</span>
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
  const [status, setStatus] = useState("all"); // all | active | inactive

  const load = async () => {
    if (!token) return;
    const data = await apiFetch(`${API}/api/companies`, token);
    setItems(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    load().catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const statusFilters = useMemo(() => {
    const activeCount = items.filter((x) => !!x.active).length;
    const inactiveCount = items.length - activeCount;
    return [
      { label: "Visos", value: "all", count: items.length },
      { label: "Aktyvios", value: "active", count: activeCount },
      { label: "Neaktyvios", value: "inactive", count: inactiveCount },
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
        const name = String(c.name ?? "").toLowerCase();
        const code = String(c.code ?? "").toLowerCase();
        const email = String(c.email ?? "").toLowerCase();
        const phone = String(c.phoneNumber ?? "").toLowerCase();
        const address = String(c.address ?? "").toLowerCase();
        return (
          name.includes(s) ||
          code.includes(s) ||
          email.includes(s) ||
          phone.includes(s) ||
          address.includes(s)
        );
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

  const drawerSections = selected
    ? [
      {
        title: "Įmonės informacija",
        rows: [
          { label: "Pavadinimas", value: selected.name || "-" },
          { label: "Kodas", value: selected.code || "-" },
          { label: "Aktyvi", value: selected.active ? "Taip" : "Ne" },
          { label: "El. paštas", value: selected.email || "-" },
          { label: "Telefonas", value: selected.phoneNumber || "-" },
          { label: "Adresas", value: selected.address || "-" },
          { label: "Siuntimo adresas", value: selected.shippingAddress || "-" },
          { label: "Grąžinimo adresas", value: selected.returnAddress || "-" },
          { label: "Dokumento kodas", value: selected.documentCode || "-" },
          {
            label: "Sukurta",
            value: selected.creationDate ? new Date(selected.creationDate).toLocaleDateString("lt-LT") : "-",
          },
        ],
      },
    ]
    : [];

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
        rightHeader={
          !isMaster ? (
            <div className="co-hint"></div>
          ) : null
        }
      />

      {/* master-only: hide add button visually if not master */}
      {!isMaster ? (
        <style>{`.tb-header-right button{display:none;}`}</style>
      ) : null}

      <div className="co-grid">
        {filtered.length === 0 ? (
          <div className="co-empty">Nėra įmonių</div>
        ) : (
          filtered.map((c) => (
            <CompanyCard
              key={c.id_Company}
              c={c}
              onClick={() => setSelected(c)}
            />
          ))
        )}
      </div>

      <RightDrawer
        open={!!selected}
        title={selected ? selected.name : ""}
        subtitle={selected ? (selected.code ? `Kodas: ${selected.code}` : `ID: ${selected.id_Company}`) : ""}
        sections={drawerSections}
        onClose={() => setSelected(null)}
        actions={
          selected ? (
            <>
              <button
                className="rd-action-btn"
                onClick={async () => {
                  try {
                    if (activeCompanyId !== selected.id_Company) await switchCompany(selected.id_Company);
                  } catch (e) {
                    console.error(e);
                  }
                  navigate(`/companyEdit/${selected.id_Company}`);
                }}
              >
                <FiEdit /> Redaguoti
              </button>

              <button
                className="rd-action-btn"
                onClick={async () => {
                  try {
                    if (activeCompanyId !== selected.id_Company) await switchCompany(selected.id_Company);
                  } catch (e) {
                    console.error(e);
                  }
                  navigate(`/companyMembers/${selected.id_Company}`);
                }}
              >
                <FiUsers /> Nariai
              </button>
              <button
                className="rd-action-btn"
                onClick={async () => {
                  try {
                    if (activeCompanyId !== selected.id_Company) await switchCompany(selected.id_Company);
                  } catch (e) {
                    console.error(e);
                  }
                   navigate(`/companyIntegrations/${selected.id_Company}`)
                }}
              >
                <FiSettings /> Konfigūruoti
              </button>
              {isMaster ? (
                <button
                  className="rd-action-btn danger"
                  onClick={() => deleteCompany(selected)}
                >
                  <FiTrash2 /> Ištrinti
                </button>
              ) : null}
            </>
          ) : null
        }
      />
    </div>
  );
}