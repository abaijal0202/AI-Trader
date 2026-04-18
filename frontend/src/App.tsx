import React, { useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Activity, Brain, Database, ShieldAlert, Zap } from 'lucide-react';

const initialNodes: Node[] = [
  { 
    id: '1', 
    position: { x: 50, y: 150 }, 
    data: { label: <div className="flex flex-col items-center p-2"><Database className="mb-2 text-blue-400" /><span>Market Data Fetcher</span></div> },
    className: 'bg-gray-800 text-white border-blue-500 border-2 w-48'
  },
  { 
    id: '2', 
    position: { x: 50, y: 50 }, 
    data: { label: <div className="flex flex-col items-center p-2"><Activity className="mb-2 text-purple-400" /><span>News Sentiment Agent</span></div> },
    className: 'bg-gray-800 text-white border-purple-500 border-2 w-48'
  },
  { 
    id: '3', 
    position: { x: 300, y: 100 }, 
    data: { label: <div className="flex flex-col items-center p-2"><Brain className="mb-2 text-yellow-400" /><span>Signal Selection Agent</span></div> },
    className: 'bg-gray-800 text-white border-yellow-500 border-2 w-48'
  },
  { 
    id: '4', 
    position: { x: 550, y: 100 }, 
    data: { label: <div className="flex flex-col items-center p-2"><ShieldAlert className="mb-2 text-red-400" /><span>Risk Management Agent</span></div> },
    className: 'bg-gray-800 text-white border-red-500 border-2 w-48'
  },
  { 
    id: '5', 
    position: { x: 800, y: 100 }, 
    data: { label: <div className="flex flex-col items-center p-2"><Zap className="mb-2 text-green-400" /><span>Execution Agent</span></div> },
    className: 'bg-gray-800 text-white border-green-500 border-2 w-48'
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-3', source: '1', target: '3', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 } },
  { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#a855f7', strokeWidth: 2 } },
  { id: 'e3-4', source: '3', target: '4', animated: true, style: { stroke: '#eab308', strokeWidth: 2 } },
  { id: 'e4-5', source: '4', target: '5', animated: true, style: { stroke: '#22c55e', strokeWidth: 2 } },
];

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  return (
    <div className="w-screen h-screen flex flex-col bg-gray-900 text-white font-sans">
      <header className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-950">
        <div className="flex items-center gap-3">
          <Zap className="text-blue-500" />
          <h1 className="text-xl font-bold tracking-tight">Agentic AI Trading System</h1>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-gray-400">System Active</span>
          </div>
          <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors">
            KILL SWITCH
          </button>
        </div>
      </header>
      
      <main className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          className="bg-gray-900"
          colorMode="dark"
        >
          <Controls className="bg-gray-800 fill-white text-white border-gray-700" />
          <MiniMap 
            nodeColor={(n) => {
              if (n.id === '1') return '#3b82f6';
              if (n.id === '2') return '#a855f7';
              if (n.id === '3') return '#eab308';
              if (n.id === '4') return '#ef4444';
              if (n.id === '5') return '#22c55e';
              return '#1f2937';
            }}
            maskColor="rgba(17, 24, 39, 0.8)"
            className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden"
          />
          <Background color="#374151" gap={16} />
        </ReactFlow>
        
        {/* Overlay dashboard panel */}
        <div className="absolute bottom-6 left-6 w-80 bg-gray-800/90 backdrop-blur border border-gray-700 rounded-xl p-4 shadow-2xl">
          <h3 className="font-semibold text-gray-200 mb-3 border-b border-gray-700 pb-2">Live Execution Log</h3>
          <div className="space-y-3 text-sm">
            <div className="flex gap-2 text-gray-400">
              <span className="text-blue-400 shrink-0">10:42:15</span>
              <span>Signal Agent generated BUY for ITC (Conf: 85%)</span>
            </div>
            <div className="flex gap-2 text-gray-400">
              <span className="text-blue-400 shrink-0">10:42:16</span>
              <span>Risk Agent approved. Margin sufficiency: OK.</span>
            </div>
            <div className="flex gap-2 text-gray-400">
              <span className="text-blue-400 shrink-0">10:42:16</span>
              <span className="text-green-400">Execution Agent placed LIMIT order @ 430.50</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
