import React from 'react';
import { Brain, AlertTriangle, Target, TrendingUp } from 'lucide-react';
import { SalesInsight } from '../../types/salesInsights';

interface InsightStatsProps {
  insights: SalesInsight[];
}

const InsightStats: React.FC<InsightStatsProps> = ({ insights }) => {
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

  const stats = [
    { 
      label: 'Total Insights', 
      value: insights.length, 
      icon: Brain, 
      color: '#a855f7' 
    },
    { 
      label: 'Critical Alerts', 
      value: insights.filter(i => i.severity === 'critical').length, 
      icon: AlertTriangle, 
      color: '#ef4444' 
    },
    { 
      label: 'Actionable Items', 
      value: insights.filter(i => i.actionable).length, 
      icon: Target, 
      color: '#22c55e' 
    },
    { 
      label: 'Avg Confidence', 
      value: `${Math.round(insights.reduce((a, i) => a + i.confidence, 0) / insights.length)}%`, 
      icon: TrendingUp, 
      color: '#3b82f6' 
    }
  ];

  return (
    <div style={statsGridStyle}>
      {stats.map((stat, idx) => (
        <div key={idx} style={statCardStyle}>
          <div>
            <p style={{ fontSize: '14px', color: '#d1d5db', margin: '0 0 4px 0' }}>
              {stat.label}
            </p>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffffff', margin: '0' }}>
              {stat.value}
            </p>
          </div>
          <stat.icon size={32} color={stat.color} />
        </div>
      ))}
    </div>
  );
};

export default InsightStats;