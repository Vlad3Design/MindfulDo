import { App, Plugin, PluginSettingTab, Setting, WorkspaceLeaf, ItemView, Notice } from 'obsidian';

interface RelaxingTodoSettings {
	defaultCategory: string;
	enableNotifications: boolean;
	theme: string;
	userName: string;
	language: string;
	sidebarPosition: string;
	autoDeleteExpired: boolean;
	// Pomodoro Settings
	pomodoroWorkTime: number; // minutes
	pomodoroBreakTime: number; // minutes
	pomodoroLongBreakTime: number; // minutes
	pomodoroSessionsBeforeLongBreak: number;
	pomodoroAutoStartBreaks: boolean;
	pomodoroAutoStartWork: boolean;
	// Feature Toggles
	enableTasks: boolean;
	enableReminders: boolean;
	enableHabits: boolean;
	enableAnalytics: boolean;
	enableCalendar: boolean;
	enablePomodoro: boolean;
}

const DEFAULT_SETTINGS: RelaxingTodoSettings = {
	defaultCategory: 'personal',
	enableNotifications: true,
	theme: 'default',
	userName: 'Vlad',
	language: 'ro',
	sidebarPosition: 'left',
	autoDeleteExpired: false,
	// Pomodoro Defaults
	pomodoroWorkTime: 25,
	pomodoroBreakTime: 5,
	pomodoroLongBreakTime: 15,
	pomodoroSessionsBeforeLongBreak: 4,
	pomodoroAutoStartBreaks: false,
	pomodoroAutoStartWork: false,
	// Feature Toggles
	enableTasks: true,
	enableReminders: true,
	enableHabits: true,
	enableAnalytics: true,
	enableCalendar: true,
	enablePomodoro: true
}

interface Task {
	id: number;
	text: string;
	category: string;
	completed: boolean;
	createdAt: string;
	completedAt?: string;
}

interface Reminder {
	id: number;
	text: string;
	dateTime: string;
	expired: boolean;
	createdAt: string;
}

interface Habit {
	id: number;
	name: string;
	description?: string;
	color: string;
	createdAt: string;
	streak: number;
	bestStreak: number;
	completions: { [date: string]: boolean }; // YYYY-MM-DD format
}

export const VIEW_TYPE_RELAXING_TODO = "relaxing-todo-view";

export default class RelaxingTodoPlugin extends Plugin {
	settings: RelaxingTodoSettings;
	private dataFilePath: string;
	private lastDataUpdate: number = 0;

	async onload() {
		await this.loadSettings();
		
		// Set up data file path for monitoring
		this.dataFilePath = this.app.vault.configDir + '/plugins/mindfuldo/data.json';

		// Înregistrează view-ul custom
		this.registerView(
			VIEW_TYPE_RELAXING_TODO,
			(leaf) => new RelaxingTodoView(leaf, this)
		);

		// Monitor data file changes for cross-device sync
		this.registerEvent(
			this.app.vault.on('modify', (file) => {
				if (file.path.includes('mindfuldo') || file.path.includes('data.json')) {
					this.handleDataFileChange();
				}
			})
		);

		// Periodic sync check (every 5 seconds) as a fallback
		this.registerInterval(
			window.setInterval(() => {
				this.checkForDataChanges();
			}, 5000)
		);

		// Adaugă icon în ribbon (sidebar stânga)
		const ribbonIconEl = this.addRibbonIcon('checkmark', 'MindfulDo - Task Manager', (evt: MouseEvent) => {
			this.activateView();
		});
		ribbonIconEl.addClass('relaxing-todo-ribbon-class');

		// Adaugă comandă
		this.addCommand({
			id: 'open-relaxing-todo',
			name: 'Open MindfulDo',
			callback: () => {
				this.activateView();
			}
		});

		// Adaugă tab pentru settings
		this.addSettingTab(new RelaxingTodoSettingTab(this.app, this));
	}

	onunload() {
		// Cleanup când plugin-ul se dezactivează
	}

	async activateView() {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(VIEW_TYPE_RELAXING_TODO);

		if (leaves.length > 0) {
			// Dacă view-ul există deja, îl activează
			leaf = leaves[0];
		} else {
			// Creează un nou view în sidebar-ul selectat
			if (this.settings.sidebarPosition === 'right') {
				leaf = workspace.getRightLeaf(false);
			} else {
				leaf = workspace.getLeftLeaf(false);
			}
			await leaf?.setViewState({ type: VIEW_TYPE_RELAXING_TODO, active: true });
		}

		// Activează tab-ul
		if (leaf) {
			workspace.revealLeaf(leaf);
		}
	}

	async moveViewToSidebar(newPosition: string) {
		const { workspace } = this.app;
		const leaves = workspace.getLeavesOfType(VIEW_TYPE_RELAXING_TODO);
		
		if (leaves.length > 0) {
			const currentLeaf = leaves[0];
			
			// Detach view-ul din poziția curentă
			currentLeaf.detach();
			
			// Creează un nou leaf în sidebar-ul dorit
			let newLeaf;
			if (newPosition === 'right') {
				newLeaf = workspace.getRightLeaf(false);
			} else {
				newLeaf = workspace.getLeftLeaf(false);
			}
			
			// Setează view-ul în noul leaf
			await newLeaf?.setViewState({ type: VIEW_TYPE_RELAXING_TODO, active: true });
			
			// Activează noul tab
			if (newLeaf) {
				workspace.revealLeaf(newLeaf);
			}
		}
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
		// Refresh all open views when settings change
		this.refreshViews();
	}

	refreshViews() {
		const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_RELAXING_TODO);
		leaves.forEach(leaf => {
			if (leaf.view instanceof RelaxingTodoView) {
				leaf.view.refreshInterface();
			}
		});
	}

	private async handleDataFileChange() {
		// Debounce rapid successive changes
		const now = Date.now();
		if (now - this.lastDataUpdate < 1000) {
			return;
		}
		this.lastDataUpdate = now;

		// Refresh all open views to sync with external changes
		const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_RELAXING_TODO);
		leaves.forEach(leaf => {
			if (leaf.view instanceof RelaxingTodoView) {
				leaf.view.syncWithExternalChanges();
			}
		});
	}

	private async checkForDataChanges() {
		// Alternative sync method - check for data file modification time
		try {
			const stat = await this.app.vault.adapter.stat(this.dataFilePath);
			if (stat && stat.mtime > this.lastDataUpdate) {
				this.handleDataFileChange();
			}
		} catch (error) {
			// File doesn't exist yet or other error - ignore
		}
	}
}

export class RelaxingTodoView extends ItemView {
	plugin: RelaxingTodoPlugin;
	private tasks: Task[] = [];
	private reminders: Reminder[] = [];
	private habits: Habit[] = [];
	private currentCategory = 'toate';
	private currentView = 'tasks'; // 'tasks', 'reminders', 'habits', 'analytics', 'calendar', 'pomodoro'
	
	// Pomodoro Timer State
	private pomodoroTimer: number | null = null;
	private pomodoroTimeLeft: number = 0; // seconds
	private pomodoroIsRunning: boolean = false;
	private pomodoroMode: 'work' | 'break' | 'longBreak' = 'work';
	private pomodoroCompletedSessions: number = 0;
	private pomodoroCurrentCycle: number = 1;

	// Analytics State
	private currentAnalyticsWeek: Date = new Date();

	constructor(leaf: WorkspaceLeaf, plugin: RelaxingTodoPlugin) {
		super(leaf);
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

	async onOpen() {
		const container = this.containerEl.children[1];
		container.empty();
		container.addClass('mindfuldo-container');
		container.setAttribute('data-theme', this.plugin.settings.theme);

		// Încarcă datele salvate
		await this.loadData();

		// Creează interfața
		this.createInterface(container);
		
		// Inițializează timpul și salutul
		this.updateDateTime();
		setInterval(() => this.updateDateTime(), 1000);

		// Verifică reminder-urile expirate
		this.checkExpiredReminders();
		setInterval(() => this.checkExpiredReminders(), 60000); // verifică la fiecare minut
		
		// Auto-save data every 30 seconds
		setInterval(async () => await this.saveData(), 30000);
	}

	async onClose() {
		// Save data before closing
		await this.saveData();
		
		// Cleanup pomodoro timer
		if (this.pomodoroTimer) {
			clearInterval(this.pomodoroTimer);
			this.pomodoroTimer = null;
		}
		// Cleanup când view-ul se închide
	}

	refreshInterface() {
		// Reîncarcă interfața cu noile setări de limbă
		const container = this.containerEl.children[1];
		container.empty();
		container.addClass('mindfuldo-container');
		container.setAttribute('data-theme', this.plugin.settings.theme);
		
		this.createInterface(container);
		this.updateDateTime();
		this.renderCurrentView();
	}

	async syncWithExternalChanges() {
		// Reload data from disk and refresh the current view
		// This fixes the mobile-desktop sync issue for habits
		try {
			await this.loadData();
			
			// Update the display based on current view
			switch (this.currentView) {
				case 'habits':
					this.renderHabits();
					break;
				case 'tasks':
					this.renderTasks();
					break;
				case 'reminders':
					this.renderReminders();
					break;
				case 'analytics':
					this.renderAnalytics();
					break;
				case 'calendar':
					this.renderCalendar();
					break;
				case 'pomodoro':
					this.renderPomodoro();
					break;
			}
		} catch (error) {
			console.log('MindfulDo: Error syncing external changes:', error);
		}
	}

	private createInterface(container: Element) {
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
							<button class="add-btn" id="addBtn">${this.plugin.settings.language === 'ro' ? 'Adaugă' : 'Add'}</button>
						</div>
					</div>

					<!-- Categories -->
					<div class="categories">
						<button class="category-btn active" data-category="toate">
							<span>📋</span> ${this.plugin.settings.language === 'ro' ? 'Toate' : 'All'}
						</button>
						<button class="category-btn" data-category="work">
							<span>💼</span> ${this.plugin.settings.language === 'ro' ? 'Lucru' : 'Work'}
						</button>
						<button class="category-btn" data-category="personal">
							<span>🎯</span> Personal
						</button>
						<button class="category-btn" data-category="health">
							<span>🏃‍♂️</span> ${this.plugin.settings.language === 'ro' ? 'Sănătate' : 'Health'}
						</button>
						<button class="category-btn" data-category="learning">
							<span>📚</span> ${this.plugin.settings.language === 'ro' ? 'Învățare' : 'Learning'}
						</button>
						<button class="category-btn" data-category="hobby">
							<span>🎨</span> Hobby
						</button>
					</div>

					<!-- Tasks Section -->
					<div class="tasks-section">
						<div class="tasks-header">
							<h2 class="tasks-title">${this.plugin.settings.language === 'ro' ? 'Sarcinile dvs.' : 'Your Tasks'}</h2>
							<div class="task-counter" id="taskCounter">0 ${this.plugin.settings.language === 'ro' ? 'sarcini' : 'tasks'}</div>
						</div>
						<div class="tasks-list" id="tasksList"></div>
						<button class="clear-completed" id="clearCompleted" style="display: none;">
							${this.plugin.settings.language === 'ro' ? 'Șterge finalizate' : 'Clear Completed'}
						</button>
					</div>
				</div>

				<!-- Reminders View -->
				<div class="view-container" id="remindersView" style="display: none;">
					<!-- Reminder Input Section -->
					<div class="reminders-section">
						<div class="reminders-header">
							<h2 class="reminders-title">${this.plugin.settings.language === 'ro' ? 'Amintirile tale' : 'Your Reminders'}</h2>
							<div class="reminder-counter" id="reminderCounter">0 ${this.plugin.settings.language === 'ro' ? 'amintiri' : 'reminders'}</div>
						</div>

						<div class="reminder-input-section">
							<input type="text" class="reminder-text-input" id="reminderTextInput" placeholder="${this.getReminderPlaceholder()}">
							
							<div class="datetime-inputs">
								<input type="date" class="reminder-date-input" id="reminderDateInput">
								<input type="time" class="reminder-time-input" id="reminderTimeInput">
								<button class="add-reminder-btn" id="addReminderBtn">${this.plugin.settings.language === 'ro' ? 'Adaugă amintire' : 'Add Reminder'}</button>
							</div>
						</div>

						<div class="reminders-list" id="remindersList"></div>
					</div>
				</div>

				<!-- Habits View -->
				<div class="view-container" id="habitsView" style="display: none;">
					<div class="habits-section">
						<div class="habits-header">
							<h2 class="habits-title">${this.plugin.settings.language === 'ro' ? 'Obiceiurile tale' : 'Your Habits'}</h2>
							<div class="habit-counter" id="habitCounter">0 ${this.plugin.settings.language === 'ro' ? 'obiceiuri' : 'habits'}</div>
						</div>

						<div class="habit-input-section">
							<div class="habit-input-container">
								<input type="text" class="habit-name-input" id="habitNameInput" placeholder="${this.plugin.settings.language === 'ro' ? 'Nume obicei (ex: Bea apă, Citește, Sport)' : 'Habit name (e.g., Drink water, Read, Exercise)'}">
								<button class="add-habit-btn" id="addHabitBtn">${this.plugin.settings.language === 'ro' ? 'Adaugă' : 'Add'}</button>
							</div>
							<div class="habit-colors" id="habitColors">
								<div class="color-option active" data-color="#4CAF50" style="background: #4CAF50;"></div>
								<div class="color-option" data-color="#2196F3" style="background: #2196F3;"></div>
								<div class="color-option" data-color="#FF9800" style="background: #FF9800;"></div>
								<div class="color-option" data-color="#E91E63" style="background: #E91E63;"></div>
								<div class="color-option" data-color="#9C27B0" style="background: #9C27B0;"></div>
								<div class="color-option" data-color="#00BCD4" style="background: #00BCD4;"></div>
							</div>
						</div>

						<div class="habits-list" id="habitsList"></div>
					</div>
				</div>

				<!-- Analytics View -->
				<div class="view-container" id="analyticsView" style="display: none;">
					<div class="analytics-section">
						<div class="analytics-header">
							<h2 class="analytics-title">${this.plugin.settings.language === 'ro' ? 'Analiză săptămânală' : 'Weekly Analytics'}</h2>
							<div class="week-selector">
								<button class="week-nav-btn" id="prevWeek">‹</button>
								<span class="current-week" id="currentWeek"></span>
								<button class="week-nav-btn" id="nextWeek">›</button>
							</div>
						</div>

						<div class="analytics-cards">
							<!-- Tasks Analytics -->
							<div class="analytics-card">
								<div class="card-header">
									<h3>📝 ${this.plugin.settings.language === 'ro' ? 'Sarcini' : 'Tasks'}</h3>
								</div>
								<div class="card-content">
									<div class="main-stat">
										<span class="stat-number" id="weeklyTasksCompleted">0</span>
										<span class="stat-label">${this.plugin.settings.language === 'ro' ? 'completate' : 'completed'}</span>
									</div>
									<div class="sub-stats">
										<div class="sub-stat">
											<span class="change-indicator" id="tasksChange">+0%</span>
											<span>${this.plugin.settings.language === 'ro' ? 'vs săptămâna trecută' : 'vs last week'}</span>
										</div>
										<div class="sub-stat">
											<span class="peak-day" id="tasksPeakDay">${this.plugin.settings.language === 'ro' ? 'Cea mai bună: -' : 'Best day: -'}</span>
										</div>
									</div>
								</div>
							</div>

							<!-- Habits Analytics -->
							<div class="analytics-card">
								<div class="card-header">
									<h3>🔄 ${this.plugin.settings.language === 'ro' ? 'Obiceiuri' : 'Habits'}</h3>
								</div>
								<div class="card-content">
									<div class="main-stat">
										<span class="stat-number" id="weeklyHabitsRate">0%</span>
										<span class="stat-label">${this.plugin.settings.language === 'ro' ? 'rata de succes' : 'success rate'}</span>
									</div>
									<div class="sub-stats">
										<div class="sub-stat">
											<span class="habits-completed" id="habitsCompleted">0.0 ${this.plugin.settings.language === 'ro' ? 'habit-uri/zi' : 'habits/day'}</span>
										</div>
										<div class="sub-stat">
											<span class="streak-count" id="activeStreaks">0</span>
											<span>${this.plugin.settings.language === 'ro' ? 'streak-uri active' : 'active streaks'}</span>
										</div>
									</div>
								</div>
							</div>

							<!-- Pomodoro Analytics -->
							<div class="analytics-card">
								<div class="card-header">
									<h3>🍅 Pomodoro</h3>
								</div>
								<div class="card-content">
									<div class="main-stat">
										<span class="stat-number" id="weeklyPomodoroSessions">0</span>
										<span class="stat-label">${this.plugin.settings.language === 'ro' ? 'sesiuni' : 'sessions'}</span>
									</div>
									<div class="sub-stats">
										<div class="sub-stat">
											<span class="focus-time" id="totalFocusTime">0h 0min</span>
											<span>${this.plugin.settings.language === 'ro' ? 'timp de focus' : 'focus time'}</span>
										</div>
										<div class="sub-stat">
											<span class="avg-session" id="avgSessionLength">0min</span>
											<span>${this.plugin.settings.language === 'ro' ? 'sesiune medie' : 'avg session'}</span>
										</div>
									</div>
								</div>
							</div>

							<!-- Productivity Score -->
							<div class="analytics-card productivity-card">
								<div class="card-header">
									<h3>⚡ ${this.plugin.settings.language === 'ro' ? 'Scorul săptămânii' : 'Weekly Score'}</h3>
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
												<span class="breakdown-label">${this.plugin.settings.language === 'ro' ? 'Sarcini' : 'Tasks'}</span>
												<span class="breakdown-value" id="tasksScore">0/30</span>
											</div>
											<div class="breakdown-item">
												<span class="breakdown-label">${this.plugin.settings.language === 'ro' ? 'Obiceiuri' : 'Habits'}</span>
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
							<h3>${this.plugin.settings.language === 'ro' ? 'Activitatea zilnică' : 'Daily Activity'}</h3>
							<div class="daily-chart" id="dailyChart"></div>
						</div>
					</div>
				</div>

				<!-- Calendar View -->
				<div class="view-container" id="calendarView" style="display: none;">
					<div class="calendar-section">
						<div class="calendar-header">
							<button class="calendar-nav-btn" id="prevMonth">‹</button>
							<h2 class="calendar-title" id="calendarTitle"></h2>
							<button class="calendar-nav-btn" id="nextMonth">›</button>
						</div>
						<div class="calendar-grid" id="calendarGrid"></div>
						<div class="calendar-legend">
													<div class="legend-item">
							<span class="legend-dot task-dot"></span>
							<span>${this.plugin.settings.language === 'ro' ? 'Sarcini' : 'Tasks'}</span>
						</div>
							<div class="legend-item">
								<span class="legend-dot reminder-dot"></span>
								<span>${this.plugin.settings.language === 'ro' ? 'Amintiri' : 'Reminders'}</span>
							</div>
						</div>
					</div>
				</div>

				<!-- Pomodoro View -->
				<div class="view-container" id="pomodoroView" style="display: none;">
					<div class="pomodoro-section">
						<div class="pomodoro-header">
							<h2 class="pomodoro-title">${this.plugin.settings.language === 'ro' ? 'Timer Pomodoro' : 'Pomodoro Timer'}</h2>
							<div class="pomodoro-mode" id="pomodoroMode">${this.plugin.settings.language === 'ro' ? 'Timp de lucru' : 'Work Time'}</div>
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
								<span id="startPauseIcon">▶️</span>
								<span id="startPauseText">${this.plugin.settings.language === 'ro' ? 'Început' : 'Start'}</span>
							</button>
							<button class="pomodoro-btn reset" id="resetBtn">
								<span>🔄</span> ${this.plugin.settings.language === 'ro' ? 'Reset' : 'Reset'}
							</button>
							<button class="pomodoro-btn skip" id="skipBtn">
								<span>⏭️</span> ${this.plugin.settings.language === 'ro' ? 'Sărit' : 'Skip'}
							</button>
						</div>

						<div class="pomodoro-stats">
							<div class="stat-item">
								<span class="stat-label">${this.plugin.settings.language === 'ro' ? 'Sesiuni complete' : 'Completed Sessions'}</span>
								<span class="stat-value" id="completedSessions">0</span>
							</div>
							<div class="stat-item">
								<span class="stat-label">${this.plugin.settings.language === 'ro' ? 'Ciclul curent' : 'Current Cycle'}</span>
								<span class="stat-value" id="currentCycle">1</span>
							</div>
						</div>

										<div class="pomodoro-presets">
					<h3 class="presets-title">${this.plugin.settings.language === 'ro' ? 'Presetări' : 'Presets'}</h3>
					<div class="presets-grid">
						<div class="preset-btn" data-preset="classic">
							<div class="preset-name">${this.plugin.settings.language === 'ro' ? 'Clasic' : 'Classic'}</div>
							<div class="preset-details">25/5/15</div>
						</div>
						<div class="preset-btn" data-preset="extended">
							<div class="preset-name">${this.plugin.settings.language === 'ro' ? 'Extins' : 'Extended'}</div>
							<div class="preset-details">45/10/30</div>
						</div>
						<div class="preset-btn" data-preset="short">
							<div class="preset-name">${this.plugin.settings.language === 'ro' ? 'Scurt' : 'Short'}</div>
							<div class="preset-details">15/3/10</div>
						</div>
						<div class="preset-btn" data-preset="custom">
							<div class="preset-name">${this.plugin.settings.language === 'ro' ? 'Personalizat' : 'Custom'}</div>
							<div class="preset-details">-/-/-</div>
						</div>
					</div>
				</div>

				<div class="pomodoro-settings-quick">
					<h3>${this.plugin.settings.language === 'ro' ? 'Setări rapide' : 'Quick Settings'}</h3>
					<div class="quick-settings-grid">
						<div class="setting-item">
							<label>${this.plugin.settings.language === 'ro' ? 'Timp lucru (min)' : 'Work Time (min)'}</label>
							<input type="number" id="workTimeInput" min="1" max="60" value="${this.plugin.settings.pomodoroWorkTime}">
						</div>
						<div class="setting-item">
							<label>${this.plugin.settings.language === 'ro' ? 'Pauză scurtă (min)' : 'Short Break (min)'}</label>
							<input type="number" id="breakTimeInput" min="1" max="30" value="${this.plugin.settings.pomodoroBreakTime}">
						</div>
						<div class="setting-item">
							<label>${this.plugin.settings.language === 'ro' ? 'Pauză lungă (min)' : 'Long Break (min)'}</label>
							<input type="number" id="longBreakTimeInput" min="1" max="60" value="${this.plugin.settings.pomodoroLongBreakTime}">
						</div>
					</div>
				</div>
					</div>
				</div>
			</div>
		`;

		// Adaugă event listeners
		this.setupEventListeners();
		this.renderCurrentView();
	}

	private generateNavigationTabs(): string {
		const isRomanian = this.plugin.settings.language === 'ro';
		const tabs: string[] = [];
		let firstTab = true;

		// Count enabled tabs for dynamic grid
		const enabledTabs = [
			this.plugin.settings.enableTasks,
			this.plugin.settings.enableReminders,
			this.plugin.settings.enableHabits,
			this.plugin.settings.enableAnalytics,
			this.plugin.settings.enableCalendar,
			this.plugin.settings.enablePomodoro
		].filter(Boolean).length;

		// Tasks tab
		if (this.plugin.settings.enableTasks) {
			tabs.push(`
				<button class="nav-tab ${firstTab ? 'active' : ''} nav-tab-tasks" data-view="tasks">
					<span>📝</span> ${isRomanian ? 'Sarcini' : 'Tasks'}
				</button>
			`);
			if (firstTab) firstTab = false;
		}

		// Reminders tab
		if (this.plugin.settings.enableReminders) {
			tabs.push(`
				<button class="nav-tab ${firstTab ? 'active' : ''} nav-tab-reminders" data-view="reminders">
					<span>⏰</span> ${isRomanian ? 'Amintiri' : 'Reminders'}
				</button>
			`);
			if (firstTab) firstTab = false;
		}

		// Habits tab
		if (this.plugin.settings.enableHabits) {
			tabs.push(`
				<button class="nav-tab ${firstTab ? 'active' : ''} nav-tab-habits" data-view="habits">
					<span>🔄</span> ${isRomanian ? 'Obiceiuri' : 'Habits'}
				</button>
			`);
			if (firstTab) firstTab = false;
		}

		// Analytics tab
		if (this.plugin.settings.enableAnalytics) {
			tabs.push(`
				<button class="nav-tab ${firstTab ? 'active' : ''} nav-tab-analytics" data-view="analytics">
					<span>📊</span> Analytics
				</button>
			`);
			if (firstTab) firstTab = false;
		}

		// Calendar tab
		if (this.plugin.settings.enableCalendar) {
			tabs.push(`
				<button class="nav-tab ${firstTab ? 'active' : ''} nav-tab-calendar" data-view="calendar">
					<span>📅</span> ${isRomanian ? 'Calendar' : 'Calendar'}
				</button>
			`);
			if (firstTab) firstTab = false;
		}

		// Pomodoro tab
		if (this.plugin.settings.enablePomodoro) {
			tabs.push(`
				<button class="nav-tab ${firstTab ? 'active' : ''} nav-tab-pomodoro" data-view="pomodoro">
					<span>🍅</span> Pomodoro
				</button>
			`);
			if (firstTab) firstTab = false;
		}

		// If no tabs are enabled, default to tasks
		if (tabs.length === 0) {
			tabs.push(`
				<button class="nav-tab active nav-tab-tasks" data-view="tasks">
					<span>📝</span> ${isRomanian ? 'Sarcini' : 'Tasks'}
				</button>
			`);
		}

		// Generate dynamic grid CSS based on number of enabled tabs
		const gridCSS = this.generateDynamicGridCSS(enabledTabs);

		return `
			<style id="dynamic-nav-grid">
				${gridCSS}
			</style>
			${tabs.join('')}
		`;
	}

	private generateDynamicGridCSS(enabledTabs: number): string {
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

	private setupEventListeners() {
		const addBtn = this.containerEl.querySelector('#addBtn') as HTMLButtonElement;
		const taskInput = this.containerEl.querySelector('#taskInput') as HTMLInputElement;
		const clearCompleted = this.containerEl.querySelector('#clearCompleted') as HTMLButtonElement;
		const addReminderBtn = this.containerEl.querySelector('#addReminderBtn') as HTMLButtonElement;
		const reminderTextInput = this.containerEl.querySelector('#reminderTextInput') as HTMLInputElement;
		const addHabitBtn = this.containerEl.querySelector('#addHabitBtn') as HTMLButtonElement;
		const habitNameInput = this.containerEl.querySelector('#habitNameInput') as HTMLInputElement;

		// Add task
		addBtn?.addEventListener('click', () => this.addTask());
		taskInput?.addEventListener('keypress', (e) => {
			if (e.key === 'Enter') this.addTask();
		});

		// Clear completed
		clearCompleted?.addEventListener('click', () => this.clearCompleted());

		// Add reminder
		addReminderBtn?.addEventListener('click', () => this.addReminder());
		reminderTextInput?.addEventListener('keypress', (e) => {
			if (e.key === 'Enter') this.addReminder();
		});

		// Add habit
		addHabitBtn?.addEventListener('click', async () => await this.addHabit());
		habitNameInput?.addEventListener('keypress', async (e) => {
			if (e.key === 'Enter') await this.addHabit();
		});

		// Habit color selection
		this.containerEl.querySelectorAll('.color-option').forEach(colorBtn => {
			colorBtn.addEventListener('click', (e) => {
				this.containerEl.querySelectorAll('.color-option').forEach(btn => btn.classList.remove('active'));
				(e.currentTarget as HTMLElement).classList.add('active');
			});
		});

		// Category buttons
		this.containerEl.querySelectorAll('.category-btn').forEach(btn => {
			btn.addEventListener('click', (e) => {
				const category = (e.currentTarget as HTMLElement).getAttribute('data-category');
				if (category) this.setCategory(category);
			});
		});

		// Navigation tabs
		this.containerEl.querySelectorAll('.nav-tab').forEach(tab => {
			tab.addEventListener('click', (e) => {
				const view = (e.currentTarget as HTMLElement).getAttribute('data-view');
				if (view) {
					this.currentView = view as 'tasks' | 'reminders' | 'habits' | 'analytics' | 'calendar' | 'pomodoro';
					
					// Update active tab
					this.containerEl.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
					(e.currentTarget as HTMLElement).classList.add('active');
					
					// Show/hide views
					this.containerEl.querySelectorAll('.view-container').forEach(container => {
						(container as HTMLElement).style.display = 'none';
					});
					
					const targetView = this.containerEl.querySelector(`#${view}View`) as HTMLElement;
					if (targetView) {
						targetView.style.display = 'block';
					}
					
					this.renderCurrentView();
				}
			});
		});

		// Pomodoro event listeners
		const startPauseBtn = this.containerEl.querySelector('#startPauseBtn');
		const resetBtn = this.containerEl.querySelector('#resetBtn');
		const skipBtn = this.containerEl.querySelector('#skipBtn');
		const workTimeInput = this.containerEl.querySelector('#workTimeInput') as HTMLInputElement;
		const breakTimeInput = this.containerEl.querySelector('#breakTimeInput') as HTMLInputElement;
		const longBreakTimeInput = this.containerEl.querySelector('#longBreakTimeInput') as HTMLInputElement;

		startPauseBtn?.addEventListener('click', () => this.togglePomodoroTimer());
		resetBtn?.addEventListener('click', () => this.resetPomodoroTimer());
		skipBtn?.addEventListener('click', () => this.skipPomodoroSession());

		// Quick settings change handlers
		workTimeInput?.addEventListener('change', () => {
			this.plugin.settings.pomodoroWorkTime = parseInt(workTimeInput.value);
			this.savePomodoroSettingsQuietly();
			if (!this.pomodoroIsRunning && this.pomodoroMode === 'work') {
				this.initializePomodoroTimer();
			}
			this.updateActivePreset();
		});

		breakTimeInput?.addEventListener('change', () => {
			this.plugin.settings.pomodoroBreakTime = parseInt(breakTimeInput.value);
			this.savePomodoroSettingsQuietly();
			if (!this.pomodoroIsRunning && this.pomodoroMode === 'break') {
				this.initializePomodoroTimer();
			}
			this.updateActivePreset();
		});

		longBreakTimeInput?.addEventListener('change', () => {
			this.plugin.settings.pomodoroLongBreakTime = parseInt(longBreakTimeInput.value);
			this.savePomodoroSettingsQuietly();
			if (!this.pomodoroIsRunning && this.pomodoroMode === 'longBreak') {
				this.initializePomodoroTimer();
			}
			this.updateActivePreset();
		});

		// Preset buttons
		this.containerEl.querySelectorAll('.preset-btn').forEach(btn => {
			btn.addEventListener('click', (e) => {
				const preset = (e.currentTarget as HTMLElement).getAttribute('data-preset');
				if (preset) {
					this.applyPomodoroPreset(preset);
				}
			});
		});

		// Analytics week navigation
		const prevWeekBtn = this.containerEl.querySelector('#prevWeek');
		const nextWeekBtn = this.containerEl.querySelector('#nextWeek');
		
		prevWeekBtn?.addEventListener('click', () => {
			this.navigateToPreviousWeek();
		});
		
		nextWeekBtn?.addEventListener('click', () => {
			this.navigateToNextWeek();
		});
	}

	private updateDateTime() {
		const now = new Date();
		const hour = now.getHours();

		let greeting = '';
		const userName = this.plugin.settings.userName;
		const isRomanian = this.plugin.settings.language === 'ro';

		if (hour >= 5 && hour < 12) {
			greeting = isRomanian ? `Bună dimineața, ${userName}!` : `Good morning, ${userName}!`;
		} else if (hour >= 12 && hour < 17) {
			greeting = isRomanian ? `Bună ziua, ${userName}!` : `Good afternoon, ${userName}!`;
		} else {
			greeting = isRomanian ? `Bună seara, ${userName}!` : `Good evening, ${userName}!`;
		}

		const greetingEl = this.containerEl.querySelector('#greeting');
		if (greetingEl) greetingEl.textContent = greeting;

		const options: Intl.DateTimeFormatOptions = {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		};
		const locale = isRomanian ? 'ro-RO' : 'en-US';
		const timeString = now.toLocaleDateString(locale, options);
		const timeEl = this.containerEl.querySelector('#timeInfo');
		if (timeEl) timeEl.textContent = timeString;
	}

	private async addTask() {
		const taskInput = this.containerEl.querySelector('#taskInput') as HTMLInputElement;
		const taskText = taskInput.value.trim();
		
		if (taskText === '') return;

		const task = {
			id: Date.now(),
			text: taskText,
			completed: false,
			category: this.currentCategory === 'toate' ? 'work' : this.currentCategory,
			createdAt: this.getLocalDateString(new Date())
		};

		this.tasks.push(task);
		await this.saveData();
		
		taskInput.value = '';
		
		// Feedback relaxant
		taskInput.style.transform = 'scale(0.99)';
		taskInput.style.background = 'rgba(76, 175, 80, 0.15)';
		taskInput.style.borderColor = '#66bb6a';
		setTimeout(() => {
			taskInput.style.transform = 'scale(1)';
			taskInput.style.background = '';
			taskInput.style.borderColor = '';
		}, 800);

		setTimeout(() => {
			this.renderCurrentView();
		}, 100);
	}

	private setCategory(category: string) {
		this.currentCategory = category;
		
		// Update active button
		this.containerEl.querySelectorAll('.category-btn').forEach(btn => {
			btn.classList.remove('active');
		});
		
		const activeBtn = this.containerEl.querySelector(`[data-category="${category}"]`);
		activeBtn?.classList.add('active');
		
		setTimeout(() => {
			this.renderCurrentView();
		}, 150);
	}

	private toggleTask(id: number) {
		const taskIndex = this.tasks.findIndex(task => task.id === id);
		if (taskIndex !== -1) {
			this.tasks[taskIndex].completed = !this.tasks[taskIndex].completed;
			if (this.tasks[taskIndex].completed) {
				this.tasks[taskIndex].completedAt = this.getLocalDateTimeString(new Date());
			} else {
				delete this.tasks[taskIndex].completedAt;
			}
			this.saveData();
			
			// Render only the current view to prevent blinking
			if (this.currentView === 'tasks') {
				this.renderTasks();
			}
		}
	}

	private deleteTask(id: number) {
		this.tasks = this.tasks.filter(task => task.id !== id);
		this.saveData();
		this.renderTasks();
	}

	private editTask(id: number) {
		const task = this.tasks.find(t => t.id === id);
		if (!task) return;

		const isRomanian = this.plugin.settings.language === 'ro';
		
		// Remove any existing modal first
		const existingModal = document.querySelector('.mindfuldo-edit-modal');
		if (existingModal) {
			document.body.removeChild(existingModal);
		}
		
		// Create edit modal
		const modal = document.createElement('div');
		modal.className = 'mindfuldo-edit-modal';
		modal.innerHTML = `
			<div class="edit-modal-content">
				<h3>${isRomanian ? 'Editează sarcina' : 'Edit Task'}</h3>
				<div class="edit-form">
					<div class="form-group">
						<label>${isRomanian ? 'Text:' : 'Text:'}</label>
						<input type="text" id="editTaskText" value="${task.text}" placeholder="${isRomanian ? 'Introduceți textul sarcinii' : 'Enter task text'}">
					</div>
					<div class="form-group">
						<label>${isRomanian ? 'Categoria:' : 'Category:'}</label>
						<select id="editTaskCategory">
							<option value="work" ${task.category === 'work' ? 'selected' : ''}>${this.getCategoryName('work')}</option>
							<option value="personal" ${task.category === 'personal' ? 'selected' : ''}>${this.getCategoryName('personal')}</option>
							<option value="health" ${task.category === 'health' ? 'selected' : ''}>${this.getCategoryName('health')}</option>
							<option value="learning" ${task.category === 'learning' ? 'selected' : ''}>${this.getCategoryName('learning')}</option>
							<option value="hobby" ${task.category === 'hobby' ? 'selected' : ''}>${this.getCategoryName('hobby')}</option>
						</select>
					</div>
					<div class="form-actions">
						<button id="saveTaskEdit" class="save-btn">${isRomanian ? 'Salvează' : 'Save'}</button>
						<button id="cancelTaskEdit" class="cancel-btn">${isRomanian ? 'Anulează' : 'Cancel'}</button>
					</div>
				</div>
			</div>
		`;

		document.body.appendChild(modal);

		// Add event listeners
		const saveBtn = modal.querySelector('#saveTaskEdit');
		const cancelBtn = modal.querySelector('#cancelTaskEdit');
		const textInput = modal.querySelector('#editTaskText') as HTMLInputElement;
		const categorySelect = modal.querySelector('#editTaskCategory') as HTMLSelectElement;

		const closeModal = () => {
			if (document.body.contains(modal)) {
				document.body.removeChild(modal);
			}
		};

		const saveChanges = async () => {
			const newText = textInput.value.trim();
			const newCategory = categorySelect.value;

			if (!newText) {
				new Notice(isRomanian ? 'Textul nu poate fi gol!' : 'Text cannot be empty!');
				textInput.focus();
				return;
			}

			try {
				// Update task
				task.text = newText;
				task.category = newCategory;
				
				// Save data
				await this.saveData();
				
				// Refresh display
				if (this.currentView === 'tasks') {
					this.renderTasks();
				}
				
				// Show success message
				new Notice(isRomanian ? 'Sarcina a fost actualizată!' : 'Task updated successfully!');
				
				// Close modal
				closeModal();
			} catch (error) {
				console.error('Error saving task:', error);
				new Notice(isRomanian ? 'Eroare la salvarea sarcinii!' : 'Error saving task!');
			}
		};

		saveBtn?.addEventListener('click', saveChanges);
		
		cancelBtn?.addEventListener('click', closeModal);

		// Close on outside click
		modal.addEventListener('click', (e) => {
			if (e.target === modal) {
				closeModal();
			}
		});

		// Handle Enter key
		textInput.addEventListener('keypress', (e) => {
			if (e.key === 'Enter') {
				saveChanges();
			}
		});

		// Handle Escape key
		modal.addEventListener('keydown', (e) => {
			if (e.key === 'Escape') {
				closeModal();
			}
		});

		// Focus on text input
		setTimeout(() => textInput.focus(), 100);
	}

	private clearCompleted() {
		this.tasks = this.tasks.filter(task => !task.completed);
		this.saveData();
		setTimeout(() => {
			this.renderCurrentView();
		}, 50);
	}

	private renderCurrentView() {
		const tasksView = this.containerEl.querySelector('#tasksView');
		const remindersView = this.containerEl.querySelector('#remindersView');
		const habitsView = this.containerEl.querySelector('#habitsView');
		const analyticsView = this.containerEl.querySelector('#analyticsView');
		const calendarView = this.containerEl.querySelector('#calendarView');
		const pomodoroView = this.containerEl.querySelector('#pomodoroView');

		if (this.currentView === 'tasks') {
			tasksView?.classList.add('active');
			remindersView?.classList.remove('active');
			habitsView?.classList.remove('active');
			analyticsView?.classList.remove('active');
			calendarView?.classList.remove('active');
			pomodoroView?.classList.remove('active');
			this.renderTasks();
		} else if (this.currentView === 'reminders') {
			tasksView?.classList.remove('active');
			remindersView?.classList.add('active');
			habitsView?.classList.remove('active');
			analyticsView?.classList.remove('active');
			calendarView?.classList.remove('active');
			pomodoroView?.classList.remove('active');
			this.renderReminders();
		} else if (this.currentView === 'habits') {
			tasksView?.classList.remove('active');
			remindersView?.classList.remove('active');
			habitsView?.classList.add('active');
			analyticsView?.classList.remove('active');
			calendarView?.classList.remove('active');
			pomodoroView?.classList.remove('active');
			this.renderHabits();
		} else if (this.currentView === 'analytics') {
			tasksView?.classList.remove('active');
			remindersView?.classList.remove('active');
			habitsView?.classList.remove('active');
			analyticsView?.classList.add('active');
			calendarView?.classList.remove('active');
			pomodoroView?.classList.remove('active');
			this.renderAnalytics();
		} else if (this.currentView === 'calendar') {
			tasksView?.classList.remove('active');
			remindersView?.classList.remove('active');
			habitsView?.classList.remove('active');
			analyticsView?.classList.remove('active');
			calendarView?.classList.add('active');
			pomodoroView?.classList.remove('active');
			this.renderCalendar();
		} else if (this.currentView === 'pomodoro') {
			tasksView?.classList.remove('active');
			remindersView?.classList.remove('active');
			habitsView?.classList.remove('active');
			analyticsView?.classList.remove('active');
			calendarView?.classList.remove('active');
			pomodoroView?.classList.add('active');
			this.renderPomodoro();
		}
	}

	private renderTasks() {
		const tasksList = this.containerEl.querySelector('#tasksList');
		const taskCounter = this.containerEl.querySelector('#taskCounter');
		const clearCompletedBtn = this.containerEl.querySelector('#clearCompleted') as HTMLElement;
		
		if (!tasksList || !taskCounter) return;

		let filteredTasks = this.tasks;
		if (this.currentCategory !== 'toate') {
			filteredTasks = this.tasks.filter(task => task.category === this.currentCategory);
		}

		// Sort tasks
		filteredTasks.sort((a, b) => {
			if (a.completed && !b.completed) return 1;
			if (!a.completed && b.completed) return -1;
			return 0;
		});

		const completedTasks = this.tasks.filter(task => task.completed);
		const activeTasks = this.tasks.filter(task => !task.completed);
		
		// Update counter
		const isRomanian = this.plugin.settings.language === 'ro';
		if (isRomanian) {
			taskCounter.textContent = `${activeTasks.length} ${activeTasks.length !== 1 ? 'sarcini' : 'sarcină'}`;
		} else {
			taskCounter.textContent = `${activeTasks.length} ${activeTasks.length !== 1 ? 'tasks' : 'task'}`;
		}
		
		// Show/hide clear completed button
		clearCompletedBtn.style.display = completedTasks.length > 0 ? 'block' : 'none';

		if (filteredTasks.length === 0) {
			tasksList.innerHTML = '';
			return;
		}

		tasksList.innerHTML = filteredTasks.map(task => `
			<div class="task-item ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
				<div class="task-checkbox ${task.completed ? 'checked' : ''}" data-task-id="${task.id}"></div>
				<div class="task-text" data-task-id="${task.id}">${task.text}</div>
				<div class="task-category ${task.category}" data-task-id="${task.id}">${this.getCategoryName(task.category)}</div>
				<div class="task-actions">
					<button class="task-edit" data-task-id="${task.id}" title="${isRomanian ? 'Editează' : 'Edit'}">✏️</button>
					<button class="task-delete" data-task-id="${task.id}" title="${isRomanian ? 'Șterge' : 'Delete'}">×</button>
				</div>
			</div>
		`).join('');

		// Add event listeners for tasks
		tasksList.querySelectorAll('.task-checkbox').forEach(checkbox => {
			checkbox.addEventListener('click', (e) => {
				const taskId = parseInt((e.target as HTMLElement).getAttribute('data-task-id') || '0');
				this.toggleTask(taskId);
			});
		});

		tasksList.querySelectorAll('.task-edit').forEach(editBtn => {
			editBtn.addEventListener('click', (e) => {
				const taskId = parseInt((e.target as HTMLElement).getAttribute('data-task-id') || '0');
				this.editTask(taskId);
			});
		});

		tasksList.querySelectorAll('.task-delete').forEach(deleteBtn => {
			deleteBtn.addEventListener('click', (e) => {
				const taskId = parseInt((e.target as HTMLElement).getAttribute('data-task-id') || '0');
				this.deleteTask(taskId);
			});
		});
	}

	private getCategoryName(category: string): string {
		const isRomanian = this.plugin.settings.language === 'ro';
		
		const categoryNames: { [key: string]: string } = {
			'toate': isRomanian ? 'Toate' : 'All',
			'lucru': isRomanian ? 'Lucru' : 'Work',
			'work': isRomanian ? 'Lucru' : 'Work',
			'personal': 'Personal',
			'sanatate': isRomanian ? 'Sănătate' : 'Health',
			'health': isRomanian ? 'Sănătate' : 'Health',
			'invatare': isRomanian ? 'Învățare' : 'Learning',
			'learning': isRomanian ? 'Învățare' : 'Learning',
			'hobby': 'Hobby'
		};
		return categoryNames[category] || category;
	}

	private async loadTasks() {
		const data = await this.plugin.loadData();
		this.tasks = data?.tasks || [];
	}

	private async saveTasks() {
		const data = await this.plugin.loadData() || {};
		data.tasks = this.tasks;
		await this.plugin.saveData(data);
	}

	private async loadData() {
		const data = await this.plugin.loadData();
		this.tasks = data?.tasks || [];
		this.reminders = data?.reminders || [];
		this.habits = data?.habits || [];
	}

	private async saveData() {
		const data = await this.plugin.loadData() || {};
		data.tasks = this.tasks;
		data.reminders = this.reminders;
		data.habits = this.habits;
		await this.plugin.saveData(data);
	}

	private getTaskPlaceholder(): string {
		if (this.plugin.settings.language === 'ro') {
			return `Ce aveți de făcut astăzi, ${this.plugin.settings.userName}?`;
		} else {
			return `What do you need to do today, ${this.plugin.settings.userName}?`;
		}
	}

	private getReminderPlaceholder(): string {
		if (this.plugin.settings.language === 'ro') {
			return 'Despre ce să vă amintim?';
		} else {
			return 'What should I remind you about?';
		}
	}

	private getLocalDateString(date: Date): string {
		// Get local date string in YYYY-MM-DD format without timezone conversion
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	}

	private getLocalDateTimeString(date: Date): string {
		// Get local datetime string in YYYY-MM-DDTHH:mm format without timezone conversion
		const dateStr = this.getLocalDateString(date);
		const hours = String(date.getHours()).padStart(2, '0');
		const minutes = String(date.getMinutes()).padStart(2, '0');
		return `${dateStr}T${hours}:${minutes}`;
	}

	private checkExpiredReminders() {
		const now = new Date();
		let hasExpired = false;

		this.reminders.forEach(reminder => {
			const reminderDate = new Date(reminder.dateTime);
			if (!reminder.expired && reminderDate <= now) {
				reminder.expired = true;
				hasExpired = true;
				
				if (this.plugin.settings.enableNotifications) {
					new Notice(`⏰ Amintire: ${reminder.text}`, 5000);
				}
			}
		});

		if (hasExpired) {
			this.saveData();
			if (this.currentView === 'reminders') {
				this.renderReminders();
			}
		}
	}

	private async addReminder() {
		const reminderTextInput = this.containerEl.querySelector('#reminderTextInput') as HTMLInputElement;
		const reminderDateInput = this.containerEl.querySelector('#reminderDateInput') as HTMLInputElement;
		const reminderTimeInput = this.containerEl.querySelector('#reminderTimeInput') as HTMLInputElement;

		const text = reminderTextInput.value.trim();
		const date = reminderDateInput.value;
		const time = reminderTimeInput.value;

		if (!text || !date || !time) {
			new Notice(this.plugin.settings.language === 'ro' ? 'Completați toate câmpurile pentru amintire!' : 'Fill in all fields!');
			return;
		}

		const dateTime = `${date}T${time}`;
		const reminderDate = new Date(dateTime);
		
		if (reminderDate <= new Date()) {
			new Notice(this.plugin.settings.language === 'ro' ? 'Vă rugăm să alegeți o dată și oră din viitor!' : 'Date must be in the future!');
			return;
		}

		const newReminder: Reminder = {
			id: Date.now(),
			text: text,
			dateTime: dateTime,
			expired: false,
			createdAt: this.getLocalDateString(new Date())
		};

		this.reminders.push(newReminder);
		await this.saveData();

		reminderTextInput.value = '';
		reminderDateInput.value = '';
		reminderTimeInput.value = '';

		this.renderReminders();
	}

	private deleteReminder(id: number) {
		this.reminders = this.reminders.filter(reminder => reminder.id !== id);
		this.saveData();
		this.renderReminders();
	}

	private renderReminders() {
		const remindersList = this.containerEl.querySelector('#remindersList');
		const reminderCounter = this.containerEl.querySelector('#reminderCounter');
		
		if (!remindersList || !reminderCounter) return;

		const isRomanian = this.plugin.settings.language === 'ro';

		// Sortează reminder-urile: expirate la sfârșitul listei
		const sortedReminders = this.reminders.sort((a, b) => {
			if (a.expired && !b.expired) return 1;
			if (!a.expired && b.expired) return -1;
			return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
		});

		const activeReminders = this.reminders.filter(reminder => !reminder.expired);
		if (isRomanian) {
			reminderCounter.textContent = `${activeReminders.length} ${activeReminders.length !== 1 ? 'amintiri' : 'amintire'}`;
		} else {
			reminderCounter.textContent = `${activeReminders.length} ${activeReminders.length !== 1 ? 'reminders' : 'reminder'}`;
		}

		if (sortedReminders.length === 0) {
			remindersList.innerHTML = `
				<div class="empty-reminders">
					<div class="empty-reminders-icon">⏰</div>
					<p>${this.plugin.settings.language === 'ro' ? 'Nicio amintire încă. Adaugă prima pentru a începe!' : 'No reminders yet. Add your first to get started!'}</p>
				</div>
			`;
			return;
		}

		remindersList.innerHTML = sortedReminders.map(reminder => {
			const reminderDate = new Date(reminder.dateTime);
			const dateStr = reminderDate.toLocaleDateString('ro-RO');
			const timeStr = reminderDate.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
			
			return `
				<div class="reminder-item ${reminder.expired ? 'expired' : ''}">
					<div class="reminder-content">
						<div class="reminder-text">${reminder.text}</div>
						<div class="reminder-time">${dateStr} la ${timeStr}</div>
						${reminder.expired ? `<div class="time-left expired">${this.plugin.settings.language === 'ro' ? 'Expirat' : 'Expired'}</div>` : ''}
					</div>
					<div class="reminder-actions">
						<button class="reminder-edit" data-reminder-id="${reminder.id}" title="${isRomanian ? 'Editează' : 'Edit'}">✏️</button>
						<button class="reminder-delete" data-reminder-id="${reminder.id}" title="${isRomanian ? 'Șterge' : 'Delete'}">×</button>
					</div>
				</div>
			`;
		}).join('');

		// Adaugă event listeners pentru ștergere
		remindersList.querySelectorAll('.reminder-delete').forEach(deleteBtn => {
			deleteBtn.addEventListener('click', (e) => {
				const reminderId = parseInt((e.target as HTMLElement).getAttribute('data-reminder-id') || '0');
				this.deleteReminder(reminderId);
			});
		});

		// Adaugă event listeners pentru editare
		remindersList.querySelectorAll('.reminder-edit').forEach(editBtn => {
			editBtn.addEventListener('click', (e) => {
				const reminderId = parseInt((e.target as HTMLElement).getAttribute('data-reminder-id') || '0');
				this.editReminder(reminderId);
			});
		});
	}

	private editReminder(id: number) {
		const reminder = this.reminders.find(r => r.id === id);
		if (!reminder) return;

		const isRomanian = this.plugin.settings.language === 'ro';
		const reminderDate = new Date(reminder.dateTime);
		const dateStr = this.getLocalDateString(reminderDate);
		const timeStr = reminderDate.toTimeString().slice(0, 5);
		
		// Remove any existing modal first
		const existingModal = document.querySelector('.mindfuldo-edit-modal');
		if (existingModal) {
			document.body.removeChild(existingModal);
		}
		
		// Create edit modal
		const modal = document.createElement('div');
		modal.className = 'mindfuldo-edit-modal';
		modal.innerHTML = `
			<div class="edit-modal-content">
				<h3>${isRomanian ? 'Editează amintirea' : 'Edit Reminder'}</h3>
				<div class="edit-form">
					<div class="form-group">
						<label>${isRomanian ? 'Text:' : 'Text:'}</label>
						<input type="text" id="editReminderText" value="${reminder.text}" placeholder="${isRomanian ? 'Introduceți textul amintirii' : 'Enter reminder text'}">
					</div>
					<div class="form-group">
						<label>${isRomanian ? 'Data:' : 'Date:'}</label>
						<input type="date" id="editReminderDate" value="${dateStr}">
					</div>
					<div class="form-group">
						<label>${isRomanian ? 'Ora:' : 'Time:'}</label>
						<input type="time" id="editReminderTime" value="${timeStr}">
					</div>
					<div class="form-actions">
						<button id="saveReminderEdit" class="save-btn">${isRomanian ? 'Salvează' : 'Save'}</button>
						<button id="cancelReminderEdit" class="cancel-btn">${isRomanian ? 'Anulează' : 'Cancel'}</button>
					</div>
				</div>
			</div>
		`;

		document.body.appendChild(modal);

		// Add event listeners
		const saveBtn = modal.querySelector('#saveReminderEdit');
		const cancelBtn = modal.querySelector('#cancelReminderEdit');
		const textInput = modal.querySelector('#editReminderText') as HTMLInputElement;
		const dateInput = modal.querySelector('#editReminderDate') as HTMLInputElement;
		const timeInput = modal.querySelector('#editReminderTime') as HTMLInputElement;

		const closeModal = () => {
			if (document.body.contains(modal)) {
				document.body.removeChild(modal);
			}
		};

		const saveChanges = async () => {
			const newText = textInput.value.trim();
			const newDate = dateInput.value;
			const newTime = timeInput.value;

			if (!newText || !newDate || !newTime) {
				new Notice(isRomanian ? 'Completați toate câmpurile!' : 'Fill in all fields!');
				return;
			}

			const newDateTime = `${newDate}T${newTime}`;
			const newReminderDate = new Date(newDateTime);
			
			if (newReminderDate <= new Date()) {
				new Notice(isRomanian ? 'Vă rugăm să alegeți o dată și oră din viitor!' : 'Date must be in the future!');
				return;
			}

			try {
				// Update reminder
				reminder.text = newText;
				reminder.dateTime = newDateTime;
				reminder.expired = false; // Reset expired status
				
				// Save data
				await this.saveData();
				
				// Refresh display
				if (this.currentView === 'reminders') {
					this.renderReminders();
				}
				
				// Show success message
				new Notice(isRomanian ? 'Amintirea a fost actualizată!' : 'Reminder updated successfully!');
				
				// Close modal
				closeModal();
			} catch (error) {
				console.error('Error saving reminder:', error);
				new Notice(isRomanian ? 'Eroare la salvarea amintirii!' : 'Error saving reminder!');
			}
		};

		saveBtn?.addEventListener('click', saveChanges);
		
		cancelBtn?.addEventListener('click', closeModal);

		// Close on outside click
		modal.addEventListener('click', (e) => {
			if (e.target === modal) {
				closeModal();
			}
		});

		// Handle Enter key
		textInput.addEventListener('keypress', (e) => {
			if (e.key === 'Enter') {
				saveChanges();
			}
		});

		// Handle Escape key
		modal.addEventListener('keydown', (e) => {
			if (e.key === 'Escape') {
				closeModal();
			}
		});

		// Focus on text input
		setTimeout(() => textInput.focus(), 100);
	}

	// Habit tracker functionality
	private async addHabit() {
		await this.loadData(); // asigură sincronizarea cu fișierul
		const habitNameInput = this.containerEl.querySelector('#habitNameInput') as HTMLInputElement;
		if (!habitNameInput) return;
		const habitName = habitNameInput.value.trim();
		if (habitName === '') return;
		const selectedColor = this.containerEl.querySelector('.color-option.active') as HTMLElement;
		const color = selectedColor?.getAttribute('data-color') || '#4CAF50';
		const habit: Habit = {
			id: Date.now(),
			name: habitName,
			color: color,
			createdAt: this.getLocalDateString(new Date()),
			streak: 0,
			bestStreak: 0,
			completions: {}
		};
		this.habits.push(habit);
		await this.saveData();
		habitNameInput.value = '';
		this.containerEl.querySelectorAll('.color-option').forEach(btn => btn.classList.remove('active'));
		this.containerEl.querySelector('.color-option')?.classList.add('active');
		this.renderHabits();
	}

	private async toggleHabit(id: number, date?: string) {
		await this.loadData(); // asigură sincronizarea cu fișierul
		const habitIndex = this.habits.findIndex(habit => habit.id === id);
		if (habitIndex === -1) return;
		const habit = this.habits[habitIndex];
		const targetDate = date || this.getLocalDateString(new Date());
		habit.completions[targetDate] = !habit.completions[targetDate];
		this.updateHabitStreak(habit);
		await this.saveData();
		if (this.currentView === 'habits') {
			this.renderHabits();
		}
	}

	private updateHabitStreak(habit: Habit) {
		const today = new Date();
		const todayStr = this.getLocalDateString(today);
		let currentStreak = 0;
		let bestStreak = 0;
		let tempStreak = 0;
		
		// Get all completion dates sorted chronologically
		const completionDates = Object.keys(habit.completions)
			.filter(date => habit.completions[date])
			.sort(); // Sort dates chronologically
		
		if (completionDates.length === 0) {
			habit.streak = 0;
			habit.bestStreak = Math.max(0, habit.bestStreak);
			return;
		}
		
		// Calculate current streak - must include today to be "current"
		if (habit.completions[todayStr]) {
			// Today is completed, count backwards from today
			currentStreak = 1;
			let checkDate = new Date(today);
			
			// Go backwards day by day from yesterday
			while (true) {
				checkDate.setDate(checkDate.getDate() - 1);
				const dateStr = this.getLocalDateString(checkDate);
				
				if (habit.completions[dateStr]) {
					currentStreak++;
				} else {
					// Found a gap, stop counting
					break;
				}
			}
		} else {
			// Today is not completed, so current streak is 0
			currentStreak = 0;
		}
		
		// Calculate best streak by checking all completion dates
		for (let i = 0; i < completionDates.length; i++) {
			if (i === 0) {
				tempStreak = 1;
			} else {
				const prevDate = new Date(completionDates[i - 1]);
				const currDate = new Date(completionDates[i]);
				const diffTime = currDate.getTime() - prevDate.getTime();
				const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
				
				if (diffDays === 1) {
					// Consecutive day
					tempStreak++;
				} else {
					// Gap in streak, reset
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

	private async deleteHabit(id: number) {
		await this.loadData(); // asigură sincronizarea cu fișierul
		this.habits = this.habits.filter(habit => habit.id !== id);
		await this.saveData();
		this.renderHabits();
	}

	private renderHabits() {
		const habitsList = this.containerEl.querySelector('#habitsList');
		const habitCounter = this.containerEl.querySelector('#habitCounter');
		if (!habitsList || !habitCounter) return;
		const isRomanian = this.plugin.settings.language === 'ro';
		const todayStr = this.getLocalDateString(new Date());
		const completedToday = this.habits.filter(habit => habit.completions[todayStr]).length;
		if (isRomanian) {
			habitCounter.textContent = `${completedToday}/${this.habits.length} ${this.habits.length !== 1 ? 'obiceiuri' : 'obicei'} astăzi`;
		} else {
			habitCounter.textContent = `${completedToday}/${this.habits.length} ${this.habits.length !== 1 ? 'habits' : 'habit'} today`;
		}
		if (this.habits.length === 0) {
			habitsList.innerHTML = '';
			return;
		}
		// Generate habit cards with last 7 days tracking
		const today = new Date();
		const days: Date[] = [];
		for (let i = 6; i >= 0; i--) {
			const date = new Date(today);
			date.setDate(date.getDate() - i);
			days.push(date);
		}

		const dayLabels = isRomanian ? ['D', 'L', 'M', 'M', 'J', 'V', 'S'] : ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

		const newHtml = this.habits.map(habit => {
			const dayCircles = days.map((date, index) => {
				const dateStr = this.getLocalDateString(date);
				const isCompleted = habit.completions[dateStr] || false;
				const isToday = dateStr === this.getLocalDateString(today);
				const dayLabel = dayLabels[date.getDay()];
				
				return `
					<div class="habit-day-container">
						<div class="habit-day ${isCompleted ? 'completed' : ''} ${isToday ? 'today' : ''}" 
							 data-habit-id="${habit.id}" 
							 data-date="${dateStr}"
							 style="border-color: ${habit.color}; ${isCompleted && !isToday ? `background-color: ${habit.color};` : ''}"
							 title="${isToday ? (isRomanian ? 'Astăzi' : 'Today') : date.toLocaleDateString()}">
							${isCompleted ? '✓' : ''}
						</div>
						<div class="habit-day-label">${dayLabel}</div>
					</div>
				`;
			}).join('');

			return `
				<div class="habit-item">
					<div class="habit-header">
						<div class="habit-info">
							<div class="habit-name" style="color: ${habit.color};">${habit.name}</div>
							<div class="habit-stats">
								<span class="streak-current">${habit.streak} ${isRomanian ? 'zile' : 'days'}</span>
								<span class="streak-separator">•</span>
								<span class="streak-best">${isRomanian ? 'Record' : 'Best'}: ${habit.bestStreak}</span>
							</div>
						</div>
						<div class="habit-actions">
							<button class="habit-edit" data-habit-id="${habit.id}" title="${isRomanian ? 'Editează' : 'Edit'}">✏️</button>
							<button class="habit-delete" data-habit-id="${habit.id}" title="${isRomanian ? 'Șterge' : 'Delete'}">×</button>
						</div>
					</div>
					<div class="habit-tracking">
						<div class="habit-days">
							${dayCircles}
						</div>
					</div>
				</div>
			`;
		}).join('');
		if (habitsList.innerHTML !== newHtml) {
			habitsList.innerHTML = newHtml;
		}
		// Add event listeners for habit tracking
		habitsList.querySelectorAll('.habit-day').forEach(dayEl => {
			dayEl.addEventListener('click', async (e) => {
				const habitId = parseInt((e.target as HTMLElement).getAttribute('data-habit-id') || '0');
				const date = (e.target as HTMLElement).getAttribute('data-date') || '';
				await this.toggleHabit(habitId, date);
			});
		});

		// Add event listeners for delete buttons
		habitsList.querySelectorAll('.habit-delete').forEach(deleteBtn => {
			deleteBtn.addEventListener('click', async (e) => {
				const habitId = parseInt((e.target as HTMLElement).getAttribute('data-habit-id') || '0');
				await this.deleteHabit(habitId);
			});
		});

		// Add event listeners for edit buttons
		habitsList.querySelectorAll('.habit-edit').forEach(editBtn => {
			editBtn.addEventListener('click', async (e) => {
				const habitId = parseInt((e.target as HTMLElement).getAttribute('data-habit-id') || '0');
				await this.editHabit(habitId);
			});
		});
	}

	private async editHabit(id: number) {
		const habit = this.habits.find(h => h.id === id);
		if (!habit) return;

		const isRomanian = this.plugin.settings.language === 'ro';
		
		// Remove any existing modal first
		const existingModal = document.querySelector('.mindfuldo-edit-modal');
		if (existingModal) {
			document.body.removeChild(existingModal);
		}
		
		// Create edit modal
		const modal = document.createElement('div');
		modal.className = 'mindfuldo-edit-modal';
		modal.innerHTML = `
			<div class="edit-modal-content">
				<h3>${isRomanian ? 'Editează obiceiul' : 'Edit Habit'}</h3>
				<div class="edit-form">
					<div class="form-group">
						<label>${isRomanian ? 'Nume:' : 'Name:'}</label>
						<input type="text" id="editHabitName" value="${habit.name}" placeholder="${isRomanian ? 'Introduceți numele obiceiului' : 'Enter habit name'}">
					</div>
					<div class="form-group">
						<label>${isRomanian ? 'Culoare:' : 'Color:'}</label>
						<div class="color-options" id="editHabitColors">
							<div class="color-option ${habit.color === '#4CAF50' ? 'active' : ''}" data-color="#4CAF50" style="background: #4CAF50;"></div>
							<div class="color-option ${habit.color === '#2196F3' ? 'active' : ''}" data-color="#2196F3" style="background: #2196F3;"></div>
							<div class="color-option ${habit.color === '#FF9800' ? 'active' : ''}" data-color="#FF9800" style="background: #FF9800;"></div>
							<div class="color-option ${habit.color === '#E91E63' ? 'active' : ''}" data-color="#E91E63" style="background: #E91E63;"></div>
							<div class="color-option ${habit.color === '#9C27B0' ? 'active' : ''}" data-color="#9C27B0" style="background: #9C27B0;"></div>
							<div class="color-option ${habit.color === '#00BCD4' ? 'active' : ''}" data-color="#00BCD4" style="background: #00BCD4;"></div>
						</div>
					</div>
					<div class="form-actions">
						<button id="saveHabitEdit" class="save-btn">${isRomanian ? 'Salvează' : 'Save'}</button>
						<button id="cancelHabitEdit" class="cancel-btn">${isRomanian ? 'Anulează' : 'Cancel'}</button>
					</div>
				</div>
			</div>
		`;

		document.body.appendChild(modal);

		// Add event listeners for color selection
		const colorOptions = modal.querySelectorAll('.color-option');
		colorOptions.forEach(option => {
			option.addEventListener('click', () => {
				colorOptions.forEach(opt => opt.classList.remove('active'));
				option.classList.add('active');
			});
		});

		// Add event listeners for save/cancel
		const saveBtn = modal.querySelector('#saveHabitEdit');
		const cancelBtn = modal.querySelector('#cancelHabitEdit');
		const nameInput = modal.querySelector('#editHabitName') as HTMLInputElement;

		const closeModal = () => {
			if (document.body.contains(modal)) {
				document.body.removeChild(modal);
			}
		};

		const saveChanges = async () => {
			const newName = nameInput.value.trim();
			const selectedColor = modal.querySelector('.color-option.active') as HTMLElement;
			const newColor = selectedColor?.getAttribute('data-color') || habit.color;

			if (!newName) {
				new Notice(isRomanian ? 'Numele nu poate fi gol!' : 'Name cannot be empty!');
				nameInput.focus();
				return;
			}

			try {
				// Update habit
				habit.name = newName;
				habit.color = newColor;
				
				// Save data
				await this.saveData();
				
				// Refresh display
				if (this.currentView === 'habits') {
					this.renderHabits();
				}
				
				// Show success message
				new Notice(isRomanian ? 'Obiceiul a fost actualizat!' : 'Habit updated successfully!');
				
				// Close modal
				closeModal();
			} catch (error) {
				console.error('Error saving habit:', error);
				new Notice(isRomanian ? 'Eroare la salvarea obiceiului!' : 'Error saving habit!');
			}
		};

		saveBtn?.addEventListener('click', saveChanges);
		
		cancelBtn?.addEventListener('click', closeModal);

		// Close on outside click
		modal.addEventListener('click', (e) => {
			if (e.target === modal) {
				closeModal();
			}
		});

		// Handle Enter key
		nameInput.addEventListener('keypress', (e) => {
			if (e.key === 'Enter') {
				saveChanges();
			}
		});

		// Handle Escape key
		modal.addEventListener('keydown', (e) => {
			if (e.key === 'Escape') {
				closeModal();
			}
		});

		// Focus on name input
		setTimeout(() => nameInput.focus(), 100);
	}

	private currentMonth = new Date().getMonth();
	private currentYear = new Date().getFullYear();

	private renderCalendar() {
		const calendarGrid = this.containerEl.querySelector('#calendarGrid');
		const calendarTitle = this.containerEl.querySelector('#calendarTitle');
		
		if (!calendarGrid || !calendarTitle) return;

		const months = this.plugin.settings.language === 'ro' ? 
			['Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie', 'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'] :
			['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

		calendarTitle.textContent = `${months[this.currentMonth]} ${this.currentYear}`;

		const firstDay = new Date(this.currentYear, this.currentMonth, 1);
		const startDate = new Date(firstDay);
		startDate.setDate(startDate.getDate() - firstDay.getDay());

		const dayNames = this.plugin.settings.language === 'ro' ? 
			['D', 'L', 'M', 'M', 'J', 'V', 'S'] :
			['S', 'M', 'T', 'W', 'T', 'F', 'S'];

		let calendarHTML = '<div class="calendar-weekdays">';
		dayNames.forEach(day => {
			calendarHTML += `<div class="calendar-weekday">${day}</div>`;
		});
		calendarHTML += '</div><div class="calendar-days">';

		for (let i = 0; i < 42; i++) {
			const currentDate = new Date(startDate);
			currentDate.setDate(startDate.getDate() + i);
			
			const dateStr = this.getLocalDateString(currentDate);
			const isCurrentMonth = currentDate.getMonth() === this.currentMonth;
			const isToday = currentDate.toDateString() === new Date().toDateString();
			
			// Găsește task-urile și reminder-urile pentru această zi
			const dayTasks = this.tasks.filter(task => 
				task.createdAt.startsWith(dateStr)
			);
			const dayReminders = this.reminders.filter(reminder => 
				reminder.dateTime.startsWith(dateStr)
			);

			let dayClass = 'calendar-day';
			if (!isCurrentMonth) dayClass += ' other-month';
			if (isToday) dayClass += ' today';
			if (dayTasks.length > 0) dayClass += ' has-tasks';
			if (dayReminders.length > 0) dayClass += ' has-reminders';

			calendarHTML += `
				<div class="${dayClass}" data-date="${dateStr}" data-tasks="${dayTasks.length}" data-reminders="${dayReminders.length}">
					<div class="calendar-day-number">${currentDate.getDate()}</div>
					<div class="calendar-day-indicators">
						${dayTasks.length > 0 ? `<span class="indicator task-indicator">${dayTasks.length}</span>` : ''}
						${dayReminders.length > 0 ? `<span class="indicator reminder-indicator">${dayReminders.length}</span>` : ''}
					</div>
				</div>
			`;
		}

		calendarHTML += '</div>';
		
		// Adaugă container pentru detaliile zilei
		calendarHTML += '<div class="calendar-day-details" id="calendarDayDetails" style="display: none;"></div>';
		
		calendarGrid.innerHTML = calendarHTML;

		// Setup navigation - Remove existing listeners first
		this.setupCalendarNavigation();
		
		// Setup day click handlers
		this.setupCalendarDayClicks();
	}

	private setupCalendarNavigation() {
		const prevBtn = this.containerEl.querySelector('#prevMonth');
		const nextBtn = this.containerEl.querySelector('#nextMonth');

		// Remove existing event listeners by cloning elements
		if (prevBtn) {
			const newPrevBtn = prevBtn.cloneNode(true);
			prevBtn.parentNode?.replaceChild(newPrevBtn, prevBtn);
			
			newPrevBtn.addEventListener('click', (e) => {
				e.preventDefault();
				e.stopPropagation();
				this.navigateToPreviousMonth();
			});
		}

		if (nextBtn) {
			const newNextBtn = nextBtn.cloneNode(true);
			nextBtn.parentNode?.replaceChild(newNextBtn, nextBtn);
			
			newNextBtn.addEventListener('click', (e) => {
				e.preventDefault();
				e.stopPropagation();
				this.navigateToNextMonth();
			});
		}
	}

	private navigateToPreviousMonth() {
		this.currentMonth--;
		if (this.currentMonth < 0) {
			this.currentMonth = 11;
			this.currentYear--;
		}
		// Small delay to prevent rapid clicking issues
		setTimeout(() => {
			this.renderCalendar();
		}, 50);
	}

	private navigateToNextMonth() {
		this.currentMonth++;
		if (this.currentMonth > 11) {
			this.currentMonth = 0;
			this.currentYear++;
		}
		// Small delay to prevent rapid clicking issues
		setTimeout(() => {
			this.renderCalendar();
		}, 50);
	}

	private setupCalendarDayClicks() {
		const calendarDays = this.containerEl.querySelectorAll('.calendar-day');
		
		calendarDays.forEach(day => {
			day.addEventListener('click', (e) => {
				const target = e.currentTarget as HTMLElement;
				const date = target.getAttribute('data-date');
				const tasksCount = parseInt(target.getAttribute('data-tasks') || '0');
				const remindersCount = parseInt(target.getAttribute('data-reminders') || '0');
				
				if (date && (tasksCount > 0 || remindersCount > 0)) {
					this.showDayDetails(date, tasksCount, remindersCount);
				}
			});
		});
	}

	private showDayDetails(dateStr: string, tasksCount: number, remindersCount: number) {
		const detailsContainer = this.containerEl.querySelector('#calendarDayDetails');
		if (!detailsContainer) return;

		const dayTasks = this.tasks.filter(task => 
			task.createdAt.startsWith(dateStr)
		);
		const dayReminders = this.reminders.filter(reminder => 
			reminder.dateTime.startsWith(dateStr)
		);

		const date = new Date(dateStr);
		const formattedDate = date.toLocaleDateString(
			this.plugin.settings.language === 'ro' ? 'ro-RO' : 'en-US',
			{ weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
		);

		let detailsHTML = `
			<div class="day-details-header">
				<h3>${formattedDate}</h3>
				<button class="close-details" id="closeDayDetails">×</button>
			</div>
		`;

		if (dayTasks.length > 0) {
			detailsHTML += `
				<div class="day-tasks">
					<h4><span class="task-indicator-small"></span> ${this.plugin.settings.language === 'ro' ? 'Task-uri' : 'Tasks'} (${dayTasks.length})</h4>
					<ul>
						${dayTasks.map(task => `
							<li class="${task.completed ? 'completed' : ''}">
								<span class="task-category-badge ${task.category}">${this.getCategoryName(task.category)}</span>
								${task.text}
							</li>
						`).join('')}
					</ul>
				</div>
			`;
		}

		if (dayReminders.length > 0) {
			detailsHTML += `
				<div class="day-reminders">
					<h4><span class="reminder-indicator-small"></span> ${this.plugin.settings.language === 'ro' ? 'Amintiri' : 'Reminders'} (${dayReminders.length})</h4>
					<ul>
						${dayReminders.map(reminder => {
							const reminderDate = new Date(reminder.dateTime);
							const timeStr = reminderDate.toLocaleTimeString(
								this.plugin.settings.language === 'ro' ? 'ro-RO' : 'en-US',
								{ hour: '2-digit', minute: '2-digit' }
							);
							return `
								<li class="${reminder.expired ? 'expired' : ''}">
									<span class="reminder-time-badge">${timeStr}</span>
									${reminder.text}
									${reminder.expired ? `<span class="expired-badge">${this.plugin.settings.language === 'ro' ? 'Expirat' : 'Expired'}</span>` : ''}
								</li>
							`;
						}).join('')}
					</ul>
				</div>
			`;
		}

		detailsContainer.innerHTML = detailsHTML;
		(detailsContainer as HTMLElement).style.display = 'block';

		// Add close button handler
		const closeBtn = detailsContainer.querySelector('#closeDayDetails');
		closeBtn?.addEventListener('click', () => {
			(detailsContainer as HTMLElement).style.display = 'none';
		});
	}

	// ================== ANALYTICS METHODS ==================

	private renderAnalytics() {
		this.updateCurrentWeekDisplay();
		this.calculateWeeklyStats();
	}

	private navigateToPreviousWeek() {
		this.currentAnalyticsWeek.setDate(this.currentAnalyticsWeek.getDate() - 7);
		this.renderAnalytics();
	}

	private navigateToNextWeek() {
		this.currentAnalyticsWeek.setDate(this.currentAnalyticsWeek.getDate() + 7);
		this.renderAnalytics();
	}

	private updateCurrentWeekDisplay() {
		const currentWeekEl = this.containerEl.querySelector('#currentWeek');
		if (!currentWeekEl) return;

		const startOfWeek = this.getStartOfWeek(this.currentAnalyticsWeek);
		const endOfWeek = new Date(startOfWeek);
		endOfWeek.setDate(startOfWeek.getDate() + 6);

		const isRomanian = this.plugin.settings.language === 'ro';
		const startStr = startOfWeek.toLocaleDateString(isRomanian ? 'ro-RO' : 'en-US', { 
			month: 'short', 
			day: 'numeric' 
		});
		const endStr = endOfWeek.toLocaleDateString(isRomanian ? 'ro-RO' : 'en-US', { 
			month: 'short', 
			day: 'numeric',
			year: 'numeric'
		});

		currentWeekEl.textContent = `${startStr} - ${endStr}`;
	}

	private getStartOfWeek(date: Date): Date {
		const d = new Date(date);
		const day = d.getDay();
		const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
		return new Date(d.setDate(diff));
	}

	private calculateWeeklyStats() {
		const startOfWeek = this.getStartOfWeek(this.currentAnalyticsWeek);
		const endOfWeek = new Date(startOfWeek);
		endOfWeek.setDate(startOfWeek.getDate() + 6);
		endOfWeek.setHours(23, 59, 59, 999);

		// Calculate tasks stats
		const weeklyTasks = this.tasks.filter(task => {
			if (!task.completedAt) return false;
			const completedDate = new Date(task.completedAt);
			return completedDate >= startOfWeek && completedDate <= endOfWeek;
		});

		// Calculate habits stats
		const totalHabits = this.habits.length;
		let habitsCompletedDays = 0;
		let activeStreaks = 0;

		this.habits.forEach(habit => {
			let daysCompleted = 0;
			for (let d = new Date(startOfWeek); d <= endOfWeek; d.setDate(d.getDate() + 1)) {
				const dateStr = this.getLocalDateString(d);
				if (habit.completions[dateStr]) {
					daysCompleted++;
				}
			}
			if (daysCompleted > 0) habitsCompletedDays += daysCompleted;
			if (habit.streak > 0) activeStreaks++;
		});

		// Calculate productivity score
		const taskScore = Math.min(30, weeklyTasks.length * 3); // 3 points per task, max 30
		// Calculate habits score based on daily average (max 2 habits per day = 14 total = 40 points)
		const dailyHabitAverage = totalHabits > 0 ? (habitsCompletedDays / 7) : 0;
		const habitScore = Math.min(40, Math.round(dailyHabitAverage * 2.86)); // 2.86 points per habit/day average
		const focusScore = Math.min(30, this.pomodoroCompletedSessions * 2); // 2 points per session, max 30
		const totalScore = taskScore + habitScore + focusScore;

		// Update UI
		this.updateTasksAnalytics(weeklyTasks, startOfWeek, endOfWeek);
		this.updateHabitsAnalytics(habitsCompletedDays, totalHabits, activeStreaks);
		this.updatePomodoroAnalytics();
		this.updateProductivityScore(totalScore, taskScore, habitScore, focusScore);
		this.renderDailyChart(startOfWeek, endOfWeek);
	}

	private updateTasksAnalytics(weeklyTasks: Task[], startOfWeek: Date, endOfWeek: Date) {
		const weeklyTasksEl = this.containerEl.querySelector('#weeklyTasksCompleted');
		const tasksChangeEl = this.containerEl.querySelector('#tasksChange');
		const tasksPeakDayEl = this.containerEl.querySelector('#tasksPeakDay');

		if (weeklyTasksEl) {
			weeklyTasksEl.textContent = weeklyTasks.length.toString();
		}

		// Calculate change vs last week
		const prevWeekStart = new Date(startOfWeek);
		prevWeekStart.setDate(prevWeekStart.getDate() - 7);
		const prevWeekEnd = new Date(endOfWeek);
		prevWeekEnd.setDate(prevWeekEnd.getDate() - 7);

		const prevWeekTasks = this.tasks.filter(task => {
			if (!task.completedAt) return false;
			const completedDate = new Date(task.completedAt);
			return completedDate >= prevWeekStart && completedDate <= prevWeekEnd;
		});

		if (tasksChangeEl) {
			const change = prevWeekTasks.length > 0 
				? Math.round(((weeklyTasks.length - prevWeekTasks.length) / prevWeekTasks.length) * 100)
				: (weeklyTasks.length > 0 ? 100 : 0);
			tasksChangeEl.textContent = `${change >= 0 ? '+' : ''}${change}%`;
			tasksChangeEl.className = `change-indicator ${change >= 0 ? 'positive' : 'negative'}`;
		}

		// Find peak day
		if (tasksPeakDayEl) {
			const dailyCount: { [key: string]: number } = {};
			weeklyTasks.forEach(task => {
				const day = new Date(task.completedAt!).toLocaleDateString('en-US', { weekday: 'long' });
				dailyCount[day] = (dailyCount[day] || 0) + 1;
			});

			let peakDay = '';
			let maxCount = 0;
			Object.entries(dailyCount).forEach(([day, count]) => {
				if (count > maxCount) {
					maxCount = count;
					peakDay = day;
				}
			});

			const isRomanian = this.plugin.settings.language === 'ro';
			const dayNames: { [key: string]: string } = {
				'Monday': isRomanian ? 'Luni' : 'Monday',
				'Tuesday': isRomanian ? 'Marți' : 'Tuesday',
				'Wednesday': isRomanian ? 'Miercuri' : 'Wednesday',
				'Thursday': isRomanian ? 'Joi' : 'Thursday',
				'Friday': isRomanian ? 'Vineri' : 'Friday',
				'Saturday': isRomanian ? 'Sâmbătă' : 'Saturday',
				'Sunday': isRomanian ? 'Duminică' : 'Sunday'
			};

			const text = isRomanian ? 'Cea mai bună: ' : 'Best day: ';
			tasksPeakDayEl.textContent = peakDay ? `${text}${dayNames[peakDay] || peakDay}` : `${text}-`;
		}
	}

	private updateHabitsAnalytics(completedDays: number, totalHabits: number, activeStreaks: number) {
		const habitsRateEl = this.containerEl.querySelector('#weeklyHabitsRate');
		const habitsCompletedEl = this.containerEl.querySelector('#habitsCompleted');
		const activeStreaksEl = this.containerEl.querySelector('#activeStreaks');

		if (habitsRateEl) {
			const rate = totalHabits > 0 ? Math.round((completedDays / (totalHabits * 7)) * 100) : 0;
			habitsRateEl.textContent = `${rate}%`;
		}

		if (habitsCompletedEl) {
			// Calculate daily average instead of total days
			const dailyAverage = totalHabits > 0 ? (completedDays / 7) : 0;
			const averageText = dailyAverage.toFixed(1);
			const isRomanian = this.plugin.settings.language === 'ro';
			habitsCompletedEl.textContent = `${averageText} ${isRomanian ? 'habit-uri/zi' : 'habits/day'}`;
		}

		if (activeStreaksEl) {
			activeStreaksEl.textContent = activeStreaks.toString();
		}
	}

	private updatePomodoroAnalytics() {
		const sessionsEl = this.containerEl.querySelector('#weeklyPomodoroSessions');
		const focusTimeEl = this.containerEl.querySelector('#totalFocusTime');
		const avgSessionEl = this.containerEl.querySelector('#avgSessionLength');

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

	private updateProductivityScore(total: number, tasks: number, habits: number, focus: number) {
		const scoreNumberEl = this.containerEl.querySelector('#productivityScore');
		const scoreProgressEl = this.containerEl.querySelector('#scoreProgress') as SVGCircleElement;
		const tasksScoreEl = this.containerEl.querySelector('#tasksScore');
		const habitsScoreEl = this.containerEl.querySelector('#habitsScore');
		const focusScoreEl = this.containerEl.querySelector('#focusScore');

		if (scoreNumberEl) {
			scoreNumberEl.textContent = total.toString();
		}

		if (scoreProgressEl) {
			const circumference = 2 * Math.PI * 50;
			const progress = total / 100;
			const strokeDashoffset = circumference - (progress * circumference);
			scoreProgressEl.style.strokeDasharray = `${circumference} ${circumference}`;
			scoreProgressEl.style.strokeDashoffset = strokeDashoffset.toString();
		}

		if (tasksScoreEl) tasksScoreEl.textContent = `${tasks}/30`;
		if (habitsScoreEl) habitsScoreEl.textContent = `${habits}/40`;
		if (focusScoreEl) focusScoreEl.textContent = `${focus}/30`;
	}

	private renderDailyChart(startOfWeek: Date, endOfWeek: Date) {
		const chartEl = this.containerEl.querySelector('#dailyChart');
		if (!chartEl) return;

		const days = [];
		for (let d = new Date(startOfWeek); d <= endOfWeek; d.setDate(d.getDate() + 1)) {
			days.push(new Date(d));
		}

		const isRomanian = this.plugin.settings.language === 'ro';
		const dayLabels = days.map(d => d.toLocaleDateString(isRomanian ? 'ro-RO' : 'en-US', { weekday: 'short' }));

		chartEl.innerHTML = `
			<div class="chart-days">
				${days.map((day, index) => {
					const dateStr = this.getLocalDateString(day);
					const tasksCount = this.tasks.filter(task => 
						task.completedAt && this.getLocalDateString(new Date(task.completedAt)) === dateStr
					).length;
					
					const habitsCompleted = this.habits.filter(habit => habit.completions[dateStr]).length;
					const maxHeight = Math.max(tasksCount, habitsCompleted, 1);
					
					return `
						<div class="chart-day">
							<div class="chart-bars">
								<div class="chart-bar tasks" style="height: ${(tasksCount / Math.max(maxHeight, 5)) * 100}%" title="${tasksCount} tasks"></div>
								<div class="chart-bar habits" style="height: ${(habitsCompleted / Math.max(maxHeight, 5)) * 100}%" title="${habitsCompleted} habits"></div>
							</div>
							<div class="chart-label">${dayLabels[index]}</div>
						</div>
					`;
				}).join('')}
			</div>
			<div class="chart-legend">
				<div class="chart-legend-item">
					<div class="chart-legend-color tasks"></div>
					<span>${isRomanian ? 'Sarcini completate' : 'Tasks completed'}</span>
				</div>
				<div class="chart-legend-item">
					<div class="chart-legend-color habits"></div>
					<span>${isRomanian ? 'Habit-uri completate' : 'Habits completed'}</span>
				</div>
			</div>
		`;
	}

	// ================== POMODORO TIMER METHODS ==================

	private async savePomodoroSettingsQuietly() {
		// Save settings without triggering interface refresh
		await this.plugin.saveData(this.plugin.settings);
	}

	private applyPomodoroPreset(preset: string) {
		// Remove timer if running
		if (this.pomodoroIsRunning) {
			this.pausePomodoroTimer();
		}

		// Update active preset button
		this.containerEl.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('active'));
		const activeBtn = this.containerEl.querySelector(`[data-preset="${preset}"]`);
		if (activeBtn) activeBtn.classList.add('active');

		// Apply preset values
		switch (preset) {
			case 'classic':
				this.plugin.settings.pomodoroWorkTime = 25;
				this.plugin.settings.pomodoroBreakTime = 5;
				this.plugin.settings.pomodoroLongBreakTime = 15;
				break;
			case 'extended':
				this.plugin.settings.pomodoroWorkTime = 45;
				this.plugin.settings.pomodoroBreakTime = 10;
				this.plugin.settings.pomodoroLongBreakTime = 30;
				break;
			case 'short':
				this.plugin.settings.pomodoroWorkTime = 15;
				this.plugin.settings.pomodoroBreakTime = 3;
				this.plugin.settings.pomodoroLongBreakTime = 10;
				break;
			case 'custom':
				// Don't change values for custom preset
				break;
		}

		// Update input fields
		const workTimeInput = this.containerEl.querySelector('#workTimeInput') as HTMLInputElement;
		const breakTimeInput = this.containerEl.querySelector('#breakTimeInput') as HTMLInputElement;
		const longBreakTimeInput = this.containerEl.querySelector('#longBreakTimeInput') as HTMLInputElement;

		if (workTimeInput) workTimeInput.value = this.plugin.settings.pomodoroWorkTime.toString();
		if (breakTimeInput) breakTimeInput.value = this.plugin.settings.pomodoroBreakTime.toString();
		if (longBreakTimeInput) longBreakTimeInput.value = this.plugin.settings.pomodoroLongBreakTime.toString();

		// Save settings and reinitialize timer
		this.savePomodoroSettingsQuietly();
		this.initializePomodoroTimer();
	}

	private renderPomodoro() {
		this.initializePomodoroTimer();
		this.updatePomodoroDisplay();
		this.updateActivePreset();
	}

	private updateActivePreset() {
		// Check which preset matches current settings
		this.containerEl.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('active'));
		
		const { pomodoroWorkTime, pomodoroBreakTime, pomodoroLongBreakTime } = this.plugin.settings;
		
		let activePreset = 'custom'; // Default to custom
		
		if (pomodoroWorkTime === 25 && pomodoroBreakTime === 5 && pomodoroLongBreakTime === 15) {
			activePreset = 'classic';
		} else if (pomodoroWorkTime === 45 && pomodoroBreakTime === 10 && pomodoroLongBreakTime === 30) {
			activePreset = 'extended';
		} else if (pomodoroWorkTime === 15 && pomodoroBreakTime === 3 && pomodoroLongBreakTime === 10) {
			activePreset = 'short';
		}
		
		const activeBtn = this.containerEl.querySelector(`[data-preset="${activePreset}"]`);
		if (activeBtn) activeBtn.classList.add('active');
	}

	private initializePomodoroTimer() {
		let timeInMinutes: number;
		
		switch (this.pomodoroMode) {
			case 'work':
				timeInMinutes = this.plugin.settings.pomodoroWorkTime;
				break;
			case 'break':
				timeInMinutes = this.plugin.settings.pomodoroBreakTime;
				break;
			case 'longBreak':
				timeInMinutes = this.plugin.settings.pomodoroLongBreakTime;
				break;
		}
		
		this.pomodoroTimeLeft = timeInMinutes * 60; // Convert to seconds
		this.updatePomodoroDisplay();
	}

	private togglePomodoroTimer() {
		if (this.pomodoroIsRunning) {
			this.pausePomodoroTimer();
		} else {
			this.startPomodoroTimer();
		}
	}

	private startPomodoroTimer() {
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
		}, 1000);
	}

	private pausePomodoroTimer() {
		this.pomodoroIsRunning = false;
		if (this.pomodoroTimer) {
			clearInterval(this.pomodoroTimer);
			this.pomodoroTimer = null;
		}
		this.updateStartPauseButton();
	}

	private resetPomodoroTimer() {
		this.pausePomodoroTimer();
		this.initializePomodoroTimer();
		this.updateStartPauseButton();
	}

	private skipPomodoroSession() {
		this.pausePomodoroTimer();
		this.completePomodoroSession();
	}

	private completePomodoroSession() {
		this.pausePomodoroTimer();
		
		const isRomanian = this.plugin.settings.language === 'ro';
		
		if (this.pomodoroMode === 'work') {
			this.pomodoroCompletedSessions++;
			
			// Notification for completed work session
			if (this.plugin.settings.enableNotifications) {
				new Notice(isRomanian ? '🍅 Sesiune de lucru completă! Timp pentru o pauză.' : '🍅 Work session complete! Time for a break.', 5000);
			}
			
			// Determine next mode
			if (this.pomodoroCompletedSessions % this.plugin.settings.pomodoroSessionsBeforeLongBreak === 0) {
				this.pomodoroMode = 'longBreak';
				this.pomodoroCurrentCycle++;
			} else {
				this.pomodoroMode = 'break';
			}
		} else {
			// Break completed
			if (this.plugin.settings.enableNotifications) {
				new Notice(isRomanian ? '⚡ Pauză terminată! Înapoi la lucru.' : '⚡ Break finished! Back to work.', 5000);
			}
			this.pomodoroMode = 'work';
		}
		
		this.initializePomodoroTimer();
		this.updatePomodoroModeDisplay();
		this.updateStatsDisplay();
		
		// Save progress without refreshing interface
		this.savePomodoroSettingsQuietly();
		
		// Auto start next session if enabled
		if ((this.pomodoroMode === 'work' && this.plugin.settings.pomodoroAutoStartWork) ||
			(this.pomodoroMode !== 'work' && this.plugin.settings.pomodoroAutoStartBreaks)) {
			setTimeout(() => {
				this.startPomodoroTimer();
			}, 2000); // 2 second delay before auto-start
		}
	}

	private updatePomodoroDisplay() {
		const timerDisplay = this.containerEl.querySelector('#timerDisplay');
		const progressRing = this.containerEl.querySelector('#progressRing') as SVGCircleElement;
		
		if (timerDisplay) {
			const minutes = Math.floor(this.pomodoroTimeLeft / 60);
			const seconds = this.pomodoroTimeLeft % 60;
			timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
		}
		
		if (progressRing) {
			let totalTime: number;
			switch (this.pomodoroMode) {
				case 'work':
					totalTime = this.plugin.settings.pomodoroWorkTime * 60;
					break;
				case 'break':
					totalTime = this.plugin.settings.pomodoroBreakTime * 60;
					break;
				case 'longBreak':
					totalTime = this.plugin.settings.pomodoroLongBreakTime * 60;
					break;
			}
			
			const progress = (totalTime - this.pomodoroTimeLeft) / totalTime;
			const circumference = 2 * Math.PI * 90; // radius = 90
			const strokeDashoffset = circumference - (progress * circumference);
			
			progressRing.style.strokeDasharray = `${circumference} ${circumference}`;
			progressRing.style.strokeDashoffset = strokeDashoffset.toString();
		}
		
		this.updateStatsDisplay();
	}

	private updateStartPauseButton() {
		const startPauseBtn = this.containerEl.querySelector('#startPauseBtn');
		const startPauseIcon = this.containerEl.querySelector('#startPauseIcon');
		const startPauseText = this.containerEl.querySelector('#startPauseText');
		const isRomanian = this.plugin.settings.language === 'ro';
		
		if (startPauseBtn && startPauseIcon && startPauseText) {
			if (this.pomodoroIsRunning) {
				startPauseIcon.textContent = '⏸️';
				startPauseText.textContent = isRomanian ? 'Pauză' : 'Pause';
				startPauseBtn.classList.add('running');
			} else {
				startPauseIcon.textContent = '▶️';
				startPauseText.textContent = isRomanian ? 'Început' : 'Start';
				startPauseBtn.classList.remove('running');
			}
		}
	}

	private updatePomodoroModeDisplay() {
		const pomodoroMode = this.containerEl.querySelector('#pomodoroMode');
		const isRomanian = this.plugin.settings.language === 'ro';
		
		if (pomodoroMode) {
			switch (this.pomodoroMode) {
				case 'work':
					pomodoroMode.textContent = isRomanian ? 'Timp de lucru' : 'Work Time';
					pomodoroMode.className = 'pomodoro-mode work';
					break;
				case 'break':
					pomodoroMode.textContent = isRomanian ? 'Pauză scurtă' : 'Short Break';
					pomodoroMode.className = 'pomodoro-mode break';
					break;
				case 'longBreak':
					pomodoroMode.textContent = isRomanian ? 'Pauză lungă' : 'Long Break';
					pomodoroMode.className = 'pomodoro-mode long-break';
					break;
			}
		}
	}

	private updateStatsDisplay() {
		const completedSessionsEl = this.containerEl.querySelector('#completedSessions');
		const currentCycleEl = this.containerEl.querySelector('#currentCycle');
		
		if (completedSessionsEl) {
			completedSessionsEl.textContent = this.pomodoroCompletedSessions.toString();
		}
		
		if (currentCycleEl) {
			currentCycleEl.textContent = this.pomodoroCurrentCycle.toString();
		}
	}


}

class RelaxingTodoSettingTab extends PluginSettingTab {
	plugin: RelaxingTodoPlugin;

	constructor(app: App, plugin: RelaxingTodoPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;
		const isRomanian = this.plugin.settings.language === 'ro';

		containerEl.empty();

		new Setting(containerEl)
			.setName(isRomanian ? 'Categoria implicită' : 'Default Category')
			.setDesc(isRomanian ? 'Categoria care va fi selectată automat pentru task-uri noi' : 'Category that will be auto-selected for new tasks')
			.addDropdown(dropdown => dropdown
				.addOption('personal', 'Personal')
				.addOption('lucru', isRomanian ? 'Lucru' : 'Work')
				.addOption('sanatate', isRomanian ? 'Sănătate' : 'Health')
				.addOption('invatare', isRomanian ? 'Învățare' : 'Learning')
				.addOption('hobby', 'Hobby')
				.setValue(this.plugin.settings.defaultCategory)
				.onChange(async (value) => {
					this.plugin.settings.defaultCategory = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName(isRomanian ? 'Notificări' : 'Notifications')
			.setDesc(isRomanian ? 'Activează notificările pentru reminder-e' : 'Enable notifications for reminders')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableNotifications)
				.onChange(async (value) => {
					this.plugin.settings.enableNotifications = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName(isRomanian ? 'Temă' : 'Theme')
			.setDesc(isRomanian ? 'Alegeți tema de culori' : 'Choose color theme')
			.addDropdown(dropdown => dropdown
				.addOption('default', 'Default')
				.addOption('ocean', 'Ocean (Blue-Teal)')
				.addOption('forest', 'Forest (Green)')
				.addOption('sunset', 'Sunset (Pink-Orange)')
				.addOption('purple', 'Purple (Violet)')
				.addOption('midnight', 'Midnight (Dark Blue)')
				.setValue(this.plugin.settings.theme)
				.onChange(async (value) => {
					this.plugin.settings.theme = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName(isRomanian ? 'Numele dumneavoastră' : 'Your Name')
			.setDesc(isRomanian ? 'Introduceți numele pentru salutări personalizate' : 'Enter your name for personalized greetings')
			.addText(text => text
				.setValue(this.plugin.settings.userName)
				.onChange(async (value) => {
					this.plugin.settings.userName = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName(isRomanian ? 'Limba' : 'Language')
			.setDesc(isRomanian ? 'Alegeți limba aplicației' : 'Choose language')
			.addDropdown(dropdown => dropdown
				.addOption('ro', isRomanian ? 'Română' : 'Romanian')
				.addOption('en', isRomanian ? 'Engleză' : 'English')
				.setValue(this.plugin.settings.language)
				.onChange(async (value) => {
					this.plugin.settings.language = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName(isRomanian ? 'Poziția sidebar-ului' : 'Sidebar Position')
			.setDesc(isRomanian ? 'Alegeți poziția sidebar-ului' : 'Choose sidebar position')
			.addDropdown(dropdown => dropdown
				.addOption('left', isRomanian ? 'Stânga' : 'Left')
				.addOption('right', isRomanian ? 'Dreapta' : 'Right')
				.setValue(this.plugin.settings.sidebarPosition)
				.onChange(async (value) => {
					this.plugin.settings.sidebarPosition = value;
					await this.plugin.saveSettings();
					// Mută view-ul în noul sidebar
					this.plugin.moveViewToSidebar(value);
				}));

		new Setting(containerEl)
			.setName(isRomanian ? 'Auto-șterge expirate' : 'Auto-delete Expired')
			.setDesc(isRomanian ? 'Șterge automat reminder-urile expirate' : 'Automatically delete expired reminders')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.autoDeleteExpired)
				.onChange(async (value) => {
					this.plugin.settings.autoDeleteExpired = value;
					await this.plugin.saveSettings();
				}));

		// Feature Toggles Section
		containerEl.createEl('h3', { text: isRomanian ? '🔧 Funcționalități' : '🔧 Features' });

		new Setting(containerEl)
			.setName(isRomanian ? 'Activează Sarcini' : 'Enable Tasks')
			.setDesc(isRomanian ? 'Afișează secțiunea de sarcini în toolbar' : 'Show tasks section in toolbar')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableTasks)
				.onChange(async (value) => {
					this.plugin.settings.enableTasks = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName(isRomanian ? 'Activează Amintiri' : 'Enable Reminders')
			.setDesc(isRomanian ? 'Afișează secțiunea de amintiri în toolbar' : 'Show reminders section in toolbar')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableReminders)
				.onChange(async (value) => {
					this.plugin.settings.enableReminders = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName(isRomanian ? 'Activează Obiceiuri' : 'Enable Habits')
			.setDesc(isRomanian ? 'Afișează secțiunea de obiceiuri în toolbar' : 'Show habits section in toolbar')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableHabits)
				.onChange(async (value) => {
					this.plugin.settings.enableHabits = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName(isRomanian ? 'Activează Analytics' : 'Enable Analytics')
			.setDesc(isRomanian ? 'Afișează secțiunea de analiză în toolbar' : 'Show analytics section in toolbar')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableAnalytics)
				.onChange(async (value) => {
					this.plugin.settings.enableAnalytics = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName(isRomanian ? 'Activează Calendar' : 'Enable Calendar')
			.setDesc(isRomanian ? 'Afișează secțiunea de calendar în toolbar' : 'Show calendar section in toolbar')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableCalendar)
				.onChange(async (value) => {
					this.plugin.settings.enableCalendar = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName(isRomanian ? 'Activează Pomodoro' : 'Enable Pomodoro')
			.setDesc(isRomanian ? 'Afișează secțiunea de Pomodoro în toolbar' : 'Show Pomodoro section in toolbar')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enablePomodoro)
				.onChange(async (value) => {
					this.plugin.settings.enablePomodoro = value;
					await this.plugin.saveSettings();
				}));

		// Pomodoro Settings Section
		containerEl.createEl('h3', { text: isRomanian ? '🍅 Setări Pomodoro' : '🍅 Pomodoro Settings' });

		new Setting(containerEl)
			.setName(isRomanian ? 'Timp de lucru (minute)' : 'Work Time (minutes)')
			.setDesc(isRomanian ? 'Durata unei sesiuni de lucru' : 'Duration of a work session')
			.addSlider(slider => slider
				.setLimits(1, 60, 1)
				.setValue(this.plugin.settings.pomodoroWorkTime)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.pomodoroWorkTime = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName(isRomanian ? 'Pauză scurtă (minute)' : 'Short Break (minutes)')
			.setDesc(isRomanian ? 'Durata unei pauze scurte' : 'Duration of a short break')
			.addSlider(slider => slider
				.setLimits(1, 30, 1)
				.setValue(this.plugin.settings.pomodoroBreakTime)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.pomodoroBreakTime = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName(isRomanian ? 'Pauză lungă (minute)' : 'Long Break (minutes)')
			.setDesc(isRomanian ? 'Durata unei pauze lungi' : 'Duration of a long break')
			.addSlider(slider => slider
				.setLimits(5, 60, 1)
				.setValue(this.plugin.settings.pomodoroLongBreakTime)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.pomodoroLongBreakTime = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName(isRomanian ? 'Sesiuni până la pauza lungă' : 'Sessions Before Long Break')
			.setDesc(isRomanian ? 'Numărul de sesiuni de lucru înainte de o pauză lungă' : 'Number of work sessions before a long break')
			.addSlider(slider => slider
				.setLimits(2, 8, 1)
				.setValue(this.plugin.settings.pomodoroSessionsBeforeLongBreak)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.pomodoroSessionsBeforeLongBreak = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName(isRomanian ? 'Auto-începe pauzele' : 'Auto-start Breaks')
			.setDesc(isRomanian ? 'Începe automat pauzele după sesiunile de lucru' : 'Automatically start breaks after work sessions')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.pomodoroAutoStartBreaks)
				.onChange(async (value) => {
					this.plugin.settings.pomodoroAutoStartBreaks = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName(isRomanian ? 'Auto-începe lucrul' : 'Auto-start Work')
			.setDesc(isRomanian ? 'Începe automat sesiunile de lucru după pauze' : 'Automatically start work sessions after breaks')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.pomodoroAutoStartWork)
				.onChange(async (value) => {
					this.plugin.settings.pomodoroAutoStartWork = value;
					await this.plugin.saveSettings();
				}));

	}
} 