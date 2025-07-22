# Changelog

All notable changes to the MindfulDo plugin will be documented in this file.

## [1.2.9.4] - 2025-07-22

### Added
- **Reminder Reordering**
  - Reminders can now be reordered using ↑↓ arrow buttons, identical to the system for tasks and habits
  - Buttons are automatically disabled for the first/last active reminder
  - Drag-and-drop remains as a fallback option
- **Custom Habit Color**
  - You can now pick any custom color for a habit using a color picker, both when adding and editing habits. If you are not satisfied with the preset colors, simply choose your own!

### Fixed
- **Delete Confirmation Modal**
  - The confirmation popup for deleting a reminder now closes instantly after confirming, just like for tasks and habits

### Technical
- Added functions: `moveReminderUp()`, `moveReminderDown()`, `setupRemindersReordering()`
- New CSS styles for `.reminder-reorder`, `.reminder-move-up`, `.reminder-move-down` (identical to tasks/habits)
- `deleteReminder` is now async for consistency and better UX

### Changed
- **Task Addition Order**
  - New tasks are now added at the top of the list (first), instead of at the end, for a more intuitive workflow


## [1.2.9.3] - 2025-07-17

### Fixed
- **Task Reordering System** - Complete fix for arrow button reordering functionality
  - Fixed bug where first task couldn't be moved down in any category
  - Fixed bug where tasks between 3rd and 4th position couldn't be reordered
  - Fixed inconsistent behavior when filtering by category vs "All" view
  - Improved logic to work correctly with both completed and incomplete tasks
  - Added automatic order value normalization to prevent duplicates and inconsistencies
  - Enhanced button state calculation to properly disable buttons when reordering is not possible

### Improved
- **Order Value Management** - Enhanced data consistency and reliability
  - Automatic normalization of order values after any reordering operation
  - Proper handling of order values when adding new tasks
  - Consistent sorting behavior across all views and categories
  - Better separation between completed and incomplete tasks during reordering
- **User Experience** - More reliable and predictable reordering behavior
  - Reordering now works consistently in all categories and views
  - Proper visual feedback with accurate button states
  - No more "dead zones" where reordering fails
  - Consistent behavior across desktop and mobile platforms

### Technical
- Rewritten `moveTaskUp()` and `moveTaskDown()` functions with proper filtering logic
- Added `normalizeOrderValues()` function to maintain data consistency
- Enhanced render logic to accurately calculate button disabled states
- Improved task filtering to work correctly with completion status and categories
- Added automatic order normalization after task addition and reordering operations

## [1.2.9.2] - 2025-07-07

### Added
- **Monthly Calendar Layout for Habits** - Complete redesign of habits tracking interface
  - Full monthly calendar view with all days of the month displayed
  - Interactive navigation between months with ‹ › arrows
  - Clear highlight for today's date with accent color
  - Visual checkmarks (✓) for completed days
  - Future dates are disabled and visually distinct
  - Each habit shows with its custom color when completed
  - Mobile-responsive design that works perfectly on all screen sizes

### Improved
- **Mobile Experience** - Completely rebuilt for mobile-first design
  - Touch-friendly day selection with proper tap targets
  - Responsive grid layout that adapts to screen width
  - Optimized spacing and sizing for mobile devices
  - Better visual hierarchy with clear headers and sections
  - Improved accessibility with proper contrast and focus states
- **Data Persistence** - Unified rendering system
  - Eliminated inconsistencies between different render functions
  - Single source of truth for habits display logic
  - Guaranteed accurate data saving and retrieval
  - Fixed layout conflicts that occurred during reordering

### Changed
- **Visual Design** - Modern card-based layout
  - Each habit displays as a clean card with header and calendar
  - Better visual separation between habits
  - Consistent spacing and typography throughout
  - Enhanced color usage with proper theming support
- **User Interaction** - Intuitive calendar interface
  - Click any day to toggle completion status
  - Visual feedback with hover effects and animations
  - Clear indicators for different day states (today, completed, future)
  - Month navigation specific to habits (independent of main calendar)

### Technical
- Added `currentHabitsMonth` and `currentHabitsYear` state variables
- Implemented `generateHabitMonthCalendar()` for dynamic calendar generation
- Created `setupHabitsEventListeners()` for unified event handling
- Added `navigateHabitsMonth()` for month navigation
- Unified `renderHabits()` and `renderHabitsWithoutDragSetup()` to use same logic
- Added comprehensive CSS with responsive breakpoints and theming support
- Maintained arrow button reordering system from previous version


## [1.2.9.1] - 2025-07-07

### Fixed
- **Task Reordering System** - Replaced problematic drag & drop with reliable arrow button system
  - Eliminated inconsistent drag & drop behavior that caused order loss
  - Implemented simple ↑↓ arrow buttons for each task
  - Buttons automatically disable when reordering is not possible (first/last position)
  - Guaranteed order persistence after any reordering operation
  - Better mobile compatibility and touch-friendly interface
  - Immediate visual feedback and automatic save after each reorder action

### Improved
- **User Experience** - Enhanced task management reliability
  - No more dependency on complex drag & drop event listeners
  - Clear and intuitive reordering interface
  - Consistent behavior across all devices and browsers
  - Faster and more responsive reordering operations
  - Better accessibility for users with motor difficulties

### Technical
- Replaced `setupTasksDragAndDrop()` with `setupTasksReordering()`
- Added `moveTaskUp()` and `moveTaskDown()` functions for reliable order management
- Enhanced CSS with modern button styling and hover effects
- Simplified event handling for better performance and reliability

## [1.2.8] - 2025-07-04

### Improved
- **Live Drag & Drop** for tasks: the task list now rearranges instantly as you drag a task, providing a modern and intuitive experience with fluid visual feedback. Reordering happens live, not just at the end of the drag action.
- Build compatibility optimized for Obsidian (correct plugin class export).

## [1.2.7] - 2025-07-03

### Added
- **Drag & Drop Reordering** - Comprehensive reordering system for all item types
  - Drag and drop functionality for tasks with visual feedback
  - Drag and drop functionality for reminders with priority sorting
  - Drag and drop functionality for habits with custom ordering
  - Visual drag handles (⋮⋮) for intuitive interaction
  - Drop indicators showing where items will be placed
  - Smooth animations and transitions during drag operations
  - Automatic order persistence and synchronization
  - Touch-friendly design for mobile devices

### Changed
- **Default Settings** - Simplified initial configuration for new users
  - Only tasks are enabled by default for a cleaner first experience
  - Users can enable additional features (reminders, habits, analytics, calendar, pomodoro) as needed
  - Reduces cognitive load for new users while maintaining full functionality
- **Item Ordering** - Enhanced sorting and organization
  - All tasks, reminders, and habits now have persistent order values
  - Items maintain their custom order across app restarts
  - Completed tasks still sort to bottom but preserve relative order
  - Data migration automatically adds order values to existing items

### Improved
- **User Experience** - Enhanced interaction design
  - Visual feedback during drag operations with scaling and shadows
  - Clear drop zone indicators with colored borders
  - Responsive drag handles that adapt to different themes
  - Consistent drag behavior across all item types
  - Better mobile and touch device support
- **Performance** - Optimized drag and drop operations
  - Efficient reordering algorithms that minimize data changes
  - Batched save operations to reduce storage overhead
  - Smooth animations that don't impact scrolling performance

### Technical
- Added `order` property to Task, Reminder, and Habit interfaces
- Implemented automatic data migration for existing installations
- Enhanced CSS with drag-and-drop specific styling
- Theme-specific drag handle colors for visual consistency

## [1.2.6] - 2025-06-29

### Added
- **Delete Confirmation System** - Enhanced safety for all delete operations
  - Confirmation modal for task deletion with task text preview
  - Confirmation modal for reminder deletion with reminder text preview
  - Confirmation modal for habit deletion with habit name preview
  - Prevents accidental deletion of important items
  - Consistent user experience across all delete operations
  - Multilingual support (Romanian and English)
  - Keyboard navigation support (Escape to cancel)
  - Responsive design for all screen sizes
  - Smooth animations and modern UI design

### Improved
- **User Safety** - Better protection against accidental data loss
  - Clear visual feedback showing what will be deleted
  - Two-step confirmation process for all delete operations
  - Consistent confirmation dialogs across all features
  - Improved accessibility with keyboard shortcuts
- **User Experience** - Enhanced interaction design
  - Professional modal design with proper styling
  - Clear action buttons with appropriate colors (red for delete, gray for cancel)
  - Focus management for better keyboard navigation
  - Outside click to cancel functionality

## [1.2.5] - 2025-06-29

### Fixed
- Habits are now always synchronized with the latest data from data.json before any change, ensuring correct sync between desktop and mobile (Obsidian).
- Eliminated UI flicker when checking/unchecking a habit day: the interface only updates if the visual content actually changes. 

## [1.2.4] - 2025-06-29

### Fixed
- **Dropdown Issue** - Fixed the category dropdown in the editor: the selected text is now fully visible when editing a task. 

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
- **Dropdown Issue** - Fixed the category dropdown in the editor: the selected text is now fully visible when editing a task.

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

