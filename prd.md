# Product Requirements Document (PRD) — Graphviz → Lucid Converter

**Owner:** Ed Gaile + AI Pair (you)  
**Version:** 1.0  
**Last updated:** 2025-08-25

## 1. Problem & Goal
Teams keep architecture and workflow diagrams in **Graphviz DOT**. They want those diagrams in **Lucidchart** for collaboration and editing without redrawing by hand.  
**Goal:** A local-first app that converts `.dot` into Lucid‑friendly imports with accurate geometry, labels, and common styles.

## 2. Users & Use Cases
- Software/solutions architects migrating repo diagrams into Lucidchart.
- Engineers exchanging DOT during design but documenting in Lucid.
- Writers/PMs importing DOT assets from docs into Lucid.
- Privacy‑sensitive users who prefer offline/local conversion.

## 3. In-Scope (v1)
- Upload 1..N `.dot` files (drag‑n‑drop + file picker).
- Choose output format:
  - **draw.io XML (mxGraph)** — file import path into Lucid.
  - **Lucid Standard Import** — produce `.lucid` (zip) containing `document.json`.
- Preserve common attributes:
  - Node labels; shapes: rectangle/ellipse/diamond; `style=filled` + `fillcolor`; `color`/`penwidth` (stroke); `fontsize`/`fontname`.
  - Edge labels and dashed style.
  - Layout orientation via `rankdir` (positions reflect layout).
  - Subgraphs/clusters → groups/containers (basic grouping).
- Compute accurate positions using Graphviz layout (WASM).
- Batch conversion with per‑file status and ZIP download.
- Optional: “Import to Lucid” (via API) when a token is provided.

## 4. Out of Scope (v1)
- Full parity of every DOT attribute.
- Complex HTML/table labels (render as plain text fallback).
- Custom shapes beyond basic mappings (map to nearest).

## 5. Functional Requirements
- **R1**: Parse DOT and surface parse errors clearly.
- **R2**: Compute positions via WebAssembly Graphviz (no native install).
- **R3**: Export valid **draw.io XML** that Lucid accepts via draw.io import.
- **R4**: Export valid **`.lucid`** zip with `document.json` conforming to Lucid **Standard Import**.
- **R5**: Batch conversion UI with progress and downloadable ZIP of results.
- **R6**: Preview the first file (render DOT → SVG with WASM) as a dry run.
- **R7 (optional)**: OAuth2 + POST `.lucid` to Lucid’s Import API.

## 6. Non‑Functional Requirements
- Offline‑capable (PWA) for pure file conversion.
- Convert medium diagrams (~100 nodes / 200 edges) in under ~3s on a modern laptop.
- Privacy: Files stay on device unless the user invokes the Lucid API.

## 7. Dependencies (initial)
- **TypeScript** monorepo
- **Parsing**: `graphlib-dot`
- **Layout**: `@hpcc-js/wasm-graphviz` (Graphviz in WebAssembly)
- **Export**: `xmlbuilder2` (draw.io XML), `jszip` (.lucid)
- **UI**: React + Vite + Tailwind
- **CLI**: `yargs`, bundled by `tsup`
- **Tests**: `vitest`

## 8. Attribute Mapping (starter)

| Graphviz | draw.io XML | Lucid Standard Import |
|---|---|---|
| `label` | `mxCell@value` | `shape.text.label` |
| `shape=box/ellipse/diamond` | `shape=rectangle/ellipse/rhombus` | `shape.type` (rectangle/ellipse/decision) |
| `style=filled` + `fillcolor` | `fillColor` | `style.fillColor` |
| `color` | `strokeColor` | `style.strokeColor` |
| `penwidth` | `strokeWidth` | `style.strokeWidth` |
| `fontsize`, `fontname` | `fontSize`, `fontFamily` | `text.style.fontSize/fontFamily` |
| `edge.label` | edge `mxCell@value` | `line.text.label` |
| `edge.style=dashed` | `dashed=1` | `style.pattern="dashed"` |
| `rankdir=LR/TB` | positions reflect layout | positions reflect layout |
| `subgraph`/`cluster` | group | group/container |

## 9. Risks & Mitigations
- **HTML labels / records**: start with text fallback; add richer mapping in v2.
- **Lucid import limits** (JSON size, zip size): chunk large graphs into pages or fall back to draw.io path.
- **Import spec drift**: keep a minimal compatibility test suite and examples.

## 10. Milestones
1. Parser + layout + minimal draw.io export  
2. `.lucid` Standard Import export  
3. Batch UI + preview  
4. OAuth + Import‑to‑Lucid (optional)  
5. Edge‑cases (clusters, dashed, rankdir)  
6. Packaging (PWA/Electron) + docs

## 11. Acceptance Criteria
- A sample DOT with nodes/edges/labels/fillcolor/rankdir successfully imports into Lucid via **both**: draw.io XML and `.lucid` formats, with visually similar geometry.
