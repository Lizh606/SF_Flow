import React, { useState, useEffect } from 'react';
import { ThemeColors, NodeType, Category } from '../types';
import { NodeIcon } from './NodeIcon';
import { Search } from 'lucide-react';
import { DRAGGABLE_NODES } from '../constants';

interface NodeLibraryPopoverProps {
  theme: ThemeColors;
  isOpen: boolean;
  position: { x: number, y: number } | null;
  onClose: () => void;
  onSelect: (type: NodeType) => void;
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

export const NodeLibraryPopover: React.FC<NodeLibraryPopoverProps> = ({ theme, isOpen, position, onClose, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !position) return null;

  const filteredNodes = DRAGGABLE_NODES.filter(node => 
    node.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedNodes = filteredNodes.reduce((acc, node) => {
    if (!acc[node.category]) acc[node.category] = [];
    acc[node.category].push(node);
    return acc;
  }, {} as Record<Category, typeof DRAGGABLE_NODES>);

  const categories = Object.keys(groupedNodes) as Category[];

  // Adjust position to stay on screen (basic handling)
  const stylePos: React.CSSProperties = {
    top: position.y,
    left: position.x,
  };

  return (
    <>
      {/* Invisible Backdrop for click-outside */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Popover */}
      <div 
        className="fixed z-50 w-64 rounded-xl border shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100"
        style={{ 
          background: theme.surface, 
          borderColor: theme.stroke,
          color: theme.text,
          maxHeight: '400px',
          ...stylePos
        }}
      >
        {/* Search Header */}
        <div className="p-2 border-b flex items-center gap-2" style={{ borderColor: theme.stroke }}>
          <Search size={14} className="opacity-50 ml-1" />
          <input 
            autoFocus
            type="text" 
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent outline-none text-xs font-medium placeholder-opacity-40 h-6"
            style={{ color: theme.text }}
          />
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-1 custom-scrollbar">
          {filteredNodes.length === 0 ? (
             <div className="text-center py-4 opacity-50 text-xs">No nodes found</div>
          ) : (
            categories.map((category) => (
              <div key={category} className="mb-1">
                <h3 className="text-[10px] font-bold uppercase tracking-wider opacity-40 px-3 py-1.5 mt-1">{category}</h3>
                <div className="space-y-0.5">
                  {groupedNodes[category]?.map((node) => {
                    const color = getNodeColor(node.type, theme.node);
                    return (
                      <button
                        key={node.type}
                        onClick={() => onSelect(node.type)}
                        className="flex items-center gap-3 w-full p-2 rounded-lg text-left transition-colors hover:bg-blue-500/5 group"
                      >
                         <div 
                          className="w-7 h-7 rounded flex items-center justify-center shrink-0 transition-colors"
                          style={{ 
                            background: `${color}15`,
                            color: color,
                          }}
                        >
                          <NodeIcon type={node.type} color={color} size={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold truncate group-hover:text-blue-500 transition-colors">{node.label}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};