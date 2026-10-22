import React from 'react';
import { CheckCircle2, Loader2, Circle, Bot, Cpu, Layers, Wrench, ListTodo, Calendar, Terminal } from 'lucide-react';

const AGENT_STEPS = [
  {
    id: 'agent_1',
    name: 'Requirement Agent',
    role: 'Requirements Analyst',
    icon: Layers,
    description: 'Analyzing project objectives, target users, and extracting functional & non-functional requirements...'
  },
  {
    id: 'agent_2',
    name: 'Architecture Agent',
    role: 'System Architect',
    icon: Cpu,
    description: 'Designing system architecture, component boundaries, and data flow pipelines...'
  },
  {
    id: 'agent_3',
    name: 'Technology Agent',
    role: 'Technology Consultant',
    icon: Wrench,
    description: 'Selecting optimal tech stack for frontend, backend, database, and AI components...'
  },
  {
    id: 'agent_4',
    name: 'Task Agent',
    role: 'Development Task Planner',
    icon: ListTodo,
    description: 'Breaking down features into small, actionable development tasks with priorities & dependencies...'
  },
  {
    id: 'agent_5',
    name: 'Planning Agent',
    role: 'Project Planner',
    icon: Calendar,
    description: 'Synthesizing tasks into sequential development phases, milestones, and risk mitigations...'
  }
];

export default function ProcessingScreen({ activeAgentId, completedAgentIds, projectIdea, logs }) {
  const currentStepIndex = AGENT_STEPS.findIndex(s => s.id === activeAgentId);
  const progressPercent = Math.round(((completedAgentIds.length) / AGENT_STEPS.length) * 100);

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px' }}>
      
      {/* Header Info */}
      <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', marginBottom: '30px' }}>
        <div style={{
          display: 'inline-flex',
          padding: '8px 16px',
          borderRadius: '20px',
          background: 'rgba(99, 102, 241, 0.15)',
          color: '#a5b4fc',
          fontSize: '0.85rem',
          fontWeight: 600,
          marginBottom: '12px'
        }}>
          <Bot size={16} style={{ marginRight: '6px' }} />
          Orchestrating 5 Role-Based Agents
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 8px 0' }}>
          Generating Software Project Plan
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '600px', margin: '0 auto' }}>
          "<span style={{ color: 'var(--text-main)', fontStyle: 'italic' }}>{projectIdea}</span>"
        </p>

        {/* Progress Bar */}
        <div style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
            <span>Agentic Orchestration Progress</span>
            <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{progressPercent}%</span>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${progressPercent}%`,
              background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)',
              transition: 'width 0.4s ease'
            }} />
          </div>
        </div>
      </div>

      {/* Agent Workflow Steps List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {AGENT_STEPS.map((step, idx) => {
          const isCompleted = completedAgentIds.includes(step.id);
          const isActive = activeAgentId === step.id;
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className="glass-panel"
              style={{
                padding: '20px 24px',
                borderRadius: 'var(--radius-md)',
                borderColor: isActive ? 'var(--primary)' : isCompleted ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-color)',
                background: isActive ? 'rgba(99, 102, 241, 0.08)' : isCompleted ? 'rgba(16, 185, 129, 0.04)' : 'var(--bg-card)',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
                position: 'relative'
              }}
            >
              {/* Status Icon */}
              <div style={{ marginTop: '2px' }}>
                {isCompleted ? (
                  <CheckCircle2 size={24} color="#10b981" />
                ) : isActive ? (
                  <div className="pulse-glow" style={{ borderRadius: '50%' }}>
                    <Loader2 size={24} color="#6366f1" className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                  </div>
                ) : (
                  <Circle size={24} color="rgba(255, 255, 255, 0.2)" />
                )}
              </div>

              {/* Agent Content */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <h3 style={{
                    fontSize: '1.05rem',
                    fontWeight: 600,
                    color: isCompleted ? '#6ee7b7' : isActive ? '#a5b4fc' : 'var(--text-muted)',
                    margin: 0
                  }}>
                    {step.name}
                  </h3>
                  <span className="badge badge-indigo" style={{ fontSize: '0.65rem' }}>
                    {step.role}
                  </span>
                </div>
                <p style={{
                  fontSize: '0.88rem',
                  color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                  margin: 0
                }}>
                  {step.description}
                </p>
              </div>

              {/* Step Sequence Badge */}
              <div style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'rgba(255, 255, 255, 0.25)',
                fontFamily: 'var(--font-mono)'
              }}>
                AGENT {idx + 1}/5
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Agent Terminal Feed */}
      <div className="glass-panel" style={{ marginTop: '24px', padding: '16px 20px', borderRadius: 'var(--radius-md)', background: '#070a12' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6366f1', fontSize: '0.8rem', fontWeight: 600, marginBottom: '8px', fontFamily: 'var(--font-mono)' }}>
          <Terminal size={14} />
          <span>AGENT WORKFLOW EVENT FEED</span>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#a5b4fc', maxHeight: '120px', overflowY: 'auto' }}>
          {logs && logs.length > 0 ? (
            logs.map((log, i) => (
              <div key={i} style={{ marginBottom: '4px' }}>
                <span style={{ color: '#10b981' }}>✓ [{log.agent_name}]</span> state updated with structured context payload
              </div>
            ))
          ) : (
            <div style={{ color: 'var(--text-dim)' }}>Initializing LangGraph state channels...</div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
