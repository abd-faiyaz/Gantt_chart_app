// The package for this class. Update this if your package is different.
package com.ontik.gantt_project_v1.repository;

// Import the JpaRepository interface from Spring Data JPA
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

// Import the Task entity and UUID class
import com.ontik.gantt_project_v1.model.Task;
import java.util.List;
import java.util.UUID;

// Define the repository interface for Task entities
// Extends JpaRepository, specifying Task as the entity type and UUID as the ID type
@Repository
public interface TaskRepository extends JpaRepository<Task, UUID> {
    // No code needed here! All common CRUD methods are inherited from JpaRepository

    /**
     * Find tasks by epic ID
     */
    List<Task> findByEpicId(UUID epicId);

    /**
     * Find tasks by parent task ID (subtasks)
     */
    List<Task> findByParentTaskId(UUID parentTaskId);

    /**
     * Find tasks by type
     */
    List<Task> findByType(String type);

    /**
     * Find tasks by status
     */
    List<Task> findByStatus(String status);

    /**
     * Find tasks by priority
     */
    List<Task> findByPriority(String priority);

    /**
     * Find top-level tasks in an epic (no parent task)
     */
    @Query("SELECT t FROM Task t WHERE t.epicId = :epicId AND t.parentTaskId IS NULL ORDER BY t.startDate")
    List<Task> findTopLevelTasksByEpicId(@Param("epicId") UUID epicId);

    /**
     * Find all epics (tasks with type 'epic')
     */
    @Query("SELECT t FROM Task t WHERE t.type = 'epic' ORDER BY t.startDate")
    List<Task> findAllEpics();

    /**
     * Find all stories and tasks under an epic (excluding subtasks)
     */
    @Query("SELECT t FROM Task t WHERE t.epicId = :epicId AND t.type IN ('story', 'task') AND t.parentTaskId IS NULL ORDER BY t.startDate")
    List<Task> findStoriesAndTasksByEpicId(@Param("epicId") UUID epicId);

    /**
     * Find subtasks under a parent task
     */
    @Query("SELECT t FROM Task t WHERE t.parentTaskId = :parentTaskId AND t.type = 'sub_task' ORDER BY t.startDate")
    List<Task> findSubTasksByParentId(@Param("parentTaskId") UUID parentTaskId);
}