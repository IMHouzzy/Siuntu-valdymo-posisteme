import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../services/AuthContext";
 
export default function RequireAuth({ children }) {
    const { user, loading } = useAuth();
    const loc = useLocation();
 
    // AuthProvider blocks rendering until /me resolves, so loading should
    // already be false here — but guard anyway in case of future changes.
    if (loading) return null;
 
    if (!user) {
        return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
    }
 
    return children;
}