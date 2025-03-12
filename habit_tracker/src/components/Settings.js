import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Switch, 
  FormGroup, 
  FormControlLabel, 
  Button, 
  Divider, 
  Alert, 
  Snackbar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import {
  DarkMode as DarkModeIcon,
  Notifications as NotificationsIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Backup as BackupIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';
import { useHabits } from '../contexts/HabitContext';
import { useNotifications } from '../contexts/NotificationContext';
import { downloadFile } from '../utils/helpers';

function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { habits, exportHabits } = useHabits();
  const { notificationsEnabled, toggleNotifications, requestPermission, notificationPermission } = useNotifications();
  
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  
  // Handle theme toggle
  const handleThemeToggle = () => {
    toggleTheme();
    showSnackbar(`${theme === 'light' ? 'Dark' : 'Light'} mode enabled`, 'success');
  };
  
  // Handle notifications toggle
  const handleNotificationsToggle = async () => {
    const result = await toggleNotifications();
    if (result) {
      showSnackbar(`Notifications ${notificationsEnabled ? 'disabled' : 'enabled'}`, 'success');
    } else {
      showSnackbar('Permission denied for notifications', 'error');
    }
  };
  
  // Export data
  const handleExportData = (format) => {
    if (habits.length === 0) {
      showSnackbar('No habits to export', 'warning');
      return;
    }
    
    const data = exportHabits(format);
    const filename = `habit-tracker-export-${new Date().toISOString().split('T')[0]}.${format}`;
    const mimeType = format === 'json' ? 'application/json' : 'text/csv';
    
    downloadFile(data, filename, mimeType);
    showSnackbar(`Data exported as ${format.toUpperCase()}`, 'success');
  };
  
  // Reset all data
  const handleResetData = () => {
    setResetDialogOpen(true);
  };
  
  const confirmResetData = () => {
    localStorage.clear();
    setResetDialogOpen(false);
    showSnackbar('All data has been reset. Refresh the page to see changes.', 'info');
  };
  
  // Show snackbar message
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom sx={{ my: 3 }}>
        Settings
      </Typography>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Appearance
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon>
              <DarkModeIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Dark Mode" 
              secondary="Switch between light and dark theme"
            />
            <ListItemSecondaryAction>
              <Switch 
                edge="end"
                checked={theme === 'dark'}
                onChange={handleThemeToggle}
              />
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </Paper>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Notifications
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon>
              <NotificationsIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Enable Notifications" 
              secondary={
                notificationPermission === 'denied' 
                  ? "Notifications are blocked in your browser settings" 
                  : "Receive reminders for your habits"
              }
            />
            <ListItemSecondaryAction>
              <Switch 
                edge="end"
                checked={notificationsEnabled}
                onChange={handleNotificationsToggle}
                disabled={notificationPermission === 'denied'}
              />
            </ListItemSecondaryAction>
          </ListItem>
        </List>
        
        {notificationPermission === 'denied' && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            You've blocked notifications in your browser. Please update your browser settings to enable notifications.
          </Alert>
        )}
      </Paper>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Data Management
        </Typography>
        <List>
          <ListItem button onClick={() => handleExportData('json')}>
            <ListItemIcon>
              <DownloadIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Export as JSON" 
              secondary="Export your habit data in JSON format"
            />
          </ListItem>
          
          <ListItem button onClick={() => handleExportData('csv')}>
            <ListItemIcon>
              <DownloadIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Export as CSV" 
              secondary="Export your habit data in CSV format for spreadsheets"
            />
          </ListItem>
          
          <Divider sx={{ my: 1 }} />
          
          <ListItem button onClick={handleResetData}>
            <ListItemIcon>
              <DeleteIcon color="error" />
            </ListItemIcon>
            <ListItemText 
              primary="Reset All Data" 
              secondary="Delete all habits and settings (cannot be undone)"
              primaryTypographyProps={{ color: 'error' }}
            />
          </ListItem>
        </List>
      </Paper>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          About
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon>
              <InfoIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Habit Tracker" 
              secondary="Version 1.0.0"
            />
          </ListItem>
        </List>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, px: 2 }}>
          A modern web application for tracking and building positive habits. 
          This app helps you create, track, and maintain habits with features like 
          customizable reminders, progress tracking, and visual statistics.
        </Typography>
      </Paper>
      
      {/* Reset confirmation dialog */}
      <Dialog
        open={resetDialogOpen}
        onClose={() => setResetDialogOpen(false)}
      >
        <DialogTitle>Reset All Data?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will permanently delete all your habits and settings. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmResetData} color="error" variant="contained">
            Reset All Data
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Settings; 