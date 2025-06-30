#!/bin/bash

# Docker Hub Build and Push Script for Gantt Project
# This script builds all images and pushes them to Docker Hub

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Docker Hub configuration
DOCKER_HUB_USERNAME="abdfaiyaz"  # Your Docker Hub username
REGISTRY_PREFIX="abdfaiyaz"      # Registry prefix for images

# Image names
FRONTEND_IMAGE="gantt-frontend"
BACKEND_IMAGE="gantt-backend"
DATABASE_IMAGE="gantt-database"

# Version tag (default to latest)
VERSION_TAG="${1:-latest}"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}[DOCKER HUB]${NC} $1"
}

# Function to get Docker Hub username
get_docker_hub_username() {
    REGISTRY_PREFIX="$DOCKER_HUB_USERNAME"
    print_status "Using Docker Hub username: $DOCKER_HUB_USERNAME"
}

# Function to check Docker login
check_docker_login() {
    print_status "Checking Docker Hub authentication..."
    
    if ! sudo docker info | grep -q "Username"; then
        print_warning "Not logged in to Docker Hub"
        print_status "Please login to Docker Hub:"
        sudo docker login
    else
        print_success "Already logged in to Docker Hub"
    fi
}

# Function to build image
build_image() {
    local image_name="$1"
    local dockerfile_path="$2"
    local context_path="$3"
    local full_image_name="$REGISTRY_PREFIX/$image_name:$VERSION_TAG"
    
    print_header "Building $image_name..."
    print_status "Image: $full_image_name"
    print_status "Dockerfile: $dockerfile_path"
    print_status "Context: $context_path"
    
    if sudo docker build -f "$dockerfile_path" -t "$full_image_name" "$context_path"; then
        print_success "✓ Built $image_name successfully"
        return 0
    else
        print_error "✗ Failed to build $image_name"
        return 1
    fi
}

# Function to push image
push_image() {
    local image_name="$1"
    local full_image_name="$REGISTRY_PREFIX/$image_name:$VERSION_TAG"
    
    print_header "Pushing $image_name to Docker Hub..."
    print_status "Pushing: $full_image_name"
    
    if sudo docker push "$full_image_name"; then
        print_success "✓ Pushed $image_name successfully"
        return 0
    else
        print_error "✗ Failed to push $image_name"
        return 1
    fi
}

# Function to tag as latest if not already latest
tag_as_latest() {
    local image_name="$1"
    
    if [ "$VERSION_TAG" != "latest" ]; then
        local versioned_image="$REGISTRY_PREFIX/$image_name:$VERSION_TAG"
        local latest_image="$REGISTRY_PREFIX/$image_name:latest"
        
        print_status "Tagging $image_name as latest..."
        sudo docker tag "$versioned_image" "$latest_image"
        sudo docker push "$latest_image"
        print_success "✓ Tagged and pushed $image_name:latest"
    fi
}

# Function to show image information
show_image_info() {
    print_header "Built Images Summary:"
    echo ""
    echo -e "${GREEN}Frontend:${NC} $REGISTRY_PREFIX/$FRONTEND_IMAGE:$VERSION_TAG"
    echo -e "${GREEN}Backend:${NC}  $REGISTRY_PREFIX/$BACKEND_IMAGE:$VERSION_TAG"
    echo -e "${GREEN}Database:${NC} $REGISTRY_PREFIX/$DATABASE_IMAGE:$VERSION_TAG"
    echo ""
    echo -e "${BLUE}Docker Hub URLs:${NC}"
    echo "  https://hub.docker.com/r/$REGISTRY_PREFIX/$FRONTEND_IMAGE"
    echo "  https://hub.docker.com/r/$REGISTRY_PREFIX/$BACKEND_IMAGE"
    echo "  https://hub.docker.com/r/$REGISTRY_PREFIX/$DATABASE_IMAGE"
}

# Function to update compose files
update_compose_files() {
    print_status "Creating production Docker Compose file..."
    
    # Create production compose file
    cat > "$SCRIPT_DIR/docker-compose.production.yml" << EOF
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: \${REGISTRY_PREFIX}/$DATABASE_IMAGE:\${VERSION_TAG:-latest}
    container_name: gantt-postgres
    environment:
      - POSTGRES_DB=\${DB_NAME}
      - POSTGRES_USER=\${DB_USERNAME}
      - POSTGRES_PASSWORD=\${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - gantt_network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U \${DB_USERNAME} -d \${DB_NAME}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Spring Boot Backend
  backend:
    image: \${REGISTRY_PREFIX}/$BACKEND_IMAGE:\${VERSION_TAG:-latest}
    container_name: gantt-backend
    environment:
      - SPRING_PROFILES_ACTIVE=docker
      - DB_USERNAME=\${DB_USERNAME}
      - DB_PASSWORD=\${DB_PASSWORD}
      - SHOW_SQL=\${SHOW_SQL:-false}
      - FORMAT_SQL=\${FORMAT_SQL:-false}
      - SQL_LOGGING_LEVEL=\${SQL_LOGGING_LEVEL:-WARN}
      - SQL_PARAM_LOGGING=\${SQL_PARAM_LOGGING:-WARN}
    networks:
      - gantt_network
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

  # React Frontend with Nginx
  frontend:
    image: \${REGISTRY_PREFIX}/$FRONTEND_IMAGE:\${VERSION_TAG:-latest}
    container_name: gantt-frontend
    ports:
      - "\${FRONTEND_EXTERNAL_PORT:-80}:80"
    environment:
      - NGINX_HOST=\${FRONTEND_HOST:-localhost}
      - NGINX_PORT=80
    networks:
      - gantt_network
    depends_on:
      backend:
        condition: service_healthy
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:80/frontend-health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s

volumes:
  postgres_data:
    driver: local

networks:
  gantt_network:
    driver: bridge
EOF

    print_success "✓ Created docker-compose.production.yml"
}

# Function to create environment file for production
create_production_env() {
    print_status "Creating production environment template..."
    
    cat > "$SCRIPT_DIR/.env.production" << EOF
# Production Environment Configuration for Gantt Project

# Docker Registry Configuration
REGISTRY_PREFIX=$REGISTRY_PREFIX
VERSION_TAG=latest

# Database Configuration
DB_NAME=gantt_project_db
DB_USERNAME=postgres
DB_PASSWORD=CHANGE_THIS_PASSWORD_IN_PRODUCTION

# Frontend Configuration
FRONTEND_EXTERNAL_PORT=80
FRONTEND_HOST=localhost

# Environment and Logging
SHOW_SQL=false
FORMAT_SQL=false
SQL_LOGGING_LEVEL=WARN
SQL_PARAM_LOGGING=WARN

# Network configuration
DOCKER_NETWORK=gantt_network

# Volume configuration
POSTGRES_DATA_VOLUME=postgres_data
EOF

    print_success "✓ Created .env.production template"
    print_warning "⚠️  Remember to update the database password in .env.production"
}

# Main build and push workflow
main() {
    print_header "Gantt Project - Docker Hub Build & Push"
    echo ""
    
    # Validate inputs
    get_docker_hub_username
    check_docker_login
    
    print_status "Building version: $VERSION_TAG"
    echo ""
    
    # Build all images
    print_header "=== BUILDING IMAGES ==="
    
    # Build database image
    if ! build_image "$DATABASE_IMAGE" "$SCRIPT_DIR/database/Dockerfile" "$SCRIPT_DIR/database"; then
        exit 1
    fi
    
    # Build backend image
    if ! build_image "$BACKEND_IMAGE" "$SCRIPT_DIR/backend/Dockerfile" "$PROJECT_ROOT"; then
        exit 1
    fi
    
    # Build frontend image
    if ! build_image "$FRONTEND_IMAGE" "$SCRIPT_DIR/frontend/Dockerfile" "$PROJECT_ROOT"; then
        exit 1
    fi
    
    echo ""
    print_header "=== PUSHING TO DOCKER HUB ==="
    
    # Push all images
    if ! push_image "$DATABASE_IMAGE"; then
        exit 1
    fi
    
    if ! push_image "$BACKEND_IMAGE"; then
        exit 1
    fi
    
    if ! push_image "$FRONTEND_IMAGE"; then
        exit 1
    fi
    
    # Tag as latest if building a specific version
    if [ "$VERSION_TAG" != "latest" ]; then
        print_header "=== TAGGING AS LATEST ==="
        tag_as_latest "$DATABASE_IMAGE"
        tag_as_latest "$BACKEND_IMAGE"
        tag_as_latest "$FRONTEND_IMAGE"
    fi
    
    # Update compose files
    update_compose_files
    create_production_env
    
    echo ""
    print_success "🎉 All images built and pushed successfully!"
    show_image_info
    
    echo ""
    print_header "Next Steps:"
    echo "1. Copy the production files to your Azure VM:"
    echo "   - docker-compose.production.yml"
    echo "   - .env.production (update the password!)"
    echo ""
    echo "2. On the VM, run:"
    echo "   sudo docker compose -f docker-compose.production.yml --env-file .env.production up -d"
}

# Help function
show_help() {
    echo "Gantt Project Docker Hub Build & Push Script"
    echo ""
    echo "Usage: $0 [VERSION_TAG]"
    echo ""
    echo "Arguments:"
    echo "  VERSION_TAG    Version tag for the images (default: latest)"
    echo ""
    echo "Environment Variables:"
    echo "  DOCKERHUB_USERNAME    Your Docker Hub username"
    echo ""
    echo "Examples:"
    echo "  $0                    # Build and push with 'latest' tag"
    echo "  $0 v1.0               # Build and push with 'v1.0' tag"
    echo "  $0 dev                # Build and push with 'dev' tag"
}

# Script entry point
if [[ "${1:-}" == "help" ]] || [[ "${1:-}" == "--help" ]] || [[ "${1:-}" == "-h" ]]; then
    show_help
    exit 0
fi

main
