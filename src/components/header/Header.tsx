import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';
import { Menu, LogOut } from 'lucide-react';
import { useLogoutApi } from '../../api/api-hooks/useAuthApi';
import { useDispatch } from 'react-redux';
import { resetAuthState } from '../../store/userSlice';
import toast from 'react-hot-toast';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const dispatch = useDispatch();
  const logoutMutation = useLogoutApi();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      dispatch(resetAuthState());
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: '#1976d2'
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={onMenuClick}
          edge="start"
          sx={{ mr: 2 }}
        >
          <Menu size={24} />
        </IconButton>
        
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Galaxy Admin
        </Typography>
        
        <Box>
          <IconButton
            color="inherit"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            <LogOut size={20} />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;