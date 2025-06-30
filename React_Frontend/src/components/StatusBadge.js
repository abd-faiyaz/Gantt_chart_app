import React from 'react';
import './StatusBadge.css';

const StatusBadge = ({ status }) => {
  if (!status) return <span className="status-badge status-unknown">Unknown</span>;

  const statusLower = status.toLowerCase();
  let badgeClass = 'status-badge';

  // Jira-style status color mapping
  switch (statusLower) {
    case 'to do':
    case 'todo':
    case 'open':
    case 'new':
      badgeClass += ' status-todo';
      break;
    case 'in progress':
    case 'in-progress':
    case 'doing':
    case 'active':
      badgeClass += ' status-inprogress';
      break;
    case 'done':
    case 'closed':
    case 'completed':
    case 'resolved':
      badgeClass += ' status-done';
      break;
    case 'blocked':
    case 'on hold':
    case 'on-hold':
      badgeClass += ' status-blocked';
      break;
    case 'testing':
    case 'review':
    case 'code review':
      badgeClass += ' status-review';
      break;
    default:
      badgeClass += ' status-default';
  }

  return (
    <span className={badgeClass}>
      {status}
    </span>
  );
};

export default StatusBadge;
