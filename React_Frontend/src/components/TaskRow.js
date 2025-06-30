import React, { useState, useEffect } from 'react';
import SubTaskRow from './SubTaskRow';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import TypeIcon from './TypeIcon';

const TaskRow = ({ task, level = 1, isExpanded, onToggleExpand, onDeleteTask, refreshTrigger }) => {
  const [subtasks, setSubtasks] = useState([]);
  const [loadingSubtasks, setLoadingSubtasks] = useState(false);
  const navigate = useNavigate();

  const taskId = task.id || task.taskId;

  useEffect(() => {
    if (isExpanded && subtasks.length === 0) {
      fetchSubtasksForTask();
    }
  }, [isExpanded]);

  // Refetch subtasks when refreshTrigger changes and task is expanded
  useEffect(() => {
    if (isExpanded && refreshTrigger > 0) {
      fetchSubtasksForTask();
    }
  }, [refreshTrigger]);

  // Refetch subtasks when refreshTrigger changes and task is expanded
  useEffect(() => {
    if (isExpanded && refreshTrigger > 0) {
      fetchSubtasksForTask();
    }
  }, [refreshTrigger]);

  const fetchSubtasksForTask = async () => {
    try {
      setLoadingSubtasks(true);
      console.log(`Fetching subtasks for task ${taskId}...`);
      
      const response = await fetch(`/tasks/${taskId}/subtasks`);
      if (!response.ok) {
        throw new Error('Failed to fetch subtasks for task');
      }

      const taskSubtasks = await response.json();
      console.log(`Found ${taskSubtasks.length} subtasks for task ${taskId}:`, taskSubtasks);
      setSubtasks(taskSubtasks);
    } catch (error) {
      console.error('Error fetching subtasks for task:', error);
      setSubtasks([]);
    } finally {
      setLoadingSubtasks(false);
    }
  };

  const handleTaskClick = () => {
    onToggleExpand(taskId);
  };

  const handleEdit = () => {
    navigate("/edit-task", { state: { task } });
  };

  const handleDelete = () => {
    onDeleteTask(task);
  };

  const handleAddSubtask = () => {
    navigate(`/add-subtask/${taskId}`);
  };

  const hasSubtasks = task.type === 'story' || task.type === 'task';
  const indentClass = `task-row level-${level}`;

  // Helper function to format estimate as days
  const formatEstimateAsDays = (originalEstimate) => {
    if (!originalEstimate) return 'N/A';
    
    if (typeof originalEstimate === 'string') {
      if (originalEstimate.startsWith('P') && originalEstimate.endsWith('D')) {
        const days = originalEstimate.substring(1, originalEstimate.length - 1);
        return `${days} days`;
      }
      return originalEstimate;
    }
    
    if (typeof originalEstimate === 'object') {
      if (originalEstimate.seconds !== undefined) {
        const hours = originalEstimate.seconds / 3600;
        const days = (hours / 8).toFixed(1);
        return `${days} days`;
      }
      return JSON.stringify(originalEstimate);
    }
    
    return originalEstimate.toString();
  };

  return (
    <>
      {/* Task/Story Row */}
      <tr className={indentClass}>
        <td className="expand-column">
          {hasSubtasks && (
            <button
              className={`expand-button ${isExpanded ? 'expanded' : ''}`}
              onClick={handleTaskClick}
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
        </td>
        <td className={`task-title level-${level}`}>
          <div className="title-with-action">
            <span>{task.title}</span>
            {hasSubtasks && (
              <button 
                onClick={handleAddSubtask}
                className="add-subtask-btn"
                title="Add Subtask"
              >
                +
              </button>
            )}
          </div>
        </td>
        <td>
          <TypeIcon type={task.type} />
        </td>
        <td><StatusBadge status={task.status} /></td>
        <td><PriorityBadge priority={task.priority} /></td>
        <td>{task.assigneeName || task.assigneeId || 'Unassigned'}</td>
        <td className="date-column">{task.startDate}</td>
        <td className="date-column">{task.dueDate || 'N/A'}</td>
        <td>
          <div className="button-container">
            <button onClick={handleEdit} className="button-list edit-btn">Edit</button>
            <button onClick={handleDelete} className="button-list delete-btn">Delete</button>
          </div>
        </td>
      </tr>

      {/* Expanded Subtasks */}
      {isExpanded && hasSubtasks && (
        <>
          {loadingSubtasks ? (
            <tr className="loading-row">
              <td colSpan="9" className="loading-cell">
                Loading subtasks...
              </td>
            </tr>
          ) : subtasks.length === 0 ? (
            <tr className="empty-row">
              <td colSpan="9" className="empty-cell">
                No subtasks found under this {task.type}.
              </td>
            </tr>
          ) : (
            subtasks.map((subtask) => (
              <SubTaskRow
                key={subtask.id || subtask.taskId}
                subtask={subtask}
                level={level + 1}
                onDeleteTask={onDeleteTask}
              />
            ))
          )}
        </>
      )}
    </>
  );
};

export default TaskRow;
