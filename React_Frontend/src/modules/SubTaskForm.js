import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import useDateCalculation from "../hooks/useDateCalculation";
import HolidayCalendar from "../components/HolidayCalendar";
import "./TaskForm.css"

const SubTaskForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { taskId } = useParams(); // Get parent task ID from URL
    const subtask = location.state?.subtask; // get subtask if passed for editing

    const [parentTask, setParentTask] = useState(null);
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

    // Fetch parent task details
    useEffect(() => {
        if (taskId) {
            const fetchParentTask = async () => {
                try {
                    const response = await fetch(`/tasks/${taskId}`);
                    if (!response.ok) throw new Error("Failed to fetch parent task");
                    const task = await response.json();
                    setParentTask(task);
                } catch (error) {
                    console.error("Error fetching parent task:", error);
                    alert("Failed to load parent task information");
                    navigate("/view-tasks");
                }
            };
            fetchParentTask();
        }
    }, [taskId, navigate]);

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
        if (subtask) {
            const startDateVal = subtask.start_date || subtask.startDate || "";
            const endDateVal = subtask.due_date || subtask.dueDate || "";
            const estimateVal = extractDaysFromEstimate(subtask.originalEstimate);
            
            setStartDate(startDateVal);
            setEndDateValue(endDateVal);
            setEstimateDays(estimateVal);
            
            reset({
                title: subtask.title || "",
                description: subtask.description || subtask.task_description || "",
                startDate: startDateVal,
                endDate: endDateVal,
                status: subtask.status || "",
                priority: subtask.priority || "",
                estimate: estimateVal,
                assignee: subtask.assignee || subtask.assigneeId || "",
            });
        }
    }, [subtask, reset, setValue]);

    // Auto-calculate end date when start date or estimate changes
    useEffect(() => {
        if (startDate && estimateDays && estimateDays > 0) {
            calculateEndDate(startDate, estimateDays);
        }
    }, [startDate, estimateDays, calculateEndDate]);

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

    // Handle estimate days change
    const handleEstimateChange = (e) => {
        const newEstimate = e.target.value;
        setEstimateDays(newEstimate);
        setValue("estimate", newEstimate, { shouldValidate: true });
    };

    // Handles form submission
    const onSubmit = async (data) => {
        console.log("Subtask form submitted with data:", data);
        
        if (!data.startDate) {
            alert("Please select a start date");
            return;
        }

        if (!parentTask) {
            alert("Parent task information is missing");
            return;
        }

        // Prepare the payload for subtask creation
        const payload = {
            type: "sub_task",
            title: data.title,
            description: data.description || null,
            startDate: data.startDate,
            dueDate: data.endDate || null,
            status: data.status,
            priority: data.priority,
            originalEstimate: data.estimate ? `P${data.estimate}D` : null,
            assigneeId: data.assignee || null,
            parentTaskId: parentTask.id || parentTask.taskId,
            epicId: parentTask.epicId || null,
            sprintId: parentTask.sprintId || null,
            labels: null
        };

        console.log("Sending subtask payload:", payload);

        try {
            const url = subtask ? `/tasks/${subtask.id || subtask.taskId}` : "/tasks";
            const method = subtask ? "PUT" : "POST";
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to ${subtask ? 'update' : 'create'} subtask: ${errorText}`);
            }

            const result = await response.json();
            console.log(`Subtask ${subtask ? 'updated' : 'created'} successfully:`, result);
            alert(`Subtask ${subtask ? 'updated' : 'created'} successfully!`);
            navigate("/view-tasks");
        } catch (error) {
            console.error(`Error ${subtask ? 'updating' : 'creating'} subtask:`, error);
            alert(`Failed to ${subtask ? 'update' : 'create'} subtask: ${error.message}`);
        }
    };

    if (!parentTask && taskId) {
        return (
            <div className="form">
                <div className="form-header">
                    <h1>Loading...</h1>
                </div>
                <div className="form-container">
                    <p>Loading parent task information...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="form">
            <div className="form-header">
                <h1>{subtask ? "Edit Subtask" : "+Create Subtask"}</h1>
                {parentTask && (
                    <p className="text-sm text-gray-600">
                        Under: {parentTask.title}
                    </p>
                )}
            </div>
            <div className="form-container">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="form-subcontainer">
                        <div className="type-name">
                            <div className="title">
                                <label className="block text-sm font-medium text-gray-700">Subtask Name/Title</label>
                            </div>
                            <input
                                {...register("title", { required: true })}
                                className="box"
                                placeholder="Enter subtask title"
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
                                placeholder="Enter subtask description"
                            />
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
                            <HolidayCalendar
                                value={endDateValue}
                                onChange={(date) => {
                                    setEndDateValue(date);
                                    setValue("endDate", date, { shouldValidate: true });
                                    if (startDate && estimateDays && date) {
                                        validateEndDate(startDate, estimateDays, date);
                                    }
                                }}
                                holidays={holidays}
                                minDate={calculatedEndDate}
                                shouldDisableDate={(date) => {
                                    if (calculatedEndDate && new Date(date) < new Date(calculatedEndDate)) {
                                        return true;
                                    }
                                    return shouldDisableDate ? shouldDisableDate(date) : false;
                                }}
                                getDateClassName={getDateClassName}
                                getHolidayInfo={getHolidayInfo}
                                placeholder={calculatedEndDate ? `Suggested: ${calculatedEndDate}` : "Select end date"}
                                className="box"
                            />
                            <input
                                type="hidden"
                                {...register("endDate")}
                                value={endDateValue || ''}
                            />
                            {calculatedEndDate && (
                                <div className="text-sm text-gray-600 mt-1">
                                    {isCalculating ? 'Calculating...' : `Suggested end date: ${calculatedEndDate}`}
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
                                    onChange: handleEstimateChange,
                                    min: { value: 0, message: "Estimate must be positive" }
                                })}
                                className="box"
                                placeholder="Enter days (e.g., 1.5)"
                            />
                            {errors.estimate && <span className="text-red-500 text-sm">{errors.estimate.message}</span>}
                        </div>

                        <div className="time-assignee">
                            <div className="title">
                                <label className="block text-sm font-medium text-gray-700">Assignee</label>
                            </div>
                            <input
                                {...register("assignee")}
                                className="box"
                                placeholder="Enter assignee name"
                            />
                        </div>
                    </div>

                    <div className="form-subcontainer">
                        <button
                            type="submit"
                            className="button"
                        >
                            {subtask ? "Update Subtask" : "Create Subtask"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SubTaskForm;
