// pages/CompanyIntegrations/CompanyIntegrations.jsx

import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FiSave, FiTrash2, FiRefreshCcw, FiTruck,
  FiPlus, FiEdit2, FiX, FiCheck, FiDatabase, FiBriefcase
} from "react-icons/fi";
import { useAuth } from "../../services/AuthContext";
import "../../styles/UserPage.css";
import "../../styles/CompanyIntegrations.css";

const API = "http://localhost:5065";

async function apiFetch(url, token, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(t || `HTTP ${res.status}`);
  }
  if (res.status === 204) return null;

  // Guard against empty body — PUT /couriers/{id} returns 200 with no body
  const text = await res.text();
  if (!text) return null;
  return JSON.parse(text);
}

// ── Integration panel (unchanged) ────────────────────────────────────────────

function IntegrationPanel({ title, typeKey, existing, onSave, onDelete, loading, defaultBaseUrl = "" }) {
  const [enabled, setEnabled] = useState(true);
  const [baseUrl, setBaseUrl] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!existing) return;
    setEnabled(!!existing.enabled);
    setBaseUrl(existing.baseUrl || "");
    setUsername("");
    setPassword("");
  }, [existing]);

  const handleSave = () => {
    if (!username.trim() || !password.trim()) {
      alert("Įvesk Username ir Password (jie nėra rodomi po išsaugojimo).");
      return;
    }
    onSave({ type: typeKey, baseUrl, username, password, enabled });
    setPassword("");
  };

  const isActive = existing?.enabled;

  return (
    <div className="ci-panel">
      <div className="ci-panel-header">
        <div className="ci-panel-title">
          {title}
        </div>
        <div className={`ci-pill ${isActive ? "is-on" : "is-off"}`}>
          {isActive ? "Aktyvi" : "Neaktyvi"}
        </div>
      </div>

      <div className="ci-grid">
        <label className="ci-field">
          <span className="ci-label">Base URL</span>
          <input className="ci-input" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)}
            placeholder={defaultBaseUrl || "https://..."} />
        </label>
        <label className="ci-field">
          <span className="ci-label">Enabled</span>
          <select className="ci-input" value={enabled ? "true" : "false"}
            onChange={(e) => setEnabled(e.target.value === "true")}>
            <option value="true">Taip</option>
            <option value="false">Ne</option>
          </select>
        </label>
        <label className="ci-field">
          <span className="ci-label">Username</span>
          <input className="ci-input" value={username} onChange={(e) => setUsername(e.target.value)}
            placeholder="Įvesk username" autoComplete="off" />
        </label>
        <label className="ci-field">
          <span className="ci-label">Password</span>
          <input className="ci-input" type="password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Įvesk password" autoComplete="new-password" />
        </label>
      </div>

      <div className="ci-actions">
        <button className="ci-btn ci-btn-primary" onClick={handleSave} disabled={loading} type="button">
          <FiSave size={15} /> Išsaugoti
        </button>
        <button className="ci-btn ci-btn-danger" onClick={onDelete}
          disabled={loading || !existing} type="button" title={!existing ? "Nėra ko trinti" : "Ištrinti integraciją"}>
          <FiTrash2 size={15} /> Ištrinti
        </button>
        <div className="ci-help">
          Username / Password po išsaugojimo nebus rodomi. Norint pakeisti – įvesk naujus ir spausk „Išsaugoti".
        </div>
      </div>
    </div>
  );
}

// ── Inline editable courier row ───────────────────────────────────────────────

function CourierRow({ courier, onSave, onDelete, saving }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(courier.name);
  const [phone, setPhone] = useState(courier.contactPhone || "");
  const [days, setDays] = useState(courier.deliveryTermDays ?? "");
  const [price, setPrice] = useState(courier.deliveryPrice ?? "");

  const reset = () => {
    setName(courier.name);
    setPhone(courier.contactPhone || "");
    setDays(courier.deliveryTermDays ?? "");
    setPrice(courier.deliveryPrice ?? "");
    setEditing(false);
  };

  const submit = () => {
    if (!name.trim()) return;
    onSave(courier.id ?? courier.id_Courier, {
      name: name.trim(),
      contactPhone: phone.trim() || null,
      deliveryTermDays: days !== "" ? Number(days) : null,
      deliveryPrice: price !== "" ? Number(price) : null,
    });
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="ci-courier-row ci-courier-row--editing">
        <input className="ci-input ci-courier-input" value={name}
          onChange={(e) => setName(e.target.value)} placeholder="Pavadinimas *" />
        <input className="ci-input ci-courier-input" value={phone}
          onChange={(e) => setPhone(e.target.value)} placeholder="Telefonas" />
        <input className="ci-input ci-courier-input" type="number" min="1" value={days}
          onChange={(e) => setDays(e.target.value)} placeholder="Dienų" />
        <input className="ci-input ci-courier-input" type="number" min="0" step="0.01" value={price}
          onChange={(e) => setPrice(e.target.value)} placeholder="Kaina €" />
        <div className="ci-courier-row-actions">
          <button className="ci-icon-btn ci-icon-btn--save" type="button"
            onClick={submit} disabled={!name.trim() || saving} title="Išsaugoti">
            <FiCheck size={15} />
          </button>
          <button className="ci-icon-btn ci-icon-btn--cancel" type="button"
            onClick={reset} title="Atšaukti">
            <FiX size={15} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ci-courier-row">
      <div className="ci-courier-name">{courier.name}</div>
      <div className="ci-courier-meta">{courier.contactPhone || "—"}</div>
      <div className="ci-courier-meta">
        {courier.deliveryTermDays != null ? `${courier.deliveryTermDays} d.` : "—"}
      </div>
      <div className="ci-courier-meta">
        {courier.deliveryPrice != null ? `€${Number(courier.deliveryPrice).toFixed(2)}` : "—"}
      </div>
      <div className="ci-courier-row-actions">
        <button className="ci-icon-btn" type="button" onClick={() => setEditing(true)} title="Redaguoti">
          <FiEdit2 size={14} />
        </button>
        <button className="ci-icon-btn ci-icon-btn--danger" type="button"
          onClick={() => onDelete(courier.id ?? courier.id_Courier)} title="Ištrinti">
          <FiTrash2 size={14} />
        </button>
      </div>
    </div>
  );
}

// ── Add courier form (inline at bottom of list) ───────────────────────────────

function AddCourierRow({ onAdd, saving }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [days, setDays] = useState("");
  const [price, setPrice] = useState("");

  const reset = () => { setName(""); setPhone(""); setDays(""); setPrice(""); setOpen(false); };

  const submit = () => {
    if (!name.trim()) return;
    onAdd({
      name: name.trim(),
      contactPhone: phone.trim() || null,
      deliveryTermDays: days !== "" ? Number(days) : null,
      deliveryPrice: price !== "" ? Number(price) : null,
    });
    reset();
  };

  if (!open) {
    return (
      <button className="ci-courier-add-btn" type="button" onClick={() => setOpen(true)}>
        <FiPlus size={14} /> Pridėti kurjerį
      </button>
    );
  }

  return (
    <div className="ci-courier-row ci-courier-row--editing ci-courier-row--new">
      <input className="ci-input ci-courier-input" value={name} autoFocus
        onChange={(e) => setName(e.target.value)} placeholder="Pavadinimas *" />
      <input className="ci-input ci-courier-input" value={phone}
        onChange={(e) => setPhone(e.target.value)} placeholder="Telefonas" />
      <input className="ci-input ci-courier-input" type="number" min="1" value={days}
        onChange={(e) => setDays(e.target.value)} placeholder="Dienų" />
      <input className="ci-input ci-courier-input" type="number" min="0" step="0.01" value={price}
        onChange={(e) => setPrice(e.target.value)} placeholder="Kaina €" />
      <div className="ci-courier-row-actions">
        <button className="ci-icon-btn ci-icon-btn--save" type="button"
          onClick={submit} disabled={!name.trim() || saving} title="Pridėti">
          <FiCheck size={15} />
        </button>
        <button className="ci-icon-btn ci-icon-btn--cancel" type="button"
          onClick={reset} title="Atšaukti">
          <FiX size={15} />
        </button>
      </div>
    </div>
  );
}

// ── Custom couriers panel ─────────────────────────────────────────────────────

function CustomCouriersPanel({ companyId, token }) {
  const [couriers, setCouriers] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiFetch(`${API}/api/companies/${companyId}/couriers`, token);
      // Only show couriers owned by this company (not global/provider ones)
      setCouriers((Array.isArray(data) ? data : []).filter((c) => c.isOwn));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (token) load(); }, [token, companyId]); // eslint-disable-line

  const handleAdd = async (dto) => {
    setLoading(true);
    try {
      await apiFetch(`${API}/api/companies/${companyId}/couriers`, token, {
        method: "POST", body: JSON.stringify(dto),
      });
      await load();
    } catch (e) { alert(e.message || "Nepavyko pridėti kurjerio"); }
    finally { setLoading(false); }
  };

  const handleSave = async (courierId, dto) => {
    setLoading(true);
    try {
      await apiFetch(`${API}/api/companies/${companyId}/couriers/${courierId}`, token, {
        method: "PUT", body: JSON.stringify(dto),
      });
      await load();
    } catch (e) { alert(e.message || "Nepavyko išsaugoti kurjerio"); }
    finally { setLoading(false); }
  };

  const handleDelete = async (courierId) => {
    if (!window.confirm("Ištrinti šį kurjerį?")) return;
    setLoading(true);
    try {
      await apiFetch(`${API}/api/companies/${companyId}/couriers/${courierId}`, token, {
        method: "DELETE",
      });
      await load();
    } catch (e) { alert(e.message || "Nepavyko ištrinti kurjerio"); }
    finally { setLoading(false); }
  };

  return (
    <div className="ci-panel">
      <div className="ci-panel-header">
        <div className="ci-panel-title">
          <FiBriefcase size={16} style={{ marginRight: 6 }} />
          Įmonės kurjeriai
        </div>
        <div className="ci-pill is-on">{couriers.length} vnt.</div>
      </div>

      {/* Column headers */}
      <div className="ci-courier-header">
        <span>Pavadinimas</span>
        <span>Telefonas</span>
        <span>Pristatymo laikas</span>
        <span>Kaina</span>
        <span />
      </div>

      {loading && couriers.length === 0 ? (
        <div className="ci-muted" style={{ padding: "12px 0" }}>Kraunama…</div>
      ) : couriers.length === 0 ? (
        <div className="ci-muted" style={{ padding: "12px 0" }}>Nėra kurjerių. Pridėkite pirmąjį.</div>
      ) : (
        couriers.map((c) => (
          <CourierRow
            key={c.id ?? c.id_Courier}
            courier={c}
            onSave={handleSave}
            onDelete={handleDelete}
            saving={loading}
          />
        ))
      )}

      <AddCourierRow onAdd={handleAdd} saving={loading} />
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function CompanyIntegrations() {
  const { companyId } = useParams();
  const { token } = useAuth();

  const [loading, setLoading] = useState(false);
  const [integrations, setIntegrations] = useState([]);

  const butentExisting = useMemo(
    () => integrations.find((x) => x.type?.toUpperCase() === "BUTENT") ?? null,
    [integrations]
  );
  const dpdExisting = useMemo(
    () => integrations.find((x) => x.type?.toUpperCase() === "DPD") ?? null,
    [integrations]
  );

  const load = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await apiFetch(`${API}/api/companies/${companyId}/integrations`, token);
      setIntegrations(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      alert(e.message || "Nepavyko užkrauti integracijų");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [token, companyId]); // eslint-disable-line

  const handleSave = async (endpointKey, payload) => {
    setLoading(true);
    try {
      await apiFetch(`${API}/api/companies/${companyId}/integrations/${endpointKey}`, token, {
        method: "PUT", body: JSON.stringify(payload),
      });
      alert(`${endpointKey.toUpperCase()} integracija išsaugota.`);
      await load();
    } catch (e) {
      alert(e.message || "Nepavyko išsaugoti integracijos");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (endpointKey, label) => {
    if (!window.confirm(`Ištrinti ${label} integraciją šiai įmonei?`)) return;
    setLoading(true);
    try {
      await apiFetch(`${API}/api/companies/${companyId}/integrations/${endpointKey}`, token, {
        method: "DELETE",
      });
      alert(`${label} integracija ištrinta.`);
      await load();
    } catch (e) {
      alert(e.message || "Nepavyko ištrinti integracijos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-cointainer">
      <div className="ci-page-header">
        <div className="ci-page-title">
          Integracijos <span className="ci-page-sub">(Įmonė #{companyId})</span>
        </div>
        <button className="ci-top-btn" onClick={load} disabled={loading} type="button" title="Atnaujinti">
          <FiRefreshCcw /> Atnaujinti
        </button>
      </div>

      <IntegrationPanel
         title={
          <span style={{ display: "flex", alignItems: "center" }}>
            <FiDatabase  size={16} style={{ marginRight: 6 }} />
            BŪTENT (apskaitos sistema)
          </span>
        }
        typeKey="BŪTENT"
        existing={butentExisting}
        loading={loading}
        defaultBaseUrl="http://localhost:3000/api/v1/"
        onSave={(p) => handleSave("butent", p)}
        onDelete={() => handleDelete("butent", "BŪTENT")}
      />

      <IntegrationPanel
        title={
          <span style={{ display: "flex", alignItems: "center" }}>
            <FiTruck size={16} style={{ marginRight: 6 }} />
            DPD (kurjerių tarnyba)
          </span>
        }
        typeKey="DPD"
        existing={dpdExisting}
        loading={loading}
        defaultBaseUrl="https://sandbox-esiunta.dpd.lt/api/v1/"
        onSave={(p) => handleSave("dpd", p)}
        onDelete={() => handleDelete("dpd", "DPD")}
      />

      {/* Custom couriers — fully independent from integrations API */}
      <CustomCouriersPanel companyId={companyId} token={token} />
    </div>
  );
}