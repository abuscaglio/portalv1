import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface LineChartProps {
  opacity?: number;
  className?: string;
}

const LineChart: React.FC<LineChartProps> = ({ opacity = 1, className = '' }) => {
  const lineData = useSelector((state: RootState) => state.charts.lineData);

  return (
    <Card 
      className={`chart-card ${className}`}
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
            mb: 2 
          }}
        >
         Weekly Sales 
        </Typography>
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
              />
              <YAxis 
                stroke="#fff" 
                fontSize={12}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#333'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#A78BFA" 
                strokeWidth={3}
                dot={{ 
                  fill: '#C4B5FD', 
                  strokeWidth: 2, 
                  r: 6,
                  stroke: '#A78BFA'
                }}
                activeDot={{ 
                  r: 8, 
                  fill: '#DDD6FE',
                  stroke: '#A78BFA',
                  strokeWidth: 2
                }}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default LineChart;