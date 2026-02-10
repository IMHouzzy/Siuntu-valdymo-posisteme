import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/DropdownMenu.css";

function DropdownMenu({ title, items }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="dropdown-container"
      onMouseLeave={() => setOpen(false)}
    >
      <button
        className="dropdown-button"
        onClick={() => setOpen(!open)}
      >
        {title}
      </button>

      <div className={`dropdown-content ${open ? "open" : ""}`}>
        {items.map((item, index) => (
          <Link key={index} to={item.path}>
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default DropdownMenu;
