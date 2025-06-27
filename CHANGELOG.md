# Changelog

All notable changes to the MindfulDo plugin will be documented in this file.

## [1.2.3] - 2025-06-27

### Added
- **Dynamic Navigation Buttons** - Buttons now automatically resize and reorganize when features are disabled
  - Smart grid layout that adapts to the number of enabled features
  - 1-3 buttons: single row layout
  - 4 buttons: 2x2 grid layout
  - 5-6 buttons: 3x2 grid layout with proper spacing
  - No more empty spaces when buttons are disabled
- **Enhanced Edit Functionality** - Improved editing experience for tasks, reminders, and habits
  - Full editing capabilities: change text, category, color, and date/time
  - Better error handling and validation
  - Success confirmation messages
  - Keyboard shortcuts (Enter to save, Escape to cancel)
  - Proper modal cleanup to prevent conflicts
  - More reliable save operations with async/await

### Fixed
- **Habits Blinking Issue** - Fixed the blinking problem that occurred when toggling tasks
  - Habits view now only refreshes when actually in the habits view
  - Prevents unnecessary re-rendering that caused visual flickering
  - Improved performance by avoiding redundant updates
- **Edit Function Reliability** - Fixed issues where edit changes weren't saved properly
  - Added proper error handling and validation
  - Improved modal management to prevent duplicate modals
  - Better async/await implementation for data saving
  - Added confirmation messages for successful edits
- **Navigation Button Layout** - Fixed static button layout that didn't adapt to disabled features
  - Buttons now dynamically resize and reorganize based on enabled features
  - Proper grid positioning for all button combinations
  - Responsive design that works on all screen sizes

### Improved
- **User Experience** - Enhanced overall usability and reliability
  - More intuitive edit modals with better feedback
  - Consistent behavior across all edit functions
  - Better visual feedback for user actions
  - Improved error messages and validation
- **Performance** - Optimized rendering and data operations
  - Reduced unnecessary re-renders
  - Better async handling for data operations
  - Improved modal management and cleanup

## [1.2.2] - 2025-06-27

### Fixed
- **Mobile-Desktop Sync Bug** - Solved the synchronization issue for habits between mobile and desktop versions
  - Added automatic file monitoring to detect external data changes
  - Implemented real-time view updates when habits are modified on other devices
  - Added periodic sync check as fallback (every 5 seconds)
  - Included debouncing to optimize performance and prevent excessive reloads
  - No longer requires plugin restart to see changes from other devices

## [1.2.1] - 2025-06-26
  - Responsive Habit Tracker Layout
  - Habit tracking days now use a responsive grid:
  - Days are always displayed as round circles with a green border
  - Automatically arrange on two rows if the container is too narrow (works on mobile and narrow sidebars)
  - Preserves the original look and feel, with improved usability on all screen sizes
  - No more overflow or selection issues on mobile or small sidebars

## [1.2.0] - 2025-06-26

### Added
- **Weekly Analytics Dashboard** - Comprehensive productivity insights and progress tracking
  - Overall productivity score (0-100) with detailed breakdown
  - Analytics cards for tasks, habits, and Pomodoro metrics
  - Daily activity chart with visual representation
  - Week navigation to track progress over time
  - Responsive design for all screen sizes
- **Enhanced Habit Tracker** - Improved UI and functionality
  - Centered layout for better visual balance
  - Improved spacing between input and color options
  - Full-height layout consistent with other sections
  - Better streak calculation and display
- **Pomodoro Presets** - Quick access to popular configurations
  - Classic (25/5/15), Focus (45/10/20), and Quick (15/3/10) presets
  - Easy switching between preset configurations
  - Visual feedback for active preset

### Changed
- **Layout Improvements** - Enhanced visual consistency across all sections
  - Centered "Weekly Analytics" title
  - Centered habit color circles and "Your Habits" title
  - Consistent full-height layout for all sections (tasks, reminders, habits, analytics)
  - Improved spacing and visual hierarchy
- **Habit Input Structure** - Restructured to match tasks layout
  - Add button now positioned in input container like tasks
  - Better visual consistency between sections
- **Analytics Scoring** - Improved calculation accuracy
  - More intuitive habits score calculation
  - Better visual representation of productivity metrics
  - Added color legend for daily activity chart
- **Responsive Habit Tracker Layout** - Habit tracking days now use a responsive grid:
  - Days are always displayed as round circles with a green border
  - Automatically arrange on two rows if the container is too narrow (works on mobile and narrow sidebars)
  - Preserves the original look and feel, with improved usability on all screen sizes
  - No more overflow or selection issues on mobile or small sidebars

### Fixed
- **Data Persistence** - Enhanced reliability of data saving
- **Responsive Design** - Better mobile and tablet experience
- **Theme Integration** - Improved consistency across all themes
- **Language Support** - Enhanced Romanian and English localization

## [1.1.0] - 2025-06-25

### Added
- **Visual Calendar** - Interactive monthly calendar with event visualization
  - Monthly view with intuitive navigation
  - Visual indicators for tasks (green) and reminders (orange)
  - Interactive day details on click
  - Responsive design adapting to sidebar width
- **Enhanced Multilingual Support** - Complete Romanian and English localization
  - Dynamic greetings based on time of day
  - Smart placeholders adapting to context
  - Consistent interface in both languages

### Changed
- **Improved Calendar Navigation** - Fixed navigation bugs and optimized performance
- **Enhanced Persistence** - Fixed data saving issues and improved synchronization

## [1.0.0] - 2025-06-24

### Added
- **Task Management** - Comprehensive task organization system
  - 6 pre-defined categories (Work, Personal, Health, Learning, Hobby)
  - Real-time task counting and completion tracking
  - Smooth animations and enhanced local storage
- **Smart Reminders** - Intelligent reminder system
  - Intuitive date/time picker with browser notifications
  - Flexible expiration handling and persistent data
- **Habit Tracker** - Visual habit tracking interface
  - Customizable habits with 6 color options
  - 7-day tracking view with streak system
  - Interactive daily marking with visual feedback
- **Pomodoro Timer** - Professional productivity timer
  - Configurable time periods with circular progress visualization
  - Smart session management and theme integration
- **Beautiful Themes** - 6 carefully crafted color schemes
  - Default, Ocean, Forest, Sunset, Purple, and Midnight themes
- **Customizable Settings** - Personalized configuration options
  - Personal greetings, language preference, theme selection
  - Reminder behavior and sidebar position settings

### Technical
- Built with vanilla JavaScript and TypeScript
- Responsive design with CSS variables
- Obsidian plugin architecture
- Local vault storage for data persistence 
