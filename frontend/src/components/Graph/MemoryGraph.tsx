import React, { useMemo, useEffect } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    Node,
    Edge,
    useNodesState,
    useEdgesState,
    ControlButton,
    useReactFlow,
    ReactFlowProvider
} from 'reactflow';
import { Plus, Minus, Fullscreen } from 'lucide-react';
import 'reactflow/dist/style.css';

import { StackFrameNode } from './nodes/StackFrameNode';
import { HeapObjectNode } from './nodes/HeapObjectNode';

// Map custom node types
const nodeTypes = {
    stackFrame: StackFrameNode,
    heapObject: HeapObjectNode,
};

interface MemoryGraphProps {
    nodes: Node[];
    edges: Edge[];
}

const MemoryGraphInner: React.FC<MemoryGraphProps> = ({ nodes: initialNodes, edges: initialEdges }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const instance = useReactFlow();

    // Sync local state when props change (step change)
    useEffect(() => {
        setNodes(initialNodes);
        setEdges(initialEdges);
    }, [initialNodes, initialEdges, setNodes, setEdges]);

    // Enhanced edge styles
    const styledEdges = useMemo(() => edges.map(edge => ({
        ...edge,
        animated: true,
        type: 'smoothstep',
        label: (edge.label as string)?.toUpperCase(),
        labelStyle: {
            fill: 'var(--graph-edge-label-text)',
            fontWeight: 800,
            fontSize: '9px',
            fontFamily: "'JetBrains Mono', monospace",
        },
        labelBgStyle: {
            fill: 'var(--graph-edge-label-bg)',
            fillOpacity: 1,
            stroke: 'var(--graph-edge-label-bg)',
            strokeWidth: 2,
        },
        labelBgPadding: [6, 4],
        labelBgBorderRadius: 4,
        style: {
            stroke: 'var(--graph-edge-color)',
            strokeWidth: 2,
            strokeDasharray: '5,5',
        },
    }) as Edge), [edges]);

    return (
        <div className="w-full h-full bg-[var(--bg-console)] fixed-dot-grid transition-colors duration-300 relative group/graph">
            <ReactFlow
                nodes={nodes}
                edges={styledEdges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                onInit={(rfInstance) => {
                    setTimeout(() => {
                        rfInstance.setViewport({ x: 100, y: 100, zoom: 0.7 });
                    }, 100);
                }}
                minZoom={0.1}
                maxZoom={2}
                defaultEdgeOptions={{
                    type: 'smoothstep',
                }}
                nodesDraggable={true}
                elementsSelectable={true}
            >
                <Controls
                    showInteractive={false}
                    showZoom={false}
                    showFitView={false}
                    className="flex flex-col gap-0.5 p-0.5 bg-[var(--bg-panel-header)] border border-[var(--border-medium)] rounded shadow-xl !left-3 !bottom-3 m-0 [&_button]:!bg-transparent [&_button]:!border-none [&_button]:!w-[18px] [&_button]:!h-[18px] [&_button]:!rounded-sm [&_svg]:!fill-none [&_svg]:!stroke-2 [&_svg]:!stroke-[var(--text-secondary)] [&_svg]:!max-w-none [&_svg]:!max-h-none [&_button:hover]:!bg-[var(--bg-surface-hover)] transition-all"
                >
                    <ControlButton onClick={() => instance?.zoomIn()} title="Zoom In">
                        <Plus size={11} />
                    </ControlButton>
                    <ControlButton onClick={() => instance?.zoomOut()} title="Zoom Out">
                        <Minus size={11} />
                    </ControlButton>
                    <ControlButton onClick={() => instance?.fitView({ duration: 400 })} title="Fit View">
                        <Fullscreen size={11} />
                    </ControlButton>
                </Controls>

                <MiniMap
                    nodeColor={(n) => {
                        if (n.type === 'stackFrame') return '#f59e0b';
                        if (n.type === 'heapObject') return '#10b981';
                        return '#3f3f46';
                    }}
                    maskColor="var(--bg-root)"
                    className="bg-[var(--bg-panel-header)] border border-[var(--border-medium)] rounded-md overflow-hidden !right-4 !bottom-4 m-0 shadow-xl"
                    style={{
                        height: 100,
                        width: 140
                    }}
                />
            </ReactFlow>

            {/* Overlay hint */}
            <div className="absolute top-4 right-4 pointer-events-none opacity-80 group-hover/graph:opacity-100 transition-opacity">
                <div className="flex items-center gap-4 bg-[var(--bg-panel-header)] border border-[var(--border-medium)] px-3 py-1.5 rounded-md shadow-lg">
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span className="text-[9px] uppercase font-bold text-[var(--text-secondary)] tracking-[0.1em]">Stack</span>
                    </div>
                    <div className="flex items-center gap-2 h-3 w-px bg-[var(--border-subtle)]" />
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[9px] uppercase font-bold text-[var(--text-secondary)] tracking-[0.1em]">Heap</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const MemoryGraph: React.FC<MemoryGraphProps> = (props) => (
    <ReactFlowProvider>
        <MemoryGraphInner {...props} />
    </ReactFlowProvider>
);
