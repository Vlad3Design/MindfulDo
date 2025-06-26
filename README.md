![MindfulDo v1.2.0](https://github.com/Vlad3Design/MindfulDo/blob/main/Banner-MindfulDo%20v1_2_0.jpg)

# MindfulDo - Obsidian Plugin

*MindfulDo • Do mindfully*

A calm, beautiful, and feature-rich todo list for Obsidian that helps you stay organized without stress.

![Plugin Preview](https://img.shields.io/badge/Obsidian-Plugin-purple) ![License](https://img.shields.io/badge/License-MIT-green) ![Version](https://img.shields.io/badge/Version-1.2.0-blue)

## ✨ Features

### 📝 **Task Management**
- **Categorized tasks** with 6 pre-defined categories (Work, Personal, Health, Learning, Hobby)
- **Real-time task counting** with completion tracking
- **Smooth animations** for a relaxing user experience
- **Enhanced local storage** - all data stays in your Obsidian vault with improved persistence
- **Complete timestamps** - track when tasks were created and completed

### ⏰ **Smart Reminders**
- **Intuitive date/time picker** with separate inputs for better UX
- **Browser notifications** with custom icons
- **Flexible expiration handling**:
  - Keep expired reminders until manually deleted
  - Auto-delete reminders when they expire
- **Persistent across sessions** - reminders survive Obsidian restarts

### 📅 **Visual Calendar**
- **Monthly view** with intuitive navigation
- **Visual indicators for tasks and reminders**:
  - Green dots for tasks created on that day
  - Orange dots for scheduled reminders
- **Clear legend** for quick identification
- **Responsive design** that adapts to sidebar width
- **Interactive day details** - click on days with events to see details below

### 🔄 **Habit Tracker**
- **Visual habit tracking** with beautiful, interactive interface
- **Customizable habits** with 6 color options for personalization
- **7-day tracking view** showing the last week's progress at a glance
- **Streak system**:
  - Current streak tracking for motivation
  - Best streak recording for personal records
  - Automatic streak calculation and updates
- **Interactive daily marking**:
  - Click on any day circle to mark/unmark completion
  - Today's indicator with special highlighting
  - Visual feedback for completed vs. missed days
- **Persistent data** - all habit completions saved locally in your vault
- **Responsive design** adapting to all screen sizes and themes

### 🍅 **Pomodoro Timer**
- **Professional productivity timer** with circular progress visualization
- **Configurable time periods**:
  - Work sessions (1-60 minutes, default: 25 min)
  - Short breaks (1-30 minutes, default: 5 min) 
  - Long breaks (5-60 minutes, default: 15 min)
- **Smart session management**:
  - Automatic cycle progression (work → break → work)
  - Configurable sessions before long break (2-8, default: 4)
  - Session and cycle tracking with real-time statistics
- **Enhanced user experience**:
  - Beautiful circular timer with animated progress ring
  - Start/pause/reset/skip controls with visual feedback
  - Audio-less notifications respecting Obsidian's notification system
  - Auto-start options for breaks and work sessions
- **Quick settings** within the timer view for immediate adjustments
- **Theme integration** - timer colors adapt to all 6 available themes

### 🎨 **Beautiful Themes**
Choose from 6 carefully crafted color schemes:
- 🎨 **Default** - Clean and energizing theme
- 🌊 **Ocean** (Blue-Teal) - Calming water vibes
- 🌲 **Forest** (Green) - Natural and refreshing
- 🌸 **Sunset** (Pink-Orange) - Gentle evening colors
- 💜 **Purple** (Violet) - Creative and inspiring
- 🌙 **Midnight** (Dark Blue) - Focused night mode

### 🌍 **Multi-language Support**
- **Full Romanian support** - Native language experience
- **Complete English support** - International accessibility
- **Smart greetings** - Auto-detects appropriate greetings and placeholders
- **Instant switching** - Change language in settings with immediate effect

![MindfulDo Features](https://github.com/Vlad3Design/MindfulDo/blob/main/Banner-MindfulDo%20v2%20-%20FEATURES.jpg)

### ⚙️ **Customizable Settings**
- **Personal greetings** - Set your name for personalized daily greetings
- **Theme selection** - Pick your favorite color scheme
- **Language preference** - Choose between Romanian and English
- **Reminder behavior** - Configure how expired reminders are handled
- **Sidebar position** - Choose left or right sidebar placement
- **Scroll control** - Set visible items before scrolling appears

## 🚀 Installation

### Method 1: Manual Installation

1. **Download the plugin files**:
   - `main.js`
   - `manifest.json` 
   - `styles.css`

2. **Create plugin folder**:
   ```
   YourVault/.obsidian/plugins/mindfuldo/
   ```

3. **Copy files** into the plugin folder

4. **Enable in Obsidian**:
   - Go to Settings → Community Plugins
   - Find "MindfulDo" and toggle it on

### Method 2: BRAT (Beta)

1. Install BRAT plugin if you haven't already
2. Add this repository URL in BRAT settings
3. Enable the plugin in Community Plugins

## 🎯 Usage

### Getting Started
1. **Open the plugin** by clicking the checkmark icon in the sidebar
2. **Set your preferences** in Settings → MindfulDo Settings
3. **Start adding tasks** with the intuitive interface

### Adding Tasks
- Type your task in the input field
- Press Enter or click "Add"
- Tasks automatically categorize based on your current filter
- Click the checkbox to mark as complete

### Setting Reminders
- Enter reminder description
- Pick date from calendar picker
- Choose time with time picker
- Click "Add Reminder"

### Using the Habit Tracker
- Access the habit tracker through the "🔄 Obiceiuri" tab (or "🔄 Habits" in English)
- **Add a new habit**: 
  - Type the habit name (e.g., "Drink water", "Read", "Exercise")
  - Choose a color from the 6 available options
  - Click "Add" to create the habit
- **Track daily progress**:
  - See the last 7 days displayed as circles for each habit
  - Click on any day circle to mark it as completed (✓) or uncompleted
  - Today's circle is highlighted with a special border
  - Completed days show in the habit's chosen color
- **Monitor your streaks**:
  - Current streak shows consecutive days completed
  - Best streak displays your personal record
  - Streaks update automatically as you mark days

### Using the Calendar
- Navigate through months using header arrows
- Days with tasks show green indicators
- Days with reminders show orange indicators
- Current day is highlighted
- **Click on days with events** to view task and reminder details below the calendar

### Using the Pomodoro Timer
- Access timer through the "🍅 Pomodoro" tab
- **Start a session**: Click the play button to begin a work session
- **Pause/resume**: Click the pause button to temporarily stop the timer
- **Reset**: Click reset to return to the original time for current mode
- **Skip**: Jump to the next session (work/break) immediately
- **Watch your progress**: The circular ring fills as time progresses
- **Track statistics**: View completed sessions and current cycle number
- **Quick adjustments**: Change time periods directly in the timer view
- **Notifications**: Get notified when sessions complete (if notifications enabled)

### Themes
- Access theme settings through plugin settings
- Changes apply instantly across all open views
- Each theme provides coordinated colors for all UI elements

## ⚙️ Configuration

### Settings Options

| Setting | Description |
|---|---|
| **Your name** | Personalizes greetings throughout the day |
| **Language** | Choose between English and Romanian |
| **Color theme** | Select from 6 beautiful themes |
| **Expired reminders** | Keep until deleted or auto-delete |
| **Sidebar position** | Choose left or right sidebar |
| **Visible tasks/reminders** | Control scroll behavior |
| **Work Time** | Duration of Pomodoro work sessions (1-60 min) |
| **Short Break** | Duration of short breaks (1-30 min) |
| **Long Break** | Duration of long breaks (5-60 min) |
| **Sessions Before Long Break** | Number of work sessions before a long break (2-8) |
| **Auto-start Breaks** | Automatically start breaks after work sessions |
| **Auto-start Work** | Automatically start work after breaks |

## 🆕 What's New in v1.0.0

### Enhanced Persistence
- **Fixed persistence issues** - Tasks and reminders now save correctly and survive restarts
- **Complete timestamps** - Track when items were created and completed
- **Improved synchronization** - Data saves automatically on every change

### Visual Calendar
- **Brand new calendar view** with month navigation
- **Visual indicators** for tasks (green) and reminders (orange)
- **Interactive day details** - click on days to see tasks and reminders below
- **Responsive design** that adapts to sidebar dimensions
- **Intuitive legend** for quick identification

### Extended Multilingual Support
- **Complete localization** for Romanian and English
- **Dynamic greetings** based on time of day and selected language
- **Smart placeholders** that adapt to context
- **Consistent interface** in both languages

### Improved Calendar Navigation
- **Fixed navigation bugs** - smooth month transitions without random jumps
- **Prevented Obsidian freezing** - optimized event listeners and rendering
- **Stable performance** - eliminated rapid-click issues

## 🤝 Contributing

We welcome contributions from the community!

### How to Contribute
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Areas for Contribution
- 🌍 **Translations** - Add support for more languages
- 🎨 **Themes** - Create new color schemes
- 🚀 **Features** - Implement new functionality
- 🐛 **Bug Fixes** - Report and fix issues
- 📖 **Documentation** - Improve guides and examples

## 🐛 Issues

Found a bug or have a feature request? Please [open an issue](https://github.com/Vlad3Design/MindfulDo/issues) with:
- Clear description of the problem or feature
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Screenshots if applicable

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Obsidian community for inspiration and feedback
- All beta testers and contributors
- Everyone who believes in mindful, stress-free productivity

---

**Made with ❤️ by [Vlad | 3Design](https://github.com/Vlad3Design)**

*Stay organized, stay mindful.* 
