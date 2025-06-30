import React, { useState, useRef, useEffect } from "react";
import FilterForm from "./FilterForm";
import "./Filter.css";

const Filter = ({ onFilterApply, onFilterClear, activeFilters }) => {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close the filter form if clicked outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [open]);

    return (
        <div className="filter-dropdown" ref={dropdownRef}>
            <button
                className={`filter-btn ${activeFilters ? 'active' : ''}`}
                onClick={() => setOpen((prev) => !prev)}
            >
                Filter {activeFilters && <span className="filter-count">●</span>}
            </button>
            {open && (
                <div className="filter-dropdown-content">
                    <FilterForm 
                        onFilter={onFilterApply} 
                        onClear={onFilterClear}
                        activeFilters={activeFilters}
                    />
                </div>
            )}
        </div>
    );
};

export default Filter;






