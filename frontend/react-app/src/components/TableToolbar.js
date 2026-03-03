import React from "react";
import { FiSearch } from "react-icons/fi";
import AddButton from "./AddButton";
import "../styles/TableToolbar.css";

function FilterPills({ items = [], value, onChange }) {
  if (!items.length) return null;

  return (
    <div className="tb-filters" role="tablist" aria-label="Filters">
      {items.map((it) => {
        const active = it.value === value;
        return (
          <button
            key={String(it.value)}
            type="button"
            className={`tb-pill ${active ? "is-active" : ""}`}
            onClick={() => onChange?.(it.value)}
            title={it.label}
            role="tab"
            aria-selected={active}
          >
            <span className="tb-pill-label">{it.label}</span>
            {typeof it.count === "number" ? (
              <span className="tb-pill-count">{it.count}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export default function TableToolbar({
  title,
  searchValue,
  onSearchChange,
  addLabel = "Add",
  onAdd,

  // NEW:
  filters = [],          // [{label, value, count?}, ...]
  filterValue,           // selected value
  onFilterChange,        // (value) => void

  rightHeader,           // optional extra controls near AddButton
}) {
  return (
    <div className="tb-wrap">
      {/* HEADER (no background) */}
      <div className="tb-header">
        <h1 className="tb-title">{title}</h1>

        <div className="tb-header-right">
          {rightHeader}
          <AddButton label={addLabel} onClick={onAdd} />
        </div>
      </div>

      {/* TOOLS (card background) */}
      <div className="tb-tools">
        <div className="tb-search">
          <FiSearch className="tb-search-icon" />
          <input
            className="tb-search-input"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Ieškoti…"
          />
        </div>

        <FilterPills items={filters} value={filterValue} onChange={onFilterChange} />
      </div>
    </div>
  );
}