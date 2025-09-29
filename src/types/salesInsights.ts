export interface SalesInsight {
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