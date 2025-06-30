import React, { useState, useEffect } from 'react';
import EpicRow from './EpicRow';
import './HierarchicalTaskTable.css';

const HierarchicalTaskTable = ({ tasks, onDeleteTask, refreshTrigger }) => {
  const [epics, setEpics] = useState([]);
  const [expandedEpics, setExpandedEpics] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEpics();
  }, [refreshTrigger]); // Add refreshTrigger as dependency

  const fetchEpics = async () => {
    try {
      setLoading(true);
      console.log("Fetching epics for hierarchical view...");
      
      // Fetch both epic tasks (from tasks table) and real epics
      const [epicTasksResponse, epicsResponse] = await Promise.all([
        fetch('/tasks/epics'),
        fetch('/epics/top-level')
      ]);

      if (!epicTasksResponse.ok || !epicsResponse.ok) {
        throw new Error('Failed to fetch epics');
      }

      const epicTasks = await epicTasksResponse.json();
      const realEpics = await epicsResponse.json();

      console.log("Epic tasks:", epicTasks);
      console.log("Real epics:", realEpics);

      // Prioritize real epics from epics table over tasks with type 'epic'
      const allEpics = realEpics.length > 0 ? realEpics : epicTasks;
      setEpics(allEpics);
    } catch (error) {
      console.error('Error fetching epics:', error);
      setEpics([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskDelete = (taskOrEpic) => {
    // Just call the parent's delete handler - the parent will handle the actual deletion
    // and trigger a refresh via the refreshTrigger prop
    onDeleteTask(taskOrEpic);
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

  if (loading) {
    return (
      <div className="hierarchical-loading">
        <p>Loading hierarchical view...</p>
      </div>
    );
  }

  if (epics.length === 0) {
    return (
      <div className="hierarchical-empty">
        <p>No epics found. Create an epic to organize your tasks hierarchically.</p>
      </div>
    );
  }

  return (
    <div className="hierarchical-task-table">
      <table className="modern-task-table">
        <thead>
          <tr>
            <th className="expand-column"></th>
            <th>Title</th>
            <th>Type</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Assignee</th>
            <th className="date-column">Start Date</th>
            <th className="date-column">End Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {epics.map((epic) => (
            <EpicRow
              key={epic.id || epic.epicId || epic.taskId}
              epic={epic}
              isExpanded={expandedEpics.has(epic.id || epic.epicId || epic.taskId)}
              onToggleExpand={toggleEpicExpansion}
              onDeleteTask={handleTaskDelete}
              refreshTrigger={refreshTrigger}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HierarchicalTaskTable;
