import { format, startOfWeek, endOfWeek, eachDayOfInterval, addDays } from 'date-fns';

// Format date with various options
export const formatDate = (date, formatStr = 'PPP') => {
  return format(new Date(date), formatStr);
};

// Get an array of days for the current week
export const getCurrentWeekDays = (date = new Date()) => {
  const start = startOfWeek(date, { weekStartsOn: 1 }); // Start on Monday
  const end = endOfWeek(date, { weekStartsOn: 1 });
  
  return eachDayOfInterval({ start, end });
};

// Get days matching a weekly frequency (e.g., every Monday, Wednesday, Friday)
export const getDaysMatchingFrequency = (frequency, startDate, endDate) => {
  if (!frequency || !frequency.days || !frequency.days.length) {
    return [];
  }
  
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  return days.filter(day => frequency.days.includes(day.getDay()));
};

// Calculate completion rate as a percentage
export const calculateCompletionRate = (completions, totalDays) => {
  if (totalDays === 0) return 0;
  return Math.round((completions / totalDays) * 100);
};

// Group completions by day, week, or month for statistics
export const groupCompletionsByPeriod = (completions, period = 'day') => {
  const grouped = {};
  
  completions.forEach(completion => {
    const date = new Date(completion.date);
    let key;
    
    switch(period) {
      case 'week':
        // Get the week number in year
        const weekNum = format(date, 'w');
        const year = format(date, 'yyyy');
        key = `${year}-W${weekNum}`;
        break;
      case 'month':
        key = format(date, 'yyyy-MM');
        break;
      case 'day':
      default:
        key = format(date, 'yyyy-MM-dd');
    }
    
    if (!grouped[key]) {
      grouped[key] = [];
    }
    
    grouped[key].push(completion);
  });
  
  return grouped;
};

// Convert habit data to CSV format for export
export const convertToCSV = (habits) => {
  if (!habits || !habits.length) return '';
  
  // Header row for the CSV
  const headers = ['Name', 'Category', 'Description', 'Created At', 'Total Completions', 'Current Streak', 'Best Streak'];
  
  // Create rows for each habit
  const rows = habits.map(habit => [
    habit.name,
    habit.category,
    habit.description,
    format(new Date(habit.createdAt), 'yyyy-MM-dd'),
    habit.completions.length,
    habit.streak,
    habit.bestStreak
  ]);
  
  // Combine headers and rows
  const allRows = [headers, ...rows];
  
  // Convert each row to CSV format
  return allRows.map(row => 
    row.map(cell => 
      typeof cell === 'string' && cell.includes(',') 
        ? `"${cell}"`
        : cell
    ).join(',')
  ).join('\n');
};

// Download data as a file
export const downloadFile = (data, filename, mimeType) => {
  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  
  document.body.appendChild(link);
  link.click();
  
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}; 