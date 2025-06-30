package com.ontik.gantt_project_v1.service;

import com.ontik.gantt_project_v1.model.Epic;
import com.ontik.gantt_project_v1.repository.EpicRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Service class for managing Epic operations
 */
@Service
public class EpicService {

    private final EpicRepository epicRepository;

    @Autowired
    public EpicService(EpicRepository epicRepository) {
        this.epicRepository = epicRepository;
    }

    /**
     * Fetches all Epic entities from the database.
     * @return List<Epic> - a list containing all epics in the database.
     */
    public List<Epic> getAllEpics() {
        return epicRepository.findAll();
    }

    /**
     * Retrieves a single Epic by its unique identifier.
     * @param epicId UUID of the epic to fetch.
     * @return Optional<Epic> - contains the Epic if found, or empty if not found.
     */
    public Optional<Epic> getEpicById(UUID epicId) {
        return epicRepository.findById(epicId);
    }

    /**
     * Saves a new Epic or updates an existing one if the ID already exists.
     * @param epic Epic object to save.
     * @return Epic - the saved Epic entity.
     */
    public Epic saveEpic(Epic epic) {
        return epicRepository.save(epic);
    }

    /**
     * Updates an existing Epic by its ID with new values.
     * @param epicId UUID of the epic to update.
     * @param updatedEpic Epic object containing updated fields.
     * @return Optional<Epic> - contains the updated Epic if found and updated, or empty if not found.
     */
    public Optional<Epic> updateEpic(UUID epicId, Epic updatedEpic) {
        return epicRepository.findById(epicId)
                .map(existingEpic -> {
                    // Update each field of the existing epic with values from updatedEpic
                    existingEpic.setName(updatedEpic.getName());
                    existingEpic.setDescription(updatedEpic.getDescription());
                    existingEpic.setStartDate(updatedEpic.getStartDate());
                    existingEpic.setEndDate(updatedEpic.getEndDate());
                    existingEpic.setStatus(updatedEpic.getStatus());
                    existingEpic.setPriority(updatedEpic.getPriority());
                    existingEpic.setProjectId(updatedEpic.getProjectId());
                    existingEpic.setAssignedTo(updatedEpic.getAssignedTo());
                    existingEpic.setProgressPercentage(updatedEpic.getProgressPercentage());
                    existingEpic.setParentEpicId(updatedEpic.getParentEpicId());
                    existingEpic.setMilestoneId(updatedEpic.getMilestoneId());
                    existingEpic.setTags(updatedEpic.getTags());
                    existingEpic.setUpdatedAt(updatedEpic.getUpdatedAt());
                    
                    // Save the updated epic back to the database and return it
                    return epicRepository.save(existingEpic);
                });
    }

    /**
     * Deletes an Epic by its ID.
     * @param epicId UUID of the epic to delete.
     * @return boolean - true if the epic was found and deleted, false if not found.
     */
    public boolean deleteEpic(UUID epicId) {
        if (epicRepository.existsById(epicId)) {
            epicRepository.deleteById(epicId);
            return true;
        } else {
            return false;
        }
    }

    /**
     * Find epics by project ID
     */
    public List<Epic> getEpicsByProjectId(UUID projectId) {
        return epicRepository.findByProjectId(projectId);
    }

    /**
     * Find epics by status
     */
    public List<Epic> getEpicsByStatus(String status) {
        return epicRepository.findByStatus(status);
    }

    /**
     * Find epics by priority
     */
    public List<Epic> getEpicsByPriority(String priority) {
        return epicRepository.findByPriority(priority);
    }

    /**
     * Find epics assigned to a specific user
     */
    public List<Epic> getEpicsByAssignedTo(UUID assignedTo) {
        return epicRepository.findByAssignedTo(assignedTo);
    }

    /**
     * Find child epics of a parent epic
     */
    public List<Epic> getChildEpics(UUID parentEpicId) {
        return epicRepository.findByParentEpicId(parentEpicId);
    }

    /**
     * Find top-level epics (no parent)
     */
    public List<Epic> getTopLevelEpics() {
        return epicRepository.findTopLevelEpics();
    }

    /**
     * Count tasks under an epic
     */
    public Long countTasksByEpicId(UUID epicId) {
        return epicRepository.countTasksByEpicId(epicId);
    }
}
