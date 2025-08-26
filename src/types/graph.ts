export interface NodeAttributes {
  label?: string;
  shape?: string;
  style?: string;
  fillcolor?: string;
  color?: string;
  penwidth?: string | number;
  fontsize?: string | number;
  fontname?: string;
  width?: string | number;
  height?: string | number;
  [key: string]: any;
}

export interface EdgeAttributes {
  label?: string;
  style?: string;
  color?: string;
  penwidth?: string | number;
  fontsize?: string | number;
  fontname?: string;
  arrowhead?: string;
  arrowtail?: string;
  dir?: string;
  [key: string]: any;
}

export interface GraphNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  attrs: NodeAttributes;
  cluster?: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  points: Array<{ x: number; y: number }>;
  label?: string;
  attrs: EdgeAttributes;
}

export interface GraphAttributes {
  rankdir?: 'TB' | 'BT' | 'LR' | 'RL';
  bgcolor?: string;
  label?: string;
  [key: string]: any;
}

export interface NormalizedGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  attrs: GraphAttributes;
  clusters: Map<string, {
    id: string;
    label?: string;
    nodes: string[];
    attrs: NodeAttributes;
  }>;
}

export interface ParsedDotGraph {
  nodes: Array<{ id: string; attrs: NodeAttributes }>;
  edges: Array<{ source: string; target: string; attrs: EdgeAttributes }>;
  attrs: GraphAttributes;
  subgraphs: Map<string, any>;
}