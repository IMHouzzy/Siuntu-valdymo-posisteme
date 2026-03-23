import { FiTruck } from "react-icons/fi";
import { useAuth } from "../services/AuthContext";
import "../styles/CourierHeader.css";
import SignInProfile from "./SignInProfile";
export default function CourierHeader() {
  const { user, activeCompany } = useAuth();

  return (
    <header className="cr-header">
      <div className="cr-header-inner">

        <div className="cr-header-left">
          <FiTruck size={18} />
          <span>{activeCompany?.name || "TrackSync"}</span>
        </div>

        <div className="cr-header-right">
       <SignInProfile />
        </div>

      </div>
    </header>
  );
}