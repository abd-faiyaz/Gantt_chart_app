package com.ontik.gantt_project_v1.repository;

import com.ontik.gantt_project_v1.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProjectRepository extends JpaRepository<Project, UUID> {
    
    // Find projects by status
    List<Project> findByStatus(String status);
    
    // Find active projects (not completed or cancelled)
    @Query("SELECT p FROM Project p WHERE p.status NOT IN ('Completed', 'Cancelled') ORDER BY p.projectName")
    List<Project> findActiveProjects();
    
    // Find projects by client name
    List<Project> findByClientName(String clientName);
    
    // Find projects by project type
    List<Project> findByProjectType(String projectType);
    
    // Find all projects ordered by name
    @Query("SELECT p FROM Project p ORDER BY p.projectName")
    List<Project> findAllOrderByName();
}
