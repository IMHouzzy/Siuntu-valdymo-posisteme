import React, { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { FiBox, FiUsers, FiShoppingCart, FiChevronDown, FiMenu } from "react-icons/fi";
import "../styles/SidebarLeft.css";

import TrackSyncBig from "../images/TrackSync_Big.png";
import TrackSyncSmall from "../images/TrackSync_Small.png";

export default function SidebarLeft({ collapsed, onToggle }) {
    const [openGroups, setOpenGroups] = useState(() => new Set(["catalog"]));

    const nav = useMemo(
        () => [
            {
                type: "group",
                id: "Užsakymai",
                label: "Užsakymai",
                icon: <FiShoppingCart />,
                children: [{ label: "Užsakymų sąrašas", to: "/orderList" }, { label: "Kurti užsakymą", to: "/orderAdd" }],
            },
            {
                type: "group",
                id: "Prekės",
                label: "Prekės",
                icon: <FiBox />,
                children: [{ label: "Prekių sąrašas", to: "/productList" }, { label: "Kurti prekę", to: "/productAdd" }],
              
            },
            {
                type: "group",
                id: "Naudotojai",
                label: "Naudotojai",
                icon: <FiUsers />,
                children: [{ label: "Naudotojų sąrašas", to: "/usersList"}, { label: "Kurti naudotoją", to: "/userAdd"  }],
            },
        ],
        []
    );

    const toggleGroup = (id) => {
        setOpenGroups((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    return (
        <aside className={`sidebar ${collapsed ? "is-collapsed" : ""}`}>
            <div className="sidebar-top">
                <button
                    className="sidebar-collapse-btn"
                    onClick={onToggle}
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    title={collapsed ? "Expand" : "Collapse"}
                >
                    <FiMenu />
                </button>
                <div className="sidebar-logo">
                    <img
                        className="sidebar-logo-small"
                        src={TrackSyncSmall}
                        alt="TrackSync"
                        draggable="false"
                    />

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
                                key={item.to}
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
                                onClick={() => toggleGroup(item.id)}
                                title={collapsed ? item.label : undefined}
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
        </aside>
    );
}
