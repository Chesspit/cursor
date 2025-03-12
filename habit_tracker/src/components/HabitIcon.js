import React from 'react';
import { Icon, Box, Badge } from '@mui/material';
import { Check as CheckIcon } from '@mui/icons-material';

/**
 * HabitIcon component displays a Material Icon for a habit
 * with optional completion status
 * 
 * @param {Object} props Component props
 * @param {string} props.icon Material icon name
 * @param {string} props.color Icon color (hex or theme color)
 * @param {boolean} props.completed Whether the habit is completed
 * @param {string} props.size Icon size ('small', 'medium', 'large', or custom size in px)
 * @param {Object} props.sx Additional styles
 */
function HabitIcon({ icon, color, completed, size = 'medium', sx = {} }) {
  // Map size names to pixel values
  const sizeMap = {
    small: '20px',
    medium: '24px',
    large: '36px',
  };
  
  // Determine the actual size value
  const actualSize = sizeMap[size] || size;
  
  // If completed, show with a check badge
  if (completed) {
    return (
      <Badge
        overlap="circular"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        badgeContent={
          <Box
            sx={{
              bgcolor: 'success.main',
              color: 'white',
              borderRadius: '50%',
              width: '14px',
              height: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckIcon sx={{ fontSize: '10px' }} />
          </Box>
        }
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: color || 'primary.main',
            color: 'white',
            borderRadius: '50%',
            width: actualSize,
            height: actualSize,
            ...sx
          }}
        >
          <Icon>{icon}</Icon>
        </Box>
      </Badge>
    );
  }
  
  // Regular icon without completion badge
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: color || 'primary.main',
        color: 'white',
        borderRadius: '50%',
        width: actualSize,
        height: actualSize,
        ...sx
      }}
    >
      <Icon>{icon}</Icon>
    </Box>
  );
}

export default HabitIcon; 