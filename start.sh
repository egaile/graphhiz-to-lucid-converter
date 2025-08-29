#!/bin/bash

# Graphviz to Lucidchart Converter - Start Script
# Quick start script for Unix-like systems (macOS, Linux)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ASCII Art Header
echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════╗"
echo "║   Graphviz to Lucidchart Converter             ║"
echo "║   Local-first DOT file conversion tool         ║"
echo "╚════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check Node.js installation
echo -e "${YELLOW}Checking requirements...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js is not installed${NC}"
    echo ""
    echo "Please install Node.js (version 16 or higher) from:"
    echo "  https://nodejs.org"
    echo ""
    echo "Or use your package manager:"
    echo "  macOS:  brew install node"
    echo "  Ubuntu: sudo apt install nodejs npm"
    echo "  Fedora: sudo dnf install nodejs npm"
    exit 1
fi

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo -e "${RED}✗ Node.js version is too old${NC}"
    echo "  Current: $(node -v)"
    echo "  Required: v16.0.0 or higher"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node -v) detected${NC}"
echo -e "${GREEN}✓ npm $(npm -v) detected${NC}"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo ""
    echo -e "${YELLOW}Installing dependencies...${NC}"
    echo "This may take a few minutes on first run."
    npm install --production
    if [ $? -ne 0 ]; then
        echo -e "${RED}✗ Failed to install dependencies${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Dependencies already installed${NC}"
fi

# Check if development server is already running
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo ""
    echo -e "${YELLOW}⚠ Port 3000 is already in use${NC}"
    echo "Another instance might be running or another app is using this port."
    echo ""
    read -p "Do you want to use a different port? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter port number (e.g., 3001): " PORT
        export PORT=$PORT
        echo -e "${BLUE}Using port $PORT${NC}"
    else
        echo "Please stop the other application first."
        exit 1
    fi
fi

# Start the application
echo ""
echo -e "${GREEN}Starting Graphviz to Lucidchart Converter...${NC}"
echo "────────────────────────────────────────────────"
echo ""
echo -e "${BLUE}Web Interface:${NC} http://localhost:${PORT:-3000}"
echo -e "${BLUE}Status:${NC} Starting server..."
echo ""
echo "Tips:"
echo "  • Drag and drop DOT files into the browser"
echo "  • Choose export format (draw.io or Lucid)"
echo "  • Convert and download results as ZIP"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
echo "────────────────────────────────────────────────"
echo ""

# Start the server
if [ -f "dist/index.html" ]; then
    # Production mode
    npm run preview -- --port ${PORT:-3000} --host localhost
else
    # Development mode
    npm run dev -- --port ${PORT:-3000} --host localhost
fi