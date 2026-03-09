import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function CompanySwitchGuard() {
  const { setCompanySwitchLocked } = useAuth();
  const { pathname } = useLocation();

  const shouldLock = useMemo(() => {
    // ✅ užrakink kurimo/redagavimo puslapiuose
    return (
      pathname.includes("Add") ||
      pathname.includes("Edit") ||
      pathname.startsWith("/userAdd") ||
      pathname.startsWith("/userEdit") ||
      pathname.startsWith("/productAdd") ||
      pathname.startsWith("/productEdit") ||
      pathname.startsWith("/orderAdd") ||
      pathname.startsWith("/orderEdit")||
      pathname.startsWith("/companyAdd")||
      pathname.startsWith("/companyEdit")||
      pathname.startsWith("/companyMembers")
    );
  }, [pathname]);

  useEffect(() => {
    setCompanySwitchLocked(shouldLock);
  }, [shouldLock, setCompanySwitchLocked]);

  return null;
}