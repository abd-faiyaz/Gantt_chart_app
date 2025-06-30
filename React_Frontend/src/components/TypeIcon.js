import React from 'react';

const TypeIcon = ({ type, showLabel = true, className = '' }) => {
  const getTypeIconAndLabel = (type) => {
    switch (type?.toLowerCase()) {
      case 'epic':
        return { icon: '⚡', label: 'Epic' };
      case 'story':
        return { icon: '🟩', label: 'Story' };
      case 'sub_task' || 'Subtask':
        return { icon: '🔗', label: 'Subtask' };
      case 'task':
        return { icon: '☑️', label: 'Task' };
      default:
        return { icon: '❓', label: type || 'Unknown' };
    }
  };

  const { icon, label } = getTypeIconAndLabel(type);

  return (
    <span className={`type-icon ${className}`}>
      <span className="icon">{icon}</span>
      {showLabel && <span className="label">{label}</span>}
    </span>
  );
};

export default TypeIcon;
