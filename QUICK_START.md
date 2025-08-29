# Quick Start Guide

## Graphviz to Lucidchart Converter

### 🚀 Fastest Way to Start (2 minutes)

#### Option 1: Clone and Run
```bash
# Clone the repository
git clone https://github.com/egaile/graphhiz-to-lucid-converter.git
cd graphhiz-to-lucid-converter

# Install and start
npm install
npm start
```
Open http://localhost:3000 in your browser

#### Option 2: Download Release
1. Download the latest release from [GitHub Releases](https://github.com/egaile/graphhiz-to-lucid-converter/releases)
2. Extract the ZIP file
3. Double-click `start.bat` (Windows) or run `./start.sh` (Mac/Linux)
4. Open http://localhost:3000 in your browser

### 📋 Requirements
- Node.js 16+ ([Download](https://nodejs.org))
- Modern web browser

### 🎯 How to Use
1. **Upload**: Drag and drop your DOT files
2. **Choose Format**: Select draw.io XML or Lucid Standard Import
3. **Convert**: Click "Convert All"
4. **Download**: Get your converted files as ZIP

### 📁 Example Files
Try the converter with sample files in the `examples/` folder:
- `01-simple-flowchart.dot` - Basic flowchart
- `02-network-diagram.dot` - Network architecture
- `03-state-machine.dot` - State transitions
- `04-organizational-chart.dot` - Org chart with clusters
- `05-data-flow.dot` - Data pipeline

### 🔧 Command Line Usage
```bash
# Convert single file
gvlc --in diagram.dot --out-format drawio --out ./output

# Convert multiple files
gvlc --in "*.dot" --out-format lucid --out ./output
```

### 📚 Full Documentation
- [User Guide](docs/USER_GUIDE.md) - Detailed usage instructions
- [Installation Guide](docs/INSTALL.md) - All installation methods
- [Technical Docs](docs/DOCUMENTATION.md) - Architecture details

### ❓ Need Help?
- Check the [User Guide](docs/USER_GUIDE.md#troubleshooting)
- Report issues on [GitHub](https://github.com/egaile/graphhiz-to-lucid-converter/issues)

### 🔒 Privacy
All processing happens locally in your browser. No data is sent to any server.