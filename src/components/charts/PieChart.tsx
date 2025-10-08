import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { PieChart as RechartsePieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface PieChartProps {
  opacity?: number;
  className?: string;
}

const PieChart: React.FC<PieChartProps> = ({ opacity = 1, className = '' }) => {
  const pieData = useSelector((state: RootState) => state.charts.pieData);
  const employees = useSelector((state: RootState) => state.charts.employees);

  // Calculate total earned and target from employees data
  const calculateTotals = () => {
    if (!employees || employees.length === 0) {
      return { totalEarned: 0, totalTarget: 0 };
    }

    const currentMonth = new Date().toLocaleString('default', { month: 'long' }).toLowerCase();
    
    const totals = employees.reduce((acc, employee) => {
      const monthData = employee.sales.monthly[currentMonth];
      return {
        totalEarned: acc.totalEarned + (monthData?.sold || 0),
        totalTarget: acc.totalTarget + (monthData?.target || 0)
      };
    }, { totalEarned: 0, totalTarget: 0 });

    return totals;
  };

  const { totalEarned, totalTarget } = calculateTotals();

  const CustomLegend = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mr: 2 }}>
      {pieData.map((entry, index) => (
        <Box key={`legend-${index}`} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 16,
              height: 16,
              backgroundColor: entry.color,
              border: '1px solid white',
              borderRadius: 0.5
            }}
          />
          <Typography
            variant="body2"
            sx={{
              color: 'white',
              fontSize: '12px'
            }}
          >
            {entry.name}
          </Typography>
        </Box>
      ))}
    </Box>
  );

  const formatTooltip = (value: number, name: string) => {
    const formattedValue = `$${value.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
    
    return [formattedValue, name];
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  return (
    <Card 
      className={`chart-card ${className}`}
      sx={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: 3,
        height: 265,
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
            mb: 1 
          }}
        >
          Monthly Sales By Tier
        </Typography>
        
        {/* Earned and Target text */}
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'white', 
            textAlign: 'center',
            mb: 2,
            fontSize: '14px'
          }}
        >
          Earned: {formatCurrency(totalEarned)} -- Target: {formatCurrency(totalTarget)}
        </Typography>

        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
          {/* Custom Legend */}
          <CustomLegend />
          
          {/* Pie Chart */}
          <div style={{ flexGrow: 1, height: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RechartsePieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#333'
                  }}
                  formatter={formatTooltip}
                />
              </RechartsePieChart>
            </ResponsiveContainer>
          </div>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PieChart;