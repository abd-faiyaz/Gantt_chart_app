// Declare the package for this class. Adjust if your package structure is different
package com.ontik.gantt_project_v1.service;

// Import the required classes and annotations
import com.ontik.gantt_project_v1.model.Task; // Import the Task entity
import com.ontik.gantt_project_v1.repository.TaskRepository; // Import the TaskRepository
import org.springframework.beans.factory.annotation.Autowired; // For dependency injection
import org.springframework.stereotype.Service; // Marks this class as a Spring service

import java.time.Duration;
import java.time.LocalDate; // For date filtering
import java.util.*; // For List, Optional, and UUID
import java.util.stream.Collectors; // For stream operations

// Annotate this class as a Spring service so it can be auto-detected and injected
// Marks this class as a Spring service, making it a candidate for component scanning and dependency injection
@Service
public class TaskService {

    // The TaskRepository is injected here to handle database operations for Task entities
    private final TaskRepository taskRepository;

    // Constructor-based dependency injection is preferred for mandatory dependencies
    @Autowired
    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    /**
     * Fetches all Task entities from the database.
     * @return List<Task> - a list containing all tasks in the database.
     * The returned list is created by the repository's findAll() method, which queries the database and returns all Task records.
     */
    public List<Task> getAllTasks() {
        return taskRepository.findAll(); // Returns a new List<Task> containing all tasks from the DB
    }

    /**
     * Retrieves a single Task by its unique identifier.
     * @param taskId UUID of the task to fetch.
     * @return Optional<Task> - contains the Task if found, or empty if not found.
     * The Optional object is returned by the repository's findById method, which queries the DB for the given ID.
     */
    public Optional<Task> getTaskById(UUID taskId) {
        return taskRepository.findById(taskId); // Returns Optional<Task> (empty if not found)
    }

    /**
     * Saves a new Task or updates an existing one if the ID already exists.
     * @param task Task object to save.
     * @return Task - the saved Task entity (with any DB-generated fields populated, e.g., timestamps or IDs).
     * The returned Task is the managed entity after being persisted by the repository's save() method.
     */
    public Task saveTask(Task task) {
        return taskRepository.save(task); // Persists the task and returns the managed entity
    }

    /**
     * Updates an existing Task by its ID with new values.
     * @param taskId UUID of the task to update.
     * @param updatedTask Task object containing updated fields.
     * @return Optional<Task> - contains the updated Task if found and updated, or empty if not found.
     * The returned Optional contains the Task after its fields are updated and saved to the DB.
     */
    public Optional<Task> updateTask(UUID taskId, Task updatedTask) {
        // Attempt to find the existing task by ID
        return taskRepository.findById(taskId)
                .map(existingTask -> {
                    // Update each field of the existing task with values from updatedTask
                    existingTask.setType(updatedTask.getType());
                    existingTask.setTitle(updatedTask.getTitle());
                    existingTask.setDescription(updatedTask.getDescription());
                    existingTask.setEpicId(updatedTask.getEpicId());
                    existingTask.setSprintId(updatedTask.getSprintId());
                    existingTask.setStartDate(updatedTask.getStartDate());
                    existingTask.setDueDate(updatedTask.getDueDate());
                    existingTask.setOriginalEstimate(updatedTask.getOriginalEstimate());
                    existingTask.setStatus(updatedTask.getStatus());
                    existingTask.setAssigneeId(updatedTask.getAssigneeId());
                    existingTask.setPriority(updatedTask.getPriority());
                    // existingTask.setLabels(updatedTask.getLabels()); // Uncomment if labels are used
                    existingTask.setParentTaskId(updatedTask.getParentTaskId());
                    existingTask.setCreatedAt(updatedTask.getCreatedAt());
                    existingTask.setUpdatedAt(updatedTask.getUpdatedAt());
                    // Save the updated task back to the database and return it
                    return taskRepository.save(existingTask); // Returns the updated and persisted Task
                });
    }

    /**
     * Deletes a Task by its ID.
     * @param taskId UUID of the task to delete.
     * @return boolean - true if the task was found and deleted, false if not found.
     * The boolean result indicates whether the delete operation was successful.
     */
    public boolean deleteTask(UUID taskId) {
        if (taskRepository.existsById(taskId)) { // Check if the task exists in the DB
            taskRepository.deleteById(taskId); // Delete the task if it exists
            return true; // Return true to indicate successful deletion
        } else {
            return false; // Return false if the task was not found
        }
    }

    /**
     * Filters tasks based on provided criteria such as date range, type, status, and priority.
     * @param startDate String (ISO format) - filter tasks updated after this date.
     * @param endDate String (ISO format) - filter tasks updated before this date.
     * @param types String (comma-separated) - filter by task types.
     * @param assignee String - (not implemented) filter by assignee.
     * @param status String - filter by task status.
     * @param priority String - filter by task priority.
     * @return List<Task> - a list of tasks matching all provided filters.
     * The returned list is built by streaming all tasks and applying filter predicates for each criterion.
     */
    public List<Task> getFilteredTasks(String startDate, String endDate, String types, 
                                      String assignee, String status, String priority) {
        // Fetch all tasks from the database
        List<Task> allTasks = taskRepository.findAll();

        // Stream through all tasks and apply filters
        return allTasks.stream()
                .filter(task -> {
                    // Filter by start date (updatedAt >= startDate)
                    if (startDate != null && task.getUpdatedAt() != null) {
                        try {
                            if (task.getUpdatedAt().toLocalDate().isBefore(LocalDate.parse(startDate))) {
                                return false; // Exclude tasks updated before startDate
                            }
                        } catch (Exception e) {
                            // Ignore parsing errors and skip this filter
                        }
                    }

                    // Filter by end date (updatedAt <= endDate)
                    if (endDate != null && task.getUpdatedAt() != null) {
                        try {
                            if (task.getUpdatedAt().toLocalDate().isAfter(LocalDate.parse(endDate))) {
                                return false; // Exclude tasks updated after endDate
                            }
                        } catch (Exception e) {
                            // Ignore parsing errors and skip this filter
                        }
                    }

                    // Filter by task types (matches any of the provided types)
                    if (types != null && !types.isEmpty()) {
                        String[] typeArray = types.split(",");
                        boolean typeMatches = false;
                        for (String type : typeArray) {
                            if (task.getType() != null && task.getType().equalsIgnoreCase(type.trim())) {
                                typeMatches = true;
                                break;
                            }
                        }
                        if (!typeMatches) return false; // Exclude if type doesn't match any
                    }

                    // Filter by assignee (not implemented, placeholder for future logic)

                    // Filter by status (case-insensitive match)
                    if (status != null && !status.isEmpty()) {
                        if (task.getStatus() == null || !task.getStatus().equalsIgnoreCase(status)) {
                            return false; // Exclude if status doesn't match
                        }
                    }

                    // Filter by priority (case-insensitive match)
                    if (priority != null && !priority.isEmpty()) {
                        if (task.getPriority() == null || !task.getPriority().equalsIgnoreCase(priority)) {
                            return false; // Exclude if priority doesn't match
                        }
                    }

                    // If all filters pass, include the task
                    return true;
                })
                .collect(Collectors.toList()); // Collect and return the filtered tasks as a List<Task>
    }

    /**
     * Helper method to convert days (as double) to Duration.
     * Assumes 8-hour workdays.
     * @param days Number of days as double (e.g., 1.5 for 1.5 days)
     * @return Duration object representing the days in hours
     */
    public static Duration convertDaysToDuration(double days) {
        if (days <= 0) {
            return Duration.ZERO;
        }
        // Convert days to hours (8 hours per day) and then to Duration
        long hours = (long) (days * 8);
        return Duration.ofHours(hours);
    }

    /**
     * Helper method to convert Duration to days (as double).
     * Assumes 8-hour workdays.
     * @param duration Duration object
     * @return Number of days as double (e.g., 1.5 for 12 hours)
     */
    public static double convertDurationToDays(Duration duration) {
        if (duration == null || duration.isZero()) {
            return 0.0;
        }
        // Convert duration to hours and then to days (8 hours per day)
        long hours = duration.toHours();
        return hours / 8.0;
    }

    /**
     * Helper method to parse days from string format.
     * Supports formats like "P1.5D", "1.5", etc.
     * @param daysString String representation of days
     * @return Duration object
     */
    public static Duration parseDaysString(String daysString) {
        if (daysString == null || daysString.trim().isEmpty()) {
            return null;
        }
        
        try {
            // Handle ISO-8601 duration format (P1.5D)
            if (daysString.startsWith("P") && daysString.endsWith("D")) {
                String daysValue = daysString.substring(1, daysString.length() - 1);
                double days = Double.parseDouble(daysValue);
                return convertDaysToDuration(days);
            }
            // Handle plain number format (1.5)
            else {
                double days = Double.parseDouble(daysString);
                return convertDaysToDuration(days);
            }
        } catch (NumberFormatException e) {
            // Return null for invalid formats
            return null;
        }
    }

    // ========== HIERARCHICAL TASK METHODS ==========

    /**
     * Get all epic tasks (tasks with type 'epic')
     */
    public List<Task> getAllEpics() {
        return taskRepository.findAllEpics();
    }

    /**
     * Get top-level tasks under an epic (stories and tasks, excluding subtasks)
     */
    public List<Task> getTopLevelTasksByEpicId(UUID epicId) {
        return taskRepository.findTopLevelTasksByEpicId(epicId);
    }

    /**
     * Get stories and tasks under an epic (excluding subtasks)
     */
    public List<Task> getStoriesAndTasksByEpicId(UUID epicId) {
        return taskRepository.findStoriesAndTasksByEpicId(epicId);
    }

    /**
     * Get subtasks under a parent task
     */
    public List<Task> getSubTasksByParentId(UUID parentTaskId) {
        return taskRepository.findSubTasksByParentId(parentTaskId);
    }

    /**
     * Get tasks by epic ID
     */
    public List<Task> getTasksByEpicId(UUID epicId) {
        return taskRepository.findByEpicId(epicId);
    }

    /**
     * Get tasks by parent task ID
     */
    public List<Task> getTasksByParentTaskId(UUID parentTaskId) {
        return taskRepository.findByParentTaskId(parentTaskId);
    }

    /**
     * Get tasks by type
     */
    public List<Task> getTasksByType(String type) {
        return taskRepository.findByType(type);
    }

    /**
     * Get tasks by status
     */
    public List<Task> getTasksByStatus(String status) {
        return taskRepository.findByStatus(status);
    }

    /**
     * Get tasks by priority
     */
    public List<Task> getTasksByPriority(String priority) {
        return taskRepository.findByPriority(priority);
    }
}
