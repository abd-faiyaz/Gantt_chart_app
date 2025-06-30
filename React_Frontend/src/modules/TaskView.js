import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TaskCard from "../components/TaskList";
import HierarchicalTaskTable from "../components/HierarchicalTaskTable";
import "./TaskView.css";
import Filter from "../components/Filter";

const TaskView = () => {
  const [tasks, setTasks] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [activeFilters, setActiveFilters] = useState(null);
  const [viewMode, setViewMode] = useState('hierarchical'); // 'hierarchical' or 'flat'
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Add refresh trigger for hierarchical view
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
  }, []);

  // Fetch tasks from backend API
  const fetchTasks = async (filterParams = null) => {
    try {
      let url = "/tasks";
      
      // If filters are provided, use the filter endpoint
      if (filterParams) {
        const queryParams = new URLSearchParams();
        
        if (filterParams.startDate) queryParams.append('startDate', filterParams.startDate);
        if (filterParams.endDate) queryParams.append('endDate', filterParams.endDate);
        if (filterParams.types && filterParams.types.length > 0) {
          queryParams.append('types', filterParams.types.join(','));
        }
        if (filterParams.assignee) queryParams.append('assignee', filterParams.assignee);
        if (filterParams.status) queryParams.append('status', filterParams.status);
        if (filterParams.priority) queryParams.append('priority', filterParams.priority);
        
        url = `/tasks/filter?${queryParams.toString()}`;
      }
      
      console.log("Fetching tasks from", url);
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch tasks");
      const data = await response.json();
      console.log("Fetched tasks:", data);
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setTasks([]);
    }
  };

  // Handle filter application
  const handleFilterApply = (filterData) => {
    console.log("Applying filters:", filterData);
    
    // Process the filter data
    const processedFilters = {
      startDate: filterData.startDate || null,
      endDate: filterData.endDate || null,
      types: [],
      assignee: filterData.assignee || null,
      status: filterData.status || null,
      priority: filterData.priority || null
    };
    
    // Process work types from checkboxes
    if (filterData.epic) processedFilters.types.push('epic');
    if (filterData.story) processedFilters.types.push('story');
    if (filterData.subtask) processedFilters.types.push('sub_task');
    if (filterData.task) processedFilters.types.push('task');
    
    setActiveFilters(processedFilters);
    fetchTasks(processedFilters);
  };

  // Handle filter clear
  const handleFilterClear = () => {
    console.log("Clearing filters");
    setActiveFilters(null);
    fetchTasks(); // Fetch all tasks without filters
  };

  const handleAddTask = () => {
    navigate("/add-task");
  };

  const handleAddEpic = () => {
    navigate("/add-epic");
  };

  const handleDeleteClick = (task) => {
    setTaskToDelete(task);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      console.log("Deleting item:", taskToDelete);
      
      // Determine if this is an epic or a task based on available fields
      const isEpic = taskToDelete.epicId || (taskToDelete.type === 'epic') || 
                    (!taskToDelete.taskId && taskToDelete.name); // Epic has name, task has title
      
      const itemId = taskToDelete.epicId || taskToDelete.taskId || taskToDelete.id;
      const endpoint = isEpic ? `/epics/${itemId}` : `/tasks/${itemId}`;
      const itemType = isEpic ? 'epic' : 'task';
      
      console.log(`Deleting ${itemType} with ID:`, itemId);
      
      const response = await fetch(endpoint, {
        method: "DELETE"
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete ${itemType}: ${errorText}`);
      }
      
      console.log(`${itemType} deleted successfully`);
      
      // Remove from local state after successful backend deletion
      if (isEpic) {
        // For epics, we don't maintain them in the tasks state, so just refresh
        console.log("Epic deleted, refreshing views...");
      } else {
        setTasks(tasks.filter(t => (t.taskId || t.id) !== itemId));
      }
      
      setShowConfirm(false);
      setTaskToDelete(null);
      
      // Refresh the task list to ensure consistency
      fetchTasks(activeFilters);
      
      // Trigger refresh for hierarchical view
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error("Error deleting item:", error);
      alert(`Failed to delete item: ${error.message}`);
      setShowConfirm(false);
      setTaskToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
    setTaskToDelete(null);
  };

  return (
    <div className="modern-task-view">
      <div className="task-view-header">
        <h2>Task Management</h2>
        <div className="header-controls">
          <div className="view-toggle">
            <button 
              className={`toggle-btn ${viewMode === 'hierarchical' ? 'active' : ''}`}
              onClick={() => setViewMode('hierarchical')}
            >
              📊 Hierarchical
            </button>
            <button 
              className={`toggle-btn ${viewMode === 'flat' ? 'active' : ''}`}
              onClick={() => setViewMode('flat')}
            >
              📋 Flat List
            </button>
          </div>
          <button className="modern-create-btn" onClick={viewMode === 'hierarchical' ? handleAddEpic : handleAddTask}>
            <span className="plus-icon">+</span> {viewMode === 'hierarchical' ? 'Create Epic' : 'Create Task'}
          </button>
        </div>
      </div>

      <div className="modern-filter-section">
        <Filter onFilterApply={handleFilterApply} onFilterClear={handleFilterClear} activeFilters={activeFilters} />
      </div>

      <div className="modern-table-container">
        {viewMode === 'hierarchical' ? (
          <HierarchicalTaskTable 
            tasks={tasks} 
            onDeleteTask={handleDeleteClick}
            onEditTask={(task) => navigate("/edit-task", { state: { task } })}
            refreshTrigger={refreshTrigger}
          />
        ) : (
          <div className="table-scroll-container">
            <table className="modern-task-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Assignee</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Estimation (Days)</th>
                  <th className="date-column">Start Date</th>
                  <th className="date-column">Due Date</th>
                  <th>Labels</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks
                  .map((task, idx) => (
                    <TaskCard
                      key={task.task_id || idx}
                      task={task}
                      onDelete={() => handleDeleteClick(task)}
                    />
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showConfirm && (
        <div className="modern-confirm-overlay">
          <div className="modern-confirm-box">
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete this task?</p>
            <div className="confirm-buttons">
              <button className="confirm-btn delete" onClick={handleConfirmDelete}>Delete</button>
              <button className="confirm-btn cancel" onClick={handleCancelDelete}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskView;