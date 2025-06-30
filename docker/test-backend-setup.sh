#!/bin/bash

# Backend Docker Test Script
# This script validates the backend containerization setup

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=== Gantt Project Backend Docker Test ==="
echo ""

echo "1. Checking Docker files..."
files_to_check=(
    "$SCRIPT_DIR/backend/Dockerfile"
    "$SCRIPT_DIR/backend/application-docker.properties"
    "$SCRIPT_DIR/docker-compose.backend.yml"
    "$SCRIPT_DIR/.env"
    "$SCRIPT_DIR/backend-manager.sh"
)

for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✓ $(basename "$file") exists"
    else
        echo "   ✗ $(basename "$file") missing"
    fi
done

echo ""
echo "2. Checking Spring Boot configuration..."

# Check if actuator dependency is added
if grep -q "spring-boot-starter-actuator" "$SCRIPT_DIR/../Gantt_project_v1/pom.xml"; then
    echo "   ✓ Spring Boot Actuator dependency added"
else
    echo "   ✗ Spring Boot Actuator dependency missing"
fi

# Check for .dockerignore
if [ -f "$SCRIPT_DIR/../.dockerignore" ]; then
    echo "   ✓ .dockerignore file exists"
else
    echo "   ✗ .dockerignore file missing"
fi

echo ""
echo "3. Backend management script permissions..."
if [ -x "$SCRIPT_DIR/backend-manager.sh" ]; then
    echo "   ✓ backend-manager.sh is executable"
else
    echo "   ✗ backend-manager.sh is not executable"
fi

echo ""
echo "4. Docker Compose validation..."
if command -v docker >/dev/null 2>&1; then
    echo "   ✓ Docker command available"
    if sudo docker compose version >/dev/null 2>&1; then
        echo "   ✓ Docker Compose available"
        
        # Validate compose file syntax
        if sudo docker compose -f "$SCRIPT_DIR/docker-compose.backend.yml" config >/dev/null 2>&1; then
            echo "   ✓ Docker Compose file syntax is valid"
        else
            echo "   ✗ Docker Compose file has syntax errors"
        fi
    else
        echo "   ✗ Docker Compose not available"
    fi
else
    echo "   ✗ Docker not available"
fi

echo ""
echo "5. Next steps to test:"
echo "   1. Ensure Docker daemon is running and accessible"
echo "   2. Run: sudo ./backend-manager.sh start"
echo "   3. Wait for services to start (check with: sudo ./backend-manager.sh status)"
echo "   4. Test API: curl http://localhost:8080/actuator/health"
echo "   5. Test database connection via backend endpoints"

echo ""
echo "=== Test Complete ==="
