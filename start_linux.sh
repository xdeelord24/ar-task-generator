#!/bin/bash

echo "=========================================="
echo "     Starting AR Generator App"
echo "=========================================="

# Check if Node is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js to continue."
    exit 1
fi

# Install dependencies if node_modules missing
if [ ! -d "node_modules" ]; then
    echo ""
    echo "[1/3] Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "Error installing dependencies."
        exit 1
    fi
else
    echo ""
    echo "[1/3] Dependencies found. Skipping install."
fi

# Build
echo ""
echo "[2/3] Building application..."
npm run build
if [ $? -ne 0 ]; then
    echo "Error building application."
    exit 1
fi

# Run
echo ""
echo "[3/3] Starting production server..."
echo ""
echo "Application will be available at http://localhost:4173"
echo "Press Ctrl+C to stop."
echo ""
npm run start:prod
