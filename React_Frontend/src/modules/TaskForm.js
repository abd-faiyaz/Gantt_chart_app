import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import useDateCalculation from "../hooks/useDateCalculation";
import HolidayCalendar from "../components/HolidayCalendar";
import CreatableMultiSelect from "../components/CreatableMultiSelect";
import MultiSelectAssignee from "../components/MultiSelectAssignee";
import "./TaskForm.css"

const TaskForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { epicId } = useParams(); // Get epic ID from URL if creating task under specific epic
    const task = location.state?.task; // get task if passed

    const [allEpics, setAllEpics] = useState([]);
    const [selectedEpic, setSelectedEpic] = useState(null);
    const [users, setUsers] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [estimateDays, setEstimateDays] = useState('');
    const [endDateValue, setEndDateValue] = useState('');
    const [selectedLabels, setSelectedLabels] = useState([]);
    const [selectedAssignees, setSelectedAssignees] = useState([]);

    // Determine if we're creating a task under a specific epic
    const isUnderSpecificEpic = Boolean(epicId);

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
                
                // If we're creating under a specific epic, find and set it
                if (isUnderSpecificEpic && epicId) {
                    const epic = epics.find(e => (e.id || e.epicId) === epicId);
                    if (epic) {
                        setSelectedEpic(epic);
                    } else {
                        // Try to fetch the specific epic
                        try {
                            const epicResponse = await fetch(`/epics/${epicId}`);
                            if (epicResponse.ok) {
                                const specificEpic = await epicResponse.json();
                                setSelectedEpic(specificEpic);
                            }
                        } catch (error) {
                            console.error("Error fetching specific epic:", error);
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching epics:", error);
                setAllEpics([]);
            }
        };
        fetchEpics();
    }, [isUnderSpecificEpic, epicId]);

    // Fetch users for assignee dropdown
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch("/users");
                if (!response.ok) throw new Error("Failed to fetch users");
                const userData = await response.json();
                // Filter only active users
                const activeUsers = userData.filter(user => user.isActive || user.is_active);
                setUsers(activeUsers);
            } catch (error) {
                console.error("Error fetching users:", error);
                setUsers([]);
            }
        };
        fetchUsers();
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
        
        // If it's a string, check for different formats
        if (typeof originalEstimate === 'string') {
            // Handle P{days}D format
            if (originalEstimate.startsWith('P') && originalEstimate.endsWith('D')) {
                return originalEstimate.substring(1, originalEstimate.length - 1);
            }
            // Handle PT{hours}H format (convert to days)
            if (originalEstimate.startsWith('PT') && originalEstimate.endsWith('H')) {
                const hours = parseFloat(originalEstimate.substring(2, originalEstimate.length - 1));
                return (hours / 8).toString(); // Convert hours to days (8 hours per day)
            }
        }
        
        // If it's an object with duration properties, try to extract days
        if (typeof originalEstimate === 'object') {
            // Handle Java Duration object structure
            if (originalEstimate.seconds !== undefined) {
                const hours = originalEstimate.seconds / 3600; // Convert seconds to hours
                return (hours / 8).toString(); // Convert hours to days
            }
        }
        
        return originalEstimate.toString();
    };

    // Prefill form if editing
    useEffect(() => {
        if (task) {
            const startDateVal = task.start_date || task.startDate || "";
            const endDateVal = task.due_date || task.dueDate || "";
            const estimateVal = extractDaysFromEstimate(task.originalEstimate);
            
            setStartDate(startDateVal);
            setEndDateValue(endDateVal);
            setEstimateDays(estimateVal);
            
            // Handle labels for multi-select
            const labelsArray = task.labels ? 
                (Array.isArray(task.labels) ? task.labels : task.labels.split(',').map(l => l.trim())) : 
                [];
            setSelectedLabels(labelsArray);
            
            // Handle assignees for multi-select
            const assigneesArray = task.assigneeIds ? 
                (Array.isArray(task.assigneeIds) ? task.assigneeIds : [task.assigneeIds]) :
                task.assigneeId ? [task.assigneeId] :
                task.assignee ? [task.assignee] : [];
            setSelectedAssignees(assigneesArray);
            
            reset({
                type: task.type ? task.type.toLowerCase() : "",
                title: task.title || "",
                description: task.task_description || "",
                linkedEpic: task.epicId || "",
                startDate: startDateVal,
                endDate: endDateVal,
                status: task.status || "",
                priority: task.priority || "",
                estimate: estimateVal,
                assignee: task.assignee || "",
                labels: task.labels || "",
            });
            
            // Also update setValue for the calendar components
            setValue("startDate", startDateVal);
            setValue("endDate", endDateVal);
        } else if (isUnderSpecificEpic && selectedEpic) {
            // Pre-fill the linked epic when creating under specific epic
            setValue("linkedEpic", selectedEpic.id || selectedEpic.epicId);
        }
    }, [task, selectedEpic, isUnderSpecificEpic, reset, setValue]);

    // Auto-calculate end date when start date or estimate changes
    useEffect(() => {
        if (startDate && estimateDays && estimateDays > 0) {
            calculateEndDate(startDate, parseInt(estimateDays));
        }
    }, [startDate, estimateDays, calculateEndDate]);

    // Automatically set end date when calculated end date changes
    useEffect(() => {
        if (calculatedEndDate) {
            console.log('TaskForm: Setting end date automatically to:', calculatedEndDate);
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

    // Handle start date change
    const handleStartDateChange = (e) => {
        const newStartDate = e.target.value;
        setStartDate(newStartDate);
        setValue("startDate", newStartDate, { shouldValidate: true });
    };

    // Handle estimate days change
    const handleEstimateChange = (e) => {
        const newEstimate = e.target.value;
        setEstimateDays(newEstimate);
        setValue("estimate", newEstimate, { shouldValidate: true });
    };

    // Handle end date change and validation
    const handleEndDateChange = async (e) => {
        const newEndDate = e.target.value;
        setEndDateValue(newEndDate);
        setValue("endDate", newEndDate, { shouldValidate: true });

        // Validate the selected end date
        if (startDate && estimateDays && newEndDate) {
            await validateEndDate(startDate, parseInt(estimateDays), newEndDate);
        }
    };

    // Handles form submission
    const onSubmit = async (data) => {
        // Log the submitted form data for debugging
        console.log("Form submitted with data:", data);
        console.log("Current state - startDate:", startDate, "estimateDays:", estimateDays, "endDateValue:", endDateValue);
        
        // Check if start date is provided, alert if missing
        if (!data.startDate) {
            console.error("Start date validation failed - data.startDate:", data.startDate);
            alert("Start date is required");
            return;
        }

        // Prepare the payload object to match backend API expectations
        const payload = {
            type: data.type, // Task type (task, story, etc.)
            title: data.title, // Task title
            description: data.description || null, // Task description or null
            startDate: data.startDate, // Start date
            dueDate: data.endDate || null, // End date or null
            status: data.status, // Task status
            priority: data.priority, // Task priority
            // Convert estimate to PostgreSQL INTERVAL format if provided (days instead of hours)
            originalEstimate: data.estimate ? `P${data.estimate}D` : null,
            // Use selected assignees array (multiple assignees support)
            assigneeIds: selectedAssignees.length > 0 ? selectedAssignees : null,
            // For backward compatibility, also send single assignee
            assigneeId: selectedAssignees.length > 0 ? selectedAssignees[0] : null,
            epicId: data.linkedEpic || (isUnderSpecificEpic && selectedEpic ? (selectedEpic.id || selectedEpic.epicId) : null),
            sprintId: null,
            parentTaskId: null,
            // Use selected labels array instead of splitting comma-separated string
            labels: selectedLabels.length > 0 ? selectedLabels : null
        };

        // Log the payload for debugging
        console.log("Sending payload:", payload);

        try {
            if (task) {
                // If editing, update the existing task
                console.log("Updating task:", task.taskId || task.id);
                const response = await fetch(`/tasks/${task.taskId || task.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                // If response is not OK, throw error with response text
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Failed to update task: ${errorText}`);
                }
                // Log success
                console.log("Task updated successfully");
            } else {
                // If creating, send POST request to create new task
                console.log("Creating new task");
                const response = await fetch("/tasks", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                // If response is not OK, throw error with response text
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Failed to create task: ${errorText}`);
                }
                // Parse and log the created task result
                const result = await response.json();
                console.log("Task created successfully:", result);
            }
            // Navigate to the view-tasks page after success
            navigate("/view-tasks");
        } catch (error) {
            // Log and alert any errors that occur during save
            console.error("Error saving task:", error);
            alert(`Failed to save task: ${error.message}`);
        }
    };

    return (
        <div className="form">
            <div className="form-header">
                <h1>{task ? "Edit Task" : "+Create Task"}</h1>
            </div>
            <div className="form-container">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="form-subcontainer">
                        <div className="type-name">

                            {/*type*/}
                            <div className="title">
                                <label className="block text-sm font-medium text-gray-700">Type</label>

                            </div>
                            <select
                                {...register("type", { required: true })}
                                className="box"
                            >
                                <option value="">Select type</option>
                                <option value="task">Task</option>
                                <option value="story">Story</option>
                            </select>
                            {errors.type && <span className="text-red-500 text-sm">This field is required</span>}
                        </div>




                        <div className="type-name">
                            <div className="title">
                            <label className="block text-sm font-medium text-gray-700">Task Name/Title</label>

                            </div>
                            <input
                                {...register("title", { required: true })}
                                className="box"
                            />
                            {errors.title && <span className="text-red-500 text-sm">This field is required</span>}
                        </div>


                    </div>

                    <div className="form-subcontainer">

                        {/* Task Description */}
                        <div className="description">
                            <div className="title">
                            <label className="block text-sm font-medium text-gray-700">Description</label>

                            </div>
                            <textarea
                                {...register("description")}
                                rows={3}
                                className="box"
                            />
                        </div>

                    </div>

                    <div className="form-subcontainer">
                        {/* Linked Epic Name */}
                        <div className="epic-name">
                            <div className="title">
                            <label className="block text-sm font-medium text-gray-700">Linked Epic Name</label>

                            </div>
                            {isUnderSpecificEpic && selectedEpic ? (
                                <input
                                    value={selectedEpic.title || selectedEpic.name || 'Loading...'}
                                    className="box"
                                    disabled
                                    style={{ backgroundColor: '#f3f4f6', color: '#6b7280' }}
                                />
                            ) : (
                                <select
                                    {...register("linkedEpic", { required: true })}
                                    className="box"
                                >
                                    <option value="">Select epic</option>
                                    {allEpics.map((epic) => (
                                        <option key={epic.id || epic.epicId} value={epic.id || epic.epicId}>
                                            {epic.title || epic.name}
                                        </option>
                                    ))}
                                </select>
                            )}
                            {errors.linkedEpic && <span className="text-red-500 text-sm">This field is required</span>}
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
                                        setStartDate(date);
                                        // Update the form field using setValue
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
                                {/* Hidden input for form validation */}
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
                                {/* Hidden input for form validation */}
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
                        {/* Status */}
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

                        {/* Priority */}
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
                                    onChange: handleEstimateChange,
                                    min: { value: 0, message: "Estimate must be positive" }
                                })}
                                className="box"
                                placeholder="Enter days (e.g., 1.5)"
                            />
                            {errors.estimate && <span className="text-red-500 text-sm">{errors.estimate.message}</span>}
                        </div>
                        <MultiSelectAssignee
                            label="Assignees"
                            value={selectedAssignees}
                            onChange={setSelectedAssignees}
                            users={users}
                            className="time-assignee"
                            placeholder="Select assignees..."
                            isMulti={true}
                        />

                    </div>

                    <div className="form-subcontainer">
                        <CreatableMultiSelect
                            label="Labels"
                            value={selectedLabels}
                            onChange={setSelectedLabels}
                            className="labels-sprint-parent"
                            placeholder="Select or create labels..."
                        />
                    </div>

                    <div className="form-subcontainer">
                        <button
                            type="submit"
                            className="button"
                        >
                            {task ? "Update Task" : "Create Task"}
                        </button>
                    </div>

                </form>
                

            </div>
        </div>
    );
};

export default TaskForm;