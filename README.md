# Graphviz to Lucidchart Converter

A privacy-first, local converter for transforming Graphviz DOT files into Lucidchart-compatible formats.

## Features

- **Local Processing**: All conversions happen in your browser/device - no data leaves your machine
- **Multiple Export Formats**:
  - draw.io XML (import via draw.io integration in Lucidchart)
  - Lucid Standard Import (.lucid zip format)
- **Batch Processing**: Convert multiple DOT files at once
- **Visual Preview**: See your diagrams before converting
- **Preserves Attributes**:
  - Node shapes, labels, and styles
  - Edge labels and styles (solid, dashed, dotted)
  - Colors (fill and stroke)
  - Font properties
  - Clusters/subgraphs as groups
  - Layout orientation (rankdir)

## Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## Usage

### Web Interface

1. Start the development server: `npm run dev`
2. Open http://localhost:3000 in your browser
3. Drag and drop your DOT files or click to select
4. Choose your export format (draw.io XML or Lucid Standard Import)
5. Click "Convert All" to process files
6. Download the ZIP file with converted results

### Command Line Interface

```bash
# Convert single file to draw.io format
gvlc --in diagram.dot --out-format drawio --out ./output

# Convert multiple files to Lucid format
gvlc --in "*.dot" --out-format lucid --out ./output

# Convert with glob patterns
gvlc --in "diagrams/**/*.dot" --out-format drawio --out ./converted

# Enable verbose output
gvlc --in diagram.dot --out-format lucid --out ./output --verbose
```

### CLI Options

- `--in`: Input DOT file(s) or glob pattern (required)
- `--out-format`: Output format - `drawio` or `lucid` (default: drawio)
- `--out`: Output directory (default: ./out)
- `--verbose`: Enable verbose output
- `--help`: Show help message
- `--version`: Show version

## Supported Graphviz Attributes

### Node Attributes
- `label` - Node text
- `shape` - box, ellipse, diamond, cylinder, etc.
- `style` - filled, etc.
- `fillcolor` - Background color
- `color` - Border color
- `penwidth` - Border width
- `fontsize` - Text size
- `fontname` - Font family

### Edge Attributes
- `label` - Edge text
- `style` - solid, dashed, dotted
- `color` - Line color
- `penwidth` - Line width
- `fontsize` - Label text size
- `fontname` - Label font family

### Graph Attributes
- `rankdir` - TB, BT, LR, RL (layout direction)
- `bgcolor` - Background color
- Subgraphs/clusters - Converted to groups

## Development

### Project Structure

```
src/
├── graph/          # DOT parsing and layout
├── export/         # Export to different formats
├── ui/             # React components
├── cli/            # Command-line interface
├── types/          # TypeScript definitions
└── utils/          # Utility functions

tests/
├── fixtures/       # Sample DOT files
└── ...            # Test suites
```

### Testing

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Type checking
npm run typecheck

# Linting
npm run lint
```

## Privacy & Security

- **100% Local**: All file processing happens on your device
- **No Tracking**: No analytics or telemetry
- **No External APIs**: Works completely offline (unless using optional Lucid API upload)
- **Open Source**: Full transparency of how your data is handled

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.