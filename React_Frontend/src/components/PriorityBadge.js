import React from 'react';
import './PriorityBadge.css';

const PriorityBadge = ({ priority }) => {
  if (!priority) return <span className="priority-badge priority-unknown">Unknown</span>;

  const priorityLower = priority.toLowerCase();
  let badgeClass = 'priority-badge';

  // Jira-style priority color mapping
  switch (priorityLower) {
    case 'highest':
    case 'critical':
    case 'blocker':
      badgeClass += ' priority-highest';
      break;
    case 'high':
    case 'urgent':
      badgeClass += ' priority-high';
      break;
    case 'medium':
    case 'normal':
    case 'standard':
      badgeClass += ' priority-medium';
      break;
    case 'low':
    case 'minor':
      badgeClass += ' priority-low';
      break;
    case 'lowest':
    case 'trivial':
      badgeClass += ' priority-lowest';
      break;
    default:
      badgeClass += ' priority-default';
  }

  return (
    <span className={badgeClass}>
      <span className="priority-icon">●</span>
      {priority}
    </span>
  );
};

export default PriorityBadge;
