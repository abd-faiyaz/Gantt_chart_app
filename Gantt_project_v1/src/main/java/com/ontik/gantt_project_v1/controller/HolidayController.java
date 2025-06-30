package com.ontik.gantt_project_v1.controller;

import com.ontik.gantt_project_v1.model.Holiday;
import com.ontik.gantt_project_v1.service.HolidayService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * REST Controller for Holiday operations
 */
@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/holidays")
public class HolidayController {

    @Autowired
    private HolidayService holidayService;

    /**
     * Get all holidays
     */
    @GetMapping
    public List<Holiday> getAllHolidays() {
        System.out.println("GET /holidays - Fetching all holidays");
        List<Holiday> holidays = holidayService.getAllHolidays();
        System.out.println("Found " + holidays.size() + " holidays");
        return holidays;
    }

    /**
     * Get holidays within a date range
     */
    @GetMapping("/range")
    public List<Holiday> getHolidaysInRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        
        System.out.println("GET /holidays/range - Fetching holidays from " + start + " to " + end);
        List<Holiday> holidays = holidayService.getHolidaysByDateRange(start, end);
        System.out.println("Found " + holidays.size() + " holidays in range");
        return holidays;
    }

    /**
     * Check if a specific date is a holiday
     */
    @GetMapping("/check")
    public ResponseEntity<Boolean> isHoliday(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        System.out.println("GET /holidays/check - Checking if " + date + " is a holiday");
        boolean isHoliday = holidayService.isHoliday(date);
        System.out.println("Date " + date + " is holiday: " + isHoliday);
        return ResponseEntity.ok(isHoliday);
    }

    /**
     * Check if a specific date is a working day
     */
    @GetMapping("/working-day")
    public ResponseEntity<Boolean> isWorkingDay(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        System.out.println("GET /holidays/working-day - Checking if " + date + " is a working day");
        boolean isWorkingDay = holidayService.isWorkingDay(date);
        System.out.println("Date " + date + " is working day: " + isWorkingDay);
        return ResponseEntity.ok(isWorkingDay);
    }
}
