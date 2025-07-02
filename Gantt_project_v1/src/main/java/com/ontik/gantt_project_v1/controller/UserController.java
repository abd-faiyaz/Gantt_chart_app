package com.ontik.gantt_project_v1.controller;

import com.ontik.gantt_project_v1.model.User;
import com.ontik.gantt_project_v1.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * REST Controller for User operations
 */
@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    /**
     * Get all active users for dropdown selection
     */
    @GetMapping
    public List<User> getAllActiveUsers() {
        System.out.println("GET /users - Fetching all active users");
        List<User> activeUsers = userService.getAllActiveUsers();
        System.out.println("Found " + activeUsers.size() + " active users");
        return activeUsers;
    }

    /**
     * Get user by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable UUID id) {
        System.out.println("GET /users/" + id + " - Fetching user by ID");
        Optional<User> user = userService.getUserById(id);
        return user.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get user by username
     */
    @GetMapping("/username/{username}")
    public ResponseEntity<User> getUserByUsername(@PathVariable String username) {
        System.out.println("GET /users/username/" + username + " - Fetching user by username");
        Optional<User> user = userService.getUserByUsername(username);
        return user.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
