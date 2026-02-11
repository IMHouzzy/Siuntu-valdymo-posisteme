import React, { useEffect } from "react";
import "../styles/RightDrawerSidebar.css";

/**
 * sections = [
 *  {
 *    title: "User info",
 *    rows: [
 *      { label: "Email", value: "a@b.com" },
 *      { label: "Created", value: "2026-02-11" },
 *    ]
 *  }
 * ]
 */
export default function RightDrawer({
  open,
  title,
  subtitle,
  sections = [],
  onClose,
  width = 520, // px
}) {
  // ESC to close
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="rd-overlay" onClick={onClose}>
      <aside
        className="rd"
        style={{ width: `min(${width}px, 92vw)` }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="rd-header">
          <div className="rd-header-text">
            <div className="rd-title">{title}</div>
            {subtitle ? <div className="rd-subtitle">{subtitle}</div> : null}
          </div>

          <button className="rd-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="rd-body">
          {sections.map((sec, idx) => (
            <section className="rd-section" key={`${sec.title}-${idx}`}>
              {sec.title ? <h3 className="rd-section-title">{sec.title}</h3> : null}

              {sec.rows?.length ? (
                <div className="rd-rows">
                  {sec.rows.map((r, i) => (
                    <div className="rd-row" key={`${r.label}-${i}`}>
                      <span className="rd-label">{r.label}</span>
                      <span className="rd-value">{r.value ?? "-"}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rd-empty">{sec.emptyText ?? "No data"}</div>
              )}
            </section>
          ))}
        </div>

        <div className="rd-footer">
        </div>
      </aside>
    </div>
  );
}
