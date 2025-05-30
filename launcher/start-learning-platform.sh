#!/bin/bash

# Visual Learning Platform Launcher for Mac
# This script starts the backend server and opens the frontend

echo "🚀 Starting Visual Learning Platform..."

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

# Function to kill process on port
kill_port() {
    local port=$1
    local pid=$(lsof -ti :$port)
    if [ ! -z "$pid" ]; then
        echo -e "${YELLOW}Killing existing process on port $port...${NC}"
        kill -9 $pid 2>/dev/null
        sleep 2
    fi
}

echo -e "${BLUE}📍 Project directory: $PROJECT_DIR${NC}"

# Check if Node.js is installed
if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js from https://nodejs.org/${NC}"
    exit 1
fi

# Check if npm is installed
if ! command_exists npm; then
    echo -e "${RED}❌ npm is not installed. Please install npm.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js and npm are installed${NC}"

# Navigate to backend directory
cd "$PROJECT_DIR/backend"

# Check if backend dependencies are installed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install backend dependencies${NC}"
        exit 1
    fi
fi

# Kill any existing processes on ports 3000 and 3001
kill_port 3000
kill_port 3001

# Start the backend server in background
echo -e "${BLUE}🔧 Starting backend server on port 3001...${NC}"
npm start &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Check if backend started successfully
if port_in_use 3001; then
    echo -e "${GREEN}✅ Backend server started successfully${NC}"
else
    echo -e "${RED}❌ Failed to start backend server${NC}"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Navigate to frontend directory
cd "$PROJECT_DIR"

# Check if frontend dependencies are installed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install frontend dependencies${NC}"
        kill $BACKEND_PID 2>/dev/null
        exit 1
    fi
fi

# Start the frontend development server
echo -e "${BLUE}🌐 Starting frontend development server on port 3000...${NC}"
npm run dev &
FRONTEND_PID=$!

# Wait for frontend to start
sleep 5

# Check if frontend started successfully
if port_in_use 3000; then
    echo -e "${GREEN}✅ Frontend server started successfully${NC}"
else
    echo -e "${RED}❌ Failed to start frontend server${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 1
fi

# Open the application in default browser
echo -e "${BLUE}🌐 Opening Visual Learning Platform in browser...${NC}"
sleep 2
open "http://localhost:3000"

echo ""
echo -e "${GREEN}🎉 Visual Learning Platform is now running!${NC}"
echo ""
echo -e "${BLUE}📱 Frontend: http://localhost:3000${NC}"
echo -e "${BLUE}🔧 Backend:  http://localhost:3001${NC}"
echo ""
echo -e "${YELLOW}💡 Tips:${NC}"
echo -e "   • Your PDFs will be saved permanently in the backend/uploads folder"
echo -e "   • Your app state is saved in backend/data/app-state.json"
echo -e "   • To stop the servers, press Ctrl+C in this terminal"
echo ""
echo -e "${GREEN}📚 Ready to start learning! Upload your PDFs and they'll persist across sessions.${NC}"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Shutting down Visual Learning Platform...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}✅ Servers stopped. Goodbye!${NC}"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Keep the script running
echo -e "${BLUE}🔄 Servers are running. Press Ctrl+C to stop.${NC}"
wait
