declare module '@dagrejs/graphlib-dot' {
  export interface GraphNode {
    [key: string]: any;
  }
  
  export interface GraphEdge {
    v: string;
    w: string;
    name?: string;
    [key: string]: any;
  }
  
  export interface Graph {
    graph(): Record<string, any>;
    nodes(): string[];
    node(id: string): GraphNode | undefined;
    edges(): GraphEdge[];
    edge(e: GraphEdge): Record<string, any> | undefined;
    setNode(id: string, attrs?: GraphNode): void;
    setEdge(v: string, w: string, attrs?: Record<string, any>): void;
  }
  
  export function read(str: string): Graph;
  export function readMany(str: string): Graph[];
  export function write(g: Graph): string;
}