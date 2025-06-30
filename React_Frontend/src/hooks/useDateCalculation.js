import { useState, useEffect, useCallback } from 'react';
import HolidayService from '../services/HolidayService';

/**
 * Custom hook for date calculations with holiday awareness
 */
const useDateCalculation = () => {
    const [holidays, setHolidays] = useState([]);
    const [calculatedEndDate, setCalculatedEndDate] = useState('');
    const [isCalculating, setIsCalculating] = useState(false);
    const [validationMessage, setValidationMessage] = useState('');

    // Fetch holidays on hook initialization
    useEffect(() => {
        const fetchHolidays = async () => {
            try {
                const holidayData = await HolidayService.fetchHolidays();
                setHolidays(holidayData);
                console.log('useDateCalculation: Loaded holidays:', holidayData.length);
            } catch (error) {
                console.error('useDateCalculation: Error loading holidays:', error);
            }
        };

        fetchHolidays();
    }, []);

    /**
     * Calculate end date based on start date and estimate days
     */
    const calculateEndDate = useCallback(async (startDate, estimateDays) => {
        if (!startDate || !estimateDays || estimateDays <= 0) {
            setCalculatedEndDate('');
            return null;
        }

        setIsCalculating(true);
        setValidationMessage('');

        try {
            const result = await HolidayService.calculateEndDate(startDate, estimateDays);
            if (result && result.calculatedEndDate) {
                setCalculatedEndDate(result.calculatedEndDate);
                console.log('useDateCalculation: Calculated end date:', result.calculatedEndDate);
                return result.calculatedEndDate;
            }
        } catch (error) {
            console.error('useDateCalculation: Error calculating end date:', error);
            setValidationMessage('Error calculating end date');
        } finally {
            setIsCalculating(false);
        }

        return null;
    }, []);

    /**
     * Validate user-selected end date
     */
    const validateEndDate = useCallback(async (startDate, estimateDays, selectedEndDate) => {
        if (!startDate || !estimateDays || !selectedEndDate) {
            setValidationMessage('');
            return true;
        }

        try {
            const result = await HolidayService.validateEndDate(startDate, estimateDays, selectedEndDate);
            if (result) {
                setValidationMessage(result.isValid ? '' : result.message);
                return result.isValid;
            }
        } catch (error) {
            console.error('useDateCalculation: Error validating end date:', error);
            setValidationMessage('Error validating end date');
        }

        return false;
    }, []);

    /**
     * Check if a date is a holiday
     */
    const isHoliday = useCallback((date) => {
        return holidays.some(holiday => holiday.holidayDate === date);
    }, [holidays]);

    /**
     * Check if a date is a non-working holiday
     */
    const isNonWorkingHoliday = useCallback((date) => {
        const holiday = holidays.find(h => h.holidayDate === date);
        return holiday && !holiday.isWorkingDay;
    }, [holidays]);

    /**
     * Get holiday information for a specific date
     */
    const getHolidayInfo = useCallback((date) => {
        return holidays.find(holiday => holiday.holidayDate === date);
    }, [holidays]);

    /**
     * Check if a date is a weekend
     */
    const isWeekend = useCallback((date) => {
        const dayOfWeek = new Date(date).getDay();
        return dayOfWeek === 0 || dayOfWeek === 6; // Sunday = 0, Saturday = 6
    }, []);

    /**
     * Check if a date should be disabled (weekend or non-working holiday)
     */
    const shouldDisableDate = useCallback((date) => {
        return isWeekend(date) || isNonWorkingHoliday(date);
    }, [isWeekend, isNonWorkingHoliday]);

    /**
     * Get CSS class for date styling in calendar
     */
    const getDateClassName = useCallback((date) => {
        const dateStr = date.toISOString().split('T')[0];
        
        if (isNonWorkingHoliday(dateStr)) {
            return 'holiday-date non-working';
        }
        if (isHoliday(dateStr)) {
            return 'holiday-date working';
        }
        if (isWeekend(dateStr)) {
            return 'weekend-date';
        }
        return 'working-date';
    }, [isHoliday, isNonWorkingHoliday, isWeekend]);

    return {
        holidays,
        calculatedEndDate,
        isCalculating,
        validationMessage,
        calculateEndDate,
        validateEndDate,
        isHoliday,
        isNonWorkingHoliday,
        getHolidayInfo,
        isWeekend,
        shouldDisableDate,
        getDateClassName
    };
};

export default useDateCalculation;
