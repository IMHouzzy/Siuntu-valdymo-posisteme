import React from "react";
import { Outlet } from "react-router-dom";
// import ClientHeader from "../components/client/ClientHeader";
// import ClientSidebar from "../components/client/ClientSidebar";
import "../App.css";

export default function ClientLayout() {
  return (
    <div className="client-layout">
      {/* <ClientHeader /> */}
      <div className="client-body">
        {/* <ClientSidebar /> */}
        <main className="client-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}