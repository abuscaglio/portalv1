import { SalesInsight } from '../../../types/salesInsights';
import { EmployeeData } from '../types';
import { BaseAnalyzer } from '../BaseAnalyzer';
import { InsightsUtils } from '../utils';
import { INSIGHTS_CONFIG } from '../config';

export class AnomalyDetector extends BaseAnalyzer {
  constructor() {
    super('anomaly');
  }

  async analyze(data: EmployeeData[]): Promise<SalesInsight[]> {
    const insights: SalesInsight[] = [];
    const employeeMap = InsightsUtils.groupByEmployee(data);
    
    const allSales = data.map(InsightsUtils.getSalesValue);
    const stats = InsightsUtils.calculateStats(allSales);
    
    for (const empId in employeeMap) {
      const empDataArray = employeeMap[empId];
      const empData = empDataArray[0];
      const sales = InsightsUtils.getSalesValue(empData);
      const zScore = Math.abs((sales - stats.mean) / stats.stdDev);
      
      if (zScore > INSIGHTS_CONFIG.ANOMALY_THRESHOLD) {
        insights.push(this.createAnomalyInsight(empData, sales, stats.mean, zScore));
      }
    }
    
    return insights;
  }

  private createAnomalyInsight(
    empData: EmployeeData, 
    sales: number, 
    mean: number, 
    zScore: number
  ): SalesInsight {
    const isPositive = sales > mean;
    const percentDiff = Math.round((Math.abs(sales - mean) / mean) * 100);
    
    return this.createInsightBuilder()
      .setType('anomaly')
      .setSeverity(zScore > 3 ? 'critical' : 'high')
      .setTitle(`${isPositive ? 'Exceptional' : 'Concerning'} Performance Detected`)
      .setDescription(
        `${empData.firstName} ${empData.lastName} ${isPositive ? 'exceeded' : 'fell short of'} ` +
        `expected sales by ${percentDiff}% (${InsightsUtils.formatCurrency(sales)} vs ` +
        `expected ${InsightsUtils.formatCurrency(mean)})`
      )
      .setImpact(Math.round(zScore * 20))
      .setConfidence(Math.round(zScore * 25))
      .setActionable(!isPositive)
      .setEmployeeId(empData.employeeId || empData.id)
      .setTimeframe('This month')
      .setData({ zScore, mean, actual: sales })
      .build();
  }
}