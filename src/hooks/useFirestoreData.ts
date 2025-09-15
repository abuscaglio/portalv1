import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../service/firebase';
import { setTableData } from '../store/tableSlice';
import {setBarDataFromEmployees, setPieDataFromEmployees, setLineDataFromEmployees } from '../store/chartSlice';

export const useFirestoreData = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [hasReachedBottom, setHasReachedBottom] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      dispatch(setPieDataFromEmployees(data));

      // Update bar chart data
      dispatch(setBarDataFromEmployees(data));

      dispatch(setLineDataFromEmployees(data));
      
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
  });

  return {
    isLoading,
    error,
    refetch,
    hasReachedBottom
  };
};