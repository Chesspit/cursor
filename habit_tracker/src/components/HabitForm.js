import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText,
  Grid,
  IconButton,
  Divider,
  Snackbar,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  FormLabel,
  FormGroup,
  Checkbox,
  FormControlLabel,
  Stack
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useHabits } from '../contexts/HabitContext';
import { HABIT_CATEGORIES, HABIT_ICONS, HABIT_COLORS } from '../utils/constants';
import HabitIcon from './HabitIcon';

function HabitForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { habits, addHabit, updateHabit, loading } = useHabits();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Health',
    icon: 'fitness_center',
    color: '#6200ee',
    frequency: {
      type: 'daily'
    },
    reminders: []
  });
  
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Load habit data if in edit mode
  useEffect(() => {
    if (id && habits.length > 0) {
      const habitToEdit = habits.find(h => h.id === id);
      if (habitToEdit) {
        setFormData({
          name: habitToEdit.name,
          description: habitToEdit.description || '',
          category: habitToEdit.category,
          icon: habitToEdit.icon,
          color: habitToEdit.color,
          frequency: habitToEdit.frequency || { type: 'daily' },
          reminders: habitToEdit.reminders || []
        });
        setIsEditMode(true);
      } else {
        // Habit not found, redirect to create new
        navigate('/habits/new');
      }
    }
  }, [id, habits, navigate]);
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Handle frequency type change
  const handleFrequencyTypeChange = (e, newValue) => {
    if (newValue) {
      let newFrequency = { type: newValue };
      
      // Initialize appropriate fields based on frequency type
      if (newValue === 'weekly') {
        newFrequency.days = [1, 3, 5]; // Mon, Wed, Fri by default
      } else if (newValue === 'custom') {
        newFrequency.timesPerWeek = 3;
      }
      
      setFormData(prev => ({
        ...prev,
        frequency: newFrequency
      }));
    }
  };
  
  // Handle weekly frequency day selection
  const handleDayToggle = (day) => {
    const currentDays = formData.frequency.days || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day].sort();
    
    setFormData(prev => ({
      ...prev,
      frequency: {
        ...prev.frequency,
        days: newDays
      }
    }));
  };
  
  // Handle custom frequency inputs
  const handleCustomFrequencyChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      frequency: {
        ...prev.frequency,
        [name]: parseInt(value, 10)
      }
    }));
  };
  
  // Add a new reminder
  const handleAddReminder = () => {
    const newReminder = {
      id: Date.now().toString(),
      time: '08:00',
      days: [1, 2, 3, 4, 5] // Mon-Fri by default
    };
    
    setFormData(prev => ({
      ...prev,
      reminders: [...prev.reminders, newReminder]
    }));
  };
  
  // Update reminder
  const handleReminderChange = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      reminders: prev.reminders.map(reminder => 
        reminder.id === id 
          ? { ...reminder, [field]: value } 
          : reminder
      )
    }));
  };
  
  // Remove reminder
  const handleRemoveReminder = (id) => {
    setFormData(prev => ({
      ...prev,
      reminders: prev.reminders.filter(reminder => reminder.id !== id)
    }));
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (formData.frequency.type === 'weekly' && 
        (!formData.frequency.days || formData.frequency.days.length === 0)) {
      newErrors.days = 'Select at least one day';
    }
    
    if (formData.frequency.type === 'custom') {
      if (!formData.frequency.timesPerWeek || formData.frequency.timesPerWeek < 1) {
        newErrors.timesPerWeek = 'Enter a valid number';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      if (isEditMode) {
        updateHabit(id, formData);
        setSnackbar({ 
          open: true, 
          message: 'Habit updated successfully', 
          severity: 'success' 
        });
      } else {
        const newId = addHabit(formData);
        setSnackbar({ 
          open: true, 
          message: 'Habit created successfully', 
          severity: 'success' 
        });
        // Reset form after successful creation
        setFormData({
          name: '',
          description: '',
          category: 'Health',
          icon: 'fitness_center',
          color: '#6200ee',
          frequency: {
            type: 'daily'
          },
          reminders: []
        });
        
        // Navigate to the new habit after a short delay
        setTimeout(() => {
          navigate(`/habits/${newId}`);
        }, 1500);
      }
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: `Error: ${error.message}`, 
        severity: 'error' 
      });
    }
  };
  
  // Render frequency options based on selected type
  const renderFrequencyOptions = () => {
    const { frequency } = formData;
    
    switch (frequency.type) {
      case 'daily':
        return (
          <Typography variant="body2" color="text.secondary">
            This habit will be tracked every day
          </Typography>
        );
        
      case 'weekly':
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return (
          <Box sx={{ mt: 2 }}>
            <FormLabel component="legend">Select days:</FormLabel>
            <FormHelperText error={!!errors.days}>{errors.days}</FormHelperText>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {days.map((day, index) => (
                <ToggleButton
                  key={day}
                  value={day}
                  selected={frequency.days?.includes(index)}
                  onChange={() => handleDayToggle(index)}
                  size="small"
                >
                  {day}
                </ToggleButton>
              ))}
            </Box>
          </Box>
        );
        
      case 'custom':
        return (
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Times per week"
              name="timesPerWeek"
              type="number"
              value={frequency.timesPerWeek || ''}
              onChange={handleCustomFrequencyChange}
              inputProps={{ min: 1, max: 7 }}
              error={!!errors.timesPerWeek}
              helperText={errors.timesPerWeek}
              fullWidth
              margin="normal"
            />
          </Box>
        );
        
      default:
        return null;
    }
  };
  
  // Render reminders section
  const renderReminders = () => {
    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Reminders
        </Typography>
        
        {formData.reminders.map((reminder, index) => (
          <Paper key={reminder.id} sx={{ p: 2, mb: 2, position: 'relative' }}>
            <IconButton
              size="small"
              onClick={() => handleRemoveReminder(reminder.id)}
              sx={{ position: 'absolute', top: 8, right: 8 }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Time"
                  type="time"
                  value={reminder.time}
                  onChange={(e) => handleReminderChange(reminder.id, 'time', e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormLabel component="legend">Days:</FormLabel>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                    <ToggleButton
                      key={day}
                      value={day}
                      selected={reminder.days?.includes(idx)}
                      onChange={() => {
                        const currentDays = reminder.days || [];
                        const newDays = currentDays.includes(idx)
                          ? currentDays.filter(d => d !== idx)
                          : [...currentDays, idx].sort();
                        handleReminderChange(reminder.id, 'days', newDays);
                      }}
                      size="small"
                    >
                      {day}
                    </ToggleButton>
                  ))}
                </Box>
              </Grid>
            </Grid>
          </Paper>
        ))}
        
        <Button
          startIcon={<AddIcon />}
          onClick={handleAddReminder}
          variant="outlined"
          sx={{ mt: 1 }}
        >
          Add Reminder
        </Button>
      </Box>
    );
  };
  
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 3 }}>
        <Button 
          component={RouterLink} 
          to="/"
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 2 }}
        >
          Back to Dashboard
        </Button>
        
        <Typography variant="h4" component="h1" gutterBottom>
          {isEditMode ? 'Edit Habit' : 'Create New Habit'}
        </Typography>
        
        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Habit Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  error={!!errors.name}
                  helperText={errors.name}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Description (optional)"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  fullWidth
                  multiline
                  rows={2}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    label="Category"
                  >
                    {HABIT_CATEGORIES.map(category => (
                      <MenuItem key={category} value={category}>{category}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Icon</InputLabel>
                  <Select
                    name="icon"
                    value={formData.icon}
                    onChange={handleInputChange}
                    label="Icon"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <HabitIcon 
                          icon={selected} 
                          color={formData.color} 
                          size="small" 
                          sx={{ mr: 1 }} 
                        />
                        {selected}
                      </Box>
                    )}
                  >
                    {HABIT_ICONS.map(icon => (
                      <MenuItem key={icon} value={icon}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <HabitIcon 
                            icon={icon} 
                            color={formData.color} 
                            size="small" 
                            sx={{ mr: 1 }} 
                          />
                          {icon}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <FormLabel>Color</FormLabel>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {HABIT_COLORS.map(color => (
                      <Box
                        key={color}
                        onClick={() => setFormData(prev => ({ ...prev, color }))}
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: color,
                          borderRadius: '50%',
                          cursor: 'pointer',
                          border: formData.color === color ? '2px solid black' : 'none',
                          '&:hover': {
                            opacity: 0.8
                          }
                        }}
                      />
                    ))}
                  </Box>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Frequency
                </Typography>
                
                <FormControl fullWidth>
                  <ToggleButtonGroup
                    value={formData.frequency.type}
                    exclusive
                    onChange={handleFrequencyTypeChange}
                    aria-label="frequency type"
                    sx={{ mb: 2 }}
                  >
                    <ToggleButton value="daily">Daily</ToggleButton>
                    <ToggleButton value="weekly">Weekly</ToggleButton>
                    <ToggleButton value="custom">Custom</ToggleButton>
                  </ToggleButtonGroup>
                  
                  {renderFrequencyOptions()}
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                {renderReminders()}
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary"
                    startIcon={<SaveIcon />}
                    size="large"
                  >
                    {isEditMode ? 'Update Habit' : 'Create Habit'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default HabitForm; 