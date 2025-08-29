# Installation & Deployment Guide

## Graphviz to Lucidchart Converter

### Quick Install (For End Users)

```bash
# Download the latest release
curl -L https://github.com/egaile/graphhiz-to-lucid-converter/releases/latest/download/graphviz-lucid-converter.zip -o converter.zip

# Extract
unzip converter.zip
cd graphviz-lucid-converter

# Install and run
npm install
npm start
```

Open http://localhost:3000 in your browser

---

## Table of Contents
1. [System Requirements](#system-requirements)
2. [Installation Methods](#installation-methods)
3. [Quick Start Scripts](#quick-start-scripts)
4. [Configuration](#configuration)
5. [Deployment Options](#deployment-options)
6. [Troubleshooting Installation](#troubleshooting-installation)

## System Requirements

### Minimum Requirements
- **Operating System**: Windows 10+, macOS 10.14+, or Linux (Ubuntu 18.04+)
- **Node.js**: Version 16.0.0 or higher
- **NPM**: Version 7.0.0 or higher
- **Memory**: 512MB RAM available
- **Disk Space**: 100MB free space
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+, or Edge 90+

### Recommended Requirements
- **Node.js**: Version 18.0.0 or higher (LTS)
- **Memory**: 1GB RAM available
- **Disk Space**: 250MB free space
- **Internet**: For initial package installation (not required for usage)

### Checking Your System
```bash
# Check Node.js version
node --version  # Should show v16.0.0 or higher

# Check NPM version
npm --version   # Should show 7.0.0 or higher

# Check available memory (Linux/Mac)
free -h         # Linux
vm_stat         # macOS

# Check available disk space
df -h           # Linux/Mac
```

## Installation Methods

### Method 1: From Release Package (Recommended for Users)

This is the simplest method for end users who want to run the converter locally.

```bash
# 1. Download the release package
# Download graphviz-lucid-converter-v1.0.0.zip from releases

# 2. Extract the package
unzip graphviz-lucid-converter-v1.0.0.zip
cd graphviz-lucid-converter

# 3. Install dependencies
npm install --production

# 4. Start the application
npm start

# The application will open at http://localhost:3000
```

### Method 2: From Source Code (For Developers)

For developers who want to modify or contribute to the project.

```bash
# 1. Clone the repository
git clone https://github.com/egaile/graphhiz-to-lucid-converter.git
cd graphviz-lucid-converter

# 2. Install all dependencies (including dev dependencies)
npm install

# 3. Start development server
npm run dev

# For production build
npm run build
npm run preview
```

### Method 3: Global NPM Installation

Install as a global command-line tool.

```bash
# Install globally
npm install -g graphviz-lucid-converter

# Use the CLI
gvlc --in diagram.dot --out-format drawio --out ./output

# Start the web interface
gvlc-web
```

### Method 4: Docker Container

Run in an isolated container environment.

```bash
# Pull the Docker image
docker pull graphviz-lucid-converter:latest

# Run the container
docker run -p 3000:3000 graphviz-lucid-converter

# With volume mount for file access
docker run -p 3000:3000 -v $(pwd)/files:/app/files graphviz-lucid-converter
```

### Method 5: Standalone Executable (No Node.js Required)

Download pre-built executables that don't require Node.js.

**Windows:**
```powershell
# Download the Windows executable
# graphviz-lucid-converter-win.exe

# Run the application
.\graphviz-lucid-converter-win.exe
```

**macOS:**
```bash
# Download the macOS executable
# graphviz-lucid-converter-macos

# Make it executable
chmod +x graphviz-lucid-converter-macos

# Run the application
./graphviz-lucid-converter-macos
```

**Linux:**
```bash
# Download the Linux executable
# graphviz-lucid-converter-linux

# Make it executable
chmod +x graphviz-lucid-converter-linux

# Run the application
./graphviz-lucid-converter-linux
```

## Quick Start Scripts

### For Windows (start.bat)
```batch
@echo off
echo Starting Graphviz to Lucidchart Converter...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed.
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

REM Check if dependencies are installed
if not exist "node_modules" (
    echo Installing dependencies...
    npm install --production
)

echo Starting application...
npm start

pause
```

### For macOS/Linux (start.sh)
```bash
#!/bin/bash

echo "Starting Graphviz to Lucidchart Converter..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed."
    echo "Please install Node.js from https://nodejs.org"
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install --production
fi

echo "Starting application..."
npm start
```

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000                    # Port for web interface
HOST=localhost              # Host binding

# File Limits
MAX_FILE_SIZE=10485760      # Max file size in bytes (10MB)
MAX_FILES=50                # Maximum files per batch

# Performance
CONCURRENT_CONVERSIONS=5    # Parallel conversion limit
WASM_MEMORY_LIMIT=256       # WASM memory in MB

# Features
ENABLE_CLI=true             # Enable CLI tool
ENABLE_API=false            # Enable REST API (future)
```

### Application Settings

Edit `config.json` for application preferences:

```json
{
  "defaults": {
    "outputFormat": "drawio",
    "outputDirectory": "./output",
    "preserveColors": true,
    "preserveStyles": true,
    "includePreview": true
  },
  "limits": {
    "maxFileSize": 10485760,
    "maxBatchSize": 50,
    "timeout": 30000
  },
  "server": {
    "port": 3000,
    "host": "localhost",
    "cors": false
  }
}
```

## Deployment Options

### Option 1: Local Desktop Application

Best for individual users running on their own machine.

```bash
# Install
npm install --production

# Create desktop shortcut (Windows)
# Right-click start.bat → Create shortcut → Move to desktop

# Create desktop shortcut (macOS)
# Create alias of start.sh in Applications folder

# Create desktop entry (Linux)
cat > ~/.local/share/applications/graphviz-converter.desktop << EOF
[Desktop Entry]
Name=Graphviz Converter
Exec=/path/to/start.sh
Icon=/path/to/icon.png
Type=Application
Categories=Graphics;
EOF
```

### Option 2: Local Network Server

Share the converter on your local network.

```bash
# Configure for network access
export HOST=0.0.0.0
export PORT=3000

# Start the server
npm start

# Access from other machines
# http://YOUR_IP_ADDRESS:3000
```

### Option 3: Corporate Intranet

Deploy on internal servers for team access.

```bash
# Install on server
ssh user@server
cd /var/www
git clone <repository>
cd graphviz-lucid-converter
npm install --production

# Setup as systemd service (Linux)
sudo cat > /etc/systemd/system/graphviz-converter.service << EOF
[Unit]
Description=Graphviz to Lucidchart Converter
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/graphviz-lucid-converter
ExecStart=/usr/bin/npm start
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl enable graphviz-converter
sudo systemctl start graphviz-converter
```

### Option 4: Cloud Deployment

Deploy to cloud platforms (Note: Still processes locally in browser).

**Vercel:**
```bash
npm install -g vercel
vercel
```

**Netlify:**
```bash
npm run build
netlify deploy --dir=dist
```

**GitHub Pages:**
```bash
npm run build
gh-pages -d dist
```

### Option 5: Electron Desktop App

Package as a native desktop application.

```bash
# Install Electron
npm install --save-dev electron electron-builder

# Build for current platform
npm run electron:build

# Output in dist/ folder
# - Windows: .exe installer
# - macOS: .dmg file
# - Linux: .AppImage
```

## Troubleshooting Installation

### Common Issues and Solutions

#### Node.js Not Found
```bash
# Error: 'node' is not recognized

# Solution: Install Node.js
# Windows: Download from https://nodejs.org
# macOS: brew install node
# Linux: sudo apt install nodejs npm
```

#### Permission Denied (npm install)
```bash
# Error: EACCES: permission denied

# Solution 1: Fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Solution 2: Use npx
npx graphviz-lucid-converter
```

#### Port Already in Use
```bash
# Error: EADDRINUSE: address already in use :::3000

# Solution 1: Use different port
PORT=3001 npm start

# Solution 2: Kill process using port
# Linux/Mac:
lsof -i :3000
kill -9 <PID>

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

#### WASM Loading Failed
```bash
# Error: Failed to load WASM module

# Solution 1: Clear browser cache
# Chrome: Ctrl+Shift+Del → Clear data

# Solution 2: Check browser compatibility
# Update to latest browser version

# Solution 3: Serve with proper MIME types
# Add to web server config:
# application/wasm wasm
```

#### Out of Memory
```bash
# Error: JavaScript heap out of memory

# Solution: Increase Node memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm start
```

### Platform-Specific Issues

#### Windows
- **Long Path Issues**: Enable long paths in Windows 10
  ```powershell
  New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
  ```

- **Execution Policy**: Allow script execution
  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```

#### macOS
- **Gatekeeper Issues**: Allow unsigned apps
  ```bash
  xattr -d com.apple.quarantine graphviz-lucid-converter-macos
  ```

- **Port Access**: Allow network access in Firewall settings

#### Linux
- **Missing Libraries**: Install required packages
  ```bash
  sudo apt update
  sudo apt install build-essential
  ```

- **SELinux**: Configure for web access
  ```bash
  sudo setsebool -P httpd_can_network_connect 1
  ```

### Getting Help

If you encounter issues not covered here:

1. **Check Logs**
   ```bash
   npm start 2>&1 | tee app.log
   ```

2. **Verify Installation**
   ```bash
   npm run verify-install
   ```

3. **Report Issues**
   - Include error messages
   - System information
   - Steps to reproduce

4. **Community Support**
   - GitHub Issues
   - Discussion Forum
   - Stack Overflow tag: `graphviz-lucid-converter`