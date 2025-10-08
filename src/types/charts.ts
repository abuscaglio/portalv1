export interface PieChartData {
  name: string;
  value: number;
  color: string;
}

export interface BarChartData {
  month: string;
  [tierName: string]: number | string;
}

export interface LineChartData {
  name: string;
  value: number;
}

export interface TableRow {
  id: number;
  col1: string;
  col2: string;
  col3: string;
  col4: string;
  col5: string;
  col6: string;
  col7: string;
  col8: string;
  col9: string;
  col10: string;
}

export interface ChartState {
  pieData: PieChartData[];
  barData: BarChartData[];
  lineData: LineChartData[];
}

export interface TableState {
  data: TableRow[];
  filteredData: TableRow[];
  filterText: string;
  currentPage: number;
  recordsPerPage: number;
  sortModel: {
    colId: string;
    sort: 'asc' | 'desc';
  }[];
}

export interface RootState {
  charts: ChartState;
  table: TableState;
}