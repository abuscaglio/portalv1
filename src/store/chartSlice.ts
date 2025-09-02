import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChartState, PieChartData, BarChartData, LineChartData } from '../types';

const initialState: ChartState = {
  pieData: [
    { name: 'Category A', value: 400, color: '#8B5CF6' },
    { name: 'Category B', value: 300, color: '#A78BFA' },
    { name: 'Category C', value: 300, color: '#C4B5FD' },
    { name: 'Category D', value: 200, color: '#DDD6FE' }
  ],
  barData: [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 500 },
    { name: 'Apr', value: 200 },
    { name: 'May', value: 600 }
  ],
  lineData: [
    { name: 'Week 1', value: 400 },
    { name: 'Week 2', value: 300 },
    { name: 'Week 3', value: 600 },
    { name: 'Week 4', value: 800 },
    { name: 'Week 5', value: 500 }
  ]
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
    }
  }
});

export const { 
  setPieData, 
  setBarData, 
  setLineData, 
  updatePieDataPoint, 
  updateBarDataPoint, 
  updateLineDataPoint 
} = chartSlice.actions;

export default chartSlice.reducer;