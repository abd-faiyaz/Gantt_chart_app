// Import necessary Spring and Java packages
package com.ontik.gantt_project_v1.controller;

// Import REST controller and mapping annotations
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
// Import ResponseEntity for HTTP responses
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.format.annotation.DateTimeFormat;

// Import list and UUID
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.time.LocalDate;
import java.util.Map;
import java.util.HashMap;

// Import your Task and TaskService
import com.ontik.gantt_project_v1.model.Task;
import com.ontik.gantt_project_v1.service.TaskService;
import com.ontik.gantt_project_v1.service.HolidayService;

// Mark this class as a REST controller so it can handle HTTP requests
@RestController
// Allow CORS for React dev server (change origins as needed)
@CrossOrigin(origins = "http://localhost:3000")
// Prefix all endpoints in this controller with /api/tasks
@RequestMapping("/tasks")
public class TaskController {

    // Inject the TaskService to handle business logic
    @Autowired
    private TaskService taskService;
    
    // Inject the HolidayService for date calculations
    @Autowired
    private HolidayService holidayService;

    /**
     * Helper method to process task estimate from frontend
     * The frontend may send estimate in various formats (P1.5D, 1.5, etc.)
     */
    private void processTaskEstimate(Task task) {
        // The estimate comes from frontend as Duration already processed by Hibernate
        // No additional processing needed here since the frontend will send P{days}D format
        // and Hibernate will handle the conversion
    }

    // Handle GET requests to /api/tasks - return all tasks
    @GetMapping
    public List<Task> getAllTasks() {
        System.out.println("GET /tasks - Fetching all tasks");
        // Call service to get all tasks and return as JSON
        List<Task> tasks = taskService.getAllTasks();
        System.out.println("Found " + tasks.size() + " tasks");
        return tasks;
    }

    // Handle GET requests to /api/tasks/{id} - get task by ID
    @GetMapping("/{id}")
    public ResponseEntity<Task> getTaskById(@PathVariable UUID id) {
        // Find task by ID
        Optional<Task> task = taskService.getTaskById(id);
        // If found, return 200 OK with task, else 404 Not Found
        return task.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Handle POST requests to /api/tasks - create a new task
    @PostMapping
    public ResponseEntity<Task> createTask(@RequestBody Task task) {
        System.out.println("POST /tasks - Creating new task: " + task.getTitle());
        System.out.println("Task details: " + task);
        System.out.println("Original estimate received: " + task.getOriginalEstimate());
        
        // Process task estimate (already handled by Hibernate from P{days}D format)
        processTaskEstimate(task);
        
        // Save new task and return 201 Created with the task
        Task savedTask = taskService.saveTask(task);
        System.out.println("Task saved with ID: " + savedTask.getTaskId());
        return new ResponseEntity<>(savedTask, HttpStatus.CREATED);
    }

    // Handle PUT requests to /api/tasks/{id} - update an existing task
    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable UUID id, @RequestBody Task updatedTask) {
        System.out.println("PUT /tasks/" + id + " - Updating task: " + updatedTask.getTitle());
        System.out.println("Original estimate received: " + updatedTask.getOriginalEstimate());
        
        // Process task estimate (already handled by Hibernate from P{days}D format)
        processTaskEstimate(updatedTask);
        
        // Call service to update the task
        Optional<Task> updated = taskService.updateTask(id, updatedTask);
        // If found and updated, return 200 OK, else 404 Not Found
        return updated.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Handle DELETE requests to /api/tasks/{id} - delete a task
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable UUID id) {
        System.out.println("DELETE /tasks/" + id + " - Deleting task");
        // Call service to delete the task
        boolean deleted = taskService.deleteTask(id);
        System.out.println("Task deletion result: " + deleted);
        // If deleted, return 204 No Content, else 404 Not Found
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    // Handle GET requests to /tasks/filter - return filtered tasks
    @GetMapping("/filter")
    public List<Task> getFilteredTasks(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String types,
            @RequestParam(required = false) String assignee,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority) {
        
        // Log the start of the filter request and the parameters received
        System.out.println("GET /tasks/filter - Filtering tasks with parameters:");
        System.out.println("startDate: " + startDate + ", endDate: " + endDate);
        System.out.println("types: " + types + ", assignee: " + assignee);
        System.out.println("status: " + status + ", priority: " + priority);

        // Call the service layer to get tasks that match the filter criteria
        List<Task> filteredTasks = taskService.getFilteredTasks(startDate, endDate, types, assignee, status, priority);

        // Log the number of tasks found after filtering
        System.out.println("Found " + filteredTasks.size() + " filtered tasks");

        // Return the filtered list of tasks as the HTTP response body
        return filteredTasks;
    }

    // Handle POST requests to /tasks/calculate-end-date - calculate end date based on start date and estimate
    @PostMapping("/calculate-end-date")
    public ResponseEntity<Map<String, Object>> calculateEndDate(@RequestBody Map<String, Object> request) {
        try {
            String startDateStr = (String) request.get("startDate");
            Integer estimateDays = (Integer) request.get("estimateDays");

            if (startDateStr == null || estimateDays == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "startDate and estimateDays are required"));
            }

            LocalDate startDate = LocalDate.parse(startDateStr);
            LocalDate calculatedEndDate = holidayService.calculateEndDate(startDate, estimateDays);

            System.out.println("POST /tasks/calculate-end-date - Start: " + startDate + 
                             ", Estimate: " + estimateDays + " days, Calculated End: " + calculatedEndDate);

            Map<String, Object> response = new HashMap<>();
            response.put("startDate", startDate.toString());
            response.put("estimateDays", estimateDays);
            response.put("calculatedEndDate", calculatedEndDate.toString());
            response.put("isWorkingDay", holidayService.isWorkingDay(calculatedEndDate));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error calculating end date: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid date format or calculation error"));
        }
    }

    // Handle GET requests to /tasks/validate-end-date - validate user-selected end date
    @GetMapping("/validate-end-date")
    public ResponseEntity<Map<String, Object>> validateEndDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam int estimateDays,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate selectedEndDate) {

        System.out.println("GET /tasks/validate-end-date - Start: " + startDate + 
                         ", Estimate: " + estimateDays + " days, Selected End: " + selectedEndDate);

        LocalDate calculatedEndDate = holidayService.calculateEndDate(startDate, estimateDays);
        boolean isValid = holidayService.validateEndDate(startDate, estimateDays, selectedEndDate);

        Map<String, Object> response = new HashMap<>();
        response.put("isValid", isValid);
        response.put("calculatedEndDate", calculatedEndDate.toString());
        response.put("selectedEndDate", selectedEndDate.toString());
        response.put("message", isValid ? "Valid end date" : 
                     "End date must be on or after " + calculatedEndDate.toString());

        System.out.println("Validation result: " + (isValid ? "VALID" : "INVALID"));
        return ResponseEntity.ok(response);
    }

    // ========== HIERARCHICAL TASK ENDPOINTS ==========

    /**
     * Get all epics (tasks with type 'epic')
     */
    @GetMapping("/epics")
    public List<Task> getAllEpics() {
        System.out.println("GET /tasks/epics - Fetching all epic tasks");
        List<Task> epics = taskService.getAllEpics();
        System.out.println("Found " + epics.size() + " epic tasks");
        return epics;
    }

    /**
     * Get tasks under a specific epic
     */
    @GetMapping("/epic/{epicId}")
    public List<Task> getTasksByEpicId(@PathVariable UUID epicId) {
        System.out.println("GET /tasks/epic/" + epicId + " - Fetching tasks under epic");
        List<Task> tasks = taskService.getTopLevelTasksByEpicId(epicId);
        System.out.println("Found " + tasks.size() + " tasks under epic " + epicId);
        return tasks;
    }

    /**
     * Get subtasks under a specific parent task
     */
    @GetMapping("/{taskId}/subtasks")
    public List<Task> getSubTasksByParentId(@PathVariable UUID taskId) {
        System.out.println("GET /tasks/" + taskId + "/subtasks - Fetching subtasks");
        List<Task> subtasks = taskService.getSubTasksByParentId(taskId);
        System.out.println("Found " + subtasks.size() + " subtasks under task " + taskId);
        return subtasks;
    }

    /**
     * Get tasks by type
     */
    @GetMapping("/type/{type}")
    public List<Task> getTasksByType(@PathVariable String type) {
        System.out.println("GET /tasks/type/" + type + " - Fetching tasks by type");
        List<Task> tasks = taskService.getTasksByType(type);
        System.out.println("Found " + tasks.size() + " tasks of type " + type);
        return tasks;
    }
}