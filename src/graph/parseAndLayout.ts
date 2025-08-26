import { Graphviz } from '@hpcc-js/wasm-graphviz';
import graphlibDotModule from '@dagrejs/graphlib-dot';
const graphlibDot = graphlibDotModule as any;
import type { 
  NormalizedGraph, 
  GraphNode, 
  GraphEdge, 
  NodeAttributes, 
  EdgeAttributes,
  GraphAttributes,
  ParsedDotGraph
} from '../types/graph';

let graphvizInstance: Graphviz | null = null;

async function getGraphviz(): Promise<Graphviz> {
  if (!graphvizInstance) {
    graphvizInstance = await Graphviz.load();
  }
  return graphvizInstance;
}

export function parseDot(dot: string): ParsedDotGraph {
  try {
    // Preprocess the DOT string to handle C++ style comments
    // graphlib-dot only supports C-style /* */ comments
    const preprocessedDot = dot
      .split('\n')
      .map(line => {
        // Remove // comments but preserve them if inside quotes
        let inQuotes = false;
        let result = '';
        for (let i = 0; i < line.length; i++) {
          if (line[i] === '"' && (i === 0 || line[i-1] !== '\\')) {
            inQuotes = !inQuotes;
            result += line[i];
          } else if (!inQuotes && line[i] === '/' && line[i+1] === '/') {
            // Found // comment outside quotes, skip rest of line
            break;
          } else {
            result += line[i];
          }
        }
        return result;
      })
      .join('\n');
    
    const graph = graphlibDot.read(preprocessedDot);
    
    const nodes: Array<{ id: string; attrs: NodeAttributes }> = [];
    const edges: Array<{ source: string; target: string; attrs: EdgeAttributes }> = [];
    const subgraphs = new Map<string, any>();
    
    // Extract graph attributes
    const graphAttrs: GraphAttributes = {};
    const gAttrs = graph.graph() || {};
    
    if (gAttrs.rankdir) {
      graphAttrs.rankdir = gAttrs.rankdir;
    }
    if (gAttrs.bgcolor) {
      graphAttrs.bgcolor = gAttrs.bgcolor;
    }
    if (gAttrs.label) {
      graphAttrs.label = gAttrs.label;
    }
    
    // Extract nodes with their attributes
    graph.nodes().forEach((nodeId: string) => {
      const nodeData = graph.node(nodeId) || {};
      const attrs: NodeAttributes = {};
      
      // Map common attributes
      if (nodeData.label !== undefined) attrs.label = nodeData.label;
      if (nodeData.shape) attrs.shape = nodeData.shape;
      if (nodeData.style) attrs.style = nodeData.style;
      if (nodeData.fillcolor) attrs.fillcolor = nodeData.fillcolor;
      if (nodeData.color) attrs.color = nodeData.color;
      if (nodeData.penwidth) attrs.penwidth = nodeData.penwidth;
      if (nodeData.fontsize) attrs.fontsize = nodeData.fontsize;
      if (nodeData.fontname) attrs.fontname = nodeData.fontname;
      if (nodeData.width) attrs.width = nodeData.width;
      if (nodeData.height) attrs.height = nodeData.height;
      
      nodes.push({ id: nodeId, attrs });
    });
    
    // Extract edges with their attributes  
    graph.edges().forEach((edge: any) => {
      const edgeData = graph.edge(edge) || {};
      const attrs: EdgeAttributes = {};
      
      // Map edge attributes
      if (edgeData.label !== undefined) attrs.label = edgeData.label;
      if (edgeData.style) attrs.style = edgeData.style;
      if (edgeData.color) attrs.color = edgeData.color;
      if (edgeData.penwidth) attrs.penwidth = edgeData.penwidth;
      if (edgeData.fontsize) attrs.fontsize = edgeData.fontsize;
      if (edgeData.fontname) attrs.fontname = edgeData.fontname;
      if (edgeData.arrowhead) attrs.arrowhead = edgeData.arrowhead;
      if (edgeData.arrowtail) attrs.arrowtail = edgeData.arrowtail;
      if (edgeData.dir) attrs.dir = edgeData.dir;
      
      edges.push({ 
        source: edge.v, 
        target: edge.w, 
        attrs 
      });
    });
    
    // Handle subgraphs/clusters if present
    // Note: graphlib-dot doesn't directly expose subgraphs,
    // but we can still parse them from the layout result
    
    return {
      nodes,
      edges,
      attrs: graphAttrs,
      subgraphs
    };
  } catch (error) {
    throw new Error(`Failed to parse DOT file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}


export async function layoutDot(dot: string): Promise<NormalizedGraph> {
  try {
    const graphviz = await getGraphviz();
    const jsonResult = await graphviz.layout(dot, 'json', 'dot');
    const layoutData = JSON.parse(jsonResult);
    
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const clusters = new Map<string, {
      id: string;
      label?: string;
      nodes: string[];
      attrs: NodeAttributes;
    }>();
    
    const dpi = 72;
    const scale = 1;
    
    if (layoutData.objects) {
      layoutData.objects.forEach((obj: any) => {
        if (obj.name && typeof obj._gvid === 'number') {
          // Skip cluster objects (they'll be handled separately)
          if (obj.name.startsWith('cluster')) {
            return;
          }
          
          const pos = obj.pos?.split(',').map(Number) || [0, 0];
          const width = (parseFloat(obj.width) || 1) * dpi;
          const height = (parseFloat(obj.height) || 1) * dpi;
          
          // Handle \\N label (which means use node name as label)
          let label = obj.label;
          if (label === '\\N') {
            label = obj.name;
          }
          
          nodes.push({
            id: obj.name,
            x: pos[0] * scale,
            y: pos[1] * scale,
            width,
            height,
            attrs: {
              label: label || obj.name,
              shape: obj.shape || 'ellipse',
              style: obj.style,
              fillcolor: obj.fillcolor,
              color: obj.color,
              penwidth: obj.penwidth,
              fontsize: obj.fontsize,
              fontname: obj.fontname,
            },
            cluster: obj.cluster
          });
        }
      });
    }
    
    if (layoutData.edges) {
      layoutData.edges.forEach((edge: any, index: number) => {
        const points: Array<{ x: number; y: number }> = [];
        
        if (edge.pos) {
          const posString = edge.pos.replace(/^[se],/, '');
          const coords = posString.split(' ');
          
          coords.forEach((coord: string) => {
            const [x, y] = coord.split(',').map(Number);
            if (!isNaN(x) && !isNaN(y)) {
              points.push({ x: x * scale, y: y * scale });
            }
          });
        }
        
        // Get source and target node names from the objects array
        let sourceName = '';
        let targetName = '';
        
        if (typeof edge.tail === 'number' && typeof edge.head === 'number') {
          // tail and head are indices into the objects array
          const tailObj = layoutData.objects[edge.tail];
          const headObj = layoutData.objects[edge.head];
          sourceName = tailObj?.name || '';
          targetName = headObj?.name || '';
        } else {
          // Fallback to direct names if available
          sourceName = edge.tail || '';
          targetName = edge.head || '';
        }
        
        if (sourceName && targetName) {
          edges.push({
            id: `edge_${index}`,
            source: sourceName,
            target: targetName,
            points: points.length > 0 ? points : [{ x: 0, y: 0 }, { x: 100, y: 100 }],
            label: edge.label,
            attrs: {
              label: edge.label,
              style: edge.style,
              color: edge.color,
              penwidth: edge.penwidth,
              fontsize: edge.fontsize,
              fontname: edge.fontname,
            }
          });
        }
      });
    }
    
    if (layoutData.subgraphs) {
      layoutData.subgraphs.forEach((subgraph: any) => {
        if (subgraph.name?.startsWith('cluster')) {
          clusters.set(subgraph.name, {
            id: subgraph.name,
            label: subgraph.label,
            nodes: subgraph.nodes || [],
            attrs: {
              label: subgraph.label,
              style: subgraph.style,
              fillcolor: subgraph.fillcolor,
              color: subgraph.color,
            }
          });
        }
      });
    }
    
    const graphAttrs: GraphAttributes = {
      rankdir: layoutData.rankdir as any || 'TB',
      bgcolor: layoutData.bgcolor,
      label: layoutData.label,
    };
    
    return {
      nodes,
      edges,
      attrs: graphAttrs,
      clusters
    };
  } catch (error) {
    throw new Error(`Failed to layout DOT file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function parseAndLayoutDot(dot: string): Promise<NormalizedGraph> {
  const parsed = parseDot(dot);
  const layout = await layoutDot(dot);
  
  // Merge parsed attributes with layout information
  const mergedNodes = layout.nodes.map(layoutNode => {
    const parsedNode = parsed.nodes.find(n => n.id === layoutNode.id);
    if (parsedNode) {
      return {
        ...layoutNode,
        attrs: { ...parsedNode.attrs, ...layoutNode.attrs }
      };
    }
    return layoutNode;
  });
  
  // Ensure all parsed nodes are included even if layout didn't include them
  parsed.nodes.forEach(parsedNode => {
    if (!mergedNodes.find(n => n.id === parsedNode.id)) {
      // Add node with default position if not in layout
      mergedNodes.push({
        id: parsedNode.id,
        x: 0,
        y: 0,
        width: 72,
        height: 36,
        attrs: parsedNode.attrs
      });
    }
  });
  
  const mergedEdges = layout.edges.map(layoutEdge => {
    const parsedEdge = parsed.edges.find(e => 
      e.source === layoutEdge.source && e.target === layoutEdge.target
    );
    if (parsedEdge) {
      return {
        ...layoutEdge,
        attrs: { ...parsedEdge.attrs, ...layoutEdge.attrs }
      };
    }
    return layoutEdge;
  });
  
  return {
    nodes: mergedNodes,
    edges: mergedEdges,
    attrs: { ...parsed.attrs, ...layout.attrs },
    clusters: layout.clusters
  };
}