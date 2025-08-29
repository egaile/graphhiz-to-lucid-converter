#!/bin/bash

# Packaging Script for Graphviz to Lucidchart Converter
# Creates a distributable package for end users

set -e  # Exit on error

echo "================================================"
echo "Graphviz to Lucidchart Converter - Packaging Script"
echo "================================================"
echo ""

# Configuration
VERSION="1.0.0"
PACKAGE_NAME="graphviz-lucid-converter"
BUILD_DIR="dist"
RELEASE_DIR="release"
PACKAGE_DIR="$RELEASE_DIR/$PACKAGE_NAME"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
    exit 1
}

print_info() {
    echo -e "${YELLOW}→${NC} $1"
}

# Check prerequisites
print_info "Checking prerequisites..."

if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
fi

if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
fi

print_success "Prerequisites checked"

# Clean previous builds
print_info "Cleaning previous builds..."
rm -rf $BUILD_DIR $RELEASE_DIR
print_success "Cleaned previous builds"

# Install dependencies
print_info "Installing dependencies..."
npm install
print_success "Dependencies installed"

# Run tests
print_info "Running tests..."
npm test -- --run
print_success "All tests passed"

# Build the application
print_info "Building application..."
npm run build
print_success "Application built"

# Create release directory structure
print_info "Creating package structure..."
mkdir -p $PACKAGE_DIR
mkdir -p $PACKAGE_DIR/docs
mkdir -p $PACKAGE_DIR/examples
mkdir -p $PACKAGE_DIR/scripts

# Copy built files
print_info "Copying application files..."
cp -r $BUILD_DIR/* $PACKAGE_DIR/ 2>/dev/null || true
cp package.json $PACKAGE_DIR/
cp package-lock.json $PACKAGE_DIR/

# Create production package.json
print_info "Creating production package.json..."
node -e "
const pkg = require('./package.json');
delete pkg.devDependencies;
pkg.scripts = {
  start: 'vite preview --port 3000 --host localhost',
  cli: 'node dist/cli/index.js'
};
require('fs').writeFileSync('$PACKAGE_DIR/package.json', JSON.stringify(pkg, null, 2));
"
print_success "Production package.json created"

# Copy documentation
print_info "Copying documentation..."
cp README.md $PACKAGE_DIR/
cp LICENSE $PACKAGE_DIR/ 2>/dev/null || echo "No LICENSE file found"
cp -r docs/* $PACKAGE_DIR/docs/ 2>/dev/null || true
print_success "Documentation copied"

# Copy examples
print_info "Copying example files..."
cp -r examples/* $PACKAGE_DIR/examples/ 2>/dev/null || true
cp tests/fixtures/*.dot $PACKAGE_DIR/examples/ 2>/dev/null || true
print_success "Examples copied"

# Create start scripts
print_info "Creating start scripts..."

# Windows start script
cat > $PACKAGE_DIR/start.bat << 'EOF'
@echo off
echo ================================================
echo Graphviz to Lucidchart Converter
echo ================================================
echo.

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed.
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

REM Install dependencies if needed
if not exist "node_modules" (
    echo Installing dependencies...
    npm install --production
)

echo Starting application...
echo Open http://localhost:3000 in your browser
echo Press Ctrl+C to stop
echo.
npm start
pause
EOF

# Unix start script
cat > $PACKAGE_DIR/start.sh << 'EOF'
#!/bin/bash

echo "================================================"
echo "Graphviz to Lucidchart Converter"
echo "================================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed."
    echo "Please install Node.js from https://nodejs.org"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install --production
fi

echo "Starting application..."
echo "Open http://localhost:3000 in your browser"
echo "Press Ctrl+C to stop"
echo ""
npm start
EOF

chmod +x $PACKAGE_DIR/start.sh
print_success "Start scripts created"

# Create INSTALL.txt for quick reference
print_info "Creating quick install guide..."
cat > $PACKAGE_DIR/INSTALL.txt << 'EOF'
GRAPHVIZ TO LUCIDCHART CONVERTER - QUICK INSTALL
================================================

REQUIREMENTS:
- Node.js 16+ (download from https://nodejs.org)
- Modern web browser (Chrome, Firefox, Safari, or Edge)

INSTALLATION:
1. Extract this folder to your desired location
2. Open terminal/command prompt in this folder
3. Run the start script:
   - Windows: double-click start.bat
   - Mac/Linux: ./start.sh
4. Open http://localhost:3000 in your browser

FIRST TIME SETUP:
The start script will automatically:
- Check for Node.js
- Install required packages
- Start the application

USAGE:
- Drag and drop DOT files into the web interface
- Select export format (draw.io or Lucid)
- Click "Convert All" and download results

CLI USAGE:
npm run cli -- --in file.dot --out-format drawio --out ./output

SUPPORT:
See docs/ folder for detailed documentation
EOF
print_success "Quick install guide created"

# Create VERSION file
echo $VERSION > $PACKAGE_DIR/VERSION

# Create ZIP archive
print_info "Creating ZIP archive..."
cd $RELEASE_DIR
zip -r "$PACKAGE_NAME-v$VERSION.zip" $PACKAGE_NAME -q
cd ..
print_success "ZIP archive created: $RELEASE_DIR/$PACKAGE_NAME-v$VERSION.zip"

# Create TAR.GZ archive
print_info "Creating TAR.GZ archive..."
cd $RELEASE_DIR
tar -czf "$PACKAGE_NAME-v$VERSION.tar.gz" $PACKAGE_NAME
cd ..
print_success "TAR.GZ archive created: $RELEASE_DIR/$PACKAGE_NAME-v$VERSION.tar.gz"

# Calculate package size
ZIP_SIZE=$(du -h "$RELEASE_DIR/$PACKAGE_NAME-v$VERSION.zip" | cut -f1)
TAR_SIZE=$(du -h "$RELEASE_DIR/$PACKAGE_NAME-v$VERSION.tar.gz" | cut -f1)

# Summary
echo ""
echo "================================================"
echo -e "${GREEN}Package created successfully!${NC}"
echo "================================================"
echo ""
echo "Package Information:"
echo "  Version: $VERSION"
echo "  ZIP Size: $ZIP_SIZE"
echo "  TAR.GZ Size: $TAR_SIZE"
echo ""
echo "Archives created:"
echo "  - $RELEASE_DIR/$PACKAGE_NAME-v$VERSION.zip (Windows)"
echo "  - $RELEASE_DIR/$PACKAGE_NAME-v$VERSION.tar.gz (Mac/Linux)"
echo ""
echo "Distribution contents:"
echo "  - Built application"
echo "  - Documentation"
echo "  - Example files"
echo "  - Start scripts"
echo "  - Quick install guide"
echo ""
echo "To test the package:"
echo "  1. cd $PACKAGE_DIR"
echo "  2. ./start.sh (or start.bat on Windows)"
echo ""
echo "To distribute:"
echo "  Upload the archives to your release platform"
echo ""