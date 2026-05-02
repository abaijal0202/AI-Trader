import { useCallback, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from '@xyflow/react';
import type { Connection, Edge, Node } from '@xyflow/react';
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
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [symbol, setSymbol] = useState('RELIANCE');
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<{time: string, message: string, color: string}[]>([]);

  const runTrader = async () => {
    if (!symbol) return;
    setIsRunning(true);
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), message: `Started cycle for ${symbol}...`, color: 'text-gray-400' }]);
    
    try {
      const response = await fetch(`http://localhost:8000/run/${symbol}`, { method: 'POST' });
      const data = await response.json();
      
      if (data.status === 'completed') {
        setLogs(prev => [
          ...prev,
          { time: new Date().toLocaleTimeString(), message: `Sentiment Agent: ${data.sentiment.sentiment} (Score: ${data.sentiment.score})`, color: 'text-purple-400' },
          { time: new Date().toLocaleTimeString(), message: `Signal Agent: ${data.signal.action} (Conf: ${data.signal.confidence}%)`, color: 'text-yellow-400' },
          { time: new Date().toLocaleTimeString(), message: `Risk Agent approved: ${data.risk_passed ? 'Yes' : 'No'}`, color: data.risk_passed ? 'text-green-400' : 'text-red-400' },
          { time: new Date().toLocaleTimeString(), message: `Execution: ${data.execution.status || 'Skipped'}`, color: 'text-blue-400' }
        ]);
      } else {
        setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), message: `Error: ${data.message || 'Cycle failed'}`, color: 'text-red-400' }]);
      }
    } catch (error) {
      setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), message: `API Error: ${error}`, color: 'text-red-400' }]);
    } finally {
      setIsRunning(false);
    }
  };

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
            <span className={`w-2 h-2 rounded-full animate-pulse ${isRunning ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
            <span className="text-gray-400">{isRunning ? 'Cycle Running...' : 'System Active'}</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-md overflow-hidden">
             <input 
                type="text" 
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="SYMBOL" 
                className="bg-transparent text-white px-3 py-2 outline-none w-28 uppercase"
             />
             <button 
                onClick={runTrader}
                disabled={isRunning}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white font-medium transition-colors border-l border-gray-700"
             >
                RUN TRADER
             </button>
          </div>
          <button 
            onClick={() => {
              setSymbol('');
              setLogs([{ time: new Date().toLocaleTimeString(), message: 'SYSTEM KILLED. All operations halted.', color: 'text-red-500 font-bold' }]);
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors"
          >
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
        <div className="absolute bottom-6 left-6 w-[400px] max-h-64 overflow-y-auto bg-gray-800/90 backdrop-blur border border-gray-700 rounded-xl p-4 shadow-2xl">
          <h3 className="font-semibold text-gray-200 mb-3 border-b border-gray-700 pb-2 flex justify-between">
            <span>Live Execution Log</span>
            <button onClick={() => setLogs([])} className="text-xs text-gray-400 hover:text-white">Clear</button>
          </h3>
          <div className="space-y-3 text-sm">
            {logs.length === 0 ? (
                <div className="text-gray-500 italic text-center py-4">Awaiting execution...</div>
            ) : (
                logs.map((log, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-gray-500 shrink-0">{log.time}</span>
                    <span className={log.color}>{log.message}</span>
                  </div>
                ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
