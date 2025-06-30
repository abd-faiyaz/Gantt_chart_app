import React, { useState, useEffect } from 'react';
import TaskRow from './TaskRow';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import TypeIcon from './TypeIcon';

const EpicRow = ({ epic, isExpanded, onToggleExpand, onDeleteTask, refreshTrigger }) => {
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState(new Set());
  const navigate = useNavigate();

  const epicId = epic.id || epic.epicId || epic.taskId;

  useEffect(() => {
    if (isExpanded && tasks.length === 0) {
      fetchTasksForEpic();
    }
  }, [isExpanded]);

  // Refetch tasks when refreshTrigger changes and epic is expanded
  useEffect(() => {
    if (isExpanded && refreshTrigger > 0) {
      fetchTasksForEpic();
    }
  }, [refreshTrigger]);

  const fetchTasksForEpic = async () => {
    try {
      setLoadingTasks(true);
      console.log(`Fetching tasks for epic ${epicId}...`);
      
      const response = await fetch(`/tasks/epic/${epicId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tasks for epic');
      }

      const epicTasks = await response.json();
      console.log(`Found ${epicTasks.length} tasks for epic ${epicId}:`, epicTasks);
      setTasks(epicTasks);
    } catch (error) {
      console.error('Error fetching tasks for epic:', error);
      setTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleEpicClick = () => {
    onToggleExpand(epicId);
  };

  const handleTaskToggle = (taskId) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const handleEdit = () => {
    navigate("/edit-epic", { state: { epic: epic } });
  };

  const handleDelete = () => {
    onDeleteTask(epic);
  };

  const handleAddTask = () => {
    navigate(`/add-task/${epicId}`);
  };

  const getEpicTitle = () => {
    return epic.title || epic.name || 'Untitled Epic';
  };

  const getEpicType = () => {
    return epic.type || 'epic';
  };

  return (
    <>
      {/* Epic Row */}
      <tr className="epic-row">
        <td className="expand-column">
          <button
            className={`expand-button ${isExpanded ? 'expanded' : ''}`}
            onClick={handleEpicClick}
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        </td>
        <td className="epic-title">
          <div className="title-with-action">
            <strong>{getEpicTitle()}</strong>
            <button 
              onClick={handleAddTask}
              className="add-task-btn"
              title="Add Task"
            >
              +
            </button>
          </div>
        </td>
        <td>
          <TypeIcon type={getEpicType()} />
        </td>
        <td><StatusBadge status={epic.status || 'Not Started'} /></td>
        <td><PriorityBadge priority={epic.priority || 'Medium'} /></td>
        <td>{epic.assigneeName || epic.assignedToName || epic.assigneeId || epic.assignedTo || 'Unassigned'}</td>
        <td className="date-column">{epic.startDate}</td>
        <td className="date-column">{epic.endDate || epic.dueDate || 'N/A'}</td>
        <td>
          <div className="button-container">
            <button onClick={handleEdit} className="button-list edit-btn">Edit</button>
            <button onClick={handleDelete} className="button-list delete-btn">Delete</button>
          </div>
        </td>
      </tr>

      {/* Expanded Tasks */}
      {isExpanded && (
        <>
          {loadingTasks ? (
            <tr className="loading-row">
              <td colSpan="9" className="loading-cell">
                Loading tasks for epic...
              </td>
            </tr>
          ) : tasks.length === 0 ? (
            <tr className="empty-row">
              <td colSpan="9" className="empty-cell">
                No tasks found under this epic.
              </td>
            </tr>
          ) : (
            tasks.map((task) => (
              <TaskRow
                key={task.id || task.taskId}
                task={task}
                level={1}
                isExpanded={expandedTasks.has(task.id || task.taskId)}
                onToggleExpand={handleTaskToggle}
                onDeleteTask={onDeleteTask}
                refreshTrigger={refreshTrigger}
              />
            ))
          )}
        </>
      )}
    </>
  );
};

export default EpicRow;
