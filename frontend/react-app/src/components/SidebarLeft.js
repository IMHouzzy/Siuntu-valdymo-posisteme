import React, { useMemo, useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  FiBox,
  FiUsers,
  FiShoppingCart,
  FiChevronDown,
  FiMenu,
  FiBriefcase,
} from "react-icons/fi";
import { LuLayoutDashboard } from "react-icons/lu";
import "../styles/SidebarLeft.css";

import TrackSyncBig from "../images/TrackSync_Big.png";
import TrackSyncSmall from "../images/TrackSync_Small.png";

const LS_KEY = "sidebar_open_groups_v1";

export default function SidebarLeft({ collapsed, onToggle }) {
  const location = useLocation();

  const nav = useMemo(
    () => [
      { type: "link", id: "Dashboard", label: "Dashboard", icon: <LuLayoutDashboard />, to: "/" },
      {
        type: "group",
        id: "Užsakymai",
        label: "Užsakymai",
        icon: <FiShoppingCart />,
        children: [
          { label: "Užsakymų sąrašas", to: "/orderList" },
          { label: "Kurti užsakymą", to: "/orderAdd" },
        ],
      },
      {
        type: "group",
        id: "Prekės",
        label: "Prekės",
        icon: <FiBox />,
        children: [
          { label: "Prekių sąrašas", to: "/productList" },
          { label: "Kurti prekę", to: "/productAdd" },
        ],
      },
      {
        type: "group",
        id: "Naudotojai",
        label: "Naudotojai",
        icon: <FiUsers />,
        children: [
          { label: "Naudotojų sąrašas", to: "/usersList" },
          { label: "Kurti naudotoją", to: "/userAdd" },
        ],
      },
      {
        type: "group",
        id: "Įmonės",
        label: "Įmonės",
        icon: <FiBriefcase />,
        children: [
          { label: "Įmonių sąrašas", to: "/companiesList" },
          { label: "Kurti įmonę", to: "/companyAdd" },
        ],
      },
    ],
    []
  );

  // 1) Init: pabandom loadinti iš localStorage, jei nėra – atidarom pagal active route
  const [openGroups, setOpenGroups] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) return new Set(JSON.parse(raw));
    } catch { }
    return new Set(); // vėliau useEffect atidarys pagal route
  });

  // 2) Kai pasikeičia route (ir po refresh), atidaryk grupę, kuri turi aktyvų path
  useEffect(() => {
    const path = location.pathname;

    const activeGroup = nav.find(
      (x) =>
        x.type === "group" &&
        x.children?.some((c) => path === c.to || path.startsWith(c.to + "/"))
    );

    if (!activeGroup) return;

    setOpenGroups((prev) => {
      // jei jau atidaryta kažkas ranka ir aktyvi grupė jau yra – nieko nelaužom
      if (prev.has(activeGroup.id)) return prev;

      // atidarom aktyvią grupę (paliekam ir kitas, jei buvo)
      const next = new Set(prev);
      next.add(activeGroup.id);
      return next;
    });
  }, [location.pathname, nav]);

  // 3) Persistinam openGroups į localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(Array.from(openGroups)));
    } catch { }
  }, [openGroups]);

  const toggleGroup = (id) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleGroupClick = (id) => {
    if (collapsed) {
      onToggle?.(); // expand sidebar
      setOpenGroups((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
      return;
    }
    toggleGroup(id);
  };

  return (
    <aside className={`sidebar ${collapsed ? "is-collapsed" : ""}`}>
      <div className="sidebar-top">
        <button
          className="sidebar-collapse-btn"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand" : "Collapse"}
          type="button"
        >
          <FiMenu />
        </button>

        <div className="sidebar-logo">
          <img className="sidebar-logo-small" src={TrackSyncSmall} alt="TrackSync" draggable="false" />
          <img
            className={`sidebar-logo-big ${collapsed ? "is-hidden" : "is-visible"}`}
            src={TrackSyncBig}
            alt="TrackSync"
            draggable="false"
          />
        </div>
      </div>

      <nav className="sidebar-nav">
        {nav.map((item) => {
          if (item.type === "link") {
            return (
              <NavLink
                key={item.id}
                to={item.to}
                className={({ isActive }) => `nav-item ${isActive ? "is-active" : ""}`}
                title={collapsed ? item.label : undefined}
              >
                <span className="nav-icon">{item.icon}</span>
                {!collapsed && <span className="nav-label">{item.label}</span>}
              </NavLink>
            );
          }

          const isOpen = openGroups.has(item.id);

          return (
            <div key={item.id} className="nav-group">
              <button
                className="nav-item nav-group-btn"
                onClick={() => handleGroupClick(item.id)}
                title={collapsed ? item.label : undefined}
                type="button"
              >
                <span className="nav-icon">{item.icon}</span>
                {!collapsed && (
                  <>
                    <span className="nav-label">{item.label}</span>
                    <span className={`chev ${isOpen ? "is-open" : ""}`}>
                      <FiChevronDown />
                    </span>
                  </>
                )}
              </button>

              {!collapsed && isOpen && (
                <div className="nav-sub">
                  {item.children.map((c) => (
                    <NavLink
                      key={c.to}
                      to={c.to}
                      className={({ isActive }) => `nav-sub-item ${isActive ? "is-active" : ""}`}
                    >
                      {c.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      <div className="sidebar-bottom">
        <div className="sidebar-bottom-left">
          <div className="sidebar-bottom-image">
            <img src={TrackSyncSmall} alt="TrackSync" draggable="false" />
          </div>
        </div>
        <div className="sidebar-bottom-right">
          <h4>Company name</h4>
          <span>company-code</span>
        </div>
      </div>
    </aside>
  );
}