import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { FiSave, FiTrash2, FiRefreshCcw } from "react-icons/fi";
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
  return res.json();
}

export default function CompanyIntegrations() {
  const { companyId } = useParams();
  const { token } = useAuth();

  const [loading, setLoading] = useState(false);
  const [integrations, setIntegrations] = useState([]);

  const butentExisting = useMemo(
    () => integrations.find((x) => String(x.type).toUpperCase() === "BUTENT") || null,
    [integrations]
  );

  const [butentEnabled, setButentEnabled] = useState(true);
  const [butentBaseUrl, setButentBaseUrl] = useState("");
  const [butentUsername, setButentUsername] = useState("");
  const [butentPassword, setButentPassword] = useState("");

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

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, companyId]);

  useEffect(() => {
    if (!butentExisting) return;
    setButentEnabled(!!butentExisting.enabled);
    setButentBaseUrl(butentExisting.baseUrl || "");
    setButentUsername("");
    setButentPassword("");
  }, [butentExisting]);

  const saveButent = async () => {
    if (!token) return;

    if (!butentUsername?.trim() || !butentPassword?.trim()) {
      alert("Įvesk Username ir Password (jie nėra rodomi po išsaugojimo).");
      return;
    }

    setLoading(true);
    try {
      await apiFetch(`${API}/api/companies/${companyId}/integrations/butent`, token, {
        method: "PUT",
        body: JSON.stringify({
          type: "BUTENT",
          baseUrl: butentBaseUrl,
          username: butentUsername,
          password: butentPassword,
          enabled: butentEnabled,
        }),
      });

      alert("BUTENT integracija išsaugota.");
      await load();
      setButentPassword("");
    } catch (e) {
      console.error(e);
      alert(e.message || "Nepavyko išsaugoti BUTENT integracijos");
    } finally {
      setLoading(false);
    }
  };

  const deleteButent = async () => {
    const ok = window.confirm("Ištrinti BUTENT integraciją šiai įmonei?");
    if (!ok) return;

    setLoading(true);
    try {
      await apiFetch(`${API}/api/companies/${companyId}/integrations/butent`, token, {
        method: "DELETE",
      });

      alert("BUTENT integracija ištrinta.");
      await load();
      setButentBaseUrl("");
      setButentUsername("");
      setButentPassword("");
      setButentEnabled(true);
    } catch (e) {
      console.error(e);
      alert(e.message || "Nepavyko ištrinti BUTENT integracijos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-cointainer">
      {/* Header kaip tavo kituose puslapiuose: title left, refresh right */}
      <div className="ci-page-header">
        <div className="ci-page-title">
          Integracijos <span className="ci-page-sub">(Įmonė #{companyId})</span>
        </div>

        <button
          className="ci-top-btn"
          onClick={load}
          disabled={loading}
          type="button"
          title="Atnaujinti integracijas"
        >
          <FiRefreshCcw />
          Atnaujinti
        </button>
      </div>

      <div className="ci-panel">
        <div className="ci-panel-header">
          <div className="ci-panel-title">BUTENT (apskaitos sistema)</div>

          <div className={`ci-pill ${butentExisting?.enabled ? "is-on" : "is-off"}`}>
            {butentExisting?.enabled ? "Aktyvi" : "Neaktyvi"}
          </div>
        </div>

        <div className="ci-grid">
          <label className="ci-field">
            <span className="ci-label">Base URL</span>
            <input
              className="ci-input"
              value={butentBaseUrl}
              onChange={(e) => setButentBaseUrl(e.target.value)}
              placeholder="http://localhost:3000/api/v1/"
            />
          </label>

          <label className="ci-field">
            <span className="ci-label">Enabled</span>
            <select
              className="ci-input"
              value={butentEnabled ? "true" : "false"}
              onChange={(e) => setButentEnabled(e.target.value === "true")}
            >
              <option value="true">Taip</option>
              <option value="false">Ne</option>
            </select>
          </label>

          <label className="ci-field">
            <span className="ci-label">Username</span>
            <input
              className="ci-input"
              value={butentUsername}
              onChange={(e) => setButentUsername(e.target.value)}
              placeholder="Įvesk username"
            />
          </label>

          <label className="ci-field">
            <span className="ci-label">Password</span>
            <input
              className="ci-input"
              type="password"
              value={butentPassword}
              onChange={(e) => setButentPassword(e.target.value)}
              placeholder="Įvesk password"
            />
          </label>
        </div>

        <div className="ci-actions">
          <button
            className="ci-btn ci-btn-primary"
            onClick={saveButent}
            disabled={loading}
            type="button"
          >
            <FiSave /> Išsaugoti
          </button>

          <button
            className="ci-btn ci-btn-danger"
            onClick={deleteButent}
            disabled={loading || !butentExisting}
            type="button"
            title={!butentExisting ? "Nėra ko trinti" : "Ištrinti integraciją"}
          >
            <FiTrash2 /> Ištrinti
          </button>

          <div className="ci-help">
            Username/Password po išsaugojimo nebus rodomi. Norint pakeisti – įvesk naujus ir spausk „Išsaugoti“.
          </div>
        </div>
      </div>

      <div className="ci-panel">
        <div className="ci-panel-header">
          <div className="ci-panel-title">Kurjerių tarnybos (bus vėliau)</div>
        </div>

        <div className="ci-muted">

        </div>
      </div>
    </div>
  );
}