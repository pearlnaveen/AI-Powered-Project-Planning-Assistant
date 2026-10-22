import React, { useMemo } from 'react';
import { ReactFlow, Background, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Layers, Server, Database, Sparkles, ArrowRight } from 'lucide-react';

export default function ArchitectureGraph({ architecture }) {
  const components = architecture?.components || [];
  const dataFlow = architecture?.data_flow || [];

  // Generate nodes and edges dynamically based on components array
  const { nodes, edges } = useMemo(() => {
    const nodeColors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];
    
    const formattedNodes = components.map((comp, idx) => {
      const color = nodeColors[idx % nodeColors.length];
      const isFrontend = comp.name.toLowerCase().includes('front') || comp.name.toLowerCase().includes('user') || comp.name.toLowerCase().includes('ui');
      const isBackend = comp.name.toLowerCase().includes('back') || comp.name.toLowerCase().includes('api') || comp.name.toLowerCase().includes('server');
      const isDB = comp.name.toLowerCase().includes('data') || comp.name.toLowerCase().includes('db') || comp.name.toLowerCase().includes('sqlite');
      const isAI = comp.name.toLowerCase().includes('ai') || comp.name.toLowerCase().includes('ml') || comp.name.toLowerCase().includes('model');

      // Grid position logic
      let x = 100 + (idx % 2) * 320;
      let y = 50 + Math.floor(idx / 2) * 160;

      if (components.length === 4) {
        // Horizontal flow order
        if (isFrontend) { x = 40; y = 100; }
        else if (isBackend) { x = 320; y = 100; }
        else if (isAI) { x = 600; y = 30; }
        else if (isDB) { x = 600; y = 180; }
      }

      return {
        id: `node-${idx}`,
        position: { x, y },
        data: {
          label: (
            <div style={{
              background: '#0d1322',
              border: `2px solid ${color}`,
              borderRadius: '12px',
              padding: '14px 18px',
              color: '#ffffff',
              minWidth: '220px',
              boxShadow: `0 8px 24px ${color}30`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
                <strong style={{ fontSize: '0.95rem', color }}>{comp.name}</strong>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#9ca3af', margin: 0, lineHeight: 1.4 }}>
                {comp.responsibility}
              </p>
            </div>
          )
        },
        style: { background: 'transparent', border: 'none', padding: 0 }
      };
    });

    // Generate edges connecting components sequentially or in client-server pattern
    const formattedEdges = [];
    if (components.length >= 2) {
      formattedEdges.push({ id: 'e0-1', source: 'node-0', target: 'node-1', animated: true });
    }
    if (components.length >= 3) {
      formattedEdges.push({ id: 'e1-2', source: 'node-1', target: 'node-2', animated: true });
    }
    if (components.length >= 4) {
      formattedEdges.push({ id: 'e1-3', source: 'node-1', target: 'node-3', animated: true });
    }

    return { nodes: formattedNodes, edges: formattedEdges };
  }, [components]);

  return (
    <div>
      {/* Architecture Style Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
            Architecture Pattern
          </span>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '2px 0 0 0', color: '#a5b4fc' }}>
            {architecture?.architecture_style || 'Modular Client-Server Architecture'}
          </h3>
        </div>
        <span className="badge badge-indigo">React Flow Visualizer</span>
      </div>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px', lineHeight: 1.6 }}>
        {architecture?.architecture_description}
      </p>

      {/* Interactive React Flow Diagram Canvas */}
      <div className="glass-panel" style={{ height: '360px', width: '100%', borderRadius: 'var(--radius-md)', overflow: 'hidden', position: 'relative', marginBottom: '30px' }}>
        <ReactFlow nodes={nodes} edges={edges} fitView>
          <Background color="#6366f1" gap={20} size={1} style={{ opacity: 0.15 }} />
          <Controls style={{ background: '#121826', borderColor: 'var(--border-color)', color: '#fff' }} />
        </ReactFlow>
      </div>

      {/* Component Responsibility Cards Grid */}
      <div style={{ marginBottom: '30px' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px', color: 'var(--text-main)' }}>
          System Component Breakdown
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          {components.map((comp, idx) => (
            <div key={idx} className="glass-panel" style={{ padding: '16px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>Component {idx + 1}</span>
                <h5 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
                  {comp.name}
                </h5>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                {comp.responsibility}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Data Flow Steps List */}
      <div>
        <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px', color: 'var(--text-main)' }}>
          Data Flow Sequence
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {dataFlow.map((step, idx) => (
            <div key={idx} className="glass-panel" style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }}>
                {idx + 1}
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', margin: 0 }}>
                {step}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
