import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../../components/DataTable";
import RightDrawer from "../../components/RightDrawers/RightDrawerSidebar";
import "../../styles/UserPage.css";
import TableToolbar from "../../components/TableToolbar";
import { FiTrash2, FiEdit, FiUser, FiShield, FiBriefcase, FiCopy, FiCheck } from "react-icons/fi";
import { useAuth } from "../../services/AuthContext";
import { usersApi } from "../../services/api";

const API = process.env.REACT_APP_API_BASE_URL || "http://localhost:5065";

function getInitials(name, surname) {
    return `${(name?.[0] ?? "").toUpperCase()}${(surname?.[0] ?? "").toUpperCase()}` || "?";
}

function UserCopyButton({ email }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(email).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        });
    };
    return (
        <button className="user-copy-btn" title={copied ? "Nukopijuota!" : "Kopijuoti el. paštą"} onClick={handleCopy}>
            {copied ? <FiCheck size={14} /> : <FiCopy size={14} />}
        </button>
    );
}

function getUserRole(user) {
    if (!user.membership?.position) return "Klientas";
    if (user.membership.position === "ADMIN") return "Administratorius";
    if (user.membership.position === "STAFF") return "Darbuotojas";
    return "Nežinoma";
}

function UsersList() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [q, setQ] = useState("");
    const [userType, setUserType] = useState("all");
    const { activeCompanyId } = useAuth();

    useEffect(() => {
        setUsers([]);
        setSelectedUser(null);
        usersApi.getAllWithClients().then(setUsers).catch(console.error);
    }, [activeCompanyId]);

    const deleteUser = async (p) => {
        if (!window.confirm(`Ištrinti naudotoją "${p.name} ${p.surname}"?`)) return;
        try {
            await usersApi.remove(p.id_Users);
            setUsers(prev => prev.filter(x => x.id_Users !== p.id_Users));
            setSelectedUser(null);
        } catch { alert("Ištrinti nepavyko"); }
    };

    const userFilters = useMemo(() => {
        const counts = {
            all:      users.length,
            client:   users.filter(u => !u.membership?.position).length,
            admin:    users.filter(u => u.membership?.position === "ADMIN").length,
            employee: users.filter(u => u.membership?.position === "STAFF").length,
        };
        return [
            { label: "Visi",        value: "all",      count: counts.all },
            { label: "Klientai",    value: "client",   count: counts.client },
            { label: "Admin",       value: "admin",    count: counts.admin },
            { label: "Darbuotojai", value: "employee", count: counts.employee },
        ];
    }, [users]);

    const filtered = useMemo(() => {
        const byType = users.filter(u => {
            if (userType === "all")      return true;
            if (userType === "client")   return !u.membership?.position;
            if (userType === "admin")    return u.membership?.position === "ADMIN";
            if (userType === "employee") return u.membership?.position === "STAFF";
            return true;
        });
        const s = q.trim().toLowerCase();
        if (!s) return byType;
        return byType.filter(p =>
            [p.name, p.surname, p.creationDate, p.email, p.phoneNumber,
             p.client?.city, p.client?.country, p.client?.deliveryAddress]
                .some(v => String(v ?? "").toLowerCase().includes(s))
        );
    }, [users, q, userType]);

    const columns = useMemo(() => [
        {
            key: "fullName", header: "Vardas, pavardė", sortable: true,
            accessor: u => `${u.name ?? ""} ${u.surname ?? ""}`.trim(),
            cell: (_v, u) => (
                <div className="dt-cell-stack">
                    <div className="dt-cell-primary">{u.name || "—"}</div>
                    <div className="dt-cell-secondary">{u.surname || "—"}</div>
                </div>
            ),
        },
        {
            key: "emailPhone", header: "El. paštas / Telefonas", sortable: true,
            accessor: u => u.email,
            cell: (_v, u) => (
                <div className="dt-cell-stack">
                    <div className="dt-cell-primary">{u.email || "—"}</div>
                    <div className="dt-cell-secondary">{u.phoneNumber || "—"}</div>
                </div>
            ),
        },
        {
            key: "location", header: "Vieta", sortable: true,
            accessor: u => `${u.client?.country ?? ""} ${u.client?.city ?? ""}`.trim(),
            cell: (_v, u) => (
                <div className="dt-cell-stack">
                    <div className="dt-cell-primary">{u.client?.country || "—"}</div>
                    <div className="dt-cell-secondary">{u.client?.city || "—"}</div>
                </div>
            ),
        },
        {
            key: "creationDate", header: "Sukūrimo data", sortable: true,
            accessor: u => new Date(u.creationDate),
            cell: v => v ? v.toLocaleDateString("lt-LT") : "—",
        },
        {
            key: "client", header: "Klientas", sortable: true,
            accessor: u => u.client ? "Taip" : "Ne",
        },
        {
            key: "actions", header: "", width: 80, align: "right",
            cell: (_v, p) => (
                <div className="dt-actions">
                    <button className="dt-icon-btn" title="Redaguoti"
                        onClick={e => { e.stopPropagation(); navigate(`/userEdit/${p.id_Users}`); }}>
                        <FiEdit />
                    </button>
                    <button className="dt-icon-btn danger" title="Ištrinti"
                        onClick={e => { e.stopPropagation(); deleteUser(p); }}>
                        <FiTrash2 />
                    </button>
                </div>
            ),
        },
    ], [users]);

    const userHero = useMemo(() => {
        if (!selectedUser) return null;
        const u = selectedUser;
        const initials = getInitials(u.name, u.surname);
        return (
            <>
                <div className="user-avatar-wrapper">
                    {u.avatar
                        ? <img className="user-avatar" src={`${API}${u.avatar}`} alt={u.name} />
                        : <div className="user-avatar-initials">{initials}</div>}
                    <div className="user-role-icon">
                        {getUserRole(u) === "Administratorius" && <FiShield />}
                        {getUserRole(u) === "Darbuotojas"      && <FiBriefcase />}
                        {getUserRole(u) === "Klientas"         && <FiUser />}
                    </div>
                </div>
                <div className="user-hero-info">
                    <div className="user-hero-name">{`${u.name ?? ""} ${u.surname ?? ""}`.trim() || "—"}</div>
                    <div className="user-hero-email-wrapper">
                        <span className="user-hero-email">{u.email || "—"}</span>
                        {u.email && <UserCopyButton email={u.email} />}
                    </div>
                </div>
                <div className="user-hero-actions">
                    <button className="rd-action-btn" title="Redaguoti" onClick={() => navigate(`/userEdit/${u.id_Users}`)}>
                        <FiEdit size={18} />
                    </button>
                    <button className="rd-action-btn danger" title="Ištrinti" onClick={() => deleteUser(u)}>
                        <FiTrash2 size={18} />
                    </button>
                </div>
            </>
        );
    }, [selectedUser]);

    const drawerSections = useMemo(() => {
        if (!selectedUser) return [];
        const u = selectedUser;
        const baseRows = [
            { label: "Telefonas", value: u.phoneNumber || "—" },
            { label: "Sukurta",   value: u.creationDate ? new Date(u.creationDate).toLocaleDateString("lt-LT") : "—" },
            { label: "Auth",      value: u.authProvider || "—" },
        ];
        const clientRows = u.client ? [
            { label: "Adresas",            value: u.client.deliveryAddress || "—" },
            { label: "Miestas",            value: u.client.city            || "—" },
            { label: "Šalis",              value: u.client.country         || "—" },
            { label: "PVM kodas",          value: u.client.vat             || "—" },
            { label: "Banko kodas",        value: u.client.bankCode        || "—" },
            { label: "Maks. skola",        value: u.client.maxDebt         || "—" },
            { label: "Išorinis kliento ID",value: u.client.externalClientId|| "—" },
        ] : [];
        const sections = [
            { title: "Kontaktai",      rows: baseRows },
            { title: "Kliento duomenys", rows: clientRows, emptyText: "Šis naudotojas neturi kliento duomenų." },
        ];
        if (u.membership?.position != null) {
            sections.push({
                title: "Darbuotojo duomenys",
                rows: [
                    { label: "Pareigos", value: (
                        <div className="position-icon-wrapper">
                            {u.membership.position === "ADMIN" ? <FiShield /> : <FiBriefcase />}
                            <span>{u.membership.position}</span>
                        </div>
                    )},
                    { label: "Darbo pradžia", value: u.membership.startDate ? new Date(u.membership.startDate).toLocaleDateString("lt-LT") : "—" },
                    { label: "Aktyvus",       value: u.membership.active ? "Taip" : "Ne" },
                ],
            });
        }
        return sections;
    }, [selectedUser]);

    return (
        <div className="user-cointainer">
            <TableToolbar
                title="Naudotojai"
                searchValue={q}
                onSearchChange={setQ}
                addLabel="Kurti naudotoją"
                onAdd={() => navigate("/userAdd")}
                filters={userFilters}
                filterValue={userType}
                onFilterChange={setUserType}
                connectBottom
            />
            <DataTable
                columns={columns}
                rows={filtered}
                pageSize={25}
                getRowId={u => u.id_Users}
                onRowClick={u => setSelectedUser(u)}
                emptyText="Nėra duomenų"
                initialSort={{ key: "fullName", dir: "asc" }}
            />
            <RightDrawer
                variant="user"
                open={!!selectedUser}
                title={selectedUser ? `${selectedUser.name ?? ""} ${selectedUser.surname ?? ""}`.trim() : ""}
                subtitle={selectedUser?.email ?? ""}
                hero={userHero}
                sections={drawerSections}
                onClose={() => setSelectedUser(null)}
                actions={selectedUser ? (
                    <>
                        <button className="rd-action-btn" title="Redaguoti" onClick={() => navigate(`/userEdit/${selectedUser.id_Users}`)}><FiEdit size={15} /></button>
                        <button className="rd-action-btn danger" title="Ištrinti" onClick={() => deleteUser(selectedUser)}><FiTrash2 size={15} /></button>
                    </>
                ) : null}
            />
        </div>
    );
}

export default UsersList;