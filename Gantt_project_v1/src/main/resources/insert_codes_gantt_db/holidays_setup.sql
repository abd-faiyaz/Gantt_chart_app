-- Holidays Table Setup for Project Management System
-- This table stores holiday dates that should be excluded from working day calculations

-- ===========================================
-- CREATE HOLIDAYS TABLE
-- ===========================================
CREATE TABLE holidays (
    holiday_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    holiday_date DATE NOT NULL UNIQUE,
    holiday_name VARCHAR(255) NOT NULL,
    holiday_type VARCHAR(100) DEFAULT 'PUBLIC',
    is_working_day BOOLEAN DEFAULT FALSE,
    description TEXT,
    country_code VARCHAR(3) DEFAULT 'USA',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT chk_holiday_type CHECK (holiday_type IN ('PUBLIC', 'RELIGIOUS', 'NATIONAL', 'COMPANY', 'REGIONAL')),
    CONSTRAINT chk_holiday_date CHECK (holiday_date >= DATE '2020-01-01' AND holiday_date <= DATE '2050-12-31')
);

-- ===========================================
-- CREATE INDEXES FOR BETTER PERFORMANCE
-- ===========================================
CREATE INDEX idx_holidays_date ON holidays(holiday_date);
CREATE INDEX idx_holidays_type ON holidays(holiday_type);
CREATE INDEX idx_holidays_country ON holidays(country_code);
CREATE INDEX idx_holidays_working_day ON holidays(is_working_day);

-- ===========================================
-- SETUP COMPLETE
-- ===========================================
