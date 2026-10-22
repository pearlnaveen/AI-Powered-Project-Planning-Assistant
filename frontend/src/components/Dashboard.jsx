import React, { useState } from 'react';
import { 
  Sparkles, CheckCircle2, AlertTriangle, Layers, Cpu, Wrench, ListTodo, Calendar, 
  Bot, Download, Copy, Share2, Filter, Flag, ArrowRight, ShieldAlert, Check
} from 'lucide-react';
import ArchitectureGraph from './ArchitectureGraph';
import AgentInspector from './AgentInspector';

export default function Dashboard({ plan }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [copied, setCopied] = useState(false);
  const [taskFilterPriority, setTaskFilterPriority] = useState('ALL');

  if (!plan) return null;

  const { project_idea, requirements, architecture, technology, tasks, execution_plan, agent_logs } = plan;
  const taskList = tasks?.tasks || [];
  const phaseList = execution_plan?.phases || [];
  const milestoneList = execution_plan?.milestones || [];
  const riskList = execution_plan?.risks || [];

  // Filter tasks based on priority selection
  const filteredTasks = taskList.filter(t => {
    if (taskFilterPriority === 'ALL') return true;
    return t.priority.toUpperCase() === taskFilterPriority;
  });

  const handleCopySummary = () => {
    const text = `PROJECT PLAN: ${requirements?.project_title}\n\nOBJECTIVE: ${requirements?.objective}\n\nKEY FEATURES:\n${requirements?.key_features?.map(f => `- ${f}`).join('\n')}\n\nTECH STACK:\n- Frontend: ${technology?.frontend?.technology}\n- Backend: ${technology?.backend?.technology}\n- Database: ${technology?.database?.technology}\n- AI/ML: ${technology?.ai_ml?.technology}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const handleDownloadPDF = async () => {
    try {
      setDownloadingPdf(true);
      const res = await fetch('http://127.0.0.1:8000/api/download-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plan)
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${requirements?.project_title || 'project'}_plan.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch (e) {
      console.error('PDF download error:', e);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(plan, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${requirements?.project_title || 'project'}_plan.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div style={{ maxWidth: '1300px', margin: '30px auto', padding: '0 20px 60px 20px' }}>
      
      {/* Dashboard Top Hero Card */}
      <div className="glass-panel" style={{ padding: '28px', borderRadius: 'var(--radius-lg)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-emerald">Plan Generated via 5 Agents</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Idea: "{project_idea}"
              </span>
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }} className="gradient-text">
              {requirements?.project_title || 'Software Project Plan'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '800px', marginTop: '6px', margin: '6px 0 0 0' }}>
              {requirements?.objective}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleCopySummary}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-main)',
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
              <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={downloadingPdf}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: 'var(--primary)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                color: '#ffffff',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Download size={16} />
              <span>{downloadingPdf ? 'Exporting PDF...' : 'Export PDF'}</span>
            </button>

            <button
              onClick={handleDownloadJSON}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: 'var(--bg-card-hover)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                color: '#ffffff',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Download size={16} />
              <span>Export JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="glass-panel" style={{ padding: '6px', borderRadius: 'var(--radius-md)', marginBottom: '24px', display: 'flex', gap: '4px', overflowX: 'auto' }}>
        {[
          { id: 'overview', label: 'Overview', icon: Sparkles },
          { id: 'requirements', label: 'Requirements', icon: Layers },
          { id: 'architecture', label: 'Architecture', icon: Cpu },
          { id: 'tech', label: 'Technology Stack', icon: Wrench },
          { id: 'tasks', label: 'Tasks Breakdown', icon: ListTodo },
          { id: 'plan', label: 'Execution Plan', icon: Calendar },
          { id: 'agent_inspector', label: 'Agent Execution (5 Roles)', icon: Bot, isHighlight: true }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                background: isActive ? (tab.isHighlight ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' : 'rgba(255, 255, 255, 0.1)') : 'transparent',
                color: isActive ? '#ffffff' : tab.isHighlight ? '#a5b4fc' : 'var(--text-muted)',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.88rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              <Icon size={16} color={isActive ? '#ffffff' : tab.isHighlight ? '#a5b4fc' : 'var(--text-muted)'} />
              <span>{tab.label}</span>
              {tab.isHighlight && !isActive && (
                <span className="badge badge-indigo" style={{ fontSize: '0.6rem', padding: '1px 6px' }}>Academic</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
          
          {/* Objective Card */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '10px', color: 'var(--text-main)' }}>
              Project Objective
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
              {requirements?.objective}
            </p>
          </div>

          {/* Target Users & Key Features Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            
            {/* Target Users */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px', color: '#a5b4fc' }}>
                Target User Personas
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {requirements?.target_users?.map((user, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }} />
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{user}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Features */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px', color: '#6ee7b7' }}>
                Key Core Features
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {requirements?.key_features?.map((feat, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <CheckCircle2 size={16} color="#10b981" />
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Constraints */}
          {requirements?.constraints?.length > 0 && (
            <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '10px', color: '#fcd34d', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={16} />
                Project Constraints & Scope Limits
              </h4>
              <ul style={{ paddingLeft: '20px', margin: 0, color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                {requirements.constraints.map((c, i) => (
                  <li key={i} style={{ marginBottom: '4px' }}>{c}</li>
                ))}
              </ul>
            </div>
          )}

        </div>
      )}

      {/* Tab 2: REQUIREMENTS */}
      {activeTab === 'requirements' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
          
          {/* Functional Requirements */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} />
              Functional Requirements ({requirements?.functional_requirements?.length || 0})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {requirements?.functional_requirements?.map((req, i) => (
                <div key={i} style={{ padding: '12px 14px', background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span style={{ background: '#6366f1', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', marginTop: '2px' }}>
                    FR-{i + 1}
                  </span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{req}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Non-Functional Requirements */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: '#67e8f9', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cpu size={18} />
              Non-Functional Requirements ({requirements?.non_functional_requirements?.length || 0})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {requirements?.non_functional_requirements?.map((req, i) => (
                <div key={i} style={{ padding: '12px 14px', background: 'rgba(6, 182, 212, 0.05)', border: '1px solid rgba(6, 182, 212, 0.2)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span style={{ background: '#06b6d4', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', marginTop: '2px' }}>
                    NFR-{i + 1}
                  </span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{req}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Tab 3: ARCHITECTURE */}
      {activeTab === 'architecture' && (
        <ArchitectureGraph architecture={architecture} />
      )}

      {/* Tab 4: TECHNOLOGY STACK */}
      {activeTab === 'tech' && (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--text-main)' }}>
              Recommended Technology Stack
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
              Tailored technology choices recommended by the Technology Agent based on project constraints.
            </p>
          </div>

          {/* Core Tech Stack Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '30px' }}>
            
            <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
              <span className="badge badge-indigo" style={{ marginBottom: '8px' }}>Frontend</span>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', margin: '4px 0 8px 0' }}>
                {technology?.frontend?.technology}
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                {technology?.frontend?.reason}
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
              <span className="badge badge-emerald" style={{ marginBottom: '8px' }}>Backend</span>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', margin: '4px 0 8px 0' }}>
                {technology?.backend?.technology}
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                {technology?.backend?.reason}
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
              <span className="badge badge-amber" style={{ marginBottom: '8px' }}>Database</span>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', margin: '4px 0 8px 0' }}>
                {technology?.database?.technology}
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                {technology?.database?.reason}
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
              <span className="badge badge-cyan" style={{ marginBottom: '8px' }}>AI / ML Service</span>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', margin: '4px 0 8px 0' }}>
                {technology?.ai_ml?.technology}
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                {technology?.ai_ml?.reason}
              </p>
            </div>

          </div>

          {/* Technology Recommendation Table */}
          <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-md)', overflowX: 'auto' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px' }}>
              Full Technology Matrix
            </h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                  <th style={{ padding: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Component</th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Recommended Tech</th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Rationale & Justification</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <td style={{ padding: '12px', fontWeight: 600, color: '#a5b4fc' }}>Frontend</td>
                  <td style={{ padding: '12px', color: '#fff' }}>{technology?.frontend?.technology}</td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{technology?.frontend?.reason}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <td style={{ padding: '12px', fontWeight: 600, color: '#6ee7b7' }}>Backend</td>
                  <td style={{ padding: '12px', color: '#fff' }}>{technology?.backend?.technology}</td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{technology?.backend?.reason}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <td style={{ padding: '12px', fontWeight: 600, color: '#fcd34d' }}>Database</td>
                  <td style={{ padding: '12px', color: '#fff' }}>{technology?.database?.technology}</td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{technology?.database?.reason}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <td style={{ padding: '12px', fontWeight: 600, color: '#67e8f9' }}>AI / ML</td>
                  <td style={{ padding: '12px', color: '#fff' }}>{technology?.ai_ml?.technology}</td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{technology?.ai_ml?.reason}</td>
                </tr>
                {technology?.additional_tools?.map((tool, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '12px', fontWeight: 600, color: '#fda4af' }}>Tool / Library</td>
                    <td style={{ padding: '12px', color: '#fff' }}>{tool.technology}</td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{tool.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* Tab 5: TASKS BREAKDOWN */}
      {activeTab === 'tasks' && (
        <div>
          
          {/* Header & Filter Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--text-main)' }}>
                Granular Task Breakdown ({filteredTasks.length} tasks)
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                Actionable development tasks generated by the Task Agent.
              </p>
            </div>

            {/* Priority Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={16} color="var(--text-muted)" />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Priority:</span>
              {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map(p => (
                <button
                  key={p}
                  onClick={() => setTaskFilterPriority(p)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    background: taskFilterPriority === p ? 'var(--primary)' : 'transparent',
                    color: taskFilterPriority === p ? '#fff' : 'var(--text-muted)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Tasks Table */}
          <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-md)', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                  <th style={{ padding: '12px', color: 'var(--text-muted)' }}>ID</th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Task Title</th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Priority</th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Phase</th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Dependencies</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((t) => {
                  const isHigh = t.priority.toUpperCase() === 'HIGH';
                  const isMed = t.priority.toUpperCase() === 'MEDIUM';
                  return (
                    <tr key={t.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '14px 12px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)' }}>
                        {t.id}
                      </td>
                      <td style={{ padding: '14px 12px' }}>
                        <div style={{ fontWeight: 600, color: '#fff', marginBottom: '2px' }}>{t.title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.description}</div>
                      </td>
                      <td style={{ padding: '14px 12px' }}>
                        <span className={`badge ${isHigh ? 'badge-rose' : isMed ? 'badge-amber' : 'badge-emerald'}`}>
                          {t.priority}
                        </span>
                      </td>
                      <td style={{ padding: '14px 12px', color: '#a5b4fc', fontSize: '0.82rem' }}>
                        {t.phase}
                      </td>
                      <td style={{ padding: '14px 12px' }}>
                        {t.dependencies && t.dependencies.length > 0 ? (
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {t.dependencies.map(dep => (
                              <span key={dep} className="badge badge-indigo" style={{ fontSize: '0.65rem' }}>{dep}</span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>None</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* Tab 6: EXECUTION PLAN */}
      {activeTab === 'plan' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
          
          {/* Summary Banner */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px', color: '#a5b4fc' }}>
              Execution Summary & Strategy
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
              {execution_plan?.execution_summary}
            </p>
          </div>

          {/* Sequential Phases Timeline */}
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-main)' }}>
              Development Execution Phases
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {phaseList.map((phase, idx) => (
                <div key={idx} className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: '#fff', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    P{idx + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <h5 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                        {phase.name}
                      </h5>
                      <span className="badge badge-emerald">Deliverable Ready</span>
                    </div>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: '0 0 10px 0' }}>
                      {phase.objective}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <div style={{ fontSize: '0.8rem', color: '#a5b4fc' }}>
                        <strong>Tasks:</strong> {phase.tasks?.join(', ')}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#6ee7b7' }}>
                        <strong>Deliverable:</strong> {phase.deliverable}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Milestones & Risks Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
            
            {/* Milestones */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px', color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Flag size={18} />
                Project Milestones
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {milestoneList.map((m, i) => (
                  <div key={i} style={{ padding: '10px 14px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.2)', fontSize: '0.88rem', color: 'var(--text-main)' }}>
                    ✓ {m}
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Management Matrix */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px', color: '#fda4af', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={18} />
                Risk Assessment & Mitigation Matrix
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {riskList.map((r, i) => (
                  <div key={i} style={{ padding: '12px', background: 'rgba(244, 63, 94, 0.05)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#fda4af', marginBottom: '4px' }}>
                      ⚠ Risk: {r.risk}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      🛡 Mitigation: {r.mitigation}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Tab 7: ACADEMIC AGENT EXECUTION INSPECTOR */}
      {activeTab === 'agent_inspector' && (
        <AgentInspector agentLogs={agent_logs} />
      )}

    </div>
  );
}
