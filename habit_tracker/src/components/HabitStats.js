import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Box, 
  Typography, 
  ToggleButtonGroup, 
  ToggleButton, 
  Grid,
  Card,
  CardContent,
  Divider,
  useTheme
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  ShowChart as LineChartIcon,
  CalendarViewWeek as WeekIcon,
  CalendarViewMonth as MonthIcon,
  DateRange as DateRangeIcon
} from '@mui/icons-material';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  subMonths, 
  eachDayOfInterval, 
  eachWeekOfInterval,
  getWeek,
  getMonth,
  getYear,
  isWithinInterval
} from 'date-fns';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement, 
  PointElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { useHabits } from '../contexts/HabitContext';
import { calculateCompletionRate, groupCompletionsByPeriod } from '../utils/helpers';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

function HabitStats({ habitId }) {
  const theme = useTheme();
  const { habits, isHabitCompletedForDate } = useHabits();
  
  const [habit, setHabit] = useState(null);
  const [chartType, setChartType] = useState('bar');
  const [timeRange, setTimeRange] = useState('week');
  const [chartData, setChartData] = useState(null);
  
  // Find the habit by ID
  useEffect(() => {
    const foundHabit = habits.find(h => h.id === habitId);
    if (foundHabit) {
      setHabit(foundHabit);
    }
  }, [habitId, habits]);
  
  // Generate chart data based on habit completions
  useEffect(() => {
    if (!habit) return;
    
    const now = new Date();
    let startDate, endDate, labels, data;
    
    // Set date range based on selected time range
    switch (timeRange) {
      case 'week':
        startDate = startOfWeek(now, { weekStartsOn: 1 });
        endDate = endOfWeek(now, { weekStartsOn: 1 });
        break;
      case 'month':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case '3months':
        startDate = startOfMonth(subMonths(now, 2));
        endDate = endOfMonth(now);
        break;
      default:
        startDate = startOfWeek(now, { weekStartsOn: 1 });
        endDate = endOfWeek(now, { weekStartsOn: 1 });
    }
    
    // Generate data based on time range
    if (timeRange === 'week') {
      // Daily data for the current week
      const days = eachDayOfInterval({ start: startDate, end: endDate });
      labels = days.map(day => format(day, 'EEE'));
      data = days.map(day => isHabitCompletedForDate(habit.id, day) ? 1 : 0);
    } else if (timeRange === 'month') {
      // Weekly data for the current month
      const weeks = eachWeekOfInterval(
        { start: startDate, end: endDate },
        { weekStartsOn: 1 }
      );
      
      labels = weeks.map(week => `Week ${getWeek(week) - getWeek(startDate) + 1}`);
      
      data = weeks.map(weekStart => {
        const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
        const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
        const completedDays = daysInWeek.filter(day => 
          isWithinInterval(day, { start: startDate, end: endDate }) && 
          isHabitCompletedForDate(habit.id, day)
        ).length;
        return completedDays;
      });
    } else if (timeRange === '3months') {
      // Monthly data for the last 3 months
      labels = [
        format(subMonths(now, 2), 'MMM'),
        format(subMonths(now, 1), 'MMM'),
        format(now, 'MMM')
      ];
      
      data = [
        calculateMonthlyCompletionRate(subMonths(now, 2)),
        calculateMonthlyCompletionRate(subMonths(now, 1)),
        calculateMonthlyCompletionRate(now)
      ];
    }
    
    // Set chart data
    setChartData({
      labels,
      datasets: [
        {
          label: 'Completions',
          data,
          backgroundColor: theme.palette.primary.main,
          borderColor: theme.palette.primary.main,
        }
      ]
    });
    
  }, [habit, timeRange, chartType, theme, isHabitCompletedForDate]);
  
  // Calculate completion rate for a specific month
  const calculateMonthlyCompletionRate = (date) => {
    if (!habit) return 0;
    
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    const completedDays = daysInMonth.filter(day => 
      isHabitCompletedForDate(habit.id, day)
    ).length;
    
    return completedDays;
  };
  
  // Handle chart type change
  const handleChartTypeChange = (event, newType) => {
    if (newType !== null) {
      setChartType(newType);
    }
  };
  
  // Handle time range change
  const handleTimeRangeChange = (event, newRange) => {
    if (newRange !== null) {
      setTimeRange(newRange);
    }
  };
  
  // Calculate overall statistics
  const calculateStats = () => {
    if (!habit) return { total: 0, rate: 0 };
    
    const totalCompletions = habit.completions.length;
    
    // Calculate completion rate for the last 30 days
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    
    const daysInRange = eachDayOfInterval({ start: thirtyDaysAgo, end: now });
    const completedDaysInRange = daysInRange.filter(day => 
      isHabitCompletedForDate(habit.id, day)
    ).length;
    
    const completionRate = calculateCompletionRate(completedDaysInRange, daysInRange.length);
    
    return {
      total: totalCompletions,
      rate: completionRate
    };
  };
  
  const stats = calculateStats();
  
  if (!habit || !chartData) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography>No data available</Typography>
      </Paper>
    );
  }
  
  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Completions: ${context.raw}`;
          }
        }
      }
    }
  };
  
  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  Total Completions
                </Typography>
                <Typography variant="h4">
                  {stats.total}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  Current Streak
                </Typography>
                <Typography variant="h4">
                  {habit.streak || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  days
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  30-Day Completion
                </Typography>
                <Typography variant="h4">
                  {stats.rate}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
      
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Completion History</Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <ToggleButtonGroup
              value={chartType}
              exclusive
              onChange={handleChartTypeChange}
              size="small"
              aria-label="chart type"
            >
              <ToggleButton value="bar" aria-label="bar chart">
                <BarChartIcon />
              </ToggleButton>
              <ToggleButton value="line" aria-label="line chart">
                <LineChartIcon />
              </ToggleButton>
            </ToggleButtonGroup>
            
            <ToggleButtonGroup
              value={timeRange}
              exclusive
              onChange={handleTimeRangeChange}
              size="small"
              aria-label="time range"
            >
              <ToggleButton value="week" aria-label="week">
                <WeekIcon />
              </ToggleButton>
              <ToggleButton value="month" aria-label="month">
                <MonthIcon />
              </ToggleButton>
              <ToggleButton value="3months" aria-label="3 months">
                <DateRangeIcon />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Box sx={{ height: 300 }}>
          {chartType === 'bar' ? (
            <Bar data={chartData} options={chartOptions} />
          ) : (
            <Line data={chartData} options={chartOptions} />
          )}
        </Box>
      </Paper>
    </Box>
  );
}

export default HabitStats; 