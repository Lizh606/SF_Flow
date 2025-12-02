import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ThemeColors, Node, Connection, Position } from '../types';
import { NodeComponent } from './Node';
import { ConnectionLine } from './Connection';

interface WorkflowCanvasProps {
  theme: ThemeColors;
  nodes: Node[];
  connections: Connection[];
  selectedNodeId: string | null;
  onNodeSelect: (id: string | null) => void;
  onNodesChange: (nodes: Node[]) => void;
  onAddNode: (e: React.MouseEvent, sourceNodeId: string, direction: 'top' | 'right' | 'bottom' | 'left') => void;
}

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({ 
  theme, 
  nodes, 
  connections, 
  selectedNodeId, 
  onNodeSelect, 
  onNodesChange,
  onAddNode
}) => {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState<Position>({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [isDraggingNode, setIsDraggingNode] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<Position>({ x: 0, y: 0 });
  const nodeDragStartRef = useRef<Position>({ x: 0, y: 0 });

  // Handle Zoom
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomFactor = 0.05;
      const newScale = Math.min(Math.max(scale - Math.sign(e.deltaY) * zoomFactor, 0.2), 3);
      setScale(newScale);
    } else {
      // Pan on wheel if not zooming
      setOffset(prev => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY
      }));
    }
  };

  // Canvas Panning
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && !isDraggingNode)) { // Middle click or left click on bg
      setIsDraggingCanvas(true);
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      onNodeSelect(null);
    }
  };

  // Node Dragging Setup
  const handleNodeMouseDown = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent canvas drag
    setIsDraggingNode(id);
    onNodeSelect(id);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    
    const node = nodes.find(n => n.id === id);
    if (node) {
      nodeDragStartRef.current = { ...node.position };
    }
  }, [nodes, onNodeSelect]);

  // Global Mouse Move & Up
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingCanvas) {
        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;
        setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        dragStartRef.current = { x: e.clientX, y: e.clientY };
      } else if (isDraggingNode) {
        const dx = (e.clientX - dragStartRef.current.x) / scale;
        const dy = (e.clientY - dragStartRef.current.y) / scale;
        
        // Accumulate delta from start
        const totalDx = (e.clientX - dragStartRef.current.x) / scale;
        const totalDy = (e.clientY - dragStartRef.current.y) / scale;
        
        onNodesChange(nodes.map(n => {
             if(n.id === isDraggingNode) {
                 return {
                     ...n,
                     position: {
                         x: nodeDragStartRef.current.x + totalDx,
                         y: nodeDragStartRef.current.y + totalDy
                     }
                 }
             }
             return n;
         }));
      }
    };

    const handleMouseUp = () => {
      setIsDraggingCanvas(false);
      setIsDraggingNode(null);
    };

    if (isDraggingCanvas || isDraggingNode) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingCanvas, isDraggingNode, scale, nodes, onNodesChange]);

  // Render Connections
  const renderConnections = () => {
    return connections.map(conn => {
      const source = nodes.find(n => n.id === conn.sourceNodeId);
      const target = nodes.find(n => n.id === conn.targetNodeId);

      if (!source || !target) return null;

      // Calculate simple handle positions (right center for source, left center for target)
      // Assuming node width ~240px and height variable, let's approximate
      // A real system would measure DOM elements
      const sourceX = source.position.x + 240; 
      const sourceY = source.position.y + 60; // Approximate center y
      const targetX = target.position.x;
      const targetY = target.position.y + 60;

      return (
        <ConnectionLine 
          key={conn.id}
          start={{ x: sourceX, y: sourceY }}
          end={{ x: targetX, y: targetY }}
          theme={theme}
          active={true}
        />
      );
    });
  };

  return (
    <div 
      ref={canvasRef}
      className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing"
      style={{ background: theme.background }}
      onMouseDown={handleCanvasMouseDown}
      onWheel={handleWheel}
    >
      {/* Grid Pattern Background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20 dot-pattern"
        style={{ 
          '--dot-color': theme.stroke,
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          transformOrigin: '0 0'
        } as React.CSSProperties}
      />

      {/* Transform Container */}
      <div 
        className="absolute inset-0 w-full h-full origin-top-left"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`
        }}
      >
        {/* Connection Layer (SVG) */}
        <svg className="absolute inset-0 w-[5000px] h-[5000px] pointer-events-none overflow-visible">
          {renderConnections()}
        </svg>

        {/* Nodes Layer */}
        <div className="absolute inset-0">
          {nodes.map(node => (
            <NodeComponent 
              key={node.id}
              node={node}
              theme={theme}
              isSelected={selectedNodeId === node.id}
              onMouseDown={handleNodeMouseDown}
              onAddClick={onAddNode}
              scale={scale}
            />
          ))}
        </div>
      </div>

      {/* Controls Overlay */}
      <div className="absolute bottom-6 left-6 flex gap-2">
         <div className="px-3 py-1 rounded bg-black/10 backdrop-blur text-xs font-mono" style={{ color: theme.textSecondary }}>
            {Math.round(scale * 100)}%
         </div>
      </div>
    </div>
  );
};