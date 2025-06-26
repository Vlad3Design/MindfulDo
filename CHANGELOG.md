# Changelog

All notable changes to the MindfulDo plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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