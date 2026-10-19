import React, { useState } from 'react';
import { ConceptGraphData, GraphNode, ConceptDetails } from '../types';
import { Sparkles, ArrowRight, BookOpen, MessageSquare, CheckCircle, AlertTriangle, HelpCircle, X } from 'lucide-react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

interface KnowledgeGraphViewProps {
  graphData: ConceptGraphData;
  onRefresh?: () => void;
}

export const KnowledgeGraphView: React.FC<KnowledgeGraphViewProps> = ({ graphData }) => {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [details, setDetails] = useState<ConceptDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const navigate = useNavigate();

  const handleNodeClick = async (node: GraphNode) => {
    setSelectedNode(node);
    setLoadingDetails(true);
    try {
      const data = await api.getConceptDetails(node.id);
      setDetails(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const getNodeColor = (level: string) => {
    switch (level) {
      case 'mastered':
        return { bg: 'rgba(16, 185, 129, 0.25)', border: '#10b981', text: '#34d399', glow: 'rgba(16, 185, 129, 0.4)' };
      case 'developing':
        return { bg: 'rgba(245, 158, 11, 0.25)', border: '#f59e0b', text: '#fbbf24', glow: 'rgba(245, 158, 11, 0.4)' };
      case 'needs_practice':
        return { bg: 'rgba(244, 63, 94, 0.25)', border: '#f43f5e', text: '#f87171', glow: 'rgba(244, 63, 94, 0.4)' };
      default:
        return { bg: 'rgba(100, 116, 139, 0.2)', border: '#64748b', text: '#94a3b8', glow: 'rgba(100, 116, 139, 0.2)' };
    }
  };

  // Node layout calculation (hierarchical tiered visualization)
  // Prerequisite concepts on left, intermediate in middle, advanced on right
  const filteredNodes = graphData.nodes.filter((node) => {
    if (filter === 'all') return true;
    return node.mastery_level === filter;
  });

  // Calculate layout coordinates for nodes based on their ID / prerequisites
  const width = 850;
  const height = 520;

  // Layout assignment for 10 core differentiation concepts
  const getNodePos = (id: number) => {
    const positions: Record<number, { x: number; y: number }> = {
      1: { x: 120, y: 130 }, // Basic Algebra
      2: { x: 120, y: 260 }, // Exponent Rules
      3: { x: 120, y: 390 }, // Functions & Graphs
      4: { x: 340, y: 180 }, // Limits & Continuity
      5: { x: 340, y: 340 }, // Definition of Derivative
      6: { x: 550, y: 130 }, // Power Rule
      7: { x: 550, y: 260 }, // Constant Multiple & Sum Rule
      8: { x: 550, y: 390 }, // Trigonometric Derivatives
      9: { x: 730, y: 180 }, // Product & Quotient Rules
      10: { x: 730, y: 340 }, // Chain Rule
    };

    if (positions[id]) return positions[id];
    // Fallback for custom added concepts
    const col = (id % 4) * 200 + 100;
    const row = Math.floor(id / 4) * 120 + 100;
    return { x: col, y: row };
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: selectedNode ? '1fr 380px' : '1fr', gap: '24px', alignItems: 'start' }}>
      {/* Knowledge Graph Visualizer Canvas */}
      <div className="glass-panel" style={{ padding: '24px', position: 'relative' }}>
        {/* Controls Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={20} color="#00f2fe" />
              Differentiation Knowledge Graph
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              Click any concept node to inspect prerequisites, formula cheat sheets, and common misconception traps.
            </p>
          </div>

          {/* Filter Pills */}
          <div style={{
            display: 'flex',
            gap: '6px',
            background: 'rgba(0,0,0,0.3)',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}>
            {[
              { id: 'all', label: 'All' },
              { id: 'mastered', label: 'Mastered' },
              { id: 'developing', label: 'Developing' },
              { id: 'needs_practice', label: 'Needs Practice' },
              { id: 'unassessed', label: 'Unassessed' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                style={{
                  background: filter === tab.id ? 'var(--gradient-brand)' : 'transparent',
                  color: filter === tab.id ? '#fff' : 'var(--text-secondary)',
                  border: 'none',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '16px',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
            Mastered (≥80%)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
            Developing (40-79%)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f43f5e' }} />
            Needs Practice (&lt;40%)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#64748b' }} />
            Unassessed
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
            <span style={{ width: '20px', height: '2px', background: 'rgba(99, 102, 241, 0.5)' }} />
            Prerequisite Flow
          </div>
        </div>

        {/* SVG Graph View */}
        <div style={{
          width: '100%',
          overflowX: 'auto',
          background: 'radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 0.8) 0%, rgba(8, 11, 18, 0.95) 100%)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'inset 0 0 40px rgba(0, 0, 0, 0.5)',
        }}>
          <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block', minWidth: '700px' }}>
            <defs>
              <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#818cf8" stopOpacity="0.7" />
              </linearGradient>

              <marker id="arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#818cf8" opacity="0.8" />
              </marker>

              <filter id="nodeGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Render Prerequisite Edges */}
            {graphData.edges.map((edge, idx) => {
              const src = getNodePos(edge.source);
              const tgt = getNodePos(edge.target);
              const dx = tgt.x - src.x;
              const dy = tgt.y - src.y;
              // Smooth bezier curve
              const cx1 = src.x + dx * 0.5;
              const cy1 = src.y;
              const cx2 = src.x + dx * 0.5;
              const cy2 = tgt.y;

              const isHighlighted = selectedNode && (selectedNode.id === edge.source || selectedNode.id === edge.target);

              return (
                <path
                  key={`edge-${idx}`}
                  d={`M ${src.x} ${src.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${tgt.x} ${tgt.y}`}
                  fill="none"
                  stroke={isHighlighted ? '#00f2fe' : 'url(#edgeGradient)'}
                  strokeWidth={isHighlighted ? 2.5 : 1.5}
                  strokeDasharray={edge.strength === 'recommended' ? '4,4' : undefined}
                  markerEnd="url(#arrow)"
                  opacity={isHighlighted ? 1 : 0.6}
                  style={{ transition: 'all 0.3s' }}
                />
              );
            })}

            {/* Render Concept Nodes */}
            {filteredNodes.map((node) => {
              const pos = getNodePos(node.id);
              const colors = getNodeColor(node.mastery_level);
              const isSelected = selectedNode?.id === node.id;

              return (
                <g
                  key={`node-${node.id}`}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onClick={() => handleNodeClick(node)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Subtle outer glow on selected */}
                  {isSelected && (
                    <circle r="36" fill={colors.glow} filter="url(#nodeGlow)" />
                  )}

                  {/* Node Circle */}
                  <circle
                    r="28"
                    fill={colors.bg}
                    stroke={isSelected ? '#00f2fe' : colors.border}
                    strokeWidth={isSelected ? 3 : 2}
                    style={{ transition: 'all 0.3s' }}
                  />

                  {/* Inner Status Ring */}
                  <circle
                    r="20"
                    fill="rgba(15, 23, 42, 0.9)"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="1"
                  />

                  {/* Concept Initial / ID */}
                  <text
                    textAnchor="middle"
                    dy="4"
                    fill={colors.text}
                    fontSize="11"
                    fontWeight="700"
                    fontFamily="var(--font-mono)"
                  >
                    #{node.id}
                  </text>

                  {/* Node Label Below */}
                  <text
                    textAnchor="middle"
                    dy="46"
                    fill={isSelected ? '#ffffff' : '#cbd5e1'}
                    fontSize="11"
                    fontWeight={isSelected ? '700' : '500'}
                    style={{ textShadow: '0 2px 6px rgba(0,0,0,0.8)' }}
                  >
                    {node.name.length > 18 ? node.name.slice(0, 16) + '...' : node.name}
                  </text>

                  {/* Confidence Pill */}
                  <text
                    textAnchor="middle"
                    dy="60"
                    fill="var(--text-muted)"
                    fontSize="9"
                    fontWeight="600"
                  >
                    {node.total_attempts > 0 ? `${Math.round(node.confidence_score * 100)}% accuracy` : 'Unattempted'}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Selected Concept Detail Drawer */}
      {selectedNode && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <span className={`badge badge-${selectedNode.mastery_level.replace('_', '-')}`} style={{ marginBottom: '8px' }}>
                {selectedNode.mastery_level.replace('_', ' ')}
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{selectedNode.name}</h3>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              <X size={16} />
            </button>
          </div>

          {loadingDetails ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              Loading concept intelligence...
            </div>
          ) : details ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '6px' }}>
                  Overview
                </h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {details.description}
                </p>
              </div>

              {/* Explainable Knowledge Graph: Recommendation Reason */}
              {details.recommendation_reason && (
                <div style={{
                  background: 'rgba(0, 242, 254, 0.08)',
                  border: '1px solid rgba(0, 242, 254, 0.25)',
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <Sparkles size={16} color="#00f2fe" />
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#00f2fe', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Why This Concept Is Recommended
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#e0f2fe', lineHeight: 1.5 }}>
                    {details.recommendation_reason}
                  </p>
                </div>
              )}

              {/* Supporting Empirical Evidence */}
              {details.supporting_evidence && (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#34d399', letterSpacing: '0.05em', fontWeight: 800 }}>
                      Empirical Assessment Evidence
                    </h4>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      Zero Hallucination
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ background: 'rgba(0,0,0,0.25)', padding: '8px 10px', borderRadius: '4px' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Attempt Accuracy</span>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                        {details.supporting_evidence.accuracy_percentage}%
                      </div>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.25)', padding: '8px 10px', borderRadius: '4px' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Recorded Attempts</span>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                        {details.supporting_evidence.correct_attempts} / {details.supporting_evidence.total_attempts}
                      </div>
                    </div>
                  </div>
                  {details.supporting_evidence.recent_responses && details.supporting_evidence.recent_responses.length > 0 && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      <div style={{ marginBottom: '4px', color: 'var(--text-muted)', fontWeight: 600 }}>Recent Question Responses:</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {details.supporting_evidence.recent_responses.map((resp, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '4px 8px', borderRadius: '4px' }}>
                            <span>Q#{resp.question_id} (Option {resp.selected_answer})</span>
                            <span style={{ color: resp.is_correct ? '#34d399' : '#f87171', fontWeight: 700 }}>
                              {resp.is_correct ? 'Correct' : 'Incorrect'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Prerequisite Relevance & Analysis */}
              {details.prerequisite_analysis && (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                }}>
                  <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#fbbf24', letterSpacing: '0.05em', marginBottom: '8px', fontWeight: 800 }}>
                    Prerequisite Dependency Analysis
                  </h4>
                  {details.prerequisite_analysis.prerequisites && details.prerequisite_analysis.prerequisites.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {details.prerequisite_analysis.prerequisites.map((p, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', background: 'rgba(0,0,0,0.2)', padding: '6px 10px', borderRadius: '4px' }}>
                          <span style={{ color: '#f8fafc', fontWeight: 600 }}>{p.name}</span>
                          <span style={{
                            color: p.status === 'satisfied' ? '#34d399' : '#fbbf24',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            textTransform: 'capitalize'
                          }}>
                            {p.status === 'satisfied' ? '✓ Mastered' : '⚠ Gap Detected'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Foundational concept — has no prerequisites.
                    </p>
                  )}
                  <div style={{ marginTop: '8px', fontSize: '0.78rem', color: details.prerequisite_analysis.is_ready_for_study ? '#34d399' : '#fbbf24', fontWeight: 600 }}>
                    {details.prerequisite_analysis.is_ready_for_study
                      ? '✓ Prerequisites satisfied. Ready for targeted study.'
                      : `⚠ Prerequisite gaps detected in: ${details.prerequisite_analysis.unmet_prerequisites.join(', ')}`}
                  </div>
                </div>
              )}

              {/* Recommended Lesson & Approximation Notice */}
              {details.recommended_lesson && (
                <div style={{
                  background: 'rgba(168, 85, 247, 0.08)',
                  border: '1px solid rgba(168, 85, 247, 0.25)',
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#c084fc', textTransform: 'uppercase' }}>
                      Recommended Targeted Lesson
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#e9d5ff', fontWeight: 600 }}>
                      {details.recommended_lesson.estimated_duration_display}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>
                    {details.recommended_lesson.title}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Type: {details.recommended_lesson.lesson_type} • Difficulty: {details.recommended_lesson.difficulty}
                  </div>
                </div>
              )}

              {/* How Improvement Will Be Verified */}
              {details.verification_criteria && (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#34d399', textTransform: 'uppercase' }}>
                    How Improvement Will Be Verified
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px', fontSize: '0.8rem', color: '#d1fae5' }}>
                    <div>• Accuracy threshold required: <strong>{details.verification_criteria.accuracy_threshold}</strong></div>
                    <div>• Minimum practice questions: <strong>{details.verification_criteria.minimum_practice_questions} exercises</strong></div>
                    <div>• Verification method: <strong>{details.verification_criteria.follow_up_assessment_type}</strong></div>
                  </div>
                </div>
              )}

              {/* Key Formulas */}
              {details.key_formulas && details.key_formulas.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#38bdf8', letterSpacing: '0.05em', marginBottom: '8px' }}>
                    Key Formulas
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {details.key_formulas.map((formula, i) => (
                      <div
                        key={i}
                        style={{
                          background: 'rgba(56, 189, 248, 0.08)',
                          border: '1px solid rgba(56, 189, 248, 0.2)',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-sm)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.85rem',
                          color: '#bae6fd',
                        }}
                      >
                        {formula}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Common Misconceptions & Pitfalls */}
              {details.common_mistakes && details.common_mistakes.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#f87171', letterSpacing: '0.05em', marginBottom: '8px' }}>
                    Common Pitfalls & Traps
                  </h4>
                  <ul style={{ paddingLeft: '18px', fontSize: '0.825rem', color: '#fca5a5', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {details.common_mistakes.map((mistake, i) => (
                      <li key={i}>{mistake}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quick Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                <button
                  onClick={() => navigate(`/tutor?concept=${details.id}`)}
                  className="btn btn-outline-glow"
                  style={{ width: '100%' }}
                >
                  <MessageSquare size={16} />
                  Ask AI Tutor About This
                </button>

                <button
                  onClick={() => navigate(`/path?concept=${details.id}`)}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  <BookOpen size={16} />
                  View Lesson & Exercises
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
