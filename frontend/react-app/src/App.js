import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import UsersPage from "./pages/UsersPage";
import NotFoundPage from "./pages/NotFoundPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AccountConfirmationPassword from "./pages/AccountConfirmationPassword";
import ChangePassword from "./pages/ChangePasswordPage";
import Header from "./components/header";
import OrderPage from "./pages/OrderPage";
import ProductPage from "./pages/ProductPage";
import SidebarLeft from "./components/SidebarLeft";
import ProductAdd from "./pages/ProductAdd";
import ProductEdit from "./pages/ProductEdit";
import "./App.css";

function App() {
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
      <div className="layout-header"><Header /></div>

      <div className="layout-menu">
        <SidebarLeft collapsed={collapsed} onToggle={toggle} />
      </div>

      <div className="layout-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="*" element={<NotFoundPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/account-confirmation" element={<AccountConfirmationPassword />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/orderList" element={<OrderPage />} />
          <Route path="/productList" element={<ProductPage />} />
          <Route path="/usersList" element={<UsersPage />} />
          <Route path="/productAdd" element={<ProductAdd />} />
          <Route path="/productEdit/:id" element={<ProductEdit />} />

        </Routes>
      </div>

      <div className="layout-footer"></div>
    </div>
  );
}

export default App;
