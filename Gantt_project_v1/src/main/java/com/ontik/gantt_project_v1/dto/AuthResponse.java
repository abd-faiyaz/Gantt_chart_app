package com.ontik.gantt_project_v1.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

/**
 * DTO for authentication responses
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    
    private String token;
    @Builder.Default
    private String type = "Bearer";
    private String email;
    private String name;
    private String message;
    
    // Constructor for successful authentication
    public AuthResponse(String token, String email, String name) {
        this.token = token;
        this.email = email;
        this.name = name;
        this.message = "Authentication successful";
    }
    
    // Constructor for error responses
    public AuthResponse(String message) {
        this.message = message;
    }
}
