import React from "react";
import "../styles/FormPageLayout.css";

export default function FormPageLayout({ title, subtitle, children, actions }) {
  return (
    <div className="fpl">
      <div className="fpl-header">
        <div>
          <h1 className="fpl-title">{title}</h1>
          {subtitle && <div className="fpl-sub">{subtitle}</div>}
        </div>

        {actions && <div className="fpl-actions">{actions}</div>}
      </div>

      <div className="fpl-card">
        {children}
      </div>
    </div>
  );
}