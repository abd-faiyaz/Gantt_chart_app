package com.ontik.gantt_project_v1.controller;

import com.ontik.gantt_project_v1.dto.AuthResponse;
import com.ontik.gantt_project_v1.dto.LoginRequest;
import com.ontik.gantt_project_v1.dto.SignupRequest;
import com.ontik.gantt_project_v1.model.User;
import com.ontik.gantt_project_v1.service.UserService;
import com.ontik.gantt_project_v1.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

/**
 * Authentication controller for login and signup
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final JwtUtil jwtUtil;

    /**
     * Login endpoint
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()
                    )
            );

            // Generate JWT token
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String jwt = jwtUtil.generateToken(userDetails);

            // Update last login time
            userService.updateLastLogin(loginRequest.getEmail());

            // Get user info
            User user = userService.getUserByEmail(loginRequest.getEmail()).orElseThrow();

            log.info("User {} logged in successfully", loginRequest.getEmail());

            return ResponseEntity.ok(new AuthResponse(jwt, user.getEmail(), user.getDisplayName()));

        } catch (BadCredentialsException e) {
            log.warn("Login failed for user {}: Invalid credentials", loginRequest.getEmail());
            return ResponseEntity.badRequest()
                    .body(new AuthResponse("Invalid email or password"));
        } catch (Exception e) {
            log.error("Login error for user {}: {}", loginRequest.getEmail(), e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(new AuthResponse("Login failed. Please try again."));
        }
    }

    /**
     * Signup endpoint
     */
    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest signupRequest) {
        try {
            // Create new user
            User user = userService.createUser(signupRequest);

            // Generate JWT token
            UserDetails userDetails = userService.loadUserByUsername(user.getEmail());
            String jwt = jwtUtil.generateToken(userDetails);

            log.info("User {} registered successfully", user.getEmail());

            return ResponseEntity.ok(new AuthResponse(jwt, user.getEmail(), user.getDisplayName()));

        } catch (RuntimeException e) {
            log.warn("Signup failed for user {}: {}", signupRequest.getEmail(), e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new AuthResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("Signup error for user {}: {}", signupRequest.getEmail(), e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(new AuthResponse("Registration failed. Please try again."));
        }
    }

    /**
     * Test endpoint to verify authentication
     */
    @GetMapping("/verify")
    public ResponseEntity<AuthResponse> verify(Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated()) {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User user = userService.getUserByEmail(userDetails.getUsername()).orElseThrow();
            return ResponseEntity.ok(
                    AuthResponse.builder()
                            .email(user.getEmail())
                            .name(user.getDisplayName())
                            .message("Token is valid")
                            .build()
            );
        }
        return ResponseEntity.badRequest().body(new AuthResponse("Invalid token"));
    }
}
