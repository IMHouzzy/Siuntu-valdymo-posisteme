import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../services/AuthContext";

// allow pvz: ["CLIENT"] arba ["ADMIN","STAFF","MASTER"]
export default function RequireRole({ allow, children }) {
  const { user, companyRole } = useAuth(); // ⬅️ įsidėk companyRole į AuthContext decode

  const role = user?.isMasterAdmin ? "MASTER" : (companyRole || "STAFF");

  if (!allow.includes(role)) {
    // jei klientas bandė eiti į staff, permetam į /client
    if (role === "CLIENT") return <Navigate to="/client" replace />;
    // jei staff bandė eiti į klientų pusę, į /
    return <Navigate to="/" replace />;
  }

  return children;
}