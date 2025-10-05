export const INSIGHTS_CONFIG = {
  ANOMALY_THRESHOLD: 2.5,
  SEASONAL_FACTORS: {
    1: 0.74, 2: 0.78, 3: 1.08, 4: 1.01, 5: 1.15, 6: 0.97,
    7: 0.92, 8: 0.88, 9: 1.12, 10: 1.22, 11: 1.39, 12: 1.46
  } as Record<number, number>,
  MONTH_NAMES: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ],
  SEVERITY_WEIGHTS: { critical: 4, high: 3, medium: 2, low: 1 } as Record<string, number>,
  SEASONAL_DRIVERS: {
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
  } as Record<number, string[]>
};