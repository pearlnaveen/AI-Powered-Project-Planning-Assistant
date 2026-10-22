import React from 'react';
import { Bot, Utensils, Sprout, UserCheck, Sparkles } from 'lucide-react';

const PRESETS = [
  {
    id: 'college_chatbot',
    title: 'AI College Chatbot',
    icon: Bot,
    tag: 'RAG & NLP',
    color: '#8b5cf6',
    prompt: 'Build an AI-based college chatbot that answers student questions from university documents.'
  },
  {
    id: 'food_delivery',
    title: 'Online Food Delivery',
    icon: Utensils,
    tag: 'Logistics',
    color: '#f59e0b',
    prompt: 'Online food delivery system with restaurant order management, cart processing, and rider live tracking.'
  },
  {
    id: 'smart_agriculture',
    title: 'Smart Agriculture',
    icon: Sprout,
    tag: 'IoT & Analytics',
    color: '#10b981',
    prompt: 'Smart agriculture monitoring system using IoT soil sensors, weather prediction, and automated crop analytics.'
  },
  {
    id: 'attendance_system',
    title: 'Smart Attendance System',
    icon: UserCheck,
    tag: 'Computer Vision',
    color: '#06b6d4',
    prompt: 'Build a smart attendance system using real-time face recognition, automated logging, and admin analytics.'
  }
];

export default function PresetExamples({ onSelectPreset }) {
  return (
    <div style={{ marginTop: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
        <Sparkles size={16} color="var(--primary)" />
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          Try Sample Project Ideas
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
        {PRESETS.map((preset) => {
          const Icon = preset.icon;
          return (
            <div
              key={preset.id}
              onClick={() => onSelectPreset(preset.prompt)}
              className="glass-panel glass-panel-interactive"
              style={{
                padding: '16px',
                cursor: 'pointer',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: `${preset.color}20`,
                border: `1px solid ${preset.color}40`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Icon size={18} color={preset.color} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
                    {preset.title}
                  </h4>
                </div>
                <span className="badge" style={{
                  fontSize: '0.65rem',
                  padding: '2px 8px',
                  background: `${preset.color}15`,
                  color: preset.color,
                  border: `1px solid ${preset.color}30`
                }}>
                  {preset.tag}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
