#!/bin/bash

# Frontend Docker Test Script
# This script validates the frontend containerization setup

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=== Gantt Project Frontend Docker Test ==="
echo ""

echo "1. Checking Frontend Docker files..."
frontend_files=(
    "$SCRIPT_DIR/frontend/Dockerfile"
    "$SCRIPT_DIR/frontend/nginx.conf"
    "$SCRIPT_DIR/frontend/nginx.main.conf"
    "$SCRIPT_DIR/docker-compose.fullstack.yml"
    "$SCRIPT_DIR/fullstack-manager.sh"
)

for file in "${frontend_files[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✓ $(basename "$file") exists"
    else
        echo "   ✗ $(basename "$file") missing"
    fi
done

echo ""
echo "2. Checking React application structure..."

# Check React package.json
if [ -f "$SCRIPT_DIR/../React_Frontend/package.json" ]; then
    echo "   ✓ React package.json exists"
    
    # Check if build script exists
    if grep -q '"build"' "$SCRIPT_DIR/../React_Frontend/package.json"; then
        echo "   ✓ Build script configured"
    else
        echo "   ✗ Build script missing"
    fi
    
    # Check proxy configuration
    if grep -q '"proxy"' "$SCRIPT_DIR/../React_Frontend/package.json"; then
        echo "   ✓ Proxy configuration found"
    else
        echo "   ✗ Proxy configuration missing"
    fi
else
    echo "   ✗ React package.json missing"
fi

# Check React source files
if [ -d "$SCRIPT_DIR/../React_Frontend/src" ]; then
    echo "   ✓ React source directory exists"
else
    echo "   ✗ React source directory missing"
fi

if [ -d "$SCRIPT_DIR/../React_Frontend/public" ]; then
    echo "   ✓ React public directory exists"
else
    echo "   ✗ React public directory missing"
fi

echo ""
echo "3. Validating Nginx configuration..."

# Check nginx.conf syntax (basic validation)
if [ -f "$SCRIPT_DIR/frontend/nginx.conf" ]; then
    # Check for essential proxy configurations
    if grep -q "proxy_pass.*backend:8080" "$SCRIPT_DIR/frontend/nginx.conf"; then
        echo "   ✓ Backend proxy configuration found"
    else
        echo "   ✗ Backend proxy configuration missing"
    fi
    
    if grep -q "location /api/" "$SCRIPT_DIR/frontend/nginx.conf"; then
        echo "   ✓ API route proxy configured"
    else
        echo "   ✗ API route proxy missing"
    fi
    
    if grep -q "try_files.*index.html" "$SCRIPT_DIR/frontend/nginx.conf"; then
        echo "   ✓ SPA routing configuration found"
    else
        echo "   ✗ SPA routing configuration missing"
    fi
else
    echo "   ✗ Nginx configuration file missing"
fi

echo ""
echo "4. Full-stack management script..."
if [ -x "$SCRIPT_DIR/fullstack-manager.sh" ]; then
    echo "   ✓ fullstack-manager.sh is executable"
else
    echo "   ✗ fullstack-manager.sh is not executable"
fi

echo ""
echo "5. Docker Compose validation..."
if command -v docker >/dev/null 2>&1; then
    echo "   ✓ Docker command available"
    if sudo docker compose version >/dev/null 2>&1; then
        echo "   ✓ Docker Compose available"
        
        # Validate compose file syntax
        if sudo docker compose -f "$SCRIPT_DIR/docker-compose.fullstack.yml" config >/dev/null 2>&1; then
            echo "   ✓ Full-stack Docker Compose file syntax is valid"
        else
            echo "   ✗ Full-stack Docker Compose file has syntax errors"
        fi
    else
        echo "   ✗ Docker Compose not available"
    fi
else
    echo "   ✗ Docker not available"
fi

echo ""
echo "6. Environment configuration..."
if [ -f "$SCRIPT_DIR/.env" ]; then
    echo "   ✓ Environment file exists"
    
    # Check for frontend-specific variables
    if grep -q "FRONTEND_" "$SCRIPT_DIR/.env"; then
        echo "   ✓ Frontend environment variables configured"
    else
        echo "   ✗ Frontend environment variables missing"
    fi
else
    echo "   ✗ Environment file missing"
fi

echo ""
echo "7. Next steps to test full stack:"
echo "   1. Ensure Docker daemon is running and accessible"
echo "   2. Run: sudo ./fullstack-manager.sh start"
echo "   3. Wait for all services to start (check with: sudo ./fullstack-manager.sh status)"
echo "   4. Test frontend: curl http://localhost:80"
echo "   5. Test API proxy: curl http://localhost:80/api/holidays"
echo "   6. Test health: curl http://localhost:80/health"
echo "   7. Open browser: http://localhost:80"

echo ""
echo "8. Development workflow:"
echo "   1. For frontend development: sudo ./fullstack-manager.sh dev"
echo "   2. This starts backend + database only"
echo "   3. Run React dev server: cd ../React_Frontend && npm start"
echo "   4. React will proxy API calls to backend via package.json proxy"

echo ""
echo "=== Frontend Test Complete ==="
