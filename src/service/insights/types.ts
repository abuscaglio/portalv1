export interface EmployeeData {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  monthlySales: number;
  monthlyTarget: number;
  yearlySales: number;
  yearlyTarget: number;
  territory: string;
  state: string;
  city: string;
  amount: number;
  date: Date;
}

export interface StatisticalMetrics {
  mean: number;
  stdDev: number;
  variance: number;
}

export interface InsightParams {
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: number;
  confidence: number;
  actionable: boolean;
  timeframe: string;
  data: any;
  employeeId?: string;
  territory?: string;
}