import React from 'react';

interface InsightFiltersProps {
  filter: 'all' | 'anomaly' | 'prediction' | 'recommendation' | 'alert';
  onFilterChange: (filter: 'all' | 'anomaly' | 'prediction' | 'recommendation' | 'alert') => void;
}

const InsightFilters: React.FC<InsightFiltersProps> = ({ filter, onFilterChange }) => {
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

  const tabs = [
    { key: 'all' as const, label: 'All Insights' },
    { key: 'alert' as const, label: 'Alerts' },
    { key: 'anomaly' as const, label: 'Anomalies' },
    { key: 'prediction' as const, label: 'Predictions' },
    { key: 'recommendation' as const, label: 'Recommendations' }
  ];

  return (
    <div style={filterContainerStyle}>
      <div style={filterTabsStyle}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => onFilterChange(tab.key)}
            style={getFilterTabStyle(filter === tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default InsightFilters;