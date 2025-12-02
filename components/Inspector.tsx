import React from 'react';
import { ThemeColors, Node } from '../types';
import { Settings, Trash2, X, Sliders } from 'lucide-react';

interface InspectorProps {
  theme: ThemeColors;
  selectedNode: Node | null;
  isOpen: boolean;
  onUpdateNode: (id: string, data: Partial<Node['data']>) => void;
  onDeleteNode: (id: string) => void;
  onClose: () => void;
}

export const Inspector: React.FC<InspectorProps> = ({ 
  theme, 
  selectedNode, 
  isOpen, 
  onUpdateNode, 
  onDeleteNode,
  onClose
}) => {
  // Logic: Panel only shows if it's "open" AND we have a selected node.
  // The App.tsx handles closing it if no node is selected, but we double check here for safety.
  const showPanel = isOpen && selectedNode;

  return (
    <div 
      className={`border-l flex flex-col z-20 transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] whitespace-nowrap overflow-hidden ${showPanel ? 'w-80 opacity-100' : 'w-0 opacity-0 border-none'}`}
      style={{ 
        background: theme.surface, 
        borderColor: theme.stroke,
        color: theme.text
      }}
    >
      {selectedNode && (
        <>
          <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: theme.stroke }}>
            <div className="flex items-center gap-2">
               <div className={`p-1.5 rounded bg-blue-500/10 text-blue-500`}>
                  <Sliders size={16} />
               </div>
               <h2 className="text-sm font-bold tracking-tight">Configuration</h2>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => onDeleteNode(selectedNode.id)}
                className="p-1.5 rounded hover:bg-red-500/10 hover:text-red-500 transition-colors opacity-60 hover:opacity-100"
                title="Delete Node"
              >
                <Trash2 size={16} />
              </button>
              <button 
                onClick={onClose}
                className="p-1.5 rounded hover:bg-black/10 transition-colors opacity-60 hover:opacity-100"
                title="Close Inspector"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
            {/* Header Section */}
            <div className="space-y-4">
               <div>
                  <label className="text-xs font-semibold opacity-50 uppercase mb-1.5 block">Node ID</label>
                  <div className="font-mono text-xs opacity-70 bg-black/5 px-2 py-1 rounded w-fit">{selectedNode.id}</div>
               </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold opacity-50 uppercase block">Label</label>
                <input 
                  type="text" 
                  value={selectedNode.data.label}
                  onChange={(e) => onUpdateNode(selectedNode.id, { label: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg text-sm border focus:ring-2 focus:ring-blue-500/50 outline-none transition-all font-medium shadow-sm"
                  style={{ 
                    background: theme.background, 
                    borderColor: theme.stroke,
                    color: theme.text 
                  }}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold opacity-50 uppercase block">Description</label>
                <textarea 
                  value={selectedNode.data.description || ''}
                  onChange={(e) => onUpdateNode(selectedNode.id, { description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-lg text-sm border focus:ring-2 focus:ring-blue-500/50 outline-none transition-all resize-none shadow-sm"
                  style={{ 
                    background: theme.background, 
                    borderColor: theme.stroke,
                    color: theme.text 
                  }}
                />
              </div>
            </div>

            <div className="h-[1px] w-full" style={{ background: theme.stroke }} />

            {/* Dynamic Properties */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                 <Settings size={14} className="text-blue-500" />
                 <span className="text-xs font-bold uppercase tracking-wider opacity-70">Parameters</span>
              </div>
              
              <div className="p-4 rounded-xl border space-y-5 shadow-sm" style={{ borderColor: theme.stroke, background: theme.surfaceHighlight }}>
                 <div className="flex items-center justify-between text-sm">
                   <span className="font-medium">Active State</span>
                   <button 
                    onClick={() => onUpdateNode(selectedNode.id, { status: selectedNode.data.status === 'running' ? 'idle' : 'running' })}
                    className={`w-11 h-6 rounded-full relative cursor-pointer transition-all duration-300 ${selectedNode.data.status === 'running' ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                   >
                     <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${selectedNode.data.status === 'running' ? 'left-[calc(100%-20px)]' : 'left-1'}`}></div>
                   </button>
                 </div>
                 
                 {(selectedNode.type === 'detection' || selectedNode.type === 'tracking') && (
                   <div className="space-y-4 pt-1">
                     <div className="space-y-2">
                       <div className="flex justify-between text-xs font-medium opacity-80">
                          <span>Confidence Threshold</span>
                          <span>0.65</span>
                       </div>
                       <div className="h-2 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                         <div className="h-full bg-blue-500 w-[65%] rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                       </div>
                     </div>
                     
                     <div className="space-y-2">
                       <div className="flex justify-between text-xs font-medium opacity-80">
                          <span>IOU Threshold</span>
                          <span>0.45</span>
                       </div>
                       <div className="h-2 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                         <div className="h-full bg-purple-500 w-[45%] rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
                       </div>
                     </div>
                   </div>
                 )}

                 {selectedNode.type === 'input' && (
                    <div className="text-xs opacity-70 grid grid-cols-2 gap-3">
                        <div className="p-2 rounded bg-black/5 dark:bg-white/5 border border-transparent hover:border-blue-500/30 transition-colors">
                            <span className="block opacity-60 mb-1">Resolution</span>
                            <span className="font-mono font-bold">1080p</span>
                        </div>
                        <div className="p-2 rounded bg-black/5 dark:bg-white/5 border border-transparent hover:border-blue-500/30 transition-colors">
                            <span className="block opacity-60 mb-1">FPS</span>
                            <span className="font-mono font-bold">30</span>
                        </div>
                    </div>
                 )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};