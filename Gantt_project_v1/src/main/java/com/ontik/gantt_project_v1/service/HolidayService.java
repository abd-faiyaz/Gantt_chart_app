package com.ontik.gantt_project_v1.service;

import com.ontik.gantt_project_v1.model.Holiday;
import com.ontik.gantt_project_v1.repository.HolidayRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;

/**
 * Service class for managing Holiday operations and working day calculations
 */
@Service
public class HolidayService {

    @Autowired
    private HolidayRepository holidayRepository;

    /**
     * Get all holidays
     */
    public List<Holiday> getAllHolidays() {
        return holidayRepository.findAll();
    }

    /**
     * Get holidays within a date range
     */
    public List<Holiday> getHolidaysByDateRange(LocalDate startDate, LocalDate endDate) {
        return holidayRepository.findHolidaysByDateRange(startDate, endDate);
    }

    /**
     * Get non-working holidays within a date range
     */
    public List<Holiday> getNonWorkingHolidaysByDateRange(LocalDate startDate, LocalDate endDate) {
        return holidayRepository.findNonWorkingHolidaysByDateRange(startDate, endDate);
    }

    /**
     * Check if a date is a working day (not weekend and not a non-working holiday)
     */
    public boolean isWorkingDay(LocalDate date) {
        // Check if it's a weekend
        if (date.getDayOfWeek() == DayOfWeek.SATURDAY || date.getDayOfWeek() == DayOfWeek.SUNDAY) {
            return false;
        }
        
        // Check if it's a non-working holiday
        return !holidayRepository.isNonWorkingHoliday(date);
    }

    /**
     * Get the next working day from the given date
     */
    public LocalDate getNextWorkingDay(LocalDate date) {
        LocalDate nextDay = date.plusDays(1);
        while (!isWorkingDay(nextDay)) {
            nextDay = nextDay.plusDays(1);
        }
        return nextDay;
    }

    /**
     * Calculate end date based on start date and estimate days (excluding weekends and holidays)
     */
    public LocalDate calculateEndDate(LocalDate startDate, int estimateDays) {
        if (estimateDays <= 0) {
            return startDate;
        }

        LocalDate currentDate = startDate;
        int workingDaysAdded = 0;

        // If start date is not a working day, move to next working day
        if (!isWorkingDay(currentDate)) {
            currentDate = getNextWorkingDay(currentDate);
        }

        while (workingDaysAdded < estimateDays) {
            if (isWorkingDay(currentDate)) {
                workingDaysAdded++;
                if (workingDaysAdded < estimateDays) {
                    currentDate = currentDate.plusDays(1);
                }
            } else {
                currentDate = currentDate.plusDays(1);
            }
        }

        return currentDate;
    }

    /**
     * Calculate the number of working days between two dates
     */
    public int calculateWorkingDaysBetween(LocalDate startDate, LocalDate endDate) {
        if (startDate.isAfter(endDate)) {
            return 0;
        }

        int workingDays = 0;
        LocalDate currentDate = startDate;

        while (!currentDate.isAfter(endDate)) {
            if (isWorkingDay(currentDate)) {
                workingDays++;
            }
            currentDate = currentDate.plusDays(1);
        }

        return workingDays;
    }

    /**
     * Validate if the selected end date is valid based on start date and estimate
     */
    public boolean validateEndDate(LocalDate startDate, int estimateDays, LocalDate selectedEndDate) {
        LocalDate calculatedEndDate = calculateEndDate(startDate, estimateDays);
        return !selectedEndDate.isBefore(calculatedEndDate);
    }

    /**
     * Check if a specific date is a holiday
     */
    public boolean isHoliday(LocalDate date) {
        return holidayRepository.existsByHolidayDate(date);
    }

    /**
     * Check if a specific date is a non-working holiday
     */
    public boolean isNonWorkingHoliday(LocalDate date) {
        return holidayRepository.isNonWorkingHoliday(date);
    }
}
