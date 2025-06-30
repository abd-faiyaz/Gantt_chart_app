// Package for config
package com.ontik.gantt_project_v1.config;

// Import config and web classes
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// Mark as configuration class
@Configuration
public class WebConfig implements WebMvcConfigurer {

    // Override the addCorsMappings method
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Allow CORS for all endpoints and from localhost:3000 (React dev server)
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}