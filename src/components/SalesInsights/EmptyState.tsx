import React from 'react';
import { Brain } from 'lucide-react';

const EmptyState: React.FC = () => {
  return (
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
  );
};

export default EmptyState;