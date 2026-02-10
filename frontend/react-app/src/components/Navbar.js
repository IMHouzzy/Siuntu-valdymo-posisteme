import { Link } from "react-router-dom";
import DropdownMenu from "./DropdownMenu";
import "../styles/Navbar.css";

function Navbar() {
  return (

    <nav className="nav-container">
      <Link to="/">Pagrindinis</Link>

      <DropdownMenu
        title="Naudotojai"
        items={[{ label: "Naudotojų sąrašas", path: "/usersList" },

        ]} />

      <DropdownMenu
        title="Užsakymai"
        items={[{ label: "Užsakymų sąrašas", path: "/orderList" },

        ]} />

      <DropdownMenu
        title="Prekės"
        items={[
          { label: "Prekių sąrašas", path: "/productList" },

        ]} />
    </nav>

  );
}

export default Navbar;
