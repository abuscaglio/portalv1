import React, { useEffect } from 'react';
import { Card, CardContent, Typography, SelectChangeEvent } from '@mui/material';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { 
  setLineDataFromEmployees, 
  setLineDataFromIndividualEmployee,
  setLineChartMode,
  setSelectedLineEmployeeId,
  getEmployeeOptions 
} from '../../store/chartSlice';
import ChartSelect, { SelectOption } from '../ui/ChartSelect';

interface LineChartProps {
  opacity?: number;
  className?: string;
}

const LineChart: React.FC<LineChartProps> = ({ opacity = 1, className = '' }) => {
  const dispatch = useDispatch();
  const lineData = useSelector((state: RootState) => state.charts.lineData);
  const employees = useSelector((state: RootState) => state.charts.employees);
  const lineChartMode = useSelector((state: RootState) => state.charts.lineChartMode);
  const selectedLineEmployeeId = useSelector((state: RootState) => state.charts.selectedLineEmployeeId);

  // Initialize with tier data when employees are available
  useEffect(() => {
    if (employees.length > 0 && lineChartMode === 'tier' && lineData.length === 0) {
      dispatch(setLineDataFromEmployees(employees));
    }
  }, [employees, lineChartMode, lineData.length, dispatch]);

  // Get employee options for dropdown
  const employeeOptions = getEmployeeOptions(employees);

  // Create options for ChartSelect
  const getSelectOptions = (): SelectOption[] => {
    const options: SelectOption[] = [
      { value: 'tier', label: 'By Tier' }
    ];

    if (employeeOptions.length > 0) {
      const employeeSelectOptions = employeeOptions.map(employee => ({
        value: employee.id,
        label: `${employee.name} (${employee.role.replace('Sales - ', '')})`,
      }));
      
      options.push(...employeeSelectOptions);
    }

    return options;
  };

  const handleViewChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    
    if (value === 'tier') {
      dispatch(setLineChartMode('tier'));
      dispatch(setLineDataFromEmployees(employees));
    } else {
      // Individual employee selected
      const employee = employees.find(emp => emp.id === value);
      if (employee) {
        dispatch(setLineChartMode('individual'));
        dispatch(setSelectedLineEmployeeId(value));
        dispatch(setLineDataFromIndividualEmployee(employee));
      }
    }
  };

  // Get unique keys from data for dynamic line rendering (excluding 'name')
  const getDataKeys = () => {
    if (lineData.length === 0) return [];
    const firstDataPoint = lineData[0];
    return Object.keys(firstDataPoint).filter(key => key !== 'name');
  };

  // Colors for different tiers/employees
  const getLineColor = (key: string, index: number) => {
    // Tier-specific colors
    if (key === 'Tier 1') return '#8B5CF6';
    if (key === 'Tier 2') return '#A78BFA';
    if (key === 'Tier 3') return '#C4B5FD';
    if (key === 'Tier 4') return '#DDD6FE';
    
    // For individual employees, use a single color
    return '#A78BFA';
  };

  // Custom tooltip formatter
  const formatTooltip = (value: any, name: string) => {
    return [`${Number(value).toFixed(1)}%`, name];
  };

  // Get current select value
  const getCurrentSelectValue = () => {
    return lineChartMode === 'tier' ? 'tier' : selectedLineEmployeeId || '';
  };

  return (
    <Card 
      className={`chart-card bar-chart-card`}
      sx={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: 3,
        height: 320,
        opacity,
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Typography 
          variant="h6" 
          component="h3" 
          sx={{ 
            color: 'white', 
            fontWeight: 'bold', 
            textAlign: 'center',
            mb: 1,
            fontSize: '1rem'
          }}
        >
          Target Achievement Rate Over Time
        </Typography>
        
        <ChartSelect
          value={getCurrentSelectValue()}
          onChange={handleViewChange}
          options={getSelectOptions()}
          placeholder="Select view"
          minWidth={160}
          maxWidth={250}
        />
        
        <div style={{ flexGrow: 1 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
              <XAxis 
                dataKey="name" 
                stroke="#fff" 
                fontSize={12}
                axisLine={false}
                tickLine={false}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                stroke="#fff" 
                fontSize={12}
                axisLine={false}
                tickLine={false}
                domain={['dataMin - 5', 'dataMax + 5']}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#333',
                }}
                labelStyle={{ color: '#000' }}
                itemStyle={{ color: '#000' }}
                formatter={formatTooltip}
              />

              {/* Render lines dynamically based on data keys */}
              {getDataKeys().map((key, index) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={getLineColor(key, index)}
                  strokeWidth={3}
                  dot={false}
                  activeDot={{
                    r: 6,
                    fill: getLineColor(key, index),
                    strokeWidth: 2,
                  }}
                />
              ))}
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default LineChart;