import { AlertTriangle, TrendingUp, Target, Brain } from 'lucide-react';

export const getInsightIcon = (type: string) => {
    switch (type) {
      case 'anomaly': return <TrendingUp size={20} />;
      case 'prediction': return <Brain size={20} />;
      case 'recommendation': return <Target size={20} />;
      case 'alert': return <AlertTriangle size={20} />;
      default: return <Brain size={20} />;
    }
  };

export const getSeverityStyle = (severity: string): React.CSSProperties => {
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

export const getTypeColor = (type: string): string => {
  switch (type) {
    case 'anomaly': return '#a855f7';
    case 'prediction': return '#60a5fa';
    case 'recommendation': return '#34d399';
    case 'alert': return '#f87171';
    default: return '#9ca3af';
  }
};