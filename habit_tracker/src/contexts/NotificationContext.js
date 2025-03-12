import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { useHabits } from './HabitContext';

const NotificationContext = createContext();

export function useNotifications() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const { habits } = useHabits();

  // Check notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
      setNotificationsEnabled(localStorage.getItem('notificationsEnabled') === 'true');
    }
  }, []);

  // Save notification settings
  useEffect(() => {
    localStorage.setItem('notificationsEnabled', notificationsEnabled);
  }, [notificationsEnabled]);

  // Request notification permission
  const requestPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support desktop notifications');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        return true;
      } else {
        setNotificationsEnabled(false);
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  // Toggle notifications on/off
  const toggleNotifications = async () => {
    if (notificationsEnabled) {
      setNotificationsEnabled(false);
      return true;
    } else {
      if (notificationPermission === 'granted') {
        setNotificationsEnabled(true);
        return true;
      } else {
        return await requestPermission();
      }
    }
  };

  // Show a notification
  const showNotification = useCallback((title, options = {}) => {
    if (!notificationsEnabled || notificationPermission !== 'granted') {
      return false;
    }

    try {
      const notification = new Notification(title, {
        icon: '/logo192.png',
        ...options
      });

      notification.onclick = function() {
        window.focus();
        notification.close();
        if (options.onClick) options.onClick();
      };

      return true;
    } catch (error) {
      console.error('Error showing notification:', error);
      return false;
    }
  }, [notificationsEnabled, notificationPermission]);

  // Check for due reminders
  useEffect(() => {
    if (!notificationsEnabled || !habits.length) return;

    const checkReminders = () => {
      const now = new Date();
      const currentTime = format(now, 'HH:mm');
      const currentDayIndex = now.getDay(); // 0 = Sunday, 1 = Monday, etc.

      habits.forEach(habit => {
        if (!habit.reminders || !habit.reminders.length) return;

        habit.reminders.forEach(reminder => {
          // Skip reminders that aren't for today based on frequency
          if (reminder.days && !reminder.days.includes(currentDayIndex)) {
            return;
          }

          // Check if this reminder's time matches current time
          if (reminder.time === currentTime) {
            showNotification(
              `Reminder: ${habit.name}`,
              {
                body: habit.description || 'Time to complete this habit!',
                onClick: () => {
                  // Navigate to the habit's detail page when clicked
                  window.location.href = `/habits/${habit.id}`;
                }
              }
            );
          }
        });
      });
    };

    // Check every minute
    const intervalId = setInterval(checkReminders, 60000);
    // Also check immediately
    checkReminders();

    return () => clearInterval(intervalId);
  }, [habits, notificationsEnabled, showNotification]);

  const value = {
    notificationsEnabled,
    notificationPermission,
    requestPermission,
    toggleNotifications,
    showNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
} 