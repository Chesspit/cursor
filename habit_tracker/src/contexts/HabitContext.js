import React, { createContext, useState, useContext, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { isToday, startOfDay, format, compareDesc } from 'date-fns';

const HabitContext = createContext();

export function useHabits() {
  return useContext(HabitContext);
}

export function HabitProvider({ children }) {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load habits from localStorage on component mount
  useEffect(() => {
    const storedHabits = localStorage.getItem('habits');
    if (storedHabits) {
      try {
        // Parse stored habits and ensure dates are proper Date objects
        const parsedHabits = JSON.parse(storedHabits, (key, value) => {
          // Convert stored ISO date strings back to Date objects
          if (key === 'createdAt' || key === 'updatedAt') {
            return new Date(value);
          }
          if (key === 'completions' && Array.isArray(value)) {
            return value.map(completion => ({
              ...completion,
              date: new Date(completion.date)
            }));
          }
          return value;
        });
        setHabits(parsedHabits);
      } catch (error) {
        console.error('Error parsing stored habits:', error);
        setHabits([]);
      }
    }
    setLoading(false);
  }, []);

  // Save habits to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('habits', JSON.stringify(habits));
    }
  }, [habits, loading]);

  // Add a new habit
  const addHabit = (habitData) => {
    const newHabit = {
      id: uuidv4(),
      name: habitData.name,
      description: habitData.description || '',
      icon: habitData.icon || 'check_circle',
      category: habitData.category || 'General',
      frequency: habitData.frequency || { type: 'daily' },
      reminders: habitData.reminders || [],
      completions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      streak: 0,
      bestStreak: 0,
      color: habitData.color || '#6200ee'
    };
    
    setHabits(prevHabits => [...prevHabits, newHabit]);
    return newHabit.id;
  };

  // Update an existing habit
  const updateHabit = (id, updatedData) => {
    setHabits(prevHabits => 
      prevHabits.map(habit => 
        habit.id === id 
          ? { 
              ...habit, 
              ...updatedData, 
              updatedAt: new Date() 
            } 
          : habit
      )
    );
  };

  // Delete a habit
  const deleteHabit = (id) => {
    setHabits(prevHabits => prevHabits.filter(habit => habit.id !== id));
  };

  // Mark a habit as complete for today
  const toggleHabitCompletion = (habitId, date = new Date()) => {
    const targetDate = startOfDay(date);
    const dateStr = format(targetDate, 'yyyy-MM-dd');
    
    setHabits(prevHabits => 
      prevHabits.map(habit => {
        if (habit.id !== habitId) return habit;
        
        // Check if the habit is already completed for this date
        const existingCompletionIndex = habit.completions.findIndex(
          comp => format(new Date(comp.date), 'yyyy-MM-dd') === dateStr
        );
        
        let newCompletions = [...habit.completions];
        
        if (existingCompletionIndex >= 0) {
          // Remove the completion if it exists
          newCompletions.splice(existingCompletionIndex, 1);
        } else {
          // Add a new completion
          newCompletions.push({
            id: uuidv4(),
            date: targetDate,
            timestamp: new Date()
          });
        }
        
        // Sort completions by date (newest first)
        newCompletions.sort((a, b) => compareDesc(new Date(a.date), new Date(b.date)));
        
        // Calculate the current streak
        const streak = calculateStreak(habit.id, newCompletions);
        const bestStreak = Math.max(streak, habit.bestStreak || 0);
        
        return {
          ...habit,
          completions: newCompletions,
          streak,
          bestStreak,
          updatedAt: new Date()
        };
      })
    );
  };

  // Calculate the current streak for a habit
  const calculateStreak = (habitId, completions = null) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return 0;
    
    const habitCompletions = completions || habit.completions;
    if (habitCompletions.length === 0) return 0;
    
    // Implementation depends on the frequency type (daily, weekly, custom)
    // This is a simplified version for daily habits
    // For weekly or custom frequencies, you would need more complex logic
    
    if (habit.frequency.type === 'daily') {
      let streak = 0;
      let currentDate = new Date();
      let daysPassed = 0;
      
      // Check if today is completed
      const isTodayCompleted = habitCompletions.some(comp => 
        isToday(new Date(comp.date))
      );
      
      if (!isTodayCompleted) {
        // If today is not completed, start checking from yesterday
        currentDate.setDate(currentDate.getDate() - 1);
        daysPassed = 1;
      }
      
      // Check consecutive days
      while (daysPassed <= 1000) { // Limit to avoid infinite loops
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        const isCompleted = habitCompletions.some(comp => 
          format(new Date(comp.date), 'yyyy-MM-dd') === dateStr
        );
        
        if (isCompleted) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
          daysPassed++;
        } else {
          break;
        }
      }
      
      return streak;
    }
    
    // For other frequency types, implement appropriate streak calculation logic
    return 0;
  };

  // Check if a habit is completed for a specific date
  const isHabitCompletedForDate = (habitId, date) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return false;
    
    const dateStr = format(startOfDay(date), 'yyyy-MM-dd');
    return habit.completions.some(
      comp => format(new Date(comp.date), 'yyyy-MM-dd') === dateStr
    );
  };

  // Get completion statistics for a habit
  const getHabitStats = (habitId) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return null;
    
    const totalCompletions = habit.completions.length;
    const currentStreak = habit.streak || 0;
    const bestStreak = habit.bestStreak || 0;
    
    // Calculate completion rate (e.g., for the last 30 days)
    // This is a simplified version
    
    return {
      totalCompletions,
      currentStreak,
      bestStreak,
      // Add more statistics as needed
    };
  };

  // Export habits data
  const exportHabits = (format = 'json') => {
    if (format === 'json') {
      const dataStr = JSON.stringify(habits, null, 2);
      return dataStr;
    } else if (format === 'csv') {
      // Convert to CSV format
      const headers = "id,name,description,category,createdAt,completions\n";
      const rows = habits.map(habit => {
        return `"${habit.id}","${habit.name}","${habit.description}","${habit.category}","${habit.createdAt}","${habit.completions.length}"`;
      }).join('\n');
      return headers + rows;
    }
    return null;
  };

  const value = {
    habits,
    loading,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleHabitCompletion,
    isHabitCompletedForDate,
    calculateStreak,
    getHabitStats,
    exportHabits
  };

  return (
    <HabitContext.Provider value={value}>
      {children}
    </HabitContext.Provider>
  );
} 