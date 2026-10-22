import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import PresetExamples from './components/PresetExamples';
import ProcessingScreen from './components/ProcessingScreen';
import Dashboard from './components/Dashboard';
import HistoryDrawer from './components/HistoryDrawer';
import ApiKeyModal from './components/ApiKeyModal';
import confetti from 'canvas-confetti';
import { Bot, Sparkles, ArrowRight, Layers, Cpu, Wrench, ListTodo, Calendar } from 'lucide-react';

export default function App() {
  const [view, setView] = useState('home'); // 'home' | 'processing' | 'dashboard'
  const [projectIdea, setProjectIdea] = useState('');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('llm_api_key') || '');
  
  // Streaming execution state
  const [activeAgentId, setActiveAgentId] = useState('agent_1');
  const [completedAgentIds, setCompletedAgentIds] = useState([]);
  const [streamLogs, setStreamLogs] = useState([]);
  const [planData, setPlanData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Modals state
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);

  const handleSaveApiKey = (key) => {
    setApiKey(key);
    if (key) {
      localStorage.setItem('llm_api_key', key);
    } else {
      localStorage.removeItem('llm_api_key');
    }
  };

  const handleGeneratePlan = (ideaToUse) => {
    const targetIdea = (ideaToUse || projectIdea).trim();
    if (!targetIdea) {
      setErrorMessage('Please enter a software project idea first.');
      return;
    }

    setErrorMessage('');
    setProjectIdea(targetIdea);
    setView('processing');
    setActiveAgentId('agent_1');
    setCompletedAgentIds([]);
    setStreamLogs([]);
    setPlanData(null);

    let isStreamFinished = false;

    // Initialize EventSource SSE for real-time agent progression
    const url = `http://127.0.0.1:8000/api/generate-plan-stream?project_idea=${encodeURIComponent(targetIdea)}&api_key=${encodeURIComponent(apiKey)}`;
    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'agent_start') {
          setActiveAgentId(data.agent_id);
        } else if (data.type === 'agent_complete') {
          setCompletedAgentIds((prev) => [...prev.filter(id => id !== data.agent_id), data.agent_id]);
          setStreamLogs((prev) => [...prev, { agent_name: data.agent_name, output: data.output }]);
        } else if (data.type === 'workflow_complete') {
          isStreamFinished = true;
          eventSource.close();
          setPlanData(data.plan);
          setView('dashboard');
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        } else if (data.type === 'agent_error') {
          console.error('Agent error during stream:', data);
        }
      } catch (err) {
        console.error('Error parsing SSE event data:', err);
      }
    };

    eventSource.onerror = (err) => {
      if (isStreamFinished) return;
      console.warn('SSE stream interrupted or completed, falling back to POST REST endpoint...', err);
      eventSource.close();
      isStreamFinished = true;
      
      // Fallback REST call if SSE drops unexpectedly
      fetch('http://127.0.0.1:8000/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_idea: targetIdea, api_key: apiKey })
      })
      .then(res => res.json())
      .then(data => {
        setPlanData(data);
        setCompletedAgentIds(['agent_1', 'agent_2', 'agent_3', 'agent_4', 'agent_5']);
        setView('dashboard');
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      })
      .catch(fetchErr => {
        setErrorMessage('Failed to connect to agent service. Ensure FastAPI backend is running.');
        setView('home');
      });
    };
  };

  const handleReset = () => {
    setView('home');
    setPlanData(null);
    setErrorMessage('');
  };

  const handleLoadSavedPlan = (savedPlan) => {
    setPlanData(savedPlan);
    setProjectIdea(savedPlan.project_idea);
    setView('dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Persistent App Header */}
      <Header
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenKeyModal={() => setIsKeyModalOpen(true)}
        onReset={handleReset}
        currentView={view}
        hasApiKey={!!apiKey}
      />

      {/* Main Content Router */}
      <main style={{ flex: 1 }}>
        
        {/* VIEW 1: HOME / INPUT */}
        {view === 'home' && (
          <div style={{ maxWidth: '950px', margin: '40px auto', padding: '0 20px' }}>
            
            {/* Hero Banner */}
            <div style={{ textAlign: 'center', marginBottom: '36px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 16px',
                borderRadius: '20px',
                background: 'rgba(99, 102, 241, 0.12)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                color: '#a5b4fc',
                fontSize: '0.85rem',
                fontWeight: 600,
                marginBottom: '16px'
              }}>
                <Sparkles size={16} />
                Multi-Agent Goal & Role-Based AI System
              </div>

              <h1 style={{ fontSize: '2.8rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '14px' }}>
                AI-Powered Project Planning Assistant
              </h1>

              <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', maxWidth: '680px', margin: '0 auto', lineHeight: 1.6 }}>
                Transform your raw software project idea into structured requirements, high-level architecture, technology choices, task breakdown, and execution roadmap through 5 specialized AI agents.
              </p>
            </div>

            {/* Main Input Form Card */}
            <div className="glass-panel" style={{ padding: '32px', borderRadius: 'var(--radius-lg)' }}>
              
              <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '10px' }}>
                Describe Your Project Idea:
              </label>

              <textarea
                value={projectIdea}
                onChange={(e) => setProjectIdea(e.target.value)}
                placeholder="Example: Build an AI-based college chatbot that answers student questions from university documents..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: '#070a12',
                  border: errorMessage ? '1px solid var(--accent-rose)' : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-main)',
                  fontSize: '1rem',
                  lineHeight: 1.5,
                  resize: 'vertical',
                  outline: 'none',
                  fontFamily: 'inherit',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = errorMessage ? 'var(--accent-rose)' : 'var(--border-color)'}
              />

              {errorMessage && (
                <div style={{ color: '#fda4af', fontSize: '0.85rem', marginTop: '8px' }}>
                  ⚠ {errorMessage}
                </div>
              )}

              {/* Action Button */}
              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => handleGeneratePlan()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '14px 28px',
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    color: '#ffffff',
                    fontSize: '1rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 6px 20px rgba(99, 102, 241, 0.4)',
                    transition: 'all 0.25s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <Sparkles size={18} />
                  <span>Generate Project Plan</span>
                  <ArrowRight size={18} />
                </button>
              </div>

              {/* Sample Presets Component */}
              <PresetExamples onSelectPreset={(p) => { setProjectIdea(p); handleGeneratePlan(p); }} />

            </div>

            {/* Architecture Overview Features */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginTop: '40px' }}>
              {[
                { title: 'Requirement Agent', role: 'Requirements Analyst', icon: Layers },
                { title: 'Architecture Agent', role: 'System Architect', icon: Cpu },
                { title: 'Technology Agent', role: 'Tech Consultant', icon: Wrench },
                { title: 'Task Agent', role: 'Task Planner', icon: ListTodo },
                { title: 'Planning Agent', role: 'Project Planner', icon: Calendar }
              ].map((agent, i) => {
                const Icon = agent.icon;
                return (
                  <div key={i} className="glass-panel" style={{ padding: '16px', textAlign: 'center', borderRadius: 'var(--radius-md)' }}>
                    <Icon size={22} color="var(--primary)" style={{ marginBottom: '8px' }} />
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>{agent.title}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{agent.role}</div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* VIEW 2: PROCESSING SCREEN */}
        {view === 'processing' && (
          <ProcessingScreen
            activeAgentId={activeAgentId}
            completedAgentIds={completedAgentIds}
            projectIdea={projectIdea}
            logs={streamLogs}
          />
        )}

        {/* VIEW 3: RESULTS DASHBOARD */}
        {view === 'dashboard' && (
          <Dashboard plan={planData} />
        )}

      </main>

      {/* Modals & Drawers */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onLoadPlan={handleLoadSavedPlan}
      />

      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        apiKey={apiKey}
        onSaveKey={handleSaveApiKey}
      />

    </div>
  );
}
