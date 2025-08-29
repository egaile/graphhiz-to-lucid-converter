# Graphviz to Lucidchart Converter - Package Summary

## 📦 What's Included

This package contains everything needed to run the Graphviz to Lucidchart Converter locally on any laptop or desktop computer.

### Repository
**GitHub**: https://github.com/egaile/graphhiz-to-lucid-converter

### Quick Installation (For End Users)

#### Easiest Method - Clone and Run:
```bash
git clone https://github.com/egaile/graphhiz-to-lucid-converter.git
cd graphhiz-to-lucid-converter
npm install
npm start
```

#### Alternative - Download Release:
1. Download from [GitHub Releases](https://github.com/egaile/graphhiz-to-lucid-converter/releases)
2. Extract ZIP file
3. Run `start.bat` (Windows) or `./start.sh` (Mac/Linux)
4. Open http://localhost:3000

### Package Contents

```
graphviz-lucid-converter/
├── 📁 docs/                    # Complete documentation
│   ├── USER_GUIDE.md          # How to use the converter
│   ├── INSTALL.md             # Installation instructions
│   └── DOCUMENTATION.md       # Technical details
├── 📁 examples/               # Sample DOT files
│   ├── 01-simple-flowchart.dot
│   ├── 02-network-diagram.dot
│   ├── 03-state-machine.dot
│   ├── 04-organizational-chart.dot
│   └── 05-data-flow.dot
├── 📁 src/                    # Application source code
├── 📁 scripts/                # Packaging scripts
├── 📄 start.sh               # Mac/Linux start script
├── 📄 start.bat              # Windows start script
├── 📄 QUICK_START.md         # 2-minute setup guide
└── 📄 README.md              # Main documentation
```

### System Requirements
- **Node.js**: Version 16 or higher ([Download](https://nodejs.org))
- **Browser**: Chrome, Firefox, Safari, or Edge (latest versions)
- **Memory**: 512MB minimum, 1GB recommended
- **Disk Space**: 100MB

### Key Features
✅ **100% Local Processing** - No data leaves your computer
✅ **Batch Conversion** - Process multiple files at once
✅ **Multiple Formats** - Export to draw.io XML or Lucid Standard Import
✅ **Visual Preview** - See diagrams before converting
✅ **Drag & Drop** - Simple file upload interface
✅ **CLI Support** - Command-line interface for automation

### Technology Stack
- **Parser**: @dagrejs/graphlib-dot (robust DOT parsing)
- **Layout**: @hpcc-js/wasm-graphviz (WebAssembly Graphviz)
- **UI**: React + Vite + Tailwind CSS
- **Export**: XML generation and ZIP packaging
- **Language**: TypeScript for type safety

### How It Works
1. **Parse**: Reads Graphviz DOT files using professional parser
2. **Layout**: Computes positions using real Graphviz engine (WASM)
3. **Convert**: Transforms to Lucidchart-compatible formats
4. **Export**: Packages results for easy import

### Supported DOT Features
- Node shapes, colors, and styles
- Edge labels and styles (solid, dashed, dotted)
- Clusters and subgraphs
- Layout directions (TB, LR, etc.)
- C++ style comments (`//`)
- Quoted identifiers with spaces

### Usage Instructions

#### Web Interface
1. Start the application
2. Drag DOT files into browser
3. Select export format
4. Click "Convert All"
5. Download ZIP file

#### Command Line
```bash
# Single file
gvlc --in diagram.dot --out-format drawio --out ./output

# Multiple files
gvlc --in "*.dot" --out-format lucid --out ./output
```

### Distribution Package

To create a distributable package for sharing:
```bash
./scripts/package.sh
```

This creates:
- `release/graphviz-lucid-converter-v1.0.0.zip` (Windows)
- `release/graphviz-lucid-converter-v1.0.0.tar.gz` (Mac/Linux)

### Support & Documentation

- **Quick Start**: [QUICK_START.md](QUICK_START.md)
- **User Guide**: [docs/USER_GUIDE.md](docs/USER_GUIDE.md)
- **Installation**: [docs/INSTALL.md](docs/INSTALL.md)
- **GitHub Issues**: https://github.com/egaile/graphhiz-to-lucid-converter/issues

### Privacy & Security
- ✅ All processing happens locally
- ✅ No data sent to servers
- ✅ No tracking or analytics
- ✅ Works completely offline
- ✅ Open source code

### License
MIT License - Free to use, modify, and distribute

---

## Sharing Instructions

To share this converter with others:

1. **Direct them to GitHub**:
   ```
   https://github.com/egaile/graphhiz-to-lucid-converter
   ```

2. **Or send them this quick command**:
   ```bash
   git clone https://github.com/egaile/graphhiz-to-lucid-converter.git && cd graphhiz-to-lucid-converter && npm install && npm start
   ```

3. **Or create a release package**:
   ```bash
   ./scripts/package.sh
   # Share the resulting ZIP file
   ```

The application is ready to use and fully documented for easy adoption!