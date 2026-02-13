import React from "react";
import { FiSearch } from "react-icons/fi";
import AddButton from "./AddButton";
import "../styles/TableToolbar.css";

export default function TableToolbar({
    title,
    searchValue,
    onSearchChange,
    addLabel = "Add",
    onAdd,
    right,
}) {
    return (
        <div className="tb">

            <div className="tb-left">


                <div className="tb-search">
                    <FiSearch className="tb-search-icon" />
                    <input
                        className="tb-search-input"
                        value={searchValue}
                        onChange={(e) => onSearchChange?.(e.target.value)}
                        placeholder="Ieškoti…"
                    />
                </div>
            </div>

            <div className="tb-right">
                {right}
                <AddButton label={addLabel} onClick={onAdd} />
            </div>
        </div>
    );
}