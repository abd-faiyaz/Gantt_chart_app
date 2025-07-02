package com.ontik.gantt_project_v1.service;

import com.ontik.gantt_project_v1.model.Project;
import com.ontik.gantt_project_v1.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ProjectService {
    
    @Autowired
    private ProjectRepository projectRepository;
    
    // Get all projects
    public List<Project> getAllProjects() {
        return projectRepository.findAllOrderByName();
    }
    
    // Get all active projects
    public List<Project> getActiveProjects() {
        return projectRepository.findActiveProjects();
    }
    
    // Get project by ID
    public Optional<Project> getProjectById(UUID projectId) {
        return projectRepository.findById(projectId);
    }
    
    // Create a new project
    public Project createProject(Project project) {
        return projectRepository.save(project);
    }
    
    // Update an existing project
    public Project updateProject(UUID projectId, Project updatedProject) {
        return projectRepository.findById(projectId)
                .map(project -> {
                    project.setProjectName(updatedProject.getProjectName());
                    project.setProjectDescription(updatedProject.getProjectDescription());
                    project.setStartDate(updatedProject.getStartDate());
                    project.setEndDate(updatedProject.getEndDate());
                    project.setStatus(updatedProject.getStatus());
                    project.setPriority(updatedProject.getPriority());
                    project.setBudget(updatedProject.getBudget());
                    project.setProjectManagerId(updatedProject.getProjectManagerId());
                    project.setClientName(updatedProject.getClientName());
                    project.setProjectType(updatedProject.getProjectType());
                    project.setCompletionPercentage(updatedProject.getCompletionPercentage());
                    project.setTags(updatedProject.getTags());
                    return projectRepository.save(project);
                })
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));
    }
    
    // Delete a project
    public void deleteProject(UUID projectId) {
        projectRepository.deleteById(projectId);
    }
    
    // Get projects by status
    public List<Project> getProjectsByStatus(String status) {
        return projectRepository.findByStatus(status);
    }
    
    // Get projects by client
    public List<Project> getProjectsByClient(String clientName) {
        return projectRepository.findByClientName(clientName);
    }
    
    // Get projects by type
    public List<Project> getProjectsByType(String projectType) {
        return projectRepository.findByProjectType(projectType);
    }
}
