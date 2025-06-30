#!/bin/bash

# Database management script for Gantt Project

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
DOCKER_DIR="$SCRIPT_DIR"

print_usage() {
    echo "Usage: $0 {start|stop|restart|logs|status|clean}"
    echo ""
    echo "Commands:"
    echo "  start    - Start the database container"
    echo "  stop     - Stop the database container"
    echo "  restart  - Restart the database container"
    echo "  logs     - Show database container logs"
    echo "  status   - Show database container status"
    echo "  clean    - Stop and remove database container and volumes"
    echo ""
}

start_db() {
    echo -e "${GREEN}Starting Gantt Project Database...${NC}"
    cd "$DOCKER_DIR"
    sudo docker compose -f docker-compose.db.yml --env-file .env up -d
    echo -e "${GREEN}Database started successfully!${NC}"
    echo "Database will be available on localhost:5433"
}

stop_db() {
    echo -e "${YELLOW}Stopping Gantt Project Database...${NC}"
    cd "$DOCKER_DIR"
    sudo docker compose -f docker-compose.db.yml down
    echo -e "${GREEN}Database stopped successfully!${NC}"
}

restart_db() {
    echo -e "${YELLOW}Restarting Gantt Project Database...${NC}"
    stop_db
    start_db
}

show_logs() {
    echo -e "${GREEN}Showing database logs...${NC}"
    cd "$DOCKER_DIR"
    sudo docker compose -f docker-compose.db.yml logs -f postgres
}

show_status() {
    echo -e "${GREEN}Database Status:${NC}"
    cd "$DOCKER_DIR"
    sudo docker compose -f docker-compose.db.yml ps
}

clean_db() {
    echo -e "${RED}WARNING: This will remove all database data!${NC}"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Cleaning up database...${NC}"
        cd "$DOCKER_DIR"
        sudo docker compose -f docker-compose.db.yml down -v
        sudo docker volume rm postgres_data 2>/dev/null || true
        echo -e "${GREEN}Database cleaned successfully!${NC}"
    else
        echo "Operation cancelled."
    fi
}

case "$1" in
    start)
        start_db
        ;;
    stop)
        stop_db
        ;;
    restart)
        restart_db
        ;;
    logs)
        show_logs
        ;;
    status)
        show_status
        ;;
    clean)
        clean_db
        ;;
    *)
        print_usage
        exit 1
        ;;
esac
