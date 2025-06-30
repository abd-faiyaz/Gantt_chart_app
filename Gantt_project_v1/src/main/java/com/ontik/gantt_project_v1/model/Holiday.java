package com.ontik.gantt_project_v1.model;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Holiday entity representing holidays that affect working day calculations
 */
@Entity
@Table(name = "holidays")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Holiday {

    @Id
    @Column(name = "holiday_id", nullable = false)
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID holidayId;

    @Column(name = "holiday_date", nullable = false, unique = true)
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate holidayDate;

    @Column(name = "holiday_name", nullable = false, length = 255)
    private String holidayName;

    @Column(name = "holiday_type", length = 100)
    private String holidayType;

    @Column(name = "is_working_day", nullable = false)
    @Builder.Default
    private Boolean isWorkingDay = false;

    @Column(name = "description")
    private String description;

    @Column(name = "country_code", length = 3)
    @Builder.Default
    private String countryCode = "USA";

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
