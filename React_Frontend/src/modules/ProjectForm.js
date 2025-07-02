import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import MultiSelectAssignee from "../components/MultiSelectAssignee";
import "./TaskForm.css"

const ProjectForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const project = location.state?.project; // get project if passed for editing

    const [allUsers, setAllUsers] = useState([]);
    const [selectedAssignees, setSelectedAssignees] = useState([]);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm();

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

    // Prefill form if editing
    useEffect(() => {
        if (project) {
            // Handle assignees for multi-select
            const assigneesArray = project.assignedUserIds ? 
                (Array.isArray(project.assignedUserIds) ? project.assignedUserIds : [project.assignedUserIds]) :
                project.projectManagerId ? [project.projectManagerId] : [];
            setSelectedAssignees(assigneesArray);
            
            reset({
                projectName: project.projectName || "",
                description: project.description || "",
                status: project.status || "",
                priority: project.priority || "",
                startDate: project.startDate || "",
                endDate: project.endDate || "",
            });
        }
    }, [project, reset]);

    // Handles form submission
    const onSubmit = async (data) => {
        console.log("Project form submitted with data:", data);
        
        if (!data.projectName) {
            alert("Please enter a project name");
            return;
        }

        // Prepare the payload for project creation
        const payload = {
            projectName: data.projectName,
            description: data.description || null,
            startDate: data.startDate || null,
            endDate: data.endDate || null,
            status: data.status || 'Planning',
            priority: data.priority || 'Medium',
            // Use selected assignees array (multiple assignees support)
            assignedUserIds: selectedAssignees.length > 0 ? selectedAssignees : null,
            // For backward compatibility, also send single project manager
            projectManagerId: selectedAssignees.length > 0 ? selectedAssignees[0] : null,
        };

        console.log("Sending project payload:", payload);

        try {
            const projectId = project?.projectId || project?.id;
            const url = project ? `/projects/${projectId}` : "/projects";
            const method = project ? "PUT" : "POST";
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to ${project ? 'update' : 'create'} project: ${errorText}`);
            }

            const result = await response.json();
            console.log(`Project ${project ? 'updated' : 'created'} successfully:`, result);
            alert(`Project ${project ? 'updated' : 'created'} successfully!`);
            navigate("/projects");
        } catch (error) {
            console.error(`Error ${project ? 'updating' : 'creating'} project:`, error);
            alert(`Failed to ${project ? 'update' : 'create'} project: ${error.message}`);
        }
    };

    return (
        <div className="form">
            <div className="form-header">
                <h1>{project ? "Edit Project" : "+Create Project"}</h1>
            </div>
            <div className="form-container">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="form-subcontainer">
                        <div className="type-name">
                            <div className="title">
                                <label className="block text-sm font-medium text-gray-700">Project Name</label>
                            </div>
                            <input
                                {...register("projectName", { required: true })}
                                className="box"
                                placeholder="Enter project name"
                            />
                            {errors.projectName && <span className="text-red-500 text-sm">This field is required</span>}
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
                                placeholder="Enter project description"
                            />
                        </div>
                    </div>

                    <div className="form-subcontainer">
                        <div className="date">
                            <div className="title">
                                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                            </div>
                            <input
                                type="date"
                                {...register("startDate")}
                                className="box"
                            />
                        </div>

                        <div className="date">
                            <div className="title">
                                <label className="block text-sm font-medium text-gray-700">End Date</label>
                            </div>
                            <input
                                type="date"
                                {...register("endDate")}
                                className="box"
                            />
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
                                <option value="Planning">Planning</option>
                                <option value="In Progress">In Progress</option>
                                <option value="On Hold">On Hold</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
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
                        <MultiSelectAssignee
                            label="Project Team (Assignees)"
                            value={selectedAssignees}
                            onChange={setSelectedAssignees}
                            users={allUsers}
                            className="time-assignee"
                            placeholder="Select team members..."
                            isMulti={true}
                        />
                    </div>

                    <div className="form-subcontainer">
                        <button
                            type="submit"
                            className="button"
                        >
                            {project ? "Update Project" : "Create Project"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProjectForm;
