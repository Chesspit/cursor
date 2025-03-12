import React, { useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Button,
  Menu,
  MenuItem,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme as useMuiTheme
} from '@mui/material';
import {
  Menu as MenuIcon,
  Add as AddIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  AccountCircle,
  MoreVert as MoreIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';
import { useNotifications } from '../contexts/NotificationContext';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { notificationsEnabled, toggleNotifications } = useNotifications();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [moreMenuAnchor, setMoreMenuAnchor] = useState(null);
  
  const isMenuOpen = Boolean(moreMenuAnchor);
  
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  const handleMoreMenuOpen = (event) => {
    setMoreMenuAnchor(event.currentTarget);
  };
  
  const handleMoreMenuClose = () => {
    setMoreMenuAnchor(null);
  };
  
  const handleThemeToggle = () => {
    toggleTheme();
    handleMoreMenuClose();
  };
  
  const handleNotificationsToggle = async () => {
    await toggleNotifications();
    handleMoreMenuClose();
  };
  
  const handleNavigation = (path) => {
    navigate(path);
    setDrawerOpen(false);
    handleMoreMenuClose();
  };
  
  const drawer = (
    <Box sx={{ width: 250 }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" component="div">
          Habit Tracker
        </Typography>
      </Box>
      <Divider />
      <List>
        <ListItem 
          button 
          selected={location.pathname === '/'} 
          onClick={() => handleNavigation('/')}
        >
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem 
          button 
          onClick={() => handleNavigation('/habits/new')}
        >
          <ListItemIcon>
            <AddIcon />
          </ListItemIcon>
          <ListItemText primary="Add New Habit" />
        </ListItem>
        <ListItem 
          button 
          selected={location.pathname === '/settings'} 
          onClick={() => handleNavigation('/settings')}
        >
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem button onClick={handleThemeToggle}>
          <ListItemIcon>
            {theme === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </ListItemIcon>
          <ListItemText primary={theme === 'dark' ? 'Light Mode' : 'Dark Mode'} />
        </ListItem>
        <ListItem button onClick={handleNotificationsToggle}>
          <ListItemIcon>
            <NotificationsIcon color={notificationsEnabled ? 'primary' : 'disabled'} />
          </ListItemIcon>
          <ListItemText primary={notificationsEnabled ? 'Disable Notifications' : 'Enable Notifications'} />
        </ListItem>
      </List>
    </Box>
  );
  
  const moreMenu = (
    <Menu
      anchorEl={moreMenuAnchor}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMenuOpen}
      onClose={handleMoreMenuClose}
    >
      <MenuItem onClick={handleThemeToggle}>
        {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
      </MenuItem>
      <MenuItem onClick={handleNotificationsToggle}>
        {notificationsEnabled ? 'Disable Notifications' : 'Enable Notifications'}
      </MenuItem>
      <MenuItem onClick={() => handleNavigation('/settings')}>Settings</MenuItem>
    </Menu>
  );
  
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography 
            variant="h6" 
            component={RouterLink} 
            to="/"
            sx={{ 
              flexGrow: 1, 
              textDecoration: 'none', 
              color: 'inherit', 
              display: 'flex', 
              alignItems: 'center' 
            }}
          >
            Habit Tracker
          </Typography>
          
          {!isMobile && (
            <>
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/"
                startIcon={<DashboardIcon />}
              >
                Dashboard
              </Button>
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/habits/new"
                startIcon={<AddIcon />}
              >
                Add Habit
              </Button>
              <IconButton color="inherit" onClick={handleThemeToggle}>
                {theme === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
              <IconButton color="inherit" onClick={handleNotificationsToggle}>
                <NotificationsIcon color={notificationsEnabled ? 'inherit' : 'disabled'} />
              </IconButton>
            </>
          )}
          
          <IconButton
            edge="end"
            color="inherit"
            aria-label="more"
            onClick={handleMoreMenuOpen}
          >
            {isMobile ? <MoreIcon /> : <AccountCircle />}
          </IconButton>
        </Toolbar>
      </AppBar>
      
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true // Better performance on mobile
        }}
      >
        {drawer}
      </Drawer>
      
      {moreMenu}
    </>
  );
}

export default Header; 