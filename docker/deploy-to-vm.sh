#!/bin/bash

# VM Deployment Script for Gantt Project
# This script deploys the application to an Azure VM using Docker Hub images

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
VM_USER="azureuser"  # Default Azure VM user
VM_IP=""
SSH_KEY_PATH="$HOME/.ssh/id_rsa"
DEPLOYMENT_PATH="/home/$VM_USER/gantt-project"

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
    echo -e "${PURPLE}[DEPLOY]${NC} $1"
}

# Function to get VM connection details
get_vm_details() {
    if [ -z "$VM_IP" ]; then
        echo -n "Enter VM IP address: "
        read VM_IP
    fi
    
    if [ -z "$VM_IP" ]; then
        print_error "VM IP address is required"
        exit 1
    fi
    
    print_status "VM IP: $VM_IP"
    print_status "VM User: $VM_USER"
    print_status "Deployment path: $DEPLOYMENT_PATH"
}

# Function to test SSH connection
test_ssh_connection() {
    print_status "Testing SSH connection to VM..."
    
    if ssh -o ConnectTimeout=10 -o BatchMode=yes -i "$SSH_KEY_PATH" "$VM_USER@$VM_IP" "echo 'SSH connection successful'" 2>/dev/null; then
        print_success "✓ SSH connection established"
        return 0
    else
        print_error "✗ SSH connection failed"
        print_status "Please ensure:"
        print_status "1. VM is running and accessible"
        print_status "2. SSH key is configured: $SSH_KEY_PATH"
        print_status "3. VM firewall allows SSH (port 22)"
        return 1
    fi
}

# Function to setup VM (install Docker, etc.)
setup_vm() {
    print_header "Setting up VM for Docker deployment..."
    
    ssh -i "$SSH_KEY_PATH" "$VM_USER@$VM_IP" << 'EOF'
        # Update system
        sudo apt update && sudo apt upgrade -y
        
        # Install Docker
        sudo apt install -y docker.io docker-compose-plugin
        
        # Add user to docker group
        sudo usermod -aG docker $USER
        
        # Start and enable Docker
        sudo systemctl start docker
        sudo systemctl enable docker
        
        # Install additional tools
        sudo apt install -y curl wget htop
        
        # Create deployment directory
        mkdir -p /home/azureuser/gantt-project
        
        echo "VM setup completed successfully!"
EOF
    
    print_success "✓ VM setup completed"
    print_warning "⚠️  Please logout and login again to apply Docker group membership, or use sudo for Docker commands"
}

# Function to deploy application files
deploy_files() {
    print_header "Deploying application files to VM..."
    
    # Create deployment directory on VM
    ssh -i "$SSH_KEY_PATH" "$VM_USER@$VM_IP" "mkdir -p $DEPLOYMENT_PATH"
    
    # Copy production files
    print_status "Copying Docker Compose file..."
    scp -i "$SSH_KEY_PATH" "docker-compose.production.yml" "$VM_USER@$VM_IP:$DEPLOYMENT_PATH/"
    
    print_status "Copying environment file..."
    scp -i "$SSH_KEY_PATH" ".env.production" "$VM_USER@$VM_IP:$DEPLOYMENT_PATH/"
    
    # Copy management scripts
    print_status "Copying management scripts..."
    scp -i "$SSH_KEY_PATH" "vm-manager.sh" "$VM_USER@$VM_IP:$DEPLOYMENT_PATH/" 2>/dev/null || true
    
    print_success "✓ Files deployed to VM"
}

# Function to start application on VM
start_application() {
    print_header "Starting Gantt Project on VM..."
    
    ssh -i "$SSH_KEY_PATH" "$VM_USER@$VM_IP" << EOF
        cd $DEPLOYMENT_PATH
        
        # Pull latest images
        echo "Pulling Docker images..."
        sudo docker compose -f docker-compose.production.yml --env-file .env.production pull
        
        # Start services
        echo "Starting services..."
        sudo docker compose -f docker-compose.production.yml --env-file .env.production up -d
        
        # Wait for services to start
        echo "Waiting for services to start..."
        sleep 30
        
        # Check status
        sudo docker compose -f docker-compose.production.yml ps
EOF
    
    print_success "✓ Application started on VM"
}

# Function to check application status on VM
check_status() {
    print_header "Checking application status on VM..."
    
    ssh -i "$SSH_KEY_PATH" "$VM_USER@$VM_IP" << EOF
        cd $DEPLOYMENT_PATH
        
        echo "=== Container Status ==="
        sudo docker compose -f docker-compose.production.yml ps
        echo ""
        
        echo "=== Health Checks ==="
        # Test frontend
        if curl -f http://localhost:80/frontend-health > /dev/null 2>&1; then
            echo "✓ Frontend is healthy"
        else
            echo "✗ Frontend is not responding"
        fi
        
        # Test backend
        if curl -f http://localhost:80/health > /dev/null 2>&1; then
            echo "✓ Backend is healthy"
        else
            echo "✗ Backend is not responding"
        fi
        
        echo ""
        echo "=== Resource Usage ==="
        sudo docker stats --no-stream
EOF
}

# Function to show application logs
show_logs() {
    local service="${1:-}"
    
    print_header "Showing logs from VM..."
    
    if [ -n "$service" ]; then
        ssh -i "$SSH_KEY_PATH" "$VM_USER@$VM_IP" "cd $DEPLOYMENT_PATH && sudo docker compose -f docker-compose.production.yml logs -f $service"
    else
        ssh -i "$SSH_KEY_PATH" "$VM_USER@$VM_IP" "cd $DEPLOYMENT_PATH && sudo docker compose -f docker-compose.production.yml logs -f"
    fi
}

# Function to update application
update_application() {
    local version="${1:-latest}"
    
    print_header "Updating application to version: $version"
    
    ssh -i "$SSH_KEY_PATH" "$VM_USER@$VM_IP" << EOF
        cd $DEPLOYMENT_PATH
        
        # Update VERSION_TAG in .env.production
        sed -i "s/^VERSION_TAG=.*/VERSION_TAG=$version/" .env.production
        
        # Pull new images
        echo "Pulling new images..."
        sudo docker compose -f docker-compose.production.yml --env-file .env.production pull
        
        # Restart services
        echo "Restarting services..."
        sudo docker compose -f docker-compose.production.yml --env-file .env.production up -d
        
        echo "Update completed!"
EOF
    
    print_success "✓ Application updated to version $version"
}

# Function to show help
show_help() {
    echo "VM Deployment Script for Gantt Project"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  setup                    Setup VM (install Docker, create directories)"
    echo "  deploy                   Deploy application to VM"
    echo "  start                    Start application on VM"
    echo "  status                   Check application status on VM"
    echo "  logs [service]           Show logs from VM"
    echo "  update [version]         Update application to specific version"
    echo "  help                     Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 setup                 # One-time VM setup"
    echo "  $0 deploy                # Deploy application files and start"
    echo "  $0 status                # Check if everything is running"
    echo "  $0 logs frontend         # Show frontend logs"
    echo "  $0 update v1.1           # Update to version v1.1"
    echo ""
    echo "Prerequisites:"
    echo "  1. Azure VM is running and accessible"
    echo "  2. SSH key configured for VM access"
    echo "  3. VM firewall allows HTTP (port 80) and SSH (port 22)"
    echo "  4. Docker images are pushed to Docker Hub"
}

# Main function
main() {
    local command="${1:-}"
    
    case "$command" in
        "setup")
            get_vm_details
            if test_ssh_connection; then
                setup_vm
            fi
            ;;
            
        "deploy")
            get_vm_details
            if test_ssh_connection; then
                deploy_files
                start_application
                check_status
                print_header "🎉 Deployment completed!"
                print_status "Your application should be available at: http://$VM_IP"
            fi
            ;;
            
        "start")
            get_vm_details
            if test_ssh_connection; then
                start_application
            fi
            ;;
            
        "status")
            get_vm_details
            if test_ssh_connection; then
                check_status
            fi
            ;;
            
        "logs")
            get_vm_details
            if test_ssh_connection; then
                show_logs "$2"
            fi
            ;;
            
        "update")
            get_vm_details
            if test_ssh_connection; then
                update_application "$2"
            fi
            ;;
            
        "help"|"--help"|"-h"|"")
            show_help
            ;;
            
        *)
            print_error "Unknown command: $command"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

main "$@"
