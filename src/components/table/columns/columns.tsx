import * as DataTableUtils from '../utils';
import { GridColDef } from '@mui/x-data-grid';
import { Box, Tooltip } from '@mui/material';
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

  export const columns: GridColDef[] = [
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
        valueFormatter: (params) => DataTableUtils.formatCurrency(params.value),
        align: 'right',
        headerAlign: 'right',
        cellClassName: (params) => {
          const backgroundColor = DataTableUtils.getSalesPerformanceColor(params.row.monthly_sales, params.row.monthly_target);
          return backgroundColor !== 'transparent' ? 'sales-performance-cell' : '';
        },
        renderCell: (params) => {
          const backgroundColor = DataTableUtils.getSalesPerformanceColor(params.row.monthly_sales, params.row.monthly_target);
          return (
            <Box
              sx={{
                backgroundColor,
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingRight: '16px',
              }}
            >
              {DataTableUtils.formatCurrency(params.value)}
            </Box>
          );
        }
      },
      { 
        field: 'monthly_target', 
        headerName: 'Monthly Target', 
        sortable: true, 
        filterable: true,
        flex: 1,
        minWidth: 120,
        valueFormatter: (params) => DataTableUtils.formatCurrency(params.value),
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
        valueFormatter: (params) => DataTableUtils.formatCurrency(params.value),
        align: 'right',
        headerAlign: 'right',
        cellClassName: (params) => {
          const backgroundColor = DataTableUtils.getSalesPerformanceColor(params.row.yearly_sales, params.row.sales.yearly_target);
          return backgroundColor !== 'transparent' ? 'sales-performance-cell' : '';
        },
        renderCell: (params) => {
          const backgroundColor = DataTableUtils.getSalesPerformanceColor(params.row.yearly_sales, params.row.sales.yearly_target);
          return (
            <Box
              sx={{
                backgroundColor,
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingRight: '16px',
              }}
            >
              {DataTableUtils.formatCurrency(params.value)}
            </Box>
          );
        }
      },
      { 
        field: 'yearly_target',
        headerName: 'Yearly Target',
        sortable: true,
        filterable: true,
        flex: 1,
        minWidth: 120,
        type: 'number',
        valueGetter: (params) => params.row.sales?.yearly_target || 0,
        valueFormatter: (params) => {
          if (params.value != null) {
            return DataTableUtils.formatCurrency(params.value);
          }
          return DataTableUtils.formatCurrency(0);
        },
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
    ];