//
//
//package com.ontik.gantt_project_v1.model;
//
//import jakarta.persistence.*;
//import lombok.*;
//import com.vladmihalcea.hibernate.type.interval.PostgreSQLIntervalType;
//import com.vladmihalcea.hibernate.type.json.JsonBinaryType;
//import org.hibernate.annotations.Type;
//
//import java.time.Duration;
//import java.time.LocalDate;
//import java.time.OffsetDateTime;
//import java.util.List;
//import java.util.UUID;
//
//@Entity
//@Table(name = "tasks")
//@Getter
//@Setter
//@NoArgsConstructor
//@AllArgsConstructor
//@Builder
//public class Task {
//
//    @Id
//    @Column(name = "task_id", nullable = false)
//    private UUID taskId;
//
//    @Column(name = "type", nullable = false, length = 50)
//    private String type;
//
//    @Column(name = "title", nullable = false, length = 255)
//    private String title;
//
//    @Column(name = "description")
//    private String description;
//
//    @Column(name = "epic_id")
//    private UUID epicId;
//
//    @Column(name = "sprint_id")
//    private UUID sprintId;
//
//    @Column(name = "start_date", nullable = false)
//    private LocalDate startDate;
//
//    @Column(name = "due_date")
//    private LocalDate dueDate;
//
//    // PostgreSQL INTERVAL mapped to Java Duration
//    @Type(PostgreSQLIntervalType.class)
//    @Column(name = "original_estimate")
//    private Duration originalEstimate; // Now uses Duration instead of String
//
//    @Column(name = "status", nullable = false, length = 50)
//    private String status;
//
//    @Column(name = "assignee_id")
//    private UUID assigneeId;
//
//    @Column(name = "priority", nullable = false, length = 50)
//    private String priority;
//
//    // JSONB array for labels (optional, uncomment if needed)
//    @Type(JsonBinaryType.class)
//    @Column(name = "labels", columnDefinition = "jsonb")
//    private List<String> labels;
//
//    @Column(name = "parent_task_id")
//    private UUID parentTaskId;
//
//    @Column(name = "created_at")
//    private OffsetDateTime createdAt;
//
//    @Column(name = "updated_at")
//    private OffsetDateTime updatedAt;
//}
// The package for this entity class
// Define the package for this entity class
package com.ontik.gantt_project_v1.model;

// Import all required Java, JPA, Lombok, Jackson, and Hibernate classes/annotations
import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonFormat;
import org.hibernate.annotations.Type;
import com.vladmihalcea.hibernate.type.json.JsonBinaryType;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.Duration;
import java.util.List;
import java.util.UUID;

// Mark this class as a JPA entity mapping to the 'tasks' table
@Entity
@Table(name = "tasks")
// Lombok annotations to reduce boilerplate code for getters, setters, constructors, builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task {

    // Primary key: UUID, mapped to 'task_id', auto-generated by database
    @Id
    @Column(name = "task_id", nullable = false)
    @GeneratedValue(strategy = GenerationType.AUTO)
    // Expose 'taskId' as 'id' in JSON for frontend compatibility
    @JsonProperty("id")
    private UUID taskId;

    // Task type (e.g., "task", "epic", "story"), VARCHAR(50), NOT NULL
    @Column(name = "type", nullable = false, length = 50)
    private String type;

    // Task title, VARCHAR(255), NOT NULL
    @Column(name = "title", nullable = false, length = 255)
    private String title;

    // Task description, TEXT, nullable
    @Column(name = "description")
    private String description;

    // Epic reference, UUID, nullable, maps to 'epic_id'
    @Column(name = "epic_id")
    private UUID epicId;

    // Sprint reference, UUID, nullable, maps to 'sprint_id'
    @Column(name = "sprint_id")
    private UUID sprintId;

    // Start date, DATE, NOT NULL
    @Column(name = "start_date", nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;

    // Due date, DATE, nullable
    @Column(name = "due_date")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dueDate;

    // Original estimate, INTERVAL, nullable, mapped to Java Duration
    @Column(name = "original_estimate", columnDefinition = "INTERVAL")
    private Duration originalEstimate;

    // Task status, VARCHAR(50), NOT NULL, default via DB as 'To Do'
    @Column(name = "status", nullable = false, length = 50)
    private String status;

    // Assignee reference, UUID, nullable, maps to 'assignee_id'
    @Column(name = "assignee_id")
    private UUID assigneeId;

    // Priority, VARCHAR(50), NOT NULL, default via DB as 'Medium'
    @Column(name = "priority", nullable = false, length = 50)
    private String priority;

    // Labels, jsonb, nullable, mapped as List<String>
    @Type(JsonBinaryType.class)
    @Column(name = "labels", columnDefinition = "jsonb")
    private List<String> labels;

    // Parent task reference, UUID, nullable, maps to 'parent_task_id'
    @Column(name = "parent_task_id")
    private UUID parentTaskId;

    // Created at, TIMESTAMP WITH TIME ZONE, nullable, set by DB default
    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    // Updated at, TIMESTAMP WITH TIME ZONE, nullable, set by DB default
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    // Transient field for assignee name (not persisted to database)
    @Transient
    private String assigneeName;
}