import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  Button, 
  IconButton, 
  Chip, 
  Divider, 
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon,
  BarChart as BarChartIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useHabits } from '../contexts/HabitContext';
import HabitIcon from './HabitIcon';
import HabitCalendar from './HabitCalendar';
import HabitStats from './HabitStats';

function HabitDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { habits, loading, deleteHabit, toggleHabitCompletion, isHabitCompletedForDate } = useHabits();
  
  const [habit, setHabit] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [notFound, setNotFound] = useState(false);
  
  // Find the habit by ID
  useEffect(() => {
    if (!loading) {
      const foundHabit = habits.find(h => h.id === id);
      if (foundHabit) {
        setHabit(foundHabit);
      } else {
        setNotFound(true);
      }
    }
  }, [id, habits, loading]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle habit deletion
  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    deleteHabit(id);
    setDeleteDialogOpen(false);
    navigate('/');
  };
  
  // Handle habit completion toggle
  const handleToggleCompletion = () => {
    toggleHabitCompletion(id);
  };
  
  // Format frequency text
  const formatFrequency = (frequency) => {
    if (!frequency) return 'Daily';
    
    switch (frequency.type) {
      case 'daily':
        return 'Every day';
      case 'weekly':
        if (frequency.days && frequency.days.length) {
          const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const days = frequency.days.map(day => dayNames[day]).join(', ');
          return `Weekly: ${days}`;
        }
        return 'Weekly';
      case 'custom':
        if (frequency.timesPerWeek) {
          return `${frequency.timesPerWeek} times per week`;
        }
        if (frequency.timesPerMonth) {
          return `${frequency.timesPerMonth} times per month`;
        }
        return 'Custom schedule';
      default:
        return 'Daily';
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (notFound) {
    return (
      <Container>
        <Box sx={{ my: 4 }}>
          <Alert severity="error">
            Habit not found. It may have been deleted.
          </Alert>
          <Button 
            component={RouterLink} 
            to="/"
            startIcon={<ArrowBackIcon />}
            sx={{ mt: 2 }}
          >
            Back to Dashboard
          </Button>
        </Box>
      </Container>
    );
  }
  
  if (!habit) return null;
  
  const isCompleted = isHabitCompletedForDate(habit.id, new Date());
  
  return (
    <Container>
      <Box sx={{ my: 3 }}>
        <Button 
          component={RouterLink} 
          to="/"
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 2 }}
        >
          Back to Dashboard
        </Button>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <HabitIcon 
              icon={habit.icon} 
              color={habit.color} 
              completed={isCompleted}
              size="large"
              sx={{ mr: 2 }}
            />
            <Box>
              <Typography variant="h4" component="h1">
                {habit.name}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {habit.category}
              </Typography>
            </Box>
          </Box>
          
          <Box>
            <IconButton 
              color="primary"
              onClick={() => navigate(`/habits/${id}/edit`)}
              aria-label="edit habit"
            >
              <EditIcon />
            </IconButton>
            <IconButton 
              color="error"
              onClick={handleDeleteClick}
              aria-label="delete habit"
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
        
        <Paper sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Typography variant="body1" paragraph>
                {habit.description || 'No description provided.'}
              </Typography>
              
              <Typography variant="subtitle2" gutterBottom>
                Frequency
              </Typography>
              <Typography variant="body2" paragraph>
                {formatFrequency(habit.frequency)}
              </Typography>
              
              <Typography variant="subtitle2" gutterBottom>
                Created
              </Typography>
              <Typography variant="body2" paragraph>
                {format(new Date(habit.createdAt), 'PPP')}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ mb: 2 }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom>
                    Current Streak
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h4">
                      {habit.streak || 0}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    days
                  </Typography>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom>
                    Best Streak
                  </Typography>
                  <Typography variant="h4">
                    {habit.bestStreak || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    days
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button
              variant="contained"
              color={isCompleted ? 'secondary' : 'primary'}
              startIcon={<CheckCircleIcon />}
              onClick={handleToggleCompletion}
              size="large"
            >
              {isCompleted ? 'Mark as Incomplete' : 'Mark as Complete'}
            </Button>
          </Box>
        </Paper>
        
        <Box sx={{ mb: 4 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            centered
            sx={{ mb: 2 }}
          >
            <Tab icon={<CalendarIcon />} label="Calendar" />
            <Tab icon={<BarChartIcon />} label="Statistics" />
          </Tabs>
          
          <Box hidden={tabValue !== 0}>
            {tabValue === 0 && <HabitCalendar habitId={id} />}
          </Box>
          
          <Box hidden={tabValue !== 1}>
            {tabValue === 1 && <HabitStats habitId={id} />}
          </Box>
        </Box>
      </Box>
      
      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Habit?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{habit.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default HabitDetail; 