-- Complete Database Setup Script for Project Management System
-- Execute in the following order to avoid foreign key reference errors

-- ===========================================
-- 1. CREATE PROJECTS TABLE (No dependencies)
-- ===========================================
CREATE TABLE projects (
    project_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_name VARCHAR(255) NOT NULL,
    project_description TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'Planning',
    priority VARCHAR(50) NOT NULL DEFAULT 'Medium',
    budget DECIMAL(15, 2),
    project_manager_id UUID, -- Will reference users, but constraint added later
    client_name VARCHAR(255),
    project_type VARCHAR(100),
    completion_percentage DECIMAL(5, 2) DEFAULT 0.00,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT chk_project_status CHECK (status IN ('Planning', 'Active', 'On Hold', 'Completed', 'Cancelled')),
    CONSTRAINT chk_project_priority CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
    CONSTRAINT chk_project_dates CHECK (end_date IS NULL OR end_date >= start_date),
    CONSTRAINT chk_project_completion CHECK (completion_percentage >= 0.00 AND completion_percentage <= 100.00),
    CONSTRAINT chk_project_budget CHECK (budget IS NULL OR budget >= 0)
);

-- ===========================================
-- 2. CREATE USERS TABLE (No dependencies)
-- ===========================================
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    full_name VARCHAR(255) GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    role VARCHAR(50) NOT NULL DEFAULT 'Developer',
    department VARCHAR(100),
    phone_number VARCHAR(20),
    profile_picture_url VARCHAR(500),
    timezone VARCHAR(50) DEFAULT 'UTC',
    date_of_joining DATE,
    salary DECIMAL(12, 2),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    skills TEXT[],
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT chk_user_role CHECK (role IN ('Admin', 'Project Manager', 'Developer', 'Tester', 'Designer', 'Analyst', 'Scrum Master')),
    CONSTRAINT chk_user_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_user_salary CHECK (salary IS NULL OR salary >= 0)
);

-- ===========================================
-- 3. CREATE MILESTONES TABLE (References projects)
-- ===========================================
CREATE TABLE milestones (
    milestone_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    milestone_name VARCHAR(255) NOT NULL,
    milestone_description TEXT,
    target_date DATE NOT NULL,
    actual_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'Planned',
    priority VARCHAR(50) NOT NULL DEFAULT 'Medium',
    milestone_type VARCHAR(100),
    project_id UUID NOT NULL,
    owner_id UUID,
    completion_percentage DECIMAL(5, 2) DEFAULT 0.00,
    deliverables TEXT[],
    success_criteria TEXT,
    dependencies TEXT[],
    risks TEXT[],
    budget_allocated DECIMAL(12, 2),
    budget_spent DECIMAL(12, 2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT fk_milestone_project
        FOREIGN KEY (project_id)
        REFERENCES projects(project_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_milestone_owner
        FOREIGN KEY (owner_id)
        REFERENCES users(user_id)
        ON DELETE SET NULL,

    CONSTRAINT chk_milestone_status CHECK (status IN ('Planned', 'In Progress', 'Completed', 'Delayed', 'Cancelled')),
    CONSTRAINT chk_milestone_priority CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
    CONSTRAINT chk_milestone_completion CHECK (completion_percentage >= 0.00 AND completion_percentage <= 100.00),
    CONSTRAINT chk_milestone_dates CHECK (actual_date IS NULL OR actual_date >= target_date - INTERVAL '365 days'),
    CONSTRAINT chk_milestone_budget CHECK (
        (budget_allocated IS NULL OR budget_allocated >= 0) AND
        (budget_spent >= 0) AND
        (budget_allocated IS NULL OR budget_spent <= budget_allocated + (budget_allocated * 0.1))
    )
);

-- ===========================================
-- 4. CREATE HOLIDAYS TABLE (No dependencies)
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
-- 5. CREATE EPICS TABLE (References projects, users, milestones, and self)
-- ===========================================
CREATE TABLE epics (
    epic_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Not Started',
    priority VARCHAR(50) NOT NULL DEFAULT 'Medium',
    project_id UUID NOT NULL,
    assigned_to UUID,
    progress_percentage FLOAT8 DEFAULT 0.00,
    parent_epic_id UUID,
    milestone_id UUID,
    tags JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT fk_epic_project
        FOREIGN KEY (project_id)
        REFERENCES projects(project_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_epic_assigned_to
        FOREIGN KEY (assigned_to)
        REFERENCES users(user_id)
        ON DELETE SET NULL,
    CONSTRAINT fk_epic_parent_epic
        FOREIGN KEY (parent_epic_id)
        REFERENCES epics(epic_id)
        ON DELETE SET NULL,
    CONSTRAINT fk_epic_milestone
        FOREIGN KEY (milestone_id)
        REFERENCES milestones(milestone_id)
        ON DELETE SET NULL,

    CONSTRAINT chk_epic_dates CHECK (end_date >= start_date),
    CONSTRAINT chk_epic_progress_percentage CHECK (progress_percentage >= 0.00 AND progress_percentage <= 100.00)
);

-- ===========================================
-- 6. CREATE SPRINTS TABLE (References projects)
-- ===========================================
CREATE TABLE sprints (
    sprint_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sprint_name VARCHAR(255) NOT NULL,
    sprint_start_date DATE NOT NULL,
    sprint_end_date DATE NOT NULL,
    sprint_goal TEXT,
    total_story_points DECIMAL(10, 2) DEFAULT 0.00,
    velocity_history JSONB,
    scope_changes TEXT,
    project_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT fk_sprint_project
        FOREIGN KEY (project_id)
        REFERENCES projects(project_id)
        ON DELETE CASCADE,

    CONSTRAINT chk_sprint_dates CHECK (sprint_end_date >= sprint_start_date)
);

-- ===========================================
-- 7. CREATE TASKS TABLE (Can reference epics, sprints, users, and self)
-- ===========================================
CREATE TABLE tasks (
    task_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    epic_id UUID,
    sprint_id UUID,
    start_date DATE NOT NULL,
    due_date DATE,
    original_estimate INTERVAL,
    status VARCHAR(50) NOT NULL DEFAULT 'To Do',
    assignee_id UUID,
    priority VARCHAR(50) NOT NULL DEFAULT 'Medium',
    labels TEXT[],
    parent_task_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Foreign key constraints (optional - can be added later)
    CONSTRAINT fk_task_epic
        FOREIGN KEY (epic_id)
        REFERENCES epics(epic_id)
        ON DELETE SET NULL,
    CONSTRAINT fk_task_sprint
        FOREIGN KEY (sprint_id)
        REFERENCES sprints(sprint_id)
        ON DELETE SET NULL,
    CONSTRAINT fk_task_assignee
        FOREIGN KEY (assignee_id)
        REFERENCES users(user_id)
        ON DELETE SET NULL,
    CONSTRAINT fk_task_parent
        FOREIGN KEY (parent_task_id)
        REFERENCES tasks(task_id)
        ON DELETE SET NULL,

    CONSTRAINT chk_task_type CHECK (type IN ('task', 'story', 'sub_task')),
    CONSTRAINT chk_task_status CHECK (status IN ('To Do', 'In Progress', 'Done')),
    CONSTRAINT chk_task_priority CHECK (priority IN ('High', 'Medium', 'Low')),
    CONSTRAINT chk_task_dates CHECK (due_date IS NULL OR due_date >= start_date)
);

-- ===========================================
-- 7. ADD MISSING FOREIGN KEY CONSTRAINT TO PROJECTS
-- ===========================================
ALTER TABLE projects 
ADD CONSTRAINT fk_project_manager
    FOREIGN KEY (project_manager_id)
    REFERENCES users(user_id)
    ON DELETE SET NULL;

-- ===========================================
-- 8. CREATE INDEXES FOR BETTER PERFORMANCE
-- ===========================================

-- Projects indexes
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_start_date ON projects(start_date);
CREATE INDEX idx_projects_project_manager ON projects(project_manager_id);

-- Users indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_department ON users(department);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_active_users ON users(username, email) WHERE is_active = TRUE;

-- Milestones indexes
CREATE INDEX idx_milestones_project_id ON milestones(project_id);
CREATE INDEX idx_milestones_target_date ON milestones(target_date);
CREATE INDEX idx_milestones_status ON milestones(status);
CREATE INDEX idx_milestones_owner_id ON milestones(owner_id);

-- Epics indexes
CREATE INDEX idx_epics_project_id ON epics(project_id);
CREATE INDEX idx_epics_assigned_to ON epics(assigned_to);
CREATE INDEX idx_epics_parent_epic_id ON epics(parent_epic_id);
CREATE INDEX idx_epics_milestone_id ON epics(milestone_id);
CREATE INDEX idx_epics_status ON epics(status);

-- Sprints indexes
CREATE INDEX idx_sprints_project_id ON sprints(project_id);
CREATE INDEX idx_sprints_start_date ON sprints(sprint_start_date);

-- Tasks indexes
CREATE INDEX idx_tasks_epic_id ON tasks(epic_id);
CREATE INDEX idx_tasks_sprint_id ON tasks(sprint_id);
CREATE INDEX idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX idx_tasks_parent_task_id ON tasks(parent_task_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- Holidays indexes
CREATE INDEX idx_holidays_date ON holidays(holiday_date);
CREATE INDEX idx_holidays_type ON holidays(holiday_type);
CREATE INDEX idx_holidays_country ON holidays(country_code);

-- ===========================================
-- SETUP COMPLETE
-- ===========================================
-- Tables created in dependency order:
-- 1. projects (independent)
-- 2. users (independent)  
-- 3. milestones (depends on projects, users)
-- 4. holidays (independent)
-- 5. epics (depends on projects, users, milestones, self-reference)
-- 6. sprints (depends on projects)
-- 7. tasks (depends on epics, sprints, users, self-reference)