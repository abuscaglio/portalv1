import { SalesInsight } from '../../../types/salesInsights';
import { EmployeeData } from '../types';
import { BaseAnalyzer } from '../BaseAnalyzer';
import { InsightsUtils } from '../utils';

export class RiskAnalyzer extends BaseAnalyzer {
  constructor() {
    super('risk');
  }

  async analyze(data: EmployeeData[]): Promise<SalesInsight[]> {
    const insights: SalesInsight[] = [];
    
    for (const empData of data) {
      const currentSales = InsightsUtils.getSalesValue(empData);
      const target = InsightsUtils.getTargetValue(empData);
      
      if (target > 0 && currentSales < target * 0.8) {
        insights.push(this.createRiskInsight(empData, currentSales, target));
      }
    }
    
    return insights;
  }

  private createRiskInsight(
    empData: EmployeeData,
    currentSales: number,
    target: number
  ): SalesInsight {
    const shortfall = target - currentSales;
    const shortfallPercent = Math.round(((target - currentSales) / target) * 100);
    
    return this.createInsightBuilder()
      .setType('alert')
      .setSeverity(shortfallPercent > 30 ? 'critical' : 'high')
      .setTitle('Target Miss Risk')
      .setDescription(
        `${empData.firstName} ${empData.lastName} is ${shortfallPercent}% below monthly target ` +
        `(${InsightsUtils.formatCurrency(shortfall)} shortfall)`
      )
      .setImpact(shortfallPercent)
      .setConfidence(85)
      .setActionable(true)
      .setEmployeeId(empData.employeeId || empData.id)
      .setTimeframe('This month')
      .setData({ shortfall, shortfallPercent, currentSales, target })
      .build();
  }
}