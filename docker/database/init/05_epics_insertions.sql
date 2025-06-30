-- Insert 10 dummy rows into epics table
-- Uses subqueries to reference actual UUIDs from existing tables

INSERT INTO epics (epic_id, name, description, start_date, end_date, status, priority, project_id, assigned_to, progress_percentage, parent_epic_id, milestone_id, tags) VALUES
(gen_random_uuid(), 'User Authentication System', 'Implement comprehensive user authentication and authorization system', '2024-01-15', '2024-03-30', 'In Progress', 'High', (SELECT project_id FROM projects LIMIT 1 OFFSET 0), (SELECT user_id FROM users LIMIT 1 OFFSET 0), 45.50, NULL, (SELECT milestone_id FROM milestones LIMIT 1 OFFSET 0), ARRAY['authentication', 'security', 'backend']),

(gen_random_uuid(), 'Frontend Dashboard', 'Create responsive dashboard for project management', '2024-02-01', '2024-04-15', 'Not Started', 'Medium', (SELECT project_id FROM projects LIMIT 1 OFFSET 0), (SELECT user_id FROM users LIMIT 1 OFFSET 1), 0.00, NULL, (SELECT milestone_id FROM milestones LIMIT 1 OFFSET 1), ARRAY['frontend', 'dashboard', 'ui']),

(gen_random_uuid(), 'API Integration Layer', 'Develop RESTful API endpoints for all core functionality', '2024-01-20', '2024-03-15', 'In Progress', 'High', (SELECT project_id FROM projects LIMIT 1 OFFSET 0), (SELECT user_id FROM users LIMIT 1 OFFSET 2), 65.25, NULL, NULL, ARRAY['api', 'backend', 'integration']),

(gen_random_uuid(), 'Mobile Application', 'Cross-platform mobile app development', '2024-03-01', '2024-06-30', 'Not Started', 'Medium', (SELECT project_id FROM projects LIMIT 1 OFFSET 1), (SELECT user_id FROM users LIMIT 1 OFFSET 3), 0.00, NULL, (SELECT milestone_id FROM milestones LIMIT 1 OFFSET 2), ARRAY['mobile', 'react-native', 'cross-platform']),

(gen_random_uuid(), 'Database Optimization', 'Optimize database queries and implement caching', '2024-02-15', '2024-04-01', 'In Progress', 'High', (SELECT project_id FROM projects LIMIT 1 OFFSET 1), (SELECT user_id FROM users LIMIT 1 OFFSET 4), 30.75, NULL, NULL, ARRAY['database', 'performance', 'caching']),

(gen_random_uuid(), 'Security Audit', 'Comprehensive security testing and vulnerability assessment', '2024-04-01', '2024-05-15', 'Not Started', 'Critical', (SELECT project_id FROM projects LIMIT 1 OFFSET 2), (SELECT user_id FROM users LIMIT 1 OFFSET 5), 0.00, NULL, (SELECT milestone_id FROM milestones LIMIT 1 OFFSET 3), ARRAY['security', 'testing', 'audit']),

(gen_random_uuid(), 'User Onboarding Flow', 'Design and implement user onboarding experience', '2024-01-25', '2024-03-10', 'Completed', 'Medium', (SELECT project_id FROM projects LIMIT 1 OFFSET 0), (SELECT user_id FROM users LIMIT 1 OFFSET 6), 100.00, NULL, NULL, ARRAY['onboarding', 'ux', 'frontend']),

(gen_random_uuid(), 'Reporting System', 'Advanced analytics and reporting dashboard', '2024-03-15', '2024-05-30', 'Not Started', 'Low', (SELECT project_id FROM projects LIMIT 1 OFFSET 3), (SELECT user_id FROM users LIMIT 1 OFFSET 7), 0.00, NULL, (SELECT milestone_id FROM milestones LIMIT 1 OFFSET 4), ARRAY['analytics', 'reporting', 'dashboard']),

(gen_random_uuid(), 'Payment Integration', 'Integrate multiple payment gateways', '2024-02-20', '2024-04-30', 'In Progress', 'High', (SELECT project_id FROM projects LIMIT 1 OFFSET 4), (SELECT user_id FROM users LIMIT 1 OFFSET 8), 25.00, NULL, NULL, ARRAY['payment', 'integration', 'finance']),

(gen_random_uuid(), 'Performance Testing', 'Load testing and performance optimization', '2024-04-15', '2024-06-01', 'Not Started', 'Medium', (SELECT project_id FROM projects LIMIT 1 OFFSET 2), (SELECT user_id FROM users LIMIT 1 OFFSET 9), 0.00, NULL, (SELECT milestone_id FROM milestones LIMIT 1 OFFSET 5), ARRAY['performance', 'testing', 'optimization']);
