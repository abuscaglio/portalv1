import { SalesInsight } from '../../types/salesInsights';
import { InsightParams } from './types';
import { InsightsUtils } from './utils';

export class InsightBuilder {
  private insight: Partial<SalesInsight> = {};
  private seedParts: string[] = [];

  constructor(private prefix: string) {}

  setType(type: SalesInsight['type']): this {
    this.insight.type = type;
    this.seedParts.push(type);
    return this;
  }

  setSeverity(severity: 'critical' | 'high' | 'medium' | 'low'): this {
    this.insight.severity = severity;
    this.seedParts.push(severity);
    return this;
  }

  setTitle(title: string): this {
    this.insight.title = title;
    this.seedParts.push(title);
    return this;
  }

  setDescription(description: string): this {
    this.insight.description = description;
    return this;
  }

  setImpact(impact: number): this {
    this.insight.impact = Math.min(Math.round(impact), 100);
    this.seedParts.push(impact.toString());
    return this;
  }

  setConfidence(confidence: number): this {
    this.insight.confidence = Math.min(Math.round(confidence), 100);
    return this;
  }

  setActionable(actionable: boolean): this {
    this.insight.actionable = actionable;
    return this;
  }

  setTimeframe(timeframe: string): this {
    this.insight.timeframe = timeframe;
    return this;
  }

  setData(data: any): this {
    this.insight.data = data;
    return this;
  }

  setEmployeeId(employeeId: string): this {
    this.insight.employeeId = employeeId;
    this.seedParts.push(employeeId);
    return this;
  }

  setTerritory(territory: string): this {
    this.insight.territory = territory;
    this.seedParts.push(territory);
    return this;
  }

  fromParams(params: InsightParams): this {
    return this
      .setType(params.type as SalesInsight['type'])
      .setSeverity(params.severity)
      .setTitle(params.title)
      .setDescription(params.description)
      .setImpact(params.impact)
      .setConfidence(params.confidence)
      .setActionable(params.actionable)
      .setTimeframe(params.timeframe)
      .setData(params.data);
  }

  build(): SalesInsight {
    // Create deterministic ID from seed parts
    const seed = this.seedParts.length > 0 
      ? this.seedParts.join('-')
      : `${this.prefix}-${Date.now()}`; // Fallback for insights without seed parts
    
    return {
      id: InsightsUtils.generateId(this.prefix, seed),
      createdAt: new Date(),
      ...this.insight
    } as SalesInsight;
  }
}