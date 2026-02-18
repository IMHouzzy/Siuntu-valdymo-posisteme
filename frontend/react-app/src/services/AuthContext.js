import { createContext, useContext, useState } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

function decodeUser(token) {
  try {
    const p = jwtDecode(token);
    console.log("JWT payload:", p); // ✅
    return {
      id: p.sub,
      email: p.email,
      provider: p.provider,
      fullName: p.fullName || `${p.name || ""} ${p.surname || ""}`.trim(),
    };
  } catch (e) {
    console.log("JWT decode error:", e);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("token");
    return saved ? decodeUser(saved) : null;
  });

  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(decodeUser(newToken));
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}