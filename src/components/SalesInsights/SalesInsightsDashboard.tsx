import React, { useState, useEffect } from 'react';
import { Brain } from 'lucide-react';
import InsightStats from './InsightStats';
import InsightFilters from './InsightFilters';
import InsightCard from './InsightCard';
import InsightModal from './InsightModal';
import LoadingState from './LoadingState';
import EmptyState from './EmptyState';
import { SalesInsight } from '../../types/salesInsights';

const SalesInsightsDashboard: React.FC = () => {
  const [insights, setInsights] = useState<SalesInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'anomaly' | 'prediction' | 'recommendation' | 'alert'>('all');
  const [selectedInsight, setSelectedInsight] = useState<SalesInsight | null>(null);

  // Mock data - replace with actual insightsEngine.generateInsights()
  useEffect(() => {
    const mockInsights: SalesInsight[] = [
      {
        id: '1',
        type: 'anomaly',
        severity: 'critical',
        title: 'Exceptional Performance Detected',
        description: 'Alexander Pushkin exceeded expected sales by 47% this month',
        impact: 85,
        confidence: 92,
        actionable: false,
        employeeId: 'emp-001',
        timeframe: 'This month',
        createdAt: new Date(),
        data: { zScore: 3.2, mean: 1800, actual: 2650 }
      },
      {
        id: '2',
        type: 'alert',
        severity: 'high',
        title: 'Performance Decline Alert',
        description: 'Stephen King has shown declining performance for 3 consecutive months (23% decline)',
        impact: 46,
        confidence: 85,
        actionable: true,
        employeeId: 'emp-002',
        timeframe: 'Last 3 months',
        createdAt: new Date(),
        data: { declineRate: 23, recentMonths: [850, 720, 650] }
      },
      {
        id: '3',
        type: 'prediction',
        severity: 'medium',
        title: 'Sales Forecast: Increasing Trend',
        description: 'Edgar Poe is predicted to increase sales by 18% next quarter',
        impact: 18,
        confidence: 78,
        actionable: false,
        employeeId: 'emp-003',
        timeframe: 'Next 3 months',
        createdAt: new Date(),
        data: { predictedValue: 1950, trend: 'increasing' }
      },
      {
        id: '4',
        type: 'recommendation',
        severity: 'medium',
        title: 'Territory Optimization Opportunity',
        description: 'North Carolina territory shows 24% growth potential with better resource allocation',
        impact: 24,
        confidence: 71,
        actionable: true,
        territory: 'NC',
        timeframe: 'Next quarter',
        createdAt: new Date(),
        data: { potentialIncrease: 24, currentUtilization: 67 }
      },
      {
        id: '5',
        type: 'alert',
        severity: 'critical',
        title: 'Target Miss Risk',
        description: 'Leo Tolstoy has a 87% chance of missing annual target',
        impact: 67,
        confidence: 87,
        actionable: true,
        employeeId: 'emp-005',
        timeframe: 'Year-end projection',
        createdAt: new Date(),
        data: { probability: 0.87, shortfall: 8500 }
      }
    ];

    setTimeout(() => {
      setInsights(mockInsights);
      setLoading(false);
    }, 1500);
  }, []);

  const filteredInsights = filter === 'all' ? insights : insights.filter(i => i.type === filter);

  const containerStyle: React.CSSProperties = {
    width: '100%',
    padding: '24px',
    color: '#ffffff',
  };

  const headerStyle: React.CSSProperties = {
    marginBottom: '32px'
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

  const insightsGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '24px'
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>
          <Brain size={40} color="#a855f7" style={{ marginRight: '12px' }} />
          Sales Intelligence Hub
        </h1>
        <p style={subtitleStyle}>AI-powered insights and recommendations for your sales team</p>
      </div>

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

export default SalesInsightsDashboard;