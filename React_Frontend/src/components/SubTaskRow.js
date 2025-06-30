import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import TypeIcon from './TypeIcon';

const SubTaskRow = ({ subtask, level = 2, onDeleteTask }) => {
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate("/edit-task", { state: { task: subtask } });
  };

  const handleDelete = () => {
    onDeleteTask(subtask);
  };

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

  const indentClass = `subtask-row level-${level}`;

  return (
    <tr className={indentClass}>
      <td className="expand-column">
        {/* No expand button for subtasks (leaf nodes) */}
      </td>
      <td className={`subtask-title level-${level}`}>
        {subtask.title}
      </td>
      <td>
        <TypeIcon type={subtask.type} />
      </td>
      <td><StatusBadge status={subtask.status} /></td>
      <td><PriorityBadge priority={subtask.priority} /></td>
      <td>{subtask.assigneeName || subtask.assigneeId || 'Unassigned'}</td>
      <td className="date-column">{subtask.startDate}</td>
      <td className="date-column">{subtask.dueDate || 'N/A'}</td>
      <td>
        <div className="button-container">
          <button onClick={handleEdit} className="button-list edit-btn">Edit</button>
          <button onClick={handleDelete} className="button-list delete-btn">Delete</button>
        </div>
      </td>
    </tr>
  );
};

export default SubTaskRow;
