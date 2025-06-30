#!/bin/bash

# Version Tagging Script for Gantt Project Docker Images
# This script helps create and push specific version tags

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Docker Hub configuration
DOCKER_HUB_USERNAME="abdfaiyaz"
REGISTRY_PREFIX="abdfaiyaz"

# Image names
FRONTEND_IMAGE="gantt-frontend"
BACKEND_IMAGE="gantt-backend"
DATABASE_IMAGE="gantt-database"

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
    echo -e "${PURPLE}[VERSION]${NC} $1"
}

# Function to validate version format
validate_version() {
    local version="$1"
    
    if [[ ! "$version" =~ ^v[0-9]+\.[0-9]+(\.[0-9]+)?$ ]]; then
        print_error "Invalid version format. Use format: v1.0, v1.1, v2.0.1, etc."
        print_status "Examples: v1.0, v1.1, v2.0.1"
        return 1
    fi
    
    return 0
}

# Function to check if images exist locally
check_local_images() {
    local version="$1"
    local missing_images=()
    
    for image in "$FRONTEND_IMAGE" "$BACKEND_IMAGE" "$DATABASE_IMAGE"; do
        local full_name="$REGISTRY_PREFIX/$image:latest"
        if ! sudo docker image inspect "$full_name" > /dev/null 2>&1; then
            missing_images+=("$full_name")
        fi
    done
    
    if [ ${#missing_images[@]} -gt 0 ]; then
        print_error "The following images are not found locally:"
        for img in "${missing_images[@]}"; do
            echo "  - $img"
        done
        print_status "Please run './build-and-push.sh' first to build the images."
        return 1
    fi
    
    return 0
}

# Function to tag and push version
tag_and_push_version() {
    local version="$1"
    
    print_header "Tagging and pushing version $version..."
    
    for image in "$FRONTEND_IMAGE" "$BACKEND_IMAGE" "$DATABASE_IMAGE"; do
        local latest_image="$REGISTRY_PREFIX/$image:latest"
        local version_image="$REGISTRY_PREFIX/$image:$version"
        
        print_status "Tagging $image as $version..."
        sudo docker tag "$latest_image" "$version_image"
        
        print_status "Pushing $version_image..."
        sudo docker push "$version_image"
        
        print_success "✓ $image:$version pushed successfully"
    done
}

# Function to list existing versions
list_versions() {
    print_header "Existing versions in Docker Hub:"
    echo ""
    
    for image in "$FRONTEND_IMAGE" "$BACKEND_IMAGE" "$DATABASE_IMAGE"; do
        echo -e "${GREEN}$REGISTRY_PREFIX/$image:${NC}"
        echo "  https://hub.docker.com/r/$REGISTRY_PREFIX/$image/tags"
        echo ""
    done
    
    print_status "To see all tags, visit the URLs above or use:"
    echo "  sudo docker hub-tool tag ls $REGISTRY_PREFIX/$FRONTEND_IMAGE"
}

# Function to create release notes template
create_release_notes() {
    local version="$1"
    local notes_file="release-notes-$version.md"
    
    cat > "$SCRIPT_DIR/$notes_file" << EOF
# Gantt Project Release $version

## Changes in this version
- [ ] Frontend updates
- [ ] Backend improvements  
- [ ] Database changes
- [ ] Bug fixes
- [ ] New features

## Docker Images
- \`$REGISTRY_PREFIX/$FRONTEND_IMAGE:$version\`
- \`$REGISTRY_PREFIX/$BACKEND_IMAGE:$version\`
- \`$REGISTRY_PREFIX/$DATABASE_IMAGE:$version\`

## Deployment Command
\`\`\`bash
# Update .env.production file:
VERSION_TAG=$version

# Deploy to VM:
sudo docker compose -f docker-compose.production.yml --env-file .env.production pull
sudo docker compose -f docker-compose.production.yml --env-file .env.production up -d
\`\`\`

## Testing
- [ ] Local testing completed
- [ ] VM deployment tested
- [ ] All services healthy

## Rollback Command (if needed)
\`\`\`bash
# Change VERSION_TAG back to previous version in .env.production
# Then run the deployment command above
\`\`\`
EOF

    print_success "Created release notes template: $notes_file"
    print_status "Please edit the file to document your changes."
}

# Function to show help
show_help() {
    echo "Gantt Project Version Tagging Script"
    echo ""
    echo "Usage: $0 [COMMAND] [VERSION]"
    echo ""
    echo "Commands:"
    echo "  tag <version>     Tag latest images with version and push to Docker Hub"
    echo "  list              List existing versions and Docker Hub URLs"
    echo "  help              Show this help message"
    echo ""
    echo "Version format: vX.Y or vX.Y.Z (e.g., v1.0, v1.1, v2.0.1)"
    echo ""
    echo "Examples:"
    echo "  $0 tag v1.0       # Tag current latest images as v1.0"
    echo "  $0 tag v1.1       # Tag current latest images as v1.1" 
    echo "  $0 list           # Show existing versions"
    echo ""
    echo "Prerequisites:"
    echo "  1. Run './build-and-push.sh' first to build latest images"
    echo "  2. Be logged in to Docker Hub (docker login)"
}

# Main function
main() {
    local command="${1:-}"
    local version="${2:-}"
    
    case "$command" in
        "tag")
            if [ -z "$version" ]; then
                print_error "Version is required for tag command"
                echo ""
                show_help
                exit 1
            fi
            
            if ! validate_version "$version"; then
                exit 1
            fi
            
            if ! check_local_images; then
                exit 1
            fi
            
            print_header "Creating version $version from latest images"
            tag_and_push_version "$version"
            create_release_notes "$version"
            
            echo ""
            print_success "🎉 Version $version created and pushed successfully!"
            print_header "Your images are now available as:"
            echo "  - $REGISTRY_PREFIX/$FRONTEND_IMAGE:$version"
            echo "  - $REGISTRY_PREFIX/$BACKEND_IMAGE:$version"
            echo "  - $REGISTRY_PREFIX/$DATABASE_IMAGE:$version"
            ;;
            
        "list")
            list_versions
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
