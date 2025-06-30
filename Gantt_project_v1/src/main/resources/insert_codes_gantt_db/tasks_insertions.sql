-- Tasks Insertions for Project Management System
-- Make sure to run this after projects, users, epics, and sprints tables are populated

-- ===========================================
-- CLEAR EXISTING TASKS DATA (if any)
-- ===========================================
TRUNCATE TABLE tasks CASCADE;

-- ===========================================
-- INSERT SAMPLE TASKS DATA WITH GENERATED UUIDs
-- ===========================================

-- First, create temporary variables to store parent task IDs
DO $$
DECLARE
    user_reg_story_id UUID := gen_random_uuid();
    dashboard_story_id UUID := gen_random_uuid();
    payment_story_id UUID := gen_random_uuid();
    api_doc_story_id UUID := gen_random_uuid();
    mobile_story_id UUID := gen_random_uuid();
BEGIN

-- Main Stories/Tasks
INSERT INTO tasks (
    task_id,
    type,
    title,
    description,
    epic_id,
    sprint_id,
    start_date,
    due_date,
    original_estimate,
    status,
    assignee_id,
    priority,
    labels,
    parent_task_id
) VALUES
(user_reg_story_id, 'story', 'User Registration System', 
 'Implement complete user registration with email verification and validation', 
 NULL, NULL, '2024-01-15', '2024-02-15', INTERVAL '5 days', 'In Progress', 
 NULL, 'High', '["authentication", "backend"]'::jsonb, NULL),

(dashboard_story_id, 'story', 'Dashboard Development', 
 'Create responsive dashboard with analytics and reporting features', 
 NULL, NULL, '2024-01-20', '2024-02-28', INTERVAL '7.5 days', 'To Do', 
 NULL, 'Medium', '["frontend", "ui"]'::jsonb, NULL),

(payment_story_id, 'story', 'Payment Integration', 
 'Integrate payment gateway with security compliance and error handling', 
 NULL, NULL, '2024-02-01', '2024-03-01', INTERVAL '6.25 days', 'To Do', 
 NULL, 'High', '["payment", "security"]'::jsonb, NULL),

(api_doc_story_id, 'story', 'API Documentation', 
 'Create comprehensive API documentation with examples and testing guides', 
 NULL, NULL, '2024-02-15', '2024-03-15', INTERVAL '3.75 days', 'To Do', 
 NULL, 'Medium', '["documentation", "api"]'::jsonb, NULL),

(mobile_story_id, 'story', 'Mobile App Development', 
 'Develop cross-platform mobile application with core features', 
 NULL, NULL, '2024-03-01', '2024-05-01', INTERVAL '15 days', 'To Do', 
 NULL, 'High', '["mobile", "react-native"]'::jsonb, NULL),

-- Sub-tasks for User Registration System
(gen_random_uuid(), 'sub_task', 'Database Schema Design', 
 'Design and implement user tables with proper relationships and constraints', 
 NULL, NULL, '2024-01-15', '2024-01-20', INTERVAL '1 day', 'Done', 
 NULL, 'High', '["database", "backend"]'::jsonb, user_reg_story_id),

(gen_random_uuid(), 'sub_task', 'Registration API Endpoints', 
 'Create REST API endpoints for user registration and validation', 
 NULL, NULL, '2024-01-21', '2024-01-28', INTERVAL '1.5 days', 'In Progress', 
 NULL, 'High', '["api", "backend"]'::jsonb, user_reg_story_id),

(gen_random_uuid(), 'sub_task', 'Email Verification System', 
 'Implement email verification workflow with token generation and validation', 
 NULL, NULL, '2024-01-25', '2024-02-05', INTERVAL '1.25 days', 'To Do', 
 NULL, 'Medium', '["email", "verification"]'::jsonb, user_reg_story_id),

(gen_random_uuid(), 'sub_task', 'Frontend Registration Form', 
 'Create responsive registration form with client-side validation', 
 NULL, NULL, '2024-02-01', '2024-02-10', INTERVAL '1.25 days', 'To Do', 
 NULL, 'Medium', '["frontend", "forms"]'::jsonb, user_reg_story_id),

-- Sub-tasks for Dashboard Development
(gen_random_uuid(), 'sub_task', 'Dashboard Layout Design', 
 'Create responsive layout structure for dashboard components', 
 NULL, NULL, '2024-01-20', '2024-01-25', INTERVAL '1 day', 'To Do', 
 NULL, 'Medium', '["frontend", "layout"]'::jsonb, dashboard_story_id),

(gen_random_uuid(), 'sub_task', 'Analytics Components', 
 'Develop charts and graphs for data visualization', 
 NULL, NULL, '2024-01-26', '2024-02-10', INTERVAL '2.5 days', 'To Do', 
 NULL, 'Medium', '["analytics", "charts"]'::jsonb, dashboard_story_id),

(gen_random_uuid(), 'sub_task', 'Real-time Data Integration', 
 'Implement real-time data updates using WebSockets', 
 NULL, NULL, '2024-02-05', '2024-02-20', INTERVAL '1.875 days', 'To Do', 
 NULL, 'High', '["websockets", "realtime"]'::jsonb, dashboard_story_id),

(gen_random_uuid(), 'sub_task', 'Export Functionality', 
 'Add export features for reports in PDF and Excel formats', 
 NULL, NULL, '2024-02-15', '2024-02-28', INTERVAL '1.5 days', 'To Do', 
 NULL, 'Low', '["export", "reports"]'::jsonb, dashboard_story_id),

-- Sub-tasks for Payment Integration
(gen_random_uuid(), 'sub_task', 'Payment Gateway Setup', 
 'Configure and integrate Stripe/PayPal payment processing', 
 NULL, NULL, '2024-02-01', '2024-02-08', INTERVAL '1.5 days', 'To Do', 
 NULL, 'High', '["payment", "stripe"]'::jsonb, payment_story_id),

(gen_random_uuid(), 'sub_task', 'Security Implementation', 
 'Implement PCI compliance and security measures', 
 NULL, NULL, '2024-02-08', '2024-02-18', INTERVAL '1.875 days', 'To Do', 
 NULL, 'High', '["security", "pci"]'::jsonb, payment_story_id),

(gen_random_uuid(), 'sub_task', 'Payment UI Components', 
 'Create payment forms and transaction history interface', 
 NULL, NULL, '2024-02-12', '2024-02-25', INTERVAL '1.25 days', 'To Do', 
 NULL, 'Medium', '["frontend", "payment"]'::jsonb, payment_story_id),

(gen_random_uuid(), 'sub_task', 'Error Handling & Testing', 
 'Implement comprehensive error handling and payment testing', 
 NULL, NULL, '2024-02-20', '2024-03-01', INTERVAL '1.625 days', 'To Do', 
 NULL, 'High', '["testing", "error-handling"]'::jsonb, payment_story_id),

-- Independent Tasks
(gen_random_uuid(), 'task', 'Code Review Process Setup', 
 'Establish code review guidelines and automation tools', 
 NULL, NULL, '2024-01-10', '2024-01-20', INTERVAL '2 days', 'Done', 
 NULL, 'Medium', '["process", "quality"]'::jsonb, NULL),

(gen_random_uuid(), 'task', 'CI/CD Pipeline Configuration', 
 'Set up continuous integration and deployment pipeline', 
 NULL, NULL, '2024-01-15', '2024-01-30', INTERVAL '3 days', 'In Progress', 
 NULL, 'High', '["devops", "automation"]'::jsonb, NULL),

(gen_random_uuid(), 'task', 'Performance Optimization', 
 'Optimize application performance and database queries', 
 NULL, NULL, '2024-03-01', '2024-03-20', INTERVAL '2.5 days', 'To Do', 
 NULL, 'Medium', '["performance", "optimization"]'::jsonb, NULL),

(gen_random_uuid(), 'task', 'Security Audit', 
 'Conduct comprehensive security audit and vulnerability assessment', 
 NULL, NULL, '2024-03-15', '2024-04-01', INTERVAL '3.75 days', 'To Do', 
 NULL, 'High', '["security", "audit"]'::jsonb, NULL),

(gen_random_uuid(), 'task', 'User Acceptance Testing', 
 'Coordinate and execute user acceptance testing phase', 
 NULL, NULL, '2024-04-01', '2024-04-20', INTERVAL '5 days', 'To Do', 
 NULL, 'High', '["testing", "uat"]'::jsonb, NULL),

-- Additional sub-tasks for Mobile App Development
(gen_random_uuid(), 'sub_task', 'Mobile App Architecture', 
 'Design mobile app architecture and technology stack', 
 NULL, NULL, '2024-03-01', '2024-03-08', INTERVAL '2 days', 'To Do', 
 NULL, 'High', '["mobile", "architecture"]'::jsonb, mobile_story_id),

(gen_random_uuid(), 'sub_task', 'Core Feature Development', 
 'Implement core mobile app features and navigation', 
 NULL, NULL, '2024-03-08', '2024-04-15', INTERVAL '7.5 days', 'To Do', 
 NULL, 'High', '["mobile", "features"]'::jsonb, mobile_story_id),

(gen_random_uuid(), 'sub_task', 'Mobile UI/UX Design', 
 'Design and implement mobile-specific user interface', 
 NULL, NULL, '2024-03-15', '2024-04-05', INTERVAL '3.125 days', 'To Do', 
 NULL, 'Medium', '["mobile", "ui"]'::jsonb, mobile_story_id),

(gen_random_uuid(), 'sub_task', 'Mobile Testing & Deployment', 
 'Test mobile app and deploy to app stores', 
 NULL, NULL, '2024-04-15', '2024-05-01', INTERVAL '2.375 days', 'To Do', 
 NULL, 'High', '["mobile", "testing"]'::jsonb, mobile_story_id),

-- Additional sub-tasks for API Documentation
(gen_random_uuid(), 'sub_task', 'API Endpoint Documentation', 
 'Document all REST API endpoints with request/response examples', 
 NULL, NULL, '2024-02-15', '2024-02-25', INTERVAL '1.5 days', 'To Do', 
 NULL, 'Medium', '["documentation", "api", "endpoints"]'::jsonb, api_doc_story_id),

(gen_random_uuid(), 'sub_task', 'Interactive API Testing', 
 'Set up Swagger/OpenAPI interactive testing interface', 
 NULL, NULL, '2024-02-20', '2024-03-05', INTERVAL '1 day', 'To Do', 
 NULL, 'Medium', '["documentation", "swagger", "testing"]'::jsonb, api_doc_story_id),

(gen_random_uuid(), 'sub_task', 'SDK Documentation', 
 'Create SDK documentation and code examples for developers', 
 NULL, NULL, '2024-03-01', '2024-03-15', INTERVAL '1.25 days', 'To Do', 
 NULL, 'Low', '["documentation", "sdk", "examples"]'::jsonb, api_doc_story_id),

-- Additional independent tasks
(gen_random_uuid(), 'task', 'Database Backup Strategy', 
 'Implement automated database backup and recovery procedures', 
 NULL, NULL, '2024-01-25', '2024-02-05', INTERVAL '1.5 days', 'Done', 
 NULL, 'High', '["database", "backup", "recovery"]'::jsonb, NULL),

(gen_random_uuid(), 'task', 'Monitoring & Alerting Setup', 
 'Configure application monitoring, logging, and alerting systems', 
 NULL, NULL, '2024-02-01', '2024-02-15', INTERVAL '2.25 days', 'In Progress', 
 NULL, 'High', '["monitoring", "logging", "alerts"]'::jsonb, NULL),

(gen_random_uuid(), 'task', 'Load Testing', 
 'Conduct load testing to ensure application scalability', 
 NULL, NULL, '2024-03-20', '2024-04-05', INTERVAL '3.125 days', 'To Do', 
 NULL, 'Medium', '["testing", "performance", "scalability"]'::jsonb, NULL),

(gen_random_uuid(), 'task', 'Environment Setup Documentation', 
 'Create comprehensive environment setup and deployment guides', 
 NULL, NULL, '2024-01-08', '2024-01-15', INTERVAL '1.25 days', 'Done', 
 NULL, 'Medium', '["documentation", "deployment", "setup"]'::jsonb, NULL),

(gen_random_uuid(), 'task', 'Third-party Integrations', 
 'Integrate with external services (analytics, CRM, social media)', 
 NULL, NULL, '2024-04-05', '2024-04-25', INTERVAL '4.375 days', 'To Do', 
 NULL, 'Medium', '["integration", "external", "services"]'::jsonb, NULL);

END $$;

-- ===========================================
-- VERIFY INSERTIONS
-- ===========================================
-- Check the number of inserted records
SELECT 'Total tasks inserted:' as info, COUNT(*) as count FROM tasks;

-- Check task types distribution
SELECT type, COUNT(*) as count 
FROM tasks 
GROUP BY type 
ORDER BY count DESC;

-- Check task status distribution
SELECT status, COUNT(*) as count 
FROM tasks 
GROUP BY status 
ORDER BY count DESC;

-- Check tasks with parent-child relationships
SELECT 
    COUNT(CASE WHEN parent_task_id IS NULL THEN 1 END) as parent_tasks,
    COUNT(CASE WHEN parent_task_id IS NOT NULL THEN 1 END) as sub_tasks
FROM tasks;

-- Show parent-child relationships
SELECT 
    p.title as parent_task,
    p.type as parent_type,
    COUNT(c.task_id) as subtask_count
FROM tasks p
LEFT JOIN tasks c ON p.task_id = c.parent_task_id
WHERE p.parent_task_id IS NULL
GROUP BY p.task_id, p.title, p.type
ORDER BY subtask_count DESC;
