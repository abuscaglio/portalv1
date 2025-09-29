import React from 'react';
import { SalesInsight } from '../../types/salesInsights';

interface InsightModalProps {
  insight: SalesInsight;
  onClose: () => void;
}

const InsightModal: React.FC<InsightModalProps> = ({ insight, onClose }) => {
  return (
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
      onClick={onClose}
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
            {insight.title}
          </h2>
          <button
            onClick={onClose}
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
          {insight.description}
        </p>
      </div>
    </div>
  );
};

export default InsightModal;