import React, { useState } from 'react';
import { 
  Paper, 
  Box, 
  Typography, 
  IconButton, 
  Grid,
  useTheme
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  getDay,
  isToday
} from 'date-fns';
import { useHabits } from '../contexts/HabitContext';

function HabitCalendar({ habitId }) {
  const theme = useTheme();
  const { isHabitCompletedForDate, toggleHabitCompletion } = useHabits();
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Navigate to previous month
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  // Navigate to next month
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  // Navigate to current month
  const goToToday = () => {
    setCurrentMonth(new Date());
  };
  
  // Get days in the current month
  const getDaysInMonth = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = monthStart;
    const endDate = monthEnd;
    
    return eachDayOfInterval({ start: startDate, end: endDate });
  };
  
  // Get day cells for the calendar
  const renderDays = () => {
    const dateFormat = 'd';
    const days = getDaysInMonth();
    const monthStart = startOfMonth(currentMonth);
    
    // Get the day of the week for the first day of the month (0 = Sunday, 1 = Monday, etc.)
    const startDay = getDay(monthStart);
    
    // Create an array of day cells
    const rows = [];
    let cells = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDay; i++) {
      cells.push(
        <Box 
          key={`empty-${i}`} 
          sx={{ 
            height: 40, 
            width: 40, 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center' 
          }}
        />
      );
    }
    
    // Add cells for each day in the month
    days.forEach((day) => {
      const formattedDate = format(day, dateFormat);
      const isComplete = isHabitCompletedForDate(habitId, day);
      const isTodayDate = isToday(day);
      
      cells.push(
        <Box 
          key={day.toString()} 
          onClick={() => toggleHabitCompletion(habitId, day)}
          sx={{ 
            height: 40, 
            width: 40, 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            borderRadius: '50%',
            cursor: 'pointer',
            bgcolor: isComplete ? 'primary.main' : 'transparent',
            color: isComplete ? 'white' : 'text.primary',
            border: isTodayDate ? `2px solid ${theme.palette.primary.main}` : 'none',
            fontWeight: isTodayDate ? 'bold' : 'normal',
            '&:hover': {
              bgcolor: isComplete ? 'primary.dark' : 'action.hover'
            }
          }}
        >
          {formattedDate}
        </Box>
      );
      
      // If we've reached the end of a week, start a new row
      if (cells.length === 7) {
        rows.push(
          <Box 
            key={`row-${rows.length}`} 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-around', 
              mb: 1 
            }}
          >
            {cells}
          </Box>
        );
        cells = [];
      }
    });
    
    // Add any remaining cells to the last row
    if (cells.length > 0) {
      rows.push(
        <Box 
          key={`row-${rows.length}`} 
          sx={{ 
            display: 'flex', 
            justifyContent: 'flex-start', 
            mb: 1 
          }}
        >
          {cells}
        </Box>
      );
    }
    
    return rows;
  };
  
  // Render day names (Sun, Mon, etc.)
  const renderDayNames = () => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-around', 
          mb: 2 
        }}
      >
        {dayNames.map(day => (
          <Typography 
            key={day} 
            variant="subtitle2" 
            sx={{ 
              width: 40, 
              textAlign: 'center',
              color: 'text.secondary'
            }}
          >
            {day}
          </Typography>
        ))}
      </Box>
    );
  };
  
  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={prevMonth}>
          <ChevronLeftIcon />
        </IconButton>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6">
            {format(currentMonth, 'MMMM yyyy')}
          </Typography>
          <Typography 
            variant="body2" 
            color="primary" 
            sx={{ ml: 2, cursor: 'pointer' }}
            onClick={goToToday}
          >
            Today
          </Typography>
        </Box>
        
        <IconButton onClick={nextMonth}>
          <ChevronRightIcon />
        </IconButton>
      </Box>
      
      {renderDayNames()}
      {renderDays()}
    </Paper>
  );
}

export default HabitCalendar; 