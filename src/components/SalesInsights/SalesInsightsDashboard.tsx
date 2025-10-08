import React, { useState, useEffect } from 'react';
import { Brain } from 'lucide-react';
import InsightStats from './InsightStats';
import InsightFilters from './InsightFilters';
import InsightCard from './InsightCard';
import InsightModal from './InsightModal';
import LoadingState from './LoadingState';
import EmptyState from './EmptyState';
import { SalesInsight } from '../../types/salesInsights';
import { insightsEngine } from '../../service/insights/InsightsEngine'; // Import the engine

const SalesInsightsDashboard: React.FC = () => {
  const [insights, setInsights] = useState<SalesInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'anomaly' | 'prediction' | 'recommendation' | 'alert'>('all');
  const [selectedInsight, setSelectedInsight] = useState<SalesInsight | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const generatedInsights = await insightsEngine.generateInsights();
        
        setInsights(generatedInsights);
      } catch (err) {
        console.error('Error fetching insights:', err);
        setError('Failed to generate insights. Using fallback data.');
        
        setInsights(getMockInsights());
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []); // Run once on mount

  // Optional: Add a refresh function
  const refreshInsights = async () => {
    setLoading(true);
    try {
      const generatedInsights = await insightsEngine.generateInsights();
      setInsights(generatedInsights);
    } catch (err) {
      console.error('Error refreshing insights:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredInsights = filter === 'all' ? insights : insights.filter(i => i.type === filter);

  const containerStyle: React.CSSProperties = {
    width: '100%',
    padding: '24px',
    color: '#ffffff',
  };

  const headerStyle: React.CSSProperties = {
    marginBottom: '32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const headerContentStyle: React.CSSProperties = {
    flex: 1
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '2.25rem',
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center'
  };

  const subtitleStyle: React.CSSProperties = {
    color: '#c4b5fd'
  };

  const refreshButtonStyle: React.CSSProperties = {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.2s, opacity 0.2s',
    fontSize: '14px'
  };

  const insightsGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '24px'
  };

  const errorStyle: React.CSSProperties = {
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '24px',
    color: '#fca5a5'
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={headerContentStyle}>
          <h1 style={titleStyle}>
            <Brain size={40} color="#a855f7" style={{ marginRight: '12px' }} />
            Sales Intelligence Hub
          </h1>
          <p style={subtitleStyle}>AI-powered insights and recommendations for your sales team</p>
        </div>
        <button 
          onClick={refreshInsights}
          style={refreshButtonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.opacity = '0.9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.opacity = '1';
          }}
        >
          🔄 Refresh Insights
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div style={errorStyle}>
          ⚠️ {error}
        </div>
      )}

      {/* Summary Cards */}
      <InsightStats insights={insights} />

      {/* Filter Tabs */}
      <InsightFilters filter={filter} onFilterChange={setFilter} />

      {/* Insights Grid */}
      {filteredInsights.length > 0 ? (
        <div style={insightsGridStyle}>
          {filteredInsights.map(insight => (
            <InsightCard
              key={insight.id}
              insight={insight}
              onClick={() => setSelectedInsight(insight)}
            />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}

      {/* Modal */}
      {selectedInsight && (
        <InsightModal
          insight={selectedInsight}
          onClose={() => setSelectedInsight(null)}
        />
      )}
    </div>
  );
};

// Fallback mock insights function
function getMockInsights(): SalesInsight[] {
  return [
    {
      id: '1',
      type: 'prediction',
      severity: 'high',
      title: 'Peak Profitability Months Identified',
      description: 'November, December, March are predicted to be the most profitable months',
      impact: 35,
      confidence: 84,
      actionable: true,
      timeframe: 'Next 12 months',
      createdAt: new Date(),
      data: {}
    },
    {
      id: '2',
      type: 'recommendation',
      severity: 'medium',
      title: 'Connect Real Sales Data',
      description: 'Connect your Firestore data to unlock personalized AI insights',
      impact: 50,
      confidence: 100,
      actionable: true,
      timeframe: 'Immediate',
      createdAt: new Date(),
      data: {}
    }
  ];
}

export default SalesInsightsDashboard;