var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// main.ts
var main_exports = {};
__export(main_exports, {
  RelaxingTodoView: () => RelaxingTodoView,
  VIEW_TYPE_RELAXING_TODO: () => VIEW_TYPE_RELAXING_TODO,
  default: () => RelaxingTodoPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var DEFAULT_SETTINGS = {
  defaultCategory: "personal",
  enableNotifications: true,
  theme: "default",
  userName: "Vlad",
  language: "ro",
  sidebarPosition: "left",
  autoDeleteExpired: false,
  // Pomodoro Defaults
  pomodoroWorkTime: 25,
  pomodoroBreakTime: 5,
  pomodoroLongBreakTime: 15,
  pomodoroSessionsBeforeLongBreak: 4,
  pomodoroAutoStartBreaks: false,
  pomodoroAutoStartWork: false,
  // Feature Toggles - by default only tasks are enabled
  enableTasks: true,
  enableReminders: false,
  enableHabits: false,
  enableAnalytics: false,
  enableCalendar: false,
  enablePomodoro: false
};
var VIEW_TYPE_RELAXING_TODO = "relaxing-todo-view";
var RelaxingTodoPlugin = class extends import_obsidian.Plugin {
  constructor() {
    super(...arguments);
    this.lastDataUpdate = 0;
  }
  onload() {
    return __async(this, null, function* () {
      yield this.loadSettings();
      this.dataFilePath = this.app.vault.configDir + "/plugins/mindfuldo/data.json";
      this.registerView(
        VIEW_TYPE_RELAXING_TODO,
        (leaf) => new RelaxingTodoView(leaf, this)
      );
      this.registerEvent(
        this.app.vault.on("modify", (file) => {
          if (file.path.includes("mindfuldo") || file.path.includes("data.json")) {
            this.handleDataFileChange();
          }
        })
      );
      this.registerInterval(
        window.setInterval(() => {
          this.checkForDataChanges();
        }, 3e3)
      );
      const ribbonIconEl = this.addRibbonIcon("checkmark", "MindfulDo - Task Manager", (evt) => {
        this.activateView();
      });
      ribbonIconEl.addClass("relaxing-todo-ribbon-class");
      this.addCommand({
        id: "open-relaxing-todo",
        name: "Open MindfulDo",
        callback: () => {
          this.activateView();
        }
      });
      this.addSettingTab(new RelaxingTodoSettingTab(this.app, this));
    });
  }
  onunload() {
  }
  activateView() {
    return __async(this, null, function* () {
      const { workspace } = this.app;
      let leaf = null;
      const leaves = workspace.getLeavesOfType(VIEW_TYPE_RELAXING_TODO);
      if (leaves.length > 0) {
        leaf = leaves[0];
      } else {
        if (this.settings.sidebarPosition === "right") {
          leaf = workspace.getRightLeaf(false);
        } else {
          leaf = workspace.getLeftLeaf(false);
        }
        yield leaf == null ? void 0 : leaf.setViewState({ type: VIEW_TYPE_RELAXING_TODO, active: true });
      }
      if (leaf) {
        workspace.revealLeaf(leaf);
      }
    });
  }
  moveViewToSidebar(newPosition) {
    return __async(this, null, function* () {
      const { workspace } = this.app;
      const leaves = workspace.getLeavesOfType(VIEW_TYPE_RELAXING_TODO);
      if (leaves.length > 0) {
        const currentLeaf = leaves[0];
        currentLeaf.detach();
        let newLeaf;
        if (newPosition === "right") {
          newLeaf = workspace.getRightLeaf(false);
        } else {
          newLeaf = workspace.getLeftLeaf(false);
        }
        yield newLeaf == null ? void 0 : newLeaf.setViewState({ type: VIEW_TYPE_RELAXING_TODO, active: true });
        if (newLeaf) {
          workspace.revealLeaf(newLeaf);
        }
      }
    });
  }
  loadSettings() {
    return __async(this, null, function* () {
      this.settings = Object.assign({}, DEFAULT_SETTINGS, yield this.loadData());
    });
  }
  saveSettings() {
    return __async(this, null, function* () {
      yield this.saveData(this.settings);
      this.refreshViews();
    });
  }
  refreshViews() {
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_RELAXING_TODO);
    leaves.forEach((leaf) => {
      if (leaf.view instanceof RelaxingTodoView) {
        leaf.view.refreshInterface();
      }
    });
  }
  handleDataFileChange() {
    return __async(this, null, function* () {
      const now = Date.now();
      if (now - this.lastDataUpdate < 3e3) {
        return;
      }
      this.lastDataUpdate = now;
      const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_RELAXING_TODO);
      leaves.forEach((leaf) => {
        if (leaf.view instanceof RelaxingTodoView) {
          if (!leaf.view.isDragging && !leaf.view.disableSync) {
            leaf.view.syncWithExternalChanges();
          }
        }
      });
    });
  }
  checkForDataChanges() {
    return __async(this, null, function* () {
      try {
        const stat = yield this.app.vault.adapter.stat(this.dataFilePath);
        if (stat && stat.mtime > this.lastDataUpdate) {
          this.handleDataFileChange();
        }
      } catch (error) {
      }
    });
  }
};
var RelaxingTodoView = class extends import_obsidian.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.tasks = [];
    this.reminders = [];
    this.habits = [];
    this.currentCategory = "toate";
    this.currentView = "tasks";
    // 'tasks', 'reminders', 'habits', 'analytics', 'calendar', 'pomodoro'
    // Pomodoro Timer State
    this.pomodoroTimer = null;
    this.pomodoroTimeLeft = 0;
    // seconds
    this.pomodoroIsRunning = false;
    this.pomodoroMode = "work";
    this.pomodoroCompletedSessions = 0;
    this.pomodoroCurrentCycle = 1;
    // Analytics State
    this.currentAnalyticsWeek = new Date();
    // Sync control
    this.lastLocalUpdate = 0;
    this.isDragging = false;
    this.disableSync = false;
    this.currentMonth = new Date().getMonth();
    this.currentYear = new Date().getFullYear();
    // Current month and year for habits calendar
    this.currentHabitsMonth = new Date().getMonth();
    this.currentHabitsYear = new Date().getFullYear();
    this.plugin = plugin;
  }
  getViewType() {
    return VIEW_TYPE_RELAXING_TODO;
  }
  getDisplayText() {
    return "MindfulDo";
  }
  getIcon() {
    return "checkmark";
  }
  onOpen() {
    return __async(this, null, function* () {
      const container = this.containerEl.children[1];
      container.empty();
      container.addClass("mindfuldo-container");
      container.setAttribute("data-theme", this.plugin.settings.theme);
      yield this.loadData();
      this.createInterface(container);
      this.updateDateTime();
      setInterval(() => this.updateDateTime(), 1e3);
      this.checkExpiredReminders();
      setInterval(() => this.checkExpiredReminders(), 6e4);
      setInterval(() => __async(this, null, function* () {
        return yield this.saveData();
      }), 3e4);
    });
  }
  onClose() {
    return __async(this, null, function* () {
      yield this.saveData();
      if (this.pomodoroTimer) {
        clearInterval(this.pomodoroTimer);
        this.pomodoroTimer = null;
      }
    });
  }
  refreshInterface() {
    const container = this.containerEl.children[1];
    container.empty();
    container.addClass("mindfuldo-container");
    container.setAttribute("data-theme", this.plugin.settings.theme);
    this.createInterface(container);
    this.updateDateTime();
    this.renderCurrentView();
  }
  syncWithExternalChanges() {
    return __async(this, null, function* () {
      try {
        const now = Date.now();
        if (this.disableSync || this.isDragging || now - this.lastLocalUpdate < 1e4) {
          return;
        }
        yield this.saveData();
        yield this.loadData();
        switch (this.currentView) {
          case "habits":
            this.renderHabits();
            break;
          case "tasks":
            this.renderTasks();
            break;
          case "reminders":
            this.renderReminders();
            break;
          case "analytics":
            this.renderAnalytics();
            break;
          case "calendar":
            this.renderCalendar();
            break;
          case "pomodoro":
            this.renderPomodoro();
            break;
        }
      } catch (error) {
        console.error("MindfulDo: Error syncing external changes:", error);
      }
    });
  }
  createInterface(container) {
    container.innerHTML = `
			<div class="mindfuldo-content">
				<!-- Header Section -->
				<div class="header">
					<h1 class="greeting" id="greeting"></h1>
					<div class="time-info" id="timeInfo"></div>
				</div>

				<!-- Navigation Tabs -->
				<div class="navigation-tabs" id="navigationTabs">
					${this.generateNavigationTabs()}
				</div>

				<!-- Tasks View -->
				<div class="view-container" id="tasksView">
					<!-- Input Section -->
					<div class="input-section">
						<div class="input-container">
							<input type="text" class="task-input" id="taskInput" placeholder="${this.getTaskPlaceholder()}">
							<button class="add-btn" id="addBtn">${this.plugin.settings.language === "ro" ? "Adaug\u0103" : "Add"}</button>
						</div>
					</div>

					<!-- Categories -->
					<div class="categories">
						<button class="category-btn active" data-category="toate">
							<span>\u{1F4CB}</span> ${this.plugin.settings.language === "ro" ? "Toate" : "All"}
						</button>
						<button class="category-btn" data-category="work">
							<span>\u{1F4BC}</span> ${this.plugin.settings.language === "ro" ? "Lucru" : "Work"}
						</button>
						<button class="category-btn" data-category="personal">
							<span>\u{1F3AF}</span> Personal
						</button>
						<button class="category-btn" data-category="health">
							<span>\u{1F3C3}\u200D\u2642\uFE0F</span> ${this.plugin.settings.language === "ro" ? "S\u0103n\u0103tate" : "Health"}
						</button>
						<button class="category-btn" data-category="learning">
							<span>\u{1F4DA}</span> ${this.plugin.settings.language === "ro" ? "\xCEnv\u0103\u021Bare" : "Learning"}
						</button>
						<button class="category-btn" data-category="hobby">
							<span>\u{1F3A8}</span> Hobby
						</button>
					</div>

					<!-- Tasks Section -->
					<div class="tasks-section">
						<div class="tasks-header">
							<h2 class="tasks-title">${this.plugin.settings.language === "ro" ? "Sarcinile dvs." : "Your Tasks"}</h2>
							<div class="task-counter" id="taskCounter">0 ${this.plugin.settings.language === "ro" ? "sarcini" : "tasks"}</div>
						</div>
						<div class="tasks-list" id="tasksList"></div>
						<button class="clear-completed" id="clearCompleted" style="display: none;">
							${this.plugin.settings.language === "ro" ? "\u0218terge finalizate" : "Clear Completed"}
						</button>
					</div>
				</div>

				<!-- Reminders View -->
				<div class="view-container" id="remindersView" style="display: none;">
					<!-- Reminder Input Section -->
					<div class="reminders-section">
						<div class="reminders-header">
							<h2 class="reminders-title">${this.plugin.settings.language === "ro" ? "Amintirile tale" : "Your Reminders"}</h2>
							<div class="reminder-counter" id="reminderCounter">0 ${this.plugin.settings.language === "ro" ? "amintiri" : "reminders"}</div>
						</div>

						<div class="reminder-input-section">
							<input type="text" class="reminder-text-input" id="reminderTextInput" placeholder="${this.getReminderPlaceholder()}">
							
							<div class="datetime-inputs">
								<input type="date" class="reminder-date-input" id="reminderDateInput">
								<input type="time" class="reminder-time-input" id="reminderTimeInput">
								<button class="add-reminder-btn" id="addReminderBtn">${this.plugin.settings.language === "ro" ? "Adaug\u0103 amintire" : "Add Reminder"}</button>
							</div>
						</div>

						<div class="reminders-list" id="remindersList"></div>
					</div>
				</div>

				<!-- Habits View -->
				<div class="view-container" id="habitsView" style="display: none;">
					<div class="habits-section">
						<div class="habits-header">
							<h2 class="habits-title">${this.plugin.settings.language === "ro" ? "Obiceiurile tale" : "Your Habits"}</h2>
							<div class="habit-counter" id="habitCounter">0 ${this.plugin.settings.language === "ro" ? "obiceiuri" : "habits"}</div>
						</div>

						<div class="habit-input-section">
							<div class="habit-input-container">
								<input type="text" class="habit-name-input" id="habitNameInput" placeholder="${this.plugin.settings.language === "ro" ? "Nume obicei (ex: Bea ap\u0103, Cite\u0219te, Sport)" : "Habit name (e.g., Drink water, Read, Exercise)"}">
								<button class="add-habit-btn" id="addHabitBtn">${this.plugin.settings.language === "ro" ? "Adaug\u0103" : "Add"}</button>
							</div>
							<div class="habit-colors" id="habitColors">
								<div class="color-option active" data-color="#4CAF50" style="background: #4CAF50;"></div>
								<div class="color-option" data-color="#2196F3" style="background: #2196F3;"></div>
								<div class="color-option" data-color="#FF9800" style="background: #FF9800;"></div>
								<div class="color-option" data-color="#E91E63" style="background: #E91E63;"></div>
								<div class="color-option" data-color="#9C27B0" style="background: #9C27B0;"></div>
								<div class="color-option" data-color="#00BCD4" style="background: #00BCD4;"></div>
								<div class="color-option custom-color-option" data-color="custom" style="background: transparent; border: 1.5px dashed #aaa; position: relative;">
									<input type="color" id="customHabitColor" style="opacity:0;position:absolute;left:0;top:0;width:100%;height:100%;cursor:pointer;">
									<span style="position:absolute;left:0;top:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:1.2em;pointer-events:none;">+</span>
								</div>
							</div>
						</div>

						<div class="habits-list" id="habitsList"></div>
					</div>
				</div>

				<!-- Analytics View -->
				<div class="view-container" id="analyticsView" style="display: none;">
					<div class="analytics-section">
						<div class="analytics-header">
							<h2 class="analytics-title">${this.plugin.settings.language === "ro" ? "Analiz\u0103 s\u0103pt\u0103m\xE2nal\u0103" : "Weekly Analytics"}</h2>
							<div class="week-selector">
								<button class="week-nav-btn" id="prevWeek">\u2039</button>
								<span class="current-week" id="currentWeek"></span>
								<button class="week-nav-btn" id="nextWeek">\u203A</button>
							</div>
						</div>

						<div class="analytics-cards">
							<!-- Tasks Analytics -->
							<div class="analytics-card">
								<div class="card-header">
									<h3>\u{1F4DD} ${this.plugin.settings.language === "ro" ? "Sarcini" : "Tasks"}</h3>
								</div>
								<div class="card-content">
									<div class="main-stat">
										<span class="stat-number" id="weeklyTasksCompleted">0</span>
										<span class="stat-label">${this.plugin.settings.language === "ro" ? "completate" : "completed"}</span>
									</div>
									<div class="sub-stats">
										<div class="sub-stat">
											<span class="change-indicator" id="tasksChange">+0%</span>
											<span>${this.plugin.settings.language === "ro" ? "vs s\u0103pt\u0103m\xE2na trecut\u0103" : "vs last week"}</span>
										</div>
										<div class="sub-stat">
											<span class="peak-day" id="tasksPeakDay">${this.plugin.settings.language === "ro" ? "Cea mai bun\u0103: -" : "Best day: -"}</span>
										</div>
									</div>
								</div>
							</div>

							<!-- Habits Analytics -->
							<div class="analytics-card">
								<div class="card-header">
									<h3>\u{1F504} ${this.plugin.settings.language === "ro" ? "Obiceiuri" : "Habits"}</h3>
								</div>
								<div class="card-content">
									<div class="main-stat">
										<span class="stat-number" id="weeklyHabitsRate">0%</span>
										<span class="stat-label">${this.plugin.settings.language === "ro" ? "rata de succes" : "success rate"}</span>
									</div>
									<div class="sub-stats">
										<div class="sub-stat">
											<span class="habits-completed" id="habitsCompleted">0.0 ${this.plugin.settings.language === "ro" ? "habit-uri/zi" : "habits/day"}</span>
										</div>
										<div class="sub-stat">
											<span class="streak-count" id="activeStreaks">0</span>
											<span>${this.plugin.settings.language === "ro" ? "streak-uri active" : "active streaks"}</span>
										</div>
									</div>
								</div>
							</div>

							<!-- Pomodoro Analytics -->
							<div class="analytics-card">
								<div class="card-header">
									<h3>\u{1F345} Pomodoro</h3>
								</div>
								<div class="card-content">
									<div class="main-stat">
										<span class="stat-number" id="weeklyPomodoroSessions">0</span>
										<span class="stat-label">${this.plugin.settings.language === "ro" ? "sesiuni" : "sessions"}</span>
									</div>
									<div class="sub-stats">
										<div class="sub-stat">
											<span class="focus-time" id="totalFocusTime">0h 0min</span>
											<span>${this.plugin.settings.language === "ro" ? "timp de focus" : "focus time"}</span>
										</div>
										<div class="sub-stat">
											<span class="avg-session" id="avgSessionLength">0min</span>
											<span>${this.plugin.settings.language === "ro" ? "sesiune medie" : "avg session"}</span>
										</div>
									</div>
								</div>
							</div>

							<!-- Productivity Score -->
							<div class="analytics-card productivity-card">
								<div class="card-header">
									<h3>\u26A1 ${this.plugin.settings.language === "ro" ? "Scorul s\u0103pt\u0103m\xE2nii" : "Weekly Score"}</h3>
								</div>
								<div class="card-content">
									<div class="productivity-score">
										<div class="score-circle">
											<svg width="120" height="120">
												<circle cx="60" cy="60" r="50" class="score-bg"></circle>
												<circle cx="60" cy="60" r="50" class="score-progress" id="scoreProgress"></circle>
											</svg>
											<div class="score-text">
												<span class="score-number" id="productivityScore">0</span>
												<span class="score-max">/100</span>
											</div>
										</div>
										<div class="score-breakdown">
											<div class="breakdown-item">
												<span class="breakdown-label">${this.plugin.settings.language === "ro" ? "Sarcini" : "Tasks"}</span>
												<span class="breakdown-value" id="tasksScore">0/30</span>
											</div>
											<div class="breakdown-item">
												<span class="breakdown-label">${this.plugin.settings.language === "ro" ? "Obiceiuri" : "Habits"}</span>
												<span class="breakdown-value" id="habitsScore">0/40</span>
											</div>
											<div class="breakdown-item">
												<span class="breakdown-label">Focus</span>
												<span class="breakdown-value" id="focusScore">0/30</span>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>

						<!-- Daily Breakdown -->
						<div class="daily-breakdown">
							<h3>${this.plugin.settings.language === "ro" ? "Activitatea zilnic\u0103" : "Daily Activity"}</h3>
							<div class="daily-chart" id="dailyChart"></div>
						</div>
					</div>
				</div>

				<!-- Calendar View -->
				<div class="view-container" id="calendarView" style="display: none;">
					<div class="calendar-section">
						<div class="calendar-header">
							<button class="calendar-nav-btn" id="prevMonth">\u2039</button>
							<h2 class="calendar-title" id="calendarTitle"></h2>
							<button class="calendar-nav-btn" id="nextMonth">\u203A</button>
						</div>
						<div class="calendar-grid" id="calendarGrid"></div>
						<div class="calendar-legend">
													<div class="legend-item">
							<span class="legend-dot task-dot"></span>
							<span>${this.plugin.settings.language === "ro" ? "Sarcini" : "Tasks"}</span>
						</div>
							<div class="legend-item">
								<span class="legend-dot reminder-dot"></span>
								<span>${this.plugin.settings.language === "ro" ? "Amintiri" : "Reminders"}</span>
							</div>
						</div>
					</div>
				</div>

				<!-- Pomodoro View -->
				<div class="view-container" id="pomodoroView" style="display: none;">
					<div class="pomodoro-section">
						<div class="pomodoro-header">
							<h2 class="pomodoro-title">${this.plugin.settings.language === "ro" ? "Timer Pomodoro" : "Pomodoro Timer"}</h2>
							<div class="pomodoro-mode" id="pomodoroMode">${this.plugin.settings.language === "ro" ? "Timp de lucru" : "Work Time"}</div>
						</div>

						<div class="pomodoro-timer">
							<div class="timer-circle">
								<svg class="progress-ring" width="200" height="200">
									<circle cx="100" cy="100" r="90" class="progress-ring-bg"></circle>
									<circle cx="100" cy="100" r="90" class="progress-ring-fill" id="progressRing"></circle>
								</svg>
								<div class="timer-time" id="timerDisplay">25:00</div>
							</div>
						</div>

						<div class="pomodoro-controls">
							<button class="pomodoro-btn start-pause" id="startPauseBtn">
								<span id="startPauseIcon">\u25B6\uFE0F</span>
								<span id="startPauseText">${this.plugin.settings.language === "ro" ? "\xCEnceput" : "Start"}</span>
							</button>
							<button class="pomodoro-btn reset" id="resetBtn">
								<span>\u{1F504}</span> ${this.plugin.settings.language === "ro" ? "Reset" : "Reset"}
							</button>
							<button class="pomodoro-btn skip" id="skipBtn">
								<span>\u23ED\uFE0F</span> ${this.plugin.settings.language === "ro" ? "S\u0103rit" : "Skip"}
							</button>
						</div>

						<div class="pomodoro-stats">
							<div class="stat-item">
								<span class="stat-label">${this.plugin.settings.language === "ro" ? "Sesiuni complete" : "Completed Sessions"}</span>
								<span class="stat-value" id="completedSessions">0</span>
							</div>
							<div class="stat-item">
								<span class="stat-label">${this.plugin.settings.language === "ro" ? "Ciclul curent" : "Current Cycle"}</span>
								<span class="stat-value" id="currentCycle">1</span>
							</div>
						</div>

										<div class="pomodoro-presets">
					<h3 class="presets-title">${this.plugin.settings.language === "ro" ? "Preset\u0103ri" : "Presets"}</h3>
					<div class="presets-grid">
						<div class="preset-btn" data-preset="classic">
							<div class="preset-name">${this.plugin.settings.language === "ro" ? "Clasic" : "Classic"}</div>
							<div class="preset-details">25/5/15</div>
						</div>
						<div class="preset-btn" data-preset="extended">
							<div class="preset-name">${this.plugin.settings.language === "ro" ? "Extins" : "Extended"}</div>
							<div class="preset-details">45/10/30</div>
						</div>
						<div class="preset-btn" data-preset="short">
							<div class="preset-name">${this.plugin.settings.language === "ro" ? "Scurt" : "Short"}</div>
							<div class="preset-details">15/3/10</div>
						</div>
						<div class="preset-btn" data-preset="custom">
							<div class="preset-name">${this.plugin.settings.language === "ro" ? "Personalizat" : "Custom"}</div>
							<div class="preset-details">-/-/-</div>
						</div>
					</div>
				</div>

				<div class="pomodoro-settings-quick">
					<h3>${this.plugin.settings.language === "ro" ? "Set\u0103ri rapide" : "Quick Settings"}</h3>
					<div class="quick-settings-grid">
						<div class="setting-item">
							<label>${this.plugin.settings.language === "ro" ? "Timp lucru (min)" : "Work Time (min)"}</label>
							<input type="number" id="workTimeInput" min="1" max="60" value="${this.plugin.settings.pomodoroWorkTime}">
						</div>
						<div class="setting-item">
							<label>${this.plugin.settings.language === "ro" ? "Pauz\u0103 scurt\u0103 (min)" : "Short Break (min)"}</label>
							<input type="number" id="breakTimeInput" min="1" max="30" value="${this.plugin.settings.pomodoroBreakTime}">
						</div>
						<div class="setting-item">
							<label>${this.plugin.settings.language === "ro" ? "Pauz\u0103 lung\u0103 (min)" : "Long Break (min)"}</label>
							<input type="number" id="longBreakTimeInput" min="1" max="60" value="${this.plugin.settings.pomodoroLongBreakTime}">
						</div>
					</div>
				</div>
					</div>
				</div>
			</div>
		`;
    this.setupEventListeners();
    this.renderCurrentView();
  }
  generateNavigationTabs() {
    const isRomanian = this.plugin.settings.language === "ro";
    const tabs = [];
    let firstTab = true;
    const enabledTabs = [
      this.plugin.settings.enableTasks,
      this.plugin.settings.enableReminders,
      this.plugin.settings.enableHabits,
      this.plugin.settings.enableAnalytics,
      this.plugin.settings.enableCalendar,
      this.plugin.settings.enablePomodoro
    ].filter(Boolean).length;
    if (this.plugin.settings.enableTasks) {
      tabs.push(`
				<button class="nav-tab ${firstTab ? "active" : ""} nav-tab-tasks" data-view="tasks">
					<span>\u{1F4DD}</span> ${isRomanian ? "Sarcini" : "Tasks"}
				</button>
			`);
      if (firstTab)
        firstTab = false;
    }
    if (this.plugin.settings.enableReminders) {
      tabs.push(`
				<button class="nav-tab ${firstTab ? "active" : ""} nav-tab-reminders" data-view="reminders">
					<span>\u23F0</span> ${isRomanian ? "Amintiri" : "Reminders"}
				</button>
			`);
      if (firstTab)
        firstTab = false;
    }
    if (this.plugin.settings.enableHabits) {
      tabs.push(`
				<button class="nav-tab ${firstTab ? "active" : ""} nav-tab-habits" data-view="habits">
					<span>\u{1F504}</span> ${isRomanian ? "Obiceiuri" : "Habits"}
				</button>
			`);
      if (firstTab)
        firstTab = false;
    }
    if (this.plugin.settings.enableAnalytics) {
      tabs.push(`
				<button class="nav-tab ${firstTab ? "active" : ""} nav-tab-analytics" data-view="analytics">
					<span>\u{1F4CA}</span> Analytics
				</button>
			`);
      if (firstTab)
        firstTab = false;
    }
    if (this.plugin.settings.enableCalendar) {
      tabs.push(`
				<button class="nav-tab ${firstTab ? "active" : ""} nav-tab-calendar" data-view="calendar">
					<span>\u{1F4C5}</span> ${isRomanian ? "Calendar" : "Calendar"}
				</button>
			`);
      if (firstTab)
        firstTab = false;
    }
    if (this.plugin.settings.enablePomodoro) {
      tabs.push(`
				<button class="nav-tab ${firstTab ? "active" : ""} nav-tab-pomodoro" data-view="pomodoro">
					<span>\u{1F345}</span> Pomodoro
				</button>
			`);
      if (firstTab)
        firstTab = false;
    }
    if (tabs.length === 0) {
      tabs.push(`
				<button class="nav-tab active nav-tab-tasks" data-view="tasks">
					<span>\u{1F4DD}</span> ${isRomanian ? "Sarcini" : "Tasks"}
				</button>
			`);
    }
    const gridCSS = this.generateDynamicGridCSS(enabledTabs);
    return `
			<style id="dynamic-nav-grid">
				${gridCSS}
			</style>
			${tabs.join("")}
		`;
  }
  generateDynamicGridCSS(enabledTabs) {
    if (enabledTabs <= 3) {
      return `
				.mindfuldo-content .navigation-tabs {
					grid-template-columns: repeat(${enabledTabs}, 1fr);
					grid-template-rows: 1fr;
				}
			`;
    } else if (enabledTabs === 4) {
      return `
				.mindfuldo-content .navigation-tabs {
					grid-template-columns: repeat(2, 1fr);
					grid-template-rows: repeat(2, 1fr);
				}
			`;
    } else if (enabledTabs === 5) {
      return `
				.mindfuldo-content .navigation-tabs {
					grid-template-columns: repeat(3, 1fr);
					grid-template-rows: repeat(2, 1fr);
				}
				.mindfuldo-content .nav-tab:nth-child(4),
				.mindfuldo-content .nav-tab:nth-child(5) {
					grid-column: span 1.5;
				}
			`;
    } else {
      return `
				.mindfuldo-content .navigation-tabs {
					grid-template-columns: repeat(3, 1fr);
					grid-template-rows: repeat(2, 1fr);
				}
			`;
    }
  }
  setupEventListeners() {
    const addBtn = this.containerEl.querySelector("#addBtn");
    const taskInput = this.containerEl.querySelector("#taskInput");
    const clearCompleted = this.containerEl.querySelector("#clearCompleted");
    const addReminderBtn = this.containerEl.querySelector("#addReminderBtn");
    const reminderTextInput = this.containerEl.querySelector("#reminderTextInput");
    const addHabitBtn = this.containerEl.querySelector("#addHabitBtn");
    const habitNameInput = this.containerEl.querySelector("#habitNameInput");
    addBtn == null ? void 0 : addBtn.addEventListener("click", () => this.addTask());
    taskInput == null ? void 0 : taskInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter")
        this.addTask();
    });
    clearCompleted == null ? void 0 : clearCompleted.addEventListener("click", () => this.clearCompleted());
    addReminderBtn == null ? void 0 : addReminderBtn.addEventListener("click", () => this.addReminder());
    reminderTextInput == null ? void 0 : reminderTextInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter")
        this.addReminder();
    });
    addHabitBtn == null ? void 0 : addHabitBtn.addEventListener("click", () => __async(this, null, function* () {
      return yield this.addHabit();
    }));
    habitNameInput == null ? void 0 : habitNameInput.addEventListener("keypress", (e) => __async(this, null, function* () {
      if (e.key === "Enter")
        yield this.addHabit();
    }));
    this.containerEl.querySelectorAll(".color-option").forEach((colorBtn) => {
      colorBtn.addEventListener("click", (e) => {
        this.containerEl.querySelectorAll(".color-option").forEach((btn) => btn.classList.remove("active"));
        e.currentTarget.classList.add("active");
      });
    });
    this.containerEl.querySelectorAll(".category-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const category = e.currentTarget.getAttribute("data-category");
        if (category)
          this.setCategory(category);
      });
    });
    this.containerEl.querySelectorAll(".nav-tab").forEach((tab) => {
      tab.addEventListener("click", (e) => {
        const view = e.currentTarget.getAttribute("data-view");
        if (view) {
          this.currentView = view;
          this.containerEl.querySelectorAll(".nav-tab").forEach((t) => t.classList.remove("active"));
          e.currentTarget.classList.add("active");
          this.containerEl.querySelectorAll(".view-container").forEach((container) => {
            container.style.display = "none";
          });
          const targetView = this.containerEl.querySelector(`#${view}View`);
          if (targetView) {
            targetView.style.display = "block";
          }
          this.renderCurrentView();
        }
      });
    });
    const startPauseBtn = this.containerEl.querySelector("#startPauseBtn");
    const resetBtn = this.containerEl.querySelector("#resetBtn");
    const skipBtn = this.containerEl.querySelector("#skipBtn");
    const workTimeInput = this.containerEl.querySelector("#workTimeInput");
    const breakTimeInput = this.containerEl.querySelector("#breakTimeInput");
    const longBreakTimeInput = this.containerEl.querySelector("#longBreakTimeInput");
    startPauseBtn == null ? void 0 : startPauseBtn.addEventListener("click", () => this.togglePomodoroTimer());
    resetBtn == null ? void 0 : resetBtn.addEventListener("click", () => this.resetPomodoroTimer());
    skipBtn == null ? void 0 : skipBtn.addEventListener("click", () => this.skipPomodoroSession());
    workTimeInput == null ? void 0 : workTimeInput.addEventListener("change", () => {
      this.plugin.settings.pomodoroWorkTime = parseInt(workTimeInput.value);
      this.savePomodoroSettingsQuietly();
      if (!this.pomodoroIsRunning && this.pomodoroMode === "work") {
        this.initializePomodoroTimer();
      }
      this.updateActivePreset();
    });
    breakTimeInput == null ? void 0 : breakTimeInput.addEventListener("change", () => {
      this.plugin.settings.pomodoroBreakTime = parseInt(breakTimeInput.value);
      this.savePomodoroSettingsQuietly();
      if (!this.pomodoroIsRunning && this.pomodoroMode === "break") {
        this.initializePomodoroTimer();
      }
      this.updateActivePreset();
    });
    longBreakTimeInput == null ? void 0 : longBreakTimeInput.addEventListener("change", () => {
      this.plugin.settings.pomodoroLongBreakTime = parseInt(longBreakTimeInput.value);
      this.savePomodoroSettingsQuietly();
      if (!this.pomodoroIsRunning && this.pomodoroMode === "longBreak") {
        this.initializePomodoroTimer();
      }
      this.updateActivePreset();
    });
    this.containerEl.querySelectorAll(".preset-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const preset = e.currentTarget.getAttribute("data-preset");
        if (preset) {
          this.applyPomodoroPreset(preset);
        }
      });
    });
    const prevWeekBtn = this.containerEl.querySelector("#prevWeek");
    const nextWeekBtn = this.containerEl.querySelector("#nextWeek");
    prevWeekBtn == null ? void 0 : prevWeekBtn.addEventListener("click", () => {
      this.navigateToPreviousWeek();
    });
    nextWeekBtn == null ? void 0 : nextWeekBtn.addEventListener("click", () => {
      this.navigateToNextWeek();
    });
    const customColorInput = this.containerEl.querySelector("#customHabitColor");
    const customColorOption = this.containerEl.querySelector(".custom-color-option");
    if (customColorInput && customColorOption) {
      customColorInput.addEventListener("input", (e) => {
        const color = e.target.value;
        customColorOption.setAttribute("data-color", color);
        customColorOption.style.background = color;
        this.containerEl.querySelectorAll(".color-option").forEach((btn) => btn.classList.remove("active"));
        customColorOption.classList.add("active");
      });
      customColorOption.addEventListener("click", () => {
        customColorInput.click();
      });
    }
  }
  updateDateTime() {
    const now = new Date();
    const hour = now.getHours();
    let greeting = "";
    const userName = this.plugin.settings.userName;
    const isRomanian = this.plugin.settings.language === "ro";
    if (hour >= 5 && hour < 12) {
      greeting = isRomanian ? `Bun\u0103 diminea\u021Ba, ${userName}!` : `Good morning, ${userName}!`;
    } else if (hour >= 12 && hour < 17) {
      greeting = isRomanian ? `Bun\u0103 ziua, ${userName}!` : `Good afternoon, ${userName}!`;
    } else {
      greeting = isRomanian ? `Bun\u0103 seara, ${userName}!` : `Good evening, ${userName}!`;
    }
    const greetingEl = this.containerEl.querySelector("#greeting");
    if (greetingEl)
      greetingEl.textContent = greeting;
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    };
    const locale = isRomanian ? "ro-RO" : "en-US";
    const timeString = now.toLocaleDateString(locale, options);
    const timeEl = this.containerEl.querySelector("#timeInfo");
    if (timeEl)
      timeEl.textContent = timeString;
  }
  addTask() {
    return __async(this, null, function* () {
      const taskInput = this.containerEl.querySelector("#taskInput");
      const taskText = taskInput.value.trim();
      if (taskText === "")
        return;
      const task = {
        id: Date.now(),
        text: taskText,
        completed: false,
        category: this.currentCategory === "toate" ? "work" : this.currentCategory,
        createdAt: this.getLocalDateString(new Date()),
        order: 1
        // va fi primul
      };
      this.tasks.unshift(task);
      this.normalizeOrderValues();
      yield this.saveData();
      taskInput.value = "";
      taskInput.style.transform = "scale(0.99)";
      taskInput.style.background = "rgba(76, 175, 80, 0.15)";
      taskInput.style.borderColor = "#66bb6a";
      setTimeout(() => {
        taskInput.style.transform = "scale(1)";
        taskInput.style.background = "";
        taskInput.style.borderColor = "";
      }, 800);
      setTimeout(() => {
        this.renderCurrentView();
      }, 100);
    });
  }
  setCategory(category) {
    this.currentCategory = category;
    this.containerEl.querySelectorAll(".category-btn").forEach((btn) => {
      btn.classList.remove("active");
    });
    const activeBtn = this.containerEl.querySelector(`[data-category="${category}"]`);
    activeBtn == null ? void 0 : activeBtn.classList.add("active");
    setTimeout(() => {
      this.renderCurrentView();
    }, 150);
  }
  toggleTask(id) {
    const taskIndex = this.tasks.findIndex((task) => task.id === id);
    if (taskIndex !== -1) {
      this.tasks[taskIndex].completed = !this.tasks[taskIndex].completed;
      if (this.tasks[taskIndex].completed) {
        this.tasks[taskIndex].completedAt = this.getLocalDateTimeString(new Date());
      } else {
        delete this.tasks[taskIndex].completedAt;
      }
      this.saveData();
      if (this.currentView === "tasks") {
        this.renderTasks();
      }
    }
  }
  deleteTask(id) {
    this.tasks = this.tasks.filter((task) => task.id !== id);
    this.saveData();
    this.renderTasks();
  }
  confirmDeleteTask(id) {
    const task = this.tasks.find((t) => t.id === id);
    if (!task)
      return;
    const isRomanian = this.plugin.settings.language === "ro";
    const existingModal = document.querySelector(".mindfuldo-confirm-modal");
    if (existingModal) {
      document.body.removeChild(existingModal);
    }
    const modal = document.createElement("div");
    modal.className = "mindfuldo-confirm-modal";
    modal.innerHTML = `
			<div class="confirm-modal-content">
				<h3>${isRomanian ? "Confirmare \u0219tergere" : "Confirm Delete"}</h3>
				<div class="confirm-message">
					<p>${isRomanian ? "Sigur dori\u021Bi s\u0103 \u0219terge\u021Bi sarcina:" : "Are you sure you want to delete the task:"}</p>
					<p class="task-text">"${task.text}"</p>
				</div>
				<div class="confirm-actions">
					<button id="confirmDelete" class="delete-btn">${isRomanian ? "\u0218terge" : "Delete"}</button>
					<button id="cancelDelete" class="cancel-btn">${isRomanian ? "Anuleaz\u0103" : "Cancel"}</button>
				</div>
			</div>
		`;
    document.body.appendChild(modal);
    const confirmBtn = modal.querySelector("#confirmDelete");
    const cancelBtn = modal.querySelector("#cancelDelete");
    const closeModal = () => {
      if (document.body.contains(modal)) {
        document.body.removeChild(modal);
      }
    };
    const deleteTask = () => {
      this.deleteTask(id);
      closeModal();
      new import_obsidian.Notice(isRomanian ? "Sarcina a fost \u0219tears\u0103!" : "Task deleted successfully!");
    };
    confirmBtn == null ? void 0 : confirmBtn.addEventListener("click", deleteTask);
    cancelBtn == null ? void 0 : cancelBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
    modal.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeModal();
      }
    });
    setTimeout(() => confirmBtn == null ? void 0 : confirmBtn.focus(), 100);
  }
  editTask(id) {
    const task = this.tasks.find((t) => t.id === id);
    if (!task)
      return;
    const isRomanian = this.plugin.settings.language === "ro";
    const existingModal = document.querySelector(".mindfuldo-edit-modal");
    if (existingModal) {
      document.body.removeChild(existingModal);
    }
    const modal = document.createElement("div");
    modal.className = "mindfuldo-edit-modal";
    modal.innerHTML = `
			<div class="edit-modal-content">
				<h3>${isRomanian ? "Editeaz\u0103 sarcina" : "Edit Task"}</h3>
				<div class="edit-form">
					<div class="form-group">
						<label>${isRomanian ? "Text:" : "Text:"}</label>
						<input type="text" id="editTaskText" value="${task.text}" placeholder="${isRomanian ? "Introduce\u021Bi textul sarcinii" : "Enter task text"}">
					</div>
					<div class="form-group">
						<label>${isRomanian ? "Categoria:" : "Category:"}</label>
						<select id="editTaskCategory">
							<option value="work" ${task.category === "work" ? "selected" : ""}>${this.getCategoryName("work")}</option>
							<option value="personal" ${task.category === "personal" ? "selected" : ""}>${this.getCategoryName("personal")}</option>
							<option value="health" ${task.category === "health" ? "selected" : ""}>${this.getCategoryName("health")}</option>
							<option value="learning" ${task.category === "learning" ? "selected" : ""}>${this.getCategoryName("learning")}</option>
							<option value="hobby" ${task.category === "hobby" ? "selected" : ""}>${this.getCategoryName("hobby")}</option>
						</select>
					</div>
					<div class="form-actions">
						<button id="saveTaskEdit" class="save-btn">${isRomanian ? "Salveaz\u0103" : "Save"}</button>
						<button id="cancelTaskEdit" class="cancel-btn">${isRomanian ? "Anuleaz\u0103" : "Cancel"}</button>
					</div>
				</div>
			</div>
		`;
    document.body.appendChild(modal);
    const saveBtn = modal.querySelector("#saveTaskEdit");
    const cancelBtn = modal.querySelector("#cancelTaskEdit");
    const textInput = modal.querySelector("#editTaskText");
    const categorySelect = modal.querySelector("#editTaskCategory");
    const closeModal = () => {
      if (document.body.contains(modal)) {
        document.body.removeChild(modal);
      }
    };
    const saveChanges = () => __async(this, null, function* () {
      const newText = textInput.value.trim();
      const newCategory = categorySelect.value;
      if (!newText) {
        new import_obsidian.Notice(isRomanian ? "Textul nu poate fi gol!" : "Text cannot be empty!");
        textInput.focus();
        return;
      }
      try {
        task.text = newText;
        task.category = newCategory;
        yield this.saveData();
        if (this.currentView === "tasks") {
          this.renderTasks();
        }
        new import_obsidian.Notice(isRomanian ? "Sarcina a fost actualizat\u0103!" : "Task updated successfully!");
        closeModal();
      } catch (error) {
        console.error("Error saving task:", error);
        new import_obsidian.Notice(isRomanian ? "Eroare la salvarea sarcinii!" : "Error saving task!");
      }
    });
    saveBtn == null ? void 0 : saveBtn.addEventListener("click", saveChanges);
    cancelBtn == null ? void 0 : cancelBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
    textInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        saveChanges();
      }
    });
    modal.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeModal();
      }
    });
    setTimeout(() => textInput.focus(), 100);
  }
  clearCompleted() {
    this.tasks = this.tasks.filter((task) => !task.completed);
    this.saveData();
    setTimeout(() => {
      this.renderCurrentView();
    }, 50);
  }
  renderCurrentView() {
    const tasksView = this.containerEl.querySelector("#tasksView");
    const remindersView = this.containerEl.querySelector("#remindersView");
    const habitsView = this.containerEl.querySelector("#habitsView");
    const analyticsView = this.containerEl.querySelector("#analyticsView");
    const calendarView = this.containerEl.querySelector("#calendarView");
    const pomodoroView = this.containerEl.querySelector("#pomodoroView");
    if (this.currentView === "tasks") {
      tasksView == null ? void 0 : tasksView.classList.add("active");
      remindersView == null ? void 0 : remindersView.classList.remove("active");
      habitsView == null ? void 0 : habitsView.classList.remove("active");
      analyticsView == null ? void 0 : analyticsView.classList.remove("active");
      calendarView == null ? void 0 : calendarView.classList.remove("active");
      pomodoroView == null ? void 0 : pomodoroView.classList.remove("active");
      this.renderTasks();
    } else if (this.currentView === "reminders") {
      tasksView == null ? void 0 : tasksView.classList.remove("active");
      remindersView == null ? void 0 : remindersView.classList.add("active");
      habitsView == null ? void 0 : habitsView.classList.remove("active");
      analyticsView == null ? void 0 : analyticsView.classList.remove("active");
      calendarView == null ? void 0 : calendarView.classList.remove("active");
      pomodoroView == null ? void 0 : pomodoroView.classList.remove("active");
      this.renderReminders();
    } else if (this.currentView === "habits") {
      tasksView == null ? void 0 : tasksView.classList.remove("active");
      remindersView == null ? void 0 : remindersView.classList.remove("active");
      habitsView == null ? void 0 : habitsView.classList.add("active");
      analyticsView == null ? void 0 : analyticsView.classList.remove("active");
      calendarView == null ? void 0 : calendarView.classList.remove("active");
      pomodoroView == null ? void 0 : pomodoroView.classList.remove("active");
      this.renderHabits();
    } else if (this.currentView === "analytics") {
      tasksView == null ? void 0 : tasksView.classList.remove("active");
      remindersView == null ? void 0 : remindersView.classList.remove("active");
      habitsView == null ? void 0 : habitsView.classList.remove("active");
      analyticsView == null ? void 0 : analyticsView.classList.add("active");
      calendarView == null ? void 0 : calendarView.classList.remove("active");
      pomodoroView == null ? void 0 : pomodoroView.classList.remove("active");
      this.renderAnalytics();
    } else if (this.currentView === "calendar") {
      tasksView == null ? void 0 : tasksView.classList.remove("active");
      remindersView == null ? void 0 : remindersView.classList.remove("active");
      habitsView == null ? void 0 : habitsView.classList.remove("active");
      analyticsView == null ? void 0 : analyticsView.classList.remove("active");
      calendarView == null ? void 0 : calendarView.classList.add("active");
      pomodoroView == null ? void 0 : pomodoroView.classList.remove("active");
      this.renderCalendar();
    } else if (this.currentView === "pomodoro") {
      tasksView == null ? void 0 : tasksView.classList.remove("active");
      remindersView == null ? void 0 : remindersView.classList.remove("active");
      habitsView == null ? void 0 : habitsView.classList.remove("active");
      analyticsView == null ? void 0 : analyticsView.classList.remove("active");
      calendarView == null ? void 0 : calendarView.classList.remove("active");
      pomodoroView == null ? void 0 : pomodoroView.classList.add("active");
      this.renderPomodoro();
    }
  }
  renderTasks() {
    const tasksList = this.containerEl.querySelector("#tasksList");
    const taskCounter = this.containerEl.querySelector("#taskCounter");
    const clearCompletedBtn = this.containerEl.querySelector("#clearCompleted");
    if (!tasksList || !taskCounter)
      return;
    let filteredTasks = this.tasks;
    if (this.currentCategory !== "toate") {
      filteredTasks = this.tasks.filter((task) => task.category === this.currentCategory);
    }
    filteredTasks.sort((a, b) => {
      if (a.completed && !b.completed)
        return 1;
      if (!a.completed && b.completed)
        return -1;
      return (a.order || 0) - (b.order || 0);
    });
    const completedTasks = this.tasks.filter((task) => task.completed);
    const activeTasks = this.tasks.filter((task) => !task.completed);
    const isRomanian = this.plugin.settings.language === "ro";
    if (isRomanian) {
      taskCounter.textContent = `${activeTasks.length} ${activeTasks.length !== 1 ? "sarcini" : "sarcin\u0103"}`;
    } else {
      taskCounter.textContent = `${activeTasks.length} ${activeTasks.length !== 1 ? "tasks" : "task"}`;
    }
    clearCompletedBtn.style.display = completedTasks.length > 0 ? "block" : "none";
    if (filteredTasks.length === 0) {
      tasksList.innerHTML = "";
      return;
    }
    tasksList.innerHTML = filteredTasks.map((task, index) => `
			<div class="task-item ${task.completed ? "completed" : ""}" data-task-id="${task.id}">
				<div class="task-reorder">
					<button class="task-move-up" data-task-id="${task.id}" title="${isRomanian ? "Mut\u0103 \xEEn sus" : "Move up"}" ${index === 0 ? "disabled" : ""}>\u2191</button>
					<button class="task-move-down" data-task-id="${task.id}" title="${isRomanian ? "Mut\u0103 \xEEn jos" : "Move down"}" ${index === filteredTasks.length - 1 ? "disabled" : ""}>\u2193</button>
				</div>
				<div class="task-checkbox ${task.completed ? "checked" : ""}" data-task-id="${task.id}"></div>
				<div class="task-text" data-task-id="${task.id}">${task.text}</div>
				<div class="task-category ${task.category}" data-task-id="${task.id}">${this.getCategoryName(task.category)}</div>
				<div class="task-actions">
					<button class="task-edit" data-task-id="${task.id}" title="${isRomanian ? "Editeaz\u0103" : "Edit"}">\u270F\uFE0F</button>
					<button class="task-delete" data-task-id="${task.id}" title="${isRomanian ? "\u0218terge" : "Delete"}">\xD7</button>
				</div>
			</div>
		`).join("");
    tasksList.querySelectorAll(".task-checkbox").forEach((checkbox) => {
      checkbox.addEventListener("click", (e) => {
        const taskId = parseInt(e.target.getAttribute("data-task-id") || "0");
        this.toggleTask(taskId);
      });
    });
    tasksList.querySelectorAll(".task-edit").forEach((editBtn) => {
      editBtn.addEventListener("click", (e) => {
        const taskId = parseInt(e.target.getAttribute("data-task-id") || "0");
        this.editTask(taskId);
      });
    });
    tasksList.querySelectorAll(".task-delete").forEach((deleteBtn) => {
      deleteBtn.addEventListener("click", (e) => {
        const taskId = parseInt(e.target.getAttribute("data-task-id") || "0");
        this.confirmDeleteTask(taskId);
      });
    });
    this.setupTasksReordering();
  }
  renderTasksWithoutDragSetup() {
    const tasksList = this.containerEl.querySelector("#tasksList");
    const taskCounter = this.containerEl.querySelector("#taskCounter");
    const clearCompletedBtn = this.containerEl.querySelector("#clearCompleted");
    if (!tasksList || !taskCounter)
      return;
    let filteredTasks = this.tasks;
    if (this.currentCategory !== "toate") {
      filteredTasks = this.tasks.filter((task) => task.category === this.currentCategory);
    }
    filteredTasks.sort((a, b) => {
      if (a.completed && !b.completed)
        return 1;
      if (!a.completed && b.completed)
        return -1;
      return (a.order || 0) - (b.order || 0);
    });
    const completedTasks = this.tasks.filter((task) => task.completed);
    const activeTasks = this.tasks.filter((task) => !task.completed);
    const isRomanian = this.plugin.settings.language === "ro";
    if (isRomanian) {
      taskCounter.textContent = `${activeTasks.length} ${activeTasks.length !== 1 ? "sarcini" : "sarcin\u0103"}`;
    } else {
      taskCounter.textContent = `${activeTasks.length} ${activeTasks.length !== 1 ? "tasks" : "task"}`;
    }
    clearCompletedBtn.style.display = completedTasks.length > 0 ? "block" : "none";
    if (filteredTasks.length === 0) {
      tasksList.innerHTML = "";
      return;
    }
    tasksList.innerHTML = filteredTasks.map((task, index) => {
      let reorderableGroup = this.tasks.filter((t) => t.completed === task.completed);
      if (this.currentCategory !== "toate") {
        reorderableGroup = reorderableGroup.filter((t) => t.category === this.currentCategory);
      }
      reorderableGroup.sort((a, b) => (a.order || 0) - (b.order || 0));
      const reorderableIndex = reorderableGroup.findIndex((t) => t.id === task.id);
      const canMoveUp = reorderableIndex > 0;
      const canMoveDown = reorderableIndex < reorderableGroup.length - 1;
      return `
				<div class="task-item ${task.completed ? "completed" : ""}" data-task-id="${task.id}">
					<div class="task-reorder">
						<button class="task-move-up" data-task-id="${task.id}" title="${isRomanian ? "Mut\u0103 \xEEn sus" : "Move up"}" ${!canMoveUp ? "disabled" : ""}>\u2191</button>
						<button class="task-move-down" data-task-id="${task.id}" title="${isRomanian ? "Mut\u0103 \xEEn jos" : "Move down"}" ${!canMoveDown ? "disabled" : ""}>\u2193</button>
					</div>
					<div class="task-checkbox ${task.completed ? "checked" : ""}" data-task-id="${task.id}"></div>
					<div class="task-text" data-task-id="${task.id}">${task.text}</div>
					<div class="task-category ${task.category}" data-task-id="${task.id}">${this.getCategoryName(task.category)}</div>
					<div class="task-actions">
						<button class="task-edit" data-task-id="${task.id}" title="${isRomanian ? "Editeaz\u0103" : "Edit"}">\u270F\uFE0F</button>
						<button class="task-delete" data-task-id="${task.id}" title="${isRomanian ? "\u0218terge" : "Delete"}">\xD7</button>
					</div>
				</div>
			`;
    }).join("");
    tasksList.querySelectorAll(".task-checkbox").forEach((checkbox) => {
      checkbox.addEventListener("click", (e) => {
        const taskId = parseInt(e.target.getAttribute("data-task-id") || "0");
        this.toggleTask(taskId);
      });
    });
    tasksList.querySelectorAll(".task-edit").forEach((editBtn) => {
      editBtn.addEventListener("click", (e) => {
        const taskId = parseInt(e.target.getAttribute("data-task-id") || "0");
        this.editTask(taskId);
      });
    });
    tasksList.querySelectorAll(".task-delete").forEach((deleteBtn) => {
      deleteBtn.addEventListener("click", (e) => {
        const taskId = parseInt(e.target.getAttribute("data-task-id") || "0");
        this.confirmDeleteTask(taskId);
      });
    });
    this.setupTasksReordering();
  }
  setupTasksReordering() {
    const tasksList = this.containerEl.querySelector("#tasksList");
    if (!tasksList)
      return;
    tasksList.querySelectorAll(".task-move-up").forEach((button) => {
      button.addEventListener("click", (e) => __async(this, null, function* () {
        const taskId = parseInt(e.target.getAttribute("data-task-id") || "0");
        yield this.moveTaskUp(taskId);
      }));
    });
    tasksList.querySelectorAll(".task-move-down").forEach((button) => {
      button.addEventListener("click", (e) => __async(this, null, function* () {
        const taskId = parseInt(e.target.getAttribute("data-task-id") || "0");
        yield this.moveTaskDown(taskId);
      }));
    });
  }
  moveTaskUp(taskId) {
    return __async(this, null, function* () {
      const currentTask = this.tasks.find((task) => task.id === taskId);
      if (!currentTask)
        return;
      let reorderableTasks = this.tasks.filter((task) => task.completed === currentTask.completed);
      if (this.currentCategory !== "toate") {
        reorderableTasks = reorderableTasks.filter((task) => task.category === this.currentCategory);
      }
      reorderableTasks.sort((a, b) => (a.order || 0) - (b.order || 0));
      const currentIndex = reorderableTasks.findIndex((task) => task.id === taskId);
      if (currentIndex <= 0)
        return;
      const previousTask = reorderableTasks[currentIndex - 1];
      const tempOrder = currentTask.order;
      currentTask.order = previousTask.order;
      previousTask.order = tempOrder;
      this.normalizeOrderValues();
      yield this.saveData();
      this.renderTasksWithoutDragSetup();
    });
  }
  moveTaskDown(taskId) {
    return __async(this, null, function* () {
      const currentTask = this.tasks.find((task) => task.id === taskId);
      if (!currentTask)
        return;
      let reorderableTasks = this.tasks.filter((task) => task.completed === currentTask.completed);
      if (this.currentCategory !== "toate") {
        reorderableTasks = reorderableTasks.filter((task) => task.category === this.currentCategory);
      }
      reorderableTasks.sort((a, b) => (a.order || 0) - (b.order || 0));
      const currentIndex = reorderableTasks.findIndex((task) => task.id === taskId);
      if (currentIndex >= reorderableTasks.length - 1)
        return;
      const nextTask = reorderableTasks[currentIndex + 1];
      const tempOrder = currentTask.order;
      currentTask.order = nextTask.order;
      nextTask.order = tempOrder;
      this.normalizeOrderValues();
      yield this.saveData();
      this.renderTasksWithoutDragSetup();
    });
  }
  reorderTasks(draggedId, targetId, insertBefore) {
    return __async(this, null, function* () {
      const draggedTask = this.tasks.find((t) => t.id === draggedId);
      const targetTask = this.tasks.find((t) => t.id === targetId);
      if (!draggedTask || !targetTask)
        return;
      const draggedIndex = this.tasks.indexOf(draggedTask);
      this.tasks.splice(draggedIndex, 1);
      const targetIndex = this.tasks.indexOf(targetTask);
      const insertIndex = insertBefore ? targetIndex : targetIndex + 1;
      this.tasks.splice(insertIndex, 0, draggedTask);
      this.tasks.forEach((task, index) => {
        task.order = index + 1;
      });
      yield this.saveData();
      this.renderTasks();
    });
  }
  getCategoryName(category) {
    const isRomanian = this.plugin.settings.language === "ro";
    const categoryNames = {
      "toate": isRomanian ? "Toate" : "All",
      "lucru": isRomanian ? "Lucru" : "Work",
      "work": isRomanian ? "Lucru" : "Work",
      "personal": "Personal",
      "sanatate": isRomanian ? "S\u0103n\u0103tate" : "Health",
      "health": isRomanian ? "S\u0103n\u0103tate" : "Health",
      "invatare": isRomanian ? "\xCEnv\u0103\u021Bare" : "Learning",
      "learning": isRomanian ? "\xCEnv\u0103\u021Bare" : "Learning",
      "hobby": "Hobby"
    };
    return categoryNames[category] || category;
  }
  loadTasks() {
    return __async(this, null, function* () {
      const data = yield this.plugin.loadData();
      this.tasks = (data == null ? void 0 : data.tasks) || [];
    });
  }
  saveTasks() {
    return __async(this, null, function* () {
      const data = (yield this.plugin.loadData()) || {};
      data.tasks = this.tasks;
      yield this.plugin.saveData(data);
    });
  }
  loadData() {
    return __async(this, null, function* () {
      const data = yield this.plugin.loadData();
      this.tasks = (data == null ? void 0 : data.tasks) || [];
      this.reminders = (data == null ? void 0 : data.reminders) || [];
      this.habits = (data == null ? void 0 : data.habits) || [];
      this.migrateDataToIncludeOrder();
    });
  }
  migrateDataToIncludeOrder() {
    let needsSave = false;
    this.tasks.forEach((task, index) => {
      if (task.order === void 0) {
        task.order = index + 1;
        needsSave = true;
      }
    });
    this.reminders.forEach((reminder, index) => {
      if (reminder.order === void 0) {
        reminder.order = index + 1;
        needsSave = true;
      }
    });
    this.habits.forEach((habit, index) => {
      if (habit.order === void 0) {
        habit.order = index + 1;
        needsSave = true;
      }
    });
    this.normalizeOrderValues();
    if (needsSave) {
      this.saveData();
    }
  }
  normalizeOrderValues() {
    const incompleTasks = this.tasks.filter((task) => !task.completed);
    const completedTasks = this.tasks.filter((task) => task.completed);
    incompleTasks.sort((a, b) => (a.order || 0) - (b.order || 0));
    incompleTasks.forEach((task, index) => {
      task.order = index + 1;
    });
    completedTasks.sort((a, b) => (a.order || 0) - (b.order || 0));
    completedTasks.forEach((task, index) => {
      task.order = index + 1;
    });
    this.reminders.sort((a, b) => (a.order || 0) - (b.order || 0));
    this.reminders.forEach((reminder, index) => {
      reminder.order = index + 1;
    });
    this.habits.sort((a, b) => (a.order || 0) - (b.order || 0));
    this.habits.forEach((habit, index) => {
      habit.order = index + 1;
    });
  }
  saveData() {
    return __async(this, null, function* () {
      const data = (yield this.plugin.loadData()) || {};
      data.tasks = this.tasks;
      data.reminders = this.reminders;
      data.habits = this.habits;
      this.lastLocalUpdate = Date.now();
      this.plugin.lastDataUpdate = Date.now();
      yield this.plugin.saveData(data);
    });
  }
  getTaskPlaceholder() {
    if (this.plugin.settings.language === "ro") {
      return `Ce ave\u021Bi de f\u0103cut ast\u0103zi, ${this.plugin.settings.userName}?`;
    } else {
      return `What do you need to do today, ${this.plugin.settings.userName}?`;
    }
  }
  getReminderPlaceholder() {
    if (this.plugin.settings.language === "ro") {
      return "Despre ce s\u0103 v\u0103 amintim?";
    } else {
      return "What should I remind you about?";
    }
  }
  getLocalDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  getLocalDateTimeString(date) {
    const dateStr = this.getLocalDateString(date);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${dateStr}T${hours}:${minutes}`;
  }
  checkExpiredReminders() {
    const now = new Date();
    let hasExpired = false;
    this.reminders.forEach((reminder) => {
      const reminderDate = new Date(reminder.dateTime);
      if (!reminder.expired && reminderDate <= now) {
        reminder.expired = true;
        hasExpired = true;
        if (this.plugin.settings.enableNotifications) {
          new import_obsidian.Notice(`\u23F0 Amintire: ${reminder.text}`, 5e3);
        }
      }
    });
    if (hasExpired) {
      this.saveData();
      if (this.currentView === "reminders") {
        this.renderReminders();
      }
    }
  }
  addReminder() {
    return __async(this, null, function* () {
      const reminderTextInput = this.containerEl.querySelector("#reminderTextInput");
      const reminderDateInput = this.containerEl.querySelector("#reminderDateInput");
      const reminderTimeInput = this.containerEl.querySelector("#reminderTimeInput");
      const text = reminderTextInput.value.trim();
      const date = reminderDateInput.value;
      const time = reminderTimeInput.value;
      if (!text || !date || !time) {
        new import_obsidian.Notice(this.plugin.settings.language === "ro" ? "Completa\u021Bi toate c\xE2mpurile pentru amintire!" : "Fill in all fields!");
        return;
      }
      const dateTime = `${date}T${time}`;
      const reminderDate = new Date(dateTime);
      if (reminderDate <= new Date()) {
        new import_obsidian.Notice(this.plugin.settings.language === "ro" ? "V\u0103 rug\u0103m s\u0103 alege\u021Bi o dat\u0103 \u0219i or\u0103 din viitor!" : "Date must be in the future!");
        return;
      }
      const newReminder = {
        id: Date.now(),
        text,
        dateTime,
        expired: false,
        createdAt: this.getLocalDateString(new Date()),
        order: this.reminders.length + 1
      };
      this.reminders.push(newReminder);
      yield this.saveData();
      reminderTextInput.value = "";
      reminderDateInput.value = "";
      reminderTimeInput.value = "";
      this.renderReminders();
    });
  }
  deleteReminder(id) {
    this.reminders = this.reminders.filter((reminder) => reminder.id !== id);
    this.saveData();
    this.renderReminders();
  }
  renderReminders() {
    const remindersList = this.containerEl.querySelector("#remindersList");
    const reminderCounter = this.containerEl.querySelector("#reminderCounter");
    if (!remindersList || !reminderCounter)
      return;
    const isRomanian = this.plugin.settings.language === "ro";
    const sortedReminders = this.reminders.sort((a, b) => {
      if (a.expired && !b.expired)
        return 1;
      if (!a.expired && b.expired)
        return -1;
      if (a.expired === b.expired) {
        const orderDiff = (a.order || 0) - (b.order || 0);
        if (orderDiff !== 0)
          return orderDiff;
      }
      return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
    });
    const activeReminders = this.reminders.filter((reminder) => !reminder.expired);
    if (isRomanian) {
      reminderCounter.textContent = `${activeReminders.length} ${activeReminders.length !== 1 ? "amintiri" : "amintire"}`;
    } else {
      reminderCounter.textContent = `${activeReminders.length} ${activeReminders.length !== 1 ? "reminders" : "reminder"}`;
    }
    if (sortedReminders.length === 0) {
      remindersList.innerHTML = `
				<div class="empty-reminders">
					<div class="empty-reminders-icon">\u23F0</div>
					<p>${this.plugin.settings.language === "ro" ? "Nicio amintire \xEEnc\u0103. Adaug\u0103 prima pentru a \xEEncepe!" : "No reminders yet. Add your first to get started!"}</p>
				</div>
			`;
      return;
    }
    remindersList.innerHTML = sortedReminders.map((reminder, index) => {
      const reminderDate = new Date(reminder.dateTime);
      const dateStr = reminderDate.toLocaleDateString("ro-RO");
      const timeStr = reminderDate.toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" });
      const isActive = !reminder.expired;
      let reorderHtml = "";
      if (isActive) {
        const activeRemindersSorted = sortedReminders.filter((r) => !r.expired);
        const activeIndex = activeRemindersSorted.findIndex((r) => r.id === reminder.id);
        reorderHtml = `
					<div class="reminder-reorder">
						<button class="reminder-move-up" data-reminder-id="${reminder.id}" title="${isRomanian ? "Mut\u0103 \xEEn sus" : "Move up"}" ${activeIndex === 0 ? "disabled" : ""}>\u2191</button>
						<button class="reminder-move-down" data-reminder-id="${reminder.id}" title="${isRomanian ? "Mut\u0103 \xEEn jos" : "Move down"}" ${activeIndex === activeRemindersSorted.length - 1 ? "disabled" : ""}>\u2193</button>
					</div>
				`;
      } else {
        reorderHtml = `<div style="width:24px;"></div>`;
      }
      return `
				<div class="reminder-item ${reminder.expired ? "expired" : ""}" data-reminder-id="${reminder.id}">
					${reorderHtml}
					<div class="reminder-content">
						<div class="reminder-text">${reminder.text}</div>
						<div class="reminder-time">${dateStr} la ${timeStr}</div>
						${reminder.expired ? `<div class="time-left expired">${this.plugin.settings.language === "ro" ? "Expirat" : "Expired"}</div>` : ""}
					</div>
					<div class="reminder-actions">
						<button class="reminder-edit" data-reminder-id="${reminder.id}" title="${isRomanian ? "Editeaz\u0103" : "Edit"}">\u270F\uFE0F</button>
						<button class="reminder-delete" data-reminder-id="${reminder.id}" title="${isRomanian ? "\u0218terge" : "Delete"}">\xD7</button>
					</div>
				</div>
			`;
    }).join("");
    remindersList.querySelectorAll(".reminder-delete").forEach((deleteBtn) => {
      deleteBtn.addEventListener("click", (e) => {
        const reminderId = parseInt(e.target.getAttribute("data-reminder-id") || "0");
        this.confirmDeleteReminder(reminderId);
      });
    });
    remindersList.querySelectorAll(".reminder-edit").forEach((editBtn) => {
      editBtn.addEventListener("click", (e) => {
        const reminderId = parseInt(e.target.getAttribute("data-reminder-id") || "0");
        this.editReminder(reminderId);
      });
    });
    remindersList.querySelectorAll(".reminder-move-up").forEach((btn) => {
      btn.addEventListener("click", (e) => __async(this, null, function* () {
        e.stopPropagation();
        const reminderId = parseInt(e.target.getAttribute("data-reminder-id") || "0");
        yield this.moveReminderUp(reminderId);
      }));
    });
    remindersList.querySelectorAll(".reminder-move-down").forEach((btn) => {
      btn.addEventListener("click", (e) => __async(this, null, function* () {
        e.stopPropagation();
        const reminderId = parseInt(e.target.getAttribute("data-reminder-id") || "0");
        yield this.moveReminderDown(reminderId);
      }));
    });
  }
  renderRemindersWithoutDragSetup() {
    const remindersList = this.containerEl.querySelector("#remindersList");
    const reminderCounter = this.containerEl.querySelector("#reminderCounter");
    if (!remindersList || !reminderCounter)
      return;
    const isRomanian = this.plugin.settings.language === "ro";
    const sortedReminders = this.reminders.sort((a, b) => {
      if (a.expired && !b.expired)
        return 1;
      if (!a.expired && b.expired)
        return -1;
      if (a.expired === b.expired) {
        const orderDiff = (a.order || 0) - (b.order || 0);
        if (orderDiff !== 0)
          return orderDiff;
      }
      return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
    });
    const activeReminders = this.reminders.filter((reminder) => !reminder.expired);
    if (isRomanian) {
      reminderCounter.textContent = `${activeReminders.length} ${activeReminders.length !== 1 ? "amintiri" : "amintire"}`;
    } else {
      reminderCounter.textContent = `${activeReminders.length} ${activeReminders.length !== 1 ? "reminders" : "reminder"}`;
    }
    if (sortedReminders.length === 0) {
      remindersList.innerHTML = `
				<div class="empty-reminders">
					<div class="empty-reminders-icon">\u23F0</div>
					<p>${this.plugin.settings.language === "ro" ? "Nicio amintire \xEEnc\u0103. Adaug\u0103 prima pentru a \xEEncepe!" : "No reminders yet. Add your first to get started!"}</p>
				</div>
			`;
      return;
    }
    remindersList.innerHTML = sortedReminders.map((reminder) => {
      const reminderDate = new Date(reminder.dateTime);
      const dateStr = reminderDate.toLocaleDateString("ro-RO");
      const timeStr = reminderDate.toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" });
      return `
				<div class="reminder-item ${reminder.expired ? "expired" : ""}" data-reminder-id="${reminder.id}">
					<div class="reminder-content">
						<div class="reminder-text">${reminder.text}</div>
						<div class="reminder-time">${dateStr} la ${timeStr}</div>
						${reminder.expired ? `<div class="time-left expired">${this.plugin.settings.language === "ro" ? "Expirat" : "Expired"}</div>` : ""}
					</div>
					<div class="reminder-actions">
						<button class="reminder-edit" data-reminder-id="${reminder.id}" title="${isRomanian ? "Editeaz\u0103" : "Edit"}">\u270F\uFE0F</button>
						<button class="reminder-delete" data-reminder-id="${reminder.id}" title="${isRomanian ? "\u0218terge" : "Delete"}">\xD7</button>
					</div>
				</div>
			`;
    }).join("");
    remindersList.querySelectorAll(".reminder-delete").forEach((deleteBtn) => {
      deleteBtn.addEventListener("click", (e) => {
        const reminderId = parseInt(e.target.getAttribute("data-reminder-id") || "0");
        this.confirmDeleteReminder(reminderId);
      });
    });
    remindersList.querySelectorAll(".reminder-edit").forEach((editBtn) => {
      editBtn.addEventListener("click", (e) => {
        const reminderId = parseInt(e.target.getAttribute("data-reminder-id") || "0");
        this.editReminder(reminderId);
      });
    });
  }
  setupRemindersDragAndDrop() {
    const remindersList = this.containerEl.querySelector("#remindersList");
    if (!remindersList)
      return;
    const reminderItems = remindersList.querySelectorAll(".reminder-item");
    let draggedElement = null;
    let draggedReminderId = null;
    reminderItems.forEach((item) => {
      const reminderItem = item;
      reminderItem.addEventListener("dragstart", (e) => {
        this.isDragging = true;
        draggedElement = reminderItem;
        draggedReminderId = parseInt(reminderItem.getAttribute("data-reminder-id") || "0");
        reminderItem.classList.add("dragging");
        if (e.dataTransfer) {
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData("text/html", reminderItem.outerHTML);
        }
      });
      reminderItem.addEventListener("dragend", () => {
        reminderItem.classList.remove("dragging");
        draggedElement = null;
        draggedReminderId = null;
        setTimeout(() => {
          this.isDragging = false;
        }, 100);
      });
      reminderItem.addEventListener("dragover", (e) => {
        e.preventDefault();
        if (e.dataTransfer) {
          e.dataTransfer.dropEffect = "move";
        }
        if (draggedElement && draggedElement !== reminderItem) {
          const rect = reminderItem.getBoundingClientRect();
          const midY = rect.top + rect.height / 2;
          if (e.clientY < midY) {
            reminderItem.classList.add("drop-above");
            reminderItem.classList.remove("drop-below");
          } else {
            reminderItem.classList.add("drop-below");
            reminderItem.classList.remove("drop-above");
          }
        }
      });
      reminderItem.addEventListener("dragleave", () => {
        reminderItem.classList.remove("drop-above", "drop-below");
      });
      reminderItem.addEventListener("drop", (e) => {
        e.preventDefault();
        reminderItem.classList.remove("drop-above", "drop-below");
        if (draggedReminderId && draggedElement && draggedElement !== reminderItem) {
          const targetReminderId = parseInt(reminderItem.getAttribute("data-reminder-id") || "0");
          this.reorderReminders(draggedReminderId, targetReminderId, e.clientY < reminderItem.getBoundingClientRect().top + reminderItem.getBoundingClientRect().height / 2);
        }
      });
    });
  }
  reorderReminders(draggedId, targetId, insertBefore) {
    return __async(this, null, function* () {
      const draggedReminder = this.reminders.find((r) => r.id === draggedId);
      const targetReminder = this.reminders.find((r) => r.id === targetId);
      if (!draggedReminder || !targetReminder)
        return;
      const draggedIndex = this.reminders.indexOf(draggedReminder);
      this.reminders.splice(draggedIndex, 1);
      const targetIndex = this.reminders.indexOf(targetReminder);
      const insertIndex = insertBefore ? targetIndex : targetIndex + 1;
      this.reminders.splice(insertIndex, 0, draggedReminder);
      this.reminders.forEach((reminder, index) => {
        reminder.order = index + 1;
      });
      yield this.saveData();
      this.renderRemindersWithoutDragSetup();
    });
  }
  editReminder(id) {
    const reminder = this.reminders.find((r) => r.id === id);
    if (!reminder)
      return;
    const isRomanian = this.plugin.settings.language === "ro";
    const reminderDate = new Date(reminder.dateTime);
    const dateStr = this.getLocalDateString(reminderDate);
    const timeStr = reminderDate.toTimeString().slice(0, 5);
    const existingModal = document.querySelector(".mindfuldo-edit-modal");
    if (existingModal) {
      document.body.removeChild(existingModal);
    }
    const modal = document.createElement("div");
    modal.className = "mindfuldo-edit-modal";
    modal.innerHTML = `
			<div class="edit-modal-content">
				<h3>${isRomanian ? "Editeaz\u0103 amintirea" : "Edit Reminder"}</h3>
				<div class="edit-form">
					<div class="form-group">
						<label>${isRomanian ? "Text:" : "Text:"}</label>
						<input type="text" id="editReminderText" value="${reminder.text}" placeholder="${isRomanian ? "Introduce\u021Bi textul amintirii" : "Enter reminder text"}">
					</div>
					<div class="form-group">
						<label>${isRomanian ? "Data:" : "Date:"}</label>
						<input type="date" id="editReminderDate" value="${dateStr}">
					</div>
					<div class="form-group">
						<label>${isRomanian ? "Ora:" : "Time:"}</label>
						<input type="time" id="editReminderTime" value="${timeStr}">
					</div>
					<div class="form-actions">
						<button id="saveReminderEdit" class="save-btn">${isRomanian ? "Salveaz\u0103" : "Save"}</button>
						<button id="cancelReminderEdit" class="cancel-btn">${isRomanian ? "Anuleaz\u0103" : "Cancel"}</button>
					</div>
				</div>
			</div>
		`;
    document.body.appendChild(modal);
    const saveBtn = modal.querySelector("#saveReminderEdit");
    const cancelBtn = modal.querySelector("#cancelReminderEdit");
    const textInput = modal.querySelector("#editReminderText");
    const dateInput = modal.querySelector("#editReminderDate");
    const timeInput = modal.querySelector("#editReminderTime");
    const closeModal = () => {
      if (document.body.contains(modal)) {
        document.body.removeChild(modal);
      }
    };
    const saveChanges = () => __async(this, null, function* () {
      const newText = textInput.value.trim();
      const newDate = dateInput.value;
      const newTime = timeInput.value;
      if (!newText || !newDate || !newTime) {
        new import_obsidian.Notice(isRomanian ? "Completa\u021Bi toate c\xE2mpurile!" : "Fill in all fields!");
        return;
      }
      const newDateTime = `${newDate}T${newTime}`;
      const newReminderDate = new Date(newDateTime);
      if (newReminderDate <= new Date()) {
        new import_obsidian.Notice(isRomanian ? "V\u0103 rug\u0103m s\u0103 alege\u021Bi o dat\u0103 \u0219i or\u0103 din viitor!" : "Date must be in the future!");
        return;
      }
      try {
        reminder.text = newText;
        reminder.dateTime = newDateTime;
        reminder.expired = false;
        yield this.saveData();
        if (this.currentView === "reminders") {
          this.renderReminders();
        }
        new import_obsidian.Notice(isRomanian ? "Amintirea a fost actualizat\u0103!" : "Reminder updated successfully!");
        closeModal();
      } catch (error) {
        console.error("Error saving reminder:", error);
        new import_obsidian.Notice(isRomanian ? "Eroare la salvarea amintirii!" : "Error saving reminder!");
      }
    });
    saveBtn == null ? void 0 : saveBtn.addEventListener("click", saveChanges);
    cancelBtn == null ? void 0 : cancelBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
    textInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        saveChanges();
      }
    });
    modal.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeModal();
      }
    });
    setTimeout(() => textInput.focus(), 100);
  }
  // Habit tracker functionality
  addHabit() {
    return __async(this, null, function* () {
      var _a;
      yield this.loadData();
      const habitNameInput = this.containerEl.querySelector("#habitNameInput");
      if (!habitNameInput)
        return;
      const habitName = habitNameInput.value.trim();
      if (habitName === "")
        return;
      const selectedColor = this.containerEl.querySelector(".color-option.active");
      let color = (selectedColor == null ? void 0 : selectedColor.getAttribute("data-color")) || "#4CAF50";
      if (color === "custom") {
        const customColorInput = this.containerEl.querySelector("#customHabitColor");
        if (customColorInput && customColorInput.value) {
          color = customColorInput.value;
        }
      }
      const habit = {
        id: Date.now(),
        name: habitName,
        color,
        createdAt: this.getLocalDateString(new Date()),
        streak: 0,
        bestStreak: 0,
        completions: {},
        order: this.habits.length + 1
      };
      this.habits.push(habit);
      yield this.saveData();
      habitNameInput.value = "";
      this.containerEl.querySelectorAll(".color-option").forEach((btn) => btn.classList.remove("active"));
      (_a = this.containerEl.querySelector(".color-option")) == null ? void 0 : _a.classList.add("active");
      this.renderHabits();
    });
  }
  toggleHabit(id, date) {
    return __async(this, null, function* () {
      yield this.loadData();
      const habitIndex = this.habits.findIndex((habit2) => habit2.id === id);
      if (habitIndex === -1)
        return;
      const habit = this.habits[habitIndex];
      const targetDate = date || this.getLocalDateString(new Date());
      habit.completions[targetDate] = !habit.completions[targetDate];
      this.updateHabitStreak(habit);
      yield this.saveData();
      if (this.currentView === "habits") {
        this.renderHabits();
      }
    });
  }
  updateHabitStreak(habit) {
    const today = new Date();
    const todayStr = this.getLocalDateString(today);
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;
    const completionDates = Object.keys(habit.completions).filter((date) => habit.completions[date]).sort();
    if (completionDates.length === 0) {
      habit.streak = 0;
      habit.bestStreak = Math.max(0, habit.bestStreak);
      return;
    }
    if (habit.completions[todayStr]) {
      currentStreak = 1;
      let checkDate = new Date(today);
      while (true) {
        checkDate.setDate(checkDate.getDate() - 1);
        const dateStr = this.getLocalDateString(checkDate);
        if (habit.completions[dateStr]) {
          currentStreak++;
        } else {
          break;
        }
      }
    } else {
      currentStreak = 0;
    }
    for (let i = 0; i < completionDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prevDate = new Date(completionDates[i - 1]);
        const currDate = new Date(completionDates[i]);
        const diffTime = currDate.getTime() - prevDate.getTime();
        const diffDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      if (tempStreak > bestStreak) {
        bestStreak = tempStreak;
      }
    }
    habit.streak = currentStreak;
    habit.bestStreak = Math.max(bestStreak, habit.bestStreak);
  }
  deleteHabit(id) {
    return __async(this, null, function* () {
      yield this.loadData();
      this.habits = this.habits.filter((habit) => habit.id !== id);
      yield this.saveData();
      this.renderHabits();
    });
  }
  renderHabits() {
    const habitsList = this.containerEl.querySelector("#habitsList");
    const habitCounter = this.containerEl.querySelector("#habitCounter");
    if (!habitsList || !habitCounter)
      return;
    const isRomanian = this.plugin.settings.language === "ro";
    const todayStr = this.getLocalDateString(new Date());
    const completedToday = this.habits.filter((habit) => habit.completions[todayStr]).length;
    if (isRomanian) {
      habitCounter.textContent = `${completedToday}/${this.habits.length} ${this.habits.length !== 1 ? "obiceiuri" : "obicei"} ast\u0103zi`;
    } else {
      habitCounter.textContent = `${completedToday}/${this.habits.length} ${this.habits.length !== 1 ? "habits" : "habit"} today`;
    }
    if (this.habits.length === 0) {
      habitsList.innerHTML = `
				<div class="empty-habits">
					<div class="empty-habits-icon">\u{1F3AF}</div>
					<p>${isRomanian ? "Niciun obicei \xEEnc\u0103. Adaug\u0103 primul pentru a \xEEncepe!" : "No habits yet. Add your first to get started!"}</p>
				</div>
			`;
      return;
    }
    const sortedHabits = [...this.habits].sort((a, b) => (a.order || 0) - (b.order || 0));
    const currentDate = new Date(this.currentHabitsYear, this.currentHabitsMonth, 1);
    const monthNames = isRomanian ? ["Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie", "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"] : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const newHtml = sortedHabits.map((habit, habitIndex) => {
      const monthCalendar = this.generateHabitMonthCalendar(habit, currentDate, isRomanian);
      return `
				<div class="habit-item" data-habit-id="${habit.id}">
					<div class="habit-header">
						<div class="habit-reorder">
							<button class="habit-move-up" data-habit-id="${habit.id}" title="${isRomanian ? "Mut\u0103 \xEEn sus" : "Move up"}" ${habitIndex === 0 ? "disabled" : ""}>\u2191</button>
							<button class="habit-move-down" data-habit-id="${habit.id}" title="${isRomanian ? "Mut\u0103 \xEEn jos" : "Move down"}" ${habitIndex === sortedHabits.length - 1 ? "disabled" : ""}>\u2193</button>
						</div>
						<div class="habit-info">
							<div class="habit-name" style="color: ${habit.color};">${habit.name}</div>
							<div class="habit-stats">
								<span class="streak-current">${habit.streak} ${isRomanian ? "zile" : "days"}</span>
								<span class="streak-separator">\u2022</span>
								<span class="streak-best">${isRomanian ? "Record" : "Best"}: ${habit.bestStreak}</span>
							</div>
						</div>
						<div class="habit-actions">
							<button class="habit-edit" data-habit-id="${habit.id}" title="${isRomanian ? "Editeaz\u0103" : "Edit"}">\u270F\uFE0F</button>
							<button class="habit-delete" data-habit-id="${habit.id}" title="${isRomanian ? "\u0218terge" : "Delete"}">\xD7</button>
						</div>
					</div>
					<div class="habit-calendar">
						<div class="habit-calendar-header">
							<button class="habit-month-nav habit-prev-month" data-habit-id="${habit.id}" title="${isRomanian ? "Luna anterioar\u0103" : "Previous month"}">\u2039</button>
							<span class="habit-month-title">${monthNames[this.currentHabitsMonth]} ${this.currentHabitsYear}</span>
							<button class="habit-month-nav habit-next-month" data-habit-id="${habit.id}" title="${isRomanian ? "Luna urm\u0103toare" : "Next month"}">\u203A</button>
						</div>
						${monthCalendar}
					</div>
				</div>
			`;
    }).join("");
    if (habitsList.innerHTML !== newHtml) {
      habitsList.innerHTML = newHtml;
    }
    this.setupHabitsEventListeners();
  }
  generateHabitMonthCalendar(habit, currentDate, isRomanian) {
    const today = new Date();
    const todayStr = this.getLocalDateString(today);
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    const weekDays = isRomanian ? ["D", "L", "M", "M", "J", "V", "S"] : ["S", "M", "T", "W", "T", "F", "S"];
    let calendarHtml = '<div class="habit-calendar-grid">';
    calendarHtml += '<div class="habit-calendar-weekdays">';
    weekDays.forEach((day) => {
      calendarHtml += `<div class="habit-weekday">${day}</div>`;
    });
    calendarHtml += "</div>";
    calendarHtml += '<div class="habit-calendar-days">';
    for (let i = 0; i < firstDayOfWeek; i++) {
      calendarHtml += '<div class="habit-calendar-day empty"></div>';
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayDateStr = this.getLocalDateString(dayDate);
      const isCompleted = habit.completions[dayDateStr] || false;
      const isToday = dayDateStr === todayStr;
      const isFuture = dayDate > today;
      calendarHtml += `
				<div class="habit-calendar-day ${isCompleted ? "completed" : ""} ${isToday ? "today" : ""} ${isFuture ? "future" : ""}"
					 data-habit-id="${habit.id}"
					 data-date="${dayDateStr}"
					 style="--habit-color: ${habit.color}"
					 title="${isToday ? isRomanian ? "Ast\u0103zi" : "Today" : dayDate.toLocaleDateString()}">
					<span class="day-number">${day}</span>
					${isCompleted ? '<span class="checkmark">\u2713</span>' : ""}
				</div>
			`;
    }
    calendarHtml += "</div></div>";
    return calendarHtml;
  }
  setupHabitsEventListeners() {
    const habitsList = this.containerEl.querySelector("#habitsList");
    if (!habitsList)
      return;
    habitsList.querySelectorAll(".habit-calendar-day:not(.empty):not(.future)").forEach((dayEl) => {
      dayEl.addEventListener("click", (e) => __async(this, null, function* () {
        e.stopPropagation();
        const habitId = parseInt(e.currentTarget.getAttribute("data-habit-id") || "0");
        const date = e.currentTarget.getAttribute("data-date") || "";
        yield this.toggleHabit(habitId, date);
      }));
    });
    habitsList.querySelectorAll(".habit-prev-month").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.navigateHabitsMonth(-1);
      });
    });
    habitsList.querySelectorAll(".habit-next-month").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.navigateHabitsMonth(1);
      });
    });
    habitsList.querySelectorAll(".habit-delete").forEach((deleteBtn) => {
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const habitId = parseInt(e.target.getAttribute("data-habit-id") || "0");
        this.confirmDeleteHabit(habitId);
      });
    });
    habitsList.querySelectorAll(".habit-edit").forEach((editBtn) => {
      editBtn.addEventListener("click", (e) => __async(this, null, function* () {
        e.stopPropagation();
        const habitId = parseInt(e.target.getAttribute("data-habit-id") || "0");
        yield this.editHabit(habitId);
      }));
    });
    this.setupHabitsReordering();
  }
  navigateHabitsMonth(direction) {
    this.currentHabitsMonth += direction;
    if (this.currentHabitsMonth > 11) {
      this.currentHabitsMonth = 0;
      this.currentHabitsYear++;
    } else if (this.currentHabitsMonth < 0) {
      this.currentHabitsMonth = 11;
      this.currentHabitsYear--;
    }
    this.renderHabits();
  }
  renderHabitsWithoutDragSetup() {
    this.renderHabits();
  }
  setupHabitsReordering() {
    const habitsList = this.containerEl.querySelector("#habitsList");
    if (!habitsList)
      return;
    habitsList.querySelectorAll(".habit-move-up").forEach((btn) => {
      btn.addEventListener("click", (e) => __async(this, null, function* () {
        e.stopPropagation();
        const habitId = parseInt(e.target.getAttribute("data-habit-id") || "0");
        yield this.moveHabitUp(habitId);
      }));
    });
    habitsList.querySelectorAll(".habit-move-down").forEach((btn) => {
      btn.addEventListener("click", (e) => __async(this, null, function* () {
        e.stopPropagation();
        const habitId = parseInt(e.target.getAttribute("data-habit-id") || "0");
        yield this.moveHabitDown(habitId);
      }));
    });
  }
  moveHabitUp(habitId) {
    return __async(this, null, function* () {
      const sortedHabits = this.habits.sort((a, b) => (a.order || 0) - (b.order || 0));
      const currentIndex = sortedHabits.findIndex((h) => h.id === habitId);
      if (currentIndex <= 0)
        return;
      const temp = sortedHabits[currentIndex].order;
      sortedHabits[currentIndex].order = sortedHabits[currentIndex - 1].order;
      sortedHabits[currentIndex - 1].order = temp;
      yield this.saveData();
      this.renderHabitsWithoutDragSetup();
    });
  }
  moveHabitDown(habitId) {
    return __async(this, null, function* () {
      const sortedHabits = this.habits.sort((a, b) => (a.order || 0) - (b.order || 0));
      const currentIndex = sortedHabits.findIndex((h) => h.id === habitId);
      if (currentIndex < 0 || currentIndex >= sortedHabits.length - 1)
        return;
      const temp = sortedHabits[currentIndex].order;
      sortedHabits[currentIndex].order = sortedHabits[currentIndex + 1].order;
      sortedHabits[currentIndex + 1].order = temp;
      yield this.saveData();
      this.renderHabitsWithoutDragSetup();
    });
  }
  reorderHabits(draggedId, targetId, insertBefore) {
    return __async(this, null, function* () {
      const draggedHabit = this.habits.find((h) => h.id === draggedId);
      const targetHabit = this.habits.find((h) => h.id === targetId);
      if (!draggedHabit || !targetHabit)
        return;
      const draggedIndex = this.habits.indexOf(draggedHabit);
      this.habits.splice(draggedIndex, 1);
      const targetIndex = this.habits.indexOf(targetHabit);
      const insertIndex = insertBefore ? targetIndex : targetIndex + 1;
      this.habits.splice(insertIndex, 0, draggedHabit);
      this.habits.forEach((habit, index) => {
        habit.order = index + 1;
      });
      yield this.saveData();
      this.renderHabitsWithoutDragSetup();
    });
  }
  editHabit(id) {
    return __async(this, null, function* () {
      const habit = this.habits.find((h) => h.id === id);
      if (!habit)
        return;
      const isRomanian = this.plugin.settings.language === "ro";
      const existingModal = document.querySelector(".mindfuldo-edit-modal");
      if (existingModal) {
        document.body.removeChild(existingModal);
      }
      const modal = document.createElement("div");
      modal.className = "mindfuldo-edit-modal";
      modal.innerHTML = `
			<div class="edit-modal-content">
				<h3>${isRomanian ? "Editeaz\u0103 obiceiul" : "Edit Habit"}</h3>
				<div class="edit-form">
					<div class="form-group">
						<label>${isRomanian ? "Nume:" : "Name:"}</label>
						<input type="text" id="editHabitName" value="${habit.name}" placeholder="${isRomanian ? "Introduce\u021Bi numele obiceiului" : "Enter habit name"}">
					</div>
					<div class="form-group">
						<label>${isRomanian ? "Culoare:" : "Color:"}</label>
						<div class="color-options" id="editHabitColors">
							<div class="color-option ${habit.color === "#4CAF50" ? "active" : ""}" data-color="#4CAF50" style="background: #4CAF50;"></div>
							<div class="color-option ${habit.color === "#2196F3" ? "active" : ""}" data-color="#2196F3" style="background: #2196F3;"></div>
							<div class="color-option ${habit.color === "#FF9800" ? "active" : ""}" data-color="#FF9800" style="background: #FF9800;"></div>
							<div class="color-option ${habit.color === "#E91E63" ? "active" : ""}" data-color="#E91E63" style="background: #E91E63;"></div>
							<div class="color-option ${habit.color === "#9C27B0" ? "active" : ""}" data-color="#9C27B0" style="background: #9C27B0;"></div>
							<div class="color-option ${habit.color === "#00BCD4" ? "active" : ""}" data-color="#00BCD4" style="background: #00BCD4;"></div>
							<div class="color-option custom-color-option${!["#4CAF50", "#2196F3", "#FF9800", "#E91E63", "#9C27B0", "#00BCD4"].includes(habit.color) ? " active" : ""}" data-color="custom" style="background: ${!["#4CAF50", "#2196F3", "#FF9800", "#E91E63", "#9C27B0", "#00BCD4"].includes(habit.color) ? habit.color : "transparent"}; border: 1.5px dashed #aaa; position: relative;">
								<input type="color" id="editCustomHabitColor" value="${!["#4CAF50", "#2196F3", "#FF9800", "#E91E63", "#9C27B0", "#00BCD4"].includes(habit.color) ? habit.color : "#4CAF50"}" style="opacity:0;position:absolute;left:0;top:0;width:100%;height:100%;cursor:pointer;">
								<span style="position:absolute;left:0;top:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:1.2em;pointer-events:none;">+</span>
							</div>
						</div>
					</div>
					<div class="form-actions">
						<button id="saveHabitEdit" class="save-btn">${isRomanian ? "Salveaz\u0103" : "Save"}</button>
						<button id="cancelHabitEdit" class="cancel-btn">${isRomanian ? "Anuleaz\u0103" : "Cancel"}</button>
					</div>
				</div>
			</div>
		`;
      document.body.appendChild(modal);
      const colorOptions = modal.querySelectorAll(".color-option");
      colorOptions.forEach((option) => {
        option.addEventListener("click", () => {
          colorOptions.forEach((opt) => opt.classList.remove("active"));
          option.classList.add("active");
        });
      });
      const saveBtn = modal.querySelector("#saveHabitEdit");
      const cancelBtn = modal.querySelector("#cancelHabitEdit");
      const nameInput = modal.querySelector("#editHabitName");
      const closeModal = () => {
        if (document.body.contains(modal)) {
          document.body.removeChild(modal);
        }
      };
      const saveChanges = () => __async(this, null, function* () {
        const newName = nameInput.value.trim();
        const selectedColor = modal.querySelector(".color-option.active");
        let newColor = (selectedColor == null ? void 0 : selectedColor.getAttribute("data-color")) || habit.color;
        if (newColor === "custom") {
          const customColorInput = modal.querySelector("#editCustomHabitColor");
          if (customColorInput && customColorInput.value) {
            newColor = customColorInput.value;
          }
        }
        if (!newName) {
          new import_obsidian.Notice(isRomanian ? "Numele nu poate fi gol!" : "Name cannot be empty!");
          nameInput.focus();
          return;
        }
        try {
          habit.name = newName;
          habit.color = newColor;
          yield this.saveData();
          if (this.currentView === "habits") {
            this.renderHabits();
          }
          new import_obsidian.Notice(isRomanian ? "Obiceiul a fost actualizat!" : "Habit updated successfully!");
          closeModal();
        } catch (error) {
          console.error("Error saving habit:", error);
          new import_obsidian.Notice(isRomanian ? "Eroare la salvarea obiceiului!" : "Error saving habit!");
        }
      });
      saveBtn == null ? void 0 : saveBtn.addEventListener("click", saveChanges);
      cancelBtn == null ? void 0 : cancelBtn.addEventListener("click", closeModal);
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          closeModal();
        }
      });
      nameInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          saveChanges();
        }
      });
      modal.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          closeModal();
        }
      });
      setTimeout(() => nameInput.focus(), 100);
    });
  }
  renderCalendar() {
    const calendarGrid = this.containerEl.querySelector("#calendarGrid");
    const calendarTitle = this.containerEl.querySelector("#calendarTitle");
    if (!calendarGrid || !calendarTitle)
      return;
    const months = this.plugin.settings.language === "ro" ? ["Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie", "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"] : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    calendarTitle.textContent = `${months[this.currentMonth]} ${this.currentYear}`;
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    const dayNames = this.plugin.settings.language === "ro" ? ["D", "L", "M", "M", "J", "V", "S"] : ["S", "M", "T", "W", "T", "F", "S"];
    let calendarHTML = '<div class="calendar-weekdays">';
    dayNames.forEach((day) => {
      calendarHTML += `<div class="calendar-weekday">${day}</div>`;
    });
    calendarHTML += '</div><div class="calendar-days">';
    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const dateStr = this.getLocalDateString(currentDate);
      const isCurrentMonth = currentDate.getMonth() === this.currentMonth;
      const isToday = currentDate.toDateString() === new Date().toDateString();
      const dayTasks = this.tasks.filter(
        (task) => task.createdAt.startsWith(dateStr)
      );
      const dayReminders = this.reminders.filter(
        (reminder) => reminder.dateTime.startsWith(dateStr)
      );
      let dayClass = "calendar-day";
      if (!isCurrentMonth)
        dayClass += " other-month";
      if (isToday)
        dayClass += " today";
      if (dayTasks.length > 0)
        dayClass += " has-tasks";
      if (dayReminders.length > 0)
        dayClass += " has-reminders";
      calendarHTML += `
				<div class="${dayClass}" data-date="${dateStr}" data-tasks="${dayTasks.length}" data-reminders="${dayReminders.length}">
					<div class="calendar-day-number">${currentDate.getDate()}</div>
					<div class="calendar-day-indicators">
						${dayTasks.length > 0 ? `<span class="indicator task-indicator">${dayTasks.length}</span>` : ""}
						${dayReminders.length > 0 ? `<span class="indicator reminder-indicator">${dayReminders.length}</span>` : ""}
					</div>
				</div>
			`;
    }
    calendarHTML += "</div>";
    calendarHTML += '<div class="calendar-day-details" id="calendarDayDetails" style="display: none;"></div>';
    calendarGrid.innerHTML = calendarHTML;
    this.setupCalendarNavigation();
    this.setupCalendarDayClicks();
  }
  setupCalendarNavigation() {
    var _a, _b;
    const prevBtn = this.containerEl.querySelector("#prevMonth");
    const nextBtn = this.containerEl.querySelector("#nextMonth");
    if (prevBtn) {
      const newPrevBtn = prevBtn.cloneNode(true);
      (_a = prevBtn.parentNode) == null ? void 0 : _a.replaceChild(newPrevBtn, prevBtn);
      newPrevBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.navigateToPreviousMonth();
      });
    }
    if (nextBtn) {
      const newNextBtn = nextBtn.cloneNode(true);
      (_b = nextBtn.parentNode) == null ? void 0 : _b.replaceChild(newNextBtn, nextBtn);
      newNextBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.navigateToNextMonth();
      });
    }
  }
  navigateToPreviousMonth() {
    this.currentMonth--;
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }
    setTimeout(() => {
      this.renderCalendar();
    }, 50);
  }
  navigateToNextMonth() {
    this.currentMonth++;
    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    setTimeout(() => {
      this.renderCalendar();
    }, 50);
  }
  setupCalendarDayClicks() {
    const calendarDays = this.containerEl.querySelectorAll(".calendar-day");
    calendarDays.forEach((day) => {
      day.addEventListener("click", (e) => {
        const target = e.currentTarget;
        const date = target.getAttribute("data-date");
        const tasksCount = parseInt(target.getAttribute("data-tasks") || "0");
        const remindersCount = parseInt(target.getAttribute("data-reminders") || "0");
        if (date && (tasksCount > 0 || remindersCount > 0)) {
          this.showDayDetails(date, tasksCount, remindersCount);
        }
      });
    });
  }
  showDayDetails(dateStr, tasksCount, remindersCount) {
    const detailsContainer = this.containerEl.querySelector("#calendarDayDetails");
    if (!detailsContainer)
      return;
    const dayTasks = this.tasks.filter(
      (task) => task.createdAt.startsWith(dateStr)
    );
    const dayReminders = this.reminders.filter(
      (reminder) => reminder.dateTime.startsWith(dateStr)
    );
    const date = new Date(dateStr);
    const formattedDate = date.toLocaleDateString(
      this.plugin.settings.language === "ro" ? "ro-RO" : "en-US",
      { weekday: "long", year: "numeric", month: "long", day: "numeric" }
    );
    let detailsHTML = `
			<div class="day-details-header">
				<h3>${formattedDate}</h3>
				<button class="close-details" id="closeDayDetails">\xD7</button>
			</div>
		`;
    if (dayTasks.length > 0) {
      detailsHTML += `
				<div class="day-tasks">
					<h4><span class="task-indicator-small"></span> ${this.plugin.settings.language === "ro" ? "Task-uri" : "Tasks"} (${dayTasks.length})</h4>
					<ul>
						${dayTasks.map((task) => `
							<li class="${task.completed ? "completed" : ""}">
								<span class="task-category-badge ${task.category}">${this.getCategoryName(task.category)}</span>
								${task.text}
							</li>
						`).join("")}
					</ul>
				</div>
			`;
    }
    if (dayReminders.length > 0) {
      detailsHTML += `
				<div class="day-reminders">
					<h4><span class="reminder-indicator-small"></span> ${this.plugin.settings.language === "ro" ? "Amintiri" : "Reminders"} (${dayReminders.length})</h4>
					<ul>
						${dayReminders.map((reminder) => {
        const reminderDate = new Date(reminder.dateTime);
        const timeStr = reminderDate.toLocaleTimeString(
          this.plugin.settings.language === "ro" ? "ro-RO" : "en-US",
          { hour: "2-digit", minute: "2-digit" }
        );
        return `
								<li class="${reminder.expired ? "expired" : ""}">
									<span class="reminder-time-badge">${timeStr}</span>
									${reminder.text}
									${reminder.expired ? `<span class="expired-badge">${this.plugin.settings.language === "ro" ? "Expirat" : "Expired"}</span>` : ""}
								</li>
							`;
      }).join("")}
					</ul>
				</div>
			`;
    }
    detailsContainer.innerHTML = detailsHTML;
    detailsContainer.style.display = "block";
    const closeBtn = detailsContainer.querySelector("#closeDayDetails");
    closeBtn == null ? void 0 : closeBtn.addEventListener("click", () => {
      detailsContainer.style.display = "none";
    });
  }
  // ================== ANALYTICS METHODS ==================
  renderAnalytics() {
    this.updateCurrentWeekDisplay();
    this.calculateWeeklyStats();
  }
  navigateToPreviousWeek() {
    this.currentAnalyticsWeek.setDate(this.currentAnalyticsWeek.getDate() - 7);
    this.renderAnalytics();
  }
  navigateToNextWeek() {
    this.currentAnalyticsWeek.setDate(this.currentAnalyticsWeek.getDate() + 7);
    this.renderAnalytics();
  }
  updateCurrentWeekDisplay() {
    const currentWeekEl = this.containerEl.querySelector("#currentWeek");
    if (!currentWeekEl)
      return;
    const startOfWeek = this.getStartOfWeek(this.currentAnalyticsWeek);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    const isRomanian = this.plugin.settings.language === "ro";
    const startStr = startOfWeek.toLocaleDateString(isRomanian ? "ro-RO" : "en-US", {
      month: "short",
      day: "numeric"
    });
    const endStr = endOfWeek.toLocaleDateString(isRomanian ? "ro-RO" : "en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
    currentWeekEl.textContent = `${startStr} - ${endStr}`;
  }
  getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }
  calculateWeeklyStats() {
    const startOfWeek = this.getStartOfWeek(this.currentAnalyticsWeek);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    const weeklyTasks = this.tasks.filter((task) => {
      if (!task.completedAt)
        return false;
      const completedDate = new Date(task.completedAt);
      return completedDate >= startOfWeek && completedDate <= endOfWeek;
    });
    const totalHabits = this.habits.length;
    let habitsCompletedDays = 0;
    let activeStreaks = 0;
    this.habits.forEach((habit) => {
      let daysCompleted = 0;
      for (let d = new Date(startOfWeek); d <= endOfWeek; d.setDate(d.getDate() + 1)) {
        const dateStr = this.getLocalDateString(d);
        if (habit.completions[dateStr]) {
          daysCompleted++;
        }
      }
      if (daysCompleted > 0)
        habitsCompletedDays += daysCompleted;
      if (habit.streak > 0)
        activeStreaks++;
    });
    const taskScore = Math.min(30, weeklyTasks.length * 3);
    const dailyHabitAverage = totalHabits > 0 ? habitsCompletedDays / 7 : 0;
    const habitScore = Math.min(40, Math.round(dailyHabitAverage * 2.86));
    const focusScore = Math.min(30, this.pomodoroCompletedSessions * 2);
    const totalScore = taskScore + habitScore + focusScore;
    this.updateTasksAnalytics(weeklyTasks, startOfWeek, endOfWeek);
    this.updateHabitsAnalytics(habitsCompletedDays, totalHabits, activeStreaks);
    this.updatePomodoroAnalytics();
    this.updateProductivityScore(totalScore, taskScore, habitScore, focusScore);
    this.renderDailyChart(startOfWeek, endOfWeek);
  }
  updateTasksAnalytics(weeklyTasks, startOfWeek, endOfWeek) {
    const weeklyTasksEl = this.containerEl.querySelector("#weeklyTasksCompleted");
    const tasksChangeEl = this.containerEl.querySelector("#tasksChange");
    const tasksPeakDayEl = this.containerEl.querySelector("#tasksPeakDay");
    if (weeklyTasksEl) {
      weeklyTasksEl.textContent = weeklyTasks.length.toString();
    }
    const prevWeekStart = new Date(startOfWeek);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    const prevWeekEnd = new Date(endOfWeek);
    prevWeekEnd.setDate(prevWeekEnd.getDate() - 7);
    const prevWeekTasks = this.tasks.filter((task) => {
      if (!task.completedAt)
        return false;
      const completedDate = new Date(task.completedAt);
      return completedDate >= prevWeekStart && completedDate <= prevWeekEnd;
    });
    if (tasksChangeEl) {
      const change = prevWeekTasks.length > 0 ? Math.round((weeklyTasks.length - prevWeekTasks.length) / prevWeekTasks.length * 100) : weeklyTasks.length > 0 ? 100 : 0;
      tasksChangeEl.textContent = `${change >= 0 ? "+" : ""}${change}%`;
      tasksChangeEl.className = `change-indicator ${change >= 0 ? "positive" : "negative"}`;
    }
    if (tasksPeakDayEl) {
      const dailyCount = {};
      weeklyTasks.forEach((task) => {
        const day = new Date(task.completedAt).toLocaleDateString("en-US", { weekday: "long" });
        dailyCount[day] = (dailyCount[day] || 0) + 1;
      });
      let peakDay = "";
      let maxCount = 0;
      Object.entries(dailyCount).forEach(([day, count]) => {
        if (count > maxCount) {
          maxCount = count;
          peakDay = day;
        }
      });
      const isRomanian = this.plugin.settings.language === "ro";
      const dayNames = {
        "Monday": isRomanian ? "Luni" : "Monday",
        "Tuesday": isRomanian ? "Mar\u021Bi" : "Tuesday",
        "Wednesday": isRomanian ? "Miercuri" : "Wednesday",
        "Thursday": isRomanian ? "Joi" : "Thursday",
        "Friday": isRomanian ? "Vineri" : "Friday",
        "Saturday": isRomanian ? "S\xE2mb\u0103t\u0103" : "Saturday",
        "Sunday": isRomanian ? "Duminic\u0103" : "Sunday"
      };
      const text = isRomanian ? "Cea mai bun\u0103: " : "Best day: ";
      tasksPeakDayEl.textContent = peakDay ? `${text}${dayNames[peakDay] || peakDay}` : `${text}-`;
    }
  }
  updateHabitsAnalytics(completedDays, totalHabits, activeStreaks) {
    const habitsRateEl = this.containerEl.querySelector("#weeklyHabitsRate");
    const habitsCompletedEl = this.containerEl.querySelector("#habitsCompleted");
    const activeStreaksEl = this.containerEl.querySelector("#activeStreaks");
    if (habitsRateEl) {
      const rate = totalHabits > 0 ? Math.round(completedDays / (totalHabits * 7) * 100) : 0;
      habitsRateEl.textContent = `${rate}%`;
    }
    if (habitsCompletedEl) {
      const dailyAverage = totalHabits > 0 ? completedDays / 7 : 0;
      const averageText = dailyAverage.toFixed(1);
      const isRomanian = this.plugin.settings.language === "ro";
      habitsCompletedEl.textContent = `${averageText} ${isRomanian ? "habit-uri/zi" : "habits/day"}`;
    }
    if (activeStreaksEl) {
      activeStreaksEl.textContent = activeStreaks.toString();
    }
  }
  updatePomodoroAnalytics() {
    const sessionsEl = this.containerEl.querySelector("#weeklyPomodoroSessions");
    const focusTimeEl = this.containerEl.querySelector("#totalFocusTime");
    const avgSessionEl = this.containerEl.querySelector("#avgSessionLength");
    if (sessionsEl) {
      sessionsEl.textContent = this.pomodoroCompletedSessions.toString();
    }
    if (focusTimeEl) {
      const totalMinutes = this.pomodoroCompletedSessions * this.plugin.settings.pomodoroWorkTime;
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      focusTimeEl.textContent = `${hours}h ${minutes}min`;
    }
    if (avgSessionEl) {
      avgSessionEl.textContent = `${this.plugin.settings.pomodoroWorkTime}min`;
    }
  }
  updateProductivityScore(total, tasks, habits, focus) {
    const scoreNumberEl = this.containerEl.querySelector("#productivityScore");
    const scoreProgressEl = this.containerEl.querySelector("#scoreProgress");
    const tasksScoreEl = this.containerEl.querySelector("#tasksScore");
    const habitsScoreEl = this.containerEl.querySelector("#habitsScore");
    const focusScoreEl = this.containerEl.querySelector("#focusScore");
    if (scoreNumberEl) {
      scoreNumberEl.textContent = total.toString();
    }
    if (scoreProgressEl) {
      const circumference = 2 * Math.PI * 50;
      const progress = total / 100;
      const strokeDashoffset = circumference - progress * circumference;
      scoreProgressEl.style.strokeDasharray = `${circumference} ${circumference}`;
      scoreProgressEl.style.strokeDashoffset = strokeDashoffset.toString();
    }
    if (tasksScoreEl)
      tasksScoreEl.textContent = `${tasks}/30`;
    if (habitsScoreEl)
      habitsScoreEl.textContent = `${habits}/40`;
    if (focusScoreEl)
      focusScoreEl.textContent = `${focus}/30`;
  }
  renderDailyChart(startOfWeek, endOfWeek) {
    const chartEl = this.containerEl.querySelector("#dailyChart");
    if (!chartEl)
      return;
    const days = [];
    for (let d = new Date(startOfWeek); d <= endOfWeek; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
    const isRomanian = this.plugin.settings.language === "ro";
    const dayLabels = days.map((d) => d.toLocaleDateString(isRomanian ? "ro-RO" : "en-US", { weekday: "short" }));
    chartEl.innerHTML = `
			<div class="chart-days">
				${days.map((day, index) => {
      const dateStr = this.getLocalDateString(day);
      const tasksCount = this.tasks.filter(
        (task) => task.completedAt && this.getLocalDateString(new Date(task.completedAt)) === dateStr
      ).length;
      const habitsCompleted = this.habits.filter((habit) => habit.completions[dateStr]).length;
      const maxHeight = Math.max(tasksCount, habitsCompleted, 1);
      return `
						<div class="chart-day">
							<div class="chart-bars">
								<div class="chart-bar tasks" style="height: ${tasksCount / Math.max(maxHeight, 5) * 100}%" title="${tasksCount} tasks"></div>
								<div class="chart-bar habits" style="height: ${habitsCompleted / Math.max(maxHeight, 5) * 100}%" title="${habitsCompleted} habits"></div>
							</div>
							<div class="chart-label">${dayLabels[index]}</div>
						</div>
					`;
    }).join("")}
			</div>
			<div class="chart-legend">
				<div class="chart-legend-item">
					<div class="chart-legend-color tasks"></div>
					<span>${isRomanian ? "Sarcini completate" : "Tasks completed"}</span>
				</div>
				<div class="chart-legend-item">
					<div class="chart-legend-color habits"></div>
					<span>${isRomanian ? "Habit-uri completate" : "Habits completed"}</span>
				</div>
			</div>
		`;
  }
  // ================== POMODORO TIMER METHODS ==================
  savePomodoroSettingsQuietly() {
    return __async(this, null, function* () {
      yield this.plugin.saveData(this.plugin.settings);
    });
  }
  applyPomodoroPreset(preset) {
    if (this.pomodoroIsRunning) {
      this.pausePomodoroTimer();
    }
    this.containerEl.querySelectorAll(".preset-btn").forEach((btn) => btn.classList.remove("active"));
    const activeBtn = this.containerEl.querySelector(`[data-preset="${preset}"]`);
    if (activeBtn)
      activeBtn.classList.add("active");
    switch (preset) {
      case "classic":
        this.plugin.settings.pomodoroWorkTime = 25;
        this.plugin.settings.pomodoroBreakTime = 5;
        this.plugin.settings.pomodoroLongBreakTime = 15;
        break;
      case "extended":
        this.plugin.settings.pomodoroWorkTime = 45;
        this.plugin.settings.pomodoroBreakTime = 10;
        this.plugin.settings.pomodoroLongBreakTime = 30;
        break;
      case "short":
        this.plugin.settings.pomodoroWorkTime = 15;
        this.plugin.settings.pomodoroBreakTime = 3;
        this.plugin.settings.pomodoroLongBreakTime = 10;
        break;
      case "custom":
        break;
    }
    const workTimeInput = this.containerEl.querySelector("#workTimeInput");
    const breakTimeInput = this.containerEl.querySelector("#breakTimeInput");
    const longBreakTimeInput = this.containerEl.querySelector("#longBreakTimeInput");
    if (workTimeInput)
      workTimeInput.value = this.plugin.settings.pomodoroWorkTime.toString();
    if (breakTimeInput)
      breakTimeInput.value = this.plugin.settings.pomodoroBreakTime.toString();
    if (longBreakTimeInput)
      longBreakTimeInput.value = this.plugin.settings.pomodoroLongBreakTime.toString();
    this.savePomodoroSettingsQuietly();
    this.initializePomodoroTimer();
  }
  renderPomodoro() {
    this.initializePomodoroTimer();
    this.updatePomodoroDisplay();
    this.updateActivePreset();
  }
  updateActivePreset() {
    this.containerEl.querySelectorAll(".preset-btn").forEach((btn) => btn.classList.remove("active"));
    const { pomodoroWorkTime, pomodoroBreakTime, pomodoroLongBreakTime } = this.plugin.settings;
    let activePreset = "custom";
    if (pomodoroWorkTime === 25 && pomodoroBreakTime === 5 && pomodoroLongBreakTime === 15) {
      activePreset = "classic";
    } else if (pomodoroWorkTime === 45 && pomodoroBreakTime === 10 && pomodoroLongBreakTime === 30) {
      activePreset = "extended";
    } else if (pomodoroWorkTime === 15 && pomodoroBreakTime === 3 && pomodoroLongBreakTime === 10) {
      activePreset = "short";
    }
    const activeBtn = this.containerEl.querySelector(`[data-preset="${activePreset}"]`);
    if (activeBtn)
      activeBtn.classList.add("active");
  }
  initializePomodoroTimer() {
    let timeInMinutes;
    switch (this.pomodoroMode) {
      case "work":
        timeInMinutes = this.plugin.settings.pomodoroWorkTime;
        break;
      case "break":
        timeInMinutes = this.plugin.settings.pomodoroBreakTime;
        break;
      case "longBreak":
        timeInMinutes = this.plugin.settings.pomodoroLongBreakTime;
        break;
    }
    this.pomodoroTimeLeft = timeInMinutes * 60;
    this.updatePomodoroDisplay();
  }
  togglePomodoroTimer() {
    if (this.pomodoroIsRunning) {
      this.pausePomodoroTimer();
    } else {
      this.startPomodoroTimer();
    }
  }
  startPomodoroTimer() {
    if (this.pomodoroTimeLeft <= 0) {
      this.initializePomodoroTimer();
    }
    this.pomodoroIsRunning = true;
    this.updateStartPauseButton();
    this.pomodoroTimer = setInterval(() => {
      this.pomodoroTimeLeft--;
      this.updatePomodoroDisplay();
      if (this.pomodoroTimeLeft <= 0) {
        this.completePomodoroSession();
      }
    }, 1e3);
  }
  pausePomodoroTimer() {
    this.pomodoroIsRunning = false;
    if (this.pomodoroTimer) {
      clearInterval(this.pomodoroTimer);
      this.pomodoroTimer = null;
    }
    this.updateStartPauseButton();
  }
  resetPomodoroTimer() {
    this.pausePomodoroTimer();
    this.initializePomodoroTimer();
    this.updateStartPauseButton();
  }
  skipPomodoroSession() {
    this.pausePomodoroTimer();
    this.completePomodoroSession();
  }
  completePomodoroSession() {
    this.pausePomodoroTimer();
    const isRomanian = this.plugin.settings.language === "ro";
    if (this.pomodoroMode === "work") {
      this.pomodoroCompletedSessions++;
      if (this.plugin.settings.enableNotifications) {
        new import_obsidian.Notice(isRomanian ? "\u{1F345} Sesiune de lucru complet\u0103! Timp pentru o pauz\u0103." : "\u{1F345} Work session complete! Time for a break.", 5e3);
      }
      if (this.pomodoroCompletedSessions % this.plugin.settings.pomodoroSessionsBeforeLongBreak === 0) {
        this.pomodoroMode = "longBreak";
        this.pomodoroCurrentCycle++;
      } else {
        this.pomodoroMode = "break";
      }
    } else {
      if (this.plugin.settings.enableNotifications) {
        new import_obsidian.Notice(isRomanian ? "\u26A1 Pauz\u0103 terminat\u0103! \xCEnapoi la lucru." : "\u26A1 Break finished! Back to work.", 5e3);
      }
      this.pomodoroMode = "work";
    }
    this.initializePomodoroTimer();
    this.updatePomodoroModeDisplay();
    this.updateStatsDisplay();
    this.savePomodoroSettingsQuietly();
    if (this.pomodoroMode === "work" && this.plugin.settings.pomodoroAutoStartWork || this.pomodoroMode !== "work" && this.plugin.settings.pomodoroAutoStartBreaks) {
      setTimeout(() => {
        this.startPomodoroTimer();
      }, 2e3);
    }
  }
  updatePomodoroDisplay() {
    const timerDisplay = this.containerEl.querySelector("#timerDisplay");
    const progressRing = this.containerEl.querySelector("#progressRing");
    if (timerDisplay) {
      const minutes = Math.floor(this.pomodoroTimeLeft / 60);
      const seconds = this.pomodoroTimeLeft % 60;
      timerDisplay.textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    if (progressRing) {
      let totalTime;
      switch (this.pomodoroMode) {
        case "work":
          totalTime = this.plugin.settings.pomodoroWorkTime * 60;
          break;
        case "break":
          totalTime = this.plugin.settings.pomodoroBreakTime * 60;
          break;
        case "longBreak":
          totalTime = this.plugin.settings.pomodoroLongBreakTime * 60;
          break;
      }
      const progress = (totalTime - this.pomodoroTimeLeft) / totalTime;
      const circumference = 2 * Math.PI * 90;
      const strokeDashoffset = circumference - progress * circumference;
      progressRing.style.strokeDasharray = `${circumference} ${circumference}`;
      progressRing.style.strokeDashoffset = strokeDashoffset.toString();
    }
    this.updateStatsDisplay();
  }
  updateStartPauseButton() {
    const startPauseBtn = this.containerEl.querySelector("#startPauseBtn");
    const startPauseIcon = this.containerEl.querySelector("#startPauseIcon");
    const startPauseText = this.containerEl.querySelector("#startPauseText");
    const isRomanian = this.plugin.settings.language === "ro";
    if (startPauseBtn && startPauseIcon && startPauseText) {
      if (this.pomodoroIsRunning) {
        startPauseIcon.textContent = "\u23F8\uFE0F";
        startPauseText.textContent = isRomanian ? "Pauz\u0103" : "Pause";
        startPauseBtn.classList.add("running");
      } else {
        startPauseIcon.textContent = "\u25B6\uFE0F";
        startPauseText.textContent = isRomanian ? "\xCEnceput" : "Start";
        startPauseBtn.classList.remove("running");
      }
    }
  }
  updatePomodoroModeDisplay() {
    const pomodoroMode = this.containerEl.querySelector("#pomodoroMode");
    const isRomanian = this.plugin.settings.language === "ro";
    if (pomodoroMode) {
      switch (this.pomodoroMode) {
        case "work":
          pomodoroMode.textContent = isRomanian ? "Timp de lucru" : "Work Time";
          pomodoroMode.className = "pomodoro-mode work";
          break;
        case "break":
          pomodoroMode.textContent = isRomanian ? "Pauz\u0103 scurt\u0103" : "Short Break";
          pomodoroMode.className = "pomodoro-mode break";
          break;
        case "longBreak":
          pomodoroMode.textContent = isRomanian ? "Pauz\u0103 lung\u0103" : "Long Break";
          pomodoroMode.className = "pomodoro-mode long-break";
          break;
      }
    }
  }
  updateStatsDisplay() {
    const completedSessionsEl = this.containerEl.querySelector("#completedSessions");
    const currentCycleEl = this.containerEl.querySelector("#currentCycle");
    if (completedSessionsEl) {
      completedSessionsEl.textContent = this.pomodoroCompletedSessions.toString();
    }
    if (currentCycleEl) {
      currentCycleEl.textContent = this.pomodoroCurrentCycle.toString();
    }
  }
  confirmDeleteReminder(id) {
    const reminder = this.reminders.find((r) => r.id === id);
    if (!reminder)
      return;
    const isRomanian = this.plugin.settings.language === "ro";
    const existingModal = document.querySelector(".mindfuldo-confirm-modal");
    if (existingModal) {
      document.body.removeChild(existingModal);
    }
    const modal = document.createElement("div");
    modal.className = "mindfuldo-confirm-modal";
    modal.innerHTML = `
			<div class="confirm-modal-content">
				<h3>${isRomanian ? "Confirmare \u0219tergere" : "Confirm Delete"}</h3>
				<div class="confirm-message">
					<p>${isRomanian ? "Sigur dori\u021Bi s\u0103 \u0219terge\u021Bi amintirea:" : "Are you sure you want to delete the reminder:"}</p>
					<p class="task-text">"${reminder.text}"</p>
				</div>
				<div class="confirm-actions">
					<button id="confirmDelete" class="delete-btn">${isRomanian ? "\u0218terge" : "Delete"}</button>
					<button id="cancelDelete" class="cancel-btn">${isRomanian ? "Anuleaz\u0103" : "Cancel"}</button>
				</div>
			</div>
		`;
    document.body.appendChild(modal);
    const confirmBtn = modal.querySelector("#confirmDelete");
    const cancelBtn = modal.querySelector("#cancelDelete");
    const closeModal = () => {
      if (document.body.contains(modal)) {
        document.body.removeChild(modal);
      }
    };
    const deleteReminder = () => {
      this.deleteReminder(id);
      closeModal();
      new import_obsidian.Notice(isRomanian ? "Amintirea a fost \u0219tears\u0103!" : "Reminder deleted successfully!");
    };
    confirmBtn == null ? void 0 : confirmBtn.addEventListener("click", deleteReminder);
    cancelBtn == null ? void 0 : cancelBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
    modal.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeModal();
      }
    });
    setTimeout(() => confirmBtn == null ? void 0 : confirmBtn.focus(), 100);
  }
  confirmDeleteHabit(id) {
    const habit = this.habits.find((h) => h.id === id);
    if (!habit)
      return;
    const isRomanian = this.plugin.settings.language === "ro";
    const existingModal = document.querySelector(".mindfuldo-confirm-modal");
    if (existingModal) {
      document.body.removeChild(existingModal);
    }
    const modal = document.createElement("div");
    modal.className = "mindfuldo-confirm-modal";
    modal.innerHTML = `
			<div class="confirm-modal-content">
				<h3>${isRomanian ? "Confirmare \u0219tergere" : "Confirm Delete"}</h3>
				<div class="confirm-message">
					<p>${isRomanian ? "Sigur dori\u021Bi s\u0103 \u0219terge\u021Bi obiceiul:" : "Are you sure you want to delete the habit:"}</p>
					<p class="task-text">"${habit.name}"</p>
				</div>
				<div class="confirm-actions">
					<button id="confirmDelete" class="delete-btn">${isRomanian ? "\u0218terge" : "Delete"}</button>
					<button id="cancelDelete" class="cancel-btn">${isRomanian ? "Anuleaz\u0103" : "Cancel"}</button>
				</div>
			</div>
		`;
    document.body.appendChild(modal);
    const confirmBtn = modal.querySelector("#confirmDelete");
    const cancelBtn = modal.querySelector("#cancelDelete");
    const closeModal = () => {
      if (document.body.contains(modal)) {
        document.body.removeChild(modal);
      }
    };
    const deleteHabit = () => __async(this, null, function* () {
      yield this.deleteHabit(id);
      closeModal();
      new import_obsidian.Notice(isRomanian ? "Obiceiul a fost \u0219ters!" : "Habit deleted successfully!");
    });
    confirmBtn == null ? void 0 : confirmBtn.addEventListener("click", deleteHabit);
    cancelBtn == null ? void 0 : cancelBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
    modal.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeModal();
      }
    });
    setTimeout(() => confirmBtn == null ? void 0 : confirmBtn.focus(), 100);
  }
  // Adaug funcțiile moveReminderUp și moveReminderDown
  moveReminderUp(reminderId) {
    return __async(this, null, function* () {
      const reminder = this.reminders.find((r) => r.id === reminderId);
      if (!reminder || reminder.expired)
        return;
      let activeReminders = this.reminders.filter((r) => !r.expired);
      activeReminders.sort((a, b) => (a.order || 0) - (b.order || 0));
      const index = activeReminders.findIndex((r) => r.id === reminderId);
      if (index <= 0)
        return;
      const prev = activeReminders[index - 1];
      const tempOrder = reminder.order;
      reminder.order = prev.order;
      prev.order = tempOrder;
      this.normalizeOrderValues();
      yield this.saveData();
      this.renderReminders();
    });
  }
  moveReminderDown(reminderId) {
    return __async(this, null, function* () {
      const reminder = this.reminders.find((r) => r.id === reminderId);
      if (!reminder || reminder.expired)
        return;
      let activeReminders = this.reminders.filter((r) => !r.expired);
      activeReminders.sort((a, b) => (a.order || 0) - (b.order || 0));
      const index = activeReminders.findIndex((r) => r.id === reminderId);
      if (index < 0 || index >= activeReminders.length - 1)
        return;
      const next = activeReminders[index + 1];
      const tempOrder = reminder.order;
      reminder.order = next.order;
      next.order = tempOrder;
      this.normalizeOrderValues();
      yield this.saveData();
      this.renderReminders();
    });
  }
};
var RelaxingTodoSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    const isRomanian = this.plugin.settings.language === "ro";
    containerEl.empty();
    new import_obsidian.Setting(containerEl).setName(isRomanian ? "Categoria implicit\u0103" : "Default Category").setDesc(isRomanian ? "Categoria care va fi selectat\u0103 automat pentru task-uri noi" : "Category that will be auto-selected for new tasks").addDropdown((dropdown) => dropdown.addOption("personal", "Personal").addOption("lucru", isRomanian ? "Lucru" : "Work").addOption("sanatate", isRomanian ? "S\u0103n\u0103tate" : "Health").addOption("invatare", isRomanian ? "\xCEnv\u0103\u021Bare" : "Learning").addOption("hobby", "Hobby").setValue(this.plugin.settings.defaultCategory).onChange((value) => __async(this, null, function* () {
      this.plugin.settings.defaultCategory = value;
      yield this.plugin.saveSettings();
    })));
    new import_obsidian.Setting(containerEl).setName(isRomanian ? "Notific\u0103ri" : "Notifications").setDesc(isRomanian ? "Activeaz\u0103 notific\u0103rile pentru reminder-e" : "Enable notifications for reminders").addToggle((toggle) => toggle.setValue(this.plugin.settings.enableNotifications).onChange((value) => __async(this, null, function* () {
      this.plugin.settings.enableNotifications = value;
      yield this.plugin.saveSettings();
    })));
    new import_obsidian.Setting(containerEl).setName(isRomanian ? "Tem\u0103" : "Theme").setDesc(isRomanian ? "Alege\u021Bi tema de culori" : "Choose color theme").addDropdown((dropdown) => dropdown.addOption("default", "Default").addOption("ocean", "Ocean (Blue-Teal)").addOption("forest", "Forest (Green)").addOption("sunset", "Sunset (Pink-Orange)").addOption("purple", "Purple (Violet)").addOption("midnight", "Midnight (Dark Blue)").setValue(this.plugin.settings.theme).onChange((value) => __async(this, null, function* () {
      this.plugin.settings.theme = value;
      yield this.plugin.saveSettings();
    })));
    new import_obsidian.Setting(containerEl).setName(isRomanian ? "Numele dumneavoastr\u0103" : "Your Name").setDesc(isRomanian ? "Introduce\u021Bi numele pentru salut\u0103ri personalizate" : "Enter your name for personalized greetings").addText((text) => text.setValue(this.plugin.settings.userName).onChange((value) => __async(this, null, function* () {
      this.plugin.settings.userName = value;
      yield this.plugin.saveSettings();
    })));
    new import_obsidian.Setting(containerEl).setName(isRomanian ? "Limba" : "Language").setDesc(isRomanian ? "Alege\u021Bi limba aplica\u021Biei" : "Choose language").addDropdown((dropdown) => dropdown.addOption("ro", isRomanian ? "Rom\xE2n\u0103" : "Romanian").addOption("en", isRomanian ? "Englez\u0103" : "English").setValue(this.plugin.settings.language).onChange((value) => __async(this, null, function* () {
      this.plugin.settings.language = value;
      yield this.plugin.saveSettings();
    })));
    new import_obsidian.Setting(containerEl).setName(isRomanian ? "Pozi\u021Bia sidebar-ului" : "Sidebar Position").setDesc(isRomanian ? "Alege\u021Bi pozi\u021Bia sidebar-ului" : "Choose sidebar position").addDropdown((dropdown) => dropdown.addOption("left", isRomanian ? "St\xE2nga" : "Left").addOption("right", isRomanian ? "Dreapta" : "Right").setValue(this.plugin.settings.sidebarPosition).onChange((value) => __async(this, null, function* () {
      this.plugin.settings.sidebarPosition = value;
      yield this.plugin.saveSettings();
      this.plugin.moveViewToSidebar(value);
    })));
    new import_obsidian.Setting(containerEl).setName(isRomanian ? "Auto-\u0219terge expirate" : "Auto-delete Expired").setDesc(isRomanian ? "\u0218terge automat reminder-urile expirate" : "Automatically delete expired reminders").addToggle((toggle) => toggle.setValue(this.plugin.settings.autoDeleteExpired).onChange((value) => __async(this, null, function* () {
      this.plugin.settings.autoDeleteExpired = value;
      yield this.plugin.saveSettings();
    })));
    containerEl.createEl("h3", { text: isRomanian ? "\u{1F527} Func\u021Bionalit\u0103\u021Bi" : "\u{1F527} Features" });
    new import_obsidian.Setting(containerEl).setName(isRomanian ? "Activeaz\u0103 Sarcini" : "Enable Tasks").setDesc(isRomanian ? "Afi\u0219eaz\u0103 sec\u021Biunea de sarcini \xEEn toolbar" : "Show tasks section in toolbar").addToggle((toggle) => toggle.setValue(this.plugin.settings.enableTasks).onChange((value) => __async(this, null, function* () {
      this.plugin.settings.enableTasks = value;
      yield this.plugin.saveSettings();
    })));
    new import_obsidian.Setting(containerEl).setName(isRomanian ? "Activeaz\u0103 Amintiri" : "Enable Reminders").setDesc(isRomanian ? "Afi\u0219eaz\u0103 sec\u021Biunea de amintiri \xEEn toolbar" : "Show reminders section in toolbar").addToggle((toggle) => toggle.setValue(this.plugin.settings.enableReminders).onChange((value) => __async(this, null, function* () {
      this.plugin.settings.enableReminders = value;
      yield this.plugin.saveSettings();
    })));
    new import_obsidian.Setting(containerEl).setName(isRomanian ? "Activeaz\u0103 Obiceiuri" : "Enable Habits").setDesc(isRomanian ? "Afi\u0219eaz\u0103 sec\u021Biunea de obiceiuri \xEEn toolbar" : "Show habits section in toolbar").addToggle((toggle) => toggle.setValue(this.plugin.settings.enableHabits).onChange((value) => __async(this, null, function* () {
      this.plugin.settings.enableHabits = value;
      yield this.plugin.saveSettings();
    })));
    new import_obsidian.Setting(containerEl).setName(isRomanian ? "Activeaz\u0103 Analytics" : "Enable Analytics").setDesc(isRomanian ? "Afi\u0219eaz\u0103 sec\u021Biunea de analiz\u0103 \xEEn toolbar" : "Show analytics section in toolbar").addToggle((toggle) => toggle.setValue(this.plugin.settings.enableAnalytics).onChange((value) => __async(this, null, function* () {
      this.plugin.settings.enableAnalytics = value;
      yield this.plugin.saveSettings();
    })));
    new import_obsidian.Setting(containerEl).setName(isRomanian ? "Activeaz\u0103 Calendar" : "Enable Calendar").setDesc(isRomanian ? "Afi\u0219eaz\u0103 sec\u021Biunea de calendar \xEEn toolbar" : "Show calendar section in toolbar").addToggle((toggle) => toggle.setValue(this.plugin.settings.enableCalendar).onChange((value) => __async(this, null, function* () {
      this.plugin.settings.enableCalendar = value;
      yield this.plugin.saveSettings();
    })));
    new import_obsidian.Setting(containerEl).setName(isRomanian ? "Activeaz\u0103 Pomodoro" : "Enable Pomodoro").setDesc(isRomanian ? "Afi\u0219eaz\u0103 sec\u021Biunea de Pomodoro \xEEn toolbar" : "Show Pomodoro section in toolbar").addToggle((toggle) => toggle.setValue(this.plugin.settings.enablePomodoro).onChange((value) => __async(this, null, function* () {
      this.plugin.settings.enablePomodoro = value;
      yield this.plugin.saveSettings();
    })));
    containerEl.createEl("h3", { text: isRomanian ? "\u{1F345} Set\u0103ri Pomodoro" : "\u{1F345} Pomodoro Settings" });
    new import_obsidian.Setting(containerEl).setName(isRomanian ? "Timp de lucru (minute)" : "Work Time (minutes)").setDesc(isRomanian ? "Durata unei sesiuni de lucru" : "Duration of a work session").addSlider((slider) => slider.setLimits(1, 60, 1).setValue(this.plugin.settings.pomodoroWorkTime).setDynamicTooltip().onChange((value) => __async(this, null, function* () {
      this.plugin.settings.pomodoroWorkTime = value;
      yield this.plugin.saveSettings();
    })));
    new import_obsidian.Setting(containerEl).setName(isRomanian ? "Pauz\u0103 scurt\u0103 (minute)" : "Short Break (minutes)").setDesc(isRomanian ? "Durata unei pauze scurte" : "Duration of a short break").addSlider((slider) => slider.setLimits(1, 30, 1).setValue(this.plugin.settings.pomodoroBreakTime).setDynamicTooltip().onChange((value) => __async(this, null, function* () {
      this.plugin.settings.pomodoroBreakTime = value;
      yield this.plugin.saveSettings();
    })));
    new import_obsidian.Setting(containerEl).setName(isRomanian ? "Pauz\u0103 lung\u0103 (minute)" : "Long Break (minutes)").setDesc(isRomanian ? "Durata unei pauze lungi" : "Duration of a long break").addSlider((slider) => slider.setLimits(5, 60, 1).setValue(this.plugin.settings.pomodoroLongBreakTime).setDynamicTooltip().onChange((value) => __async(this, null, function* () {
      this.plugin.settings.pomodoroLongBreakTime = value;
      yield this.plugin.saveSettings();
    })));
    new import_obsidian.Setting(containerEl).setName(isRomanian ? "Sesiuni p\xE2n\u0103 la pauza lung\u0103" : "Sessions Before Long Break").setDesc(isRomanian ? "Num\u0103rul de sesiuni de lucru \xEEnainte de o pauz\u0103 lung\u0103" : "Number of work sessions before a long break").addSlider((slider) => slider.setLimits(2, 8, 1).setValue(this.plugin.settings.pomodoroSessionsBeforeLongBreak).setDynamicTooltip().onChange((value) => __async(this, null, function* () {
      this.plugin.settings.pomodoroSessionsBeforeLongBreak = value;
      yield this.plugin.saveSettings();
    })));
    new import_obsidian.Setting(containerEl).setName(isRomanian ? "Auto-\xEEncepe pauzele" : "Auto-start Breaks").setDesc(isRomanian ? "\xCEncepe automat pauzele dup\u0103 sesiunile de lucru" : "Automatically start breaks after work sessions").addToggle((toggle) => toggle.setValue(this.plugin.settings.pomodoroAutoStartBreaks).onChange((value) => __async(this, null, function* () {
      this.plugin.settings.pomodoroAutoStartBreaks = value;
      yield this.plugin.saveSettings();
    })));
    new import_obsidian.Setting(containerEl).setName(isRomanian ? "Auto-\xEEncepe lucrul" : "Auto-start Work").setDesc(isRomanian ? "\xCEncepe automat sesiunile de lucru dup\u0103 pauze" : "Automatically start work sessions after breaks").addToggle((toggle) => toggle.setValue(this.plugin.settings.pomodoroAutoStartWork).onChange((value) => __async(this, null, function* () {
      this.plugin.settings.pomodoroAutoStartWork = value;
      yield this.plugin.saveSettings();
    })));
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  RelaxingTodoView,
  VIEW_TYPE_RELAXING_TODO
});
//# sourceMappingURL=main.js.map
