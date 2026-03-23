// layouts/ClientLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import ClientHeader from "../components/ClientHeader";
import ClientFooter from "../components/ClientFooter";
import "../App.css";

export default function ClientLayout() {
  return (
    <div className="client-layout">
      <ClientHeader />
      <main className="client-content">
        <Outlet />
      </main>
      <ClientFooter company="TrackSync" version="1.0.0" />
    </div>
  );
}