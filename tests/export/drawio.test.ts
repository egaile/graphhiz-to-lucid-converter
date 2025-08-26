import { describe, it, expect } from 'vitest';
import { exportToDrawIo } from '../../src/export/drawio';
import type { NormalizedGraph } from '../../src/types/graph';

describe('exportToDrawIo', () => {
  it('should export a simple graph to draw.io XML', () => {
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
    
    const xml = exportToDrawIo(graph);
    
    expect(xml).toContain('<?xml');
    expect(xml).toContain('<mxfile');
    expect(xml).toContain('<mxGraphModel');
    expect(xml).toContain('Node A');
    expect(xml).toContain('Node B');
    expect(xml).toContain('Connection');
    expect(xml).toContain('dashed=1');
  });
  
  it('should handle shape mappings correctly', () => {
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
        }
      ],
      edges: [],
      attrs: {},
      clusters: new Map()
    };
    
    const xml = exportToDrawIo(graph);
    
    expect(xml).toContain('shape=rectangle');
    expect(xml).toContain('shape=ellipse');
    expect(xml).toContain('shape=rhombus');
  });
  
  it('should handle color normalization', () => {
    const graph: NormalizedGraph = {
      nodes: [
        {
          id: 'A',
          x: 0,
          y: 0,
          width: 100,
          height: 50,
          attrs: {
            fillcolor: 'red',
            color: 'blue'
          }
        },
        {
          id: 'B',
          x: 0,
          y: 0,
          width: 100,
          height: 50,
          attrs: {
            fillcolor: '#FF00FF',
            color: 'lightgreen'
          }
        }
      ],
      edges: [],
      attrs: {},
      clusters: new Map()
    };
    
    const xml = exportToDrawIo(graph);
    
    expect(xml).toContain('fillColor=#FF0000');
    expect(xml).toContain('strokeColor=#0000FF');
    expect(xml).toContain('fillColor=#FF00FF');
    expect(xml).toContain('strokeColor=#90EE90');
  });
  
  it('should handle clusters', () => {
    const graph: NormalizedGraph = {
      nodes: [
        {
          id: 'A',
          x: 100,
          y: 100,
          width: 80,
          height: 40,
          attrs: { label: 'Node A' }
        }
      ],
      edges: [],
      attrs: {},
      clusters: new Map([
        ['cluster_0', {
          id: 'cluster_0',
          label: 'My Cluster',
          nodes: ['A'],
          attrs: {}
        }]
      ])
    };
    
    const xml = exportToDrawIo(graph);
    
    expect(xml).toContain('My Cluster');
    expect(xml).toContain('group');
    expect(xml).toContain('container=1');
  });
  
  it('should generate well-formed XML', () => {
    const graph: NormalizedGraph = {
      nodes: [],
      edges: [],
      attrs: {},
      clusters: new Map()
    };
    
    const xml = exportToDrawIo(graph);
    
    expect(xml).toMatch(/^<\?xml.*\?>/);
    expect(xml).toMatch(/<mxfile[\s\S]*<\/mxfile>/);
    
    const openTags = (xml.match(/<[^/][^>]*>/g) || []).length;
    const closeTags = (xml.match(/<\/[^>]+>/g) || []).length;
    const selfClosingTags = (xml.match(/<[^>]*\/>/g) || []).length;
    
    expect(openTags - selfClosingTags).toBe(closeTags);
  });
});