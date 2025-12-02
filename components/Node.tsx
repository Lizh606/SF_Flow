import React, { memo, useState } from 'react';
import { Node, ThemeColors, NodeType } from '../types';
import { NodeIcon } from './NodeIcon';
import { MoreHorizontal, Plus } from 'lucide-react';

interface NodeComponentProps {
  node: Node;
  theme: ThemeColors;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent, id: string) => void;
  onAddClick: (e: React.MouseEvent, id: string, direction: 'top' | 'right' | 'bottom' | 'left') => void;
  scale: number;
}

const getNodeColor = (type: NodeType, colors: ThemeColors['node']) => {
  switch (type) {
    case 'input': return colors.blue;
    case 'detection': return colors.purple;
    case 'tracking': return colors.orange;
    case 'pose': return colors.teal;
    case 'classifier': return colors.green;
    case 'logic': return colors.blue;
    case 'output': return colors.orange;
    default: return colors.blue;
  }
};

export const NodeComponent: React.FC<NodeComponentProps> = memo(({ node, theme, isSelected, onMouseDown, onAddClick, scale }) => {
  const accentColor = getNodeColor(node.type, theme.node);
  const [isHovered, setIsHovered] = useState(false);
  
  // Dynamic styles for the glow effect
  const glowStyle = isSelected 
    ? { boxShadow: `0 0 20px ${accentColor}40, 0 0 0 1px ${accentColor}` }
    : { boxShadow: `0 2px 10px rgba(0,0,0,0.05), 0 0 0 1px ${theme.stroke}` };

  const handleStyle = {
    background: theme.background,
    borderColor: isSelected ? accentColor : theme.stroke,
  };

  const AddButton = ({ direction, className }: { direction: 'top' | 'right' | 'bottom' | 'left', className: string }) => (
    <button
      className={`absolute w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg transform transition-all duration-200 z-50 opacity-0 group-hover:opacity-100 hover:scale-125 ${className}`}
      onClick={(e) => {
        e.stopPropagation();
        onAddClick(e, node.id, direction);
      }}
      title={`Add node to ${direction}`}
    >
      <Plus size={12} strokeWidth={3} />
    </button>
  );

  return (
    <div
      className="absolute group select-none"
      style={{
        transform: `translate(${node.position.x}px, ${node.position.y}px)`,
        cursor: 'grab',
        zIndex: isSelected ? 50 : 10,
      }}
      onMouseDown={(e) => onMouseDown(e, node.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Node Body */}
      <div
        className="relative min-w-[240px] rounded-xl overflow-hidden transition-all duration-200"
        style={{
          background: theme.surface,
          ...glowStyle
        }}
      >
        {/* Header Strip */}
        <div 
          className="h-1 w-full"
          style={{ background: accentColor }}
        />

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-200"
                style={{ 
                  background: `${accentColor}15`,
                  color: accentColor
                }}
              >
                <NodeIcon type={node.type} color={accentColor} />
              </div>
              <div>
                <h3 
                  className="font-semibold text-sm leading-tight mb-0.5"
                  style={{ color: theme.text }}
                >
                  {node.data.label}
                </h3>
                <p 
                  className="text-xs font-medium"
                  style={{ color: accentColor }}
                >
                  {node.type.toUpperCase()}
                </p>
              </div>
            </div>
            <button 
              className="p-1 rounded hover:bg-black/5 transition-colors"
              style={{ color: theme.textSecondary }}
            >
              <MoreHorizontal size={16} />
            </button>
          </div>

          {node.data.description && (
            <p 
              className="text-xs mb-3 line-clamp-2"
              style={{ color: theme.textSecondary }}
            >
              {node.data.description}
            </p>
          )}

          {/* Status Indicator */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex h-2 w-2 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${node.data.status === 'running' ? 'bg-green-400' : 'hidden'}`}></span>
              <span 
                className="relative inline-flex rounded-full h-2 w-2"
                style={{ 
                  background: node.data.status === 'running' ? theme.node.green : theme.stroke 
                }}
              ></span>
            </div>
            <span 
              className="text-[10px] uppercase tracking-wider font-semibold"
              style={{ color: theme.textSecondary }}
            >
              {node.data.status || 'IDLE'}
            </span>
          </div>
        </div>
      </div>

      {/* Input Handle */}
      {node.inputs.length > 0 && (
        <div 
          className="absolute -left-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 transition-colors duration-200 hover:scale-125 bg-white dark:bg-black"
          style={handleStyle}
        />
      )}

      {/* Output Handle */}
      {node.outputs.length > 0 && (
        <div 
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 transition-colors duration-200 hover:scale-125 bg-white dark:bg-black"
          style={handleStyle}
        />
      )}

      {/* Add Buttons (Appears on Hover) */}
      <AddButton direction="top" className="-top-3 left-1/2 -translate-x-1/2" />
      <AddButton direction="bottom" className="-bottom-3 left-1/2 -translate-x-1/2" />
      <AddButton direction="left" className="top-1/2 -translate-y-1/2 -left-3" />
      <AddButton direction="right" className="top-1/2 -translate-y-1/2 -right-3" />

    </div>
  );
});