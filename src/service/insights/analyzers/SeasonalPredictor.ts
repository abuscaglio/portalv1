import { SalesInsight } from '../../../types/salesInsights';
import { EmployeeData } from '../types';
import { BaseAnalyzer } from '../BaseAnalyzer';
import { INSIGHTS_CONFIG } from '../config';

export class SeasonalPredictor extends BaseAnalyzer {
  constructor() {
    super('seasonal');
  }

  async analyze(data: EmployeeData[]): Promise<SalesInsight[]> {
    const insights: SalesInsight[] = [];
    const totalRevenue = data.reduce((sum, emp) => sum + (emp.yearlySales || 0), 0);
    
    if (totalRevenue === 0) return insights;
    
    const avgMonthlyRevenue = totalRevenue / data.length / 12;
    const predictions = this.generatePredictions(avgMonthlyRevenue, data.length);
    
    insights.push(this.createPeakMonthsInsight(predictions));
    insights.push(this.createLowMonthsInsight(predictions));
    
    return insights;
  }

  private generatePredictions(avgMonthlyRevenue: number, employeeCount: number) {
    return Object.entries(INSIGHTS_CONFIG.SEASONAL_FACTORS).map(([month, factor]) => ({
      month: parseInt(month),
      monthName: INSIGHTS_CONFIG.MONTH_NAMES[parseInt(month) - 1],
      predictedRevenue: avgMonthlyRevenue * employeeCount * factor,
      confidence: 80,
      seasonalityFactor: factor,
      keyDrivers: INSIGHTS_CONFIG.SEASONAL_DRIVERS[parseInt(month)] || ['Seasonal patterns']
    }));
  }

  private createPeakMonthsInsight(predictions: any[]): SalesInsight {
    const topMonths = [...predictions].sort((a, b) => b.predictedRevenue - a.predictedRevenue).slice(0, 3);
    const avgRevenue = topMonths.reduce((a, p) => a + p.predictedRevenue, 0) / 3;
    
    return this.createInsightBuilder()
      .setType('prediction')
      .setSeverity('high')
      .setTitle('Peak Profitability Months Identified')
      .setDescription(
        `${topMonths.map(m => m.monthName).join(', ')} are predicted to be the most profitable ` +
        `months with average revenue of $${Math.round(avgRevenue).toLocaleString()}`
      )
      .setImpact(40)
      .setConfidence(84)
      .setActionable(true)
      .setTimeframe('Next 12 months')
      .setData({ predictions: topMonths, keyDrivers: ['Holiday season', 'Year-end close', 'Q4 push'] })
      .build();
  }

  private createLowMonthsInsight(predictions: any[]): SalesInsight {
    const bottomMonths = [...predictions].sort((a, b) => a.predictedRevenue - b.predictedRevenue).slice(0, 3);
    const avgRevenue = bottomMonths.reduce((a, p) => a + p.predictedRevenue, 0) / 3;
    
    return this.createInsightBuilder()
      .setType('alert')
      .setSeverity('medium')
      .setTitle('Challenging Months Forecast')
      .setDescription(
        `${bottomMonths.map(m => m.monthName).join(', ')} are predicted to have lower revenue ` +
        `averaging ${Math.round(avgRevenue).toLocaleString()}. Consider strategic initiatives`
      )
      .setImpact(30)
      .setConfidence(79)
      .setActionable(true)
      .setTimeframe('Next 12 months')
      .setData({ 
        predictions: bottomMonths,
        suggestedActions: ['Increase marketing spend', 'Launch promotions', 'Focus on retention']
      })
      .build();
  }
}