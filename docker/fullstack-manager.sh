#!/bin/bash

# Full-Stack Docker Management Script for Gantt Project
# This script manages the complete application stack (frontend, backend, database)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="$SCRIPT_DIR/docker-compose.fullstack.yml"
ENV_FILE="$SCRIPT_DIR/.env"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

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
    echo -e "${PURPLE}[GANTT]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! sudo docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
}

# Function to start the full stack
start_fullstack() {
    print_header "Starting Gantt Project Full Stack..."
    check_docker
    
    print_status "Building and starting all services..."
    sudo docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --build
    
    print_status "Waiting for services to be healthy..."
    sleep 15
    
    # Check service health
    print_status "Checking service status..."
    show_status
    
    print_success "Full stack deployment initiated!"
    print_header "Application URLs:"
    echo -e "  ${GREEN}Frontend:${NC} http://localhost:80"
    echo -e "  ${GREEN}Backend API:${NC} http://localhost:8080"
    echo -e "  ${GREEN}Database:${NC} localhost:5433"
    echo -e "  ${GREEN}Health Check:${NC} http://localhost:80/health"
}

# Function to stop the full stack
stop_fullstack() {
    print_header "Stopping Gantt Project Full Stack..."
    sudo docker compose -f "$COMPOSE_FILE" down
    print_success "Full stack stopped."
}

# Function to restart the full stack
restart_fullstack() {
    print_header "Restarting Gantt Project Full Stack..."
    stop_fullstack
    sleep 3
    start_fullstack
}

# Function to show logs
show_logs() {
    service=${1:-}
    if [ -n "$service" ]; then
        print_status "Showing logs for $service..."
        sudo docker compose -f "$COMPOSE_FILE" logs -f "$service"
    else
        print_status "Showing logs for all services..."
        sudo docker compose -f "$COMPOSE_FILE" logs -f
    fi
}

# Function to show status
show_status() {
    print_header "Gantt Project Services Status:"
    sudo docker compose -f "$COMPOSE_FILE" ps
    echo ""
    
    # Show detailed health status
    if command -v curl > /dev/null 2>&1; then
        print_status "Health Checks:"
        
        # Frontend health
        if curl -f http://localhost:80/frontend-health > /dev/null 2>&1; then
            print_success "✓ Frontend is healthy"
        else
            print_warning "✗ Frontend is not responding"
        fi
        
        # Backend health
        if curl -f http://localhost:80/health > /dev/null 2>&1; then
            print_success "✓ Backend API is healthy"
        else
            print_warning "✗ Backend API is not responding"
        fi
    fi
}

# Function to rebuild specific service
rebuild_service() {
    service=${1:-}
    if [ -z "$service" ]; then
        print_error "Please specify a service to rebuild: frontend, backend, or postgres"
        exit 1
    fi
    
    print_status "Rebuilding $service..."
    sudo docker compose -f "$COMPOSE_FILE" stop "$service"
    sudo docker compose -f "$COMPOSE_FILE" build --no-cache "$service"
    sudo docker compose -f "$COMPOSE_FILE" up -d "$service"
    print_success "$service rebuilt and started."
}

# Function to clean up everything
clean_all() {
    print_warning "This will remove all containers, images, and volumes for the full stack."
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Cleaning up full stack environment..."
        sudo docker compose -f "$COMPOSE_FILE" down -v --rmi all
        print_success "Full stack environment cleaned."
    else
        print_status "Cleanup cancelled."
    fi
}

# Function to access service container shell
shell_service() {
    service=${1:-}
    if [ -z "$service" ]; then
        print_error "Please specify a service: frontend, backend, or postgres"
        exit 1
    fi
    
    print_status "Accessing $service container shell..."
    case "$service" in
        "frontend")
            sudo docker compose -f "$COMPOSE_FILE" exec frontend sh
            ;;
        "backend")
            sudo docker compose -f "$COMPOSE_FILE" exec backend sh
            ;;
        "postgres")
            sudo docker compose -f "$COMPOSE_FILE" exec postgres psql -U postgres -d gantt_project_db
            ;;
        *)
            print_error "Unknown service: $service"
            exit 1
            ;;
    esac
}

# Function to run development mode
dev_mode() {
    print_header "Starting development mode..."
    print_status "This will start backend and database, but not frontend container"
    print_status "You can run React dev server separately with 'npm start'"
    
    # Start only backend services
    sudo docker compose -f "$COMPOSE_FILE" up -d postgres backend
    
    print_success "Development services started!"
    echo -e "  ${GREEN}Backend API:${NC} http://localhost:8080"
    echo -e "  ${GREEN}Database:${NC} localhost:5433"
    echo -e "  ${YELLOW}Frontend:${NC} Run 'npm start' in React_Frontend directory"
}

# Function to show help
show_help() {
    echo "Gantt Project Full-Stack Docker Management Script"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  start                    Start full stack (frontend + backend + database)"
    echo "  stop                     Stop full stack"
    echo "  restart                  Restart full stack"
    echo "  status                   Show status of all services"
    echo "  logs [service]           Show logs (all or specific: frontend, backend, postgres)"
    echo "  rebuild <service>        Rebuild specific service (frontend, backend, postgres)"
    echo "  shell <service>          Access service container shell"
    echo "  dev                      Start development mode (backend + db only)"
    echo "  clean                    Remove all containers, images, and volumes"
    echo "  help                     Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start                        # Start complete application"
    echo "  $0 logs frontend               # Show frontend logs"
    echo "  $0 rebuild backend             # Rebuild backend service"
    echo "  $0 shell postgres              # Access database shell"
    echo "  $0 dev                         # Development mode"
}

# Main script logic
case "${1:-}" in
    "start")
        start_fullstack
        ;;
    "stop")
        stop_fullstack
        ;;
    "restart")
        restart_fullstack
        ;;
    "status")
        show_status
        ;;
    "logs")
        show_logs "$2"
        ;;
    "rebuild")
        rebuild_service "$2"
        ;;
    "shell")
        shell_service "$2"
        ;;
    "dev")
        dev_mode
        ;;
    "clean")
        clean_all
        ;;
    "help"|"--help"|"-h")
        show_help
        ;;
    "")
        print_error "No command specified."
        echo ""
        show_help
        exit 1
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
