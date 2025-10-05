import { SalesInsight } from '../../../types/salesInsights';
import { EmployeeData } from '../types';
import { BaseAnalyzer } from '../BaseAnalyzer';
import { InsightsUtils } from '../utils';

export class OptimizationEngine extends BaseAnalyzer {
  constructor() {
    super('optimization');
  }

  async analyze(data: EmployeeData[]): Promise<SalesInsight[]> {
    const insights: SalesInsight[] = [];
    
    insights.push(...this.analyzeTerritories(data));
    insights.push(...this.analyzeTopPerformers(data));
    
    return insights;
  }

  private analyzeTerritories(data: EmployeeData[]): SalesInsight[] {
    const insights: SalesInsight[] = [];
    const territoryMap = InsightsUtils.groupByTerritory(data);
    const overallAvg = data.reduce((a, b) => a + InsightsUtils.getSalesValue(b), 0) / data.length;
    
    for (const territory in territoryMap) {
      const empList = territoryMap[territory];
      if (empList.length < 2) continue;
      
      const territoryAvg = empList.reduce((a: number, b: EmployeeData) => a + InsightsUtils.getSalesValue(b), 0) / empList.length;
      
      if (territoryAvg > overallAvg * 1.2) {
        const percentOver = Math.round(((territoryAvg - overallAvg) / overallAvg) * 100);
        
        insights.push(
          this.createInsightBuilder()
            .setType('recommendation')
            .setSeverity('medium')
            .setTitle('High-Performing Territory Identified')
            .setDescription(
              `${territory} territory is outperforming average by ${percentOver}% ` +
              `(${InsightsUtils.formatCurrency(territoryAvg)} vs ` +
              `${InsightsUtils.formatCurrency(overallAvg)}). Consider expanding presence here`
            )
            .setImpact(percentOver)
            .setConfidence(80)
            .setActionable(true)
            .setTerritory(territory)
            .setTimeframe('Next quarter')
            .setData({ avgSales: territoryAvg, overallAvg, territory })
            .build()
        );
      }
    }
    
    return insights;
  }

  private analyzeTopPerformers(data: EmployeeData[]): SalesInsight[] {
    if (data.length === 0) return [];
    
    const topPerformer = data.reduce((max, emp) => 
      InsightsUtils.getSalesValue(emp) > InsightsUtils.getSalesValue(max) ? emp : max
    );
    
    const topSales = InsightsUtils.getSalesValue(topPerformer);
    
    return [
      this.createInsightBuilder()
        .setType('recommendation')
        .setSeverity('low')
        .setTitle('Top Performer Best Practices')
        .setDescription(
          `${topPerformer.firstName} ${topPerformer.lastName} leads with ` +
          `${InsightsUtils.formatCurrency(topSales)}. Consider sharing their strategies team-wide`
        )
        .setImpact(30)
        .setConfidence(90)
        .setActionable(true)
        .setTimeframe('Ongoing')
        .setData({ 
          topPerformer: `${topPerformer.firstName} ${topPerformer.lastName}`, 
          sales: topSales 
        })
        .build()
    ];
  }
}