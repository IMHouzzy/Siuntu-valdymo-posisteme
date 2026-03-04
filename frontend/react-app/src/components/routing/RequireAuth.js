import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../services/AuthContext";

export default function RequireAuth({ children }) {
  const { token } = useAuth();
  const loc = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }
  return children;
}