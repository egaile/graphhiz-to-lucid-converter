import JSZip from 'jszip';
import type { NormalizedGraph, GraphNode, GraphEdge } from '../types/graph';
import type { 
  LucidDocument, 
  LucidPage, 
  LucidShape, 
  LucidLine,
  LucidShapeStyle,
  LucidText
} from '../types/lucid';

function mapShapeToLucid(shape?: string): LucidShape['type'] {
  const shapeMap: Record<string, LucidShape['type']> = {
    'box': 'rectangle',
    'rect': 'rectangle',
    'rectangle': 'rectangle',
    'square': 'rectangle',
    'ellipse': 'ellipse',
    'circle': 'ellipse',
    'oval': 'ellipse',
    'diamond': 'decision',
    'rhombus': 'decision',
    'cylinder': 'data',
    'record': 'data',
    'document': 'document',
    'note': 'document',
    'folder': 'document',
    'plaintext': 'rectangle',
    'point': 'ellipse',
    'egg': 'ellipse',
    'triangle': 'process',
    'parallelogram': 'process',
    'trapezoid': 'process',
    'hexagon': 'process',
    'octagon': 'process',
    'doubleoctagon': 'process',
    'tripleoctagon': 'process',
    'invtriangle': 'process',
    'invtrapezium': 'process',
    'invhouse': 'process',
    'house': 'process',
    'pentagon': 'process',
    'septagon': 'process',
    'star': 'process',
    'tab': 'process',
    'component': 'process',
    'doublecircle': 'terminator',
    'Mdiamond': 'decision',
    'Msquare': 'rectangle',
    'Mcircle': 'ellipse',
  };
  
  return shapeMap[shape?.toLowerCase() || ''] || 'rectangle';
}

function normalizeColor(color?: string): string {
  if (!color) return '#FFFFFF';
  
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
  
  return namedColors[color.toLowerCase()] || '#FFFFFF';
}

function createNodeShape(node: GraphNode, index: number): LucidShape {
  const attrs = node.attrs;
  
  const style: LucidShapeStyle = {};
  
  if (attrs.fillcolor) {
    style.fillColor = normalizeColor(attrs.fillcolor);
  } else if (attrs.style === 'filled') {
    style.fillColor = '#F0F0F0';
  }
  
  if (attrs.color) {
    style.strokeColor = normalizeColor(attrs.color);
  } else {
    style.strokeColor = '#000000';
  }
  
  if (attrs.penwidth) {
    style.strokeWidth = parseFloat(attrs.penwidth.toString());
  } else {
    style.strokeWidth = 1;
  }
  
  const text: LucidText | undefined = attrs.label ? {
    label: attrs.label.toString(),
    style: {
      fontSize: attrs.fontsize ? parseFloat(attrs.fontsize.toString()) : 14,
      fontFamily: attrs.fontname || 'Arial',
      color: '#000000'
    }
  } : undefined;
  
  return {
    id: `shape_${node.id}_${index}`,
    type: mapShapeToLucid(attrs.shape),
    x: node.x - node.width / 2,
    y: node.y - node.height / 2,
    width: node.width,
    height: node.height,
    text,
    style,
    locked: false
  };
}

function createEdgeLine(edge: GraphEdge, index: number): LucidLine {
  const attrs = edge.attrs;
  
  const style: LucidShapeStyle = {};
  
  if (attrs.style === 'dashed') {
    style.pattern = 'dashed';
  } else if (attrs.style === 'dotted') {
    style.pattern = 'dotted';
  } else {
    style.pattern = 'solid';
  }
  
  if (attrs.color) {
    style.strokeColor = normalizeColor(attrs.color);
  } else {
    style.strokeColor = '#000000';
  }
  
  if (attrs.penwidth) {
    style.strokeWidth = parseFloat(attrs.penwidth.toString());
  } else {
    style.strokeWidth = 1;
  }
  
  const text: LucidText | undefined = edge.label ? {
    label: edge.label,
    style: {
      fontSize: attrs.fontsize ? parseFloat(attrs.fontsize.toString()) : 12,
      fontFamily: attrs.fontname || 'Arial',
      color: '#000000'
    }
  } : undefined;
  
  const waypoints = edge.points.length > 0 ? edge.points : [
    { x: 0, y: 0 },
    { x: 100, y: 100 }
  ];
  
  return {
    id: `line_${index}`,
    sourceId: `shape_${edge.source}_0`,
    targetId: `shape_${edge.target}_0`,
    waypoints,
    text,
    style,
    startArrow: 'none',
    endArrow: 'arrow'
  };
}

export function exportToLucid(graph: NormalizedGraph): LucidDocument {
  const shapes: LucidShape[] = [];
  const lines: LucidLine[] = [];
  
  graph.clusters.forEach((cluster, clusterId) => {
    const clusterNodes = graph.nodes.filter(n => cluster.nodes.includes(n.id));
    
    if (clusterNodes.length > 0) {
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      
      clusterNodes.forEach(node => {
        minX = Math.min(minX, node.x - node.width / 2);
        minY = Math.min(minY, node.y - node.height / 2);
        maxX = Math.max(maxX, node.x + node.width / 2);
        maxY = Math.max(maxY, node.y + node.height / 2);
      });
      
      const padding = 20;
      shapes.push({
        id: `group_${clusterId}`,
        type: 'group',
        x: minX - padding,
        y: minY - padding,
        width: maxX - minX + 2 * padding,
        height: maxY - minY + 2 * padding,
        text: cluster.label ? {
          label: cluster.label,
          style: {
            fontSize: 16,
            fontFamily: 'Arial',
            color: '#333333',
            bold: true
          }
        } : undefined,
        style: {
          fillColor: cluster.attrs.fillcolor ? normalizeColor(cluster.attrs.fillcolor) : '#F5F5F5',
          strokeColor: cluster.attrs.color ? normalizeColor(cluster.attrs.color) : '#999999',
          strokeWidth: 1
        }
      });
    }
  });
  
  graph.nodes.forEach((node, index) => {
    shapes.push(createNodeShape(node, index));
  });
  
  graph.edges.forEach((edge, index) => {
    lines.push(createEdgeLine(edge, index));
  });
  
  let pageWidth = 1000;
  let pageHeight = 1000;
  
  if (shapes.length > 0) {
    let maxX = 0, maxY = 0;
    shapes.forEach(shape => {
      maxX = Math.max(maxX, shape.x + shape.width);
      maxY = Math.max(maxY, shape.y + shape.height);
    });
    pageWidth = Math.max(1000, maxX + 100);
    pageHeight = Math.max(1000, maxY + 100);
  }
  
  const page: LucidPage = {
    id: 'page_1',
    title: 'Imported from Graphviz',
    shapes,
    lines,
    width: pageWidth,
    height: pageHeight
  };
  
  const document: LucidDocument = {
    version: 1,
    pages: [page],
    metadata: {
      title: 'Graphviz Import',
      description: 'Converted from DOT file',
      created: new Date().toISOString(),
      modified: new Date().toISOString()
    }
  };
  
  return document;
}

export async function createLucidZip(document: LucidDocument): Promise<Blob> {
  const zip = new JSZip();
  
  const documentJson = JSON.stringify(document, null, 2);
  zip.file('document.json', documentJson);
  
  const manifest = {
    fileVersion: '1.0.0',
    created: new Date().toISOString(),
    generator: 'graphviz-lucid-converter'
  };
  zip.file('manifest.json', JSON.stringify(manifest, null, 2));
  
  const blob = await zip.generateAsync({ 
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: {
      level: 9
    }
  });
  
  return blob;
}