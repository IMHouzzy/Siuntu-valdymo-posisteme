import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DataTable from "../../components/DataTable";
import SearchSelect from "../../components/SearchSelect";
import { useAuth } from "../../services/AuthContext";
import { FiTrash2 } from "react-icons/fi";
import "../../styles/UserPage.css";
import "../../styles/CompanyMembers.css";
import { companiesApi } from "../../services/api";

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

  // token removed — cookie handles auth, check user instead
  const { user, activeCompanyId, switchCompany, setCompanySwitchLocked } = useAuth();
  const isMaster = !!user?.isMasterAdmin;
  const myUserId = Number(user?.id || 0);

  const [company, setCompany] = useState(null);
  const [members, setMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [pickUserId, setPickUserId] = useState("");
  const [pickRole, setPickRole] = useState("STAFF");
  const [busyId, setBusyId] = useState(null);

  // Auto-switch company for master admin
  useEffect(() => {
    if (!companyId || !isMaster) return;
    setCompanySwitchLocked(true);
    if (activeCompanyId !== companyId) switchCompany(companyId).catch(console.error);
    return () => setCompanySwitchLocked(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, isMaster]);

  const load = async () => {
    const [c, m] = await Promise.all([
      companiesApi.getOne(companyId),
      companiesApi.getMembers(companyId),
    ]);
    setCompany(c);
    setMembers(Array.isArray(m) ? m : []);
  };

  // Removed `token` from deps — user presence is enough, cookie sends automatically
  useEffect(() => {
    if (!companyId) return;
    load().catch(e => {
      console.error(e);
      alert("Nepavyko užkrauti narių");
      navigate("/companiesList");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  useEffect(() => {
    if (!companyId) return;
    companiesApi.getAssignableUsers(companyId)
      .then(u => setAllUsers(Array.isArray(u) ? u : []))
      .catch(() => setAllUsers([]));
  }, [companyId]);

  const userOptions = useMemo(() =>
    allUsers.map(u => ({
      value: String(u.id),
      label: `${u.name ?? ""} ${u.surname ?? ""}`.trim() || u.email || `ID ${u.id}`,
      meta: u.email,
    })),
    [allUsers]);

  const canManageHere = isMaster || activeCompanyId === companyId;

  const columns = useMemo(() => [
    {
      key: "person", header: "Naudotojas", sortable: true,
      accessor: m => `${m.name ?? ""} ${m.surname ?? ""}`.trim(),
      cell: (_v, m) => (
        <div className="dt-cell-stack">
          <div className="dt-cell-primary">
            {(m.name || "") + " " + (m.surname || "")}
            {m.isMasterAdmin ? <span style={{ marginLeft: 8, opacity: 0.7 }}>(MASTER)</span> : null}
            {!isMaster && Number(m.userId) === myUserId
              ? <span style={{ marginLeft: 8, opacity: 0.7 }}>(Jūs)</span> : null}
          </div>
          <div className="dt-cell-secondary">{m.email || "-"}</div>
        </div>
      ),
    },
    {
      key: "role", header: "Rolė", sortable: true,
      accessor: m => m.role,
      cell: (v, m) => {
        const isSelf = Number(m.userId) === myUserId;
        const isProtected = !!m.isMasterAdmin || (!isMaster && isSelf);
        if (!canManageHere || isProtected) return <span>{v || "-"}</span>;
        return (
          <select className="co-dropdown"
            value={m.role || "STAFF"}
            disabled={busyId === m.userId}
            onClick={e => e.stopPropagation()}
            onChange={async e => {
              const nextRole = e.target.value;
              setBusyId(m.userId);
              try {
                await companiesApi.updateMember(companyId, m.userId, { role: nextRole });
                setMembers(prev => prev.map(x =>
                  x.userId === m.userId ? { ...x, role: nextRole } : x));
              } catch (err) {
                alert(err?.message || "Nepavyko pakeisti rolės");
              } finally { setBusyId(null); }
            }}
          >
            {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        );
      },
    },
    {
      key: "actions", header: "", width: 90, align: "right",
      cell: (_v, m) => {
        if (!canManageHere) return null;
        if (m.isMasterAdmin) return null;
        if (!isMaster && Number(m.userId) === myUserId) return null;
        return (
          <button className="dt-icon-btn danger" title="Atimti teises (USER)"
            disabled={busyId === m.userId}
            onClick={async e => {
              e.stopPropagation();
              if (!window.confirm(`Atimti teises iš ${m.email || m.userId}? (bus USER)`)) return;
              setBusyId(m.userId);
              try {
                await companiesApi.removeMember(companyId, m.userId);
                setMembers(prev => prev.filter(x => x.userId !== m.userId));
              } catch (err) {
                alert(err?.message || "Nepavyko");
              } finally { setBusyId(null); }
            }}>
            <FiTrash2 />
          </button>
        );
      },
    },
  ], [companyId, canManageHere, myUserId, isMaster, busyId]);

  return (
    <div className="user-cointainer">
      <div className="co-members-wrapper">
        <h2 className="co-title-members">{`Įmonės ${company ? `${company.name} nariai:` : ""}`}</h2>
        {canManageHere && (
          <div className="tb-tools tb-tools-flat">
            <div className="co-tool-left">
              <div style={{ minWidth: 320 }}>
                <SearchSelect value={pickUserId} options={userOptions}
                  placeholder="Pasirinkite naudotoją…"
                  onChange={val => setPickUserId(val)} />
              </div>
              <select className="co-dropdown" value={pickRole}
                onChange={e => setPickRole(e.target.value)}>
                {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
              <button className="sf-btn" type="button" disabled={!pickUserId}
                onClick={async () => {
                  try {
                    await companiesApi.addMember(companyId, { userId: Number(pickUserId), role: pickRole });
                    setPickUserId(""); setPickRole("STAFF");
                    await load();
                  } catch (e) { alert(e?.message || "Nepavyko pridėti nario"); }
                }}>
                Pridėti
              </button>
            </div>
            <button className="sf-btn sf-btn-ghost" type="button"
              onClick={() => navigate(`/companyEdit/${companyId}`)}>
              Redaguoti įmonę
            </button>
          </div>
        )}
        <DataTable columns={columns} rows={members} pageSize={25}
          getRowId={m => m.userId} emptyText="Nėra narių"
          initialSort={{ key: "person", dir: "asc" }} />
      </div>
    </div>
  );
}