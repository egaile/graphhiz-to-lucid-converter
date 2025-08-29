# Technical Documentation

## Graphviz to Lucidchart Converter

### Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Module Architecture](#module-architecture)
4. [Data Flow](#data-flow)
5. [Key Components](#key-components)
6. [Development Workflow](#development-workflow)
7. [Testing Strategy](#testing-strategy)
8. [Performance Considerations](#performance-considerations)

---

## Architecture Overview

The Graphviz to Lucidchart Converter is a **local-first, privacy-focused** web application that transforms Graphviz DOT files into formats compatible with Lucidchart. The application operates entirely in the browser using WebAssembly for layout computation, ensuring no data leaves the user's device.

### Core Design Principles
- **Privacy First**: All processing happens locally in the browser
- **No Backend Required**: Fully client-side application
- **Multiple Export Formats**: Supports both draw.io XML and Lucid Standard Import
- **Batch Processing**: Handle multiple files efficiently
- **Type Safety**: Full TypeScript implementation

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     User Interface                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │ Dropzone │  │ Options  │  │  Batch   │  │Preview │ │
│  │          │  │  Panel   │  │  Runner  │  │ Canvas │ │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘ │
└─────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────┐
│                    Core Processing                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ DOT Parser   │→ │Layout Engine │→ │  Exporters   │ │
│  │(graphlib-dot)│  │(WASM Graphviz)│  │(XML/Lucid)   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Technology Stack

### Core Technologies
- **TypeScript** (5.3+): Type-safe development
- **React** (18.2+): UI component framework
- **Vite** (5.0+): Build tool and dev server
- **Tailwind CSS** (3.4+): Utility-first CSS framework

### Processing Libraries
- **@dagrejs/graphlib-dot**: DOT file parsing
- **@hpcc-js/wasm-graphviz**: WebAssembly Graphviz for layout computation
- **xmlbuilder2**: XML generation for draw.io format
- **jszip**: Creating .lucid ZIP archives

### Development Tools
- **Vitest**: Unit and integration testing
- **ESLint**: Code linting
- **tsup**: CLI bundling
- **yargs**: CLI argument parsing

## Module Architecture

### 1. Graph Module (`src/graph/`)
**Purpose**: Parse DOT files and compute layout positions

#### `parseAndLayout.ts`
- **parseDot()**: Parses DOT string using graphlib-dot
  - Preprocesses C++ style comments (`//`)
  - Handles quoted identifiers
  - Extracts node, edge, and graph attributes
- **layoutDot()**: Computes positions using WASM Graphviz
  - Generates JSON layout data
  - Maps coordinates to normalized format
- **parseAndLayoutDot()**: Combines parsing and layout
  - Merges parsed attributes with layout positions
  - Ensures all nodes are included

### 2. Export Module (`src/export/`)
**Purpose**: Convert normalized graph to target formats

#### `drawio.ts`
- **exportToDrawIo()**: Generates draw.io XML (mxGraph format)
  - Maps Graphviz attributes to draw.io styles
  - Handles shape conversions
  - Preserves colors and styles
  - Supports clusters as groups

#### `lucid.ts`
- **exportToLucid()**: Creates Lucid Standard Import format
  - Generates document.json structure
  - Maps to Lucid shape types
  - Handles text styling
- **createLucidZip()**: Packages as .lucid file
  - Creates ZIP with proper structure
  - Includes manifest.json

### 3. UI Components (`src/ui/components/`)

#### `Dropzone.tsx`
- Drag-and-drop file upload
- File type validation (.dot, .gv)
- Multiple file selection

#### `BatchRunner.tsx`
- Manages conversion queue
- Tracks per-file status
- Handles bulk download as ZIP
- Error handling and retry

#### `PreviewCanvas.tsx`
- Real-time DOT preview using WASM
- SVG rendering
- Error display

#### `OptionsPanel.tsx`
- Export format selection
- Feature toggles
- Conversion settings

### 4. CLI Module (`src/cli/`)
**Purpose**: Command-line interface for batch processing

- Glob pattern support
- Multiple input files
- Output directory management
- Progress reporting

## Data Flow

### Conversion Pipeline

```
1. Input Stage
   DOT File → Read Content → Validate Format

2. Parsing Stage
   Raw DOT → Preprocess Comments → Parse with graphlib-dot → Extract Attributes

3. Layout Stage
   Parsed Graph → WASM Graphviz → JSON Layout → Position Mapping

4. Export Stage
   Normalized Graph → Format Selection → Generate Output → Package Result

5. Output Stage
   Converted Files → ZIP Archive → Download
```

### Data Structures

#### NormalizedGraph
```typescript
interface NormalizedGraph {
  nodes: GraphNode[];      // Positioned nodes with attributes
  edges: GraphEdge[];      // Edges with waypoints
  attrs: GraphAttributes;  // Global graph properties
  clusters: Map<...>;      // Subgraph/cluster information
}
```

#### GraphNode
```typescript
interface GraphNode {
  id: string;
  x: number;              // Computed position
  y: number;
  width: number;
  height: number;
  attrs: NodeAttributes;  // Shape, color, label, etc.
  cluster?: string;       // Parent cluster ID
}
```

## Key Components

### Parser Enhancement
The parser includes preprocessing to handle:
- C++ style comments (`//`)
- Quoted identifiers with spaces
- Special characters in node names
- Complex attribute syntax

### Layout Integration
- Uses Graphviz's DOT layout algorithm via WebAssembly
- Preserves original graph structure
- Supports multiple layout directions (TB, LR, etc.)

### Attribute Mapping

| Graphviz Attribute | draw.io Style | Lucid Property |
|-------------------|---------------|----------------|
| `label` | `value` | `text.label` |
| `shape` | `shape` | `type` |
| `fillcolor` | `fillColor` | `style.fillColor` |
| `color` | `strokeColor` | `style.strokeColor` |
| `penwidth` | `strokeWidth` | `style.strokeWidth` |
| `style=dashed` | `dashed=1` | `pattern="dashed"` |

## Development Workflow

### Setup
```bash
# Clone repository
git clone <repo-url>
cd graphviz-lucid-converter

# Install dependencies
npm install

# Start development server
npm run dev
```

### Building
```bash
# Type checking
npm run typecheck

# Run tests
npm test

# Build for production
npm run build

# Build CLI tool
npm run build:cli
```

### Project Structure
```
src/
├── graph/          # DOT parsing and layout
├── export/         # Format converters
├── ui/            # React components
├── cli/           # Command-line interface
├── types/         # TypeScript definitions
└── utils/         # Utility functions

tests/
├── fixtures/      # Sample DOT files
├── graph/        # Parser tests
└── export/       # Converter tests
```

## Testing Strategy

### Unit Tests
- Parser functions with various DOT syntax
- Layout computation verification
- Export format validation
- Attribute mapping correctness

### Integration Tests
- End-to-end conversion pipeline
- Multiple file batch processing
- Error handling scenarios

### Test Coverage
- Complex DOT syntax (quotes, comments)
- Edge cases (empty graphs, invalid syntax)
- Large file performance
- Format compliance validation

### Running Tests
```bash
# Run all tests
npm test

# Run with UI
npm run test:ui

# Run specific test file
npm test -- parseAndLayout.test.ts

# Coverage report
npm test -- --coverage
```

## Performance Considerations

### Optimization Strategies
1. **WASM Initialization**: Single instance reused across conversions
2. **Batch Processing**: Parallel file processing where possible
3. **Memory Management**: Cleanup after each conversion
4. **Lazy Loading**: Components loaded on demand

### Performance Metrics
- Small graphs (<50 nodes): <1 second
- Medium graphs (100-200 nodes): 1-3 seconds
- Large graphs (500+ nodes): 3-10 seconds

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Memory Requirements
- Minimum: 512MB available RAM
- Recommended: 1GB+ for large graphs
- WASM module: ~2MB download