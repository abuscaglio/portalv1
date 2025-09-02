import { useMemo, useCallback, useEffect, useState, useRef } from 'react'
import { DataGrid, GridSortModel, } from '@mui/x-data-grid';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { setSortModel, setTableData } from '../../store/tableSlice';
import * as Columns from './columns/columns';
import { TextField, Box } from '@mui/material';

import { db } from '../../service/firebase';
import { collection, getDocs } from 'firebase/firestore';

interface DataTableProps {
  opacity?: number;
  className?: string;
}

interface ColumnFilters {
  [key: string]: string;
}

const DataTable: React.FC<DataTableProps> = ({ opacity = 1, className = '' }) => {
  const dispatch = useDispatch();
  const { filteredData } = useSelector((state: RootState) => state.table);
  const [hasReachedBottom, setHasReachedBottom] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [columnFilters, setColumnFilters] = useState<ColumnFilters>({});
  const dataGridRef = useRef<HTMLDivElement>(null);
  const [columnWidths, setColumnWidths] = useState<number[]>([]);

  // Function to read actual column widths from DataGrid
  useEffect(() => {
    const readColumnWidths = () => {
      if (dataGridRef.current) {
        const columnHeaders = dataGridRef.current.querySelectorAll('.MuiDataGrid-columnHeader');
        const widths: number[] = [];
        
        columnHeaders.forEach((header) => {
          widths.push(header.getBoundingClientRect().width);
        });
        
        if (widths.length > 0) {
          setColumnWidths(widths);
        }
      }
    };

    // Read widths after DataGrid renders
    const timer = setTimeout(readColumnWidths, 200);
    
    // Also read on window resize
    window.addEventListener('resize', readColumnWidths);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', readColumnWidths);
    };
  }, [filteredData]);

  // Re-read column widths when DataGrid layout changes
  useEffect(() => {
    const readColumnWidths = () => {
      if (dataGridRef.current) {
        const columnHeaders = dataGridRef.current.querySelectorAll('.MuiDataGrid-columnHeader');
        const widths: number[] = [];
        
        columnHeaders.forEach((header) => {
          widths.push(header.getBoundingClientRect().width);
        });
        
        if (widths.length > 0) {
          setColumnWidths(widths);
        }
      }
    };

    const observer = new ResizeObserver(readColumnWidths);
    if (dataGridRef.current) {
      observer.observe(dataGridRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const fetchFirestoreData = async () => {
    if (isLoading || hasReachedBottom) return;
    
    setIsLoading(true);
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
      
      dispatch(setTableData(data));
      
      setHasReachedBottom(true);
    } catch (error) {
      console.error('Error fetching data from Firestore:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFirestoreData();
  }, []);

  const handleSortModelChange = useCallback((sortModel: GridSortModel) => {
    const transformedSortModel = sortModel.map(item => ({
      colId: item.field,
      sort: item.sort as "desc" | "asc"
    }));
    
    dispatch(setSortModel(transformedSortModel));
  }, [dispatch]);

  const filteredRows = useMemo(() => {
    if (Object.keys(columnFilters).length === 0) return filteredData;
    
    return filteredData.filter((row: any) => {
      return Object.entries(columnFilters).every(([field, filterValue]) => {
        if (!filterValue) return true;
        
        // Handle commendations separately due to array structure
        if (field === 'commendations') {
          return Array.isArray(row.commendations) 
            ? row.commendations.some((commendation: string) =>
                commendation.toLowerCase().includes(filterValue.toLowerCase())
              )
            : false;
        }
        
        // Get cell value using object property access with fallbacks
        const cellValue = field === 'city' ? row.location?.city 
                         : field === 'state' ? row.location?.state
                         : row[field] || '';
        
        return cellValue.toString().toLowerCase().includes(filterValue.toLowerCase());
      });
    });
  }, [filteredData, columnFilters]);

  const renderColumnFilters = () => {
    return (
      <Box sx={{ 
        display: 'flex',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
        borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px',
      }}>
        
        {/* Filter inputs for each column - using exact widths from DataGrid */}
        <Box sx={{ 
          padding: '8px', 
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          width: columnWidths[0] || 120,
          flexShrink: 0
        }}>
          <TextField
            size="small"
            placeholder="Filter Role..."
            value={columnFilters['role'] || ''}
            onChange={(e) => setColumnFilters(prev => ({ ...prev, role: e.target.value }))}
            sx={{
              width: '100%',
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
                height: '32px',
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.4)' },
                '&.Mui-focused fieldset': { borderColor: '#9333ea' },
              },
              '& .MuiInputBase-input': {
                color: 'white',
                fontSize: '12px',
                padding: '6px 8px',
              },
              '& .MuiInputBase-input::placeholder': {
                color: 'rgba(255, 255, 255, 0.6)',
                opacity: 1,
              },
            }}
          />
        </Box>

        <Box sx={{ 
          padding: '8px', 
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          width: columnWidths[1] || 120,
          flexShrink: 0
        }}>
          <TextField
            size="small"
            placeholder="Filter First Name..."
            value={columnFilters['first_name'] || ''}
            onChange={(e) => setColumnFilters(prev => ({ ...prev, first_name: e.target.value }))}
            sx={{
              width: '100%',
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
                height: '32px',
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.4)' },
                '&.Mui-focused fieldset': { borderColor: '#9333ea' },
              },
              '& .MuiInputBase-input': {
                color: 'white',
                fontSize: '12px',
                padding: '6px 8px',
              },
              '& .MuiInputBase-input::placeholder': {
                color: 'rgba(255, 255, 255, 0.6)',
                opacity: 1,
              },
            }}
          />
        </Box>

        <Box sx={{ 
          padding: '8px', 
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          width: columnWidths[2] || 120,
          flexShrink: 0
        }}>
          <TextField
            size="small"
            placeholder="Filter Last Name..."
            value={columnFilters['last_name'] || ''}
            onChange={(e) => setColumnFilters(prev => ({ ...prev, last_name: e.target.value }))}
            sx={{
              width: '100%',
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
                height: '32px',
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.4)' },
                '&.Mui-focused fieldset': { borderColor: '#9333ea' },
              },
              '& .MuiInputBase-input': {
                color: 'white',
                fontSize: '12px',
                padding: '6px 8px',
              },
              '& .MuiInputBase-input::placeholder': {
                color: 'rgba(255, 255, 255, 0.6)',
                opacity: 1,
              },
            }}
          />
        </Box>

        <Box sx={{ 
          padding: '8px', 
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          width: columnWidths[3] || 120,
          flexShrink: 0
        }}>
          <TextField
            size="small"
            placeholder="Filter City..."
            value={columnFilters['city'] || ''}
            onChange={(e) => setColumnFilters(prev => ({ ...prev, city: e.target.value }))}
            sx={{
              width: '100%',
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
                height: '32px',
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.4)' },
                '&.Mui-focused fieldset': { borderColor: '#9333ea' },
              },
              '& .MuiInputBase-input': {
                color: 'white',
                fontSize: '12px',
                padding: '6px 8px',
              },
              '& .MuiInputBase-input::placeholder': {
                color: 'rgba(255, 255, 255, 0.6)',
                opacity: 1,
              },
            }}
          />
        </Box>

        <Box sx={{ 
          padding: '8px', 
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          width: columnWidths[4] || 120,
          flexShrink: 0
        }}>
          <TextField
            size="small"
            placeholder="Filter State..."
            value={columnFilters['state'] || ''}
            onChange={(e) => setColumnFilters(prev => ({ ...prev, state: e.target.value }))}
            sx={{
              width: '100%',
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
                height: '32px',
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.4)' },
                '&.Mui-focused fieldset': { borderColor: '#9333ea' },
              },
              '& .MuiInputBase-input': {
                color: 'white',
                fontSize: '12px',
                padding: '6px 8px',
              },
              '& .MuiInputBase-input::placeholder': {
                color: 'rgba(255, 255, 255, 0.6)',
                opacity: 1,
              },
            }}
          />
        </Box>

        <Box sx={{ 
          padding: '8px', 
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          width: columnWidths[5] || 120,
          flexShrink: 0
        }}>
          <TextField
            size="small"
            placeholder="Filter Monthly Sales..."
            value={columnFilters['monthly_sales'] || ''}
            onChange={(e) => setColumnFilters(prev => ({ ...prev, monthly_sales: e.target.value }))}
            sx={{
              width: '100%',
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
                height: '32px',
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.4)' },
                '&.Mui-focused fieldset': { borderColor: '#9333ea' },
              },
              '& .MuiInputBase-input': {
                color: 'white',
                fontSize: '12px',
                padding: '6px 8px',
              },
              '& .MuiInputBase-input::placeholder': {
                color: 'rgba(255, 255, 255, 0.6)',
                opacity: 1,
              },
            }}
          />
        </Box>

        <Box sx={{ 
          padding: '8px', 
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          width: columnWidths[6] || 120,
          flexShrink: 0
        }}>
          <TextField
            size="small"
            placeholder="Filter Monthly Target..."
            value={columnFilters['monthly_target'] || ''}
            onChange={(e) => setColumnFilters(prev => ({ ...prev, monthly_target: e.target.value }))}
            sx={{
              width: '100%',
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
                height: '32px',
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.4)' },
                '&.Mui-focused fieldset': { borderColor: '#9333ea' },
              },
              '& .MuiInputBase-input': {
                color: 'white',
                fontSize: '12px',
                padding: '6px 8px',
              },
              '& .MuiInputBase-input::placeholder': {
                color: 'rgba(255, 255, 255, 0.6)',
                opacity: 1,
              },
            }}
          />
        </Box>

        <Box sx={{ 
          padding: '8px', 
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          width: columnWidths[7] || 120,
          flexShrink: 0
        }}>
          <TextField
            size="small"
            placeholder="Filter Yearly Sales..."
            value={columnFilters['yearly_sales'] || ''}
            onChange={(e) => setColumnFilters(prev => ({ ...prev, yearly_sales: e.target.value }))}
            sx={{
              width: '100%',
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
                height: '32px',
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.4)' },
                '&.Mui-focused fieldset': { borderColor: '#9333ea' },
              },
              '& .MuiInputBase-input': {
                color: 'white',
                fontSize: '12px',
                padding: '6px 8px',
              },
              '& .MuiInputBase-input::placeholder': {
                color: 'rgba(255, 255, 255, 0.6)',
                opacity: 1,
              },
            }}
          />
        </Box>

        <Box sx={{ 
          padding: '8px', 
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          width: columnWidths[8] || 120,
          flexShrink: 0
        }}>
          <TextField
            size="small"
            placeholder="Filter Yearly Target..."
            value={columnFilters['yearly_target'] || ''}
            onChange={(e) => setColumnFilters(prev => ({ ...prev, yearly_target: e.target.value }))}
            sx={{
              width: '100%',
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
                height: '32px',
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.4)' },
                '&.Mui-focused fieldset': { borderColor: '#9333ea' },
              },
              '& .MuiInputBase-input': {
                color: 'white',
                fontSize: '12px',
                padding: '6px 8px',
              },
              '& .MuiInputBase-input::placeholder': {
                color: 'rgba(255, 255, 255, 0.6)',
                opacity: 1,
              },
            }}
          />
        </Box>

        <Box sx={{ 
          padding: '8px',
          width: columnWidths[9] || 180,
          flexShrink: 0
        }}>
          <TextField
            size="small"
            placeholder="Filter Commendations..."
            value={columnFilters['commendations'] || ''}
            onChange={(e) => setColumnFilters(prev => ({ ...prev, commendations: e.target.value }))}
            sx={{
              width: '100%',
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
                height: '32px',
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.4)' },
                '&.Mui-focused fieldset': { borderColor: '#9333ea' },
              },
              '& .MuiInputBase-input': {
                color: 'white',
                fontSize: '12px',
                padding: '6px 8px',
              },
              '& .MuiInputBase-input::placeholder': {
                color: 'rgba(255, 255, 255, 0.6)',
                opacity: 1,
              },
            }}
          />
        </Box>
      </Box>
    );
  };

  return (
    <div 
      className={`bg-white/10 backdrop-blur-md rounded-lg p-6 w-full ${className}`}
      style={{ opacity }}
    >
      <Box 
        ref={dataGridRef}
        className="rounded-lg overflow-hidden"
        sx={{ 
          height: 500, 
          width: '100%',
          '& .MuiDataGrid-root': {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            borderTopLeftRadius: '0px',
            borderTopRightRadius: '0px',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            fontSize: '14px',
            fontWeight: 600,
          },
          '& .MuiDataGrid-columnHeader': {
            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          },
          '& .MuiDataGrid-cell': {
            color: 'white',
            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          },
          '& .MuiDataGrid-row': {
            '&:nth-of-type(odd)': {
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
            },
            '&:hover': {
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
            },
          },
          '& .MuiDataGrid-footerContainer': {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            color: 'white',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          },
          '& .MuiTablePagination-root': {
            color: 'white',
          },
          '& .MuiTablePagination-selectIcon': {
            color: 'white',
          },
          '& .MuiDataGrid-selectedRowCount': {
            color: 'white',
          },
          '& .MuiDataGrid-toolbarContainer': {
            color: 'white',
          },
          '& .MuiDataGrid-filterIcon': {
            color: 'white',
          },
          '& .MuiDataGrid-sortIcon': {
            color: 'white',
          },
          '& .MuiDataGrid-menuIconButton': {
            color: 'white',
          },
          '& .MuiCheckbox-root': {
            color: 'white',
            '&.Mui-checked': {
              color: '#9333ea',
            },
          },
        }}
      >
        {renderColumnFilters()}
        <DataGrid
          rows={filteredRows}
          columns={Columns.columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 20 },
            },
          }}
          pageSizeOptions={[10, 20, 50]}
          checkboxSelection={false}
          disableRowSelectionOnClick
          disableColumnMenu
          onSortModelChange={handleSortModelChange}
          getRowId={(row) => row.id}
          sx={{ border: 0 }}
        />
      </Box>
    </div>
  );
};

export default DataTable;