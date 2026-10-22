import React from 'react';
import { Bot, History, PlusCircle, Cpu } from 'lucide-react';

export default function Header({ onOpenHistory, onReset, currentView }) {
  return (
    <header className="glass-panel" style={{ borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none', padding: '14px 24px', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Brand Logo & Title */}
        <div 
          onClick={onReset}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Bot size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
                AI Project Planner
              </h1>
              <span className="badge badge-indigo" style={{ fontSize: '0.65rem' }}>
                5-Agent LangGraph
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
              Role-Based Agentic Planning Engine
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {currentView !== 'home' && (
            <button
              onClick={onReset}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                background: 'var(--bg-card-hover)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-main)',
                fontSize: '0.85rem',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              <PlusCircle size={16} />
              <span>New Plan</span>
            </button>
          )}

          <button
            onClick={onOpenHistory}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              background: 'var(--bg-card-hover)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-main)',
              fontSize: '0.85rem',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            <History size={16} />
            <span>Saved Plans</span>
          </button>

          {/* Local Ollama LLM Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            background: '#1e1b4b',
            border: '1px solid #312e81',
            borderRadius: 'var(--radius-md)',
            color: '#a5b4fc',
            fontSize: '0.8rem',
            fontWeight: 600
          }}>
            <Cpu size={14} />
            <span>Local Ollama (qwen2.5:7b)</span>
          </div>
        </div>

      </div>
    </header>
  );
}
