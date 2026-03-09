import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import AuthLayout from "./layouts/AuthLayout";
import StaffLayout from "./layouts/StaffLayout";
import ClientLayout from "./layouts/ClientLayout";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import AccountConfirmationPassword from "./pages/auth/AccountConfirmationPassword";
import ChangePassword from "./pages/auth/ChangePasswordPage";

import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";

import OrderPage from "./pages/orderCrud/OrderPage";
import OrderAdd from "./pages/orderCrud/OrderAdd";
import OrderEdit from "./pages/orderCrud/OrderEdit";

import ProductPage from "./pages/productCrud/ProductPage";
import ProductAdd from "./pages/productCrud/ProductAdd";
import ProductEdit from "./pages/productCrud/ProductEdit";

import UsersPage from "./pages/userCrud/UsersPage";
import UserAdd from "./pages/userCrud/UserAdd";
import UserEdit from "./pages/userCrud/UserEdit";

// client UI
import UserHome from "./pages/userCrud/UserHome";
import UserOrders from "./pages/userCrud/UserOrders";

import RequireAuth from "./components/routing/RequireAuth";
import RequireRole from "./components/routing/RequireRole";

import CompaniesList from "./pages/companyCrud/CompaniesList";
import CompanyEdit from "./pages/companyCrud/CompanyEdit";
import CompanyMembers from "./pages/companyCrud/CompanyMembers";
import CompanyIntegrations from "./pages/companyCrud/CompanyIntegrations";
export default function App() {
  return (
    <Routes>
      {/* AUTH */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/confirm" element={<AccountConfirmationPassword />} />
        <Route path="/change-password" element={<ChangePassword />} />
      </Route>

      {/* STAFF (MASTER/ADMIN/STAFF) */}
      <Route
        path="/"
        element={
          <RequireAuth>
            <RequireRole allow={["MASTER", "ADMIN", "STAFF"]}>
              <StaffLayout />
            </RequireRole>
          </RequireAuth>
        }
      >
        {/* / */}
        <Route index element={<HomePage />} />

        {/* /products... */}
        <Route path="productList" element={<ProductPage />} />
        <Route path="productAdd" element={<ProductAdd />} />
        <Route path="productEdit/:id" element={<ProductEdit />} />

        {/* /orders... */}
        <Route path="orderList" element={<OrderPage />} />
        <Route path="orderAdd" element={<OrderAdd />} />
        <Route path="orderEdit/:id" element={<OrderEdit />} />

        {/* /users... */}
        <Route path="usersList" element={<UsersPage />} />
        <Route path="userAdd" element={<UserAdd />} />
        <Route path="userEdit/:id" element={<UserEdit />} />

        {/* /companies... */}
        <Route path="companiesList" element={<CompaniesList />} />
        <Route path="companyAdd" element={<CompanyEdit />} />
        <Route path="companyEdit/:id" element={<CompanyEdit />} />
        <Route path="companyMembers/:id" element={<CompanyMembers />} />
        <Route path="/companyIntegrations/:companyId" element={<CompanyIntegrations />} />
      </Route>

      {/* CLIENT */}
      <Route
        path="/client"
        element={
          <RequireAuth>
            <RequireRole allow={["CLIENT"]}>
              <ClientLayout />
            </RequireRole>
          </RequireAuth>
        }
      >
        <Route index element={<UserHome />} />
        <Route path="orders" element={<UserOrders />} />
      </Route>

      {/* fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}