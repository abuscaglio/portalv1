import React, { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, Tabs, Tab } from '@mui/material';
import { useFirestoreData } from './hooks/useFirestoreData';
import { store } from './store';
import PieChart from './components/charts/PieChart';
import BarChart from './components/charts/BarChart';
import LineChart from './components/charts/LineChart';
import DataTable from './components/table/DataTable';
import ScrollPill from './components/ui/ScrollPill';
import MainLogo from './components/ui/MainLogo';
import SalesInsightsDashboard from './components/SalesInsights/SalesInsightsDashboard';
import './App.css';


// Create MUI dark theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#8B5CF6',
    },
    secondary: {
      main: '#A78BFA',
    },
    background: {
      default: '#1B015E',
      paper: 'rgba(255, 255, 255, 0.1)',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        },
        indicator: {
          backgroundColor: '#8B5CF6',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: 'rgba(255, 255, 255, 0.7)',
          '&.Mui-selected': {
            color: '#8B5CF6',
          },
          '&:hover': {
            color: 'rgba(255, 255, 255, 0.9)',
          },
        },
      },
    },
  },
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const AppContent: React.FC = () => {
  const [scrollY, setScrollY] = useState<number>(0);
  const [tabValue, setTabValue] = useState<number>(0);
  const { isLoading, error, refetch } = useFirestoreData();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Calculate opacities and positions
  const maxScroll = window.innerHeight * 0.8; // 4/5 of viewport height
  const pillOpacity = Math.max(0, 1 - (scrollY / 100)); // Fade out after ~2 scroll ticks
  const contentOpacity = Math.min(1, scrollY / maxScroll); // Fade in as user scrolls from 0 to 1

  const backgroundStyle: React.CSSProperties = {
    background: scrollY > window.innerHeight * 0.8 
      ? '#1B015E' 
      : `linear-gradient(to bottom, #11013B ${80 - (scrollY / window.innerHeight) * 20}%, #1B015E 100%)`
  };

  return (
    <Box className="parallax-container">
      {/* First Page */}
      <Box 
        className="first-page"
        sx={backgroundStyle}
      >
        <MainLogo/>
        
        {/* Scroll Down Pill */}
        <ScrollPill opacity={pillOpacity} />
      </Box>

      {/* Second Page */}
      <Box 
        className="second-page"
        sx={{ 
          backgroundColor: '#1B015E',
          minHeight: '100vh',
          position: 'relative'
        }}
      >
        {/* Tabbed Content Container */}
        <Box 
          sx={{ 
            opacity: contentOpacity,
            width: '100%',
            px: { xs: 2, md: 4 },
            pt: 2
          }}
        >
          {/* Tab Navigation */}
          <Box 
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider', 
              mb: 2
            }}
          >
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="dashboard tabs"
              centered
            >
              <Tab label="Data Analytics" id="tab-0" aria-controls="tabpanel-0" />
              <Tab label="Intelligence Hub" id="tab-1" aria-controls="tabpanel-1" />
            </Tabs>
          </Box>

          {/* Data Analytics Tab */}
          <TabPanel value={tabValue} index={0}>
            {/* Charts Section */}
            <Box className="charts-container">
              <PieChart />
              <BarChart />
              <LineChart />
            </Box>

            {/* Data Table Section */}
            <DataTable 
              opacity={1} 
              fetchError={error} 
              isLoading={isLoading} 
              refetch={refetch} 
            />
          </TabPanel>

          {/* Intelligence Hub Tab */}
          <TabPanel value={tabValue} index={1}>
            <Box 
              sx={{ 
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '400px',
                flexDirection: 'column',
                gap: 2
              }}
            >
              <SalesInsightsDashboard/>
            </Box>
          </TabPanel>
        </Box>
      </Box>
    </Box>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <AppContent />
      </ThemeProvider>
    </Provider>
  );
};

export default App;