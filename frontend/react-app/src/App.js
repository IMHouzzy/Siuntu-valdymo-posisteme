

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import AuthLayout from "./layouts/AuthLayout";
import StaffLayout from "./layouts/StaffLayout";
import ClientLayout from "./layouts/ClientLayout";
import CourierLayout from "./layouts/CourierLayout";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import ChangePassword from "./pages/auth/ChangePasswordPage";
import Profile from "./pages/userCrud/Profile";

import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";

import OrderPage from "./pages/orderCrud/OrderPage";
import OrderAdd from "./pages/orderCrud/OrderAdd";
import OrderEdit from "./pages/orderCrud/OrderEdit";
import OrderDetailPage from "./pages/orderCrud/OrderDetailPage";

import ProductPage from "./pages/productCrud/ProductPage";
import ProductAdd from "./pages/productCrud/ProductAdd";
import ProductEdit from "./pages/productCrud/ProductEdit";

import UsersPage from "./pages/userCrud/UsersPage";
import UserAdd from "./pages/userCrud/UserAdd";
import UserEdit from "./pages/userCrud/UserEdit";

// client UI
import UserHome from "./pages/userCrud/UserHome";
import TrackingPage from "./pages/userCrud/TrackingPage";

// courier UI
import CourierShipmentsList from "./pages/Courier/CourierShipmentsList";
import CourierShipmentDetail from "./pages/Courier/CourierShipmentDetail";

import RequireAuth from "./components/routing/RequireAuth";
import RequireRole from "./components/routing/RequireRole";

import CompaniesList from "./pages/companyCrud/CompaniesList";
import CompanyEdit from "./pages/companyCrud/CompanyEdit";
import CompanyMembers from "./pages/companyCrud/CompanyMembers";
import CompanyIntegrations from "./pages/companyCrud/CompanyIntegrations";

import ShipmentRegistration from "./pages/shipmentPages/ShipmentRegistration";
import ShipmentsPage from "./pages/shipmentPages/ShipmentsPage";

import ReturnsList from "./pages/Returns/ReturnsList";

import ButentSync from "./pages/admin/ButentSync";

export default function App() {
  return (
    <Routes>
      {/* AUTH */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
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
        <Route index element={<HomePage />} />

        <Route path="productList" element={<ProductPage />} />
        <Route path="productAdd" element={<ProductAdd />} />
        <Route path="productEdit/:id" element={<ProductEdit />} />

        <Route path="orderList" element={<OrderPage />} />
        <Route path="orderAdd" element={<OrderAdd />} />
        <Route path="orderEdit/:id" element={<OrderEdit />} />
        <Route path="/orders/:orderId/detail" element={<OrderDetailPage />} />

        <Route path="usersList" element={<UsersPage />} />
        <Route path="userAdd" element={<UserAdd />} />
        <Route path="userEdit/:id" element={<UserEdit />} />
        <Route path="/admin/company/:companyId/butent-sync" element={<ButentSync />} />

        <Route path="/orders/:orderId/shipment/new" element={<ShipmentRegistration />} />
        <Route path="/shipmentsList" element={<ShipmentsPage />} />

        <Route path="companiesList" element={<CompaniesList />} />
        <Route path="companyAdd" element={<CompanyEdit />} />
        <Route path="companyEdit/:id" element={<CompanyEdit />} />
        <Route path="companyMembers/:id" element={<CompanyMembers />} />
        <Route path="/companyIntegrations/:companyId" element={<CompanyIntegrations />} />

        <Route path="returnsList" element={<ReturnsList />} />

      </Route>

      {/* CLIENT */}
      <Route
        path="/client"
        element={
          <RequireAuth>
            <RequireRole allow={["CLIENT", "MASTER", "ADMIN", "STAFF", "COURIER"]}>
              <ClientLayout />
            </RequireRole>
          </RequireAuth>
        }
      >
        <Route index element={<UserHome />} />
        <Route path="track/:trackingNumber" element={<TrackingPage />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* COURIER */}
      <Route
        path="/courier"
        element={
          <RequireAuth>
            <RequireRole allow={["MASTER", "ADMIN", "COURIER"]}>
              <CourierLayout />
            </RequireRole>
          </RequireAuth>
        }
      >
        <Route index element={<CourierShipmentsList />} />
        <Route path="shipments/:id" element={<CourierShipmentDetail />} />
      </Route>

      {/* fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}