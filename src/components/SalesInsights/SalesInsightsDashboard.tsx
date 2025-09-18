import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, Target, Brain, Clock, Users } from 'lucide-react';

interface SalesInsight {
  id: string;
  type: 'anomaly' | 'prediction' | 'recommendation' | 'alert';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: number;
  confidence: number;
  actionable: boolean;
  employeeId?: string;
  territory?: string;
  timeframe: string;
  createdAt: Date;
  data?: any;
}

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

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'anomaly': return <TrendingUp size={20} />;
      case 'prediction': return <Brain size={20} />;
      case 'recommendation': return <Target size={20} />;
      case 'alert': return <AlertTriangle size={20} />;
      default: return <Brain size={20} />;
    }
  };

  const getSeverityStyle = (severity: string): React.CSSProperties => {
    switch (severity) {
      case 'critical': return {
        backgroundColor: 'rgba(127, 29, 29, 0.3)',
        border: '1px solid #ef4444',
        color: '#fca5a5'
      };
      case 'high': return {
        backgroundColor: 'rgba(154, 52, 18, 0.3)',
        border: '1px solid #f97316',
        color: '#fed7aa'
      };
      case 'medium': return {
        backgroundColor: 'rgba(133, 77, 14, 0.3)',
        border: '1px solid #eab308',
        color: '#fde047'
      };
      case 'low': return {
        backgroundColor: 'rgba(30, 58, 138, 0.3)',
        border: '1px solid #3b82f6',
        color: '#93c5fd'
      };
      default: return {
        backgroundColor: 'rgba(55, 65, 81, 0.3)',
        border: '1px solid #6b7280',
        color: '#d1d5db'
      };
    }
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'anomaly': return '#a855f7';
      case 'prediction': return '#60a5fa';
      case 'recommendation': return '#34d399';
      case 'alert': return '#f87171';
      default: return '#9ca3af';
    }
  };

  const filteredInsights = filter === 'all' ? insights : insights.filter(i => i.type === filter);

  const containerStyle: React.CSSProperties = {
    width: '100%',
    padding: '24px',
    color: '#ffffff'
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

  const statsGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '24px',
    marginBottom: '32px'
  };

  const statCardStyle: React.CSSProperties = {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: '8px',
    padding: '24px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  };

  const filterContainerStyle: React.CSSProperties = {
    marginBottom: '24px'
  };

  const filterTabsStyle: React.CSSProperties = {
    display: 'flex',
    gap: '4px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: '8px',
    padding: '4px',
    width: 'fit-content'
  };

  const getFilterTabStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
    cursor: 'pointer',
    border: 'none',
    backgroundColor: isActive ? '#7c3aed' : 'transparent',
    color: isActive ? '#ffffff' : '#d1d5db'
  });

  const insightsGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '24px'
  };

  const insightCardStyle: React.CSSProperties = {
    backdropFilter: 'blur(10px)',
    borderRadius: '8px',
    padding: '24px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: '1px solid'
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '256px' 
        }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '64px',
              height: '64px',
              border: '4px solid #a855f7',
              borderTop: '4px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <Brain 
              size={32} 
              color="#a855f7" 
              style={{ position: 'absolute', top: '16px', left: '16px' }} 
            />
          </div>
          <div style={{ marginLeft: '16px', color: '#ffffff' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', margin: '0 0 4px 0' }}>
              AI Analysis in Progress
            </h3>
            <p style={{ color: '#c4b5fd', margin: '0' }}>
              Generating intelligent insights from your sales data...
            </p>
          </div>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
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
      <div style={statsGridStyle}>
        {[
          { label: 'Total Insights', value: insights.length, icon: Brain, color: '#a855f7' },
          { label: 'Critical Alerts', value: insights.filter(i => i.severity === 'critical').length, icon: AlertTriangle, color: '#ef4444' },
          { label: 'Actionable Items', value: insights.filter(i => i.actionable).length, icon: Target, color: '#22c55e' },
          { label: 'Avg Confidence', value: `${Math.round(insights.reduce((a, i) => a + i.confidence, 0) / insights.length)}%`, icon: TrendingUp, color: '#3b82f6' }
        ].map((stat, idx) => (
          <div key={idx} style={statCardStyle}>
            <div>
              <p style={{ fontSize: '14px', color: '#d1d5db', margin: '0 0 4px 0' }}>{stat.label}</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffffff', margin: '0' }}>{stat.value}</p>
            </div>
            <stat.icon size={32} color={stat.color} />
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div style={filterContainerStyle}>
        <div style={filterTabsStyle}>
          {[
            { key: 'all', label: 'All Insights' },
            { key: 'alert', label: 'Alerts' },
            { key: 'anomaly', label: 'Anomalies' },
            { key: 'prediction', label: 'Predictions' },
            { key: 'recommendation', label: 'Recommendations' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              style={getFilterTabStyle(filter === tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Insights Grid */}
      <div style={insightsGridStyle}>
        {filteredInsights.map(insight => (
          <div
            key={insight.id}
            style={{
              ...insightCardStyle,
              ...getSeverityStyle(insight.severity)
            }}
            onClick={() => setSelectedInsight(insight)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {/* Header */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              justifyContent: 'space-between', 
              marginBottom: '16px' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  padding: '8px', 
                  borderRadius: '8px', 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: getTypeColor(insight.type)
                }}>
                  {getInsightIcon(insight.type)}
                </div>
                <span style={{
                  fontSize: '12px',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: getTypeColor(insight.type),
                  fontWeight: '500',
                  textTransform: 'capitalize'
                }}>
                  {insight.type}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '12px', color: '#d1d5db', margin: '0 0 2px 0' }}>Impact</p>
                  <p style={{ fontWeight: 'bold', margin: '0' }}>{insight.impact}%</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '12px', color: '#d1d5db', margin: '0 0 2px 0' }}>Confidence</p>
                  <p style={{ fontWeight: 'bold', margin: '0' }}>{insight.confidence}%</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <h3 style={{ 
              fontSize: '1.125rem', 
              fontWeight: '600', 
              marginBottom: '8px',
              margin: '0 0 8px 0'
            }}>
              {insight.title}
            </h3>
            <p style={{ 
              fontSize: '14px', 
              marginBottom: '16px', 
              opacity: 0.9,
              margin: '0 0 16px 0',
              lineHeight: '1.4'
            }}>
              {insight.description}
            </p>

            {/* Footer */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between' 
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                fontSize: '12px', 
                color: '#d1d5db' 
              }}>
                <Clock size={16} />
                <span>{insight.timeframe}</span>
                {insight.employeeId && (
                  <>
                    <Users size={16} style={{ marginLeft: '8px' }} />
                    <span>Employee {insight.employeeId.slice(-3)}</span>
                  </>
                )}
              </div>
              {insight.actionable && (
                <span style={{
                  fontSize: '12px',
                  padding: '4px 8px',
                  backgroundColor: 'rgba(34, 197, 94, 0.3)',
                  color: '#86efac',
                  borderRadius: '12px',
                  border: '1px solid rgba(34, 197, 94, 0.5)'
                }}>
                  Actionable
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredInsights.length === 0 && (
        <div style={{ textAlign: 'center', paddingTop: '48px', paddingBottom: '48px' }}>
          <Brain size={64} color="#9ca3af" style={{ margin: '0 auto 16px auto' }} />
          <h3 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            color: '#ffffff', 
            marginBottom: '8px',
            margin: '0 0 8px 0'
          }}>
            No insights found
          </h3>
          <p style={{ color: '#9ca3af', margin: '0' }}>
            Try adjusting your filters or check back later for new AI-generated insights.
          </p>
        </div>
      )}

      {/* Simple Modal (if needed) */}
      {selectedInsight && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 1000
          }}
          onClick={() => setSelectedInsight(null)}
        >
          <div 
            style={{
              background: 'linear-gradient(135deg, #581c87 0%, #3730a3 100%)',
              borderRadius: '8px',
              padding: '32px',
              maxWidth: '512px',
              width: '100%',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              marginBottom: '24px' 
            }}>
              <h2 style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold', 
                color: '#ffffff',
                margin: '0'
              }}>
                {selectedInsight.title}
              </h2>
              <button
                onClick={() => setSelectedInsight(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  fontSize: '24px',
                  padding: '4px'
                }}
              >
                ×
              </button>
            </div>
            <p style={{ color: '#d1d5db', lineHeight: '1.5', margin: '0' }}>
              {selectedInsight.description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesInsightsDashboard;