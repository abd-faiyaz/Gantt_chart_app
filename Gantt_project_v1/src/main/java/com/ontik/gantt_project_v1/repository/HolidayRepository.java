package com.ontik.gantt_project_v1.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.ontik.gantt_project_v1.model.Holiday;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Repository interface for Holiday entities
 */
@Repository
public interface HolidayRepository extends JpaRepository<Holiday, UUID> {

    /**
     * Find holidays within a date range
     */
    @Query("SELECT h FROM Holiday h WHERE h.holidayDate BETWEEN :startDate AND :endDate ORDER BY h.holidayDate")
    List<Holiday> findHolidaysByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    /**
     * Find non-working holidays within a date range
     */
    @Query("SELECT h FROM Holiday h WHERE h.holidayDate BETWEEN :startDate AND :endDate AND h.isWorkingDay = false ORDER BY h.holidayDate")
    List<Holiday> findNonWorkingHolidaysByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    /**
     * Check if a specific date is a holiday
     */
    @Query("SELECT COUNT(h) > 0 FROM Holiday h WHERE h.holidayDate = :date")
    boolean existsByHolidayDate(@Param("date") LocalDate date);

    /**
     * Check if a specific date is a non-working holiday
     */
    @Query("SELECT COUNT(h) > 0 FROM Holiday h WHERE h.holidayDate = :date AND h.isWorkingDay = false")
    boolean isNonWorkingHoliday(@Param("date") LocalDate date);

    /**
     * Find holidays by type
     */
    List<Holiday> findByHolidayType(String holidayType);

    /**
     * Find holidays by country
     */
    List<Holiday> findByCountryCode(String countryCode);
}
