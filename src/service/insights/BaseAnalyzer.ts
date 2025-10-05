import { SalesInsight } from '../../types/salesInsights';
import { EmployeeData } from './types';
import { InsightBuilder } from './InsightBuilder';

export abstract class BaseAnalyzer {
  constructor(protected prefix: string) {}

  abstract analyze(data: EmployeeData[]): Promise<SalesInsight[]>;

  protected createInsightBuilder(): InsightBuilder {
    return new InsightBuilder(this.prefix);
  }

  async safeAnalyze(data: EmployeeData[]): Promise<SalesInsight[]> {
    try {
      return await this.analyze(data);
    } catch (error) {
      console.error(`Error in ${this.constructor.name}:`, error);
      return [];
    }
  }
}