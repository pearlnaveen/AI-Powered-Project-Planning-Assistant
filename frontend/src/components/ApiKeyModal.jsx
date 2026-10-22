import React from 'react';
import { X, Cpu, CheckCircle2, Terminal } from 'lucide-react';

export default function ApiKeyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      zIndex: 300,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '520px',
        padding: '24px',
        borderRadius: 'var(--radius-lg)'
      }}>
        
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Cpu size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#fff' }}>
              Local Ollama LLM Status
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Info Box */}
        <div style={{ padding: '14px', background: '#111827', borderRadius: 'var(--radius-md)', border: '1px solid #1f2937', marginBottom: '16px', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          <div style={{ color: '#6ee7b7', fontWeight: 600, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} />
            No External API Keys Required
          </div>
          This application connects directly to your local Ollama service using <strong>qwen2.5:7b</strong> for 100% private, local LLM inference.
        </div>

        {/* Commands Guide */}
        <div style={{ background: '#0b0f19', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid #1f2937', marginBottom: '20px' }}>
          <div style={{ fontSize: '0.78rem', color: '#a5b4fc', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Terminal size={14} />
            LOCAL OLLAMA SETUP COMMANDS:
          </div>
          <pre style={{ color: '#9ca3af', fontSize: '0.8rem', lineHeight: 1.5 }}>
{`1. ollama pull qwen2.5:7b
2. ollama run qwen2.5:7b`}
          </pre>
        </div>

        {/* Close Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 20px',
              background: 'var(--primary)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
