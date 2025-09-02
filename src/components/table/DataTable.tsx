import { useMemo, useCallback, useEffect, useState } from 'react'
import { DataGrid, GridColDef, GridSortModel, GridFilterModel } from '@mui/x-data-grid';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { setSortModel, setTableData } from '../../store/tableSlice';
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

  const CommendationsCell = ({ commendations }: { commendations: string[] }) => {
    if (!Array.isArray(commendations) || commendations.length === 0) {
      return null;
    }

    return (
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'flex-start' }}>
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
      align: 'left',
      headerAlign: 'center',
      renderCell: (params) => (
        <CommendationsCell commendations={params.row.commendations || []} />
      )
    }
  ], []);

  const handleSortModelChange = useCallback((sortModel: GridSortModel) => {
    const transformedSortModel = sortModel.map(item => ({
      colId: item.field,
      sort: item.sort as "desc" | "asc"
    }));
    
    dispatch(setSortModel(transformedSortModel));
    console.log('Sort changed:', transformedSortModel);
  }, [dispatch]);

  const filteredRows = useMemo(() => {
    if (Object.keys(columnFilters).length === 0) return filteredData;
    
    return filteredData.filter((row: any) => {
      return Object.entries(columnFilters).every(([field, filterValue]) => {
        if (!filterValue) return true;
        
        let cellValue = '';
        
        if (field === 'city') {
          cellValue = row.location?.city || '';
        } else if (field === 'state') {
          cellValue = row.location?.state || '';
        } else if (field === 'commendations') {
          cellValue = Array.isArray(row.commendations) 
            ? row.commendations.join(' ') 
            : '';
        } else {
          cellValue = row[field] || '';
        }
        
        return cellValue.toString().toLowerCase().includes(filterValue.toLowerCase());
      });
    });
  }, [filteredData, columnFilters]);

  const renderColumnFilters = () => {
    const filterFields = [
      { field: 'role', placeholder: 'Filter role...', width: 120 },
      { field: 'first_name', placeholder: 'Filter name...', width: 120 },
      { field: 'last_name', placeholder: 'Filter name...', width: 120 },
      { field: 'city', placeholder: 'Filter city...', width: 120 },
      { field: 'state', placeholder: 'Filter state...', width: 120 },
      { field: 'monthly_sales', placeholder: 'Filter sales...', width: 120 },
      { field: 'monthly_target', placeholder: 'Filter target...', width: 120 },
      { field: 'yearly_sales', placeholder: 'Filter sales...', width: 120 },
      { field: 'yearly_target', placeholder: 'Filter target...', width: 120 },
      { field: 'commendations', placeholder: 'Filter awards...', width: 180 },
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
        paddingLeft: '52px',
      }}>
        {filterFields.map(({ field, placeholder, width }) => (
          <Box key={field} sx={{ 
            minWidth: width, 
            flex: 1, 
            padding: '8px 4px',
            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
            '&:last-child': {
              borderRight: 'none',
            }
          }}>
            <TextField
              size="small"
              placeholder={placeholder}
              value={columnFilters[field] || ''}
              onChange={(e) => {
                setColumnFilters(prev => ({
                  ...prev,
                  [field]: e.target.value
                }));
              }}
              sx={{
                width: '100%',
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '4px',
                  height: '32px',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.4)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#9333ea',
                  },
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
        ))}
      </Box>
    );
  };

  return (
    <div 
      className={`bg-white/10 backdrop-blur-md rounded-lg p-6 w-full ${className}`}
      style={{ opacity }}
    >
      <Box 
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
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 20 },
            },
          }}
          pageSizeOptions={[10, 20, 50]}
          checkboxSelection
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