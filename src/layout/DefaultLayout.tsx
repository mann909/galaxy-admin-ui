import React, { useState } from 'react';
import { Box, CssBaseline } from '@mui/material';
import Header from '../components/header/Header';
import Sidebar from '../components/sidebar/Sidebar';

interface DefaultLayoutProps {
  children: React.ReactNode;
}

const DefaultLayout: React.FC<DefaultLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    return saved ? JSON.parse(saved) : true;
  });

  const handleSidebarToggle = () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    localStorage.setItem('sidebarOpen', JSON.stringify(newState));
  };

  const drawerWidth = 240;

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Header onMenuClick={handleSidebarToggle} />
      <Sidebar open={sidebarOpen} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          pt: 11,
          // ml: sidebarOpen ? `${drawerWidth}px` : 0,
          minHeight: '100vh',
          backgroundColor: '#f5f5f5',
          transition: 'margin-left 0.3s ease-in-out',
          width: sidebarOpen ? `calc(100% - ${drawerWidth}px)` : '100%',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default DefaultLayout;