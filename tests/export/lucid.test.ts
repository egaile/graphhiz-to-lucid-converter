import { describe, it, expect } from 'vitest';
import { exportToLucid, createLucidZip } from '../../src/export/lucid';
import JSZip from 'jszip';
import type { NormalizedGraph } from '../../src/types/graph';

describe('exportToLucid', () => {
  it('should export a simple graph to Lucid format', () => {
    const graph: NormalizedGraph = {
      nodes: [
        {
          id: 'A',
          x: 100,
          y: 100,
          width: 80,
          height: 40,
          attrs: {
            label: 'Node A',
            shape: 'box',
            fillcolor: 'lightblue',
            style: 'filled'
          }
        },
        {
          id: 'B',
          x: 200,
          y: 200,
          width: 80,
          height: 40,
          attrs: {
            label: 'Node B',
            shape: 'ellipse'
          }
        }
      ],
      edges: [
        {
          id: 'edge_1',
          source: 'A',
          target: 'B',
          points: [
            { x: 100, y: 120 },
            { x: 200, y: 180 }
          ],
          label: 'Connection',
          attrs: {
            style: 'dashed'
          }
        }
      ],
      attrs: {
        rankdir: 'TB'
      },
      clusters: new Map()
    };
    
    const lucidDoc = exportToLucid(graph);
    
    expect(lucidDoc.version).toBe(1);
    expect(lucidDoc.pages).toHaveLength(1);
    
    const page = lucidDoc.pages[0];
    expect(page.shapes).toHaveLength(2);
    expect(page.lines).toHaveLength(1);
    
    const nodeA = page.shapes.find(s => s.text?.label === 'Node A');
    expect(nodeA).toBeDefined();
    expect(nodeA?.type).toBe('rectangle');
    expect(nodeA?.style?.fillColor).toBe('#ADD8E6');
    
    const line = page.lines[0];
    expect(line.text?.label).toBe('Connection');
    expect(line.style?.pattern).toBe('dashed');
  });
  
  it('should handle shape type mappings', () => {
    const graph: NormalizedGraph = {
      nodes: [
        {
          id: 'A',
          x: 0,
          y: 0,
          width: 100,
          height: 50,
          attrs: { shape: 'box' }
        },
        {
          id: 'B',
          x: 0,
          y: 0,
          width: 100,
          height: 50,
          attrs: { shape: 'ellipse' }
        },
        {
          id: 'C',
          x: 0,
          y: 0,
          width: 100,
          height: 50,
          attrs: { shape: 'diamond' }
        },
        {
          id: 'D',
          x: 0,
          y: 0,
          width: 100,
          height: 50,
          attrs: { shape: 'cylinder' }
        }
      ],
      edges: [],
      attrs: {},
      clusters: new Map()
    };
    
    const lucidDoc = exportToLucid(graph);
    const page = lucidDoc.pages[0];
    
    expect(page.shapes[0].type).toBe('rectangle');
    expect(page.shapes[1].type).toBe('ellipse');
    expect(page.shapes[2].type).toBe('decision');
    expect(page.shapes[3].type).toBe('data');
  });
  
  it('should handle clusters as groups', () => {
    const graph: NormalizedGraph = {
      nodes: [
        {
          id: 'A',
          x: 100,
          y: 100,
          width: 80,
          height: 40,
          attrs: { label: 'Node A' }
        },
        {
          id: 'B',
          x: 200,
          y: 100,
          width: 80,
          height: 40,
          attrs: { label: 'Node B' }
        }
      ],
      edges: [],
      attrs: {},
      clusters: new Map([
        ['cluster_0', {
          id: 'cluster_0',
          label: 'My Group',
          nodes: ['A', 'B'],
          attrs: {
            fillcolor: 'lightgray'
          }
        }]
      ])
    };
    
    const lucidDoc = exportToLucid(graph);
    const page = lucidDoc.pages[0];
    
    const group = page.shapes.find(s => s.type === 'group');
    expect(group).toBeDefined();
    expect(group?.text?.label).toBe('My Group');
    expect(group?.style?.fillColor).toBe('#D3D3D3');
    
    expect(group?.x).toBeLessThan(100);
    expect(group?.y).toBeLessThan(100);
    expect(group?.width).toBeGreaterThan(180);
  });
  
  it('should set page dimensions based on content', () => {
    const graph: NormalizedGraph = {
      nodes: [
        {
          id: 'A',
          x: 500,
          y: 600,
          width: 100,
          height: 50,
          attrs: {}
        }
      ],
      edges: [],
      attrs: {},
      clusters: new Map()
    };
    
    const lucidDoc = exportToLucid(graph);
    const page = lucidDoc.pages[0];
    
    expect(page.width).toBeGreaterThanOrEqual(550);
    expect(page.height).toBeGreaterThanOrEqual(625);
  });
  
  it('should include metadata', () => {
    const graph: NormalizedGraph = {
      nodes: [],
      edges: [],
      attrs: {},
      clusters: new Map()
    };
    
    const lucidDoc = exportToLucid(graph);
    
    expect(lucidDoc.metadata).toBeDefined();
    expect(lucidDoc.metadata?.title).toBe('Graphviz Import');
    expect(lucidDoc.metadata?.description).toBe('Converted from DOT file');
    expect(lucidDoc.metadata?.created).toBeDefined();
    expect(lucidDoc.metadata?.modified).toBeDefined();
  });
});

describe('createLucidZip', () => {
  it('should create a valid zip file', async () => {
    const lucidDoc = {
      version: 1 as const,
      pages: [{
        id: 'page_1',
        title: 'Test Page',
        shapes: [],
        lines: []
      }]
    };
    
    const blob = await createLucidZip(lucidDoc);
    
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(0);
    
    const zip = await JSZip.loadAsync(blob);
    
    expect(zip.files['document.json']).toBeDefined();
    expect(zip.files['manifest.json']).toBeDefined();
    
    const documentContent = await zip.files['document.json'].async('string');
    const parsedDoc = JSON.parse(documentContent);
    
    expect(parsedDoc.version).toBe(1);
    expect(parsedDoc.pages).toHaveLength(1);
    
    const manifestContent = await zip.files['manifest.json'].async('string');
    const manifest = JSON.parse(manifestContent);
    
    expect(manifest.fileVersion).toBe('1.0.0');
    expect(manifest.generator).toBe('graphviz-lucid-converter');
  });
});