import { EmployeeData, StatisticalMetrics } from './types';

export class InsightsUtils {
  static formatCurrency(amount: number): string {
    return `${Math.round(amount).toLocaleString()}`;
  }

  static groupByEmployee(data: EmployeeData[]): Record<string, EmployeeData[]> {
    return data.reduce((acc, emp) => {
      const empId = emp.employeeId || emp.id;
      if (!acc[empId]) acc[empId] = [];
      acc[empId].push(emp);
      return acc;
    }, {} as Record<string, EmployeeData[]>);
  }

  static groupByTerritory(data: EmployeeData[]): Record<string, EmployeeData[]> {
    return data.reduce((acc, emp) => {
      const territory = emp.state || emp.territory || 'Unknown';
      if (!acc[territory]) acc[territory] = [];
      acc[territory].push(emp);
      return acc;
    }, {} as Record<string, EmployeeData[]>);
  }

  static calculateStats(values: number[]): StatisticalMetrics {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    return { mean, stdDev, variance };
  }

  /**
   * Generate deterministic ID based on content hash
   * This ensures the same insight always gets the same ID
   */
  static generateId(prefix: string, seed: string): string {
    const hash = this.simpleHash(seed);
    return `${prefix}-${hash}`;
  }

  /**
   * Simple string hash function for deterministic IDs
   */
  private static simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  static getSalesValue(emp: EmployeeData): number {
    return emp.monthlySales || emp.amount || 0;
  }

  static getTargetValue(emp: EmployeeData): number {
    return emp.monthlyTarget || 0;
  }

  /**
   * Get sorted keys from object for consistent iteration
   */
  static getSortedKeys<T>(obj: Record<string, T>): string[] {
    return Object.keys(obj).sort();
  }

  /**
   * Round to fixed decimals to avoid floating point issues
   */
  static roundToDecimals(num: number, decimals: number = 2): number {
    return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }
}