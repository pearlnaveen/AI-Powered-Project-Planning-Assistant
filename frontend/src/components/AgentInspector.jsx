import React, { useState } from 'react';
import { Bot, ChevronRight, Code2, Eye, Target, UserCheck, ArrowDown, CheckCircle2 } from 'lucide-react';

export default function AgentInspector({ agentLogs = [] }) {
  const [selectedAgentIndex, setSelectedAgentIndex] = useState(0);

  if (!agentLogs || agentLogs.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
        No agent execution traces available.
      </div>
    );
  }

  const currentLog = agentLogs[selectedAgentIndex] || agentLogs[0];

  return (
    <div>
      {/* Intro Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <Bot size={20} color="var(--primary)" />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }} className="gradient-text">
            Academic Agent Execution Trace
          </h3>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
          Inspect the role-based specialization, input context passing, and raw JSON generated at each stage of the LangGraph agentic pipeline.
        </p>
      </div>

      {/* Visual Agent Chain Stepper Workflow */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '700px' }}>
          {agentLogs.map((log, idx) => {
            const isSelected = selectedAgentIndex === idx;
            return (
              <React.Fragment key={idx}>
                <div
                  onClick={() => setSelectedAgentIndex(idx)}
                  className="glass-panel"
                  style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    borderColor: isSelected ? 'var(--primary)' : 'var(--border-color)',
                    background: isSelected ? 'rgba(99, 102, 241, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                    flex: 1,
                    transition: 'all 0.2s',
                    boxShadow: isSelected ? '0 0 16px rgba(99, 102, 241, 0.3)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: isSelected ? '#a5b4fc' : 'var(--text-dim)' }}>
                      STEP {idx + 1}
                    </span>
                    <CheckCircle2 size={14} color="#10b981" />
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: isSelected ? '#ffffff' : 'var(--text-main)', whiteSpace: 'nowrap' }}>
                    {log.agent_name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {log.role}
                  </div>
                </div>
                {idx < agentLogs.length - 1 && (
                  <ChevronRight size={18} color="rgba(255, 255, 255, 0.2)" style={{ flexShrink: 0 }} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Selected Agent Details Card */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
        
        {/* Agent Metadata Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                {currentLog.agent_name}
              </h4>
              <span className="badge badge-indigo">
                {currentLog.role}
              </span>
            </div>
          </div>
          <span className="badge badge-emerald">
            Status: Execution Verified
          </span>
        </div>

        {/* Role & Goal Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6366f1', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>
              <UserCheck size={14} />
              <span>AGENT ROLE</span>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', margin: 0 }}>
              {currentLog.role}
            </p>
          </div>

          <div style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#8b5cf6', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>
              <Target size={14} />
              <span>AGENT GOAL</span>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', margin: 0 }}>
              {currentLog.goal}
            </p>
          </div>
        </div>

        {/* Input Context Passed to Agent */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#06b6d4', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>
            <Eye size={16} />
            <span>CONTEXT PASSED FROM PREVIOUS AGENT(S)</span>
          </div>
          <pre style={{
            background: '#070a12',
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            color: '#93c5fd',
            fontSize: '0.82rem',
            overflowX: 'auto',
            border: '1px solid var(--border-color)',
            maxHeight: '180px'
          }}>
            {currentLog.input_context}
          </pre>
        </div>

        {/* Raw LLM Prompt Sent */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>
            <Code2 size={16} />
            <span>EXPLICIT AGENT PROMPT & REASONING TASK</span>
          </div>
          <pre style={{
            background: '#070a12',
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            color: '#fde68a',
            fontSize: '0.8rem',
            overflowX: 'auto',
            border: '1px solid var(--border-color)',
            maxHeight: '200px',
            whiteSpace: 'pre-wrap'
          }}>
            {currentLog.prompt}
          </pre>
        </div>

        {/* Structured Agent Output JSON */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>
            <Code2 size={16} />
            <span>AGENT OUTPUT (STRUCTURED JSON)</span>
          </div>
          <pre style={{
            background: '#070a12',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            color: '#a7f3d0',
            fontSize: '0.82rem',
            overflowX: 'auto',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            maxHeight: '300px'
          }}>
            {JSON.stringify(currentLog.output, null, 2)}
          </pre>
        </div>

      </div>
    </div>
  );
}
