import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChartState, PieChartData, BarChartData, LineChartData } from '../types';

// Updated interface for Firestore employee data
interface FirestoreEmployee {
  id: string;
  role: string;
  sales: {
    monthly: {
      [month: string]: number;
    };
  };
  first_name: string;
  last_name: string;
  yearly_sales: number;
  monthly_target: number;
  monthly_sales: number;
  created_at: string;
  commendations: string[];
  location: {
    city: string;
    state: string;
  };
  yearly_target: number;
}

// Function to transform Firestore data for the bar chart (by tier)
export const transformEmployeeDataForBarChart = (employees: FirestoreEmployee[]): BarChartData[] => {
  // Define month order for proper sorting
  const monthOrder = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];

  // Group employees by tier
  const tierGroups: { [tier: string]: FirestoreEmployee[] } = {};
  employees.forEach(employee => {
    const tier = employee.role;
    if (!tierGroups[tier]) {
      tierGroups[tier] = [];
    }
    tierGroups[tier].push(employee);
  });

  // Transform data by month
  const chartData: BarChartData[] = monthOrder.map(month => {
    const monthData: BarChartData = { 
      month: month.charAt(0).toUpperCase() + month.slice(1) // Capitalize month name
    };

    // Calculate total sales per tier for this month
    Object.keys(tierGroups).forEach(tier => {
      const totalSalesForTier = tierGroups[tier].reduce((sum, employee) => {
        // Handle the typo in "january" from your data
        const monthKey = month;
        const monthlySales = employee.sales.monthly[monthKey] || 0;
        return sum + monthlySales;
      }, 0);
      
      // Clean up tier name for display (remove "Sales - " prefix if it exists)
      const cleanTierName = tier.replace('Sales - ', '');
      monthData[cleanTierName] = Math.round(totalSalesForTier * 100) / 100; // Round to 2 decimal places
    });

    return monthData;
  });

  return chartData;
};

// NEW: Function to transform individual employee data for the bar chart
export const transformIndividualEmployeeDataForBarChart = (employee: FirestoreEmployee): BarChartData[] => {
  // Define month order for proper sorting
  const monthOrder = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];

  // Transform data by month for individual employee
  const chartData: BarChartData[] = monthOrder.map(month => {
    const monthData: BarChartData = { 
      month: month.charAt(0).toUpperCase() + month.slice(1) // Capitalize month name
    };

    // Get sales for this month
    const monthlySales = employee.sales.monthly[month] || 0;
    const employeeName = `${employee.first_name} ${employee.last_name}`;
    
    monthData[employeeName] = Math.round(monthlySales * 100) / 100; // Round to 2 decimal places
    
    // Optionally include target as a reference line
    monthData['Target'] = employee.monthly_target || 0;

    return monthData;
  });

  return chartData;
};

// NEW: Helper function to get employee options for dropdown
export const getEmployeeOptions = (employees: FirestoreEmployee[]): Array<{id: string, name: string, role: string}> => {
  return employees.map(employee => ({
    id: employee.id,
    name: `${employee.first_name} ${employee.last_name}`,
    role: employee.role
  })).sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically
};

// NEW: Enhanced state interface
interface EnhancedChartState extends ChartState {
  selectedEmployeeId: string | null;
  employees: FirestoreEmployee[];
  chartMode: 'tier' | 'individual'; // Track current display mode
}

const initialState: EnhancedChartState = {
  pieData: [],
  barData: [],
  lineData: [
    { name: 'Week 1', value: 400 },
    { name: 'Week 2', value: 300 },
    { name: 'Week 3', value: 600 },
    { name: 'Week 4', value: 800 },
    { name: 'Week 5', value: 500 }
  ],
  selectedEmployeeId: null,
  employees: [],
  chartMode: 'tier'
};

const chartSlice = createSlice({
  name: 'charts',
  initialState,
  reducers: {
    setPieData: (state, action: PayloadAction<PieChartData[]>) => {
      state.pieData = action.payload;
    },
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
    // Set employees data (called when fetching from Firestore)
    setEmployees: (state, action: PayloadAction<FirestoreEmployee[]>) => {
      state.employees = action.payload;
    },
    // Set data from Firestore employees (tier view)
    setBarDataFromEmployees: (state, action: PayloadAction<FirestoreEmployee[]>) => {
      state.employees = action.payload;
      state.barData = transformEmployeeDataForBarChart(action.payload);
      state.chartMode = 'tier';
      state.selectedEmployeeId = null;
    },
    // NEW: Set data from individual employee
    setBarDataFromIndividualEmployee: (state, action: PayloadAction<FirestoreEmployee>) => {
      state.barData = transformIndividualEmployeeDataForBarChart(action.payload);
      state.chartMode = 'individual';
      state.selectedEmployeeId = action.payload.id;
    },
    // NEW: Set chart mode
    setChartMode: (state, action: PayloadAction<'tier' | 'individual'>) => {
      state.chartMode = action.payload;
    },
    // NEW: Set selected employee ID
    setSelectedEmployeeId: (state, action: PayloadAction<string | null>) => {
      state.selectedEmployeeId = action.payload;
    }
  }
});

export const { 
  setPieData, 
  setBarData, 
  setLineData, 
  updatePieDataPoint, 
  updateBarDataPoint, 
  updateLineDataPoint,
  setEmployees,
  setBarDataFromEmployees,
  setBarDataFromIndividualEmployee,
  setChartMode,
  setSelectedEmployeeId
} = chartSlice.actions;

export default chartSlice.reducer;