import { describe, it, expect } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseDot, layoutDot, parseAndLayoutDot } from '../../src/graph/parseAndLayout';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('parseAndLayout', () => {
  describe('parseDot', () => {
    it('should parse a simple DOT file', () => {
      const dot = `digraph G {
        A -> B;
        B -> C;
      }`;
      
      const result = parseDot(dot);
      
      expect(result.nodes).toHaveLength(3);
      expect(result.edges).toHaveLength(2);
      expect(result.nodes.map(n => n.id)).toContain('A');
      expect(result.nodes.map(n => n.id)).toContain('B');
      expect(result.nodes.map(n => n.id)).toContain('C');
    });
    
    it('should parse node attributes', () => {
      const dot = `digraph G {
        A [label="Start" shape=box fillcolor=lightblue style=filled];
      }`;
      
      const result = parseDot(dot);
      
      expect(result.nodes[0].attrs.label).toBe('Start');
      expect(result.nodes[0].attrs.shape).toBe('box');
      expect(result.nodes[0].attrs.fillcolor).toBe('lightblue');
      expect(result.nodes[0].attrs.style).toBe('filled');
    });
    
    it('should parse edge attributes', () => {
      const dot = `digraph G {
        A -> B [label="test" style=dashed color=red];
      }`;
      
      const result = parseDot(dot);
      
      expect(result.edges[0].attrs.label).toBe('test');
      expect(result.edges[0].attrs.style).toBe('dashed');
      expect(result.edges[0].attrs.color).toBe('red');
    });
    
    it('should handle invalid DOT syntax', () => {
      const dot = `invalid dot syntax {{`;
      
      expect(() => parseDot(dot)).toThrow();
    });
    
    it('should handle DOT files with C++ style comments', () => {
      const dot = `digraph G {
        // This is a comment
        A [label="Node A"]; // inline comment
        B [label="Node // not a comment"];
        
        // Edge with comment
        A -> B; // connection
      }`;
      
      const result = parseDot(dot);
      
      expect(result.nodes).toHaveLength(2);
      expect(result.edges).toHaveLength(1);
      
      const nodeB = result.nodes.find(n => n.id === 'B');
      expect(nodeB?.attrs.label).toBe('Node // not a comment');
    });
    
    it('should parse DOT files with quoted identifiers and special characters', async () => {
      const complexDot = await fs.readFile(
        path.join(__dirname, '../fixtures/complex-quoted.dot'),
        'utf-8'
      );
      
      const result = parseDot(complexDot);
      
      // Check that quoted node identifiers are parsed correctly
      const nodeIds = result.nodes.map(n => n.id);
      expect(nodeIds).toContain('Node with Spaces');
      expect(nodeIds).toContain('node-with-dashes');
      expect(nodeIds).toContain('node.with.dots');
      expect(nodeIds).toContain('node_with_underscores');
      expect(nodeIds).toContain('123numeric');
      expect(nodeIds).toContain('special!@#$%chars');
      expect(nodeIds).toContain('cluster node 1');
      expect(nodeIds).toContain('cluster node 2');
      
      // Check that edges with quoted nodes are parsed correctly
      const edgeWithSpaces = result.edges.find(
        e => e.source === 'Node with Spaces' && e.target === 'node-with-dashes'
      );
      expect(edgeWithSpaces).toBeDefined();
      expect(edgeWithSpaces?.attrs.label).toBe('Edge Label 1');
      expect(edgeWithSpaces?.attrs.style).toBe('dashed');
      
      // Check that special arrow attributes are parsed
      const bidirectionalEdge = result.edges.find(
        e => e.source === 'node_with_underscores' && e.target === '123numeric'
      );
      expect(bidirectionalEdge).toBeDefined();
      expect(bidirectionalEdge?.attrs.arrowhead).toBe('diamond');
      expect(bidirectionalEdge?.attrs.arrowtail).toBe('box');
      expect(bidirectionalEdge?.attrs.dir).toBe('both');
      
      // Check graph attributes
      expect(result.attrs.rankdir).toBe('LR');
      expect(result.attrs.bgcolor).toBe('#f0f0f0');
    });
  });
  
  describe('layoutDot', () => {
    it('should compute layout for simple graph', async () => {
      const dot = `digraph G {
        A -> B;
        B -> C;
      }`;
      
      const result = await layoutDot(dot);
      
      expect(result.nodes).toHaveLength(3);
      expect(result.edges).toHaveLength(2);
      
      result.nodes.forEach(node => {
        expect(node.x).toBeDefined();
        expect(node.y).toBeDefined();
        expect(node.width).toBeGreaterThan(0);
        expect(node.height).toBeGreaterThan(0);
      });
      
      result.edges.forEach(edge => {
        expect(edge.points).toBeDefined();
        expect(edge.points.length).toBeGreaterThanOrEqual(2);
      });
    });
    
    it('should preserve rankdir attribute', async () => {
      const dot = `digraph G {
        rankdir=LR;
        A -> B;
      }`;
      
      const result = await layoutDot(dot);
      
      expect(result.attrs.rankdir).toBe('LR');
    });
  });
  
  describe('parseAndLayoutDot', () => {
    it('should combine parsing and layout', async () => {
      const dot = `digraph G {
        rankdir=TB;
        A [label="Node A" fillcolor=yellow style=filled];
        B [label="Node B"];
        A -> B [label="Edge"];
      }`;
      
      const result = await parseAndLayoutDot(dot);
      
      expect(result.nodes).toHaveLength(2);
      expect(result.edges).toHaveLength(1);
      
      const nodeA = result.nodes.find(n => n.id === 'A');
      expect(nodeA?.attrs.label).toBe('Node A');
      expect(nodeA?.attrs.fillcolor).toBe('yellow');
      expect(nodeA?.x).toBeDefined();
      expect(nodeA?.y).toBeDefined();
      
      const edge = result.edges[0];
      expect(edge.label).toBe('Edge');
      expect(edge.points.length).toBeGreaterThanOrEqual(2);
    });
  });
  
  describe('fixture tests', () => {
    it('should process simple.dot fixture', async () => {
      const fixturePath = path.join(__dirname, '../fixtures/simple.dot');
      const dot = await fs.readFile(fixturePath, 'utf-8');
      
      const result = await parseAndLayoutDot(dot);
      
      expect(result.nodes.length).toBeGreaterThan(0);
      expect(result.edges.length).toBeGreaterThan(0);
      
      const startNode = result.nodes.find(n => n.attrs.label === 'Start');
      expect(startNode).toBeDefined();
      
      const decisionNode = result.nodes.find(n => n.attrs.shape === 'diamond');
      expect(decisionNode).toBeDefined();
      expect(decisionNode?.attrs.fillcolor).toBe('yellow');
    });
    
    it('should process cluster.dot fixture', async () => {
      const fixturePath = path.join(__dirname, '../fixtures/cluster.dot');
      const dot = await fs.readFile(fixturePath, 'utf-8');
      
      const result = await parseAndLayoutDot(dot);
      
      expect(result.nodes.length).toBeGreaterThan(0);
      expect(result.clusters.size).toBeGreaterThanOrEqual(0);
      expect(result.attrs.rankdir).toBe('LR');
    });
    
    it('should process dashed-edges.dot fixture', async () => {
      const fixturePath = path.join(__dirname, '../fixtures/dashed-edges.dot');
      const dot = await fs.readFile(fixturePath, 'utf-8');
      
      const result = await parseAndLayoutDot(dot);
      
      const dashedEdges = result.edges.filter(e => e.attrs.style === 'dashed');
      expect(dashedEdges.length).toBeGreaterThan(0);
      
      const dottedEdges = result.edges.filter(e => e.attrs.style === 'dotted');
      expect(dottedEdges.length).toBeGreaterThan(0);
    });
  });
});