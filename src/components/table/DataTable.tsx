import { useMemo, useCallback, useEffect, useState } from 'react'
import { DataGrid, GridColDef, GridSortModel, GridFilterModel } from '@mui/x-data-grid';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { setFilterText, setSortModel, setTableData } from '../../store/tableSlice';
import { TextField, Box, Tooltip } from '@mui/material';
import { 
  WorkspacePremium,
  Leaderboard,
  SportsMma,
  MeetingRoom,
  Grade,
  Star,
  FiveKPlus,
  LocalFireDepartment,
  TrackChanges,
  Umbrella
} from '@mui/icons-material';
// Import your Firebase service
import { db } from '../../service/firebase'; // Adjust path as needed
import { collection, getDocs } from 'firebase/firestore';

interface DataTableProps {
  opacity?: number;
  className?: string;
}

const DataTable: React.FC<DataTableProps> = ({ opacity = 1, className = '' }) => {
  const dispatch = useDispatch();
  const { filteredData, filterText } = useSelector((state: RootState) => state.table);
  const [hasReachedBottom, setHasReachedBottom] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Currency formatter function
  const formatCurrency = (value: any): string => {
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

  // Commendation icon mapping
  const commendationIcons: { [key: string]: JSX.Element } = {
    'Top Seller': <WorkspacePremium sx={{ color: 'white', fontSize: '20px' }} />,
    'Sales Leader': <Leaderboard sx={{ color: 'white', fontSize: '20px' }} />,
    'Revenue Champion': <SportsMma sx={{ color: 'white', fontSize: '20px' }} />,
    'Outstanding Closer': <MeetingRoom sx={{ color: 'white', fontSize: '20px' }} />,
    'Client Excellence Award': <Grade sx={{ color: 'white', fontSize: '20px' }} />,
    'Highest Performer': <Star sx={{ color: 'white', fontSize: '20px' }} />,
    'Quota Achiever': <FiveKPlus sx={{ color: 'white', fontSize: '20px' }} />,
    'Sales Trailblazer': <LocalFireDepartment sx={{ color: 'white', fontSize: '20px' }} />,
    'Target Mastery Award': <TrackChanges sx={{ color: 'white', fontSize: '20px' }} />,
    'Rainmaker Award': <Umbrella sx={{ color: 'white', fontSize: '20px' }} />,
  };

  // Component to render commendations as icons
  const CommendationsCell = ({ commendations }: { commendations: string[] }) => {
    if (!Array.isArray(commendations) || commendations.length === 0) {
      return null;
    }

    return (
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center' }}>
        {commendations.map((commendation, index) => {
          const icon = commendationIcons[commendation];
          if (!icon) return null;

          return (
            <Tooltip key={index} title={commendation} arrow>
              {icon}
            </Tooltip>
          );
        })}
      </Box>
    );
  };

  // Fetch data from Firebase
  const fetchFirestoreData = async () => {
    if (isLoading || hasReachedBottom) return;
    
    setIsLoading(true);
    try {
      // Replace 'your-collection-name' with your actual collection name
      const querySnapshot = await getDocs(collection(db, 'employees'));
      const data = querySnapshot.docs.map(doc => {
        const docData = doc.data();
        
        // Convert Firestore Timestamps to serializable format
        const serializedData: any = { id: doc.id };
        
        Object.keys(docData).forEach(key => {
          const value = docData[key];
          
          // Check if value is a Firestore Timestamp
          if (value && typeof value === 'object' && value.toDate) {
            // Convert Timestamp to ISO string
            serializedData[key] = value.toDate().toISOString();
          } else {
            serializedData[key] = value;
          }
        });
        
        return serializedData;
      });
      
      console.log('Fetched data from Firestore:', data);
      // Dispatch action to update your Redux store with the fetched data
      dispatch(setTableData(data)); // Make sure you have this action in your tableSlice
      
      setHasReachedBottom(true); // Prevent multiple fetches
    } catch (error) {
      console.error('Error fetching data from Firestore:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Scroll detection effect
  useEffect(() => {
    fetchFirestoreData();
  }, []);

  const columns: GridColDef[] = useMemo(() => [
    { 
      field: 'role', 
      headerName: 'Role', 
      sortable: true, 
      filterable: true,
      flex: 1,
      minWidth: 120
    },
    { 
      field: 'first_name', 
      headerName: 'First Name', 
      sortable: true, 
      filterable: true,
      flex: 1,
      minWidth: 120
    },
    { 
      field: 'last_name', 
      headerName: 'Last Name', 
      sortable: true, 
      filterable: true,
      flex: 1,
      minWidth: 120
    },
    { 
      field: 'city', 
      headerName: 'City', 
      valueGetter: (params) => params.row.location?.city || '',
      sortable: true, 
      filterable: true,
      flex: 1,
      minWidth: 120
    },
    { 
      field: 'state', 
      headerName: 'State', 
      valueGetter: (params) => params.row.location?.state || '',
      sortable: true, 
      filterable: true,
      flex: 1,
      minWidth: 120
    },
    { 
      field: 'monthly_sales', 
      headerName: 'Monthly Sales', 
      sortable: true, 
      filterable: true,
      flex: 1,
      minWidth: 120,
      valueFormatter: (params) => formatCurrency(params.value),
      align: 'right',
      headerAlign: 'right'
    },
    { 
      field: 'monthly_target', 
      headerName: 'Monthly Target', 
      sortable: true, 
      filterable: true,
      flex: 1,
      minWidth: 120,
      valueFormatter: (params) => formatCurrency(params.value),
      align: 'right',
      headerAlign: 'right'
    },
    { 
      field: 'yearly_sales', 
      headerName: 'Yearly Sales', 
      sortable: true, 
      filterable: true,
      flex: 1,
      minWidth: 120,
      valueFormatter: (params) => formatCurrency(params.value),
      align: 'right',
      headerAlign: 'right'
    },
    { 
      field: 'yearly_target', 
      headerName: 'Yearly Target', 
      sortable: true, 
      filterable: true,
      flex: 1,
      minWidth: 120,
      valueFormatter: (params) => formatCurrency(params.value),
      align: 'right',
      headerAlign: 'right'
    },
    { 
      field: 'commendations', 
      headerName: 'Commendations', 
      sortable: false, 
      filterable: false,
      flex: 1,
      minWidth: 180,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <CommendationsCell commendations={params.row.commendations || []} />
      )
    }
  ], []);

  const handleSortModelChange = useCallback((sortModel: GridSortModel) => {
    // Transform MUI sort model to match your store's expected format
    const transformedSortModel = sortModel.map(item => ({
      colId: item.field,
      sort: item.sort as "desc" | "asc"
    }));
    
    dispatch(setSortModel(transformedSortModel));
    console.log('Sort changed:', transformedSortModel);
  }, [dispatch]);

  const handleGlobalFilter = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setFilterText(e.target.value));
  }, [dispatch]);

  // Filter rows based on global search
  const filteredRows = useMemo(() => {
    if (!filterText) return filteredData;
    
    return filteredData.filter((row: any) =>
      Object.values(row).some((value: any) =>
        value?.toString().toLowerCase().includes(filterText.toLowerCase())
      )
    );
  }, [filteredData, filterText]);

  return (
    <div 
      className={`bg-white/10 backdrop-blur-md rounded-lg p-6 w-full ${className}`}
      style={{ opacity }}
    >
      {/* Global Filter Input */}
      <Box className="mb-4">
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search all columns..."
          value={filterText}
          onChange={handleGlobalFilter}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.3)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#9333ea',
                boxShadow: '0 0 0 2px rgba(147, 51, 234, 0.2)',
              },
            },
            '& .MuiInputBase-input': {
              color: 'white',
              padding: '12px',
            },
            '& .MuiInputBase-input::placeholder': {
              color: 'rgba(255, 255, 255, 0.7)',
              opacity: 1,
            },
          }}
        />
      </Box>

      {/* MUI DataGrid */}
      <Box 
        className="rounded-lg overflow-hidden"
        sx={{ 
          height: 500, 
          width: '100%',
          '& .MuiDataGrid-root': {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
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
          // Column header menu (context menu) styling
          '& .MuiDataGrid-menu': {
            opacity: 1,
          },
        }}
      >
        <DataGrid
          rows={filteredRows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 20 },
            },
          }}
          pageSizeOptions={[10, 20, 50, 100]}
          checkboxSelection
          disableRowSelectionOnClick
          onSortModelChange={handleSortModelChange}
          getRowId={(row) => row.id}
          sx={{ border: 0 }}
        />
      </Box>
    </div>
  );
};

export default DataTable;