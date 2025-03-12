# Habit Tracker App

A modern web application for tracking and building positive habits. This app helps you create, track, and maintain habits with features like customizable reminders, progress tracking, and visual statistics.

## Features

### Core Features

- **Habit Creation & Customization**
  - Custom name and description
  - Icon selection
  - Category assignment (Health, Fitness, Productivity, etc.)
  - Color customization

- **Flexible Scheduling**
  - Daily habits
  - Weekly habits (specific days of the week)
  - Custom frequency (X times per week)

- **Progress Tracking**
  - One-tap habit completion
  - Historical completion data
  - Streak counter for consecutive successful days
  - Visual statistics and charts

- **Reminders & Notifications**
  - Custom time-based reminders
  - Day-specific notifications

### Additional Features

- **Dark and Light Mode**
  - Toggle between light and dark themes
  - Follows system preference by default

- **Data Management**
  - Export data in CSV or JSON format
  - Data persistence using localStorage

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/habit-tracker.git
   cd habit-tracker
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Usage

### Creating a Habit

1. Click the "+" button in the dashboard or the "Add Habit" button in the header
2. Fill in the habit details:
   - Name (required)
   - Description (optional)
   - Category
   - Icon and color
3. Set the frequency:
   - Daily: tracked every day
   - Weekly: select specific days of the week
   - Custom: set a number of times per week
4. Add reminders (optional)
5. Click "Create Habit"

### Tracking Habits

- Click the checkmark icon next to a habit to mark it as complete for today
- View your progress in the dashboard
- See detailed statistics and calendar view in the habit detail page

### Managing Settings

- Toggle between light and dark mode
- Enable or disable notifications
- Export your data
- Reset all data if needed

## Technologies Used

- React
- Material-UI
- Chart.js
- date-fns
- localStorage for data persistence

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Icons provided by Material Icons
- Color palette inspired by Material Design 