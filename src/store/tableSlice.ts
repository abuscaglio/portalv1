import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Updated types to match your new Firebase structure
interface Location {
  city: string;
  state: string;
}

interface MonthlySales {
  target: number;
  sold: number;
}

interface Sales {
  monthly: {
    [month: string]: MonthlySales;
  };
  yearly_target: number;
}

export interface TableRow {
  id: string;
  role: string;
  first_name: string;
  last_name: string;
  location: Location;
  commendations: string[];
  sales: Sales;
  created_at: string;
  // Computed fields for easier filtering/display
  monthly_sales?: number;
  monthly_target?: number;
  yearly_sales?: number;
}

export interface TableState {
  data: TableRow[];
  filteredData: TableRow[];
  filterText: string;
  currentPage: number;
  recordsPerPage: number;
  sortModel: { colId: string; sort: 'asc' | 'desc' }[];
}

// Helper function to get current month name in lowercase
const getCurrentMonth = (): string => {
  const monthNames = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];
  const currentDate = new Date();
  return monthNames[currentDate.getMonth()];
};

// Helper function to calculate current month's sales and targets
const calculateCurrentMonthData = (sales: Sales) => {
  const currentMonth = getCurrentMonth();
  
  // Find current month data - try exact match first, then case-insensitive
  let monthData: MonthlySales | undefined = sales.monthly[currentMonth];
  
  if (!monthData) {
    // Try to find month with case-insensitive search
    const monthKey = Object.keys(sales.monthly).find(
      key => key.toLowerCase() === currentMonth.toLowerCase()
    );
    monthData = monthKey ? sales.monthly[monthKey] : undefined;
  }
  
  // Calculate total yearly sales from all months
  const yearlyData = Object.values(sales.monthly);
  const yearly_sales = yearlyData.reduce((total, month) => total + (month.sold || 0), 0);
  
  return {
    monthly_sales: monthData?.sold || 0,
    monthly_target: monthData?.target || 0,
    yearly_sales
  };
};

// Transform Firebase data to include computed fields
const transformFirebaseData = (firebaseData: any[]): TableRow[] => {
  return firebaseData.map(item => {
    const computedData = calculateCurrentMonthData(item.sales);
    return {
      ...item,
      ...computedData
    };
  });
};

const initialState: TableState = {
  data: [],
  filteredData: [],
  filterText: '',
  currentPage: 1,
  recordsPerPage: 20,
  sortModel: []
};

const tableSlice = createSlice({
  name: 'table',
  initialState,
  reducers: {
    setTableData: (state, action: PayloadAction<any[]>) => {
      // Transform the Firebase data and add computed fields
      const transformedData = transformFirebaseData(action.payload);
      state.data = transformedData;
      state.filteredData = transformedData;
    },
    
    setFilterText: (state, action: PayloadAction<string>) => {
      state.filterText = action.payload;
      state.currentPage = 1;
      
      if (action.payload === '') {
        state.filteredData = state.data;
      } else {
        state.filteredData = state.data.filter(row => {
          const searchText = action.payload.toLowerCase();
          
          // Search in basic fields
          const basicMatch = 
            row.role?.toLowerCase().includes(searchText) ||
            row.first_name?.toLowerCase().includes(searchText) ||
            row.last_name?.toLowerCase().includes(searchText) ||
            row.location?.city?.toLowerCase().includes(searchText) ||
            row.location?.state?.toLowerCase().includes(searchText) ||
            row.monthly_sales?.toString().includes(searchText) ||
            row.monthly_target?.toString().includes(searchText) ||
            row.yearly_sales?.toString().includes(searchText) ||
            row.sales?.yearly_target?.toString().includes(searchText);
          
          // Search in commendations array
          const commendationMatch = row.commendations?.some(commendation =>
            commendation.toLowerCase().includes(searchText)
          );
          
          return basicMatch || commendationMatch;
        });
      }
    },
    
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    
    setSortModel: (state, action: PayloadAction<{ colId: string; sort: 'asc' | 'desc' }[]>) => {
      state.sortModel = action.payload;
      
      // Apply sorting to filteredData
      if (action.payload.length > 0) {
        const { colId, sort } = action.payload[0];
        
        state.filteredData.sort((a, b) => {
          let aValue: any;
          let bValue: any;
          
          // Handle nested properties
          switch (colId) {
            case 'city':
              aValue = a.location?.city || '';
              bValue = b.location?.city || '';
              break;
            case 'state':
              aValue = a.location?.state || '';
              bValue = b.location?.state || '';
              break;
            case 'monthly_sales':
              aValue = a.monthly_sales || 0;
              bValue = b.monthly_sales || 0;
              break;
            case 'monthly_target':
              aValue = a.monthly_target || 0;
              bValue = b.monthly_target || 0;
              break;
            case 'yearly_sales':
              aValue = a.yearly_sales || 0;
              bValue = b.yearly_sales || 0;
              break;
            case 'yearly_target':
              aValue = a.sales?.yearly_target || 0;
              bValue = b.sales?.yearly_target || 0;
              break;
            case 'commendations':
              aValue = a.commendations?.join(', ') || '';
              bValue = b.commendations?.join(', ') || '';
              break;
            default:
              aValue = (a as any)[colId] || '';
              bValue = (b as any)[colId] || '';
          }
          
          // Handle different data types
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            return sort === 'asc' 
              ? aValue.localeCompare(bValue)
              : bValue.localeCompare(aValue);
          } else {
            // Numeric comparison
            const numA = Number(aValue) || 0;
            const numB = Number(bValue) || 0;
            return sort === 'asc' ? numA - numB : numB - numA;
          }
        });
      }
    },
    
    addTableRow: (state, action: PayloadAction<TableRow>) => {
      const newRow = {
        ...action.payload,
        ...calculateCurrentMonthData(action.payload.sales)
      };
      state.data.push(newRow);
      
      // Re-apply filter
      if (state.filterText === '') {
        state.filteredData = state.data;
      } else {
        // Reuse the filter logic
        const searchText = state.filterText.toLowerCase();
        state.filteredData = state.data.filter(row => {
          const basicMatch = 
            row.role?.toLowerCase().includes(searchText) ||
            row.first_name?.toLowerCase().includes(searchText) ||
            row.last_name?.toLowerCase().includes(searchText) ||
            row.location?.city?.toLowerCase().includes(searchText) ||
            row.location?.state?.toLowerCase().includes(searchText) ||
            row.monthly_sales?.toString().includes(searchText) ||
            row.monthly_target?.toString().includes(searchText) ||
            row.yearly_sales?.toString().includes(searchText) ||
            row.sales?.yearly_target?.toString().includes(searchText);
          
          const commendationMatch = row.commendations?.some(commendation =>
            commendation.toLowerCase().includes(searchText)
          );
          
          return basicMatch || commendationMatch;
        });
      }
    },
    
    updateTableRow: (state, action: PayloadAction<{ id: string; data: Partial<TableRow> }>) => {
      const { id, data } = action.payload;
      const index = state.data.findIndex(row => row.id === id);
      if (index !== -1) {
        const updatedRow = { ...state.data[index], ...data };
        if (data.sales) {
          // Recalculate computed fields if sales data changed
          const computedData = calculateCurrentMonthData(updatedRow.sales);
          Object.assign(updatedRow, computedData);
        }
        state.data[index] = updatedRow;
        
        // Re-apply filter
        if (state.filterText === '') {
          state.filteredData = state.data;
        } else {
          const searchText = state.filterText.toLowerCase();
          state.filteredData = state.data.filter(row => {
            const basicMatch = 
              row.role?.toLowerCase().includes(searchText) ||
              row.first_name?.toLowerCase().includes(searchText) ||
              row.last_name?.toLowerCase().includes(searchText) ||
              row.location?.city?.toLowerCase().includes(searchText) ||
              row.location?.state?.toLowerCase().includes(searchText) ||
              row.monthly_sales?.toString().includes(searchText) ||
              row.monthly_target?.toString().includes(searchText) ||
              row.yearly_sales?.toString().includes(searchText) ||
              row.sales?.yearly_target?.toString().includes(searchText);
            
            const commendationMatch = row.commendations?.some(commendation =>
              commendation.toLowerCase().includes(searchText)
            );
            
            return basicMatch || commendationMatch;
          });
        }
      }
    },
    
    deleteTableRow: (state, action: PayloadAction<string>) => {
      state.data = state.data.filter(row => row.id !== action.payload);
      state.filteredData = state.filteredData.filter(row => row.id !== action.payload);
    }
  }
});

export const { 
  setTableData,
  setFilterText, 
  setCurrentPage, 
  setSortModel, 
  addTableRow, 
  updateTableRow, 
  deleteTableRow 
} = tableSlice.actions;

export default tableSlice.reducer;