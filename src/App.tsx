import React, { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { store } from './store';
import PieChart from './components/charts/PieChart';
import BarChart from './components/charts/BarChart';
import LineChart from './components/charts/LineChart';
import DataTable from './components/table/DataTable';
import ScrollPill from './components/ui/ScrollPill';
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
  },
});

const AppContent: React.FC = () => {
  const [scrollY, setScrollY] = useState<number>(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate opacities and positions
  const maxScroll = window.innerHeight * 0.75; // 3/4 of viewport height
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
        {/* Empty content as requested */}
        
        {/* Scroll Down Pill */}
        <ScrollPill opacity={pillOpacity} />
      </Box>

      {/* Second Page (3/4 of viewport) */}
      <Box 
        className="second-page"
        sx={{ backgroundColor: '#1B015E' }}
      >
        {/* Charts Section */}
        <Box 
          className="charts-container"
          sx={{ opacity: contentOpacity }}
        >
          <PieChart />
          <BarChart />
          <LineChart />
        </Box>

        {/* Data Table Section */}
        <DataTable opacity={contentOpacity} />

        {/* Footer Space */}
        <Box sx={{ height: 8 }} />
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