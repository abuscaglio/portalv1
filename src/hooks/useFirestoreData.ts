import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../service/firebase';
import { setTableData } from '../store/tableSlice';
import { setPieData, setBarDataFromEmployees } from '../store/chartSlice';

export const useFirestoreData = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [hasReachedBottom, setHasReachedBottom] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transformSalesDataToPieChart = (employees: any[]) => {
    const salesByTier = employees.reduce((acc, employee) => {
      const tier = employee.role || 'Unknown';
      const yearlySales = employee.yearly_sales || 0;
      
      acc[tier] = (acc[tier] || 0) + yearlySales;
      return acc;
    }, {} as Record<string, number>);

    const tierColors: Record<string, string> = {
      'Sales - Tier 1': '#8B5CF6',
      'Sales - Tier 2': '#A78BFA', 
      'Sales - Tier 3': '#C4B5FD',
      'Sales - Tier 4': '#DDD6FE',
      'Unknown': '#DDD6FE'
    };

    return Object.entries(salesByTier).map(([tier, totalSales]) => ({
      name: tier,
      value: Math.round((totalSales as number) * 100) / 100,
      color: tierColors[tier] || '#95A5A6'
    }));
  };

  const fetchFirestoreData = async () => {
    if (isLoading || hasReachedBottom) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const querySnapshot = await getDocs(collection(db, 'employees'));
      const data = querySnapshot.docs.map(doc => {
        const docData = doc.data();
        const serializedData: any = { id: doc.id };
        
        Object.keys(docData).forEach(key => {
          const value = docData[key];
          
          if (value && typeof value === 'object' && value.toDate) {
            serializedData[key] = value.toDate().toISOString();
          } else {
            serializedData[key] = value;
          }
        });
        
        return serializedData;
      });
      
      // Update table data
      dispatch(setTableData(data));
      
      // Update pie chart data
      const pieChartData = transformSalesDataToPieChart(data);
      dispatch(setPieData(pieChartData));

      // Update bar chart data
      dispatch(setBarDataFromEmployees(data));
      
      setHasReachedBottom(true);
    } catch (error) {
      console.error('Error fetching data from Firestore:', error);
      setError('Failed to fetch data from Firestore');
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = () => {
    setHasReachedBottom(false);
    fetchFirestoreData();
  };

  useEffect(() => {
    fetchFirestoreData();
  }, []);

  return {
    isLoading,
    error,
    refetch,
    hasReachedBottom
  };
};