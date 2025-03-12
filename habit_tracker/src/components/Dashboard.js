import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  Button, 
  Grid, 
  Chip, 
  Avatar, 
  IconButton,
  CircularProgress,
  Fab,
  Tooltip,
  Card,
  CardContent,
  CardActions,
  Divider,
  Tab,
  Tabs,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Check as CheckIcon,
  CheckCircle as CheckCircleIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { format, isToday } from 'date-fns';
import { useHabits } from '../contexts/HabitContext';
import { HABIT_CATEGORIES } from '../utils/constants';
import HabitIcon from './HabitIcon';

function Dashboard() {
  const navigate = useNavigate();
  const { habits, loading, toggleHabitCompletion, isHabitCompletedForDate } = useHabits();
  
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOption, setSortOption] = useState('name');
  const [viewType, setViewType] = useState('list'); // 'list' or 'grid'
  const [filteredHabits, setFilteredHabits] = useState([]);
  
  // Apply filters and sorting
  useEffect(() => {
    if (!habits) return;
    
    let result = [...habits];
    
    // Apply category filter
    if (selectedCategory !== 'All') {
      result = result.filter(habit => habit.category === selectedCategory);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      switch (sortOption) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'streak':
          return (b.streak || 0) - (a.streak || 0);
        case 'completion':
          // Sort by today's completion status
          const aCompleted = isHabitCompletedForDate(a.id, new Date());
          const bCompleted = isHabitCompletedForDate(b.id, new Date());
          return bCompleted - aCompleted;
        case 'created':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });
    
    setFilteredHabits(result);
  }, [habits, selectedCategory, sortOption, isHabitCompletedForDate]);
  
  // Calculate today's progress
  const todayProgress = habits.length > 0
    ? Math.round((habits.filter(habit => isHabitCompletedForDate(habit.id, new Date())).length / habits.length) * 100)
    : 0;
  
  // Handler for toggling habit completion
  const handleToggleCompletion = (habitId, event) => {
    event.preventDefault();
    event.stopPropagation();
    toggleHabitCompletion(habitId);
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Render habit items
  const renderHabitItem = (habit) => {
    const isCompleted = isHabitCompletedForDate(habit.id, new Date());
    
    return (
      <Card 
        key={habit.id}
        sx={{ 
          mb: 2, 
          borderLeft: 5, 
          borderColor: habit.color || 'primary.main',
          opacity: isCompleted ? 0.8 : 1,
          transition: 'all 0.2s',
          '&:hover': {
            boxShadow: 6,
            transform: 'translateY(-2px)'
          }
        }}
      >
        <CardContent sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" component="h2">
              {habit.name}
            </Typography>
            <HabitIcon 
              icon={habit.icon} 
              color={habit.color} 
              completed={isCompleted}
            />
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {habit.description}
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Chip 
              label={habit.category} 
              size="small" 
              sx={{ mr: 1 }}
            />
            {habit.streak > 0 && (
              <Tooltip title="Current streak">
                <Chip
                  icon={<TrendingUpIcon />}
                  label={`${habit.streak} day${habit.streak !== 1 ? 's' : ''}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Tooltip>
            )}
          </Box>
        </CardContent>
        
        <CardActions sx={{ justifyContent: 'space-between' }}>
          <Button 
            size="small" 
            onClick={(e) => navigate(`/habits/${habit.id}`)}
          >
            Details
          </Button>
          <Box>
            <IconButton 
              size="small"
              onClick={(e) => navigate(`/habits/${habit.id}/edit`)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton 
              color={isCompleted ? 'primary' : 'default'}
              onClick={(e) => handleToggleCompletion(habit.id, e)}
            >
              <CheckCircleIcon />
            </IconButton>
          </Box>
        </CardActions>
      </Card>
    );
  };
  
  const renderHabitGrid = (habit) => {
    const isCompleted = isHabitCompletedForDate(habit.id, new Date());
    
    return (
      <Grid item xs={12} sm={6} md={4} lg={3} key={habit.id}>
        <Card 
          sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            borderTop: 5,
            borderColor: habit.color || 'primary.main',
            opacity: isCompleted ? 0.8 : 1,
            transition: 'all 0.2s',
            '&:hover': {
              boxShadow: 6,
              transform: 'translateY(-2px)'
            }
          }}
          onClick={() => navigate(`/habits/${habit.id}`)}
        >
          <CardContent sx={{ flexGrow: 1, pb: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6" component="h2" noWrap>
                {habit.name}
              </Typography>
              <HabitIcon 
                icon={habit.icon} 
                color={habit.color} 
                completed={isCompleted}
              />
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, height: '2.5em', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {habit.description}
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
              <Chip 
                label={habit.category} 
                size="small" 
                sx={{ mr: 1 }}
              />
              {habit.streak > 0 && (
                <Tooltip title="Current streak">
                  <Chip
                    icon={<TrendingUpIcon />}
                    label={habit.streak}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Tooltip>
              )}
            </Box>
          </CardContent>
          
          <CardActions sx={{ justifyContent: 'flex-end', mt: 'auto' }}>
            <IconButton 
              color={isCompleted ? 'primary' : 'default'}
              onClick={(e) => handleToggleCompletion(habit.id, e)}
            >
              <CheckCircleIcon />
            </IconButton>
          </CardActions>
        </Card>
      </Grid>
    );
  };
  
  return (
    <Container>
      <Box sx={{ mb: 4, mt: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Habits
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </Typography>
        
        <Box sx={{ mt: 2, mb: 3 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Today's Progress</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ position: 'relative', display: 'inline-flex', mr: 2 }}>
                <CircularProgress 
                  variant="determinate" 
                  value={todayProgress} 
                  size={60} 
                  thickness={5}
                  color="primary"
                />
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="caption" component="div" color="text.secondary">
                    {`${todayProgress}%`}
                  </Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="body1">
                  {habits.filter(h => isHabitCompletedForDate(h.id, new Date())).length} of {habits.length} habits completed today
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="category-filter-label">Category</InputLabel>
              <Select
                labelId="category-filter-label"
                value={selectedCategory}
                label="Category"
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <MenuItem value="All">All Categories</MenuItem>
                {HABIT_CATEGORIES.map(category => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="sort-option-label">Sort By</InputLabel>
              <Select
                labelId="sort-option-label"
                value={sortOption}
                label="Sort By"
                onChange={(e) => setSortOption(e.target.value)}
              >
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="category">Category</MenuItem>
                <MenuItem value="streak">Streak</MenuItem>
                <MenuItem value="completion">Completion</MenuItem>
                <MenuItem value="created">Recently Added</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <Tabs 
            value={viewType} 
            onChange={(e, newValue) => setViewType(newValue)}
            aria-label="view type tabs"
          >
            <Tab label="List" value="list" />
            <Tab label="Grid" value="grid" />
          </Tabs>
        </Box>
      </Box>
      
      {habits.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" gutterBottom>
            You haven't created any habits yet
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Start building better habits by adding your first one
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            component={RouterLink}
            to="/habits/new"
          >
            Add Your First Habit
          </Button>
        </Box>
      ) : (
        <>
          {viewType === 'list' ? (
            filteredHabits.map(renderHabitItem)
          ) : (
            <Grid container spacing={2}>
              {filteredHabits.map(renderHabitGrid)}
            </Grid>
          )}
          
          {filteredHabits.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1">
                No habits match your current filters
              </Typography>
            </Box>
          )}
        </>
      )}
      
      <Tooltip title="Add New Habit">
        <Fab 
          color="primary" 
          aria-label="add"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          component={RouterLink}
          to="/habits/new"
        >
          <AddIcon />
        </Fab>
      </Tooltip>
    </Container>
  );
}

export default Dashboard; 