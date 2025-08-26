export interface LucidTextStyle {
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

export interface LucidShapeStyle {
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  pattern?: 'solid' | 'dashed' | 'dotted';
}

export interface LucidText {
  label: string;
  style?: LucidTextStyle;
}

export interface LucidShape {
  id: string;
  type: 'rectangle' | 'ellipse' | 'decision' | 'process' | 'terminator' | 'data' | 'document' | 'group';
  x: number;
  y: number;
  width: number;
  height: number;
  text?: LucidText;
  style?: LucidShapeStyle;
  rotation?: number;
  locked?: boolean;
}

export interface LucidLine {
  id: string;
  sourceId: string;
  targetId: string;
  waypoints: Array<{ x: number; y: number }>;
  text?: LucidText;
  style?: LucidShapeStyle;
  startArrow?: 'none' | 'arrow' | 'diamond' | 'circle';
  endArrow?: 'none' | 'arrow' | 'diamond' | 'circle';
}

export interface LucidPage {
  id: string;
  title: string;
  shapes: LucidShape[];
  lines: LucidLine[];
  width?: number;
  height?: number;
}

export interface LucidDocument {
  version: 1;
  pages: LucidPage[];
  metadata?: {
    title?: string;
    description?: string;
    created?: string;
    modified?: string;
  };
}