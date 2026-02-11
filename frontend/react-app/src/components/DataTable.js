import React, { useMemo, useState, useEffect } from "react";
import "../styles/DataTable.css";

export default function DataTable({
  title,
  columns,
  rows,
  getRowId = (row) => row.id,
  onRowClick,
  initialSort = null,
  emptyText = "No data",

  // pagination
  pageSize = 10,
  pageSizeOptions = [10, 25, 50, 100],
}) {
  const [sort, setSort] = useState(initialSort);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(pageSize);

  // reset page when data changes or page size changes
  useEffect(() => {
    setPage(1);
  }, [rows, size]);

  const sortedRows = useMemo(() => {
    if (!sort?.key) return rows;

    const col = columns.find((c) => c.key === sort.key);
    if (!col) return rows;

    const getValue = col.accessor ?? ((r) => r[col.key]);

    const copy = [...rows];
    copy.sort((a, b) => {
      const va = getValue(a);
      const vb = getValue(b);

      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;

      if (typeof va === "number" && typeof vb === "number") {
        return sort.dir === "asc" ? va - vb : vb - va;
      }

      if (va instanceof Date && vb instanceof Date) {
        return sort.dir === "asc" ? va - vb : vb - va;
      }

      const sa = String(va).toLowerCase();
      const sb = String(vb).toLowerCase();
      if (sa < sb) return sort.dir === "asc" ? -1 : 1;
      if (sa > sb) return sort.dir === "asc" ? 1 : -1;
      return 0;
    });

    return copy;
  }, [rows, sort, columns]);

  const totalRows = sortedRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / size));
  const safePage = Math.min(page, totalPages);

  const pagedRows = useMemo(() => {
    const start = (safePage - 1) * size;
    return sortedRows.slice(start, start + size);
  }, [sortedRows, safePage, size]);

  const toggleSort = (key) => {
    setPage(1);
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, dir: "asc" };
      if (prev.dir === "asc") return { key, dir: "desc" };
      return null;
    });
  };

  const from = totalRows === 0 ? 0 : (safePage - 1) * size + 1;
  const to = Math.min(safePage * size, totalRows);

  // simple page number window (max 5 buttons)
  const pageButtons = useMemo(() => {
    const max = 5;
    const half = Math.floor(max / 2);
    let start = Math.max(1, safePage - half);
    let end = Math.min(totalPages, start + max - 1);
    start = Math.max(1, end - max + 1);

    const nums = [];
    for (let i = start; i <= end; i++) nums.push(i);
    return nums;
  }, [safePage, totalPages]);

  return (
    <div className="dt-card">
      {title && <div className="dt-title">{title}</div>}

      <div className="dt-scroll">
        <table className="dt">
          <thead>
            <tr>
              {columns.map((c) => {
                const isSortable = c.sortable;
                const isSorted = sort?.key === c.key;
                const sortDir = isSorted ? sort.dir : null;

                return (
                  <th
                    key={c.key}
                    style={{ width: c.width }}
                    className={[
                      c.align ? `dt-align-${c.align}` : "",
                      isSortable ? "dt-sortable" : "",
                    ].join(" ")}
                    onClick={isSortable ? () => toggleSort(c.key) : undefined}
                    title={isSortable ? "Sort" : undefined}
                  >
                    <span className="dt-th">
                      {c.header}
                      {isSorted && (
                        <span className="dt-sort">{sortDir === "asc" ? "▲" : "▼"}</span>
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {pagedRows.length === 0 ? (
              <tr>
                <td className="dt-empty" colSpan={columns.length}>
                  {emptyText}
                </td>
              </tr>
            ) : (
              pagedRows.map((row) => {
                const rowId = getRowId(row);
                const clickable = typeof onRowClick === "function";

                return (
                  <tr
                    key={rowId}
                    className={clickable ? "dt-row-clickable" : ""}
                    onClick={clickable ? () => onRowClick(row) : undefined}
                  >
                    {columns.map((c) => {
                      const getValue = c.accessor ?? ((r) => r[c.key]);
                      const value = getValue(row);

                      return (
                        <td key={c.key} className={c.align ? `dt-align-${c.align}` : ""}>
                          {c.cell ? c.cell(value, row) : value ?? ""}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination footer */}
      <div className="dt-pagination">
        <div className="dt-page-info">
          Rodoma <b>{from}</b>–<b>{to}</b> iš <b>{totalRows}</b>
        </div>

        <div className="dt-page-size">
          <span>Eilutės:</span>
          <select value={size} onChange={(e) => setSize(Number(e.target.value))}>
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div className="dt-page-controls">
          <button
            className="dt-page-btn"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
          >
            Grįžti
          </button>

          {pageButtons.map((n) => (
            <button
              key={n}
              className={`dt-page-btn ${n === safePage ? "is-active" : ""}`}
              onClick={() => setPage(n)}
            >
              {n}
            </button>
          ))}

          <button
            className="dt-page-btn"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
          >
            Kitas
          </button>
        </div>
      </div>
    </div>
  );
}
