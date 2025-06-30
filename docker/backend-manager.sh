#!/bin/bash

# Backend Docker Management Script for Gantt Project
# This script manages the backend Docker container (includes database)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="$SCRIPT_DIR/docker-compose.backend.yml"
ENV_FILE="$SCRIPT_DIR/.env"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Function to check if Docker is running
check_docker() {
    if ! sudo docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
}

# Function to start the backend (with database)
start_backend() {
    print_status "Starting Gantt backend and database services..."
    check_docker
    
    sudo docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d
    
    print_status "Waiting for services to be healthy..."
    sleep 10
    
    # Check service health
    if sudo docker compose -f "$COMPOSE_FILE" ps --filter "status=running" | grep -q "gantt-backend"; then
        print_success "Backend service is running!"
        print_status "Backend API: http://localhost:8080"
        print_status "Database: localhost:5433"
    else
        print_warning "Backend service may still be starting. Check logs for details."
    fi
}

# Function to stop the backend
stop_backend() {
    print_status "Stopping Gantt backend services..."
    sudo docker compose -f "$COMPOSE_FILE" down
    print_success "Backend services stopped."
}

# Function to restart the backend
restart_backend() {
    print_status "Restarting Gantt backend services..."
    stop_backend
    sleep 3
    start_backend
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
    print_status "Backend services status:"
    sudo docker compose -f "$COMPOSE_FILE" ps
    echo ""
    
    # Show health status
    if command -v curl > /dev/null 2>&1; then
        print_status "Health check:"
        if curl -f http://localhost:8080/actuator/health > /dev/null 2>&1; then
            print_success "Backend API is healthy ✓"
        else
            print_warning "Backend API is not responding"
        fi
    fi
}

# Function to rebuild the backend
rebuild_backend() {
    print_status "Rebuilding Gantt backend..."
    sudo docker compose -f "$COMPOSE_FILE" down
    sudo docker compose -f "$COMPOSE_FILE" build --no-cache backend
    sudo docker compose -f "$COMPOSE_FILE" up -d
    print_success "Backend rebuilt and started."
}

# Function to clean up everything
clean_all() {
    print_warning "This will remove all containers, images, and volumes for the backend."
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Cleaning up backend environment..."
        sudo docker compose -f "$COMPOSE_FILE" down -v --rmi all
        print_success "Backend environment cleaned."
    else
        print_status "Cleanup cancelled."
    fi
}

# Function to access backend container shell
shell_backend() {
    print_status "Accessing backend container shell..."
    sudo docker compose -f "$COMPOSE_FILE" exec backend sh
}

# Function to show help
show_help() {
    echo "Gantt Backend Docker Management Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start           Start backend and database services"
    echo "  stop            Stop backend services"
    echo "  restart         Restart backend services"
    echo "  status          Show status of backend services"
    echo "  logs [service]  Show logs (optionally for specific service: backend, postgres)"
    echo "  rebuild         Rebuild and restart backend service"
    echo "  shell           Access backend container shell"
    echo "  clean           Remove all containers, images, and volumes"
    echo "  help            Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start                    # Start all services"
    echo "  $0 logs backend            # Show backend logs"
    echo "  $0 logs postgres           # Show database logs"
    echo "  $0 status                  # Check service status"
}

# Main script logic
case "${1:-}" in
    "start")
        start_backend
        ;;
    "stop")
        stop_backend
        ;;
    "restart")
        restart_backend
        ;;
    "status")
        show_status
        ;;
    "logs")
        show_logs "$2"
        ;;
    "rebuild")
        rebuild_backend
        ;;
    "shell")
        shell_backend
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
