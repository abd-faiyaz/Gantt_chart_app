import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProjectView.css';

const ProjectView = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showConfirm, setShowConfirm] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const response = await fetch('/projects');
            if (!response.ok) {
                throw new Error('Failed to fetch projects');
            }
            const projectData = await response.json();
            setProjects(projectData);
        } catch (error) {
            console.error('Error fetching projects:', error);
            alert('Failed to fetch projects');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProject = () => {
        navigate('/add-project');
    };

    const handleViewTasks = () => {
        navigate('/view-tasks');
    };

    const handleEditProject = (project) => {
        navigate('/edit-project', { state: { project } });
    };

    const handleDeleteClick = (project) => {
        setProjectToDelete(project);
        setShowConfirm(true);
    };

    const handleConfirmDelete = async () => {
        try {
            const projectId = projectToDelete.projectId || projectToDelete.id;
            const response = await fetch(`/projects/${projectId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete project');
            }

            console.log('Project deleted successfully');
            await fetchProjects(); // Refresh the projects list
            setShowConfirm(false);
            setProjectToDelete(null);
        } catch (error) {
            console.error('Error deleting project:', error);
            alert('Failed to delete project');
        }
    };

    const handleCancelDelete = () => {
        setShowConfirm(false);
        setProjectToDelete(null);
    };

    const getStatusBadgeClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return 'status-completed';
            case 'in progress':
                return 'status-in-progress';
            case 'planning':
                return 'status-planning';
            case 'on hold':
                return 'status-on-hold';
            case 'cancelled':
                return 'status-cancelled';
            default:
                return 'status-default';
        }
    };

    const getPriorityBadgeClass = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high':
                return 'priority-high';
            case 'medium':
                return 'priority-medium';
            case 'low':
                return 'priority-low';
            default:
                return 'priority-default';
        }
    };

    if (loading) {
        return (
            <div className="project-view">
                <div className="loading">Loading projects...</div>
            </div>
        );
    }

    return (
        <div className="project-view">
            <div className="project-header">
                <h1>Projects</h1>
                <div className="header-actions">
                    <button onClick={handleCreateProject} className="btn btn-primary">
                        <span className="plus-icon">+</span> Create Project
                    </button>
                    <button onClick={handleViewTasks} className="btn btn-secondary">
                        📋 View Tasks
                    </button>
                </div>
            </div>

            {projects.length === 0 ? (
                <div className="empty-state">
                    <h2>No Projects Found</h2>
                    <p>Create your first project to get started with managing tasks and epics.</p>
                    <button onClick={handleCreateProject} className="btn btn-primary">
                        <span className="plus-icon">+</span> Create Project
                    </button>
                </div>
            ) : (
                <div className="projects-grid">
                    {projects.map((project) => (
                        <div key={project.projectId || project.id} className="project-card">
                            <div className="card-header">
                                <h3 className="project-title">{project.projectName}</h3>
                                <div className="card-actions">
                                    <button 
                                        onClick={() => handleEditProject(project)}
                                        className="btn-icon edit-btn"
                                        title="Edit Project"
                                    >
                                        ✏️
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteClick(project)}
                                        className="btn-icon delete-btn"
                                        title="Delete Project"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                            
                            {project.description && (
                                <p className="project-description">{project.description}</p>
                            )}
                            
                            <div className="project-details">
                                <div className="detail-row">
                                    <span className="detail-label">Status:</span>
                                    <span className={`status-badge ${getStatusBadgeClass(project.status)}`}>
                                        {project.status || 'Not Set'}
                                    </span>
                                </div>
                                
                                <div className="detail-row">
                                    <span className="detail-label">Priority:</span>
                                    <span className={`priority-badge ${getPriorityBadgeClass(project.priority)}`}>
                                        {project.priority || 'Not Set'}
                                    </span>
                                </div>
                                
                                {project.startDate && (
                                    <div className="detail-row">
                                        <span className="detail-label">Start Date:</span>
                                        <span className="detail-value">{project.startDate}</span>
                                    </div>
                                )}
                                
                                {project.endDate && (
                                    <div className="detail-row">
                                        <span className="detail-label">End Date:</span>
                                        <span className="detail-value">{project.endDate}</span>
                                    </div>
                                )}
                            </div>
                            
                            <div className="card-footer">
                                <button 
                                    onClick={() => navigate(`/project/${project.projectId || project.id}/details`)}
                                    className="btn btn-outline"
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showConfirm && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Confirm Delete</h3>
                        <p>
                            Are you sure you want to delete the project "{projectToDelete?.projectName}"? 
                            This action cannot be undone and will also delete all associated epics and tasks.
                        </p>
                        <div className="modal-actions">
                            <button onClick={handleCancelDelete} className="btn btn-secondary">
                                Cancel
                            </button>
                            <button onClick={handleConfirmDelete} className="btn btn-danger">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectView;
