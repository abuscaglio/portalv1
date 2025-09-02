import React from 'react';

export const formatCurrency = (value: any): string => {
    if (value === null || value === undefined || value === '') {
      return '$0.00';
    }
    
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(numValue)) {
      return '$0.00';
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numValue);
  };

  export const getSalesPerformanceColor = (monthlySales: number, monthlyTarget: number): string => {
    if (!monthlySales || !monthlyTarget || monthlyTarget === 0) {
      return 'transparent';
    }
    
    const percentage = (monthlySales / monthlyTarget) * 100;
    
    if (percentage <= 33.3) {
      return 'rgba(239, 68, 68, 0.6)'; // Red with opacity
    } else if (percentage <= 66.6) {
      return 'rgba(234, 179, 8, 0.6)'; // Yellow with opacity
    } else {
      return 'rgba(34, 197, 94, 0.6)'; // Green with opacity
    }
  };