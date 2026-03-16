import React from "react";
import "../styles/Footer.css";

export default function Footer({
  company = "Your Company",
  year = new Date().getFullYear(),
  version,
  links = [],
}) {
  return (
    <footer className="app-footer">
      <div className="app-footer-left">
        <span className="app-footer-copy">
          © {year} {company}
        </span>

        {version && (
          <span className="app-footer-version">
            v{version}
          </span>
        )}
      </div>

      {links.length > 0 && (
        <div className="app-footer-links">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="app-footer-link"
              target="_blank"
              rel="noreferrer"
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </footer>
  );
}