import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChartState, PieChartData, BarChartData, LineChartData } from '../types/charts';

interface MonthlySales {
  sold: number;
  target: number;
}

interface FirestoreEmployee {
  id: string;
  role: string;
  sales: {
    monthly: {
      [month: string]: MonthlySales;
    };
    yearly_target: number;
  };
  first_name: string;
  last_name: string;
  created_at: string;
  commendations: string[];
  location: {
    city: string;
    state: string;
  };
}

export const transformEmployeeDataForBarChart = (employees: FirestoreEmployee[]): BarChartData[] => {

  const monthOrder = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];

  const tierGroups: { [tier: string]: FirestoreEmployee[] } = {};
  employees.forEach(employee => {
    const tier = employee.role;
    if (!tierGroups[tier]) {
      tierGroups[tier] = [];
    }
    tierGroups[tier].push(employee);
  });

  const chartData: BarChartData[] = monthOrder.map(month => {
    const monthData: BarChartData = { 
      month: month.charAt(0).toUpperCase() + month.slice(1) 
    };

    Object.keys(tierGroups).forEach(tier => {
      const totalSalesForTier = tierGroups[tier].reduce((sum, employee) => {
        const monthSalesData = employee.sales.monthly[month];
        const monthlySales = monthSalesData?.sold || 0;
        return sum + monthlySales;
      }, 0);
      
      const cleanTierName = tier.replace('Sales - ', '');
      monthData[cleanTierName] = Math.round(totalSalesForTier * 100) / 100; 
    });

    return monthData;
  });

  return chartData;
};

export const transformIndividualEmployeeDataForBarChart = (employee: FirestoreEmployee): BarChartData[] => {
  const monthOrder = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];

  const chartData: BarChartData[] = monthOrder.map(month => {
    const monthData: BarChartData = { 
      month: month.charAt(0).toUpperCase() + month.slice(1)
    };

    const monthSalesData = employee.sales.monthly[month];
    const monthlySales = monthSalesData?.sold || 0;
    const monthlyTarget = monthSalesData?.target || 0;
    
    const employeeName = `${employee.first_name} ${employee.last_name}`;
    
    monthData[employeeName] = Math.round(monthlySales * 100) / 100; 
    monthData['Target'] = Math.round(monthlyTarget * 100) / 100; 

    return monthData;
  });

  return chartData;
};

export const transformEmployeeDataForLineChart = (employees: FirestoreEmployee[]): LineChartData[] => {
  const monthOrder = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];

  const tierGroups: { [tier: string]: FirestoreEmployee[] } = {};
  employees.forEach(employee => {
    const tier = employee.role.replace('Sales - ', ''); // Clean tier name
    if (!tierGroups[tier]) {
      tierGroups[tier] = [];
    }
    tierGroups[tier].push(employee);
  });

  const chartData: LineChartData[] = monthOrder.map(month => {
    const monthData: any = { 
      name: month.charAt(0).toUpperCase() + month.slice(1) // Capitalize month name
    };

    Object.keys(tierGroups).forEach(tier => {
      let totalSold = 0;
      let totalTarget = 0;

      tierGroups[tier].forEach(employee => {
        const monthSalesData = employee.sales.monthly[month];
        if (monthSalesData) {
          totalSold += monthSalesData.sold || 0;
          totalTarget += monthSalesData.target || 0;
        }
      });

      const achievementRate = totalTarget > 0 ? (totalSold / totalTarget) * 100 : 0;
      monthData[tier] = Math.round(achievementRate * 100) / 100; 
    });

    return monthData;
  });

  return chartData;
};

export const transformIndividualEmployeeDataForLineChart = (employee: FirestoreEmployee): LineChartData[] => {
  const monthOrder = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];

  const chartData: LineChartData[] = monthOrder.map(month => {
    const monthData: any = { 
      name: month.charAt(0).toUpperCase() + month.slice(1) 
    };

    const monthSalesData = employee.sales.monthly[month];
    const monthlySales = monthSalesData?.sold || 0;
    const monthlyTarget = monthSalesData?.target || 0;
    
    const achievementRate = monthlyTarget > 0 ? (monthlySales / monthlyTarget) * 100 : 0;
    const employeeName = `${employee.first_name} ${employee.last_name}`;
    
    monthData[employeeName] = Math.round(achievementRate * 100) / 100; // Round to 2 decimal places

    return monthData;
  });

  return chartData;
};

// Helper function to get employee options for dropdown
export const getEmployeeOptions = (employees: FirestoreEmployee[]): Array<{id: string, name: string, role: string}> => {
  return employees.map(employee => ({
    id: employee.id,
    name: `${employee.first_name} ${employee.last_name}`,
    role: employee.role
  })).sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically
};

// Helper function to calculate current month sales for an employee
export const getCurrentMonthSales = (employee: FirestoreEmployee): { sales: number; target: number } => {
  const currentMonth = new Date().toLocaleString('default', { month: 'long' }).toLowerCase();
  const monthData = employee.sales.monthly[currentMonth];
  
  return {
    sales: monthData?.sold || 0,
    target: monthData?.target || 0
  };
};

// Helper function to calculate yearly sales for an employee
export const getYearlySales = (employee: FirestoreEmployee): { sales: number; target: number } => {
  const monthlyData = Object.values(employee.sales.monthly);
  const totalSales = monthlyData.reduce((sum, month) => sum + (month.sold || 0), 0);
  
  return {
    sales: totalSales,
    target: employee.sales.yearly_target || 0
  };
};

interface EnhancedChartState extends ChartState {
  selectedEmployeeId: string | null;
  selectedLineEmployeeId: string | null;
  employees: FirestoreEmployee[];
  chartMode: 'tier' | 'individual';
  lineChartMode: 'tier' | 'individual';
}

const initialState: EnhancedChartState = {
  pieData: [],
  barData: [],
  lineData: [],
  selectedEmployeeId: null,
  selectedLineEmployeeId: null,
  employees: [],
  chartMode: 'tier',
  lineChartMode: 'tier'
};

const chartSlice = createSlice({
  name: 'charts',
  initialState,
  reducers: {
    setBarData: (state, action: PayloadAction<BarChartData[]>) => {
      state.barData = action.payload;
    },
    setLineData: (state, action: PayloadAction<LineChartData[]>) => {
      state.lineData = action.payload;
    },
    updatePieDataPoint: (state, action: PayloadAction<{ index: number; data: PieChartData }>) => {
      const { index, data } = action.payload;
      if (state.pieData[index]) {
        state.pieData[index] = data;
      }
    },
    updateBarDataPoint: (state, action: PayloadAction<{ index: number; data: BarChartData }>) => {
      const { index, data } = action.payload;
      if (state.barData[index]) {
        state.barData[index] = data;
      }
    },
    updateLineDataPoint: (state, action: PayloadAction<{ index: number; data: LineChartData }>) => {
      const { index, data } = action.payload;
      if (state.lineData[index]) {
        state.lineData[index] = data;
      }
    },
    setEmployees: (state, action: PayloadAction<FirestoreEmployee[]>) => {
      state.employees = action.payload;
    },
    setBarDataFromEmployees: (state, action: PayloadAction<FirestoreEmployee[]>) => {
      state.employees = action.payload;
      state.barData = transformEmployeeDataForBarChart(action.payload);
      state.chartMode = 'tier';
      state.selectedEmployeeId = null;
    },
    setBarDataFromIndividualEmployee: (state, action: PayloadAction<FirestoreEmployee>) => {
      state.barData = transformIndividualEmployeeDataForBarChart(action.payload);
      state.chartMode = 'individual';
      state.selectedEmployeeId = action.payload.id;
    },
    setLineDataFromEmployees: (state, action: PayloadAction<FirestoreEmployee[]>) => {
      state.employees = action.payload;
      state.lineData = transformEmployeeDataForLineChart(action.payload);
      state.lineChartMode = 'tier';
      state.selectedLineEmployeeId = null;
    },
    setLineDataFromIndividualEmployee: (state, action: PayloadAction<FirestoreEmployee>) => {
      state.lineData = transformIndividualEmployeeDataForLineChart(action.payload);
      state.lineChartMode = 'individual';
      state.selectedLineEmployeeId = action.payload.id;
    },
    setChartMode: (state, action: PayloadAction<'tier' | 'individual'>) => {
      state.chartMode = action.payload;
    },
    setLineChartMode: (state, action: PayloadAction<'tier' | 'individual'>) => {
      state.lineChartMode = action.payload;
    },
    setSelectedEmployeeId: (state, action: PayloadAction<string | null>) => {
      state.selectedEmployeeId = action.payload;
    },
    setSelectedLineEmployeeId: (state, action: PayloadAction<string | null>) => {
      state.selectedLineEmployeeId = action.payload;
    },
    setPieDataFromEmployees: (state, action: PayloadAction<FirestoreEmployee[]>) => {
      const tierPerformance: { [tier: string]: number } = {};
      
      const tierColors: { [tier: string]: string } = {
        'Tier 1': '#8B5CF6',
        'Tier 2': '#A78BFA', 
        'Tier 3': '#C4B5FD',
        'Tier 4': '#DDD6FE'
      };
      
      action.payload.forEach(employee => {
        const tier = employee.role.replace('Sales - ', '');
        const currentMonthData = getCurrentMonthSales(employee);
        
        if (!tierPerformance[tier]) {
          tierPerformance[tier] = 0;
        }
        tierPerformance[tier] += currentMonthData.sales;
      });
      
      state.pieData = Object.entries(tierPerformance).map(([name, value]) => ({
        name,
        value: Math.round(value * 100) / 100,
        color: tierColors[name] || '#888888'
      }));
    }
  }
});

export const { 
  setBarData, 
  setLineData, 
  updatePieDataPoint, 
  updateBarDataPoint, 
  updateLineDataPoint,
  setEmployees,
  setBarDataFromEmployees,
  setBarDataFromIndividualEmployee,
  setLineDataFromEmployees,
  setLineDataFromIndividualEmployee,
  setChartMode,
  setLineChartMode,
  setSelectedEmployeeId,
  setSelectedLineEmployeeId,
  setPieDataFromEmployees
} = chartSlice.actions;

export default chartSlice.reducer;