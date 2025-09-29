import React from 'react';
import { Brain } from 'lucide-react';

const LoadingState: React.FC = () => {
  const containerStyle: React.CSSProperties = {
    width: '100%',
    padding: '24px',
    color: '#ffffff',
  };

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
};

export default LoadingState;