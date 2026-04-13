import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../services/AuthContext";
 
export default function RequireRole({ allow, children }) {
    const { user, companyRole } = useAuth();
 
    const role = user?.isMasterAdmin ? "MASTER" : (companyRole || "STAFF");
 
    if (!allow.includes(role)) {
        if (role === "CLIENT")  return <Navigate to="/client"  replace />;
        if (role === "COURIER") return <Navigate to="/courier" replace />;
        return <Navigate to="/" replace />;
    }
 
    return children;
}
 