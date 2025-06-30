package com.ontik.gantt_project_v1.controller;

import com.ontik.gantt_project_v1.model.Epic;
import com.ontik.gantt_project_v1.service.EpicService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * REST Controller for Epic operations
 */
@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/epics")
public class EpicController {

    @Autowired
    private EpicService epicService;

    /**
     * Get all epics
     */
    @GetMapping
    public List<Epic> getAllEpics() {
        System.out.println("GET /epics - Fetching all epics");
        List<Epic> epics = epicService.getAllEpics();
        System.out.println("Found " + epics.size() + " epics");
        return epics;
    }

    /**
     * Get epic by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Epic> getEpicById(@PathVariable UUID id) {
        System.out.println("GET /epics/" + id + " - Fetching epic by ID");
        Optional<Epic> epic = epicService.getEpicById(id);
        return epic.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create new epic
     */
    @PostMapping
    public ResponseEntity<Epic> createEpic(@RequestBody Epic epic) {
        System.out.println("POST /epics - Creating new epic: " + epic.getName());
        System.out.println("Epic details: " + epic);
        
        Epic savedEpic = epicService.saveEpic(epic);
        System.out.println("Epic saved with ID: " + savedEpic.getEpicId());
        return new ResponseEntity<>(savedEpic, HttpStatus.CREATED);
    }

    /**
     * Update existing epic
     */
    @PutMapping("/{id}")
    public ResponseEntity<Epic> updateEpic(@PathVariable UUID id, @RequestBody Epic updatedEpic) {
        System.out.println("PUT /epics/" + id + " - Updating epic: " + updatedEpic.getName());
        
        Optional<Epic> updated = epicService.updateEpic(id, updatedEpic);
        return updated.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Delete epic
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEpic(@PathVariable UUID id) {
        System.out.println("DELETE /epics/" + id + " - Deleting epic");
        boolean deleted = epicService.deleteEpic(id);
        System.out.println("Epic deletion result: " + deleted);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    /**
     * Get epics by project ID
     */
    @GetMapping("/project/{projectId}")
    public List<Epic> getEpicsByProjectId(@PathVariable UUID projectId) {
        System.out.println("GET /epics/project/" + projectId + " - Fetching epics by project ID");
        List<Epic> epics = epicService.getEpicsByProjectId(projectId);
        System.out.println("Found " + epics.size() + " epics for project " + projectId);
        return epics;
    }

    /**
     * Get top-level epics (no parent)
     */
    @GetMapping("/top-level")
    public List<Epic> getTopLevelEpics() {
        System.out.println("GET /epics/top-level - Fetching top-level epics");
        List<Epic> epics = epicService.getTopLevelEpics();
        System.out.println("Found " + epics.size() + " top-level epics");
        return epics;
    }

    /**
     * Get child epics of a parent epic
     */
    @GetMapping("/{id}/children")
    public List<Epic> getChildEpics(@PathVariable UUID id) {
        System.out.println("GET /epics/" + id + "/children - Fetching child epics");
        List<Epic> childEpics = epicService.getChildEpics(id);
        System.out.println("Found " + childEpics.size() + " child epics");
        return childEpics;
    }

    /**
     * Count tasks under an epic
     */
    @GetMapping("/{id}/task-count")
    public ResponseEntity<Long> getTaskCount(@PathVariable UUID id) {
        System.out.println("GET /epics/" + id + "/task-count - Counting tasks under epic");
        Long taskCount = epicService.countTasksByEpicId(id);
        System.out.println("Found " + taskCount + " tasks under epic " + id);
        return ResponseEntity.ok(taskCount);
    }
}
