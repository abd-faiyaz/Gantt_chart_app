package com.ontik.gantt_project_v1.dto;

import com.ontik.gantt_project_v1.model.Task;
import com.ontik.gantt_project_v1.model.Epic;
import lombok.Data;
import lombok.Builder;

import java.time.Duration;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

/**
 * DTO for Task with enriched user information
 */
@Data
@Builder
public class TaskWithUserDTO {
    private UUID id;
    private String type;
    private String title;
    private String description;
    private UUID epicId;
    private UUID sprintId;
    private LocalDate startDate;
    private LocalDate dueDate;
    private Duration originalEstimate;
    private String status;
    private UUID assigneeId;
    private String assigneeName; // Enriched field
    private String priority;
    private List<String> labels;
    private UUID parentTaskId;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    /**
     * Convert Task entity to TaskWithUserDTO
     */
    public static TaskWithUserDTO fromTask(Task task, String assigneeName) {
        return TaskWithUserDTO.builder()
                .id(task.getTaskId())
                .type(task.getType())
                .title(task.getTitle())
                .description(task.getDescription())
                .epicId(task.getEpicId())
                .sprintId(task.getSprintId())
                .startDate(task.getStartDate())
                .dueDate(task.getDueDate())
                .originalEstimate(task.getOriginalEstimate())
                .status(task.getStatus())
                .assigneeId(task.getAssigneeId())
                .assigneeName(assigneeName)
                .priority(task.getPriority())
                .labels(task.getLabels())
                .parentTaskId(task.getParentTaskId())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }
}

/**
 * DTO for Epic with enriched user information
 */
@Data
@Builder
class EpicWithUserDTO {
    private UUID id;
    private String name;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private String priority;
    private UUID projectId;
    private UUID assignedTo;
    private String assignedToName; // Enriched field
    private Double progressPercentage;
    private UUID parentEpicId;
    private UUID milestoneId;
    private List<String> tags;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    /**
     * Convert Epic entity to EpicWithUserDTO
     */
    public static EpicWithUserDTO fromEpic(Epic epic, String assignedToName) {
        return EpicWithUserDTO.builder()
                .id(epic.getEpicId())
                .name(epic.getName())
                .description(epic.getDescription())
                .startDate(epic.getStartDate())
                .endDate(epic.getEndDate())
                .status(epic.getStatus())
                .priority(epic.getPriority())
                .projectId(epic.getProjectId())
                .assignedTo(epic.getAssignedTo())
                .assignedToName(assignedToName)
                .progressPercentage(epic.getProgressPercentage())
                .parentEpicId(epic.getParentEpicId())
                .milestoneId(epic.getMilestoneId())
                .tags(epic.getTags())
                .createdAt(epic.getCreatedAt())
                .updatedAt(epic.getUpdatedAt())
                .build();
    }
}
