# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A local-first converter application that transforms Graphviz DOT files into Lucidchart-compatible formats (draw.io XML and Lucid Standard Import).

## Tech Stack & Dependencies

- **Language**: TypeScript (monorepo structure)
- **Parsing**: `graphlib-dot` for DOT file parsing
- **Layout Engine**: `@hpcc-js/wasm-graphviz` (WebAssembly Graphviz for layout computation)
- **Export Libraries**: 
  - `xmlbuilder2` for draw.io XML generation
  - `jszip` for creating .lucid zip files
- **UI Framework**: React + Vite + Tailwind CSS
- **CLI**: `yargs` with `tsup` bundling
- **Testing**: `vitest`

## Commands

```bash
# Development (React UI)
npm run dev

# Build
npm run build

# Run tests
npm test

# Run a single test
npm test -- path/to/test-file.test.ts

# CLI usage
gvlc --in *.dot --out-format drawio|lucid --out ./out
```

## Architecture

### Core Modules

1. **graph/parseAndLayout.ts**
   - `parseDot(dot: string)` - Parse DOT string using graphlib-dot
   - `layoutDot(dot: string)` - Compute positions via WASM Graphviz
   - Returns normalized model: `{ nodes: {id, x, y, w, h, attrs}, edges: {id, src, dst, points[], label?, attrs} }`

2. **export/drawio.ts**
   - Converts normalized model to mxGraphModel XML
   - Maps Graphviz attributes to draw.io styles

3. **export/lucid.ts**
   - Builds document.json for Lucid Standard Import
   - Creates .lucid ZIP package with proper structure
   - Schema: `{version:1, pages:[{id, title, shapes:[], lines:[]}]}`

4. **integrations/lucidApi.ts** (optional)
   - OAuth2 flow for Lucid API authentication
   - POST to `https://api.lucid.co/documents` with Bearer token
   - Headers: `Lucid-Api-Version: 1`, product: `lucidchart`

### UI Components

- **Dropzone**: Multi-file drag-n-drop (.dot files only)
- **OptionsPanel**: Format selection (draw.io XML vs .lucid)
- **BatchRunner**: Queue management, progress tracking, ZIP download
- **PreviewCanvas**: SVG preview via WASM (first file)

## Attribute Mappings

Key conversions between Graphviz → draw.io XML → Lucid Standard Import:

- `label` → `mxCell@value` → `shape.text.label`
- `shape=box/ellipse/diamond` → `shape=rectangle/ellipse/rhombus` → `shape.type`
- `fillcolor` → `fillColor` → `style.fillColor`
- `color` → `strokeColor` → `style.strokeColor`
- `penwidth` → `strokeWidth` → `style.strokeWidth`
- `fontsize/fontname` → `fontSize/fontFamily` → `text.style.fontSize/fontFamily`
- `edge.style=dashed` → `dashed=1` → `style.pattern="dashed"`
- `subgraph/cluster` → group container → group/container

## Testing Strategy

- Unit tests for all mapping functions
- Fixtures covering:
  - Simple digraph
  - Clusters/subgraphs
  - Dashed edges with labels
  - HTML-like labels (fallback to plain text)
  - Different rankdir orientations (LR/TB)
- XML well-formedness validation
- .lucid structure JSON schema validation
- Snapshot tests for end-to-end conversions

## Privacy & Security

- **Local-first**: All file processing happens on-device by default
- Files never leave the device unless user explicitly opts into Lucid API upload
- No tracking or telemetry
- PWA-capable for offline use