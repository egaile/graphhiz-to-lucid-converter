Vibe-coding prompts for Cursor (drop-in)

Use these as system or preamble prompts in Cursor to keep the coding sessions on-rails.

1) Guardrails (paste once per session)

You are building a Graphviz→Lucid Converter. Requirements:

Input: one or more .dot files.

Parse with graphlib-dot. Compute layout with @hpcc-js/wasm-graphviz (browser/Node).

Exporters: (A) draw.io mxGraph XML; (B) Lucid Standard Import .lucid (zip) containing document.json.

Preserve labels, basic shapes, fill/stroke, fonts, edge labels, dashed lines, rankdir; map clusters→groups.

Provide a React UI with drag-n-drop, batch processing, progress toasts, and ZIP download.

Add unit tests for mapping functions; add golden tests for fixtures.

Do not send files off device unless calling Lucid’s API explicitly.

2) Build the parser + layout

Generate a TypeScript module graph/parseAndLayout.ts that:

parseDot(dot: string) → graph (nodes, edges, attrs). Use graphlib-dot.

layoutDot(dot: string) → positions for nodes/edges using @hpcc-js/wasm-graphviz. Return a normalized model: { nodes: {id, x, y, w, h, attrs}, edges: {id, src, dst, points[], label?, attrs} }.

Include error handling and a small set of unit tests with a sample DOT.

3) draw.io XML exporter

Create export/drawio.ts that converts the normalized model into an mxGraphModel XML string. Implement helpers for style mapping (fillColor, strokeColor, fontSize, dashed). Include a test that writes a sample file and checks required tags exist.

4) Lucid Standard Import exporter

Create export/lucid.ts that builds a document.json object with {version:1, pages:[{id, title, shapes:[], lines:[]}]} }.

Map each node to a shape with position/size and text.

Map each edge to a line with waypoints and optional label.

Add a small zipping utility to create a .lucid ZIP (with correct file name and root layout).

Include a JSON schema validation test for the produced document.json.

5) React UI

Scaffolding: Vite + React + Tailwind. Components:

Dropzone (multi-file, only .dot)

OptionsPanel (choose draw.io XML vs .lucid)

BatchRunner (queue, progress, error surface, download ZIP button)

PreviewCanvas (optional: render Graphviz SVG via WASM to preview the first file)
Provide a top-level App wiring with state management (Zustand or React Context).

6) Lucid API upload (optional feature flag)

Add a service integrations/lucidApi.ts that takes a .lucid Blob and POSTs to https://api.lucid.co/documents with product=lucidchart, headers Authorization: Bearer ... and Lucid-Api-Version: 1. Show success, open the returned doc URL. Include a “dry run” mode that only validates .lucid size and structure. 


7) Fixtures & tests

Add DOT fixtures:

simple digraph,

cluster/subgraph,

dashed edges + labels,

HTML-like label (fallback to plain),

rankdir=LR.
Write tests: mappings, XML well-formedness, .lucid structure, and a snapshot test on a small end-to-end conversion.