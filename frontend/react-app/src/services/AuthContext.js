import { createContext, useContext, useMemo, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

function safeJsonParse(value, fallback) {
  try { return JSON.parse(value); } catch { return fallback; }
}

function decodeAuth(token) {
  try {
    const p = jwtDecode(token);

    const now = Date.now() / 1000;

    if (p.exp && p.exp < now) {
      // token expired
      localStorage.removeItem("token");
      return { user: null, companies: [], activeCompany: null, companyRole: "" };
    }

    const companies =
      typeof p.companies === "string"
        ? safeJsonParse(p.companies, [])
        : Array.isArray(p.companies)
          ? p.companies
          : [];

    const activeCompany = {
      id: Number(p.companyId || 0),
      name: p.companyName || "",
      code: p.companyCode || "",
      image: p.companyImage || ""
    };

    return {
      user: {
        id: Number(p.sub || 0),
        email: p.email,
        provider: p.provider,
        fullName: p.fullName || `${p.name || ""} ${p.surname || ""}`.trim(),
        isMasterAdmin: String(p.isMasterAdmin || "0") === "1",
      },
      companies,
      activeCompany,
      companyRole: p.companyRole || "",
    };
  } catch (e) {
    console.log("JWT decode error:", e);
    return { user: null, companies: [], activeCompany: null, companyRole: "" };
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [companySwitchLocked, setCompanySwitchLocked] = useState(false);
  useEffect(() => {
    if (!token) return;

    const { exp } = jwtDecode(token);

    if (!exp) return;

    const expiryTime = exp * 1000 - Date.now();

    if (expiryTime <= 0) {
      logout();
      return;
    }

    const timer = setTimeout(() => {
      logout();
    }, expiryTime);

    return () => clearTimeout(timer);
  }, [token]);
  const decoded = useMemo(() => {
    return token ? decodeAuth(token) : { user: null, companies: [], activeCompany: null, companyRole: "" };
  }, [token]);

  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  const switchCompany = async (companyId) => {
    if (companySwitchLocked) return;
    if (!token) throw new Error("No token");

    const res = await fetch(`http://localhost:5065/api/auth/switch-company/${companyId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const t = await res.text().catch(() => "");
      throw new Error(t || "Switch company failed");
    }

    const data = await res.json().catch(() => ({}));
    if (!data?.token) throw new Error("No token in response");
    login(data.token);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user: decoded.user,
        companies: decoded.companies,
        activeCompany: decoded.activeCompany,
        activeCompanyId: decoded.activeCompany?.id || 0,
        companyRole: decoded.companyRole,

        login,
        logout,
        switchCompany,

        companySwitchLocked,
        setCompanySwitchLocked,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}