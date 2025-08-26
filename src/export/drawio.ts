import { create } from 'xmlbuilder2';
import type { NormalizedGraph, GraphNode, GraphEdge } from '../types/graph';

interface DrawIoStyle {
  [key: string]: string | number | boolean;
}

function mapShapeToDrawIo(shape?: string): string {
  const shapeMap: Record<string, string> = {
    'box': 'rectangle',
    'rect': 'rectangle',
    'rectangle': 'rectangle',
    'square': 'rectangle',
    'ellipse': 'ellipse',
    'circle': 'ellipse',
    'oval': 'ellipse',
    'diamond': 'rhombus',
    'cylinder': 'cylinder',
    'parallelogram': 'parallelogram',
    'trapezoid': 'trapezoid',
    'hexagon': 'hexagon',
    'triangle': 'triangle',
    'star': 'star',
    'cloud': 'cloud',
    'note': 'note',
    'folder': 'folder',
    'document': 'document',
  };
  
  return shapeMap[shape?.toLowerCase() || ''] || 'rectangle';
}

function normalizeColor(color?: string): string {
  if (!color) return 'none';
  
  if (color.startsWith('#')) return color;
  
  const namedColors: Record<string, string> = {
    'red': '#FF0000',
    'green': '#00FF00',
    'blue': '#0000FF',
    'yellow': '#FFFF00',
    'black': '#000000',
    'white': '#FFFFFF',
    'gray': '#808080',
    'grey': '#808080',
    'lightgray': '#D3D3D3',
    'lightgrey': '#D3D3D3',
    'darkgray': '#A9A9A9',
    'darkgrey': '#A9A9A9',
    'lightblue': '#ADD8E6',
    'lightgreen': '#90EE90',
    'lightyellow': '#FFFFE0',
    'orange': '#FFA500',
    'purple': '#800080',
    'pink': '#FFC0CB',
    'cyan': '#00FFFF',
    'magenta': '#FF00FF',
    'brown': '#A52A2A',
  };
  
  return namedColors[color.toLowerCase()] || color;
}

function buildNodeStyle(node: GraphNode): string {
  const style: DrawIoStyle = {};
  const attrs = node.attrs;
  
  style.shape = mapShapeToDrawIo(attrs.shape);
  
  if (attrs.style === 'filled' && attrs.fillcolor) {
    style.fillColor = normalizeColor(attrs.fillcolor);
  } else if (attrs.fillcolor) {
    style.fillColor = normalizeColor(attrs.fillcolor);
  }
  
  if (attrs.color) {
    style.strokeColor = normalizeColor(attrs.color);
  }
  
  if (attrs.penwidth) {
    style.strokeWidth = parseFloat(attrs.penwidth.toString());
  }
  
  if (attrs.fontsize) {
    style.fontSize = parseFloat(attrs.fontsize.toString());
  }
  
  if (attrs.fontname) {
    style.fontFamily = attrs.fontname;
  }
  
  style.rounded = 0;
  style.whiteSpace = 'wrap';
  style.html = 1;
  
  return Object.entries(style)
    .map(([key, value]) => `${key}=${value}`)
    .join(';') + ';';
}

function buildEdgeStyle(edge: GraphEdge): string {
  const style: DrawIoStyle = {};
  const attrs = edge.attrs;
  
  // Edge line style
  if (attrs.style === 'dashed') {
    style.dashed = 1;
    style.dashPattern = '8 8';
  } else if (attrs.style === 'dotted') {
    style.dashed = 1;
    style.dashPattern = '1 4';
  }
  
  // Edge color
  if (attrs.color) {
    style.strokeColor = normalizeColor(attrs.color);
  } else {
    style.strokeColor = '#000000';
  }
  
  // Edge width
  if (attrs.penwidth) {
    style.strokeWidth = parseFloat(attrs.penwidth.toString());
  } else {
    style.strokeWidth = 1;
  }
  
  // Label properties
  if (attrs.fontsize) {
    style.fontSize = parseFloat(attrs.fontsize.toString());
  }
  
  if (attrs.fontname) {
    style.fontFamily = attrs.fontname;
  }
  
  // Standard edge properties for draw.io
  style.rounded = 0;
  style.html = 1;
  style.jettySize = 'auto';
  style.orthogonalLoop = 1;
  style.curved = 0;
  style.endArrow = 'classic';
  style.endFill = 1;
  style.edgeStyle = 'orthogonalEdgeStyle';
  
  return Object.entries(style)
    .map(([key, value]) => `${key}=${value}`)
    .join(';') + ';';
}

export function exportToDrawIo(graph: NormalizedGraph): string {
  const doc = create({ encoding: 'UTF-8' });
  
  const mxfile = doc.ele('mxfile', {
    host: 'app.diagrams.net',
    modified: new Date().toISOString(),
    agent: 'graphviz-lucid-converter',
    version: '1.0.0',
    type: 'device'
  });
  
  const diagram = mxfile.ele('diagram', {
    id: 'graphviz-import',
    name: 'Page-1'
  });
  
  const mxGraphModel = diagram.ele('mxGraphModel', {
    dx: '0',
    dy: '0',
    grid: '1',
    gridSize: '10',
    guides: '1',
    tooltips: '1',
    connect: '1',
    arrows: '1',
    fold: '1',
    page: '1',
    pageScale: '1',
    pageWidth: '850',
    pageHeight: '1100',
    math: '0',
    shadow: '0'
  });
  
  const root = mxGraphModel.ele('root');
  
  root.ele('mxCell', { id: '0' });
  root.ele('mxCell', { id: '1', parent: '0' });
  
  const nodeIdMap = new Map<string, string>();
  let cellId = 2;
  
  // Handle clusters/groups
  const clusterParentMap = new Map<string, string>();
  graph.clusters.forEach((cluster, clusterId) => {
    const groupId = `${cellId++}`;
    
    root.ele('mxCell', {
      id: groupId,
      value: cluster.label || clusterId,
      style: 'group;rounded=1;fillColor=#f5f5f5;strokeColor=#666666;container=1;collapsible=0;',
      vertex: '1',
      connectable: '0',
      parent: '1'
    }).ele('mxGeometry', {
      x: '0',
      y: '0', 
      width: '200',
      height: '200',
      as: 'geometry'
    });
    
    cluster.nodes.forEach(nodeId => {
      clusterParentMap.set(nodeId, groupId);
    });
  });
  
  // Create nodes
  graph.nodes.forEach(node => {
    const id = `${cellId++}`;
    const parent = clusterParentMap.get(node.id) || '1';
    
    // Use node label or convert underscore names to readable format
    const displayLabel = node.attrs.label || node.id.replace(/_/g, ' ');
    
    const cell = root.ele('mxCell', {
      id,
      value: displayLabel,
      style: buildNodeStyle(node),
      vertex: '1',
      parent
    });
    
    cell.ele('mxGeometry', {
      x: Math.round(node.x - node.width / 2),
      y: Math.round(node.y - node.height / 2),
      width: Math.round(node.width),
      height: Math.round(node.height),
      as: 'geometry'
    });
    
    nodeIdMap.set(node.id, id);
  });
  
  // Create edges
  graph.edges.forEach(edge => {
    const sourceId = nodeIdMap.get(edge.source);
    const targetId = nodeIdMap.get(edge.target);
    
    // Skip edges if we can't find the nodes
    if (!sourceId || !targetId) {
      console.warn(`Skipping edge from ${edge.source} to ${edge.target} - nodes not found`);
      return;
    }
    
    const edgeId = `${cellId++}`;
    
    const cell = root.ele('mxCell', {
      id: edgeId,
      value: edge.label || '',
      style: buildEdgeStyle(edge),
      edge: '1',
      parent: '1',
      source: sourceId,
      target: targetId
    });
    
    const geometry = cell.ele('mxGeometry', {
      relative: '1',
      as: 'geometry'
    });
    
    // Add waypoints if available
    if (edge.points && edge.points.length > 2) {
      const points = geometry.ele('Array', { as: 'points' });
      
      for (let i = 1; i < edge.points.length - 1; i++) {
        points.ele('mxPoint', {
          x: Math.round(edge.points[i].x),
          y: Math.round(edge.points[i].y)
        });
      }
    }
  });
  
  return doc.end({ prettyPrint: true });
}