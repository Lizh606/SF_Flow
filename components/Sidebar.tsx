import React, { useState } from 'react';
import { ThemeColors, NodeType, Category, ThemeMode } from '../types';
import { NodeIcon } from './NodeIcon';
import { Search, ChevronDown, ChevronRight, GripVertical, PanelLeftClose } from 'lucide-react';
import { DRAGGABLE_NODES } from '../constants';

interface SidebarProps {
  theme: ThemeColors;
  mode: ThemeMode;
  isOpen: boolean;
  onClose: () => void;
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

export const Sidebar: React.FC<SidebarProps> = ({ theme, mode, isOpen, onClose }) => {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'Source': true,
    'AI Model': true,
    'Logic': true,
    'Output': true,
  });

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const groupedNodes = DRAGGABLE_NODES.reduce((acc, node) => {
    if (!acc[node.category]) acc[node.category] = [];
    acc[node.category].push(node);
    return acc;
  }, {} as Record<Category, typeof DRAGGABLE_NODES>);

  const categories: Category[] = ['Source', 'AI Model', 'Logic', 'Output'];

  return (
    <div 
      className={`border-r flex flex-col z-20 transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] whitespace-nowrap overflow-hidden ${isOpen ? 'w-80 opacity-100' : 'w-0 opacity-0 border-none'}`}
      style={{ 
        background: theme.surface, 
        borderColor: theme.stroke,
        color: theme.text
      }}
    >
      <div className="p-4 border-b flex-shrink-0" style={{ borderColor: theme.stroke }}>
        <div className="flex items-center justify-between mb-4 opacity-60">
          <h2 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
            <span>Component Library</span>
            <span className="bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded text-[10px] font-mono">V2.4</span>
          </h2>
          <button 
            onClick={onClose}
            className="p-1 rounded hover:bg-black/10 transition-colors"
            title="Collapse Sidebar"
          >
            <PanelLeftClose size={16} />
          </button>
        </div>
        
        <div 
          className="flex items-center px-3 py-2.5 rounded-lg gap-2 text-sm transition-all focus-within:ring-2 focus-within:ring-blue-500/20 group"
          style={{ background: theme.background }}
        >
          <Search size={16} className="opacity-40 group-focus-within:opacity-100 group-focus-within:text-blue-500 transition-opacity" />
          <input 
            type="text" 
            placeholder="Search nodes..." 
            className="bg-transparent outline-none w-full placeholder-opacity-40 text-sm"
            style={{ color: theme.text }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {categories.map((category) => (
          <div key={category} className="mb-6">
            <button 
              onClick={() => toggleCategory(category)}
              className="flex items-center gap-2 w-full text-xs font-bold uppercase tracking-wider mb-3 opacity-50 hover:opacity-100 transition-opacity"
            >
              {expandedCategories[category] ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              {category}
            </button>
            
            {expandedCategories[category] && (
              <div className="space-y-3 pl-1">
                {groupedNodes[category]?.map((node) => {
                  const color = getNodeColor(node.type, theme.node);
                  return (
                    <div
                      key={node.type}
                      className="group relative p-3 rounded-xl border cursor-grab active:cursor-grabbing transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                      style={{ 
                        background: theme.surfaceHighlight,
                        borderColor: 'transparent'
                      }}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('application/reactflow/type', node.type);
                      }}
                    >
                      {/* Hover Border & Glow */}
                      <div 
                        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none border-2"
                        style={{ borderColor: `${color}40`, boxShadow: `0 4px 20px ${color}15` }}
                      />

                      <div className="flex items-start gap-3 relative z-10">
                        {/* Icon Box */}
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors shadow-sm"
                          style={{ 
                            background: mode === 'dark' ? `${color}20` : '#fff',
                            color: color,
                            boxShadow: mode === 'light' ? '0 2px 5px rgba(0,0,0,0.05)' : 'none'
                          }}
                        >
                          <NodeIcon type={node.type} color={color} size={20} />
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="flex justify-between items-center">
                            <h3 className="text-sm font-semibold truncate leading-tight group-hover:text-blue-500 transition-colors">{node.label}</h3>
                            <GripVertical size={14} className="opacity-0 group-hover:opacity-30 transition-opacity" />
                          </div>
                          <p className="text-[11px] opacity-50 truncate mt-1 font-medium leading-normal">{node.desc}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};