import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Inspector } from './components/Inspector';
import { WorkflowCanvas } from './components/WorkflowCanvas';
import { NodeLibraryPopover } from './components/NodeLibraryModal'; // Importing from file but using renamed export if I could, but here I assume I modified the file content so default/named export matches.
import { LIGHT_THEME, DARK_THEME, INITIAL_NODES, INITIAL_CONNECTIONS } from './constants';
import { ThemeMode, Node, NodeType, Connection } from './types';
import { Plus } from 'lucide-react';

function App() {
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
  const [nodes, setNodes] = useState<Node[]>(INITIAL_NODES);
  const [connections, setConnections] = useState<Connection[]>(INITIAL_CONNECTIONS);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  // Panel states
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  // Popover State
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState<{ x: number, y: number } | null>(null);
  const [pendingNodeAdd, setPendingNodeAdd] = useState<{ sourceId: string; direction: 'top' | 'right' | 'bottom' | 'left' } | null>(null);

  const theme = themeMode === 'dark' ? DARK_THEME : LIGHT_THEME;

  // Auto-open inspector when a node is selected, auto-close when deselected
  useEffect(() => {
    setIsInspectorOpen(!!selectedNodeId);
  }, [selectedNodeId]);

  const toggleTheme = () => {
    setThemeMode(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleUpdateNode = (id: string, data: Partial<Node['data']>) => {
    setNodes(prev => prev.map(n => 
      n.id === id ? { ...n, data: { ...n.data, ...data } } : n
    ));
  };

  const handleDeleteNode = (id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    setConnections(prev => prev.filter(c => c.sourceNodeId !== id && c.targetNodeId !== id));
    setSelectedNodeId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('application/reactflow/type');
    if (!type) return;

    // Use drop position relative to window for simplicity in this demo
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: type as any,
      position: { x: e.clientX - 300, y: e.clientY - 100 }, // Approximate offset
      data: { 
        label: `New ${type}`, 
        status: 'idle',
        description: 'Configure this node' 
      },
      inputs: ['in-1'],
      outputs: ['out-1']
    };

    setNodes(prev => [...prev, newNode]);
  };

  // Handle click on node's "+" button
  const handleAddNodeFromCanvas = (e: React.MouseEvent, sourceId: string, direction: 'top' | 'right' | 'bottom' | 'left') => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    
    // Calculate simple position near the button
    // We'll place it slightly offset so it doesn't cover the mouse immediately
    let x = rect.right + 10;
    let y = rect.top;

    // Boundary checks could be added here, but for now simple offset:
    if (direction === 'left') x = rect.left - 270; // width of popover approx
    if (direction === 'top') y = rect.top - 200;
    if (direction === 'bottom') y = rect.bottom + 10;

    setPopoverPosition({ x, y });
    setPendingNodeAdd({ sourceId, direction });
    setIsPopoverOpen(true);
  };

  // Handle selection from Popover
  const handleSelectNodeFromPopover = (type: NodeType) => {
    if (!pendingNodeAdd) return;

    const sourceNode = nodes.find(n => n.id === pendingNodeAdd.sourceId);
    if (!sourceNode) return;

    const newNodeId = `node-${Date.now()}`;
    const OFFSET_X = 350;
    const OFFSET_Y = 200;

    let newPos = { ...sourceNode.position };

    switch (pendingNodeAdd.direction) {
      case 'right': newPos.x += OFFSET_X; break;
      case 'left': newPos.x -= OFFSET_X; break;
      case 'bottom': newPos.y += OFFSET_Y; break;
      case 'top': newPos.y -= OFFSET_Y; break;
    }

    const newNode: Node = {
      id: newNodeId,
      type: type,
      position: newPos,
      data: {
        label: `New ${type}`,
        status: 'idle',
        description: 'Newly added node'
      },
      inputs: ['in-1'],
      outputs: ['out-1']
    };

    // Auto-connect
    let newConnection: Connection | null = null;
    const connId = `c-${Date.now()}`;

    if (pendingNodeAdd.direction === 'right' || pendingNodeAdd.direction === 'bottom') {
      // Source -> New
      newConnection = {
        id: connId,
        sourceNodeId: sourceNode.id,
        sourceHandle: 'out-1',
        targetNodeId: newNode.id,
        targetHandle: 'in-1'
      };
    } else {
      // New -> Source (Left or Top usually implies feeding into source, but logic depends on user intent.
      // Standard flow: Left usually means Predecessor -> Current. Top means Predecessor -> Current)
      newConnection = {
        id: connId,
        sourceNodeId: newNode.id,
        sourceHandle: 'out-1',
        targetNodeId: sourceNode.id,
        targetHandle: 'in-1'
      };
    }

    setNodes(prev => [...prev, newNode]);
    if (newConnection) {
      setConnections(prev => [...prev, newConnection]);
    }

    setIsPopoverOpen(false);
    setPendingNodeAdd(null);
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || null;

  return (
    <div 
      className="w-full h-screen flex flex-col overflow-hidden text-sm"
      style={{ background: theme.background, color: theme.text }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Navbar 
        theme={theme} 
        mode={themeMode} 
        toggleTheme={toggleTheme}
      />
      
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar 
          theme={theme} 
          mode={themeMode} 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)}
        />
        
        <div className="flex-1 relative h-full flex flex-col">
           {/* Floating Add Node Button */}
           {!isSidebarOpen && (
             <button
               onClick={() => setIsSidebarOpen(true)}
               className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-3 rounded-full font-semibold shadow-xl hover:scale-105 transition-all duration-200 group"
               style={{ 
                 background: theme.primary, 
                 color: '#fff',
                 boxShadow: `0 8px 20px -6px ${theme.primary}80`
               }}
             >
               <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
               <span>Add Node</span>
             </button>
           )}

           <WorkflowCanvas 
            theme={theme}
            nodes={nodes}
            connections={connections}
            selectedNodeId={selectedNodeId}
            onNodeSelect={setSelectedNodeId}
            onNodesChange={setNodes}
            onAddNode={handleAddNodeFromCanvas}
          />
        </div>
        
        <Inspector 
          theme={theme}
          selectedNode={selectedNode}
          isOpen={isInspectorOpen} 
          onUpdateNode={handleUpdateNode}
          onDeleteNode={handleDeleteNode}
          onClose={() => setIsInspectorOpen(false)}
        />
      </div>

      <NodeLibraryPopover 
        theme={theme} 
        isOpen={isPopoverOpen} 
        position={popoverPosition}
        onClose={() => setIsPopoverOpen(false)}
        onSelect={handleSelectNodeFromPopover}
      />
    </div>
  );
}

export default App;