/**
 * Holiday Service for frontend API calls
 * Handles communication with backend holiday endpoints
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

class HolidayService {
    /**
     * Fetch all holidays from backend
     */
    static async fetchHolidays() {
        try {
            console.log('HolidayService: Fetching all holidays');
            const response = await fetch(`${API_BASE_URL}/holidays`);
            if (!response.ok) {
                throw new Error(`Failed to fetch holidays: ${response.status}`);
            }
            const holidays = await response.json();
            console.log(`HolidayService: Fetched ${holidays.length} holidays`);
            return holidays;
        } catch (error) {
            console.error('HolidayService: Error fetching holidays:', error);
            return [];
        }
    }

    /**
     * Fetch holidays within a date range
     */
    static async fetchHolidaysInRange(startDate, endDate) {
        try {
            console.log(`HolidayService: Fetching holidays from ${startDate} to ${endDate}`);
            const response = await fetch(`${API_BASE_URL}/holidays/range?start=${startDate}&end=${endDate}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch holidays in range: ${response.status}`);
            }
            const holidays = await response.json();
            console.log(`HolidayService: Fetched ${holidays.length} holidays in range`);
            return holidays;
        } catch (error) {
            console.error('HolidayService: Error fetching holidays in range:', error);
            return [];
        }
    }

    /**
     * Calculate end date based on start date and estimate days
     */
    static async calculateEndDate(startDate, estimateDays) {
        try {
            console.log(`HolidayService: Calculating end date for start=${startDate}, estimate=${estimateDays} days`);
            const response = await fetch(`${API_BASE_URL}/tasks/calculate-end-date`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    startDate: startDate,
                    estimateDays: estimateDays
                })
            });

            if (!response.ok) {
                throw new Error(`Failed to calculate end date: ${response.status}`);
            }

            const result = await response.json();
            console.log('HolidayService: End date calculation result:', result);
            return result;
        } catch (error) {
            console.error('HolidayService: Error calculating end date:', error);
            return null;
        }
    }

    /**
     * Validate user-selected end date
     */
    static async validateEndDate(startDate, estimateDays, selectedEndDate) {
        try {
            console.log(`HolidayService: Validating end date - start=${startDate}, estimate=${estimateDays}, selected=${selectedEndDate}`);
            const response = await fetch(
                `${API_BASE_URL}/tasks/validate-end-date?startDate=${startDate}&estimateDays=${estimateDays}&selectedEndDate=${selectedEndDate}`
            );

            if (!response.ok) {
                throw new Error(`Failed to validate end date: ${response.status}`);
            }

            const result = await response.json();
            console.log('HolidayService: Validation result:', result);
            return result;
        } catch (error) {
            console.error('HolidayService: Error validating end date:', error);
            return { isValid: false, message: 'Validation error' };
        }
    }

    /**
     * Check if a specific date is a holiday
     */
    static async isHoliday(date) {
        try {
            const response = await fetch(`${API_BASE_URL}/holidays/check?date=${date}`);
            if (!response.ok) {
                throw new Error(`Failed to check holiday: ${response.status}`);
            }
            const isHoliday = await response.json();
            return isHoliday;
        } catch (error) {
            console.error('HolidayService: Error checking holiday:', error);
            return false;
        }
    }

    /**
     * Check if a specific date is a working day
     */
    static async isWorkingDay(date) {
        try {
            const response = await fetch(`${API_BASE_URL}/holidays/working-day?date=${date}`);
            if (!response.ok) {
                throw new Error(`Failed to check working day: ${response.status}`);
            }
            const isWorkingDay = await response.json();
            return isWorkingDay;
        } catch (error) {
            console.error('HolidayService: Error checking working day:', error);
            return true; // Default to true if can't check
        }
    }

    /**
     * Format holidays for calendar display
     */
    static formatHolidaysForCalendar(holidays) {
        return holidays.reduce((acc, holiday) => {
            acc[holiday.holidayDate] = {
                name: holiday.holidayName,
                type: holiday.holidayType,
                isWorkingDay: holiday.isWorkingDay,
                description: holiday.description
            };
            return acc;
        }, {});
    }

    /**
     * Get holiday info for a specific date
     */
    static getHolidayInfo(holidays, date) {
        return holidays.find(holiday => holiday.holidayDate === date);
    }
}

export default HolidayService;
