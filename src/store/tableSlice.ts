import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TableState, TableRow } from '../types';

// Generate sample data
const generateTableData = (): TableRow[] => {
  const data: TableRow[] = [];
  for (let i = 1; i <= 100; i++) {
    data.push({
      id: i,
      col1: `Placeholder ${i}`,
      col2: `Placeholder ${i + 100}`,
      col3: `Placeholder ${i + 200}`,
      col4: `Placeholder ${i + 300}`,
      col5: `Placeholder ${i + 400}`,
      col6: `Placeholder ${i + 500}`,
      col7: `Placeholder ${i + 600}`,
      col8: `Placeholder ${i + 700}`,
      col9: `Placeholder ${i + 800}`,
      col10: `Placeholder ${i + 900}`
    });
  }
  return data;
};

const initialState: TableState = {
  data: generateTableData(),
  filteredData: generateTableData(),
  filterText: '',
  currentPage: 1,
  recordsPerPage: 20,
  sortModel: []
};

const tableSlice = createSlice({
  name: 'table',
  initialState,
  reducers: {
    setFilterText: (state, action: PayloadAction<string>) => {
      state.filterText = action.payload;
      state.currentPage = 1;
      // Filter data
      if (action.payload === '') {
        state.filteredData = state.data;
      } else {
        state.filteredData = state.data.filter(row =>
          Object.values(row).some(value =>
            value.toString().toLowerCase().includes(action.payload.toLowerCase())
          )
        );
      }
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setSortModel: (state, action: PayloadAction<{ colId: string; sort: 'asc' | 'desc' }[]>) => {
      state.sortModel = action.payload;
    },
    setTableData: (state, action) => {
        state.filteredData = action.payload;
    },
    addTableRow: (state, action: PayloadAction<TableRow>) => {
      state.data.push(action.payload);
      // Re-apply filter
      if (state.filterText === '') {
        state.filteredData = state.data;
      } else {
        state.filteredData = state.data.filter(row =>
          Object.values(row).some(value =>
            value.toString().toLowerCase().includes(state.filterText.toLowerCase())
          )
        );
      }
    },
    updateTableRow: (state, action: PayloadAction<{ id: number; data: Partial<TableRow> }>) => {
      const { id, data } = action.payload;
      const index = state.data.findIndex(row => row.id === id);
      if (index !== -1) {
        state.data[index] = { ...state.data[index], ...data };
        // Re-apply filter
        if (state.filterText === '') {
          state.filteredData = state.data;
        } else {
          state.filteredData = state.data.filter(row =>
            Object.values(row).some(value =>
              value.toString().toLowerCase().includes(state.filterText.toLowerCase())
            )
          );
        }
      }
    },
    deleteTableRow: (state, action: PayloadAction<number>) => {
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