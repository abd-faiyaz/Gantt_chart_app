# Multi-stage build for Spring Boot application
FROM maven:3.9.4-eclipse-temurin-21 AS builder
# Set working directory
WORKDIR /app

# Copy pom.xml first for better caching
COPY Gantt_project_v1/pom.xml ./

# Download dependencies (for better caching)
RUN mvn dependency:go-offline -B

# Copy source code
COPY Gantt_project_v1/src ./src

# Build the application using Maven directly (not wrapper)
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre

# Install curl for health checks
RUN apt-get update && \
    apt-get install -y curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN groupadd -r spring && useradd -r -g spring spring

# Copy the built JAR from builder stage
COPY --from=builder /app/target/Gantt_project_v1-*.jar app.jar

# Copy Docker-specific application properties
COPY ./docker/backend/application-docker.properties /app/application-docker.properties

# Change ownership to spring user
RUN chown spring:spring /app/app.jar /app/application-docker.properties

# Switch to non-root user
USER spring

# Expose the application port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# Set JVM options for containerized environment
ENV JAVA_OPTS="-Xms512m -Xmx1024m -XX:+UseContainerSupport"

# Run the application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
