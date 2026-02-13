#!/bin/bash

echo ""
echo "========================================="
echo "  Java Code Arena - Unified Server Setup"
echo "========================================="
echo ""

# Check if Node modules are installed
if [ ! -d "node_modules" ]; then
    echo "Installing Node dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "Error installing npm packages"
        exit 1
    fi
fi

# Build React frontend
echo ""
echo "Building React frontend..."
npm run build
if [ $? -ne 0 ]; then
    echo "Error building React app"
    exit 1
fi

# Check if Python virtual environment exists
if [ ! -d ".venv" ]; then
    echo ""
    echo "Creating Python virtual environment..."
    python3 -m venv .venv
    source .venv/bin/activate
    echo "Installing Python dependencies..."
    pip install -r requirements.txt
else
    source .venv/bin/activate
fi

# Start the server
echo ""
echo "========================================="
echo "Starting Java Code Arena Server"
echo "========================================="
echo "Open your browser: http://localhost:5000"
echo ""
python server.py
