import React, { useEffect, useState } from 'react';
import { X, History, ArrowRight, Calendar, Sparkles } from 'lucide-react';

export default function HistoryDrawer({ isOpen, onClose, onLoadPlan }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPlans();
    }
  }, [isOpen]);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/plans');
      if (res.ok) {
        const data = await res.json();
        setPlans(data);
      }
    } catch (e) {
      console.error('Error loading history:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (planId) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/plans/${planId}`);
      if (res.ok) {
        const fullPlan = await res.json();
        onLoadPlan(fullPlan);
        onClose();
      }
    } catch (e) {
      console.error('Error fetching plan details:', e);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(4px)',
      zIndex: 200,
      display: 'flex',
      justifyContent: 'flex-end'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '450px',
        height: '100%',
        borderRadius: 0,
        borderRight: 'none',
        borderTop: 'none',
        borderBottom: 'none',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-8px 0 32px rgba(0,0,0,0.5)'
      }}>
        
        {/* Drawer Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
              Saved Project Plans
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* List Content */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
              Loading saved plans from SQLite database...
            </div>
          ) : plans.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
              No saved project plans found in database.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {plans.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleSelectPlan(p.id)}
                  className="glass-panel glass-panel-interactive"
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer'
                  }}
                >
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#a5b4fc', margin: '0 0 4px 0' }}>
                    {p.project_title || 'Software Project'}
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0 0 10px 0', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    "{p.project_idea}"
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} />
                      <span>{new Date(p.created_at).toLocaleString()}</span>
                    </div>
                    <span style={{ color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
                      View <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
