import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ConceptGraphData } from '../types';
import { KnowledgeGraphView } from '../components/KnowledgeGraphView';
import { Sparkles, BrainCircuit, RotateCcw } from 'lucide-react';

export const KnowledgeGraphPage: React.FC = () => {
  const [graphData, setGraphData] = useState<ConceptGraphData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchGraph = async () => {
    setLoading(true);
    try {
      const data = await api.getConceptGraph();
      setGraphData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraph();
  }, []);

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#00f2fe', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Concept Topology & Mastery
          </span>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>
            Calculus <span className="gradient-text">Knowledge Graph</span>
          </h1>
        </div>

        <button onClick={fetchGraph} className="btn btn-secondary">
          <RotateCcw size={15} />
          Refresh Graph
        </button>
      </div>

      {loading || !graphData ? (
        <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-secondary)' }}>
          <Sparkles size={32} color="#00f2fe" style={{ animation: 'spinSlow 2s linear infinite', marginBottom: '16px' }} />
          <h3>Rendering Concept Knowledge Graph...</h3>
        </div>
      ) : (
        <KnowledgeGraphView graphData={graphData} onRefresh={fetchGraph} />
      )}
    </div>
  );
};
