-- Insert 10 dummy rows into sprints table
-- Uses subqueries to reference actual UUIDs from existing projects table

INSERT INTO sprints (sprint_id, sprint_name, sprint_start_date, sprint_end_date, sprint_goal, total_story_points, velocity_history, scope_changes, project_id) VALUES
(gen_random_uuid(), 'Sprint 1 - Foundation Setup', '2024-01-15', '2024-01-29', 'Set up project infrastructure and basic authentication framework', 21.50, '{"sprint_1": 21.5, "completed_points": 18.0}', 'Added extra security requirements mid-sprint', (SELECT project_id FROM projects LIMIT 1 OFFSET 0)),

(gen_random_uuid(), 'Sprint 2 - User Management', '2024-01-30', '2024-02-13', 'Complete user registration, login, and profile management features', 25.00, '{"sprint_1": 21.5, "sprint_2": 25.0, "completed_points": 23.5}', 'Removed password reset feature due to complexity', (SELECT project_id FROM projects LIMIT 1 OFFSET 0)),

(gen_random_uuid(), 'Sprint 3 - Dashboard MVP', '2024-02-14', '2024-02-28', 'Build minimum viable dashboard with basic widgets', 18.75, '{"sprint_2": 25.0, "sprint_3": 18.75, "completed_points": 18.75}', 'No scope changes', (SELECT project_id FROM projects LIMIT 1 OFFSET 0)),

(gen_random_uuid(), 'Sprint 4 - API Endpoints', '2024-03-01', '2024-03-15', 'Develop core REST API endpoints for project management', 22.25, '{"sprint_3": 18.75, "sprint_4": 22.25, "completed_points": 20.0}', 'Added additional validation requirements', (SELECT project_id FROM projects LIMIT 1 OFFSET 0)),

(gen_random_uuid(), 'Sprint 5 - Mobile Foundation', '2024-03-01', '2024-03-15', 'Set up mobile app structure and basic navigation', 19.50, '{"sprint_4": 22.25, "sprint_5": 19.5, "completed_points": 17.25}', 'Changed navigation framework mid-sprint', (SELECT project_id FROM projects LIMIT 1 OFFSET 1)),

(gen_random_uuid(), 'Sprint 6 - Database Optimization', '2024-02-15', '2024-02-29', 'Implement database indexing and query optimization', 16.00, '{"sprint_5": 19.5, "sprint_6": 16.0, "completed_points": 16.0}', 'No scope changes', (SELECT project_id FROM projects LIMIT 1 OFFSET 1)),

(gen_random_uuid(), 'Sprint 7 - Security Implementation', '2024-04-01', '2024-04-15', 'Implement authentication tokens and role-based access control', 24.75, '{"sprint_6": 16.0, "sprint_7": 24.75, "completed_points": 0.0}', 'Sprint not yet started', (SELECT project_id FROM projects LIMIT 1 OFFSET 2)),

(gen_random_uuid(), 'Sprint 8 - Reporting Features', '2024-03-15', '2024-03-29', 'Build basic reporting and analytics dashboard', 20.00, '{"sprint_7": 24.75, "sprint_8": 20.0, "completed_points": 0.0}', 'Sprint not yet started', (SELECT project_id FROM projects LIMIT 1 OFFSET 3)),

(gen_random_uuid(), 'Sprint 9 - Payment Setup', '2024-02-20', '2024-03-05', 'Integrate Stripe and PayPal payment gateways', 27.50, '{"sprint_8": 20.0, "sprint_9": 27.5, "completed_points": 15.0}', 'Added PayPal integration after Stripe completion', (SELECT project_id FROM projects LIMIT 1 OFFSET 4)),

(gen_random_uuid(), 'Sprint 10 - Performance Testing', '2024-04-15', '2024-04-29', 'Conduct load testing and implement performance improvements', 23.25, '{"sprint_9": 27.5, "sprint_10": 23.25, "completed_points": 0.0}', 'Sprint not yet started', (SELECT project_id FROM projects LIMIT 1 OFFSET 2));
