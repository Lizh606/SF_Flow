import React from 'react';
import { 
  Camera, 
  ScanFace, 
  Footprints, 
  Activity, 
  BrainCircuit, 
  GitMerge, 
  Database,
  Box,
  Layers
} from 'lucide-react';
import { NodeType } from '../types';

interface NodeIconProps {
  type: NodeType;
  color: string;
  size?: number;
}

export const NodeIcon: React.FC<NodeIconProps> = ({ type, color, size = 20 }) => {
  const props = { size, color, strokeWidth: 1.75 };

  switch (type) {
    case 'input': return <Camera {...props} />;
    case 'detection': return <ScanFace {...props} />;
    case 'tracking': return <Footprints {...props} />;
    case 'pose': return <Activity {...props} />;
    case 'classifier': return <BrainCircuit {...props} />;
    case 'logic': return <GitMerge {...props} />;
    case 'output': return <Database {...props} />;
    default: return <Box {...props} />;
  }
};