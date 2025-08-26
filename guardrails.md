# Vibe Coding Guardrails — Graphviz → Lucid Converter

Paste this at the start of each coding session (Cursor “System” or “Goals”):

- Build a **local-first** converter for Graphviz `.dot` → (A) draw.io XML, (B) Lucid Standard Import `.lucid`.
- Use **TypeScript** across repo.
- **Parsing**: `graphlib-dot`; **Layout**: `@hpcc-js/wasm-graphviz`.
- **Export**: `xmlbuilder2` (draw.io), `jszip` (.lucid).
- Preserve: labels, basic shapes (rect/ellipse/diamond), fill/stroke colors, penwidth, font size/name, edge labels, dashed edges, `rankdir` orientation; clusters → groups.
- Provide React UI: drag-n-drop multiple `.dot`, progress toasts, preview of first file (SVG), and ZIP download for results.
- Provide CLI wrapper: `gvlc --in *.dot --out-format drawio|lucid --out ./out`.
- Unit tests for mapping helpers; fixtures cover: simple graph, clusters, dashed edges + labels, rankdir=LR, HTML-like labels (text fallback).
- Never upload files unless user opts into Lucid API upload.