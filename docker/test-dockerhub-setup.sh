#!/bin/bash

# Docker Hub Integration Test Script
# This script validates the Docker Hub setup for Gantt Project

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=== Gantt Project Docker Hub Integration Test ==="
echo ""

echo "1. Checking Docker Hub integration files..."
dockerhub_files=(
    "$SCRIPT_DIR/build-and-push.sh"
    "$SCRIPT_DIR/tag-version.sh"
    "$SCRIPT_DIR/docker-compose.production.yml"
    "$SCRIPT_DIR/.env.production"
    "$SCRIPT_DIR/deploy-to-vm.sh"
)

for file in "${dockerhub_files[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✓ $(basename "$file") exists"
    else
        echo "   ✗ $(basename "$file") missing"
    fi
done

echo ""
echo "2. Checking Docker Hub configuration..."

# Check username configuration
if grep -q "abdfaiyaz" "$SCRIPT_DIR/build-and-push.sh"; then
    echo "   ✓ Docker Hub username (abdfaiyaz) configured"
else
    echo "   ✗ Docker Hub username not configured"
fi

# Check image naming
if grep -q "gantt-frontend\|gantt-backend\|gantt-database" "$SCRIPT_DIR/build-and-push.sh"; then
    echo "   ✓ Image names configured (separate repositories)"
else
    echo "   ✗ Image names not configured"
fi

echo ""
echo "3. Checking script permissions..."
scripts=("build-and-push.sh" "tag-version.sh" "deploy-to-vm.sh")
for script in "${scripts[@]}"; do
    if [ -x "$SCRIPT_DIR/$script" ]; then
        echo "   ✓ $script is executable"
    else
        echo "   ✗ $script is not executable"
    fi
done

echo ""
echo "4. Validating production configuration..."

# Check production compose file
if [ -f "$SCRIPT_DIR/docker-compose.production.yml" ]; then
    if grep -q "abdfaiyaz/gantt-" "$SCRIPT_DIR/docker-compose.production.yml"; then
        echo "   ✓ Production compose uses Docker Hub images"
    else
        echo "   ✗ Production compose not configured for Docker Hub"
    fi
else
    echo "   ✗ Production compose file missing"
fi

# Check environment file
if [ -f "$SCRIPT_DIR/.env.production" ]; then
    if grep -q "REGISTRY_PREFIX=abdfaiyaz" "$SCRIPT_DIR/.env.production"; then
        echo "   ✓ Production environment configured"
    else
        echo "   ✗ Production environment not configured"
    fi
    
    if grep -q "CHANGE_THIS" "$SCRIPT_DIR/.env.production"; then
        echo "   ⚠ Production password needs to be changed"
    fi
else
    echo "   ✗ Production environment file missing"
fi

echo ""
echo "5. Docker and Docker Hub readiness..."

# Check Docker
if command -v docker >/dev/null 2>&1; then
    echo "   ✓ Docker command available"
    
    # Check Docker daemon
    if sudo docker info >/dev/null 2>&1; then
        echo "   ✓ Docker daemon is running"
    else
        echo "   ✗ Docker daemon is not accessible"
    fi
    
    # Check Docker login status
    if sudo docker info 2>/dev/null | grep -q "Username:"; then
        echo "   ✓ Logged in to Docker Hub"
    else
        echo "   ⚠ Not logged in to Docker Hub (run: sudo docker login)"
    fi
else
    echo "   ✗ Docker not available"
fi

echo ""
echo "6. Ready for Docker Hub workflow:"
echo ""
echo "   Step 1: Login to Docker Hub"
echo "   $ sudo docker login"
echo ""
echo "   Step 2: Build and push images"
echo "   $ sudo ./build-and-push.sh"
echo ""
echo "   Step 3: Create version tag (optional)"
echo "   $ sudo ./tag-version.sh tag v1.0"
echo ""
echo "   Step 4: Images will be available as:"
echo "   - docker.io/abdfaiyaz/gantt-frontend:latest"
echo "   - docker.io/abdfaiyaz/gantt-backend:latest"
echo "   - docker.io/abdfaiyaz/gantt-database:latest"

echo ""
echo "7. VM deployment preparation:"
echo ""
echo "   After Docker Hub setup, you'll need:"
echo "   - Azure VM IP address"
echo "   - SSH access to VM"
echo "   - VM firewall configured (ports 22, 80, 443)"
echo ""

echo "=== Docker Hub Integration Test Complete ==="
