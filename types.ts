export type NodeType = 'input' | 'detection' | 'tracking' | 'pose' | 'classifier' | 'logic' | 'output';

export interface Position {
  x: number;
  y: number;
}

export interface NodeData {
  label: string;
  description?: string;
  status?: 'idle' | 'running' | 'completed' | 'error';
  properties?: Record<string, any>;
  previewImage?: string;
}

export interface Node {
  id: string;
  type: NodeType;
  position: Position;
  data: NodeData;
  inputs: string[]; // port IDs
  outputs: string[]; // port IDs
  selected?: boolean;
}

export interface Connection {
  id: string;
  sourceNodeId: string;
  sourceHandle: string;
  targetNodeId: string;
  targetHandle: string;
}

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  surfaceHighlight: string;
  stroke: string;
  text: string;
  textSecondary: string;
  node: {
    blue: string;
    orange: string;
    purple: string;
    teal: string;
    green: string;
  }
}

export interface Theme {
  mode: ThemeMode;
  colors: ThemeColors;
}

export type Category = 'Source' | 'AI Model' | 'Logic' | 'Output';

export interface DraggableNode {
  type: NodeType;
  label: string;
  desc: string;
  category: Category;
}
