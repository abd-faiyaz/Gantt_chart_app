import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import TypeIcon from './TypeIcon';
import './HierarchicalProjectView.css';

const HierarchicalProjectView = ({ refreshTrigger, onDeleteItem }) => {
  const [projects, setProjects] = useState([]);
  const [expandedProjects, setExpandedProjects] = useState(new Set());
  const [expandedEpics, setExpandedEpics] = useState(new Set());
  const [expandedTasks, setExpandedTasks] = useState(new Set());
  const [taskSubtasks, setTaskSubtasks] = useState(new Map()); // Store subtasks for each task
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjectsWithHierarchy();
  }, [refreshTrigger]);

  const fetchProjectsWithHierarchy = async () => {
    try {
      setLoading(true);
      
      // First fetch all projects
      const projectsResponse = await fetch('http://localhost:8080/projects');
      if (!projectsResponse.ok) {
        throw new Error('Failed to fetch projects');
      }
      const projects = await projectsResponse.json();
      console.log('Fetched projects:', projects);

      // For each project, fetch its epics and tasks
      const projectsWithEpics = await Promise.all(
        projects.map(async (project, projectIndex) => {
          try {
            // Fetch epics for this specific project
            console.log(`Fetching epics for project ${project.projectId}...`);
            const epicsResponse = await fetch(`http://localhost:8080/epics/project/${project.projectId}`);
            
            if (!epicsResponse.ok) {
              console.warn(`Failed to fetch epics for project ${project.projectId}`);
              return {
                ...project,
                epics: [],
                hierarchyNumber: `${projectIndex + 1}`
              };
            }
            
            const projectEpics = await epicsResponse.json();
            console.log(`Found ${projectEpics.length} epics for project ${project.projectId}:`, projectEpics);
            
            // For each epic, fetch its tasks
            const epicsWithTasks = await Promise.all(
              projectEpics.map(async (epic, epicIndex) => {
                try {
                  // Use the correct epic ID field - epics use 'id' (mapped from epicId)
                  const epicId = epic.id || epic.epicId;
                  console.log(`Fetching tasks for epic ${epicId}...`);
                  
                  const tasksResponse = await fetch(`http://localhost:8080/tasks/epic/${epicId}`);
                  
                  if (!tasksResponse.ok) {
                    console.warn(`Failed to fetch tasks for epic ${epicId}`);
                    return {
                      ...epic,
                      tasks: [],
                      hierarchyNumber: `${projectIndex + 1}.${epicIndex + 1}`
                    };
                  }
                  
                  const epicTasks = await tasksResponse.json();
                  console.log(`Found ${epicTasks.length} tasks for epic ${epicId}:`, epicTasks);
                  
                  // Group subtasks by parent task
                  const tasksWithSubtasks = epicTasks.map((task, taskIndex) => {
                    // Find subtasks for this task
                    const taskId = task.taskId || task.id;
                    
                    // Fetch subtasks will be done separately for performance
                    // For now, just set empty subtasks array
                    return {
                      ...task,
                      subtasks: [], // Will be populated when expanded
                      hierarchyNumber: `${projectIndex + 1}.${epicIndex + 1}.${taskIndex + 1}`
                    };
                  });

                  return {
                    ...epic,
                    tasks: tasksWithSubtasks,
                    hierarchyNumber: `${projectIndex + 1}.${epicIndex + 1}`
                  };
                } catch (error) {
                  console.error(`Error fetching tasks for epic ${epic.id}:`, error);
                  return {
                    ...epic,
                    tasks: [],
                    hierarchyNumber: `${projectIndex + 1}.${epicIndex + 1}`
                  };
                }
              })
            );

            return {
              ...project,
              epics: epicsWithTasks,
              hierarchyNumber: `${projectIndex + 1}`
            };
          } catch (error) {
            console.error(`Error fetching data for project ${project.projectId}:`, error);
            return {
              ...project,
              epics: [],
              hierarchyNumber: `${projectIndex + 1}`
            };
          }
        })
      );

      console.log('Final projects with hierarchy:', projectsWithEpics);
      
      // Debug: Check if epics are actually in the data
      projectsWithEpics.forEach((project, index) => {
        console.log(`Project ${index + 1} (${project.projectName}): ${project.epics.length} epics`);
        project.epics.forEach((epic, epicIndex) => {
          console.log(`  Epic ${epicIndex + 1}: ${epic.name} (ID: ${epic.id})`);
        });
      });
      
      setProjects(projectsWithEpics);
      
      // Expand all projects by default to show epics
      const allProjectIds = new Set(projectsWithEpics.map(p => p.projectId));
      setExpandedProjects(allProjectIds);
    } catch (error) {
      console.error('Error fetching hierarchical data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleProjectExpansion = (projectId) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  const toggleEpicExpansion = (epicId) => {
    const newExpanded = new Set(expandedEpics);
    if (newExpanded.has(epicId)) {
      newExpanded.delete(epicId);
    } else {
      newExpanded.add(epicId);
    }
    setExpandedEpics(newExpanded);
  };

  const toggleTaskExpansion = async (taskId) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
      
      // Fetch subtasks if not already fetched
      if (!taskSubtasks.has(taskId)) {
        try {
          console.log(`Fetching subtasks for task ${taskId}...`);
          const response = await fetch(`http://localhost:8080/tasks/${taskId}/subtasks`);
          
          if (response.ok) {
            const subtasks = await response.json();
            console.log(`Found ${subtasks.length} subtasks for task ${taskId}:`, subtasks);
            
            const newTaskSubtasks = new Map(taskSubtasks);
            newTaskSubtasks.set(taskId, subtasks);
            setTaskSubtasks(newTaskSubtasks);
          } else {
            console.warn(`Failed to fetch subtasks for task ${taskId}`);
            const newTaskSubtasks = new Map(taskSubtasks);
            newTaskSubtasks.set(taskId, []);
            setTaskSubtasks(newTaskSubtasks);
          }
        } catch (error) {
          console.error(`Error fetching subtasks for task ${taskId}:`, error);
          const newTaskSubtasks = new Map(taskSubtasks);
          newTaskSubtasks.set(taskId, []);
          setTaskSubtasks(newTaskSubtasks);
        }
      }
    }
    setExpandedTasks(newExpanded);
  };

  const handleEdit = (item, type) => {
    switch (type) {
      case 'project':
        navigate('/edit-project', { state: { project: item } });
        break;
      case 'epic':
        navigate('/edit-epic', { state: { epic: item } });
        break;
      case 'task':
      case 'subtask':
        navigate('/edit-task', { state: { task: item } });
        break;
      default:
        break;
    }
  };

  const handleDelete = (item, type) => {
    onDeleteItem(item, type);
  };

  const handleAddEpic = (projectId) => {
    navigate(`/add-epic?projectId=${projectId}`);
  };

  const handleAddTask = (epicId) => {
    navigate(`/add-task/${epicId}`);
  };

  const handleAddSubtask = (taskId) => {
    navigate(`/add-subtask/${taskId}`);
  };

  if (loading) {
    return (
      <div className="hierarchical-loading">
        <p>Loading hierarchical view...</p>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="hierarchical-empty">
        <p>No projects found. Create a project to organize your epics and tasks hierarchically.</p>
      </div>
    );
  }

  return (
    <div className="hierarchical-project-view">
      {projects.map((project) => {
        const isProjectExpanded = expandedProjects.has(project.projectId);
        
        console.log(`Rendering project: ${project.projectName} with ${project.epics.length} epics, expanded: ${isProjectExpanded}`);
        
        return (
          <div key={project.projectId} className="project-card-container">
            {/* Project Card */}
            <div className="project-card">
              <div className="project-header">
                <div className="project-info">
                  <button
                    className={`expand-button ${isProjectExpanded ? 'expanded' : ''}`}
                    onClick={() => toggleProjectExpansion(project.projectId)}
                    title={isProjectExpanded ? 'Collapse' : 'Expand'}
                  >
                    {isProjectExpanded ? '▼' : '▶'}
                  </button>
                  <div className="project-details">
                    <h2 className="project-title">
                      {project.hierarchyNumber}. {project.projectName}
                    </h2>
                    {project.description && (
                      <p className="project-description">{project.description}</p>
                    )}
                    <div className="project-badges">
                      <StatusBadge status={project.status || 'Not Set'} />
                      <PriorityBadge priority={project.priority || 'Medium'} />
                    </div>
                  </div>
                </div>
                <div className="project-actions">
                  <button 
                    onClick={() => handleAddEpic(project.projectId)}
                    className="btn-add-epic"
                    title="Add Epic"
                  >
                    + Epic
                  </button>
                  <button 
                    onClick={() => handleEdit(project, 'project')}
                    className="btn-icon edit-btn"
                    title="Edit Project"
                  >
                    ✏️
                  </button>
                  <button 
                    onClick={() => handleDelete(project, 'project')}
                    className="btn-icon delete-btn"
                    title="Delete Project"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* Project Stats */}
              <div className="project-stats">
                <div className="stat">
                  <span className="stat-number">{project.epics.length}</span>
                  <span className="stat-label">Epics</span>
                </div>
                <div className="stat">
                  <span className="stat-number">
                    {project.epics.reduce((total, epic) => total + epic.tasks.length, 0)}
                  </span>
                  <span className="stat-label">Tasks</span>
                </div>
                <div className="stat">
                  <span className="stat-number">
                    {Array.from(taskSubtasks.values()).reduce((total, subtasks) => total + subtasks.length, 0)}
                  </span>
                  <span className="stat-label">Subtasks</span>
                </div>
              </div>
            </div>

            {/* Expanded Project Content */}
            {isProjectExpanded && (
              <div className="project-content">
                {project.epics.length === 0 ? (
                  <div className="empty-epics">
                    <p>No epics in this project. Add an epic to get started.</p>
                    <button 
                      onClick={() => handleAddEpic(project.projectId)}
                      className="btn-add-epic"
                    >
                      + Add Epic
                    </button>
                  </div>
                ) : (
                  project.epics.map((epic) => {
                    const isEpicExpanded = expandedEpics.has(epic.id);
                    
                    console.log(`Rendering epic: ${epic.name} (ID: ${epic.id}), expanded: ${isEpicExpanded}`);
                    
                    return (
                      <div key={epic.id} className="epic-container">
                        {/* Epic Row */}
                        <div className="epic-row">
                          <button
                            className={`expand-button ${isEpicExpanded ? 'expanded' : ''}`}
                            onClick={() => toggleEpicExpansion(epic.id)}
                            title={isEpicExpanded ? 'Collapse' : 'Expand'}
                          >
                            {isEpicExpanded ? '▼' : '▶'}
                          </button>
                          <div className="epic-info">
                            <h3 className="epic-title">
                              <TypeIcon type="epic" />
                              {epic.hierarchyNumber}. {epic.name}
                            </h3>
                            {epic.description && (
                              <p className="epic-description">{epic.description}</p>
                            )}
                            <div className="epic-badges">
                              <StatusBadge status={epic.status || 'Not Set'} />
                              <PriorityBadge priority={epic.priority || 'Medium'} />
                            </div>
                          </div>
                          <div className="epic-actions">
                            <button 
                              onClick={() => handleAddTask(epic.id)}
                              className="btn-add-task"
                              title="Add Task"
                            >
                              + Task
                            </button>
                            <button 
                              onClick={() => handleEdit(epic, 'epic')}
                              className="btn-icon edit-btn"
                              title="Edit Epic"
                            >
                              ✏️
                            </button>
                            <button 
                              onClick={() => handleDelete(epic, 'epic')}
                              className="btn-icon delete-btn"
                              title="Delete Epic"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>

                        {/* Expanded Epic Content */}
                        {isEpicExpanded && (
                          <div className="epic-content">
                            {epic.tasks.length === 0 ? (
                              <div className="empty-tasks">
                                <p>No tasks in this epic. Add a task to get started.</p>
                                <button 
                                  onClick={() => handleAddTask(epic.id)}
                                  className="btn-add-task"
                                >
                                  + Add Task
                                </button>
                              </div>
                            ) : (
                              epic.tasks.map((task) => {
                                const isTaskExpanded = expandedTasks.has(task.taskId || task.id);
                                const taskId = task.taskId || task.id;
                                const dynamicSubtasks = taskSubtasks.get(taskId) || [];
                                
                                return (
                                  <div key={taskId} className="task-container">
                                    {/* Task Row */}
                                    <div className="task-row">
                                      <button
                                        className={`expand-button ${isTaskExpanded ? 'expanded' : ''}`}
                                        onClick={() => toggleTaskExpansion(taskId)}
                                        title={isTaskExpanded ? 'Collapse' : 'Expand'}
                                        disabled={dynamicSubtasks.length === 0 && !isTaskExpanded}
                                      >
                                        {isTaskExpanded ? '▼' : dynamicSubtasks.length > 0 || isTaskExpanded ? '▶' : '•'}
                                      </button>
                                      <div className="task-info">
                                        <h4 className="task-title">
                                          <TypeIcon type={task.type} />
                                          {task.hierarchyNumber}. {task.title}
                                        </h4>
                                        {task.description && (
                                          <p className="task-description">{task.description}</p>
                                        )}
                                        <div className="task-badges">
                                          <StatusBadge status={task.status} />
                                          <PriorityBadge priority={task.priority} />
                                          {task.assigneeName && (
                                            <span className="assignee-badge">
                                              👤 {task.assigneeName}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <div className="task-actions">
                                        <button 
                                          onClick={() => handleAddSubtask(taskId)}
                                          className="btn-add-subtask"
                                          title="Add Subtask"
                                        >
                                          + Sub
                                        </button>
                                        <button 
                                          onClick={() => handleEdit(task, 'task')}
                                          className="btn-icon edit-btn"
                                          title="Edit Task"
                                        >
                                          ✏️
                                        </button>
                                        <button 
                                          onClick={() => handleDelete(task, 'task')}
                                          className="btn-icon delete-btn"
                                          title="Delete Task"
                                        >
                                          🗑️
                                        </button>
                                      </div>
                                    </div>

                                    {/* Expanded Task Content (Subtasks) */}
                                    {isTaskExpanded && dynamicSubtasks.length > 0 && (
                                      <div className="subtask-content">
                                        {dynamicSubtasks.map((subtask, subtaskIndex) => (
                                          <div key={subtask.taskId || subtask.id} className="subtask-row">
                                            <div className="subtask-indent">•</div>
                                            <div className="subtask-info">
                                              <h5 className="subtask-title">
                                                <TypeIcon type="sub_task" />
                                                {task.hierarchyNumber}.{subtaskIndex + 1}. {subtask.title}
                                              </h5>
                                              {subtask.description && (
                                                <p className="subtask-description">{subtask.description}</p>
                                              )}
                                              <div className="subtask-badges">
                                                <StatusBadge status={subtask.status} />
                                                <PriorityBadge priority={subtask.priority} />
                                                {subtask.assigneeName && (
                                                  <span className="assignee-badge">
                                                    👤 {subtask.assigneeName}
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                            <div className="subtask-actions">
                                              <button 
                                                onClick={() => handleEdit(subtask, 'subtask')}
                                                className="btn-icon edit-btn"
                                                title="Edit Subtask"
                                              >
                                                ✏️
                                              </button>
                                              <button 
                                                onClick={() => handleDelete(subtask, 'subtask')}
                                                className="btn-icon delete-btn"
                                                title="Delete Subtask"
                                              >
                                                🗑️
                                              </button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default HierarchicalProjectView;
