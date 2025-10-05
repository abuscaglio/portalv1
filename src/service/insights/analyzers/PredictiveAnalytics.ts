import { SalesInsight } from '../../../types/salesInsights';
import { EmployeeData } from '../types';
import { BaseAnalyzer } from '../BaseAnalyzer';
import { InsightsUtils } from '../utils';

export class PredictiveAnalytics extends BaseAnalyzer {
  constructor() {
    super('prediction');
  }

  async analyze(data: EmployeeData[]): Promise<SalesInsight[]> {
    const insights: SalesInsight[] = [];
    
    for (const empData of data) {
      const currentSales = InsightsUtils.getSalesValue(empData);
      const target = InsightsUtils.getTargetValue(empData);
      
      if (target > 0) {
        const projected = currentSales * 12;
        const yearlyTarget = empData.yearlyTarget || target * 12;
        
        if (projected > yearlyTarget * 1.1) {
          insights.push(this.createPredictionInsight(empData, projected, yearlyTarget));
        }
      }
    }
    
    return insights;
  }

  private createPredictionInsight(
    empData: EmployeeData,
    projected: number,
    yearlyTarget: number
  ): SalesInsight {
    const percentOver = Math.round(((projected - yearlyTarget) / yearlyTarget) * 100);
    
    return this.createInsightBuilder()
      .setType('prediction')
      .setSeverity('medium')
      .setTitle('Sales Forecast: Increasing Trend')
      .setDescription(
        `${empData.firstName} ${empData.lastName} is on track to exceed annual target by ` +
        `${percentOver}% (projected $${InsightsUtils.formatCurrency(projected)} vs ` +
        `target $${InsightsUtils.formatCurrency(yearlyTarget)})`
      )
      .setImpact(percentOver)
      .setConfidence(75)
      .setActionable(false)
      .setEmployeeId(empData.employeeId || empData.id)
      .setTimeframe('Year-end projection')
      .setData({ predictedValue: projected, trend: 'increasing' })
      .build();
  }
}