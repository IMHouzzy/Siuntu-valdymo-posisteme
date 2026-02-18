import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Header from "./components/header";
import SidebarLeft from "./components/SidebarLeft";

import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";

import Login from "./pages/Login";
import Register from "./pages/Register";
import AccountConfirmationPassword from "./pages/AccountConfirmationPassword";
import ChangePassword from "./pages/ChangePasswordPage";



import OrderPage from "./pages/OrderPage";
import OrderAdd from "./pages/OrderAdd";
import OrderEdit from "./pages/OrderEdit";

import ProductPage from "./pages/ProductPage";
import ProductAdd from "./pages/ProductAdd";
import ProductEdit from "./pages/ProductEdit";

import UsersPage from "./pages/UsersPage";
import UserAdd from "./pages/UserAdd";
import UserEdit from "./pages/UserEdit";


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

          <Route path="/productList" element={<ProductPage />} />
          <Route path="/productAdd" element={<ProductAdd />} />
          <Route path="/productEdit/:id" element={<ProductEdit />} />

          <Route path="/orderList" element={<OrderPage />} />
          <Route path="/orderAdd" element={<OrderAdd />} />
          <Route path="/orderEdit/:id" element={<OrderEdit />} />

          <Route path="/usersList" element={<UsersPage />} />
          <Route path="/userAdd" element={<UserAdd />} />
          <Route path="/userEdit/:id" element={<UserEdit />} />

        </Routes>
      </div>

      <div className="layout-footer"></div>
    </div>
  );
}

export default App;
