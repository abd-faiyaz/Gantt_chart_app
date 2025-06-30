import { useForm } from "react-hook-form";
import "./FilterForm.css";

const FilterForm = ({ onFilter, onClear, activeFilters }) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm();

    const onSubmit = (data) => {
        console.log("Filter form submitted with data:", data);
        if (onFilter) onFilter(data);
    };

    const handleClear = () => {
        reset(); // Clear the form
        if (onClear) onClear(); // Clear filters in parent
    };

    return (
        <div className="filter-panel">
            <div className="filter-panel-header">
                <span className="filter-title">FILTERS</span>
                <div className="filter-actions">
                    <button type="button" className="filter-save-btn" onClick={handleSubmit(onSubmit)}>Apply filter</button>
                    <button type="button" className="filter-clear-btn" onClick={handleClear}>Clear</button>
                </div>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="filter-panel-body">
                
                <div className="filter-section">
                    <label className="filter-label">Updated</label>
                    <div className="filter-date-row">
                        <div className="filter-date-field">
                            <label className="filter-date-label">From</label>
                            <input
                                type="date"
                                {...register("startDate")}
                                className="filter-date-input"
                            />
                        </div>
                        <span className="filter-date-arrow">→</span>
                        <div className="filter-date-field">
                            <label className="filter-date-label">To</label>
                            <input
                                type="date"
                                {...register("endDate")}
                                className="filter-date-input"
                            />
                        </div>
                    </div>
                </div>
                <div className="filter-section">
                    <label className="filter-label">Work type</label>
                    <div className="filter-worktype-row">
                        {/* Add onClick or onChange for each type */}
                        
                        <label className="worktype-btn epic">
                            <input type="checkbox" {...register("epic")} />
                            <span>⚡ Epic</span>
                        </label>
                        <label className="worktype-btn story">
                            <input type="checkbox" {...register("story")} />
                            <span>🟩 Story</span>
                        </label>
                        <label className="worktype-btn subtask">
                            <input type="checkbox" {...register("subtask")} />
                            <span>🔗 Subtask</span>
                        </label>
                        <label className="worktype-btn task">
                            <input type="checkbox" {...register("task")} />
                            <span>☑️ Task</span>
                        </label>
                    </div>
                </div>
                <div className="filter-section">
                    <label className="filter-label">Assignee</label>
                    <input
                        type="text"
                        {...register("assignee")}
                        className="filter-assignee-input"
                        placeholder="Search by assignee name"
                    />
                </div>
                <div className="filter-section">
                    <label className="filter-label">Status</label>
                    <select {...register("status")} className="filter-select-input">
                        <option value="">All Status</option>
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                    </select>
                </div>
                
                <div className="filter-section">
                    <label className="filter-label">Priority</label>
                    <select {...register("priority")} className="filter-select-input">
                        <option value="">All Priorities</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>
                </div>
                
                </div>
            </form>
        </div>
    );
};

export default FilterForm;