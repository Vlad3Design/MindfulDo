const { App, Plugin, PluginSettingTab, Setting, WorkspaceLeaf, ItemView } = require('obsidian');

const DEFAULT_SETTINGS = {
	userName: 'User',
	defaultCategory: 'personal',
	enableNotifications: true,
	theme: 'warm',
	language: 'en',
	expiredReminders: 'keep', // 'keep' sau 'auto-delete'
	maxVisibleTasks: 5, // Numărul maxim de task-uri vizibile înainte de scroll
	maxVisibleReminders: 3, // Numărul maxim de reminder-e vizibile înainte de scroll
	sidebarPosition: 'right' // 'left' sau 'right'
}

// Traduceri
const TRANSLATIONS = {
	ro: {
		// Header
		morning: 'Bună dimineața',
		afternoon: 'Bună ziua', 
		evening: 'Bună seara',
		night: 'Bună noaptea',
		
		// Input
		taskPlaceholder: 'Ce ai de făcut astăzi?',
		addButton: 'Adaugă',
		
		// Categories
		all: 'Toate',
		work: 'Lucru',
		personal: 'Personal',
		health: 'Sănătate',
		learning: 'Învățare',
		hobby: 'Hobby',
		
		// Tasks
		tasksTitle: 'Task-urile tale',
		taskCounter: 'task-uri',
		task: 'task',
		clearCompleted: 'Șterge completate',
		emptyTasks: 'Niciun task încă. Adaugă primul pentru a începe!',
		
		// Reminders
		remindersTitle: 'Reminders',
		reminderPlaceholder: 'Ce vrei să îți amintesc?',
		reminderCounter: 'reminder-e',
		noReminders: 'Niciun reminder încă. Creează primul!',
		completeAllFields: 'Completează toate câmpurile pentru reminder!',
		chooseFutureTime: 'Te rog alege o dată și oră în viitor!',
		reminderExpired: 'Reminder expirat:',
		expiredDaysAgo: 'Expirat acum {0} zile',
		expiredHoursAgo: 'Expirat acum {0}h {1}m',
		expiredMinutesAgo: 'Expirat acum {0} minute',
		
		// Settings
		settingsTitle: 'Setări MindfulDo',
		userNameSetting: 'Numele tău',
		userNameDesc: 'Cum vrei să fii salutat în aplicație',
		themeSetting: 'Tema de culoare',
		themeDesc: 'Alege schema de culori preferată',
		languageSetting: 'Limba',
		languageDesc: 'Limba interfeței aplicației',
		expiredRemindersSetting: 'Reminder-e expirate',
		expiredRemindersDesc: 'Cum să fie gestionate reminder-urile după expirare',
		keepExpired: 'Păstrează până la ștergerea manuală',
		autoDeleteExpired: 'Șterge automat la expirare',
		maxTasksSetting: 'Task-uri vizibile înainte de scroll',
		maxTasksDesc: 'Numărul maxim de task-uri afișate înainte să apară scroll-ul',
		maxRemindersSetting: 'Reminder-e vizibile înainte de scroll',
		maxRemindersDesc: 'Numărul maxim de reminder-e afișate înainte să apară scroll-ul',
		sidebarPositionSetting: 'Poziția în sidebar',
		sidebarPositionDesc: 'Alege în care sidebar să se deschidă MindfulDo',
		sidebarLeft: 'Stânga',
		sidebarRight: 'Dreapta',
		defaultCategorySetting: 'Categoria implicită pentru task-uri',
		defaultCategoryDesc: 'Categoria în care vor fi adăugate automat task-urile noi',
		expired: 'expirate'
	},
	en: {
		// Header
		morning: 'Good morning',
		afternoon: 'Good afternoon',
		evening: 'Good evening', 
		night: 'Good night',
		
		// Input
		taskPlaceholder: 'What do you need to do today?',
		addButton: 'Add',
		
		// Categories
		all: 'All',
		work: 'Work',
		personal: 'Personal',
		health: 'Health',
		learning: 'Learning',
		hobby: 'Hobby',
		
		// Tasks
		tasksTitle: 'Your tasks',
		taskCounter: 'tasks',
		task: 'task',
		clearCompleted: 'Clear completed',
		emptyTasks: 'No tasks yet. Add your first one to get started!',
		
		// Reminders
		remindersTitle: 'Reminders',
		reminderPlaceholder: 'What would you like to be reminded of?',
		reminderCounter: 'reminders',
		noReminders: 'No reminders yet. Create your first one!',
		completeAllFields: 'Please complete all fields for the reminder!',
		chooseFutureTime: 'Please choose a future date and time!',
		reminderExpired: 'Reminder expired:',
		expiredDaysAgo: 'Expired {0} days ago',
		expiredHoursAgo: 'Expired {0}h {1}m ago',
		expiredMinutesAgo: 'Expired {0} minutes ago',
		
		// Settings
		settingsTitle: 'MindfulDo Settings',
		userNameSetting: 'Your name',
		userNameDesc: 'How you would like to be greeted in the app',
		themeSetting: 'Color theme',
		themeDesc: 'Choose your preferred color scheme',
		languageSetting: 'Language',
		languageDesc: 'Interface language',
		expiredRemindersSetting: 'Expired reminders',
		expiredRemindersDesc: 'How to handle reminders after they expire',
		keepExpired: 'Keep until manually deleted',
		autoDeleteExpired: 'Auto-delete when expired',
		maxTasksSetting: 'Visible tasks before scroll',
		maxTasksDesc: 'Maximum number of tasks displayed before scrolling appears',
		maxRemindersSetting: 'Visible reminders before scroll',
		maxRemindersDesc: 'Maximum number of reminders displayed before scrolling appears',
		sidebarPositionSetting: 'Sidebar position',
		sidebarPositionDesc: 'Choose which sidebar to open MindfulDo in',
		sidebarLeft: 'Left',
		sidebarRight: 'Right',
		defaultCategorySetting: 'Default category for tasks',
		defaultCategoryDesc: 'The category where new tasks will be automatically added',
		expired: 'expired'
	}
}

const VIEW_TYPE_MINDFULDO = "mindfuldo-view";

class MindfulDoPlugin extends Plugin {
	async onload() {
		await this.loadSettings();

		// Cere permisiune pentru notificări
		this.requestNotificationPermission();

		// Înregistrează view-ul custom
		this.registerView(
			VIEW_TYPE_MINDFULDO,
			(leaf) => new MindfulDoView(leaf, this)
		);

		// Adaugă icon în ribbon (sidebar stânga)
		const ribbonIconEl = this.addRibbonIcon('checkmark', 'MindfulDo', (evt) => {
			this.activateView();
		});
		ribbonIconEl.addClass('mindfuldo-ribbon-class');

		// Adaugă comandă
		this.addCommand({
			id: 'open-mindfuldo',
			name: 'Deschide MindfulDo',
			callback: () => {
				this.activateView();
			}
		});

		// Adaugă tab pentru settings
		this.addSettingTab(new MindfulDoSettingTab(this.app, this));

		// Aplică setările CSS după încărcarea completă
		setTimeout(() => {
			this.updateDynamicCSS();
		}, 500);
	}

	async requestNotificationPermission() {
		if ('Notification' in window && Notification.permission === 'default') {
			const permission = await Notification.requestPermission();
			if (permission === 'granted') {
				new Notice('✅ Notificările pentru reminder-e sunt activate!');
			} else {
				new Notice('⚠️ Notificările sunt dezactivate. Vei vedea doar mesajele în Obsidian.');
			}
		}
	}

	onunload() {
		// Cleanup când plugin-ul se dezactivează
	}

	async activateView() {
		const { workspace } = this.app;

		let leaf = null;
		const leaves = workspace.getLeavesOfType(VIEW_TYPE_MINDFULDO);

		if (leaves.length > 0) {
			// Dacă view-ul există deja, îl activează
			leaf = leaves[0];
		} else {
			// Creează un nou view în sidebar-ul ales
			if (this.settings.sidebarPosition === 'right') {
				leaf = workspace.getRightLeaf(false);
			} else {
				leaf = workspace.getLeftLeaf(false);
			}
			await leaf?.setViewState({ type: VIEW_TYPE_MINDFULDO, active: true });
		}

		// Activează tab-ul
		if (leaf) {
			workspace.revealLeaf(leaf);
		}
	}

	async moveViewToSidebar(newPosition) {
		const { workspace } = this.app;
		const leaves = workspace.getLeavesOfType(VIEW_TYPE_MINDFULDO);
		
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
			await newLeaf?.setViewState({ type: VIEW_TYPE_MINDFULDO, active: true });
			
			// Activează noul tab
			workspace.revealLeaf(newLeaf);
		}
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	updateDynamicCSS() {
		// Creează sau actualizează un style tag pentru CSS dinamic
		let styleEl = document.getElementById('mindfuldo-dynamic-styles');
		if (!styleEl) {
			styleEl = document.createElement('style');
			styleEl.id = 'mindfuldo-dynamic-styles';
			document.head.appendChild(styleEl);
		}

		// Construiește CSS-ul
		const tasksHeight = (this.settings.maxVisibleTasks * 52) + ((this.settings.maxVisibleTasks - 1) * 10);
		const remindersHeight = (this.settings.maxVisibleReminders * 65) + ((this.settings.maxVisibleReminders - 1) * 10);
		
		styleEl.textContent = `
			.mindfuldo-content .tasks-list {
				max-height: ${tasksHeight}px !important;
			}
			.mindfuldo-content .reminders-list {
				max-height: ${remindersHeight}px !important;
			}
		`;
	}
}

class MindfulDoView extends ItemView {
	constructor(leaf, plugin) {
		super(leaf);
		this.plugin = plugin;
		this.tasks = [];
		this.reminders = [];
		this.currentCategory = 'toate';
		this.activeReminders = new Map(); // Pentru a gestiona timeout-urile
	}

	// Helper pentru traduceri
	t(key, ...args) {
		const lang = this.plugin.settings.language || 'ro';
		let text = TRANSLATIONS[lang][key] || TRANSLATIONS['en'][key] || key;
		// Înlocuiește placeholder-ele {0}, {1}, etc.
		args.forEach((arg, index) => {
			text = text.replace(`{${index}}`, arg);
		});
		return text;
	}



	// Reîmprospătează interfața când se schimbă limba
	refreshInterface() {
		const container = this.containerEl.children[1];
		this.createInterface(container);
		this.renderTasks();
		this.renderReminders();
		this.updateDateTime();
		
		// Aplică înălțimile după refresh
		setTimeout(() => {
			this.plugin.updateDynamicCSS();
		}, 50);
	}

	getViewType() {
		return VIEW_TYPE_MINDFULDO;
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

		// Aplică tema salvată
		const theme = this.plugin.settings.theme;
		if (theme && theme !== 'warm') {
			container.setAttribute('data-theme', theme);
		}

		// Încarcă task-urile salvate
		await this.loadTasks();

		// Creează interfața
		this.createInterface(container);
		
		// Inițializează timpul și salutul
		this.updateDateTime();
		setInterval(() => this.updateDateTime(), 1000);
	}

	async onClose() {
		// Cleanup când view-ul se închide
	}

	createInterface(container) {
		container.innerHTML = `
			<div class="mindfuldo-content">
				<!-- Header Section -->
				<div class="header">
					<h1 class="greeting" id="greeting"></h1>
					<div class="time-info" id="timeInfo"></div>
				</div>

				<!-- Input Section -->
				<div class="input-section">
					<div class="input-container">
						<input type="text" class="task-input" id="taskInput" placeholder="${this.t('taskPlaceholder')}">
						<button class="add-btn" id="addBtn">${this.t('addButton')}</button>
					</div>
				</div>

				<!-- Categories -->
				<div class="categories">
					<button class="category-btn active" data-category="toate">
						<span>📋</span> ${this.t('all')}
					</button>
					<button class="category-btn" data-category="lucru">
						<span>💼</span> ${this.t('work')}
					</button>
					<button class="category-btn" data-category="personal">
						<span>🎯</span> ${this.t('personal')}
					</button>
					<button class="category-btn" data-category="sanatate">
						<span>🏃‍♂️</span> ${this.t('health')}
					</button>
					<button class="category-btn" data-category="invatare">
						<span>📚</span> ${this.t('learning')}
					</button>
					<button class="category-btn" data-category="hobby">
						<span>🎨</span> ${this.t('hobby')}
					</button>
				</div>

				<!-- Tasks Section -->
				<div class="tasks-section">
					<div class="tasks-header">
						<h2 class="tasks-title">${this.t('tasksTitle')}</h2>
						<div class="task-counter" id="taskCounter">0 ${this.t('taskCounter')}</div>
					</div>
					<div class="tasks-list" id="tasksList"></div>
					<button class="clear-completed" id="clearCompleted" style="display: none;">
						${this.t('clearCompleted')}
					</button>
				</div>

				<!-- Reminders Section -->
				<div class="reminders-section">
					<div class="reminders-header">
						<h2 class="reminders-title">${this.t('remindersTitle')}</h2>
						<div class="reminder-counter" id="reminderCounter">0 ${this.t('reminderCounter')}</div>
					</div>
					
					<div class="reminder-input-section">
						<input type="text" class="reminder-text-input" id="reminderText" placeholder="${this.t('reminderPlaceholder')}">
						<div class="datetime-inputs">
							<input type="date" class="reminder-date-input" id="reminderDate">
							<input type="time" class="reminder-time-input" id="reminderTime">
						</div>
						<button class="add-reminder-btn" id="addReminderBtn">
							<span>${this.t('addButton')}</span>
						</button>
					</div>

					<div class="reminders-list" id="remindersList"></div>
				</div>
			</div>
		`;

		// Adaugă event listeners
		this.setupEventListeners();
		this.renderTasks();
		this.renderReminders();

		// Aplică înălțimile configurate pentru liste după rendering
		setTimeout(() => {
			this.plugin.updateDynamicCSS();
		}, 50);

		// Asigură-te că CSS-ul se aplică pentru prima dată
		setTimeout(() => {
			this.plugin.updateDynamicCSS();
		}, 200);
	}

	setupEventListeners() {
		const addBtn = this.containerEl.querySelector('#addBtn');
		const taskInput = this.containerEl.querySelector('#taskInput');
		const clearCompleted = this.containerEl.querySelector('#clearCompleted');

		// Task events
		addBtn?.addEventListener('click', () => this.addTask());
		taskInput?.addEventListener('keypress', (e) => {
			if (e.key === 'Enter') this.addTask();
		});
		clearCompleted?.addEventListener('click', () => this.clearCompleted());

		// Category buttons
		this.containerEl.querySelectorAll('.category-btn').forEach(btn => {
			btn.addEventListener('click', (e) => {
				const category = e.currentTarget.getAttribute('data-category');
				if (category) this.setCategory(category);
			});
		});

		// Reminder events
		const addReminderBtn = this.containerEl.querySelector('#addReminderBtn');
		const reminderText = this.containerEl.querySelector('#reminderText');
		const reminderDate = this.containerEl.querySelector('#reminderDate');
		const reminderTime = this.containerEl.querySelector('#reminderTime');

		addReminderBtn?.addEventListener('click', () => this.addReminder());
		reminderText?.addEventListener('keypress', (e) => {
			if (e.key === 'Enter') this.addReminder();
		});

		// Set default values - tomorrow at current time
		if (reminderDate && reminderTime) {
			const tomorrow = new Date();
			tomorrow.setDate(tomorrow.getDate() + 1);
			reminderDate.value = tomorrow.toISOString().split('T')[0];
			
			const now = new Date();
			reminderTime.value = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
		}
	}

	updateDateTime() {
		const now = new Date();
		const hour = now.getHours();

		const userName = this.plugin.settings.userName || (this.plugin.settings.language === 'en' ? 'User' : 'Utilizator');
		
		let greetingKey = '';
		if (hour >= 5 && hour < 12) {
			greetingKey = 'morning';
		} else if (hour >= 12 && hour < 17) {
			greetingKey = 'afternoon';
		} else if (hour >= 17 && hour < 22) {
			greetingKey = 'evening';
		} else {
			greetingKey = 'night';
		}

		const greeting = `${this.t(greetingKey)}, ${userName}!`;

		const greetingEl = this.containerEl.querySelector('#greeting');
		if (greetingEl) greetingEl.textContent = greeting;

		const options = {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		};
		const locale = this.plugin.settings.language === 'en' ? 'en-US' : 'ro-RO';
		const timeString = now.toLocaleDateString(locale, options);
		const timeEl = this.containerEl.querySelector('#timeInfo');
		if (timeEl) timeEl.textContent = timeString;
	}

	async addTask() {
		const taskInput = this.containerEl.querySelector('#taskInput');
		const taskText = taskInput.value.trim();
		
		if (taskText === '') return;

		const task = {
			id: Date.now(),
			text: taskText,
			completed: false,
			category: this.currentCategory === 'toate' ? this.plugin.settings.defaultCategory : this.currentCategory,
			createdAt: new Date().toISOString()
		};

		this.tasks.push(task);
		await this.saveTasks();
		
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
			this.renderTasks();
		}, 100);
	}

	setCategory(category) {
		this.currentCategory = category;
		
		// Actualizează butoanele active cu efect calm
		this.containerEl.querySelectorAll('.category-btn').forEach(btn => {
			btn.classList.remove('active');
			btn.style.transform = 'scale(1)';
		});
		
		const activeBtn = this.containerEl.querySelector(`[data-category="${category}"]`);
		activeBtn?.classList.add('active');
		
		// Efect calm pentru butonul selectat
		activeBtn.style.transform = 'scale(1.02)';
		setTimeout(() => {
			activeBtn.style.transform = 'scale(1)';
		}, 600);
		
		setTimeout(() => {
			this.renderTasks();
		}, 150);
	}

	toggleTask(id) {
		const taskIndex = this.tasks.findIndex(task => task.id === id);
		if (taskIndex !== -1) {
			this.tasks[taskIndex].completed = !this.tasks[taskIndex].completed;
			this.saveTasks();
			
			// Re-render imediat pentru a muta task-ul
			this.renderTasks();
		}
	}

	deleteTask(id) {
		this.tasks = this.tasks.filter(task => task.id !== id);
		this.saveTasks();
		this.renderTasks();
	}

	clearCompleted() {
		this.tasks = this.tasks.filter(task => !task.completed);
		this.saveTasks();
		setTimeout(() => {
			this.renderTasks();
		}, 50);
	}

	renderTasks() {
		const tasksList = this.containerEl.querySelector('#tasksList');
		const taskCounter = this.containerEl.querySelector('#taskCounter');
		const clearCompletedBtn = this.containerEl.querySelector('#clearCompleted');
		
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
		const taskCounterText = activeTasks.length === 1 ? 
			`1 ${this.t('task')}` :
			`${activeTasks.length} ${this.t('taskCounter')}`;
		taskCounter.textContent = taskCounterText;
		
		// Show/hide clear completed button - only if there are completed tasks and tasks in current category
		const hasCompletedTasks = completedTasks.length > 0;
		const hasTasksInCategory = filteredTasks.length > 0;
		clearCompletedBtn.style.display = (hasCompletedTasks && hasTasksInCategory) ? 'block' : 'none';

		if (filteredTasks.length === 0) {
			tasksList.innerHTML = `
				<div class="empty-state">
					<div class="empty-state-icon">✨</div>
					<p>${this.t('emptyTasks')}</p>
				</div>
			`;
			return;
		}

		tasksList.innerHTML = filteredTasks.map(task => `
			<div class="task-item ${task.completed ? 'completed' : ''}">
				<div class="task-checkbox ${task.completed ? 'checked' : ''}" data-task-id="${task.id}"></div>
				<div class="task-text">${task.text}</div>
				<div class="task-category ${task.category}">${this.getCategoryName(task.category)}</div>
				<button class="task-delete" data-task-id="${task.id}">×</button>
			</div>
		`).join('');

		// Add event listeners for tasks
		tasksList.querySelectorAll('.task-checkbox').forEach(checkbox => {
			checkbox.addEventListener('click', (e) => {
				const taskId = parseInt(e.target.getAttribute('data-task-id') || '0');
				this.toggleTask(taskId);
			});
		});

		tasksList.querySelectorAll('.task-delete').forEach(deleteBtn => {
			deleteBtn.addEventListener('click', (e) => {
				const taskId = parseInt(e.target.getAttribute('data-task-id') || '0');
				this.deleteTask(taskId);
			});
		});
	}

	getCategoryName(category) {
		const categoryMap = {
			'toate': 'all',
			'lucru': 'work',
			'personal': 'personal',
			'sanatate': 'health',
			'invatare': 'learning',
			'hobby': 'hobby'
		};
		const translationKey = categoryMap[category] || category;
		return this.t(translationKey);
	}

	async loadTasks() {
		const data = await this.plugin.loadData();
		this.tasks = data?.tasks || [];
		this.reminders = data?.reminders || [];
		
		// Reactivează reminder-ele existente
		this.setupExistingReminders();
	}

	async saveTasks() {
		const data = await this.plugin.loadData() || {};
		data.tasks = this.tasks;
		data.reminders = this.reminders;
		await this.plugin.saveData(data);
	}

	async addReminder() {
		const reminderText = this.containerEl.querySelector('#reminderText');
		const reminderDate = this.containerEl.querySelector('#reminderDate');
		const reminderTime = this.containerEl.querySelector('#reminderTime');
		
		const text = reminderText.value.trim();
		const date = reminderDate.value;
		const time = reminderTime.value;
		
		if (!text || !date || !time) {
			new Notice(`💬 ${this.t('completeAllFields')}`);
			return;
		}

		// Combină data și ora
		const reminderDateTime = new Date(`${date}T${time}`);
		const now = new Date();
		
		if (reminderDateTime <= now) {
			new Notice(`⚠️ ${this.t('chooseFutureTime')}`);
			return;
		}

		const reminder = {
			id: Date.now(),
			text: text,
			time: reminderDateTime.toISOString(),
			active: true
		};

		this.reminders.push(reminder);
		await this.saveTasks();
		
		// Clear inputs
		reminderText.value = '';
		// Set default to tomorrow at current time
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		reminderDate.value = tomorrow.toISOString().split('T')[0];
		const currentTime = new Date();
		reminderTime.value = `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`;
		
		// Setup notification
		this.setupReminderNotification(reminder);
		
		// Feedback
		reminderText.style.transform = 'scale(0.99)';
		reminderText.style.background = 'rgba(76, 175, 80, 0.15)';
		setTimeout(() => {
			reminderText.style.transform = 'scale(1)';
			reminderText.style.background = '';
		}, 800);

		this.renderReminders();
	}

	setupReminderNotification(reminder) {
		const now = new Date();
		const reminderTime = new Date(reminder.time);
		const delay = reminderTime.getTime() - now.getTime();
		
		if (delay <= 0) return;

		const timeoutId = setTimeout(() => {
			this.showReminderNotification(reminder);
			this.activeReminders.delete(reminder.id);
		}, delay);

		this.activeReminders.set(reminder.id, timeoutId);
	}

	setupExistingReminders() {
		const now = new Date();
		this.reminders.forEach(reminder => {
			if (reminder.active) {
				const reminderTime = new Date(reminder.time);
				if (reminderTime > now) {
					this.setupReminderNotification(reminder);
				} else {
					// Reminder-ul a trecut - gestionează conform setărilor
					if (this.plugin.settings.expiredReminders === 'auto-delete') {
						// Șterge reminder-ul expirat
						this.deleteReminder(reminder.id);
					} else {
						// Păstrează reminder-ul dar marchează ca expirat pentru afișare
						reminder.expired = true;
					}
				}
			}
		});
		// Salvează modificările
		this.saveTasks();
	}

	showReminderNotification(reminder) {
		// Decide dacă să șteargă reminder-ul automat
		if (this.plugin.settings.expiredReminders === 'auto-delete') {
			this.deleteReminder(reminder.id);
		} else {
			// Păstrează reminder-ul dar marchează ca expirat
			reminder.expired = true;
			this.saveTasks();
			this.renderReminders();
		}

		// Arată notificarea
		if ('Notification' in window && Notification.permission === 'granted') {
			new Notification(`🔔 ${this.t('reminderExpired')}`, {
				body: reminder.text,
				icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiByeD0iMjAiIGZpbGw9IiNmZjhhNjUiLz4KPHN2ZyB4PSIyNSIgeT0iMjUiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSI+CjxwYXRoIGQ9Ik05IDEyTDExIDE0TDE1IDEwTTIxIDEyQzIxIDE2Ljk3MDYgMTYuOTcwNiAyMSAxMiAyMUM3LjAyOTQ0IDIxIDMgMTYuOTcwNiAzIDEyQzMgNy4wMjk0NCA3LjAyOTQ0IDMgMTIgM0MxNi45NzA2IDMgMjEgNy4wMjk0NCAyMSAxMloiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4KPC9zdmc+',
				badge: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiByeD0iMjAiIGZpbGw9IiNmZjhhNjUiLz4KPHN2ZyB4PSIyNSIgeT0iMjUiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSI+CjxwYXRoIGQ9Ik05IDEyTDExIDE0TDE1IDEwTTIxIDEyQzIxIDE2Ljk3MDYgMTYuOTcwNiAyMSAxMiAyMUM3LjAyOTQ0IDIxIDMgMTYuOTcwNiAzIDEyQzMgNy4wMjk0NCA3LjAyOTQ0IDMgMTIgM0MxNi45NzA2IDMgMjEgNy4wMjk0NCAyMSAxMloiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4KPC9zdmc+'
			});
		}
		
		// Notificare în Obsidian
		new Notice(`🔔 ${this.t('reminderExpired')} ${reminder.text}`, 8000);

		// Șterge din activeReminders
		this.activeReminders.delete(reminder.id);
	}

	deleteReminder(id) {
		// Anulează timeout-ul dacă există
		if (this.activeReminders.has(id)) {
			clearTimeout(this.activeReminders.get(id));
			this.activeReminders.delete(id);
		}
		
		this.reminders = this.reminders.filter(reminder => reminder.id !== id);
		this.saveTasks();
		this.renderReminders();
	}

	renderReminders() {
		const remindersList = this.containerEl.querySelector('#remindersList');
		const reminderCounter = this.containerEl.querySelector('#reminderCounter');
		
		if (!remindersList || !reminderCounter) return;

		// Filtrează reminder-ele în funcție de setări
		let visibleReminders;
		if (this.plugin.settings.expiredReminders === 'keep') {
			// Afișează toate reminder-urile (active și expirate)
			visibleReminders = this.reminders.filter(reminder => reminder.active);
		} else {
			// Afișează doar reminder-urile active (cele expirate sunt șterse automat)
			visibleReminders = this.reminders.filter(reminder => reminder.active);
		}
		
		// Numără reminder-urile active pentru counter
		const activeReminders = this.reminders.filter(reminder => reminder.active && !reminder.expired);
		const expiredReminders = this.reminders.filter(reminder => reminder.active && reminder.expired);
		
		// Update counter
		let counterText;
		if (this.plugin.settings.expiredReminders === 'keep' && expiredReminders.length > 0) {
			counterText = `${activeReminders.length} ${this.t('reminderCounter')}${expiredReminders.length > 0 ? ` (${expiredReminders.length} ${this.t('expired')})` : ''}`;
		} else {
			counterText = activeReminders.length === 1 ? 
				(this.plugin.settings.language === 'en' ? '1 reminder' : '1 reminder') :
				`${activeReminders.length} ${this.t('reminderCounter')}`;
		}
		reminderCounter.textContent = counterText;

		if (visibleReminders.length === 0) {
			remindersList.innerHTML = `
				<div class="empty-reminders">
					<div class="empty-reminders-icon">⏰</div>
					<p>${this.t('noReminders')}</p>
				</div>
			`;
			return;
		}

		// Sortează reminder-ele după timp
		visibleReminders.sort((a, b) => new Date(a.time) - new Date(b.time));

		remindersList.innerHTML = visibleReminders.map(reminder => {
			const reminderTime = new Date(reminder.time);
			const now = new Date();
			const timeLeft = reminderTime.getTime() - now.getTime();
			const isExpired = reminder.expired || timeLeft <= 0;
			
			let timeDisplay = '';
			if (isExpired) {
				const timePassed = Math.abs(timeLeft);
				const hours = Math.floor(timePassed / (1000 * 60 * 60));
				const minutes = Math.floor((timePassed % (1000 * 60 * 60)) / (1000 * 60));
				
				if (hours > 24) {
					const days = Math.floor(hours / 24);
					timeDisplay = this.t('expiredDaysAgo', days);
				} else if (hours > 0) {
					timeDisplay = this.t('expiredHoursAgo', hours, minutes);
				} else {
					timeDisplay = this.t('expiredMinutesAgo', minutes);
				}
			} else {
				const hours = Math.floor(timeLeft / (1000 * 60 * 60));
				const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
				
				if (hours > 24) {
					const days = Math.floor(hours / 24);
					timeDisplay = this.plugin.settings.language === 'en' ? `in ${days} days` : `în ${days} zile`;
				} else if (hours > 0) {
					timeDisplay = this.plugin.settings.language === 'en' ? `in ${hours}h ${minutes}m` : `în ${hours}h ${minutes}m`;
				} else {
					timeDisplay = this.plugin.settings.language === 'en' ? `in ${minutes} minutes` : `în ${minutes} minute`;
				}
			}

			const locale = this.plugin.settings.language === 'en' ? 'en-US' : 'ro-RO';
			
			return `
				<div class="reminder-item ${isExpired ? 'expired' : ''}">
					<div class="reminder-content">
						<div class="reminder-text">${reminder.text}</div>
						<div class="reminder-time">
							📅 ${reminderTime.toLocaleDateString(locale)} la ${reminderTime.toLocaleTimeString(locale, {hour: '2-digit', minute: '2-digit'})}
							<span class="time-left ${isExpired ? 'expired' : ''}">(${timeDisplay})</span>
						</div>
					</div>
					<button class="reminder-delete" data-reminder-id="${reminder.id}">×</button>
				</div>
			`;
		}).join('');

		// Add event listeners for delete buttons
		remindersList.querySelectorAll('.reminder-delete').forEach(deleteBtn => {
			deleteBtn.addEventListener('click', (e) => {
				const reminderId = parseInt(e.target.getAttribute('data-reminder-id') || '0');
				this.deleteReminder(reminderId);
			});
		});
	}
}

class MindfulDoSettingTab extends PluginSettingTab {
	constructor(app, plugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display() {
		const {containerEl} = this;

		containerEl.empty();
		
		// Helper pentru traduceri în settings
		const t = (key) => {
			const lang = this.plugin.settings.language || 'ro';
			return TRANSLATIONS[lang][key] || TRANSLATIONS['en'][key] || key;
		};
		
		// Aplică tema curentă la deschiderea settings-urilor
		this.applyTheme(this.plugin.settings.theme);

		// Titlul settings-urilor
		containerEl.createEl('h2', { text: t('settingsTitle') });

		new Setting(containerEl)
			.setName(t('userNameSetting'))
			.setDesc(t('userNameDesc'))
			.addText(text => text
				.setPlaceholder(this.plugin.settings.language === 'en' ? 'Enter your name' : 'Introdu numele tău')
				.setValue(this.plugin.settings.userName)
				.onChange(async (value) => {
					this.plugin.settings.userName = value || (this.plugin.settings.language === 'en' ? 'User' : 'Utilizator');
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName(t('languageSetting'))
			.setDesc(t('languageDesc'))
			.addDropdown(dropdown => dropdown
				.addOption('ro', '🇷🇴 Română')
				.addOption('en', '🇺🇸 English')
				.setValue(this.plugin.settings.language)
				.onChange(async (value) => {
					this.plugin.settings.language = value;
					await this.plugin.saveSettings();
					// Reface interfața pentru a actualiza limba
					const views = this.app.workspace.getLeavesOfType('mindfuldo-view');
					views.forEach(leaf => {
						if (leaf.view && leaf.view.createInterface) {
							leaf.view.createInterface(leaf.view.containerEl.children[1]);
							leaf.view.renderTasks();
							leaf.view.renderReminders();
						}
					});
					// Actualizează și settings-urile
					this.display();
				}));

		new Setting(containerEl)
			.setName(t('themeSetting'))
			.setDesc(t('themeDesc'))
			.addDropdown(dropdown => dropdown
				.addOption('warm', '🎨 Default')
				.addOption('ocean', '🌊 Ocean (Blue-Teal)')
				.addOption('forest', '🌲 Forest (Green)')
				.addOption('sunset', '🌸 Sunset (Pink-Orange)')
				.addOption('purple', '💜 Purple (Violet)')
				.addOption('midnight', '🌙 Midnight (Dark Blue)')
				.setValue(this.plugin.settings.theme)
				.onChange(async (value) => {
					this.plugin.settings.theme = value;
					await this.plugin.saveSettings();
					// Aplică tema imediat
					this.applyTheme(value);
				}));

		new Setting(containerEl)
			.setName(t('expiredRemindersSetting'))
			.setDesc(t('expiredRemindersDesc'))
			.addDropdown(dropdown => dropdown
				.addOption('keep', t('keepExpired'))
				.addOption('auto-delete', t('autoDeleteExpired'))
				.setValue(this.plugin.settings.expiredReminders)
				.onChange(async (value) => {
					this.plugin.settings.expiredReminders = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName(t('maxTasksSetting'))
			.setDesc(t('maxTasksDesc'))
			.addSlider(slider => slider
				.setLimits(3, 15, 1)
				.setValue(this.plugin.settings.maxVisibleTasks)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.maxVisibleTasks = value;
					await this.plugin.saveSettings();
					// Actualizează CSS-ul pentru task-uri
					this.plugin.updateDynamicCSS();
				}));

		new Setting(containerEl)
			.setName(t('maxRemindersSetting'))
			.setDesc(t('maxRemindersDesc'))
			.addSlider(slider => slider
				.setLimits(3, 15, 1)
				.setValue(this.plugin.settings.maxVisibleReminders)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.maxVisibleReminders = value;
					await this.plugin.saveSettings();
					// Actualizează CSS-ul pentru reminder-e
					this.plugin.updateDynamicCSS();
				}));

		new Setting(containerEl)
			.setName(t('sidebarPositionSetting'))
			.setDesc(t('sidebarPositionDesc'))
			.addDropdown(dropdown => dropdown
				.addOption('left', t('sidebarLeft'))
				.addOption('right', t('sidebarRight'))
				.setValue(this.plugin.settings.sidebarPosition)
				.onChange(async (value) => {
					this.plugin.settings.sidebarPosition = value;
					await this.plugin.saveSettings();
					// Mută view-ul în noul sidebar
					this.plugin.moveViewToSidebar(value);
				}));

		new Setting(containerEl)
			.setName(t('defaultCategorySetting'))
			.setDesc(t('defaultCategoryDesc'))
			.addDropdown(dropdown => dropdown
				.addOption('personal', t('personal'))
				.addOption('lucru', t('work'))
				.addOption('sanatate', t('health'))
				.addOption('invatare', t('learning'))
				.addOption('hobby', t('hobby'))
				.setValue(this.plugin.settings.defaultCategory)
				.onChange(async (value) => {
					this.plugin.settings.defaultCategory = value;
					await this.plugin.saveSettings();
				}));
	}

	applyTheme(theme) {
		// Găsește container-ul plugin-ului
		const containers = document.querySelectorAll('.mindfuldo-container');
		containers.forEach(container => {
			// Elimină temele existente
			container.removeAttribute('data-theme');
			// Adaugă tema nouă
			if (theme && theme !== 'warm') {
				container.setAttribute('data-theme', theme);
			}
		});
	}
}

module.exports = MindfulDoPlugin; 