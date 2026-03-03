import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../components/DataTable";
import RightDrawer from "../components/RightDrawerSidebar";
import "../styles/UserPage.css";
import TableToolbar from "../components/TableToolbar";
import { FiTrash2, FiEdit } from "react-icons/fi";
function UsersList() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [q, setQ] = useState("");
  const [userType, setUserType] = useState("all");
  useEffect(() => {
    fetch("http://localhost:5065/api/users/allUsersWithClients")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => setUsers(data))
      .catch((err) => console.error(err));
  }, []);
  const deleteUser = async (p) => {
    const ok = window.confirm(`Delete user "${p.name}"?`);
    if (!ok) return;

    const res = await fetch(`http://localhost:5065/api/users/deleteUser/${p.id_Users}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      alert("Delete failed");
      return;
    }

    setUsers((prev) => prev.filter((x) => x.id_Users !== p.id_Users));
    setSelectedUser(null);
  };
  const userFilters = useMemo(() => {
    const isClient = (u) => !!u.client;
    const isAdmin = (u) => !!u.admin;      // jei pas tave API grąžina admin objektą
    const isEmployee = (u) => !!u.employee;

    const counts = {
      all: users.length,
      client: users.filter(isClient).length,
      admin: users.filter(isAdmin).length,
      employee: users.filter(isEmployee).length,
    };

    return [
      { label: "Visi", value: "all", count: counts.all },
      { label: "Klientai", value: "client", count: counts.client },
      { label: "Admin", value: "admin", count: counts.admin },
      { label: "Darbuotojai", value: "employee", count: counts.employee },
    ];
  }, [users]);
  const filtered = useMemo(() => {
    const byType = users.filter((u) => {
      if (userType === "all") return true;
      if (userType === "client") return !!u.client;
      if (userType === "admin") return !!u.admin;
      if (userType === "employee") return !!u.employee;
      return true;
    });

    const s = q.trim().toLowerCase();
    if (!s) return byType;

    return byType.filter((p) => {
      const name = (p.name || "").toLowerCase();
      const surname = (p.surname || "").toLowerCase();
      const date = String(p.creationDate ?? "").toLowerCase();
      const email = String(p.email ?? "").toLowerCase();
      const phoneNumber = String(p.phoneNumber ?? "").toLowerCase();
      const city = String(p.client?.city ?? "").toLowerCase();
      const country = String(p.client?.country ?? "").toLowerCase();
      const deliveryAddress = String(p.client?.deliveryAddress ?? "").toLowerCase();

      return (
        name.includes(s) || surname.includes(s) || email.includes(s) ||
        phoneNumber.includes(s) || city.includes(s) || country.includes(s) ||
        deliveryAddress.includes(s) || date.includes(s)
      );
    });
  }, [users, q, userType]);
  const columns = useMemo(
    () => [

      {
        key: "fullName",
        header: "Vardas, pavardė",
        sortable: true,
        accessor: (u) => `${u.name ?? ""} ${u.surname ?? ""}`.trim(),
        cell: (_value, u) => (
          <div className="dt-cell-stack">
            <div className="dt-cell-primary">{u.name || "-"}</div>
            <div className="dt-cell-secondary">{u.surname || "-"}</div>
          </div>
        ),
      },
      {
        key: "emailPhone",
        header: "El.paštas / Telefonas",
        sortable: true,
        accessor: (u) => u.email,
        cell: (_value, u) => (
          <div className="dt-cell-stack">
            <div className="dt-cell-primary">{u.email || "-"}</div>
            <div className="dt-cell-secondary">{u.phoneNumber || "-"}</div>
          </div>
        ),
      },
      {
        key: "location",
        header: "Vieta",
        sortable: true,
        accessor: (u) => `${u.client?.country ?? ""} ${u.client?.city ?? ""}`.trim(),
        cell: (_value, u) => (
          <div className="dt-cell-stack">
            <div className="dt-cell-primary">{u.client?.country || "-"}</div>
            <div className="dt-cell-secondary">
              {(u.client?.city || " ") + " " + (u.client?.deliveryAddress || " ")}
            </div>
          </div>
        ),
      },
      { key: "creationDate", header: "Sukūrimo data", sortable: true, accessor: (u) => new Date(u.creationDate), cell: (v) => v ? v.toLocaleDateString("lt-LT") : "-" },
      {
        key: "client",
        header: "Klientas",
        accessor: (u) => (u.client ? "Taip" : "Ne"),
        sortable: true,
      },
      {
        key: "actions",
        header: "",
        width: 80,
        align: "right",
        cell: (_v, p) => (
          <div className="dt-actions">
            <button
              className="dt-icon-btn"
              title="Edit"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/userEdit/${p.id_Users}`);
              }}
            >
              <FiEdit />
            </button>

            <button
              className="dt-icon-btn danger"
              title="Delete"
              onClick={(e) => {
                e.stopPropagation();
                deleteUser(p);
              }}
            >
              <FiTrash2 />
            </button>
          </div>
        ),
      }
    ],
    []
  );

 const drawerSections = selectedUser
  ? [
      {
        title: "Naudotojo duomenys",
        rows: [
          { label: "Vardas", value: selectedUser.name },
          { label: "Pavardė", value: selectedUser.surname },
          { label: "El. paštas", value: selectedUser.email },
          { label: "Telefonas", value: selectedUser.phoneNumber || "-" },
          {
            label: "Sukurta",
            value: selectedUser.creationDate
              ? new Date(selectedUser.creationDate).toLocaleDateString("lt-LT")
              : "-",
          },
          { label: "Auth", value: selectedUser.authProvider || "-" },
        ],
      },

      {
        title: "Kliento duomenys",
        rows: selectedUser.client
          ? [
              { label: "Adresas", value: selectedUser.client.deliveryAddress || "-" },
              { label: "Miestas", value: selectedUser.client.city || "-" },
              { label: "Šalis", value: selectedUser.client.country || "-" },
              { label: "VAT", value: selectedUser.client.vat || "-" },
              { label: "Bank Code", value: selectedUser.client.bankCode || "-" },
              { label: "Max Debt", value: selectedUser.client.maxDebt || "-" },
              { label: "External Client ID", value: selectedUser.client.externalClientId || "-" },
            ]
          : [],
        emptyText: "Šis naudotojas neturi kliento duomenų.",
      },

      {
        title: "Darbuotojo duomenys",
        rows: selectedUser.employee
          ? [
              { label: "Pareigos", value: selectedUser.employee.position || "-" },
              {
                label: "Darbo pradžia",
                value: selectedUser.employee.startDate
                  ? new Date(selectedUser.employee.startDate).toLocaleDateString("lt-LT")
                  : "-",
              },
              {
                label: "Aktyvus",
                value: selectedUser.employee.active ? "Taip" : "Ne",
              },
            ]
          : [],
        emptyText: "Šis naudotojas nėra darbuotojas.",
      },

      {
        title: "Administratoriaus duomenys",
        rows: selectedUser.admin
          ? [
              { label: "Administratorius", value: "Taip" },
              { label: "Admin user ID", value: selectedUser.admin.id_Users ?? selectedUser.id_Users },
            ]
          : [],
        emptyText: "Šis naudotojas nėra administratorius.",
      },
    ]
  : [];

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
      />

      <DataTable
        title={null}
        columns={columns}
        rows={filtered}
        pageSize={25}
        getRowId={(u) => u.id_Users}
        onRowClick={(u) => setSelectedUser(u)}
        emptyText="Nėra duomenų"
        initialSort={{ key: "fullName", dir: "asc" }}
      />



      <RightDrawer
        open={!!selectedUser}
        title={selectedUser ? `${selectedUser.name} ${selectedUser.surname}` : ""}
        subtitle={selectedUser?.email}
        sections={drawerSections}
        onClose={() => setSelectedUser(null)}
        actions={
          selectedUser ? (
            <>
              <button
                className="rd-action-btn"
                onClick={() => navigate(`/userEdit/${selectedUser.id_Users}`)}
              >
                <FiEdit /> Redaguoti
              </button>

              <button
                className="rd-action-btn danger"
                onClick={() => deleteUser(selectedUser)}
              >
                <FiTrash2 /> Ištrinti
              </button>
            </>
          ) : null
        }
      />
    </div>
  );
}

export default UsersList;
