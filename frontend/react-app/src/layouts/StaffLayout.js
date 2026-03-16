import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/Footer";
import SidebarLeft from "../components/SidebarLeft";
import "../App.css";

export default function StaffLayout() {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("sb") === "1");

  const toggle = () => {
    setCollapsed((v) => {
      const next = !v;
      localStorage.setItem("sb", next ? "1" : "0");
      return next;
    });
  };

  return (
    <div className={`layout-container ${collapsed ? "is-collapsed" : ""}`}>
      <div className="layout-header">
        <Header />
      </div>

      <div className="layout-menu">
        <SidebarLeft collapsed={collapsed} onToggle={toggle} />
      </div>

      <div className="layout-content">
        <Outlet />
      </div>

      <div className="layout-footer">
        <Footer
          company="TrackSync"
          version="1.0.0"
          // links={[
          //   { label: "Privatumo politika", href: "/privacy" },
          //   { label: "Pagalba", href: "/help" },
          // ]}
        />
      </div>
    </div>
  );
}