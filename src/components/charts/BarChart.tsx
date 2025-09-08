import React, { useState } from 'react';
import { Card, CardContent, Typography, Select, MenuItem, FormControl, SelectChangeEvent } from '@mui/material';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { 
  setBarDataFromEmployees, 
  setBarDataFromIndividualEmployee, 
  setChartMode,
  getEmployeeOptions 
} from '../../store/chartSlice'; // Adjust import path as needed

interface BarChartProps {
  opacity?: number;
  className?: string;
}

const BarChart: React.FC<BarChartProps> = ({ opacity = 1, className = '' }) => {
  const dispatch = useDispatch();
  const { barData, employees, chartMode, selectedEmployeeId } = useSelector((state: RootState) => state.charts);
  const [selectedView, setSelectedView] = useState<string>('By Tier');

  // Get employee options for dropdown
  const employeeOptions = employees.length > 0 ? getEmployeeOptions(employees) : [];

  // Define colors for tiers and individual employees
  const tierColors = {
    'Tier 1': '#8B5CF6',
    'Tier 2': '#A78BFA', 
    'Tier 3': '#C4B5FD',
    'Tier 4': '#DDD6FE'
  };

  const individualEmployeeColors = {
    'Employee': '#10B981', // Green for employee sales
    'Target': '#F59E0B'    // Amber for target line
  };

  // Get all possible data keys from barData for rendering bars
  const getDataKeys = () => {
    if (!barData || barData.length === 0) return [];
    
    const sampleData = barData[0];
    return Object.keys(sampleData).filter(key => key !== 'month');
  };

  const handleSelectChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    setSelectedView(value);

    if (value === 'By Tier') {
      // Switch back to tier view
      dispatch(setChartMode('tier'));
      if (employees.length > 0) {
        dispatch(setBarDataFromEmployees(employees));
      }
    } else if (value.startsWith('employee-')) {
      // Individual employee selected
      const employeeId = value.replace('employee-', '');
      const selectedEmployee = employees.find(emp => emp.id === employeeId);
      
      if (selectedEmployee) {
        dispatch(setChartMode('individual'));
        dispatch(setBarDataFromIndividualEmployee(selectedEmployee));
      }
    }
    // Handle other view types (By Region, By Product, etc.) as needed
  };

  // Get appropriate colors based on chart mode
  const getBarColor = (dataKey: string) => {
    if (chartMode === 'individual') {
      if (dataKey === 'Target') return individualEmployeeColors['Target'];
      return individualEmployeeColors['Employee'];
    } else {
      // Tier mode - use tier colors or default
      return tierColors[dataKey as keyof typeof tierColors] || '#8B5CF6';
    }
  };

  // Get chart title based on current mode
  const getChartTitle = () => {
    if (chartMode === 'individual' && selectedEmployeeId) {
      const selectedEmployee = employees.find(emp => emp.id === selectedEmployeeId);
      if (selectedEmployee) {
        return `Monthly Sales - ${selectedEmployee.first_name} ${selectedEmployee.last_name}`;
      }
    }
    return 'Monthly Sales (FY:2025)';
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
          {getChartTitle()}
        </Typography>
        
        <FormControl 
          size="small" 
          sx={{ 
            mb: 2, 
            alignSelf: 'center',
            minWidth: 160
          }}
        >
          <Select
            value={selectedView}
            onChange={handleSelectChange}
            sx={{
              color: 'white',
              fontSize: '0.75rem',
              height: 32,
              '& .MuiOutlinedInput-input': {
                padding: '6px 14px',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.3)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.5)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.7)',
              },
              '& .MuiSelect-icon': {
                color: 'white',
              },
            }}
          >
            <MenuItem value="By Tier">By Tier</MenuItem>
            
            {/* Employee Options */}
            {employeeOptions.length > 0 && [
              <MenuItem key="divider" disabled sx={{ borderBottom: '1px solid #ccc', py: 0.5 }}>
                <em>Individual Employees</em>
              </MenuItem>,
              ...employeeOptions.map((employee) => (
                <MenuItem key={employee.id} value={`employee-${employee.id}`}>
                  {employee.name} ({employee.role.replace('Sales - ', '')})
                </MenuItem>
              ))
            ]}
          </Select>
        </FormControl>
        
        <div style={{ flexGrow: 1 }}>
          {barData.length === 0 ? (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%',
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '0.9rem'
            }}>
              No data available. Load employee data to view charts.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                <XAxis 
                  dataKey="month"
                  stroke="#fff" 
                  fontSize={11}
                  axisLine={false}
                  tickLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval={0}
                />
                <YAxis 
                  stroke="#fff" 
                  fontSize={12}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#000'
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === 'Target') {
                      return [`${value.toLocaleString()} (Target)`, 'Monthly Target'];
                    }
                    return [`${value.toLocaleString()}`, name];
                  }}
                />
                
                {/* Dynamically render bars based on data keys */}
                {getDataKeys().map((dataKey) => (
                  <Bar 
                    key={dataKey}
                    dataKey={dataKey} 
                    fill={getBarColor(dataKey)} 
                    radius={[4, 4, 0, 0]}
                    name={dataKey}
                    // Make target bar more transparent if it exists
                    opacity={dataKey === 'Target' ? 0.7 : 1}
                  />
                ))}
              </RechartsBarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BarChart;