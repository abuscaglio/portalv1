import React from 'react';
import { Clock, Users } from 'lucide-react';
import { SalesInsight } from '../../types/salesInsights';
import { getInsightIcon, getSeverityStyle, getTypeColor } from '../../utils/salesInsightsHelpers';

interface InsightCardProps {
  insight: SalesInsight;
  onClick: () => void;
}

const InsightCard: React.FC<InsightCardProps> = ({ insight, onClick }) => {
  const insightCardStyle: React.CSSProperties = {
    backdropFilter: 'blur(10px)',
    borderRadius: '8px',
    padding: '24px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: '1px solid'
  };

  return (
    <div
      style={{
        ...insightCardStyle,
        ...getSeverityStyle(insight.severity)
      }}
      onClick={onClick}
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
  );
};

export default InsightCard;