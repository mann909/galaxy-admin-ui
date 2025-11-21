import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
} from '@mui/material';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingCart, 
  Package, 
  BarChart3,
  Settings,
  Image,
  FolderTree,
  Gift
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
  open: boolean;
  onClose?: () => void;
}

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
  { text: 'Users', icon: <Users size={20} />, path: '/users' },
  { text: 'Products', icon: <Package size={20} />, path: '/products' },
  { text: 'Categories', icon: <FolderTree size={20} />, path: '/categories' },
  { text: 'Banners', icon: <Image size={20} />, path: '/banners' },
  { text: 'Orders', icon: <ShoppingCart size={20} />, path: '/orders' },
  { text: 'Offers', icon: <Gift size={20} />, path: '/offers' },
];

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleItemClick = (path: string) => {
    navigate(path);
    if (onClose) onClose();
  };

  return (
    <Drawer
      variant="persistent"
      open={open}
      sx={{
        width: open ? drawerWidth : 0,
        flexShrink: 0,
        transition: 'width 0.3s ease-in-out',
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          top: '64px',
          height: 'calc(100vh - 64px)',
          position: 'fixed',
          borderRight: '1px solid #e2e8f0',
          boxShadow: '2px 0 4px rgba(0,0,0,0.1)',
        },
      }}
    >
      <Box sx={{ overflow: 'auto' }}>
        <List sx={{display: 'flex', p:1, flexDirection: 'column', gap: 2, height: '100%'}}>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => handleItemClick(item.path)}
                selected={location.pathname === item.path}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.12)',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
      </Box>
    </Drawer>
  );
};

export default Sidebar;