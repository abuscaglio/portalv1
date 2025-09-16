import React, { useState } from 'react';
import { Card, CardContent, Typography, SelectChangeEvent } from '@mui/material';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { 
  setBarDataFromEmployees, 
  setBarDataFromIndividualEmployee, 
  setChartMode,
  getEmployeeOptions 
} from '../../store/chartSlice';
import ChartSelect, { SelectOption } from '../ui/ChartSelect';

interface BarChartProps {
  opacity?: number;
  className?: string;
}

const BarChart: React.FC<BarChartProps> = ({ opacity = 1, className = '' }) => {
  const dispatch = useDispatch();
  const { barData, employees, chartMode, selectedEmployeeId } = useSelector((state: RootState) => state.charts);
  const [selectedView, setSelectedView] = useState<string>('By Tier');

  const employeeOptions = employees.length > 0 ? getEmployeeOptions(employees) : [];

  // Create options for ChartSelect
  const getSelectOptions = (): SelectOption[] => {
    const options: SelectOption[] = [
      { value: 'By Tier', label: 'By Tier' }
    ];

    if (employeeOptions.length > 0) {
      const employeeSelectOptions = employeeOptions.map(employee => ({
        value: `employee-${employee.id}`,
        label: `${employee.name} (${employee.role.replace('Sales - ', '')})`,
      }));
      
      options.push(...employeeSelectOptions);
    }

    return options;
  };

  const tierColors = {
    'Tier 1': '#8B5CF6',
    'Tier 2': '#A78BFA', 
    'Tier 3': '#C4B5FD',
    'Tier 4': '#DDD6FE'
  };

  const individualEmployeeColors = {
    'Employee': '#DDD6FE',
    'Target': '#A78BFA'
  };

  const getDataKeys = () => {
    if (!barData || barData.length === 0) return [];
    
    const sampleData = barData[0];
    const allKeys = Object.keys(sampleData).filter(key => key !== 'month');
    
    if (chartMode === 'individual') {
      const nonTargetKeys = allKeys.filter(key => key !== 'Target');
      const targetKey = allKeys.find(key => key === 'Target');
      
      return targetKey ? [...nonTargetKeys, targetKey] : nonTargetKeys;
    } else {
      const tierOrder = ['Tier 1', 'Tier 2', 'Tier 3', 'Tier 4'];
      const orderedTiers = tierOrder.filter(tier => allKeys.includes(tier));
      
      const remainingKeys = allKeys.filter(key => !tierOrder.includes(key));
      
      return [...orderedTiers, ...remainingKeys];
    }
  };

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    setSelectedView(value);

    if (value === 'By Tier') {
      dispatch(setChartMode('tier'));
      if (employees.length > 0) {
        dispatch(setBarDataFromEmployees(employees));
      }
    } else if (value.startsWith('employee-')) {
      const employeeId = value.replace('employee-', '');
      const selectedEmployee = employees.find(emp => emp.id === employeeId);
      
      if (selectedEmployee) {
        dispatch(setChartMode('individual'));
        dispatch(setBarDataFromIndividualEmployee(selectedEmployee));
      }
    }
  };

  const getBarColor = (dataKey: string) => {
    if (chartMode === 'individual') {
      if (dataKey === 'Target') return individualEmployeeColors['Target'];
      return individualEmployeeColors['Employee'];
    } else {
      return tierColors[dataKey as keyof typeof tierColors] || '#8B5CF6';
    }
  };

  const getChartTitle = () => {
    if (chartMode === 'individual' && selectedEmployeeId) {
      const selectedEmployee = employees.find(emp => emp.id === selectedEmployeeId);
      if (selectedEmployee) {
        return `Monthly Sales - ${selectedEmployee.first_name} ${selectedEmployee.last_name}`;
      }
    }
    return 'Monthly Sales By Tier';
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
        
        <ChartSelect
          value={selectedView}
          onChange={handleSelectChange}
          options={getSelectOptions()}
          placeholder="Select view"
        />
        
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
                    backgroundColor: 'rgba(255, 255, 255, .9)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#000'
                  }}
                  labelStyle={{ color: '#000' }}
                  itemStyle={{ color: '#000' }}
                  formatter={(value: number, name: string) => {
                    if (name === 'Target') {
                      return [`$${value.toLocaleString()}`, 'Monthly Target'];
                    }
                    return [`$${value.toLocaleString()}`, name];
                  }}
                />
                
                {getDataKeys().map((dataKey) => (
                  <Bar 
                    key={dataKey}
                    dataKey={dataKey} 
                    fill={getBarColor(dataKey)} 
                    radius={[4, 4, 0, 0]}
                    name={dataKey}
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