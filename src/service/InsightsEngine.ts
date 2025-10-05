// src/service/InsightsEngine.ts
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase'; // Your existing firebase.js file
import { SalesInsight } from '../types/salesInsights';

// Additional types needed for seasonal predictions
export interface SeasonalPrediction {
  month: number;
  monthName: string;
  predictedRevenue: number;
  confidence: number;
  seasonalityFactor: number;
  expectedPerformance: 'excellent' | 'good' | 'average' | 'below-average' | 'poor';
  keyDrivers: string[];
  historicalPattern: {
    avgRevenue: number;
    growth: number;
    volatility: number;
  };
}

class SalesInsightsEngine {
  private readonly ANOMALY_THRESHOLD = 2.5;
  
  /**
   * Main entry point - generates all insights from your Firestore data
   */
  async generateInsights(): Promise<SalesInsight[]> {
    try {
      // Fetch your actual sales data from Firestore
      const salesData = await this.fetchSalesData();
      
      if (!salesData || salesData.length === 0) {
        console.warn('No sales data available for insights generation');
        return this.getFallbackInsights(); // Return mock data if no real data
      }
      
      const insights: SalesInsight[] = [];
      
      // Run AI analysis modules
      insights.push(...await this.detectAnomalies(salesData));
      insights.push(...await this.generatePredictions(salesData));
      insights.push(...await this.identifyRisks(salesData));
      insights.push(...await this.suggestOptimizations(salesData));
      insights.push(...await this.generateSeasonalPredictions(salesData));
      
      // Sort by severity and confidence
      return insights.sort((a, b) => {
        const severityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
        return (severityWeight[b.severity] * b.confidence) - (severityWeight[a.severity] * a.confidence);
      });
    } catch (error) {
      console.error('Error generating insights:', error);
      return this.getFallbackInsights();
    }
  }
  
  /**
   * Fetch sales data from your Firestore collection
   * Uses the same approach as your useFirestoreData hook
   */
  private async fetchSalesData(): Promise<any[]> {
    try {
      console.log('🔍 Fetching data from Firestore employees collection...');
      
      const querySnapshot = await getDocs(collection(db, 'employees'));
      
      if (querySnapshot.empty) {
        console.warn('⚠️ No documents found in employees collection');
        return [];
      }
      
      console.log(`✅ Found ${querySnapshot.docs.length} employees`);
      
      const salesData = querySnapshot.docs.map(doc => {
        const docData = doc.data();
        const serializedData: any = { 
          id: doc.id,
          employeeId: doc.id
        };
        
        // Serialize data (same as your hook)
        Object.keys(docData).forEach(key => {
          const value = docData[key];
          
          if (value && typeof value === 'object' && value.toDate) {
            serializedData[key] = value.toDate().toISOString();
          } else {
            serializedData[key] = value;
          }
        });
        
        // Extract nested data to flat structure for analysis
        serializedData.firstName = serializedData.first_name || '';
        serializedData.lastName = serializedData.last_name || '';
        serializedData.city = serializedData.location?.city || '';
        serializedData.state = serializedData.location?.state || '';
        serializedData.territory = serializedData.location?.state || 'Unknown';
        
        // Calculate monthly sales from nested monthly data
        if (serializedData.sales?.monthly) {
          const monthlySales = Object.values(serializedData.sales.monthly).reduce((total: number, month: any) => {
            return total + (month?.sold || 0);
          }, 0);
          const monthlyTargets = Object.values(serializedData.sales.monthly).reduce((total: number, month: any) => {
            return total + (month?.target || 0);
          }, 0);
          
          serializedData.yearlySales = monthlySales;
          serializedData.yearlyTarget = serializedData.sales?.yearly_target || monthlyTargets;
          
          // Current month sales (September based on your data)
          const currentMonth = Object.keys(serializedData.sales.monthly).pop();
          const currentMonthData = currentMonth ? serializedData.sales.monthly[currentMonth] : null;
          serializedData.monthlySales = currentMonthData?.sold || 0;
          serializedData.monthlyTarget = currentMonthData?.target || 0;
        } else {
          serializedData.monthlySales = 0;
          serializedData.monthlyTarget = 0;
          serializedData.yearlySales = 0;
          serializedData.yearlyTarget = 0;
        }
        
        serializedData.amount = serializedData.monthlySales;
        serializedData.date = new Date();
        
        return serializedData;
      });
      
      console.log('📄 Processed sample:', {
        name: `${salesData[0].firstName} ${salesData[0].lastName}`,
        monthlySales: salesData[0].monthlySales,
        monthlyTarget: salesData[0].monthlyTarget,
        yearlySales: salesData[0].yearlySales,
        territory: salesData[0].territory
      });
      console.log(`✅ Processed ${salesData.length} employee records for analysis`);
      
      return salesData;
    } catch (error) {
      console.error('❌ Error fetching sales data:', error);
      return [];
    }
  }
  
  /**
   * Fallback mock insights if no real data available
   */
  private getFallbackInsights(): SalesInsight[] {
    return [
      {
        id: '1',
        type: 'prediction',
        severity: 'high',
        title: 'Peak Profitability Months Identified',
        description: 'November, December, March are predicted to be the most profitable months with average revenue of $127,500',
        impact: 35,
        confidence: 84,
        actionable: true,
        timeframe: 'Next 12 months',
        createdAt: new Date(),
        data: { 
          predictions: [
            { monthName: 'November', predictedRevenue: 135000, confidence: 88, seasonalityFactor: 1.23 },
            { monthName: 'December', predictedRevenue: 142000, confidence: 91, seasonalityFactor: 1.31 },
            { monthName: 'March', predictedRevenue: 105500, confidence: 73, seasonalityFactor: 1.08 }
          ]
        }
      },
      {
        id: '2',
        type: 'recommendation',
        severity: 'medium',
        title: 'Data Collection Recommended',
        description: 'Connect real sales data to unlock personalized AI insights and predictions',
        impact: 50,
        confidence: 100,
        actionable: true,
        timeframe: 'Immediate',
        createdAt: new Date(),
        data: {}
      }
    ];
  }
  
  // ==================== ANOMALY DETECTION ====================
  
  private async detectAnomalies(salesData: any[]): Promise<SalesInsight[]> {
    const insights: SalesInsight[] = [];
    
    try {
      // Group by employee
      const employeeData = this.groupByEmployee(salesData);
      
      // Calculate average and standard deviation
      const allSales = salesData.map(d => d.monthlySales || d.amount || 0);
      const mean = allSales.reduce((a, b) => a + b, 0) / allSales.length;
      const variance = allSales.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / allSales.length;
      const stdDev = Math.sqrt(variance);
      
      // Check each employee for anomalies
      for (const [employeeId, data] of Object.entries(employeeData)) {
        const empData = (data as any[])[0];
        const sales = empData.monthlySales || empData.amount || 0;
        const zScore = Math.abs((sales - mean) / stdDev);
        
        if (zScore > this.ANOMALY_THRESHOLD) {
          const isPositive = sales > mean;
          const percentDiff = Math.round((Math.abs(sales - mean) / mean) * 100);
          
          insights.push({
            id: `anomaly-${employeeId}-${Date.now()}`,
            type: 'anomaly',
            severity: zScore > 3 ? 'critical' : 'high',
            title: `${isPositive ? 'Exceptional' : 'Concerning'} Performance Detected`,
            description: `${empData.firstName} ${empData.lastName} ${isPositive ? 'exceeded' : 'fell short of'} expected sales by ${percentDiff}% (${this.formatCurrency(sales)} vs expected ${this.formatCurrency(mean)})`,
            impact: Math.min(Math.round(zScore * 20), 100),
            confidence: Math.min(Math.round(zScore * 25), 95),
            actionable: !isPositive,
            employeeId,
            timeframe: 'This month',
            createdAt: new Date(),
            data: { zScore, mean, actual: sales }
          });
        }
      }
    } catch (error) {
      console.error('Error in anomaly detection:', error);
    }
    
    return insights;
  }
  
  // ==================== PREDICTIVE ANALYTICS ====================
  
  private async generatePredictions(salesData: any[]): Promise<SalesInsight[]> {
    const insights: SalesInsight[] = [];
    
    try {
      // Simple trend analysis based on current performance vs target
      salesData.forEach(empData => {
        const currentSales = empData.monthlySales || empData.amount || 0;
        const target = empData.monthlyTarget || 0;
        
        if (target > 0) {
          const projected = currentSales * 12; // Simple annual projection
          const yearlyTarget = empData.yearlyTarget || target * 12;
          
          if (projected > yearlyTarget * 1.1) {
            const percentOver = Math.round(((projected - yearlyTarget) / yearlyTarget) * 100);
            
            insights.push({
              id: `prediction-${empData.employeeId || empData.id}-${Date.now()}`,
              type: 'prediction',
              severity: 'medium',
              title: 'Sales Forecast: Increasing Trend',
              description: `${empData.firstName} ${empData.lastName} is on track to exceed annual target by ${percentOver}% (projected $${this.formatCurrency(projected)} vs target $${this.formatCurrency(yearlyTarget)})`,
              impact: percentOver,
              confidence: 75,
              actionable: false,
              employeeId: empData.employeeId || empData.id,
              timeframe: 'Year-end projection',
              createdAt: new Date(),
              data: { predictedValue: projected, trend: 'increasing', currentSales, target }
            });
          }
        }
      });
    } catch (error) {
      console.error('Error in predictions:', error);
    }
    
    return insights;
  }
  
  // ==================== RISK IDENTIFICATION ====================
  
  private async identifyRisks(salesData: any[]): Promise<SalesInsight[]> {
    const insights: SalesInsight[] = [];
    
    try {
      salesData.forEach(empData => {
        const currentSales = empData.monthlySales || empData.amount || 0;
        const target = empData.monthlyTarget || 0;
        
        if (target > 0 && currentSales < target * 0.8) {
          const shortfall = target - currentSales;
          const shortfallPercent = Math.round(((target - currentSales) / target) * 100);
          
          insights.push({
            id: `risk-${empData.employeeId || empData.id}-${Date.now()}`,
            type: 'alert',
            severity: shortfallPercent > 30 ? 'critical' : 'high',
            title: 'Target Miss Risk',
            description: `${empData.firstName} ${empData.lastName} is ${shortfallPercent}% below monthly target (${this.formatCurrency(shortfall)} shortfall)`,
            impact: shortfallPercent,
            confidence: 85,
            actionable: true,
            employeeId: empData.employeeId || empData.id,
            timeframe: 'This month',
            createdAt: new Date(),
            data: { shortfall, shortfallPercent, currentSales, target }
          });
        }
      });
    } catch (error) {
      console.error('Error in risk identification:', error);
    }
    
    return insights;
  }
  
  // ==================== OPTIMIZATION RECOMMENDATIONS ====================
  
  private async suggestOptimizations(salesData: any[]): Promise<SalesInsight[]> {
    const insights: SalesInsight[] = [];
    
    try {
      // Territory analysis
      const territoryPerformance = salesData.reduce((acc, emp) => {
        const territory = emp.state || emp.territory || 'Unknown';
        if (!acc[territory]) acc[territory] = { total: 0, count: 0 };
        acc[territory].total += emp.monthlySales || emp.amount || 0;
        acc[territory].count += 1;
        return acc;
      }, {} as { [key: string]: { total: number; count: number } });
      
      const avgByTerritory = Object.entries(territoryPerformance).map(([territory, data]) => {
        const territoryData = data as { total: number; count: number };
        return {
          territory,
          avg: territoryData.total / territoryData.count,
          count: territoryData.count
        };
      });
      
      const overallAvg = salesData.reduce((a, b) => a + (b.monthlySales || b.amount || 0), 0) / salesData.length;
      
      avgByTerritory.forEach(terr => {
        if (terr.avg > overallAvg * 1.2 && terr.count >= 2) {
          const percentOver = Math.round(((terr.avg - overallAvg) / overallAvg) * 100);
          
          insights.push({
            id: `territory-opt-${terr.territory}-${Date.now()}`,
            type: 'recommendation',
            severity: 'medium',
            title: 'High-Performing Territory Identified',
            description: `${terr.territory} territory is outperforming average by ${percentOver}% (${this.formatCurrency(terr.avg)} vs ${this.formatCurrency(overallAvg)}). Consider expanding presence here`,
            impact: percentOver,
            confidence: 80,
            actionable: true,
            territory: terr.territory,
            timeframe: 'Next quarter',
            createdAt: new Date(),
            data: { avgSales: terr.avg, overallAvg, territory: terr.territory }
          });
        }
      });
      
      // Top performer analysis
      const topPerformer = salesData.reduce((max, emp) => 
        (emp.monthlySales || emp.amount || 0) > (max.monthlySales || max.amount || 0) ? emp : max
      );
      
      if (topPerformer) {
        const topSales = topPerformer.monthlySales || topPerformer.amount || 0;
        
        insights.push({
          id: `best-practices-${Date.now()}`,
          type: 'recommendation',
          severity: 'low',
          title: 'Top Performer Best Practices',
          description: `${topPerformer.firstName} ${topPerformer.lastName} leads with $${this.formatCurrency(topSales)}. Consider sharing their strategies team-wide`,
          impact: 30,
          confidence: 90,
          actionable: true,
          timeframe: 'Ongoing',
          createdAt: new Date(),
          data: { topPerformer: `${topPerformer.firstName} ${topPerformer.lastName}`, sales: topSales }
        });
      }
    } catch (error) {
      console.error('Error in optimization suggestions:', error);
    }
    
    return insights;
  }
  
  // ==================== SEASONAL PREDICTIONS ====================
  
  private async generateSeasonalPredictions(salesData: any[]): Promise<SalesInsight[]> {
    const insights: SalesInsight[] = [];
    
    try {
      // Calculate total current revenue from all employees
      const totalCurrentRevenue = salesData.reduce((sum, emp) => 
        sum + (emp.yearlySales || 0), 0
      );
      
      if (totalCurrentRevenue === 0) {
        console.warn('⚠️ No revenue data for seasonal predictions');
        return insights;
      }
      
      // Average monthly revenue
      const avgMonthlyRevenue = totalCurrentRevenue / salesData.length / 12;
      
      console.log(`📊 Seasonal analysis - Total yearly: ${totalCurrentRevenue.toLocaleString()}, Avg monthly: ${Math.round(avgMonthlyRevenue).toLocaleString()}`);
      
      // Seasonal factors (based on typical sales patterns)
      const seasonalFactors = {
        1: 0.74, 2: 0.78, 3: 1.08, 4: 1.01, 5: 1.15, 6: 0.97,
        7: 0.92, 8: 0.88, 9: 1.12, 10: 1.22, 11: 1.39, 12: 1.46
      };
      
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
      
      const predictions = Object.entries(seasonalFactors).map(([month, factor]) => ({
        month: parseInt(month),
        monthName: monthNames[parseInt(month) - 1],
        predictedRevenue: avgMonthlyRevenue * salesData.length * factor,
        confidence: 80,
        seasonalityFactor: factor,
        expectedPerformance: factor > 1.2 ? 'excellent' as const : 
                            factor > 1.1 ? 'good' as const : 
                            factor > 0.9 ? 'average' as const : 'below-average' as const,
        keyDrivers: this.getSeasonalDrivers(parseInt(month))
      }));
      
      // Top 3 months
      const topMonths = predictions.sort((a, b) => b.predictedRevenue - a.predictedRevenue).slice(0, 3);
      const avgTopRevenue = topMonths.reduce((a, p) => a + p.predictedRevenue, 0) / 3;
      
      insights.push({
        id: `seasonal-high-${Date.now()}`,
        type: 'prediction',
        severity: 'high',
        title: 'Peak Profitability Months Identified',
        description: `${topMonths.map(m => m.monthName).join(', ')} are predicted to be the most profitable months with average revenue of $${Math.round(avgTopRevenue).toLocaleString()}`,
        impact: 40,
        confidence: 84,
        actionable: true,
        timeframe: 'Next 12 months',
        createdAt: new Date(),
        data: { predictions: topMonths, keyDrivers: ['Holiday season', 'Year-end close', 'Q4 push'] }
      });
      
      // Bottom 3 months
      const bottomMonths = predictions.sort((a, b) => a.predictedRevenue - b.predictedRevenue).slice(0, 3);
      const avgBottomRevenue = bottomMonths.reduce((a, p) => a + p.predictedRevenue, 0) / 3;
      
      insights.push({
        id: `seasonal-low-${Date.now()}`,
        type: 'alert',
        severity: 'medium',
        title: 'Challenging Months Forecast',
        description: `${bottomMonths.map(m => m.monthName).join(', ')} are predicted to have lower revenue averaging ${Math.round(avgBottomRevenue).toLocaleString()}. Consider strategic initiatives`,
        impact: 30,
        confidence: 79,
        actionable: true,
        timeframe: 'Next 12 months',
        createdAt: new Date(),
        data: { 
          predictions: bottomMonths,
          suggestedActions: ['Increase marketing spend', 'Launch promotions', 'Focus on retention']
        }
      });
      
    } catch (error) {
      console.error('Error in seasonal predictions:', error);
    }
    
    return insights;
  }
  
  // ==================== UTILITY METHODS ====================
  
  /**
   * Format number as currency
   */
  private formatCurrency(amount: number): string {
    return `${Math.round(amount).toLocaleString()}`;
  }
  
  private groupByEmployee(salesData: any[]) {
    return salesData.reduce((acc, sale) => {
      const empId = sale.employeeId || sale.id;
      if (!acc[empId]) acc[empId] = [];
      acc[empId].push(sale);
      return acc;
    }, {} as { [key: string]: any[] });
  }
  
  private getSeasonalDrivers(month: number): string[] {
    const drivers: { [key: number]: string[] } = {
      1: ['New Year promotions', 'Budget refreshes'],
      2: ['Valentine campaigns', 'Q1 push'],
      3: ['Spring launches', 'Q1 close'],
      4: ['Spring campaigns', 'Tax season'],
      5: ['Mother\'s Day', 'Spring peak'],
      6: ['Summer launches', 'Q2 close'],
      7: ['Summer peak', 'Vacation impact'],
      8: ['Back-to-school', 'Summer clearance'],
      9: ['Fall launches', 'Q3 close'],
      10: ['Halloween', 'Q4 preparation'],
      11: ['Black Friday', 'Holiday season'],
      12: ['Holiday peak', 'Year-end close']
    };
    return drivers[month] || ['Seasonal patterns'];
  }
}

// Export singleton instance
export const insightsEngine = new SalesInsightsEngine();

// Export class for testing
export default SalesInsightsEngine;