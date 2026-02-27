#!/bin/bash

echo ""
echo "========================================="
echo "  Java Code Arena - Unified Server Setup"
echo "========================================="
echo ""

# Check if Node modules are installed
if [ ! -d "frontend/node_modules" ]; then
    echo "Installing Node dependencies..."
    cd frontend && npm install && cd ..
    if [ $? -ne 0 ]; then
        echo "Error installing npm packages"
        exit 1
    fi
fi

# Build React frontend
echo ""
echo "Building React frontend..."
cd frontend && npm run build && cd ..
if [ $? -ne 0 ]; then
    echo "Error building React app"
    exit 1
fi

# Check if Python virtual environment exists
if [ ! -d "backend/.venv" ]; then
    echo ""
    echo "Creating Python virtual environment..."
    cd backend
    python3 -m venv .venv
    source .venv/bin/activate
    echo "Installing Python dependencies..."
    pip install -r requirements.txt
    cd ..
else
    source backend/.venv/bin/activate
fi

# Start the server
echo ""
echo "========================================="
echo "Starting Java Code Arena Server"
echo "========================================="
echo "Open your browser: http://localhost:5000"
echo ""
cd backend && python server.py
