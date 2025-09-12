import { useMemo, useCallback, useEffect, useState, useRef } from 'react'
import { DataGrid, GridSortModel, } from '@mui/x-data-grid';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { setSortModel } from '../../store/tableSlice';
import * as Columns from './columns/columns';
import { TextField, Box } from '@mui/material';

interface DataTableProps {
  opacity?: number;
  className?: string;
  fetchError?: string | null;
  isLoading: boolean;
  refetch: () => void;
}

interface ColumnFilters {
  [key: string]: string;
}

const DataTable: React.FC<DataTableProps> = ({ 
  opacity = 1, 
  className = '', 
  fetchError = null, 
  isLoading = false, 
  refetch 
}) => {
  const dispatch = useDispatch();
  const { filteredData } = useSelector((state: RootState) => state.table);
  const [columnFilters, setColumnFilters] = useState<ColumnFilters>({});
  const dataGridRef = useRef<HTMLDivElement>(null);
  const [columnWidths, setColumnWidths] = useState<number[]>([]);

  const readColumnWidths = useCallback(() => {
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
  }, []);

  // Read column widths after DataGrid renders and on data changes
  useEffect(() => {
    const timer = setTimeout(readColumnWidths, 200);
    return () => clearTimeout(timer);
  }, [filteredData, readColumnWidths]);

  // Handle window resize and DataGrid layout changes
  useEffect(() => {
    const handleResize = () => {
      setTimeout(readColumnWidths, 300);
    };

    window.addEventListener('resize', handleResize);
    
    const observer = new ResizeObserver(() => {
      setTimeout(readColumnWidths, 100);
    });
    
    if (dataGridRef.current) {
      observer.observe(dataGridRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, [readColumnWidths]);

  // Also read column widths when DataGrid columns change (on column resize)
  useEffect(() => {
    const handleColumnResize = () => {
      setTimeout(readColumnWidths, 50);
    };

    const dataGridElement = dataGridRef.current;
    if (dataGridElement) {
      dataGridElement.addEventListener('mouseup', handleColumnResize);
      
      return () => {
        dataGridElement.removeEventListener('mouseup', handleColumnResize);
      };
    }
  }, [readColumnWidths]);

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
        
        // Handle different field types
        let cellValue: string = '';
        
        switch (field) {
          case 'commendations':
            if (Array.isArray(row.commendations)) {
              return row.commendations.some((commendation: string) =>
                commendation.toLowerCase().includes(filterValue.toLowerCase())
              );
            }
            return false;
            
          case 'city':
            cellValue = row.location?.city || '';
            break;
            
          case 'state':
            cellValue = row.location?.state || '';
            break;
            
          case 'monthly_sales':
            cellValue = row.monthly_sales?.toString() || '';
            break;
            
          case 'monthly_target':
            cellValue = row.monthly_target?.toString() || '';
            break;
            
          case 'yearly_sales':
            cellValue = row.yearly_sales?.toString() || '';
            break;
            
          case 'yearly_target':
            cellValue = row.sales?.yearly_target?.toString() || '';
            break;
            
          default:
            cellValue = row[field]?.toString() || '';
        }
        
        return cellValue.toLowerCase().includes(filterValue.toLowerCase());
      });
    });
  }, [filteredData, columnFilters]);

  // Helper function to create filter TextField
  const createFilterField = (field: string, placeholder: string, width: number, index: number) => (
    <Box 
      key={`filter-${field}`} // Added unique key here
      sx={{ 
        padding: '8px', 
        borderRight: index < 9 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
        width: width || 120,
        flexShrink: 0
      }}
    >
      <TextField
        size="small"
        placeholder={placeholder}
        value={columnFilters[field] || ''}
        onChange={(e) => setColumnFilters(prev => ({ ...prev, [field]: e.target.value }))}
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
  );

  const renderColumnFilters = () => {
    const filterConfig = [
      { field: 'role', placeholder: 'Filter Role...', index: 0 },
      { field: 'first_name', placeholder: 'Filter First Name...', index: 1 },
      { field: 'last_name', placeholder: 'Filter Last Name...', index: 2 },
      { field: 'city', placeholder: 'Filter City...', index: 3 },
      { field: 'state', placeholder: 'Filter State...', index: 4 },
      { field: 'monthly_sales', placeholder: 'Filter Monthly Sales...', index: 5 },
      { field: 'monthly_target', placeholder: 'Filter Monthly Target...', index: 6 },
      { field: 'yearly_sales', placeholder: 'Filter Yearly Sales...', index: 7 },
      { field: 'yearly_target', placeholder: 'Filter Yearly Target...', index: 8 },
      { field: 'commendations', placeholder: 'Filter Commendations...', index: 9 }
    ];

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
        {filterConfig.map(({ field, placeholder, index }) =>
          createFilterField(field, placeholder, columnWidths[index], index)
        )}
      </Box>
    );
  };

  // Show error state
  if (fetchError) {
    return (
      <div className={`bg-white/10 backdrop-blur-md rounded-lg p-6 w-full ${className}`}>
        <div className="text-red-400">Error: {fetchError}</div>
        <button 
          onClick={refetch} 
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

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
          loading={isLoading}
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