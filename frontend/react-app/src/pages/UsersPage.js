import { useEffect, useState } from "react";
import "../styles/UserPage.css";
function UsersList() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5065/api/users/allUsersWithClients")
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => setUsers(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="user-cointainer">
      <h2>Visi naudotojai</h2>
      <div className="user-list">
        {users.map(user => (
          <div className="user-card" key={user.id_Users} onClick={() => setSelectedUser(user)}>
            <h4>Vardas, pavardė:</h4>
            <h3>{user.name} {user.surname}</h3>
            <h4>El.paštas:</h4>
            <p>{user.email}</p>
          </div>
        ))}
      </div>

      {selectedUser && (
        <div className="user-modal" onClick={() => setSelectedUser(null)}>
          <div className="user-modal-content" onClick={e => e.stopPropagation()}>
            <h2>{selectedUser.name} {selectedUser.surname}</h2>
            <div className="user-modal-content-wrap">
              <div>

                <h3>Naudotojo duomenys</h3>
                <p><strong>El.paštas:</strong> {selectedUser.email}</p>
                <p><strong>Telefono Numeris:</strong> {selectedUser.phoneNumber || "-"}</p>
                <p><strong>Paskyra sukurta:</strong> {new Date(selectedUser.creationDate).toLocaleString()}</p>
                <p><strong>Auth Provider:</strong> {selectedUser.authProvider}</p>
              </div>
              {selectedUser.client && (
                <div>
                  <h3>Kliento duomenys</h3>
                  <p><strong>Miestas:</strong> {selectedUser.client.city || "-"}</p>
                  <p><strong>Šalis:</strong> {selectedUser.client.country || "-"}</p>
                  <p><strong>VAT:</strong> {selectedUser.client.vat || "-"}</p>
                  <p><strong>Bank Code:</strong> {selectedUser.client.bankCode || "-"}</p>
                  <p><strong>Max Debt:</strong> {selectedUser.client.maxDebt || "-"}</p>
                </div>
              )}
            </div>
            <button onClick={() => setSelectedUser(null)}>Uždaryti</button>
          </div>
        </div>
      )}

    </div>
  );
}

export default UsersList;
