import React, { useState, useRef, useEffect } from 'react';
import './HolidayCalendar.css';

/**
 * Holiday-aware calendar component that shows holidays and restricts invalid dates
 */
const HolidayCalendar = ({ 
    value, 
    onChange, 
    holidays = [], 
    minDate, 
    maxDate, 
    shouldDisableDate,
    getDateClassName,
    getHolidayInfo,
    placeholder = "Select date",
    required = false,
    ...props 
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const calendarRef = useRef(null);

    // Close calendar when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Format date for display
    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString('en-CA'); // YYYY-MM-DD format
    };

    // Handle date selection
    const handleDateSelect = (date) => {
        const dateStr = formatDate(date);
        if (!shouldDisableDate || !shouldDisableDate(dateStr)) {
            onChange(dateStr);
            setIsOpen(false);
        }
    };

    // Navigate months
    const navigateMonth = (direction) => {
        const newMonth = new Date(currentMonth);
        newMonth.setMonth(newMonth.getMonth() + direction);
        setCurrentMonth(newMonth);
    };

    // Generate calendar days
    const generateCalendarDays = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday

        const days = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            
            const dateStr = formatDate(date);
            const isCurrentMonth = date.getMonth() === month;
            const isToday = date.getTime() === today.getTime();
            const isSelected = value && formatDate(value) === dateStr;
            const holidayInfo = getHolidayInfo ? getHolidayInfo(dateStr) : null;
            const isDisabled = shouldDisableDate ? shouldDisableDate(dateStr) : false;
            const isBeforeMin = minDate && date < new Date(minDate);
            const isAfterMax = maxDate && date > new Date(maxDate);
            
            let className = 'calendar-day';
            
            if (!isCurrentMonth) className += ' other-month';
            if (isToday) className += ' today';
            if (isSelected) className += ' selected';
            if (isDisabled || isBeforeMin || isAfterMax) className += ' disabled';
            
            // Add holiday/weekend classes
            if (getDateClassName) {
                const dateClass = getDateClassName(date);
                className += ` ${dateClass}`;
            }

            days.push({
                date,
                dateStr,
                day: date.getDate(),
                className,
                holidayInfo,
                isDisabled: isDisabled || isBeforeMin || isAfterMax,
                isCurrentMonth
            });
        }

        return days;
    };

    const calendarDays = generateCalendarDays();
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return (
        <div className="holiday-calendar-container" ref={calendarRef}>
            <input
                type="text"
                value={value || ''}
                readOnly
                placeholder={placeholder}
                className="calendar-input box"
                onClick={() => setIsOpen(!isOpen)}
                required={required}
                {...props}
            />
            
            {isOpen && (
                <div className="calendar-dropdown">
                    <div className="calendar-header">
                        <button
                            type="button"
                            className="nav-button"
                            onClick={() => navigateMonth(-1)}
                        >
                            ‹
                        </button>
                        <span className="month-year">
                            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                        </span>
                        <button
                            type="button"
                            className="nav-button"
                            onClick={() => navigateMonth(1)}
                        >
                            ›
                        </button>
                    </div>
                    
                    <div className="calendar-weekdays">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="weekday">{day}</div>
                        ))}
                    </div>
                    
                    <div className="calendar-days">
                        {calendarDays.map((day, index) => (
                            <div
                                key={index}
                                className={day.className}
                                onClick={() => !day.isDisabled && handleDateSelect(day.date)}
                                title={day.holidayInfo ? day.holidayInfo.holidayName : ''}
                            >
                                {day.day}
                                {day.holidayInfo && (
                                    <div className="holiday-indicator">
                                        {day.holidayInfo.isWorkingDay ? '○' : '●'}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    
                    <div className="calendar-legend">
                        <div className="legend-item">
                            <span className="legend-color holiday-date non-working"></span>
                            <span>Holiday (Non-working)</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-color holiday-date working"></span>
                            <span>Holiday (Working)</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-color weekend-date"></span>
                            <span>Weekend</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HolidayCalendar;
