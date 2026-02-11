import { useEffect, useMemo, useState } from "react";
import DataTable from "../components/DataTable";
import RightDrawer from "../components/RightDrawerSidebar";
import "../styles/UserPage.css";
function UsersList() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5065/api/users/allUsersWithClients")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => setUsers(data))
      .catch((err) => console.error(err));
  }, []);

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
          ]
          : [],
        emptyText: "Šis naudotojas neturi kliento duomenų.",
      },
    ]
    : [];

  return (
    <div className="user-cointainer">

      <DataTable
        title={null}
        columns={columns}
        rows={users}
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
      />
    </div>
  );
}

export default UsersList;
