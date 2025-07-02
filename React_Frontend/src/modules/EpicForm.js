import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import useDateCalculation from "../hooks/useDateCalculation";
import HolidayCalendar from "../components/HolidayCalendar";
import "./TaskForm.css"

const EpicForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const epic = location.state?.epic; // get epic if passed for editing

    const [allEpics, setAllEpics] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [allProjects, setAllProjects] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [estimateDays, setEstimateDays] = useState('');
    const [endDateValue, setEndDateValue] = useState('');

    // Use the date calculation hook
    const {
        holidays,
        calculatedEndDate,
        isCalculating,
        validationMessage,
        calculateEndDate,
        validateEndDate,
        getHolidayInfo,
        shouldDisableDate,
        getDateClassName
    } = useDateCalculation();

    // Fetch all epics for linked epic dropdown
    useEffect(() => {
        const fetchEpics = async () => {
            try {
                const response = await fetch("/epics");
                if (!response.ok) throw new Error("Failed to fetch epics");
                const epics = await response.json();
                setAllEpics(epics);
            } catch (error) {
                console.error("Error fetching epics:", error);
                setAllEpics([]);
            }
        };
        fetchEpics();
    }, []);

    // Fetch all users for assignee dropdown
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch("/users");
                if (!response.ok) throw new Error("Failed to fetch users");
                const users = await response.json();
                // Filter only active users
                const activeUsers = users.filter(user => user.isActive || user.is_active);
                setAllUsers(activeUsers);
            } catch (error) {
                console.error("Error fetching users:", error);
                setAllUsers([]);
            }
        };
        fetchUsers();
    }, []);

    // Fetch all projects for project dropdown
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await fetch("/projects");
                if (!response.ok) throw new Error("Failed to fetch projects");
                const projects = await response.json();
                setAllProjects(projects);
            } catch (error) {
                console.error("Error fetching projects:", error);
                setAllProjects([]);
            }
        };
        fetchProjects();
    }, []);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm();

    // Helper function to extract days from originalEstimate
    const extractDaysFromEstimate = (originalEstimate) => {
        if (!originalEstimate) return "";
        
        if (typeof originalEstimate === 'string') {
            if (originalEstimate.startsWith('P') && originalEstimate.endsWith('D')) {
                return originalEstimate.substring(1, originalEstimate.length - 1);
            }
            if (originalEstimate.startsWith('PT') && originalEstimate.endsWith('H')) {
                const hours = parseFloat(originalEstimate.substring(2, originalEstimate.length - 1));
                return (hours / 8).toString();
            }
        }
        
        if (typeof originalEstimate === 'object') {
            if (originalEstimate.seconds !== undefined) {
                const hours = originalEstimate.seconds / 3600;
                return (hours / 8).toString();
            }
        }
        
        return originalEstimate.toString();
    };

    // Prefill form if editing
    useEffect(() => {
        if (epic) {
            const startDateVal = epic.start_date || epic.startDate || "";
            const endDateVal = epic.due_date || epic.dueDate || "";
            const estimateVal = extractDaysFromEstimate(epic.originalEstimate);
            
            setStartDate(startDateVal);
            setEndDateValue(endDateVal);
            setEstimateDays(estimateVal);
            
            reset({
                title: epic.title || "",
                description: epic.description || epic.task_description || "",
                linkedEpic: epic.linkedEpicId || "",
                projectId: epic.projectId || "",
                startDate: startDateVal,
                endDate: endDateVal,
                status: epic.status || "",
                priority: epic.priority || "",
                estimate: estimateVal,
                assignee: epic.assignedTo || epic.assignee || epic.assigneeId || "",
                labels: epic.labels ? epic.labels.join(', ') : "",
            });
        }
    }, [epic, reset, setValue]);

    // Auto-calculate end date when start date or estimate changes
    useEffect(() => {
        if (startDate && estimateDays && parseFloat(estimateDays) > 0) {
            console.log('EpicForm: Triggering end date calculation:', { startDate, estimateDays });
            calculateEndDate(startDate, parseInt(estimateDays));
        }
    }, [startDate, estimateDays, calculateEndDate]);

    // Automatically set end date when calculated end date changes
    useEffect(() => {
        if (calculatedEndDate) {
            console.log('EpicForm: Setting end date automatically to:', calculatedEndDate);
            setEndDateValue(calculatedEndDate);
            setValue("endDate", calculatedEndDate, { shouldValidate: true });
        }
    }, [calculatedEndDate, setValue]);

    // Sync state changes with form values
    useEffect(() => {
        if (startDate) {
            setValue("startDate", startDate, { shouldValidate: true });
        }
    }, [startDate, setValue]);

    useEffect(() => {
        if (endDateValue) {
            setValue("endDate", endDateValue, { shouldValidate: true });
        }
    }, [endDateValue, setValue]);

    useEffect(() => {
        if (estimateDays) {
            setValue("estimate", estimateDays, { shouldValidate: true });
        }
    }, [estimateDays, setValue]);

    // Handles form submission
    const onSubmit = async (data) => {
        console.log("Epic form submitted with data:", data);
        
        if (!data.startDate) {
            alert("Please select a start date");
            return;
        }

        if (!data.projectId) {
            alert("Please select a project");
            return;
        }

        // Prepare the payload for epic creation
        const payload = {
            name: data.title, // Epic entity uses 'name' field, not 'title'
            description: data.description || null,
            startDate: data.startDate,
            endDate: data.endDate || null,
            status: data.status,
            priority: data.priority,
            // Note: Epic entity doesn't have originalEstimate field, omitting it
            assignedTo: data.assignee && data.assignee !== "" ? data.assignee : null, // Epic entity uses 'assignedTo', UUID or null
            parentEpicId: data.linkedEpic || null, // Epic entity uses 'parentEpicId', not 'linkedEpicId'
            tags: data.labels ? data.labels.split(',').map(l => l.trim()).filter(l => l.length > 0) : null, // Epic entity uses 'tags', not 'labels'
            projectId: data.projectId // Use selected project ID from dropdown
        };

        console.log("Sending epic payload:", payload);

        try {
            const epicId = epic?.epicId || epic?.id;
            const url = epic ? `/epics/${epicId}` : "/epics";
            const method = epic ? "PUT" : "POST";
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to ${epic ? 'update' : 'create'} epic: ${errorText}`);
            }

            const result = await response.json();
            console.log(`Epic ${epic ? 'updated' : 'created'} successfully:`, result);
            alert(`Epic ${epic ? 'updated' : 'created'} successfully!`);
            navigate("/view-tasks");
        } catch (error) {
            console.error(`Error ${epic ? 'updating' : 'creating'} epic:`, error);
            alert(`Failed to ${epic ? 'update' : 'create'} epic: ${error.message}`);
        }
    };

    return (
        <div className="form">
            <div className="form-header">
                <h1>{epic ? "Edit Epic" : "+Create Epic"}</h1>
            </div>
            <div className="form-container">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="form-subcontainer">
                        <div className="type-name">
                            <div className="title">
                                <label className="block text-sm font-medium text-gray-700">Epic Name/Title</label>
                            </div>
                            <input
                                {...register("title", { required: true })}
                                className="box"
                                placeholder="Enter epic title"
                            />
                            {errors.title && <span className="text-red-500 text-sm">This field is required</span>}
                        </div>
                    </div>

                    <div className="form-subcontainer">
                        <div className="description">
                            <div className="title">
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                            </div>
                            <textarea
                                {...register("description")}
                                rows={3}
                                className="box"
                                placeholder="Enter epic description"
                            />
                        </div>
                    </div>

                    <div className="form-subcontainer">
                        <div className="epic-name">
                            <div className="title">
                                <label className="block text-sm font-medium text-gray-700">Linked Epic Name</label>
                            </div>
                            <select
                                {...register("linkedEpic")}
                                className="box"
                            >
                                <option value="">Select linked epic (optional)</option>
                                {allEpics.map((e) => (
                                    <option key={e.id || e.epicId} value={e.id || e.epicId}>
                                        {e.title || e.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-subcontainer">
                        <div className="epic-name">
                            <div className="title">
                                <label className="block text-sm font-medium text-gray-700">Project *</label>
                            </div>
                            <select
                                {...register("projectId", { required: "Project selection is required" })}
                                className="box"
                            >
                                <option value="">Select project</option>
                                {allProjects.map((project) => (
                                    <option key={project.projectId} value={project.projectId}>
                                        {project.projectName}
                                    </option>
                                ))}
                            </select>
                            {errors.projectId && <span className="text-red-500 text-sm">{errors.projectId.message}</span>}
                        </div>
                    </div>

                    <div className="form-subcontainer">
                        <div className="date">
                            <div className="title">
                                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                            </div>
                            <HolidayCalendar
                                value={startDate}
                                onChange={(date) => {
                                    console.log('EpicForm: Start date changed to:', date);
                                    setStartDate(date);
                                    setValue("startDate", date, { shouldValidate: true });
                                }}
                                holidays={holidays}
                                shouldDisableDate={shouldDisableDate}
                                getDateClassName={getDateClassName}
                                getHolidayInfo={getHolidayInfo}
                                placeholder="Select start date"
                                required
                                className="box"
                            />
                            <input
                                type="hidden"
                                {...register("startDate", { 
                                    required: "Start date is required"
                                })}
                                value={startDate || ''}
                            />
                            {errors.startDate && <span className="text-red-500 text-sm">{errors.startDate.message}</span>}
                        </div>

                        <div className="date">
                            <div className="title">
                                <label className="block text-sm font-medium text-gray-700">End Date/Due Date</label>
                            </div>
                            <input
                                type="text"
                                value={endDateValue || calculatedEndDate || 'Not calculated'}
                                readOnly
                                className="box"
                                style={{
                                    backgroundColor: '#f3f4f6',
                                    color: '#6b7280',
                                    cursor: 'not-allowed'
                                }}
                                placeholder="End date will be calculated automatically"
                            />
                            <input
                                type="hidden"
                                {...register("endDate")}
                                value={endDateValue || calculatedEndDate || ''}
                            />
                            {calculatedEndDate && (
                                <div className="text-sm text-green-600 mt-1">
                                    {isCalculating ? 'Calculating...' : `Automatically calculated based on start date and estimate`}
                                </div>
                            )}
                            {validationMessage && (
                                <div className="text-sm text-red-500 mt-1">{validationMessage}</div>
                            )}
                        </div>
                    </div>

                    <div className="form-subcontainer">
                        <div className="status-priority">
                            <div className="title">
                                <label className="block text-sm font-medium text-gray-700">Status</label>
                            </div>
                            <select
                                {...register("status", { required: true })}
                                className="box"
                            >
                                <option value="">Select status</option>
                                <option value="To Do">To Do</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Done">Done</option>
                            </select>
                            {errors.status && <span className="text-red-500 text-sm">This field is required</span>}
                        </div>

                        <div className="status-priority">
                            <div className="title">
                                <label className="block text-sm font-medium text-gray-700">Priority</label>
                            </div>
                            <select
                                {...register("priority")}
                                className="box"
                            >
                                <option value="">Select priority</option>
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-subcontainer">
                        <div className="time-assignee">
                            <div className="title">
                                <label className="block text-sm font-medium text-gray-700">Original Estimate (days)</label>
                            </div>
                            <input
                                type="number"
                                step="0.5"
                                min="0"
                                {...register("estimate", { 
                                    min: { value: 0, message: "Estimate must be positive" }
                                })}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setEstimateDays(value);
                                    setValue("estimate", value, { shouldValidate: true });
                                }}
                                value={estimateDays}
                                className="box"
                                placeholder="Enter days (e.g., 1.5)"
                            />
                            {errors.estimate && <span className="text-red-500 text-sm">{errors.estimate.message}</span>}
                        </div>

                        <div className="time-assignee">
                            <div className="title">
                                <label className="block text-sm font-medium text-gray-700">Assignee</label>
                            </div>
                            <select
                                {...register("assignee")}
                                className="box"
                            >
                                <option value="">Select assignee (optional)</option>
                                {allUsers.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.fullName} ({user.username})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-subcontainer">
                        <div className="labels-sprint-parent">
                            <div className="title">
                                <label className="block text-sm font-medium text-gray-700">Labels</label>
                            </div>
                            <input
                                {...register("labels")}
                                className="box"
                                placeholder="tag1, tag2, tag3"
                            />
                        </div>
                    </div>

                    <div className="form-subcontainer">
                        <button
                            type="submit"
                            className="button"
                        >
                            {epic ? "Update Epic" : "Create Epic"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EpicForm;
