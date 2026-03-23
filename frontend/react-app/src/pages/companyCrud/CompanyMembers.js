import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import DataTable from "../../components/DataTable";
import SearchSelect from "../../components/SearchSelect";
import { useAuth } from "../../services/AuthContext";
import { FiTrash2, FiArrowLeft  } from "react-icons/fi";
import "../../styles/UserPage.css";
import "../../styles/CompanyMembers.css";
const API = "http://localhost:5065";

async function apiFetch(url, token, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
    },
  });

  // read body safely (some endpoints return empty body)
  const text = await res.text().catch(() => "");

  if (!res.ok) {
    // try show backend error message (plain text or json)
    try {
      const j = text ? JSON.parse(text) : null;
      const msg =
        (j && (j.message || j.error || j.title)) ||
        (typeof j === "string" ? j : null) ||
        text;
      throw new Error(msg || `HTTP ${res.status}`);
    } catch {
      throw new Error(text || `HTTP ${res.status}`);
    }
  }

  if (res.status === 204) return null;
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

const ROLE_OPTIONS = [
  { value: "OWNER", label: "Savininkas" },
  { value: "ADMIN", label: "Administratorius" },
  { value: "STAFF", label: "Darbuotojas" },
  { value: "COURIER", label: "Kurjeris" }, 
];

export default function CompanyMembers() {
  const { id } = useParams();
  const companyId = Number(id);
  const navigate = useNavigate();

  const { token, user, activeCompanyId, switchCompany, setCompanySwitchLocked } = useAuth();
  const isMaster = !!user?.isMasterAdmin;
  const myUserId = Number(user?.id || 0);

  const [company, setCompany] = useState(null);
  const [members, setMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  const [pickUserId, setPickUserId] = useState("");
  const [pickRole, setPickRole] = useState("STAFF");
  const [busyId, setBusyId] = useState(null); // for row operations

  // ✅ tik MASTER automatiškai persijungia į įmonę kurią valdo šiame puslapyje
  useEffect(() => {
    if (!token || !companyId) return;
    if (!isMaster) return;

    setCompanySwitchLocked(true);

    (async () => {
      try {
        if (activeCompanyId !== companyId) await switchCompany(companyId);
      } catch (e) {
        console.error(e);
      }
    })();

    return () => setCompanySwitchLocked(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, companyId, isMaster]);

  const load = async () => {
    const [c, m] = await Promise.all([
      apiFetch(`${API}/api/companies/${companyId}`, token),
      apiFetch(`${API}/api/companies/${companyId}/members`, token),
    ]);

    setCompany(c);
    setMembers(Array.isArray(m) ? m : []);
  };

  useEffect(() => {
    if (!token || !companyId) return;

    load().catch((e) => {
      console.error(e);
      alert("Nepavyko užkrauti narių");
      navigate("/companiesList");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, companyId]);

  // kandidatai "pridėti" (backend filtruos ir teises, ir 1-company staff/admin)
  useEffect(() => {
    if (!token || !companyId) return;

    apiFetch(`${API}/api/companies/${companyId}/assignable-users`, token)
      .then((u) => setAllUsers(Array.isArray(u) ? u : []))
      .catch((e) => {
        console.error(e);
        setAllUsers([]);
      });
  }, [token, companyId]);

  const userOptions = useMemo(() => {
    return allUsers.map((u) => ({
      value: String(u.id),
      label: `${u.name ?? ""} ${u.surname ?? ""}`.trim() || u.email || `ID ${u.id}`,
      meta: u.email,
    }));
  }, [allUsers]);

  // ✅ UI valdymas: master visur, paprastas admin tik savo aktyvioj įmonėj
  const canManageHere = isMaster || activeCompanyId === companyId;

  const columns = useMemo(
    () => [
      {
        key: "person",
        header: "Naudotojas",
        sortable: true,
        accessor: (m) => `${m.name ?? ""} ${m.surname ?? ""}`.trim(),
        cell: (_v, m) => (
          <div className="dt-cell-stack">
            <div className="dt-cell-primary">
              {(m.name || "") + " " + (m.surname || "")}
              {m.isMasterAdmin ? <span style={{ marginLeft: 8, opacity: 0.7 }}>(MASTER)</span> : null}
              {!isMaster && Number(m.userId) === myUserId ? (
                <span style={{ marginLeft: 8, opacity: 0.7 }}>(Jūs)</span>
              ) : null}
            </div>
            <div className="dt-cell-secondary">{m.email || "-"}</div>
          </div>
        ),
      },
      {
        key: "role",
        header: "Rolė",
        sortable: true,
        accessor: (m) => m.role,
        cell: (v, m) => {
          const isSelf = Number(m.userId) === myUserId;
          const isProtected = !!m.isMasterAdmin || (!isMaster && isSelf);

          // jei negalim valdyti arba protected -> tik tekstas
          if (!canManageHere || isProtected) return <span>{v || "-"}</span>;

          return (
            <select  className="co-dropdown"
              value={m.role || "STAFF"}
              disabled={busyId === m.userId}
              onClick={(e) => e.stopPropagation()}
              onChange={async (e) => {
                const nextRole = e.target.value;
                setBusyId(m.userId);

                try {
                  await apiFetch(`${API}/api/companies/${companyId}/members/${m.userId}`, token, {
                    method: "PUT",
                    body: JSON.stringify({ role: nextRole }),
                  });

                  setMembers((prev) =>
                    prev.map((x) => (x.userId === m.userId ? { ...x, role: nextRole } : x))
                  );
                } catch (err) {
                  console.error(err);
                  alert(err?.message || "Nepavyko pakeisti rolės");
                } finally {
                  setBusyId(null);
                }
              }}
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          );
        },
      },
      {
        key: "actions",
        header: "",
        width: 90,
        align: "right",
        cell: (_v, m) => {
          if (!canManageHere) return null;

          const isSelf = Number(m.userId) === myUserId;

          // paprastas admin negali:
          // - šalinti savęs
          // - šalinti master
          if (m.isMasterAdmin) return null;
          if (!isMaster && isSelf) return null;

          return (
            <button
              className="dt-icon-btn danger"
              title="Atimti teises (USER)"
              disabled={busyId === m.userId}
              onClick={async (e) => {
                e.stopPropagation();

                const ok = window.confirm(`Atimti teises iš ${m.email || m.userId}? (bus USER)`);
                if (!ok) return;

                setBusyId(m.userId);

                try {
                  await apiFetch(`${API}/api/companies/${companyId}/members/${m.userId}`, token, {
                    method: "DELETE",
                  });

                  // ✅ iškart dingsta iš lentelės (nes USER nerodomas members endpoint'e)
                  setMembers((prev) => prev.filter((x) => x.userId !== m.userId));
                } catch (err) {
                  console.error(err);
                  alert(err?.message || "Nepavyko");
                } finally {
                  setBusyId(null);
                }
              }}
            >
              <FiTrash2 />
            </button>
          );
        },
      },
    ],
    [companyId, token, canManageHere, myUserId, isMaster, busyId]
  );

  return (
    // <FormPageLayout title={`Įmonės ${company ? `${company.name} nariai:` : ""}`}>
    <div className="user-cointainer">
      <div className="co-members-wrapper">
        <h2 className="co-title-members">{`Įmonės ${company ? `${company.name} nariai:` : ""}`}</h2>
        {canManageHere ? (
          <div className="tb-tools tb-tools-flat">
            <div className="co-tool-left">
              <div style={{ minWidth: 320 }}>
                <SearchSelect
                  value={pickUserId}
                  options={userOptions}
                  placeholder="Pasirinkite naudotoją…"
                  onChange={(val) => setPickUserId(val)}
                />
              </div>

              <select className="co-dropdown" value={pickRole} onChange={(e) => setPickRole(e.target.value)}>
                {ROLE_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>

              <button
                className="sf-btn"
                type="button"
                disabled={!pickUserId}
                onClick={async () => {
                  try {
                    await apiFetch(`${API}/api/companies/${companyId}/members`, token, {
                      method: "POST",
                      body: JSON.stringify({ userId: Number(pickUserId), role: pickRole }),
                    });

                    setPickUserId("");
                    setPickRole("STAFF");

                    await load();
                  } catch (e) {
                    console.error(e);
                    alert(e?.message || "Nepavyko pridėti nario");
                  }
                }}
              >
                Pridėti
              </button>
            </div>
            <button className="sf-btn sf-btn-ghost" type="button" onClick={() => navigate(`/companyEdit/${companyId}`)}>
              Redaguoti įmonę
            </button>
          </div>
        ) : null}

        <DataTable
          title={null}
          columns={columns}
          rows={members}
          pageSize={25}
          getRowId={(m) => m.userId}
          emptyText="Nėra narių"
          initialSort={{ key: "person", dir: "asc" }}
        />
      </div>
    </div>

  );
}