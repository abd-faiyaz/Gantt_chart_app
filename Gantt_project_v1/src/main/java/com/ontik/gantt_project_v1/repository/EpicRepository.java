package com.ontik.gantt_project_v1.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.ontik.gantt_project_v1.model.Epic;
import java.util.List;
import java.util.UUID;

/**
 * Repository interface for Epic entities
 */
@Repository
public interface EpicRepository extends JpaRepository<Epic, UUID> {

    /**
     * Find epics by project ID
     */
    List<Epic> findByProjectId(UUID projectId);

    /**
     * Find epics by status
     */
    List<Epic> findByStatus(String status);

    /**
     * Find epics by priority
     */
    List<Epic> findByPriority(String priority);

    /**
     * Find epics assigned to a specific user
     */
    List<Epic> findByAssignedTo(UUID assignedTo);

    /**
     * Find child epics of a parent epic
     */
    List<Epic> findByParentEpicId(UUID parentEpicId);

    /**
     * Find top-level epics (no parent)
     */
    @Query("SELECT e FROM Epic e WHERE e.parentEpicId IS NULL ORDER BY e.startDate")
    List<Epic> findTopLevelEpics();

    /**
     * Find epics by project ID and status
     */
    List<Epic> findByProjectIdAndStatus(UUID projectId, String status);

    /**
     * Count tasks under an epic
     */
    @Query("SELECT COUNT(t) FROM Task t WHERE t.epicId = :epicId")
    Long countTasksByEpicId(@Param("epicId") UUID epicId);
}
