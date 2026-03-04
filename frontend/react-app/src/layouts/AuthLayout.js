import React from "react";
import { Outlet } from "react-router-dom";
import "../App.css";

export default function AuthLayout() {
  return (
    <div className="auth-layout">
      <Outlet />
    </div>
  );
}