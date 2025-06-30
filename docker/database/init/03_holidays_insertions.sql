-- Holiday Data Insertions for Project Management System
-- Common holidays for the USA (can be modified for other countries)

-- ===========================================
-- CLEAR EXISTING HOLIDAY DATA (if any)
-- ===========================================
TRUNCATE TABLE holidays CASCADE;

-- ===========================================
-- INSERT HOLIDAY DATA FOR 2024-2026
-- ===========================================
INSERT INTO holidays (holiday_date, holiday_name, holiday_type, is_working_day, description, country_code) VALUES
-- 2024 Holidays
('2024-01-01', 'New Year''s Day', 'PUBLIC', FALSE, 'New Year''s Day celebration', 'USA'),
('2024-01-15', 'Martin Luther King Jr. Day', 'PUBLIC', FALSE, 'Federal holiday honoring Martin Luther King Jr.', 'USA'),
('2024-02-19', 'Presidents'' Day', 'PUBLIC', FALSE, 'Federal holiday honoring US Presidents', 'USA'),
('2024-05-27', 'Memorial Day', 'PUBLIC', FALSE, 'Honoring military personnel who died in service', 'USA'),
('2024-06-19', 'Juneteenth', 'PUBLIC', FALSE, 'Emancipation Day', 'USA'),
('2024-07-04', 'Independence Day', 'NATIONAL', FALSE, 'US Independence Day', 'USA'),
('2024-09-02', 'Labor Day', 'PUBLIC', FALSE, 'Labor Day holiday', 'USA'),
('2024-10-14', 'Columbus Day', 'PUBLIC', FALSE, 'Columbus Day', 'USA'),
('2024-11-11', 'Veterans Day', 'PUBLIC', FALSE, 'Honoring military veterans', 'USA'),
('2024-11-28', 'Thanksgiving Day', 'PUBLIC', FALSE, 'Thanksgiving holiday', 'USA'),
('2024-11-29', 'Black Friday', 'COMPANY', TRUE, 'Day after Thanksgiving - optional company holiday', 'USA'),
('2024-12-25', 'Christmas Day', 'RELIGIOUS', FALSE, 'Christmas celebration', 'USA'),

-- 2025 Holidays
('2025-01-01', 'New Year''s Day', 'PUBLIC', FALSE, 'New Year''s Day celebration', 'USA'),
('2025-01-20', 'Martin Luther King Jr. Day', 'PUBLIC', FALSE, 'Federal holiday honoring Martin Luther King Jr.', 'USA'),
('2025-02-17', 'Presidents'' Day', 'PUBLIC', FALSE, 'Federal holiday honoring US Presidents', 'USA'),
('2025-05-26', 'Memorial Day', 'PUBLIC', FALSE, 'Honoring military personnel who died in service', 'USA'),
('2025-06-19', 'Juneteenth', 'PUBLIC', FALSE, 'Emancipation Day', 'USA'),
('2025-07-04', 'Independence Day', 'NATIONAL', FALSE, 'US Independence Day', 'USA'),
('2025-09-01', 'Labor Day', 'PUBLIC', FALSE, 'Labor Day holiday', 'USA'),
('2025-10-13', 'Columbus Day', 'PUBLIC', FALSE, 'Columbus Day', 'USA'),
('2025-11-11', 'Veterans Day', 'PUBLIC', FALSE, 'Honoring military veterans', 'USA'),
('2025-11-27', 'Thanksgiving Day', 'PUBLIC', FALSE, 'Thanksgiving holiday', 'USA'),
('2025-11-28', 'Black Friday', 'COMPANY', TRUE, 'Day after Thanksgiving - optional company holiday', 'USA'),
('2025-12-25', 'Christmas Day', 'RELIGIOUS', FALSE, 'Christmas celebration', 'USA'),

-- 2026 Holidays
('2026-01-01', 'New Year''s Day', 'PUBLIC', FALSE, 'New Year''s Day celebration', 'USA'),
('2026-01-19', 'Martin Luther King Jr. Day', 'PUBLIC', FALSE, 'Federal holiday honoring Martin Luther King Jr.', 'USA'),
('2026-02-16', 'Presidents'' Day', 'PUBLIC', FALSE, 'Federal holiday honoring US Presidents', 'USA'),
('2026-05-25', 'Memorial Day', 'PUBLIC', FALSE, 'Honoring military personnel who died in service', 'USA'),
('2026-06-19', 'Juneteenth', 'PUBLIC', FALSE, 'Emancipation Day', 'USA'),
('2026-07-04', 'Independence Day', 'NATIONAL', FALSE, 'US Independence Day', 'USA'),
('2026-09-07', 'Labor Day', 'PUBLIC', FALSE, 'Labor Day holiday', 'USA'),
('2026-10-12', 'Columbus Day', 'PUBLIC', FALSE, 'Columbus Day', 'USA'),
('2026-11-11', 'Veterans Day', 'PUBLIC', FALSE, 'Honoring military veterans', 'USA'),
('2026-11-26', 'Thanksgiving Day', 'PUBLIC', FALSE, 'Thanksgiving holiday', 'USA'),
('2026-11-27', 'Black Friday', 'COMPANY', TRUE, 'Day after Thanksgiving - optional company holiday', 'USA'),
('2026-12-25', 'Christmas Day', 'RELIGIOUS', FALSE, 'Christmas celebration', 'USA'),

-- Additional company-specific holidays (examples)
('2024-12-24', 'Christmas Eve', 'COMPANY', TRUE, 'Christmas Eve - optional company holiday', 'USA'),
('2024-12-31', 'New Year''s Eve', 'COMPANY', TRUE, 'New Year''s Eve - optional company holiday', 'USA'),
('2025-12-24', 'Christmas Eve', 'COMPANY', TRUE, 'Christmas Eve - optional company holiday', 'USA'),
('2025-12-31', 'New Year''s Eve', 'COMPANY', TRUE, 'New Year''s Eve - optional company holiday', 'USA'),
('2026-12-24', 'Christmas Eve', 'COMPANY', TRUE, 'Christmas Eve - optional company holiday', 'USA'),
('2026-12-31', 'New Year''s Eve', 'COMPANY', TRUE, 'New Year''s Eve - optional company holiday', 'USA');

-- ===========================================
-- VERIFY INSERTIONS
-- ===========================================
-- Check the number of inserted records
SELECT 'Total holidays inserted:' as info, COUNT(*) as count FROM holidays;

-- Check holidays by type
SELECT holiday_type, COUNT(*) as count 
FROM holidays 
GROUP BY holiday_type 
ORDER BY count DESC;

-- Check holidays by year
SELECT EXTRACT(YEAR FROM holiday_date) as year, COUNT(*) as count 
FROM holidays 
GROUP BY EXTRACT(YEAR FROM holiday_date) 
ORDER BY year;

-- Show upcoming holidays (next 12 months)
SELECT holiday_date, holiday_name, holiday_type, is_working_day
FROM holidays 
WHERE holiday_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '12 months'
ORDER BY holiday_date;
