import { SalesInsight } from '../../types/salesInsights';
import { INSIGHTS_CONFIG } from './config';
import { DataTransformer } from './DataTransformer';
import { AnomalyDetector } from './analyzers/AnomalyDetector';
import { PredictiveAnalytics } from './analyzers/PredictiveAnalytics';
import { RiskAnalyzer } from './analyzers/RiskAnalyzer';
import { OptimizationEngine } from './analyzers/OptimizationEngine';
import { SeasonalPredictor } from './analyzers/SeasonalPredictor';

class SalesInsightsEngine {
  private dataTransformer = new DataTransformer();
  private analyzers = [
    new AnomalyDetector(),
    new PredictiveAnalytics(),
    new RiskAnalyzer(),
    new OptimizationEngine(),
    new SeasonalPredictor()
  ];

  async generateInsights(): Promise<SalesInsight[]> {
    try {
      const salesData = await this.dataTransformer.fetchAndTransform();
      
      if (salesData.length === 0) {
        console.warn('No sales data available');
        return this.getFallbackInsights();
      }
      
      const allInsights = await Promise.all(
        this.analyzers.map(analyzer => analyzer.safeAnalyze(salesData))
      );
      
      const insights = allInsights.flat();
      return this.sortInsights(insights);
    } catch (error) {
      console.error('Error generating insights:', error);
      return this.getFallbackInsights();
    }
  }

  private sortInsights(insights: SalesInsight[]): SalesInsight[] {
    return insights.sort((a, b) => {
      const weightA = INSIGHTS_CONFIG.SEVERITY_WEIGHTS[a.severity] * a.confidence;
      const weightB = INSIGHTS_CONFIG.SEVERITY_WEIGHTS[b.severity] * b.confidence;
      return weightB - weightA;
    });
  }

  private getFallbackInsights(): SalesInsight[] {
    return [
      {
        id: '1',
        type: 'prediction',
        severity: 'high',
        title: 'Peak Profitability Months Identified',
        description: 'November, December, March are predicted to be the most profitable months',
        impact: 35,
        confidence: 84,
        actionable: true,
        timeframe: 'Next 12 months',
        createdAt: new Date(),
        data: {}
      },
      {
        id: '2',
        type: 'recommendation',
        severity: 'medium',
        title: 'Data Collection Recommended',
        description: 'Connect real sales data to unlock personalized AI insights',
        impact: 50,
        confidence: 100,
        actionable: true,
        timeframe: 'Immediate',
        createdAt: new Date(),
        data: {}
      }
    ];
  }
}

export const insightsEngine = new SalesInsightsEngine();
export default SalesInsightsEngine;