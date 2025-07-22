var x=Object.defineProperty;var M=Object.getOwnPropertyDescriptor;var H=Object.getOwnPropertyNames;var I=Object.prototype.hasOwnProperty;var P=(E,k)=>{for(var t in k)x(E,t,{get:k[t],enumerable:!0})},q=(E,k,t,e)=>{if(k&&typeof k=="object"||typeof k=="function")for(let i of H(k))!I.call(E,i)&&i!==t&&x(E,i,{get:()=>k[i],enumerable:!(e=M(k,i))||e.enumerable});return E};var R=E=>q(x({},"__esModule",{value:!0}),E);var g=(E,k,t)=>new Promise((e,i)=>{var s=o=>{try{n(t.next(o))}catch(r){i(r)}},a=o=>{try{n(t.throw(o))}catch(r){i(r)}},n=o=>o.done?e(o.value):Promise.resolve(o.value).then(s,a);n((t=t.apply(E,k)).next())});var B={};P(B,{RelaxingTodoView:()=>L,VIEW_TYPE_RELAXING_TODO:()=>D,default:()=>w});module.exports=R(B);var h=require("obsidian");var N={defaultCategory:"personal",enableNotifications:!0,theme:"default",userName:"Vlad",language:"ro",sidebarPosition:"left",autoDeleteExpired:!1,pomodoroWorkTime:25,pomodoroBreakTime:5,pomodoroLongBreakTime:15,pomodoroSessionsBeforeLongBreak:4,pomodoroAutoStartBreaks:!1,pomodoroAutoStartWork:!1,enableTasks:!0,enableReminders:!1,enableHabits:!1,enableAnalytics:!1,enableCalendar:!1,enablePomodoro:!1},D="relaxing-todo-view",w=class extends h.Plugin{constructor(){super(...arguments);this.lastDataUpdate=0}onload(){return g(this,null,function*(){yield this.loadSettings(),this.dataFilePath=this.app.vault.configDir+"/plugins/mindfuldo/data.json",this.registerView(D,e=>new L(e,this)),this.registerEvent(this.app.vault.on("modify",e=>{(e.path.includes("mindfuldo")||e.path.includes("data.json"))&&this.handleDataFileChange()})),this.registerInterval(window.setInterval(()=>{this.checkForDataChanges()},3e3)),this.addRibbonIcon("checkmark","MindfulDo - Task Manager",e=>{this.activateView()}).addClass("relaxing-todo-ribbon-class"),this.addCommand({id:"open-relaxing-todo",name:"Open MindfulDo",callback:()=>{this.activateView()}}),this.addSettingTab(new A(this.app,this))})}onunload(){}activateView(){return g(this,null,function*(){let{workspace:t}=this.app,e=null,i=t.getLeavesOfType(D);i.length>0?e=i[0]:(this.settings.sidebarPosition==="right"?e=t.getRightLeaf(!1):e=t.getLeftLeaf(!1),yield e==null?void 0:e.setViewState({type:D,active:!0})),e&&t.revealLeaf(e)})}moveViewToSidebar(t){return g(this,null,function*(){let{workspace:e}=this.app,i=e.getLeavesOfType(D);if(i.length>0){i[0].detach();let a;t==="right"?a=e.getRightLeaf(!1):a=e.getLeftLeaf(!1),yield a==null?void 0:a.setViewState({type:D,active:!0}),a&&e.revealLeaf(a)}})}loadSettings(){return g(this,null,function*(){this.settings=Object.assign({},N,yield this.loadData())})}saveSettings(){return g(this,null,function*(){yield this.saveData(this.settings),this.refreshViews()})}refreshViews(){this.app.workspace.getLeavesOfType(D).forEach(e=>{e.view instanceof L&&e.view.refreshInterface()})}handleDataFileChange(){return g(this,null,function*(){let t=Date.now();if(t-this.lastDataUpdate<3e3)return;this.lastDataUpdate=t,this.app.workspace.getLeavesOfType(D).forEach(i=>{i.view instanceof L&&!i.view.isDragging&&!i.view.disableSync&&i.view.syncWithExternalChanges()})})}checkForDataChanges(){return g(this,null,function*(){try{let t=yield this.app.vault.adapter.stat(this.dataFilePath);t&&t.mtime>this.lastDataUpdate&&this.handleDataFileChange()}catch(t){}})}},L=class extends h.ItemView{constructor(t,e){super(t);this.tasks=[];this.reminders=[];this.habits=[];this.currentCategory="toate";this.currentView="tasks";this.pomodoroTimer=null;this.pomodoroTimeLeft=0;this.pomodoroIsRunning=!1;this.pomodoroMode="work";this.pomodoroCompletedSessions=0;this.pomodoroCurrentCycle=1;this.currentAnalyticsWeek=new Date;this.lastLocalUpdate=0;this.isDragging=!1;this.disableSync=!1;this.currentMonth=new Date().getMonth();this.currentYear=new Date().getFullYear();this.currentHabitsMonth=new Date().getMonth();this.currentHabitsYear=new Date().getFullYear();this.plugin=e}getViewType(){return D}getDisplayText(){return"MindfulDo"}getIcon(){return"checkmark"}onOpen(){return g(this,null,function*(){let t=this.containerEl.children[1];t.empty(),t.addClass("mindfuldo-container"),t.setAttribute("data-theme",this.plugin.settings.theme),yield this.loadData(),this.createInterface(t),this.updateDateTime(),setInterval(()=>this.updateDateTime(),1e3),this.checkExpiredReminders(),setInterval(()=>this.checkExpiredReminders(),6e4),setInterval(()=>g(this,null,function*(){return yield this.saveData()}),3e4)})}onClose(){return g(this,null,function*(){yield this.saveData(),this.pomodoroTimer&&(clearInterval(this.pomodoroTimer),this.pomodoroTimer=null)})}refreshInterface(){let t=this.containerEl.children[1];t.empty(),t.addClass("mindfuldo-container"),t.setAttribute("data-theme",this.plugin.settings.theme),this.createInterface(t),this.updateDateTime(),this.renderCurrentView()}syncWithExternalChanges(){return g(this,null,function*(){try{let t=Date.now();if(this.disableSync||this.isDragging||t-this.lastLocalUpdate<1e4)return;switch(yield this.saveData(),yield this.loadData(),this.currentView){case"habits":this.renderHabits();break;case"tasks":this.renderTasks();break;case"reminders":this.renderReminders();break;case"analytics":this.renderAnalytics();break;case"calendar":this.renderCalendar();break;case"pomodoro":this.renderPomodoro();break}}catch(t){console.error("MindfulDo: Error syncing external changes:",t)}})}createInterface(t){t.innerHTML=`
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
							<button class="add-btn" id="addBtn">${this.plugin.settings.language==="ro"?"Adaug\u0103":"Add"}</button>
						</div>
					</div>

					<!-- Categories -->
					<div class="categories">
						<button class="category-btn active" data-category="toate">
							<span>\u{1F4CB}</span> ${this.plugin.settings.language==="ro"?"Toate":"All"}
						</button>
						<button class="category-btn" data-category="work">
							<span>\u{1F4BC}</span> ${this.plugin.settings.language==="ro"?"Lucru":"Work"}
						</button>
						<button class="category-btn" data-category="personal">
							<span>\u{1F3AF}</span> Personal
						</button>
						<button class="category-btn" data-category="health">
							<span>\u{1F3C3}\u200D\u2642\uFE0F</span> ${this.plugin.settings.language==="ro"?"S\u0103n\u0103tate":"Health"}
						</button>
						<button class="category-btn" data-category="learning">
							<span>\u{1F4DA}</span> ${this.plugin.settings.language==="ro"?"\xCEnv\u0103\u021Bare":"Learning"}
						</button>
						<button class="category-btn" data-category="hobby">
							<span>\u{1F3A8}</span> Hobby
						</button>
					</div>

					<!-- Tasks Section -->
					<div class="tasks-section">
						<div class="tasks-header">
							<h2 class="tasks-title">${this.plugin.settings.language==="ro"?"Sarcinile dvs.":"Your Tasks"}</h2>
							<div class="task-counter" id="taskCounter">0 ${this.plugin.settings.language==="ro"?"sarcini":"tasks"}</div>
						</div>
						<div class="tasks-list" id="tasksList"></div>
						<button class="clear-completed" id="clearCompleted" style="display: none;">
							${this.plugin.settings.language==="ro"?"\u0218terge finalizate":"Clear Completed"}
						</button>
					</div>
				</div>

				<!-- Reminders View -->
				<div class="view-container" id="remindersView" style="display: none;">
					<!-- Reminder Input Section -->
					<div class="reminders-section">
						<div class="reminders-header">
							<h2 class="reminders-title">${this.plugin.settings.language==="ro"?"Amintirile tale":"Your Reminders"}</h2>
							<div class="reminder-counter" id="reminderCounter">0 ${this.plugin.settings.language==="ro"?"amintiri":"reminders"}</div>
						</div>

						<div class="reminder-input-section">
							<input type="text" class="reminder-text-input" id="reminderTextInput" placeholder="${this.getReminderPlaceholder()}">
							
							<div class="datetime-inputs">
								<input type="date" class="reminder-date-input" id="reminderDateInput">
								<input type="time" class="reminder-time-input" id="reminderTimeInput">
								<button class="add-reminder-btn" id="addReminderBtn">${this.plugin.settings.language==="ro"?"Adaug\u0103 amintire":"Add Reminder"}</button>
							</div>
						</div>

						<div class="reminders-list" id="remindersList"></div>
					</div>
				</div>

				<!-- Habits View -->
				<div class="view-container" id="habitsView" style="display: none;">
					<div class="habits-section">
						<div class="habits-header">
							<h2 class="habits-title">${this.plugin.settings.language==="ro"?"Obiceiurile tale":"Your Habits"}</h2>
							<div class="habit-counter" id="habitCounter">0 ${this.plugin.settings.language==="ro"?"obiceiuri":"habits"}</div>
						</div>

						<div class="habit-input-section">
							<div class="habit-input-container">
								<input type="text" class="habit-name-input" id="habitNameInput" placeholder="${this.plugin.settings.language==="ro"?"Nume obicei (ex: Bea ap\u0103, Cite\u0219te, Sport)":"Habit name (e.g., Drink water, Read, Exercise)"}">
								<button class="add-habit-btn" id="addHabitBtn">${this.plugin.settings.language==="ro"?"Adaug\u0103":"Add"}</button>
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
							<h2 class="analytics-title">${this.plugin.settings.language==="ro"?"Analiz\u0103 s\u0103pt\u0103m\xE2nal\u0103":"Weekly Analytics"}</h2>
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
									<h3>\u{1F4DD} ${this.plugin.settings.language==="ro"?"Sarcini":"Tasks"}</h3>
								</div>
								<div class="card-content">
									<div class="main-stat">
										<span class="stat-number" id="weeklyTasksCompleted">0</span>
										<span class="stat-label">${this.plugin.settings.language==="ro"?"completate":"completed"}</span>
									</div>
									<div class="sub-stats">
										<div class="sub-stat">
											<span class="change-indicator" id="tasksChange">+0%</span>
											<span>${this.plugin.settings.language==="ro"?"vs s\u0103pt\u0103m\xE2na trecut\u0103":"vs last week"}</span>
										</div>
										<div class="sub-stat">
											<span class="peak-day" id="tasksPeakDay">${this.plugin.settings.language==="ro"?"Cea mai bun\u0103: -":"Best day: -"}</span>
										</div>
									</div>
								</div>
							</div>

							<!-- Habits Analytics -->
							<div class="analytics-card">
								<div class="card-header">
									<h3>\u{1F504} ${this.plugin.settings.language==="ro"?"Obiceiuri":"Habits"}</h3>
								</div>
								<div class="card-content">
									<div class="main-stat">
										<span class="stat-number" id="weeklyHabitsRate">0%</span>
										<span class="stat-label">${this.plugin.settings.language==="ro"?"rata de succes":"success rate"}</span>
									</div>
									<div class="sub-stats">
										<div class="sub-stat">
											<span class="habits-completed" id="habitsCompleted">0.0 ${this.plugin.settings.language==="ro"?"habit-uri/zi":"habits/day"}</span>
										</div>
										<div class="sub-stat">
											<span class="streak-count" id="activeStreaks">0</span>
											<span>${this.plugin.settings.language==="ro"?"streak-uri active":"active streaks"}</span>
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
										<span class="stat-label">${this.plugin.settings.language==="ro"?"sesiuni":"sessions"}</span>
									</div>
									<div class="sub-stats">
										<div class="sub-stat">
											<span class="focus-time" id="totalFocusTime">0h 0min</span>
											<span>${this.plugin.settings.language==="ro"?"timp de focus":"focus time"}</span>
										</div>
										<div class="sub-stat">
											<span class="avg-session" id="avgSessionLength">0min</span>
											<span>${this.plugin.settings.language==="ro"?"sesiune medie":"avg session"}</span>
										</div>
									</div>
								</div>
							</div>

							<!-- Productivity Score -->
							<div class="analytics-card productivity-card">
								<div class="card-header">
									<h3>\u26A1 ${this.plugin.settings.language==="ro"?"Scorul s\u0103pt\u0103m\xE2nii":"Weekly Score"}</h3>
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
												<span class="breakdown-label">${this.plugin.settings.language==="ro"?"Sarcini":"Tasks"}</span>
												<span class="breakdown-value" id="tasksScore">0/30</span>
											</div>
											<div class="breakdown-item">
												<span class="breakdown-label">${this.plugin.settings.language==="ro"?"Obiceiuri":"Habits"}</span>
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
							<h3>${this.plugin.settings.language==="ro"?"Activitatea zilnic\u0103":"Daily Activity"}</h3>
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
							<span>${this.plugin.settings.language==="ro"?"Sarcini":"Tasks"}</span>
						</div>
							<div class="legend-item">
								<span class="legend-dot reminder-dot"></span>
								<span>${this.plugin.settings.language==="ro"?"Amintiri":"Reminders"}</span>
							</div>
						</div>
					</div>
				</div>

				<!-- Pomodoro View -->
				<div class="view-container" id="pomodoroView" style="display: none;">
					<div class="pomodoro-section">
						<div class="pomodoro-header">
							<h2 class="pomodoro-title">${this.plugin.settings.language==="ro"?"Timer Pomodoro":"Pomodoro Timer"}</h2>
							<div class="pomodoro-mode" id="pomodoroMode">${this.plugin.settings.language==="ro"?"Timp de lucru":"Work Time"}</div>
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
								<span id="startPauseText">${this.plugin.settings.language==="ro"?"\xCEnceput":"Start"}</span>
							</button>
							<button class="pomodoro-btn reset" id="resetBtn">
								<span>\u{1F504}</span> ${this.plugin.settings.language==="ro","Reset"}
							</button>
							<button class="pomodoro-btn skip" id="skipBtn">
								<span>\u23ED\uFE0F</span> ${this.plugin.settings.language==="ro"?"S\u0103rit":"Skip"}
							</button>
						</div>

						<div class="pomodoro-stats">
							<div class="stat-item">
								<span class="stat-label">${this.plugin.settings.language==="ro"?"Sesiuni complete":"Completed Sessions"}</span>
								<span class="stat-value" id="completedSessions">0</span>
							</div>
							<div class="stat-item">
								<span class="stat-label">${this.plugin.settings.language==="ro"?"Ciclul curent":"Current Cycle"}</span>
								<span class="stat-value" id="currentCycle">1</span>
							</div>
						</div>

										<div class="pomodoro-presets">
					<h3 class="presets-title">${this.plugin.settings.language==="ro"?"Preset\u0103ri":"Presets"}</h3>
					<div class="presets-grid">
						<div class="preset-btn" data-preset="classic">
							<div class="preset-name">${this.plugin.settings.language==="ro"?"Clasic":"Classic"}</div>
							<div class="preset-details">25/5/15</div>
						</div>
						<div class="preset-btn" data-preset="extended">
							<div class="preset-name">${this.plugin.settings.language==="ro"?"Extins":"Extended"}</div>
							<div class="preset-details">45/10/30</div>
						</div>
						<div class="preset-btn" data-preset="short">
							<div class="preset-name">${this.plugin.settings.language==="ro"?"Scurt":"Short"}</div>
							<div class="preset-details">15/3/10</div>
						</div>
						<div class="preset-btn" data-preset="custom">
							<div class="preset-name">${this.plugin.settings.language==="ro"?"Personalizat":"Custom"}</div>
							<div class="preset-details">-/-/-</div>
						</div>
					</div>
				</div>

				<div class="pomodoro-settings-quick">
					<h3>${this.plugin.settings.language==="ro"?"Set\u0103ri rapide":"Quick Settings"}</h3>
					<div class="quick-settings-grid">
						<div class="setting-item">
							<label>${this.plugin.settings.language==="ro"?"Timp lucru (min)":"Work Time (min)"}</label>
							<input type="number" id="workTimeInput" min="1" max="60" value="${this.plugin.settings.pomodoroWorkTime}">
						</div>
						<div class="setting-item">
							<label>${this.plugin.settings.language==="ro"?"Pauz\u0103 scurt\u0103 (min)":"Short Break (min)"}</label>
							<input type="number" id="breakTimeInput" min="1" max="30" value="${this.plugin.settings.pomodoroBreakTime}">
						</div>
						<div class="setting-item">
							<label>${this.plugin.settings.language==="ro"?"Pauz\u0103 lung\u0103 (min)":"Long Break (min)"}</label>
							<input type="number" id="longBreakTimeInput" min="1" max="60" value="${this.plugin.settings.pomodoroLongBreakTime}">
						</div>
					</div>
				</div>
					</div>
				</div>
			</div>
		`,this.setupEventListeners(),this.renderCurrentView()}generateNavigationTabs(){let t=this.plugin.settings.language==="ro",e=[],i=!0,s=[this.plugin.settings.enableTasks,this.plugin.settings.enableReminders,this.plugin.settings.enableHabits,this.plugin.settings.enableAnalytics,this.plugin.settings.enableCalendar,this.plugin.settings.enablePomodoro].filter(Boolean).length;return this.plugin.settings.enableTasks&&(e.push(`
				<button class="nav-tab ${i?"active":""} nav-tab-tasks" data-view="tasks">
					<span>\u{1F4DD}</span> ${t?"Sarcini":"Tasks"}
				</button>
			`),i&&(i=!1)),this.plugin.settings.enableReminders&&(e.push(`
				<button class="nav-tab ${i?"active":""} nav-tab-reminders" data-view="reminders">
					<span>\u23F0</span> ${t?"Amintiri":"Reminders"}
				</button>
			`),i&&(i=!1)),this.plugin.settings.enableHabits&&(e.push(`
				<button class="nav-tab ${i?"active":""} nav-tab-habits" data-view="habits">
					<span>\u{1F504}</span> ${t?"Obiceiuri":"Habits"}
				</button>
			`),i&&(i=!1)),this.plugin.settings.enableAnalytics&&(e.push(`
				<button class="nav-tab ${i?"active":""} nav-tab-analytics" data-view="analytics">
					<span>\u{1F4CA}</span> Analytics
				</button>
			`),i&&(i=!1)),this.plugin.settings.enableCalendar&&(e.push(`
				<button class="nav-tab ${i?"active":""} nav-tab-calendar" data-view="calendar">
					<span>\u{1F4C5}</span> Calendar
				</button>
			`),i&&(i=!1)),this.plugin.settings.enablePomodoro&&(e.push(`
				<button class="nav-tab ${i?"active":""} nav-tab-pomodoro" data-view="pomodoro">
					<span>\u{1F345}</span> Pomodoro
				</button>
			`),i&&(i=!1)),e.length===0&&e.push(`
				<button class="nav-tab active nav-tab-tasks" data-view="tasks">
					<span>\u{1F4DD}</span> ${t?"Sarcini":"Tasks"}
				</button>
			`),`
			<style id="dynamic-nav-grid">
				${this.generateDynamicGridCSS(s)}
			</style>
			${e.join("")}
		`}generateDynamicGridCSS(t){return t<=3?`
				.mindfuldo-content .navigation-tabs {
					grid-template-columns: repeat(${t}, 1fr);
					grid-template-rows: 1fr;
				}
			`:t===4?`
				.mindfuldo-content .navigation-tabs {
					grid-template-columns: repeat(2, 1fr);
					grid-template-rows: repeat(2, 1fr);
				}
			`:t===5?`
				.mindfuldo-content .navigation-tabs {
					grid-template-columns: repeat(3, 1fr);
					grid-template-rows: repeat(2, 1fr);
				}
				.mindfuldo-content .nav-tab:nth-child(4),
				.mindfuldo-content .nav-tab:nth-child(5) {
					grid-column: span 1.5;
				}
			`:`
				.mindfuldo-content .navigation-tabs {
					grid-template-columns: repeat(3, 1fr);
					grid-template-rows: repeat(2, 1fr);
				}
			`}setupEventListeners(){let t=this.containerEl.querySelector("#addBtn"),e=this.containerEl.querySelector("#taskInput"),i=this.containerEl.querySelector("#clearCompleted"),s=this.containerEl.querySelector("#addReminderBtn"),a=this.containerEl.querySelector("#reminderTextInput"),n=this.containerEl.querySelector("#addHabitBtn"),o=this.containerEl.querySelector("#habitNameInput");t==null||t.addEventListener("click",()=>this.addTask()),e==null||e.addEventListener("keypress",y=>{y.key==="Enter"&&this.addTask()}),i==null||i.addEventListener("click",()=>this.clearCompleted()),s==null||s.addEventListener("click",()=>this.addReminder()),a==null||a.addEventListener("keypress",y=>{y.key==="Enter"&&this.addReminder()}),n==null||n.addEventListener("click",()=>g(this,null,function*(){return yield this.addHabit()})),o==null||o.addEventListener("keypress",y=>g(this,null,function*(){y.key==="Enter"&&(yield this.addHabit())})),this.containerEl.querySelectorAll(".color-option").forEach(y=>{y.addEventListener("click",S=>{this.containerEl.querySelectorAll(".color-option").forEach(T=>T.classList.remove("active")),S.currentTarget.classList.add("active")})}),this.containerEl.querySelectorAll(".category-btn").forEach(y=>{y.addEventListener("click",S=>{let T=S.currentTarget.getAttribute("data-category");T&&this.setCategory(T)})}),this.containerEl.querySelectorAll(".nav-tab").forEach(y=>{y.addEventListener("click",S=>{let T=S.currentTarget.getAttribute("data-view");if(T){this.currentView=T,this.containerEl.querySelectorAll(".nav-tab").forEach(C=>C.classList.remove("active")),S.currentTarget.classList.add("active"),this.containerEl.querySelectorAll(".view-container").forEach(C=>{C.style.display="none"});let $=this.containerEl.querySelector(`#${T}View`);$&&($.style.display="block"),this.renderCurrentView()}})});let r=this.containerEl.querySelector("#startPauseBtn"),d=this.containerEl.querySelector("#resetBtn"),l=this.containerEl.querySelector("#skipBtn"),c=this.containerEl.querySelector("#workTimeInput"),u=this.containerEl.querySelector("#breakTimeInput"),m=this.containerEl.querySelector("#longBreakTimeInput");r==null||r.addEventListener("click",()=>this.togglePomodoroTimer()),d==null||d.addEventListener("click",()=>this.resetPomodoroTimer()),l==null||l.addEventListener("click",()=>this.skipPomodoroSession()),c==null||c.addEventListener("change",()=>{this.plugin.settings.pomodoroWorkTime=parseInt(c.value),this.savePomodoroSettingsQuietly(),!this.pomodoroIsRunning&&this.pomodoroMode==="work"&&this.initializePomodoroTimer(),this.updateActivePreset()}),u==null||u.addEventListener("change",()=>{this.plugin.settings.pomodoroBreakTime=parseInt(u.value),this.savePomodoroSettingsQuietly(),!this.pomodoroIsRunning&&this.pomodoroMode==="break"&&this.initializePomodoroTimer(),this.updateActivePreset()}),m==null||m.addEventListener("change",()=>{this.plugin.settings.pomodoroLongBreakTime=parseInt(m.value),this.savePomodoroSettingsQuietly(),!this.pomodoroIsRunning&&this.pomodoroMode==="longBreak"&&this.initializePomodoroTimer(),this.updateActivePreset()}),this.containerEl.querySelectorAll(".preset-btn").forEach(y=>{y.addEventListener("click",S=>{let T=S.currentTarget.getAttribute("data-preset");T&&this.applyPomodoroPreset(T)})});let p=this.containerEl.querySelector("#prevWeek"),v=this.containerEl.querySelector("#nextWeek");p==null||p.addEventListener("click",()=>{this.navigateToPreviousWeek()}),v==null||v.addEventListener("click",()=>{this.navigateToNextWeek()});let b=this.containerEl.querySelector("#customHabitColor"),f=this.containerEl.querySelector(".custom-color-option");b&&f&&(b.addEventListener("input",y=>{let S=y.target.value;f.setAttribute("data-color",S),f.style.background=S,this.containerEl.querySelectorAll(".color-option").forEach(T=>T.classList.remove("active")),f.classList.add("active")}),f.addEventListener("click",()=>{b.click()}))}updateDateTime(){let t=new Date,e=t.getHours(),i="",s=this.plugin.settings.userName,a=this.plugin.settings.language==="ro";e>=5&&e<12?i=a?`Bun\u0103 diminea\u021Ba, ${s}!`:`Good morning, ${s}!`:e>=12&&e<17?i=a?`Bun\u0103 ziua, ${s}!`:`Good afternoon, ${s}!`:i=a?`Bun\u0103 seara, ${s}!`:`Good evening, ${s}!`;let n=this.containerEl.querySelector("#greeting");n&&(n.textContent=i);let o={weekday:"long",year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit"},r=a?"ro-RO":"en-US",d=t.toLocaleDateString(r,o),l=this.containerEl.querySelector("#timeInfo");l&&(l.textContent=d)}addTask(){return g(this,null,function*(){let t=this.containerEl.querySelector("#taskInput"),e=t.value.trim();if(e==="")return;let i={id:Date.now(),text:e,completed:!1,category:this.currentCategory==="toate"?"work":this.currentCategory,createdAt:this.getLocalDateString(new Date),order:1};this.tasks.unshift(i),this.normalizeOrderValues(),yield this.saveData(),t.value="",t.style.transform="scale(0.99)",t.style.background="rgba(76, 175, 80, 0.15)",t.style.borderColor="#66bb6a",setTimeout(()=>{t.style.transform="scale(1)",t.style.background="",t.style.borderColor=""},800),setTimeout(()=>{this.renderCurrentView()},100)})}setCategory(t){this.currentCategory=t,this.containerEl.querySelectorAll(".category-btn").forEach(i=>{i.classList.remove("active")});let e=this.containerEl.querySelector(`[data-category="${t}"]`);e==null||e.classList.add("active"),setTimeout(()=>{this.renderCurrentView()},150)}toggleTask(t){let e=this.tasks.findIndex(i=>i.id===t);e!==-1&&(this.tasks[e].completed=!this.tasks[e].completed,this.tasks[e].completed?this.tasks[e].completedAt=this.getLocalDateTimeString(new Date):delete this.tasks[e].completedAt,this.saveData(),this.currentView==="tasks"&&this.renderTasks())}deleteTask(t){this.tasks=this.tasks.filter(e=>e.id!==t),this.saveData(),this.renderTasks()}confirmDeleteTask(t){let e=this.tasks.find(l=>l.id===t);if(!e)return;let i=this.plugin.settings.language==="ro",s=document.querySelector(".mindfuldo-confirm-modal");s&&document.body.removeChild(s);let a=document.createElement("div");a.className="mindfuldo-confirm-modal",a.innerHTML=`
			<div class="confirm-modal-content">
				<h3>${i?"Confirmare \u0219tergere":"Confirm Delete"}</h3>
				<div class="confirm-message">
					<p>${i?"Sigur dori\u021Bi s\u0103 \u0219terge\u021Bi sarcina:":"Are you sure you want to delete the task:"}</p>
					<p class="task-text">"${e.text}"</p>
				</div>
				<div class="confirm-actions">
					<button id="confirmDelete" class="delete-btn">${i?"\u0218terge":"Delete"}</button>
					<button id="cancelDelete" class="cancel-btn">${i?"Anuleaz\u0103":"Cancel"}</button>
				</div>
			</div>
		`,document.body.appendChild(a);let n=a.querySelector("#confirmDelete"),o=a.querySelector("#cancelDelete"),r=()=>{document.body.contains(a)&&document.body.removeChild(a)},d=()=>{this.deleteTask(t),r(),new h.Notice(i?"Sarcina a fost \u0219tears\u0103!":"Task deleted successfully!")};n==null||n.addEventListener("click",d),o==null||o.addEventListener("click",r),a.addEventListener("click",l=>{l.target===a&&r()}),a.addEventListener("keydown",l=>{l.key==="Escape"&&r()}),setTimeout(()=>n==null?void 0:n.focus(),100)}editTask(t){let e=this.tasks.find(u=>u.id===t);if(!e)return;let i=this.plugin.settings.language==="ro",s=document.querySelector(".mindfuldo-edit-modal");s&&document.body.removeChild(s);let a=document.createElement("div");a.className="mindfuldo-edit-modal",a.innerHTML=`
			<div class="edit-modal-content">
				<h3>${i?"Editeaz\u0103 sarcina":"Edit Task"}</h3>
				<div class="edit-form">
					<div class="form-group">
						<label>Text:</label>
						<input type="text" id="editTaskText" value="${e.text}" placeholder="${i?"Introduce\u021Bi textul sarcinii":"Enter task text"}">
					</div>
					<div class="form-group">
						<label>${i?"Categoria:":"Category:"}</label>
						<select id="editTaskCategory">
							<option value="work" ${e.category==="work"?"selected":""}>${this.getCategoryName("work")}</option>
							<option value="personal" ${e.category==="personal"?"selected":""}>${this.getCategoryName("personal")}</option>
							<option value="health" ${e.category==="health"?"selected":""}>${this.getCategoryName("health")}</option>
							<option value="learning" ${e.category==="learning"?"selected":""}>${this.getCategoryName("learning")}</option>
							<option value="hobby" ${e.category==="hobby"?"selected":""}>${this.getCategoryName("hobby")}</option>
						</select>
					</div>
					<div class="form-actions">
						<button id="saveTaskEdit" class="save-btn">${i?"Salveaz\u0103":"Save"}</button>
						<button id="cancelTaskEdit" class="cancel-btn">${i?"Anuleaz\u0103":"Cancel"}</button>
					</div>
				</div>
			</div>
		`,document.body.appendChild(a);let n=a.querySelector("#saveTaskEdit"),o=a.querySelector("#cancelTaskEdit"),r=a.querySelector("#editTaskText"),d=a.querySelector("#editTaskCategory"),l=()=>{document.body.contains(a)&&document.body.removeChild(a)},c=()=>g(this,null,function*(){let u=r.value.trim(),m=d.value;if(!u){new h.Notice(i?"Textul nu poate fi gol!":"Text cannot be empty!"),r.focus();return}try{e.text=u,e.category=m,yield this.saveData(),this.currentView==="tasks"&&this.renderTasks(),new h.Notice(i?"Sarcina a fost actualizat\u0103!":"Task updated successfully!"),l()}catch(p){console.error("Error saving task:",p),new h.Notice(i?"Eroare la salvarea sarcinii!":"Error saving task!")}});n==null||n.addEventListener("click",c),o==null||o.addEventListener("click",l),a.addEventListener("click",u=>{u.target===a&&l()}),r.addEventListener("keypress",u=>{u.key==="Enter"&&c()}),a.addEventListener("keydown",u=>{u.key==="Escape"&&l()}),setTimeout(()=>r.focus(),100)}clearCompleted(){this.tasks=this.tasks.filter(t=>!t.completed),this.saveData(),setTimeout(()=>{this.renderCurrentView()},50)}renderCurrentView(){let t=this.containerEl.querySelector("#tasksView"),e=this.containerEl.querySelector("#remindersView"),i=this.containerEl.querySelector("#habitsView"),s=this.containerEl.querySelector("#analyticsView"),a=this.containerEl.querySelector("#calendarView"),n=this.containerEl.querySelector("#pomodoroView");this.currentView==="tasks"?(t==null||t.classList.add("active"),e==null||e.classList.remove("active"),i==null||i.classList.remove("active"),s==null||s.classList.remove("active"),a==null||a.classList.remove("active"),n==null||n.classList.remove("active"),this.renderTasks()):this.currentView==="reminders"?(t==null||t.classList.remove("active"),e==null||e.classList.add("active"),i==null||i.classList.remove("active"),s==null||s.classList.remove("active"),a==null||a.classList.remove("active"),n==null||n.classList.remove("active"),this.renderReminders()):this.currentView==="habits"?(t==null||t.classList.remove("active"),e==null||e.classList.remove("active"),i==null||i.classList.add("active"),s==null||s.classList.remove("active"),a==null||a.classList.remove("active"),n==null||n.classList.remove("active"),this.renderHabits()):this.currentView==="analytics"?(t==null||t.classList.remove("active"),e==null||e.classList.remove("active"),i==null||i.classList.remove("active"),s==null||s.classList.add("active"),a==null||a.classList.remove("active"),n==null||n.classList.remove("active"),this.renderAnalytics()):this.currentView==="calendar"?(t==null||t.classList.remove("active"),e==null||e.classList.remove("active"),i==null||i.classList.remove("active"),s==null||s.classList.remove("active"),a==null||a.classList.add("active"),n==null||n.classList.remove("active"),this.renderCalendar()):this.currentView==="pomodoro"&&(t==null||t.classList.remove("active"),e==null||e.classList.remove("active"),i==null||i.classList.remove("active"),s==null||s.classList.remove("active"),a==null||a.classList.remove("active"),n==null||n.classList.add("active"),this.renderPomodoro())}renderTasks(){let t=this.containerEl.querySelector("#tasksList"),e=this.containerEl.querySelector("#taskCounter"),i=this.containerEl.querySelector("#clearCompleted");if(!t||!e)return;let s=this.tasks;this.currentCategory!=="toate"&&(s=this.tasks.filter(r=>r.category===this.currentCategory)),s.sort((r,d)=>r.completed&&!d.completed?1:!r.completed&&d.completed?-1:(r.order||0)-(d.order||0));let a=this.tasks.filter(r=>r.completed),n=this.tasks.filter(r=>!r.completed),o=this.plugin.settings.language==="ro";if(o?e.textContent=`${n.length} ${n.length!==1?"sarcini":"sarcin\u0103"}`:e.textContent=`${n.length} ${n.length!==1?"tasks":"task"}`,i.style.display=a.length>0?"block":"none",s.length===0){t.innerHTML="";return}t.innerHTML=s.map((r,d)=>`
			<div class="task-item ${r.completed?"completed":""}" data-task-id="${r.id}">
				<div class="task-reorder">
					<button class="task-move-up" data-task-id="${r.id}" title="${o?"Mut\u0103 \xEEn sus":"Move up"}" ${d===0?"disabled":""}>\u2191</button>
					<button class="task-move-down" data-task-id="${r.id}" title="${o?"Mut\u0103 \xEEn jos":"Move down"}" ${d===s.length-1?"disabled":""}>\u2193</button>
				</div>
				<div class="task-checkbox ${r.completed?"checked":""}" data-task-id="${r.id}"></div>
				<div class="task-text" data-task-id="${r.id}">${r.text}</div>
				<div class="task-category ${r.category}" data-task-id="${r.id}">${this.getCategoryName(r.category)}</div>
				<div class="task-actions">
					<button class="task-edit" data-task-id="${r.id}" title="${o?"Editeaz\u0103":"Edit"}">\u270F\uFE0F</button>
					<button class="task-delete" data-task-id="${r.id}" title="${o?"\u0218terge":"Delete"}">\xD7</button>
				</div>
			</div>
		`).join(""),t.querySelectorAll(".task-checkbox").forEach(r=>{r.addEventListener("click",d=>{let l=parseInt(d.target.getAttribute("data-task-id")||"0");this.toggleTask(l)})}),t.querySelectorAll(".task-edit").forEach(r=>{r.addEventListener("click",d=>{let l=parseInt(d.target.getAttribute("data-task-id")||"0");this.editTask(l)})}),t.querySelectorAll(".task-delete").forEach(r=>{r.addEventListener("click",d=>{let l=parseInt(d.target.getAttribute("data-task-id")||"0");this.confirmDeleteTask(l)})}),this.setupTasksReordering()}renderTasksWithoutDragSetup(){let t=this.containerEl.querySelector("#tasksList"),e=this.containerEl.querySelector("#taskCounter"),i=this.containerEl.querySelector("#clearCompleted");if(!t||!e)return;let s=this.tasks;this.currentCategory!=="toate"&&(s=this.tasks.filter(r=>r.category===this.currentCategory)),s.sort((r,d)=>r.completed&&!d.completed?1:!r.completed&&d.completed?-1:(r.order||0)-(d.order||0));let a=this.tasks.filter(r=>r.completed),n=this.tasks.filter(r=>!r.completed),o=this.plugin.settings.language==="ro";if(o?e.textContent=`${n.length} ${n.length!==1?"sarcini":"sarcin\u0103"}`:e.textContent=`${n.length} ${n.length!==1?"tasks":"task"}`,i.style.display=a.length>0?"block":"none",s.length===0){t.innerHTML="";return}t.innerHTML=s.map((r,d)=>{let l=this.tasks.filter(p=>p.completed===r.completed);this.currentCategory!=="toate"&&(l=l.filter(p=>p.category===this.currentCategory)),l.sort((p,v)=>(p.order||0)-(v.order||0));let c=l.findIndex(p=>p.id===r.id),u=c>0,m=c<l.length-1;return`
				<div class="task-item ${r.completed?"completed":""}" data-task-id="${r.id}">
					<div class="task-reorder">
						<button class="task-move-up" data-task-id="${r.id}" title="${o?"Mut\u0103 \xEEn sus":"Move up"}" ${u?"":"disabled"}>\u2191</button>
						<button class="task-move-down" data-task-id="${r.id}" title="${o?"Mut\u0103 \xEEn jos":"Move down"}" ${m?"":"disabled"}>\u2193</button>
					</div>
					<div class="task-checkbox ${r.completed?"checked":""}" data-task-id="${r.id}"></div>
					<div class="task-text" data-task-id="${r.id}">${r.text}</div>
					<div class="task-category ${r.category}" data-task-id="${r.id}">${this.getCategoryName(r.category)}</div>
					<div class="task-actions">
						<button class="task-edit" data-task-id="${r.id}" title="${o?"Editeaz\u0103":"Edit"}">\u270F\uFE0F</button>
						<button class="task-delete" data-task-id="${r.id}" title="${o?"\u0218terge":"Delete"}">\xD7</button>
					</div>
				</div>
			`}).join(""),t.querySelectorAll(".task-checkbox").forEach(r=>{r.addEventListener("click",d=>{let l=parseInt(d.target.getAttribute("data-task-id")||"0");this.toggleTask(l)})}),t.querySelectorAll(".task-edit").forEach(r=>{r.addEventListener("click",d=>{let l=parseInt(d.target.getAttribute("data-task-id")||"0");this.editTask(l)})}),t.querySelectorAll(".task-delete").forEach(r=>{r.addEventListener("click",d=>{let l=parseInt(d.target.getAttribute("data-task-id")||"0");this.confirmDeleteTask(l)})}),this.setupTasksReordering()}setupTasksReordering(){let t=this.containerEl.querySelector("#tasksList");t&&(t.querySelectorAll(".task-move-up").forEach(e=>{e.addEventListener("click",i=>g(this,null,function*(){let s=parseInt(i.target.getAttribute("data-task-id")||"0");yield this.moveTaskUp(s)}))}),t.querySelectorAll(".task-move-down").forEach(e=>{e.addEventListener("click",i=>g(this,null,function*(){let s=parseInt(i.target.getAttribute("data-task-id")||"0");yield this.moveTaskDown(s)}))}))}moveTaskUp(t){return g(this,null,function*(){let e=this.tasks.find(o=>o.id===t);if(!e)return;let i=this.tasks.filter(o=>o.completed===e.completed);this.currentCategory!=="toate"&&(i=i.filter(o=>o.category===this.currentCategory)),i.sort((o,r)=>(o.order||0)-(r.order||0));let s=i.findIndex(o=>o.id===t);if(s<=0)return;let a=i[s-1],n=e.order;e.order=a.order,a.order=n,this.normalizeOrderValues(),yield this.saveData(),this.renderTasksWithoutDragSetup()})}moveTaskDown(t){return g(this,null,function*(){let e=this.tasks.find(o=>o.id===t);if(!e)return;let i=this.tasks.filter(o=>o.completed===e.completed);this.currentCategory!=="toate"&&(i=i.filter(o=>o.category===this.currentCategory)),i.sort((o,r)=>(o.order||0)-(r.order||0));let s=i.findIndex(o=>o.id===t);if(s>=i.length-1)return;let a=i[s+1],n=e.order;e.order=a.order,a.order=n,this.normalizeOrderValues(),yield this.saveData(),this.renderTasksWithoutDragSetup()})}reorderTasks(t,e,i){return g(this,null,function*(){let s=this.tasks.find(d=>d.id===t),a=this.tasks.find(d=>d.id===e);if(!s||!a)return;let n=this.tasks.indexOf(s);this.tasks.splice(n,1);let o=this.tasks.indexOf(a),r=i?o:o+1;this.tasks.splice(r,0,s),this.tasks.forEach((d,l)=>{d.order=l+1}),yield this.saveData(),this.renderTasks()})}getCategoryName(t){let e=this.plugin.settings.language==="ro";return{toate:e?"Toate":"All",lucru:e?"Lucru":"Work",work:e?"Lucru":"Work",personal:"Personal",sanatate:e?"S\u0103n\u0103tate":"Health",health:e?"S\u0103n\u0103tate":"Health",invatare:e?"\xCEnv\u0103\u021Bare":"Learning",learning:e?"\xCEnv\u0103\u021Bare":"Learning",hobby:"Hobby"}[t]||t}loadTasks(){return g(this,null,function*(){let t=yield this.plugin.loadData();this.tasks=(t==null?void 0:t.tasks)||[]})}saveTasks(){return g(this,null,function*(){let t=(yield this.plugin.loadData())||{};t.tasks=this.tasks,yield this.plugin.saveData(t)})}loadData(){return g(this,null,function*(){let t=yield this.plugin.loadData();this.tasks=(t==null?void 0:t.tasks)||[],this.reminders=(t==null?void 0:t.reminders)||[],this.habits=(t==null?void 0:t.habits)||[],this.migrateDataToIncludeOrder()})}migrateDataToIncludeOrder(){let t=!1;this.tasks.forEach((e,i)=>{e.order===void 0&&(e.order=i+1,t=!0)}),this.reminders.forEach((e,i)=>{e.order===void 0&&(e.order=i+1,t=!0)}),this.habits.forEach((e,i)=>{e.order===void 0&&(e.order=i+1,t=!0)}),this.normalizeOrderValues(),t&&this.saveData()}normalizeOrderValues(){let t=this.tasks.filter(i=>!i.completed),e=this.tasks.filter(i=>i.completed);t.sort((i,s)=>(i.order||0)-(s.order||0)),t.forEach((i,s)=>{i.order=s+1}),e.sort((i,s)=>(i.order||0)-(s.order||0)),e.forEach((i,s)=>{i.order=s+1}),this.reminders.sort((i,s)=>(i.order||0)-(s.order||0)),this.reminders.forEach((i,s)=>{i.order=s+1}),this.habits.sort((i,s)=>(i.order||0)-(s.order||0)),this.habits.forEach((i,s)=>{i.order=s+1})}saveData(){return g(this,null,function*(){let t=(yield this.plugin.loadData())||{};t.tasks=this.tasks,t.reminders=this.reminders,t.habits=this.habits,this.lastLocalUpdate=Date.now(),this.plugin.lastDataUpdate=Date.now(),yield this.plugin.saveData(t)})}getTaskPlaceholder(){return this.plugin.settings.language==="ro"?`Ce ave\u021Bi de f\u0103cut ast\u0103zi, ${this.plugin.settings.userName}?`:`What do you need to do today, ${this.plugin.settings.userName}?`}getReminderPlaceholder(){return this.plugin.settings.language==="ro"?"Despre ce s\u0103 v\u0103 amintim?":"What should I remind you about?"}getLocalDateString(t){let e=t.getFullYear(),i=String(t.getMonth()+1).padStart(2,"0"),s=String(t.getDate()).padStart(2,"0");return`${e}-${i}-${s}`}getLocalDateTimeString(t){let e=this.getLocalDateString(t),i=String(t.getHours()).padStart(2,"0"),s=String(t.getMinutes()).padStart(2,"0");return`${e}T${i}:${s}`}checkExpiredReminders(){let t=new Date,e=!1;this.reminders.forEach(i=>{let s=new Date(i.dateTime);!i.expired&&s<=t&&(i.expired=!0,e=!0,this.plugin.settings.enableNotifications&&new h.Notice(`\u23F0 Amintire: ${i.text}`,5e3))}),e&&(this.saveData(),this.currentView==="reminders"&&this.renderReminders())}addReminder(){return g(this,null,function*(){let t=this.containerEl.querySelector("#reminderTextInput"),e=this.containerEl.querySelector("#reminderDateInput"),i=this.containerEl.querySelector("#reminderTimeInput"),s=t.value.trim(),a=e.value,n=i.value;if(!s||!a||!n){new h.Notice(this.plugin.settings.language==="ro"?"Completa\u021Bi toate c\xE2mpurile pentru amintire!":"Fill in all fields!");return}let o=`${a}T${n}`;if(new Date(o)<=new Date){new h.Notice(this.plugin.settings.language==="ro"?"V\u0103 rug\u0103m s\u0103 alege\u021Bi o dat\u0103 \u0219i or\u0103 din viitor!":"Date must be in the future!");return}let d={id:Date.now(),text:s,dateTime:o,expired:!1,createdAt:this.getLocalDateString(new Date),order:this.reminders.length+1};this.reminders.push(d),yield this.saveData(),t.value="",e.value="",i.value="",this.renderReminders()})}deleteReminder(t){this.reminders=this.reminders.filter(e=>e.id!==t),this.saveData(),this.renderReminders()}renderReminders(){let t=this.containerEl.querySelector("#remindersList"),e=this.containerEl.querySelector("#reminderCounter");if(!t||!e)return;let i=this.plugin.settings.language==="ro",s=this.reminders.sort((n,o)=>{if(n.expired&&!o.expired)return 1;if(!n.expired&&o.expired)return-1;if(n.expired===o.expired){let r=(n.order||0)-(o.order||0);if(r!==0)return r}return new Date(n.dateTime).getTime()-new Date(o.dateTime).getTime()}),a=this.reminders.filter(n=>!n.expired);if(i?e.textContent=`${a.length} ${a.length!==1?"amintiri":"amintire"}`:e.textContent=`${a.length} ${a.length!==1?"reminders":"reminder"}`,s.length===0){t.innerHTML=`
				<div class="empty-reminders">
					<div class="empty-reminders-icon">\u23F0</div>
					<p>${this.plugin.settings.language==="ro"?"Nicio amintire \xEEnc\u0103. Adaug\u0103 prima pentru a \xEEncepe!":"No reminders yet. Add your first to get started!"}</p>
				</div>
			`;return}t.innerHTML=s.map(n=>{let o=new Date(n.dateTime),r=o.toLocaleDateString("ro-RO"),d=o.toLocaleTimeString("ro-RO",{hour:"2-digit",minute:"2-digit"});return`
				<div class="reminder-item ${n.expired?"expired":""}" data-reminder-id="${n.id}" draggable="true">
					<div class="drag-handle" title="${i?"Trage\u021Bi pentru a reordona":"Drag to reorder"}">\u22EE\u22EE</div>
					<div class="reminder-content">
						<div class="reminder-text">${n.text}</div>
						<div class="reminder-time">${r} la ${d}</div>
						${n.expired?`<div class="time-left expired">${this.plugin.settings.language==="ro"?"Expirat":"Expired"}</div>`:""}
					</div>
					<div class="reminder-actions">
						<button class="reminder-edit" data-reminder-id="${n.id}" title="${i?"Editeaz\u0103":"Edit"}">\u270F\uFE0F</button>
						<button class="reminder-delete" data-reminder-id="${n.id}" title="${i?"\u0218terge":"Delete"}">\xD7</button>
					</div>
				</div>
			`}).join(""),t.querySelectorAll(".reminder-delete").forEach(n=>{n.addEventListener("click",o=>{let r=parseInt(o.target.getAttribute("data-reminder-id")||"0");this.confirmDeleteReminder(r)})}),t.querySelectorAll(".reminder-edit").forEach(n=>{n.addEventListener("click",o=>{let r=parseInt(o.target.getAttribute("data-reminder-id")||"0");this.editReminder(r)})}),this.setupRemindersDragAndDrop()}renderRemindersWithoutDragSetup(){let t=this.containerEl.querySelector("#remindersList"),e=this.containerEl.querySelector("#reminderCounter");if(!t||!e)return;let i=this.plugin.settings.language==="ro",s=this.reminders.sort((n,o)=>{if(n.expired&&!o.expired)return 1;if(!n.expired&&o.expired)return-1;if(n.expired===o.expired){let r=(n.order||0)-(o.order||0);if(r!==0)return r}return new Date(n.dateTime).getTime()-new Date(o.dateTime).getTime()}),a=this.reminders.filter(n=>!n.expired);if(i?e.textContent=`${a.length} ${a.length!==1?"amintiri":"amintire"}`:e.textContent=`${a.length} ${a.length!==1?"reminders":"reminder"}`,s.length===0){t.innerHTML=`
				<div class="empty-reminders">
					<div class="empty-reminders-icon">\u23F0</div>
					<p>${this.plugin.settings.language==="ro"?"Nicio amintire \xEEnc\u0103. Adaug\u0103 prima pentru a \xEEncepe!":"No reminders yet. Add your first to get started!"}</p>
				</div>
			`;return}t.innerHTML=s.map(n=>{let o=new Date(n.dateTime),r=o.toLocaleDateString("ro-RO"),d=o.toLocaleTimeString("ro-RO",{hour:"2-digit",minute:"2-digit"});return`
				<div class="reminder-item ${n.expired?"expired":""}" data-reminder-id="${n.id}" draggable="true">
					<div class="drag-handle" title="${i?"Trage\u021Bi pentru a reordona":"Drag to reorder"}">\u22EE\u22EE</div>
					<div class="reminder-content">
						<div class="reminder-text">${n.text}</div>
						<div class="reminder-time">${r} la ${d}</div>
						${n.expired?`<div class="time-left expired">${this.plugin.settings.language==="ro"?"Expirat":"Expired"}</div>`:""}
					</div>
					<div class="reminder-actions">
						<button class="reminder-edit" data-reminder-id="${n.id}" title="${i?"Editeaz\u0103":"Edit"}">\u270F\uFE0F</button>
						<button class="reminder-delete" data-reminder-id="${n.id}" title="${i?"\u0218terge":"Delete"}">\xD7</button>
					</div>
				</div>
			`}).join(""),t.querySelectorAll(".reminder-delete").forEach(n=>{n.addEventListener("click",o=>{let r=parseInt(o.target.getAttribute("data-reminder-id")||"0");this.confirmDeleteReminder(r)})}),t.querySelectorAll(".reminder-edit").forEach(n=>{n.addEventListener("click",o=>{let r=parseInt(o.target.getAttribute("data-reminder-id")||"0");this.editReminder(r)})})}setupRemindersDragAndDrop(){let t=this.containerEl.querySelector("#remindersList");if(!t)return;let e=t.querySelectorAll(".reminder-item"),i=null,s=null;e.forEach(a=>{let n=a;n.addEventListener("dragstart",o=>{this.isDragging=!0,i=n,s=parseInt(n.getAttribute("data-reminder-id")||"0"),n.classList.add("dragging"),o.dataTransfer&&(o.dataTransfer.effectAllowed="move",o.dataTransfer.setData("text/html",n.outerHTML))}),n.addEventListener("dragend",()=>{n.classList.remove("dragging"),i=null,s=null,setTimeout(()=>{this.isDragging=!1},100)}),n.addEventListener("dragover",o=>{if(o.preventDefault(),o.dataTransfer&&(o.dataTransfer.dropEffect="move"),i&&i!==n){let r=n.getBoundingClientRect(),d=r.top+r.height/2;o.clientY<d?(n.classList.add("drop-above"),n.classList.remove("drop-below")):(n.classList.add("drop-below"),n.classList.remove("drop-above"))}}),n.addEventListener("dragleave",()=>{n.classList.remove("drop-above","drop-below")}),n.addEventListener("drop",o=>{if(o.preventDefault(),n.classList.remove("drop-above","drop-below"),s&&i&&i!==n){let r=parseInt(n.getAttribute("data-reminder-id")||"0");this.reorderReminders(s,r,o.clientY<n.getBoundingClientRect().top+n.getBoundingClientRect().height/2)}})})}reorderReminders(t,e,i){return g(this,null,function*(){let s=this.reminders.find(d=>d.id===t),a=this.reminders.find(d=>d.id===e);if(!s||!a)return;let n=this.reminders.indexOf(s);this.reminders.splice(n,1);let o=this.reminders.indexOf(a),r=i?o:o+1;this.reminders.splice(r,0,s),this.reminders.forEach((d,l)=>{d.order=l+1}),yield this.saveData(),this.renderRemindersWithoutDragSetup()})}editReminder(t){let e=this.reminders.find(b=>b.id===t);if(!e)return;let i=this.plugin.settings.language==="ro",s=new Date(e.dateTime),a=this.getLocalDateString(s),n=s.toTimeString().slice(0,5),o=document.querySelector(".mindfuldo-edit-modal");o&&document.body.removeChild(o);let r=document.createElement("div");r.className="mindfuldo-edit-modal",r.innerHTML=`
			<div class="edit-modal-content">
				<h3>${i?"Editeaz\u0103 amintirea":"Edit Reminder"}</h3>
				<div class="edit-form">
					<div class="form-group">
						<label>Text:</label>
						<input type="text" id="editReminderText" value="${e.text}" placeholder="${i?"Introduce\u021Bi textul amintirii":"Enter reminder text"}">
					</div>
					<div class="form-group">
						<label>${i?"Data:":"Date:"}</label>
						<input type="date" id="editReminderDate" value="${a}">
					</div>
					<div class="form-group">
						<label>${i?"Ora:":"Time:"}</label>
						<input type="time" id="editReminderTime" value="${n}">
					</div>
					<div class="form-actions">
						<button id="saveReminderEdit" class="save-btn">${i?"Salveaz\u0103":"Save"}</button>
						<button id="cancelReminderEdit" class="cancel-btn">${i?"Anuleaz\u0103":"Cancel"}</button>
					</div>
				</div>
			</div>
		`,document.body.appendChild(r);let d=r.querySelector("#saveReminderEdit"),l=r.querySelector("#cancelReminderEdit"),c=r.querySelector("#editReminderText"),u=r.querySelector("#editReminderDate"),m=r.querySelector("#editReminderTime"),p=()=>{document.body.contains(r)&&document.body.removeChild(r)},v=()=>g(this,null,function*(){let b=c.value.trim(),f=u.value,y=m.value;if(!b||!f||!y){new h.Notice(i?"Completa\u021Bi toate c\xE2mpurile!":"Fill in all fields!");return}let S=`${f}T${y}`;if(new Date(S)<=new Date){new h.Notice(i?"V\u0103 rug\u0103m s\u0103 alege\u021Bi o dat\u0103 \u0219i or\u0103 din viitor!":"Date must be in the future!");return}try{e.text=b,e.dateTime=S,e.expired=!1,yield this.saveData(),this.currentView==="reminders"&&this.renderReminders(),new h.Notice(i?"Amintirea a fost actualizat\u0103!":"Reminder updated successfully!"),p()}catch($){console.error("Error saving reminder:",$),new h.Notice(i?"Eroare la salvarea amintirii!":"Error saving reminder!")}});d==null||d.addEventListener("click",v),l==null||l.addEventListener("click",p),r.addEventListener("click",b=>{b.target===r&&p()}),c.addEventListener("keypress",b=>{b.key==="Enter"&&v()}),r.addEventListener("keydown",b=>{b.key==="Escape"&&p()}),setTimeout(()=>c.focus(),100)}addHabit(){return g(this,null,function*(){var n;yield this.loadData();let t=this.containerEl.querySelector("#habitNameInput");if(!t)return;let e=t.value.trim();if(e==="")return;let i=this.containerEl.querySelector(".color-option.active"),s=(i==null?void 0:i.getAttribute("data-color"))||"#4CAF50";if(s==="custom"){let o=this.containerEl.querySelector("#customHabitColor");o&&o.value&&(s=o.value)}let a={id:Date.now(),name:e,color:s,createdAt:this.getLocalDateString(new Date),streak:0,bestStreak:0,completions:{},order:this.habits.length+1};this.habits.push(a),yield this.saveData(),t.value="",this.containerEl.querySelectorAll(".color-option").forEach(o=>o.classList.remove("active")),(n=this.containerEl.querySelector(".color-option"))==null||n.classList.add("active"),this.renderHabits()})}toggleHabit(t,e){return g(this,null,function*(){yield this.loadData();let i=this.habits.findIndex(n=>n.id===t);if(i===-1)return;let s=this.habits[i],a=e||this.getLocalDateString(new Date);s.completions[a]=!s.completions[a],this.updateHabitStreak(s),yield this.saveData(),this.currentView==="habits"&&this.renderHabits()})}updateHabitStreak(t){let e=new Date,i=this.getLocalDateString(e),s=0,a=0,n=0,o=Object.keys(t.completions).filter(r=>t.completions[r]).sort();if(o.length===0){t.streak=0,t.bestStreak=Math.max(0,t.bestStreak);return}if(t.completions[i]){s=1;let r=new Date(e);for(;;){r.setDate(r.getDate()-1);let d=this.getLocalDateString(r);if(t.completions[d])s++;else break}}else s=0;for(let r=0;r<o.length;r++){if(r===0)n=1;else{let d=new Date(o[r-1]),c=new Date(o[r]).getTime()-d.getTime();Math.ceil(c/(1e3*60*60*24))===1?n++:n=1}n>a&&(a=n)}t.streak=s,t.bestStreak=Math.max(a,t.bestStreak)}deleteHabit(t){return g(this,null,function*(){yield this.loadData(),this.habits=this.habits.filter(e=>e.id!==t),yield this.saveData(),this.renderHabits()})}renderHabits(){let t=this.containerEl.querySelector("#habitsList"),e=this.containerEl.querySelector("#habitCounter");if(!t||!e)return;let i=this.plugin.settings.language==="ro",s=this.getLocalDateString(new Date),a=this.habits.filter(l=>l.completions[s]).length;if(i?e.textContent=`${a}/${this.habits.length} ${this.habits.length!==1?"obiceiuri":"obicei"} ast\u0103zi`:e.textContent=`${a}/${this.habits.length} ${this.habits.length!==1?"habits":"habit"} today`,this.habits.length===0){t.innerHTML=`
				<div class="empty-habits">
					<div class="empty-habits-icon">\u{1F3AF}</div>
					<p>${i?"Niciun obicei \xEEnc\u0103. Adaug\u0103 primul pentru a \xEEncepe!":"No habits yet. Add your first to get started!"}</p>
				</div>
			`;return}let n=[...this.habits].sort((l,c)=>(l.order||0)-(c.order||0)),o=new Date(this.currentHabitsYear,this.currentHabitsMonth,1),r=i?["Ianuarie","Februarie","Martie","Aprilie","Mai","Iunie","Iulie","August","Septembrie","Octombrie","Noiembrie","Decembrie"]:["January","February","March","April","May","June","July","August","September","October","November","December"],d=n.map((l,c)=>{let u=this.generateHabitMonthCalendar(l,o,i);return`
				<div class="habit-item" data-habit-id="${l.id}">
					<div class="habit-header">
						<div class="habit-reorder">
							<button class="habit-move-up" data-habit-id="${l.id}" title="${i?"Mut\u0103 \xEEn sus":"Move up"}" ${c===0?"disabled":""}>\u2191</button>
							<button class="habit-move-down" data-habit-id="${l.id}" title="${i?"Mut\u0103 \xEEn jos":"Move down"}" ${c===n.length-1?"disabled":""}>\u2193</button>
						</div>
						<div class="habit-info">
							<div class="habit-name" style="color: ${l.color};">${l.name}</div>
							<div class="habit-stats">
								<span class="streak-current">${l.streak} ${i?"zile":"days"}</span>
								<span class="streak-separator">\u2022</span>
								<span class="streak-best">${i?"Record":"Best"}: ${l.bestStreak}</span>
							</div>
						</div>
						<div class="habit-actions">
							<button class="habit-edit" data-habit-id="${l.id}" title="${i?"Editeaz\u0103":"Edit"}">\u270F\uFE0F</button>
							<button class="habit-delete" data-habit-id="${l.id}" title="${i?"\u0218terge":"Delete"}">\xD7</button>
						</div>
					</div>
					<div class="habit-calendar">
						<div class="habit-calendar-header">
							<button class="habit-month-nav habit-prev-month" data-habit-id="${l.id}" title="${i?"Luna anterioar\u0103":"Previous month"}">\u2039</button>
							<span class="habit-month-title">${r[this.currentHabitsMonth]} ${this.currentHabitsYear}</span>
							<button class="habit-month-nav habit-next-month" data-habit-id="${l.id}" title="${i?"Luna urm\u0103toare":"Next month"}">\u203A</button>
						</div>
						${u}
					</div>
				</div>
			`}).join("");t.innerHTML!==d&&(t.innerHTML=d),this.setupHabitsEventListeners()}generateHabitMonthCalendar(t,e,i){let s=new Date,a=this.getLocalDateString(s),n=new Date(e.getFullYear(),e.getMonth(),1),o=new Date(e.getFullYear(),e.getMonth()+1,0),r=n.getDay(),d=o.getDate(),l=i?["D","L","M","M","J","V","S"]:["S","M","T","W","T","F","S"],c='<div class="habit-calendar-grid">';c+='<div class="habit-calendar-weekdays">',l.forEach(u=>{c+=`<div class="habit-weekday">${u}</div>`}),c+="</div>",c+='<div class="habit-calendar-days">';for(let u=0;u<r;u++)c+='<div class="habit-calendar-day empty"></div>';for(let u=1;u<=d;u++){let m=new Date(e.getFullYear(),e.getMonth(),u),p=this.getLocalDateString(m),v=t.completions[p]||!1,b=p===a,f=m>s;c+=`
				<div class="habit-calendar-day ${v?"completed":""} ${b?"today":""} ${f?"future":""}"
					 data-habit-id="${t.id}"
					 data-date="${p}"
					 style="--habit-color: ${t.color}"
					 title="${b?i?"Ast\u0103zi":"Today":m.toLocaleDateString()}">
					<span class="day-number">${u}</span>
					${v?'<span class="checkmark">\u2713</span>':""}
				</div>
			`}return c+="</div></div>",c}setupHabitsEventListeners(){let t=this.containerEl.querySelector("#habitsList");t&&(t.querySelectorAll(".habit-calendar-day:not(.empty):not(.future)").forEach(e=>{e.addEventListener("click",i=>g(this,null,function*(){i.stopPropagation();let s=parseInt(i.currentTarget.getAttribute("data-habit-id")||"0"),a=i.currentTarget.getAttribute("data-date")||"";yield this.toggleHabit(s,a)}))}),t.querySelectorAll(".habit-prev-month").forEach(e=>{e.addEventListener("click",i=>{i.stopPropagation(),this.navigateHabitsMonth(-1)})}),t.querySelectorAll(".habit-next-month").forEach(e=>{e.addEventListener("click",i=>{i.stopPropagation(),this.navigateHabitsMonth(1)})}),t.querySelectorAll(".habit-delete").forEach(e=>{e.addEventListener("click",i=>{i.stopPropagation();let s=parseInt(i.target.getAttribute("data-habit-id")||"0");this.confirmDeleteHabit(s)})}),t.querySelectorAll(".habit-edit").forEach(e=>{e.addEventListener("click",i=>g(this,null,function*(){i.stopPropagation();let s=parseInt(i.target.getAttribute("data-habit-id")||"0");yield this.editHabit(s)}))}),this.setupHabitsReordering())}navigateHabitsMonth(t){this.currentHabitsMonth+=t,this.currentHabitsMonth>11?(this.currentHabitsMonth=0,this.currentHabitsYear++):this.currentHabitsMonth<0&&(this.currentHabitsMonth=11,this.currentHabitsYear--),this.renderHabits()}renderHabitsWithoutDragSetup(){this.renderHabits()}setupHabitsReordering(){let t=this.containerEl.querySelector("#habitsList");t&&(t.querySelectorAll(".habit-move-up").forEach(e=>{e.addEventListener("click",i=>g(this,null,function*(){i.stopPropagation();let s=parseInt(i.target.getAttribute("data-habit-id")||"0");yield this.moveHabitUp(s)}))}),t.querySelectorAll(".habit-move-down").forEach(e=>{e.addEventListener("click",i=>g(this,null,function*(){i.stopPropagation();let s=parseInt(i.target.getAttribute("data-habit-id")||"0");yield this.moveHabitDown(s)}))}))}moveHabitUp(t){return g(this,null,function*(){let e=this.habits.sort((a,n)=>(a.order||0)-(n.order||0)),i=e.findIndex(a=>a.id===t);if(i<=0)return;let s=e[i].order;e[i].order=e[i-1].order,e[i-1].order=s,yield this.saveData(),this.renderHabitsWithoutDragSetup()})}moveHabitDown(t){return g(this,null,function*(){let e=this.habits.sort((a,n)=>(a.order||0)-(n.order||0)),i=e.findIndex(a=>a.id===t);if(i<0||i>=e.length-1)return;let s=e[i].order;e[i].order=e[i+1].order,e[i+1].order=s,yield this.saveData(),this.renderHabitsWithoutDragSetup()})}reorderHabits(t,e,i){return g(this,null,function*(){let s=this.habits.find(d=>d.id===t),a=this.habits.find(d=>d.id===e);if(!s||!a)return;let n=this.habits.indexOf(s);this.habits.splice(n,1);let o=this.habits.indexOf(a),r=i?o:o+1;this.habits.splice(r,0,s),this.habits.forEach((d,l)=>{d.order=l+1}),yield this.saveData(),this.renderHabitsWithoutDragSetup()})}editHabit(t){return g(this,null,function*(){let e=this.habits.find(u=>u.id===t);if(!e)return;let i=this.plugin.settings.language==="ro",s=document.querySelector(".mindfuldo-edit-modal");s&&document.body.removeChild(s);let a=document.createElement("div");a.className="mindfuldo-edit-modal",a.innerHTML=`
			<div class="edit-modal-content">
				<h3>${i?"Editeaz\u0103 obiceiul":"Edit Habit"}</h3>
				<div class="edit-form">
					<div class="form-group">
						<label>${i?"Nume:":"Name:"}</label>
						<input type="text" id="editHabitName" value="${e.name}" placeholder="${i?"Introduce\u021Bi numele obiceiului":"Enter habit name"}">
					</div>
					<div class="form-group">
						<label>${i?"Culoare:":"Color:"}</label>
						<div class="color-options" id="editHabitColors">
							<div class="color-option ${e.color==="#4CAF50"?"active":""}" data-color="#4CAF50" style="background: #4CAF50;"></div>
							<div class="color-option ${e.color==="#2196F3"?"active":""}" data-color="#2196F3" style="background: #2196F3;"></div>
							<div class="color-option ${e.color==="#FF9800"?"active":""}" data-color="#FF9800" style="background: #FF9800;"></div>
							<div class="color-option ${e.color==="#E91E63"?"active":""}" data-color="#E91E63" style="background: #E91E63;"></div>
							<div class="color-option ${e.color==="#9C27B0"?"active":""}" data-color="#9C27B0" style="background: #9C27B0;"></div>
							<div class="color-option ${e.color==="#00BCD4"?"active":""}" data-color="#00BCD4" style="background: #00BCD4;"></div>
							<div class="color-option custom-color-option${["#4CAF50","#2196F3","#FF9800","#E91E63","#9C27B0","#00BCD4"].includes(e.color)?"":" active"}" data-color="custom" style="background: ${["#4CAF50","#2196F3","#FF9800","#E91E63","#9C27B0","#00BCD4"].includes(e.color)?"transparent":e.color}; border: 1.5px dashed #aaa; position: relative;">
								<input type="color" id="editCustomHabitColor" value="${["#4CAF50","#2196F3","#FF9800","#E91E63","#9C27B0","#00BCD4"].includes(e.color)?"#4CAF50":e.color}" style="opacity:0;position:absolute;left:0;top:0;width:100%;height:100%;cursor:pointer;">
								<span style="position:absolute;left:0;top:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:1.2em;pointer-events:none;">+</span>
							</div>
						</div>
					</div>
					<div class="form-actions">
						<button id="saveHabitEdit" class="save-btn">${i?"Salveaz\u0103":"Save"}</button>
						<button id="cancelHabitEdit" class="cancel-btn">${i?"Anuleaz\u0103":"Cancel"}</button>
					</div>
				</div>
			</div>
		`,document.body.appendChild(a);let n=a.querySelectorAll(".color-option");n.forEach(u=>{u.addEventListener("click",()=>{n.forEach(m=>m.classList.remove("active")),u.classList.add("active")})});let o=a.querySelector("#saveHabitEdit"),r=a.querySelector("#cancelHabitEdit"),d=a.querySelector("#editHabitName"),l=()=>{document.body.contains(a)&&document.body.removeChild(a)},c=()=>g(this,null,function*(){let u=d.value.trim(),m=a.querySelector(".color-option.active"),p=(m==null?void 0:m.getAttribute("data-color"))||e.color;if(p==="custom"){let v=a.querySelector("#editCustomHabitColor");v&&v.value&&(p=v.value)}if(!u){new h.Notice(i?"Numele nu poate fi gol!":"Name cannot be empty!"),d.focus();return}try{e.name=u,e.color=p,yield this.saveData(),this.currentView==="habits"&&this.renderHabits(),new h.Notice(i?"Obiceiul a fost actualizat!":"Habit updated successfully!"),l()}catch(v){console.error("Error saving habit:",v),new h.Notice(i?"Eroare la salvarea obiceiului!":"Error saving habit!")}});o==null||o.addEventListener("click",c),r==null||r.addEventListener("click",l),a.addEventListener("click",u=>{u.target===a&&l()}),d.addEventListener("keypress",u=>{u.key==="Enter"&&c()}),a.addEventListener("keydown",u=>{u.key==="Escape"&&l()}),setTimeout(()=>d.focus(),100)})}renderCalendar(){let t=this.containerEl.querySelector("#calendarGrid"),e=this.containerEl.querySelector("#calendarTitle");if(!t||!e)return;let i=this.plugin.settings.language==="ro"?["Ianuarie","Februarie","Martie","Aprilie","Mai","Iunie","Iulie","August","Septembrie","Octombrie","Noiembrie","Decembrie"]:["January","February","March","April","May","June","July","August","September","October","November","December"];e.textContent=`${i[this.currentMonth]} ${this.currentYear}`;let s=new Date(this.currentYear,this.currentMonth,1),a=new Date(s);a.setDate(a.getDate()-s.getDay());let n=this.plugin.settings.language==="ro"?["D","L","M","M","J","V","S"]:["S","M","T","W","T","F","S"],o='<div class="calendar-weekdays">';n.forEach(r=>{o+=`<div class="calendar-weekday">${r}</div>`}),o+='</div><div class="calendar-days">';for(let r=0;r<42;r++){let d=new Date(a);d.setDate(a.getDate()+r);let l=this.getLocalDateString(d),c=d.getMonth()===this.currentMonth,u=d.toDateString()===new Date().toDateString(),m=this.tasks.filter(b=>b.createdAt.startsWith(l)),p=this.reminders.filter(b=>b.dateTime.startsWith(l)),v="calendar-day";c||(v+=" other-month"),u&&(v+=" today"),m.length>0&&(v+=" has-tasks"),p.length>0&&(v+=" has-reminders"),o+=`
				<div class="${v}" data-date="${l}" data-tasks="${m.length}" data-reminders="${p.length}">
					<div class="calendar-day-number">${d.getDate()}</div>
					<div class="calendar-day-indicators">
						${m.length>0?`<span class="indicator task-indicator">${m.length}</span>`:""}
						${p.length>0?`<span class="indicator reminder-indicator">${p.length}</span>`:""}
					</div>
				</div>
			`}o+="</div>",o+='<div class="calendar-day-details" id="calendarDayDetails" style="display: none;"></div>',t.innerHTML=o,this.setupCalendarNavigation(),this.setupCalendarDayClicks()}setupCalendarNavigation(){var i,s;let t=this.containerEl.querySelector("#prevMonth"),e=this.containerEl.querySelector("#nextMonth");if(t){let a=t.cloneNode(!0);(i=t.parentNode)==null||i.replaceChild(a,t),a.addEventListener("click",n=>{n.preventDefault(),n.stopPropagation(),this.navigateToPreviousMonth()})}if(e){let a=e.cloneNode(!0);(s=e.parentNode)==null||s.replaceChild(a,e),a.addEventListener("click",n=>{n.preventDefault(),n.stopPropagation(),this.navigateToNextMonth()})}}navigateToPreviousMonth(){this.currentMonth--,this.currentMonth<0&&(this.currentMonth=11,this.currentYear--),setTimeout(()=>{this.renderCalendar()},50)}navigateToNextMonth(){this.currentMonth++,this.currentMonth>11&&(this.currentMonth=0,this.currentYear++),setTimeout(()=>{this.renderCalendar()},50)}setupCalendarDayClicks(){this.containerEl.querySelectorAll(".calendar-day").forEach(e=>{e.addEventListener("click",i=>{let s=i.currentTarget,a=s.getAttribute("data-date"),n=parseInt(s.getAttribute("data-tasks")||"0"),o=parseInt(s.getAttribute("data-reminders")||"0");a&&(n>0||o>0)&&this.showDayDetails(a,n,o)})})}showDayDetails(t,e,i){let s=this.containerEl.querySelector("#calendarDayDetails");if(!s)return;let a=this.tasks.filter(c=>c.createdAt.startsWith(t)),n=this.reminders.filter(c=>c.dateTime.startsWith(t)),d=`
			<div class="day-details-header">
				<h3>${new Date(t).toLocaleDateString(this.plugin.settings.language==="ro"?"ro-RO":"en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</h3>
				<button class="close-details" id="closeDayDetails">\xD7</button>
			</div>
		`;a.length>0&&(d+=`
				<div class="day-tasks">
					<h4><span class="task-indicator-small"></span> ${this.plugin.settings.language==="ro"?"Task-uri":"Tasks"} (${a.length})</h4>
					<ul>
						${a.map(c=>`
							<li class="${c.completed?"completed":""}">
								<span class="task-category-badge ${c.category}">${this.getCategoryName(c.category)}</span>
								${c.text}
							</li>
						`).join("")}
					</ul>
				</div>
			`),n.length>0&&(d+=`
				<div class="day-reminders">
					<h4><span class="reminder-indicator-small"></span> ${this.plugin.settings.language==="ro"?"Amintiri":"Reminders"} (${n.length})</h4>
					<ul>
						${n.map(c=>{let m=new Date(c.dateTime).toLocaleTimeString(this.plugin.settings.language==="ro"?"ro-RO":"en-US",{hour:"2-digit",minute:"2-digit"});return`
								<li class="${c.expired?"expired":""}">
									<span class="reminder-time-badge">${m}</span>
									${c.text}
									${c.expired?`<span class="expired-badge">${this.plugin.settings.language==="ro"?"Expirat":"Expired"}</span>`:""}
								</li>
							`}).join("")}
					</ul>
				</div>
			`),s.innerHTML=d,s.style.display="block";let l=s.querySelector("#closeDayDetails");l==null||l.addEventListener("click",()=>{s.style.display="none"})}renderAnalytics(){this.updateCurrentWeekDisplay(),this.calculateWeeklyStats()}navigateToPreviousWeek(){this.currentAnalyticsWeek.setDate(this.currentAnalyticsWeek.getDate()-7),this.renderAnalytics()}navigateToNextWeek(){this.currentAnalyticsWeek.setDate(this.currentAnalyticsWeek.getDate()+7),this.renderAnalytics()}updateCurrentWeekDisplay(){let t=this.containerEl.querySelector("#currentWeek");if(!t)return;let e=this.getStartOfWeek(this.currentAnalyticsWeek),i=new Date(e);i.setDate(e.getDate()+6);let s=this.plugin.settings.language==="ro",a=e.toLocaleDateString(s?"ro-RO":"en-US",{month:"short",day:"numeric"}),n=i.toLocaleDateString(s?"ro-RO":"en-US",{month:"short",day:"numeric",year:"numeric"});t.textContent=`${a} - ${n}`}getStartOfWeek(t){let e=new Date(t),i=e.getDay(),s=e.getDate()-i+(i===0?-6:1);return new Date(e.setDate(s))}calculateWeeklyStats(){let t=this.getStartOfWeek(this.currentAnalyticsWeek),e=new Date(t);e.setDate(t.getDate()+6),e.setHours(23,59,59,999);let i=this.tasks.filter(u=>{if(!u.completedAt)return!1;let m=new Date(u.completedAt);return m>=t&&m<=e}),s=this.habits.length,a=0,n=0;this.habits.forEach(u=>{let m=0;for(let p=new Date(t);p<=e;p.setDate(p.getDate()+1)){let v=this.getLocalDateString(p);u.completions[v]&&m++}m>0&&(a+=m),u.streak>0&&n++});let o=Math.min(30,i.length*3),r=s>0?a/7:0,d=Math.min(40,Math.round(r*2.86)),l=Math.min(30,this.pomodoroCompletedSessions*2),c=o+d+l;this.updateTasksAnalytics(i,t,e),this.updateHabitsAnalytics(a,s,n),this.updatePomodoroAnalytics(),this.updateProductivityScore(c,o,d,l),this.renderDailyChart(t,e)}updateTasksAnalytics(t,e,i){let s=this.containerEl.querySelector("#weeklyTasksCompleted"),a=this.containerEl.querySelector("#tasksChange"),n=this.containerEl.querySelector("#tasksPeakDay");s&&(s.textContent=t.length.toString());let o=new Date(e);o.setDate(o.getDate()-7);let r=new Date(i);r.setDate(r.getDate()-7);let d=this.tasks.filter(l=>{if(!l.completedAt)return!1;let c=new Date(l.completedAt);return c>=o&&c<=r});if(a){let l=d.length>0?Math.round((t.length-d.length)/d.length*100):t.length>0?100:0;a.textContent=`${l>=0?"+":""}${l}%`,a.className=`change-indicator ${l>=0?"positive":"negative"}`}if(n){let l={};t.forEach(b=>{let f=new Date(b.completedAt).toLocaleDateString("en-US",{weekday:"long"});l[f]=(l[f]||0)+1});let c="",u=0;Object.entries(l).forEach(([b,f])=>{f>u&&(u=f,c=b)});let m=this.plugin.settings.language==="ro",p={Monday:m?"Luni":"Monday",Tuesday:m?"Mar\u021Bi":"Tuesday",Wednesday:m?"Miercuri":"Wednesday",Thursday:m?"Joi":"Thursday",Friday:m?"Vineri":"Friday",Saturday:m?"S\xE2mb\u0103t\u0103":"Saturday",Sunday:m?"Duminic\u0103":"Sunday"},v=m?"Cea mai bun\u0103: ":"Best day: ";n.textContent=c?`${v}${p[c]||c}`:`${v}-`}}updateHabitsAnalytics(t,e,i){let s=this.containerEl.querySelector("#weeklyHabitsRate"),a=this.containerEl.querySelector("#habitsCompleted"),n=this.containerEl.querySelector("#activeStreaks");if(s){let o=e>0?Math.round(t/(e*7)*100):0;s.textContent=`${o}%`}if(a){let r=(e>0?t/7:0).toFixed(1),d=this.plugin.settings.language==="ro";a.textContent=`${r} ${d?"habit-uri/zi":"habits/day"}`}n&&(n.textContent=i.toString())}updatePomodoroAnalytics(){let t=this.containerEl.querySelector("#weeklyPomodoroSessions"),e=this.containerEl.querySelector("#totalFocusTime"),i=this.containerEl.querySelector("#avgSessionLength");if(t&&(t.textContent=this.pomodoroCompletedSessions.toString()),e){let s=this.pomodoroCompletedSessions*this.plugin.settings.pomodoroWorkTime,a=Math.floor(s/60),n=s%60;e.textContent=`${a}h ${n}min`}i&&(i.textContent=`${this.plugin.settings.pomodoroWorkTime}min`)}updateProductivityScore(t,e,i,s){let a=this.containerEl.querySelector("#productivityScore"),n=this.containerEl.querySelector("#scoreProgress"),o=this.containerEl.querySelector("#tasksScore"),r=this.containerEl.querySelector("#habitsScore"),d=this.containerEl.querySelector("#focusScore");if(a&&(a.textContent=t.toString()),n){let l=2*Math.PI*50,c=t/100,u=l-c*l;n.style.strokeDasharray=`${l} ${l}`,n.style.strokeDashoffset=u.toString()}o&&(o.textContent=`${e}/30`),r&&(r.textContent=`${i}/40`),d&&(d.textContent=`${s}/30`)}renderDailyChart(t,e){let i=this.containerEl.querySelector("#dailyChart");if(!i)return;let s=[];for(let o=new Date(t);o<=e;o.setDate(o.getDate()+1))s.push(new Date(o));let a=this.plugin.settings.language==="ro",n=s.map(o=>o.toLocaleDateString(a?"ro-RO":"en-US",{weekday:"short"}));i.innerHTML=`
			<div class="chart-days">
				${s.map((o,r)=>{let d=this.getLocalDateString(o),l=this.tasks.filter(m=>m.completedAt&&this.getLocalDateString(new Date(m.completedAt))===d).length,c=this.habits.filter(m=>m.completions[d]).length,u=Math.max(l,c,1);return`
						<div class="chart-day">
							<div class="chart-bars">
								<div class="chart-bar tasks" style="height: ${l/Math.max(u,5)*100}%" title="${l} tasks"></div>
								<div class="chart-bar habits" style="height: ${c/Math.max(u,5)*100}%" title="${c} habits"></div>
							</div>
							<div class="chart-label">${n[r]}</div>
						</div>
					`}).join("")}
			</div>
			<div class="chart-legend">
				<div class="chart-legend-item">
					<div class="chart-legend-color tasks"></div>
					<span>${a?"Sarcini completate":"Tasks completed"}</span>
				</div>
				<div class="chart-legend-item">
					<div class="chart-legend-color habits"></div>
					<span>${a?"Habit-uri completate":"Habits completed"}</span>
				</div>
			</div>
		`}savePomodoroSettingsQuietly(){return g(this,null,function*(){yield this.plugin.saveData(this.plugin.settings)})}applyPomodoroPreset(t){this.pomodoroIsRunning&&this.pausePomodoroTimer(),this.containerEl.querySelectorAll(".preset-btn").forEach(n=>n.classList.remove("active"));let e=this.containerEl.querySelector(`[data-preset="${t}"]`);switch(e&&e.classList.add("active"),t){case"classic":this.plugin.settings.pomodoroWorkTime=25,this.plugin.settings.pomodoroBreakTime=5,this.plugin.settings.pomodoroLongBreakTime=15;break;case"extended":this.plugin.settings.pomodoroWorkTime=45,this.plugin.settings.pomodoroBreakTime=10,this.plugin.settings.pomodoroLongBreakTime=30;break;case"short":this.plugin.settings.pomodoroWorkTime=15,this.plugin.settings.pomodoroBreakTime=3,this.plugin.settings.pomodoroLongBreakTime=10;break;case"custom":break}let i=this.containerEl.querySelector("#workTimeInput"),s=this.containerEl.querySelector("#breakTimeInput"),a=this.containerEl.querySelector("#longBreakTimeInput");i&&(i.value=this.plugin.settings.pomodoroWorkTime.toString()),s&&(s.value=this.plugin.settings.pomodoroBreakTime.toString()),a&&(a.value=this.plugin.settings.pomodoroLongBreakTime.toString()),this.savePomodoroSettingsQuietly(),this.initializePomodoroTimer()}renderPomodoro(){this.initializePomodoroTimer(),this.updatePomodoroDisplay(),this.updateActivePreset()}updateActivePreset(){this.containerEl.querySelectorAll(".preset-btn").forEach(n=>n.classList.remove("active"));let{pomodoroWorkTime:t,pomodoroBreakTime:e,pomodoroLongBreakTime:i}=this.plugin.settings,s="custom";t===25&&e===5&&i===15?s="classic":t===45&&e===10&&i===30?s="extended":t===15&&e===3&&i===10&&(s="short");let a=this.containerEl.querySelector(`[data-preset="${s}"]`);a&&a.classList.add("active")}initializePomodoroTimer(){let t;switch(this.pomodoroMode){case"work":t=this.plugin.settings.pomodoroWorkTime;break;case"break":t=this.plugin.settings.pomodoroBreakTime;break;case"longBreak":t=this.plugin.settings.pomodoroLongBreakTime;break}this.pomodoroTimeLeft=t*60,this.updatePomodoroDisplay()}togglePomodoroTimer(){this.pomodoroIsRunning?this.pausePomodoroTimer():this.startPomodoroTimer()}startPomodoroTimer(){this.pomodoroTimeLeft<=0&&this.initializePomodoroTimer(),this.pomodoroIsRunning=!0,this.updateStartPauseButton(),this.pomodoroTimer=setInterval(()=>{this.pomodoroTimeLeft--,this.updatePomodoroDisplay(),this.pomodoroTimeLeft<=0&&this.completePomodoroSession()},1e3)}pausePomodoroTimer(){this.pomodoroIsRunning=!1,this.pomodoroTimer&&(clearInterval(this.pomodoroTimer),this.pomodoroTimer=null),this.updateStartPauseButton()}resetPomodoroTimer(){this.pausePomodoroTimer(),this.initializePomodoroTimer(),this.updateStartPauseButton()}skipPomodoroSession(){this.pausePomodoroTimer(),this.completePomodoroSession()}completePomodoroSession(){this.pausePomodoroTimer();let t=this.plugin.settings.language==="ro";this.pomodoroMode==="work"?(this.pomodoroCompletedSessions++,this.plugin.settings.enableNotifications&&new h.Notice(t?"\u{1F345} Sesiune de lucru complet\u0103! Timp pentru o pauz\u0103.":"\u{1F345} Work session complete! Time for a break.",5e3),this.pomodoroCompletedSessions%this.plugin.settings.pomodoroSessionsBeforeLongBreak===0?(this.pomodoroMode="longBreak",this.pomodoroCurrentCycle++):this.pomodoroMode="break"):(this.plugin.settings.enableNotifications&&new h.Notice(t?"\u26A1 Pauz\u0103 terminat\u0103! \xCEnapoi la lucru.":"\u26A1 Break finished! Back to work.",5e3),this.pomodoroMode="work"),this.initializePomodoroTimer(),this.updatePomodoroModeDisplay(),this.updateStatsDisplay(),this.savePomodoroSettingsQuietly(),(this.pomodoroMode==="work"&&this.plugin.settings.pomodoroAutoStartWork||this.pomodoroMode!=="work"&&this.plugin.settings.pomodoroAutoStartBreaks)&&setTimeout(()=>{this.startPomodoroTimer()},2e3)}updatePomodoroDisplay(){let t=this.containerEl.querySelector("#timerDisplay"),e=this.containerEl.querySelector("#progressRing");if(t){let i=Math.floor(this.pomodoroTimeLeft/60),s=this.pomodoroTimeLeft%60;t.textContent=`${i.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`}if(e){let i;switch(this.pomodoroMode){case"work":i=this.plugin.settings.pomodoroWorkTime*60;break;case"break":i=this.plugin.settings.pomodoroBreakTime*60;break;case"longBreak":i=this.plugin.settings.pomodoroLongBreakTime*60;break}let s=(i-this.pomodoroTimeLeft)/i,a=2*Math.PI*90,n=a-s*a;e.style.strokeDasharray=`${a} ${a}`,e.style.strokeDashoffset=n.toString()}this.updateStatsDisplay()}updateStartPauseButton(){let t=this.containerEl.querySelector("#startPauseBtn"),e=this.containerEl.querySelector("#startPauseIcon"),i=this.containerEl.querySelector("#startPauseText"),s=this.plugin.settings.language==="ro";t&&e&&i&&(this.pomodoroIsRunning?(e.textContent="\u23F8\uFE0F",i.textContent=s?"Pauz\u0103":"Pause",t.classList.add("running")):(e.textContent="\u25B6\uFE0F",i.textContent=s?"\xCEnceput":"Start",t.classList.remove("running")))}updatePomodoroModeDisplay(){let t=this.containerEl.querySelector("#pomodoroMode"),e=this.plugin.settings.language==="ro";if(t)switch(this.pomodoroMode){case"work":t.textContent=e?"Timp de lucru":"Work Time",t.className="pomodoro-mode work";break;case"break":t.textContent=e?"Pauz\u0103 scurt\u0103":"Short Break",t.className="pomodoro-mode break";break;case"longBreak":t.textContent=e?"Pauz\u0103 lung\u0103":"Long Break",t.className="pomodoro-mode long-break";break}}updateStatsDisplay(){let t=this.containerEl.querySelector("#completedSessions"),e=this.containerEl.querySelector("#currentCycle");t&&(t.textContent=this.pomodoroCompletedSessions.toString()),e&&(e.textContent=this.pomodoroCurrentCycle.toString())}confirmDeleteReminder(t){let e=this.reminders.find(l=>l.id===t);if(!e)return;let i=this.plugin.settings.language==="ro",s=document.querySelector(".mindfuldo-confirm-modal");s&&document.body.removeChild(s);let a=document.createElement("div");a.className="mindfuldo-confirm-modal",a.innerHTML=`
			<div class="confirm-modal-content">
				<h3>${i?"Confirmare \u0219tergere":"Confirm Delete"}</h3>
				<div class="confirm-message">
					<p>${i?"Sigur dori\u021Bi s\u0103 \u0219terge\u021Bi amintirea:":"Are you sure you want to delete the reminder:"}</p>
					<p class="task-text">"${e.text}"</p>
				</div>
				<div class="confirm-actions">
					<button id="confirmDelete" class="delete-btn">${i?"\u0218terge":"Delete"}</button>
					<button id="cancelDelete" class="cancel-btn">${i?"Anuleaz\u0103":"Cancel"}</button>
				</div>
			</div>
		`,document.body.appendChild(a);let n=a.querySelector("#confirmDelete"),o=a.querySelector("#cancelDelete"),r=()=>{document.body.contains(a)&&document.body.removeChild(a)},d=()=>{this.deleteReminder(t),r(),new h.Notice(i?"Amintirea a fost \u0219tears\u0103!":"Reminder deleted successfully!")};n==null||n.addEventListener("click",d),o==null||o.addEventListener("click",r),a.addEventListener("click",l=>{l.target===a&&r()}),a.addEventListener("keydown",l=>{l.key==="Escape"&&r()}),setTimeout(()=>n==null?void 0:n.focus(),100)}confirmDeleteHabit(t){let e=this.habits.find(l=>l.id===t);if(!e)return;let i=this.plugin.settings.language==="ro",s=document.querySelector(".mindfuldo-confirm-modal");s&&document.body.removeChild(s);let a=document.createElement("div");a.className="mindfuldo-confirm-modal",a.innerHTML=`
			<div class="confirm-modal-content">
				<h3>${i?"Confirmare \u0219tergere":"Confirm Delete"}</h3>
				<div class="confirm-message">
					<p>${i?"Sigur dori\u021Bi s\u0103 \u0219terge\u021Bi obiceiul:":"Are you sure you want to delete the habit:"}</p>
					<p class="task-text">"${e.name}"</p>
				</div>
				<div class="confirm-actions">
					<button id="confirmDelete" class="delete-btn">${i?"\u0218terge":"Delete"}</button>
					<button id="cancelDelete" class="cancel-btn">${i?"Anuleaz\u0103":"Cancel"}</button>
				</div>
			</div>
		`,document.body.appendChild(a);let n=a.querySelector("#confirmDelete"),o=a.querySelector("#cancelDelete"),r=()=>{document.body.contains(a)&&document.body.removeChild(a)},d=()=>g(this,null,function*(){yield this.deleteHabit(t),r(),new h.Notice(i?"Obiceiul a fost \u0219ters!":"Habit deleted successfully!")});n==null||n.addEventListener("click",d),o==null||o.addEventListener("click",r),a.addEventListener("click",l=>{l.target===a&&r()}),a.addEventListener("keydown",l=>{l.key==="Escape"&&r()}),setTimeout(()=>n==null?void 0:n.focus(),100)}},A=class extends h.PluginSettingTab{constructor(t,e){super(t,e);this.plugin=e}display(){let{containerEl:t}=this,e=this.plugin.settings.language==="ro";t.empty(),new h.Setting(t).setName(e?"Categoria implicit\u0103":"Default Category").setDesc(e?"Categoria care va fi selectat\u0103 automat pentru task-uri noi":"Category that will be auto-selected for new tasks").addDropdown(i=>i.addOption("personal","Personal").addOption("lucru",e?"Lucru":"Work").addOption("sanatate",e?"S\u0103n\u0103tate":"Health").addOption("invatare",e?"\xCEnv\u0103\u021Bare":"Learning").addOption("hobby","Hobby").setValue(this.plugin.settings.defaultCategory).onChange(s=>g(this,null,function*(){this.plugin.settings.defaultCategory=s,yield this.plugin.saveSettings()}))),new h.Setting(t).setName(e?"Notific\u0103ri":"Notifications").setDesc(e?"Activeaz\u0103 notific\u0103rile pentru reminder-e":"Enable notifications for reminders").addToggle(i=>i.setValue(this.plugin.settings.enableNotifications).onChange(s=>g(this,null,function*(){this.plugin.settings.enableNotifications=s,yield this.plugin.saveSettings()}))),new h.Setting(t).setName(e?"Tem\u0103":"Theme").setDesc(e?"Alege\u021Bi tema de culori":"Choose color theme").addDropdown(i=>i.addOption("default","Default").addOption("ocean","Ocean (Blue-Teal)").addOption("forest","Forest (Green)").addOption("sunset","Sunset (Pink-Orange)").addOption("purple","Purple (Violet)").addOption("midnight","Midnight (Dark Blue)").setValue(this.plugin.settings.theme).onChange(s=>g(this,null,function*(){this.plugin.settings.theme=s,yield this.plugin.saveSettings()}))),new h.Setting(t).setName(e?"Numele dumneavoastr\u0103":"Your Name").setDesc(e?"Introduce\u021Bi numele pentru salut\u0103ri personalizate":"Enter your name for personalized greetings").addText(i=>i.setValue(this.plugin.settings.userName).onChange(s=>g(this,null,function*(){this.plugin.settings.userName=s,yield this.plugin.saveSettings()}))),new h.Setting(t).setName(e?"Limba":"Language").setDesc(e?"Alege\u021Bi limba aplica\u021Biei":"Choose language").addDropdown(i=>i.addOption("ro",e?"Rom\xE2n\u0103":"Romanian").addOption("en",e?"Englez\u0103":"English").setValue(this.plugin.settings.language).onChange(s=>g(this,null,function*(){this.plugin.settings.language=s,yield this.plugin.saveSettings()}))),new h.Setting(t).setName(e?"Pozi\u021Bia sidebar-ului":"Sidebar Position").setDesc(e?"Alege\u021Bi pozi\u021Bia sidebar-ului":"Choose sidebar position").addDropdown(i=>i.addOption("left",e?"St\xE2nga":"Left").addOption("right",e?"Dreapta":"Right").setValue(this.plugin.settings.sidebarPosition).onChange(s=>g(this,null,function*(){this.plugin.settings.sidebarPosition=s,yield this.plugin.saveSettings(),this.plugin.moveViewToSidebar(s)}))),new h.Setting(t).setName(e?"Auto-\u0219terge expirate":"Auto-delete Expired").setDesc(e?"\u0218terge automat reminder-urile expirate":"Automatically delete expired reminders").addToggle(i=>i.setValue(this.plugin.settings.autoDeleteExpired).onChange(s=>g(this,null,function*(){this.plugin.settings.autoDeleteExpired=s,yield this.plugin.saveSettings()}))),t.createEl("h3",{text:e?"\u{1F527} Func\u021Bionalit\u0103\u021Bi":"\u{1F527} Features"}),new h.Setting(t).setName(e?"Activeaz\u0103 Sarcini":"Enable Tasks").setDesc(e?"Afi\u0219eaz\u0103 sec\u021Biunea de sarcini \xEEn toolbar":"Show tasks section in toolbar").addToggle(i=>i.setValue(this.plugin.settings.enableTasks).onChange(s=>g(this,null,function*(){this.plugin.settings.enableTasks=s,yield this.plugin.saveSettings()}))),new h.Setting(t).setName(e?"Activeaz\u0103 Amintiri":"Enable Reminders").setDesc(e?"Afi\u0219eaz\u0103 sec\u021Biunea de amintiri \xEEn toolbar":"Show reminders section in toolbar").addToggle(i=>i.setValue(this.plugin.settings.enableReminders).onChange(s=>g(this,null,function*(){this.plugin.settings.enableReminders=s,yield this.plugin.saveSettings()}))),new h.Setting(t).setName(e?"Activeaz\u0103 Obiceiuri":"Enable Habits").setDesc(e?"Afi\u0219eaz\u0103 sec\u021Biunea de obiceiuri \xEEn toolbar":"Show habits section in toolbar").addToggle(i=>i.setValue(this.plugin.settings.enableHabits).onChange(s=>g(this,null,function*(){this.plugin.settings.enableHabits=s,yield this.plugin.saveSettings()}))),new h.Setting(t).setName(e?"Activeaz\u0103 Analytics":"Enable Analytics").setDesc(e?"Afi\u0219eaz\u0103 sec\u021Biunea de analiz\u0103 \xEEn toolbar":"Show analytics section in toolbar").addToggle(i=>i.setValue(this.plugin.settings.enableAnalytics).onChange(s=>g(this,null,function*(){this.plugin.settings.enableAnalytics=s,yield this.plugin.saveSettings()}))),new h.Setting(t).setName(e?"Activeaz\u0103 Calendar":"Enable Calendar").setDesc(e?"Afi\u0219eaz\u0103 sec\u021Biunea de calendar \xEEn toolbar":"Show calendar section in toolbar").addToggle(i=>i.setValue(this.plugin.settings.enableCalendar).onChange(s=>g(this,null,function*(){this.plugin.settings.enableCalendar=s,yield this.plugin.saveSettings()}))),new h.Setting(t).setName(e?"Activeaz\u0103 Pomodoro":"Enable Pomodoro").setDesc(e?"Afi\u0219eaz\u0103 sec\u021Biunea de Pomodoro \xEEn toolbar":"Show Pomodoro section in toolbar").addToggle(i=>i.setValue(this.plugin.settings.enablePomodoro).onChange(s=>g(this,null,function*(){this.plugin.settings.enablePomodoro=s,yield this.plugin.saveSettings()}))),t.createEl("h3",{text:e?"\u{1F345} Set\u0103ri Pomodoro":"\u{1F345} Pomodoro Settings"}),new h.Setting(t).setName(e?"Timp de lucru (minute)":"Work Time (minutes)").setDesc(e?"Durata unei sesiuni de lucru":"Duration of a work session").addSlider(i=>i.setLimits(1,60,1).setValue(this.plugin.settings.pomodoroWorkTime).setDynamicTooltip().onChange(s=>g(this,null,function*(){this.plugin.settings.pomodoroWorkTime=s,yield this.plugin.saveSettings()}))),new h.Setting(t).setName(e?"Pauz\u0103 scurt\u0103 (minute)":"Short Break (minutes)").setDesc(e?"Durata unei pauze scurte":"Duration of a short break").addSlider(i=>i.setLimits(1,30,1).setValue(this.plugin.settings.pomodoroBreakTime).setDynamicTooltip().onChange(s=>g(this,null,function*(){this.plugin.settings.pomodoroBreakTime=s,yield this.plugin.saveSettings()}))),new h.Setting(t).setName(e?"Pauz\u0103 lung\u0103 (minute)":"Long Break (minutes)").setDesc(e?"Durata unei pauze lungi":"Duration of a long break").addSlider(i=>i.setLimits(5,60,1).setValue(this.plugin.settings.pomodoroLongBreakTime).setDynamicTooltip().onChange(s=>g(this,null,function*(){this.plugin.settings.pomodoroLongBreakTime=s,yield this.plugin.saveSettings()}))),new h.Setting(t).setName(e?"Sesiuni p\xE2n\u0103 la pauza lung\u0103":"Sessions Before Long Break").setDesc(e?"Num\u0103rul de sesiuni de lucru \xEEnainte de o pauz\u0103 lung\u0103":"Number of work sessions before a long break").addSlider(i=>i.setLimits(2,8,1).setValue(this.plugin.settings.pomodoroSessionsBeforeLongBreak).setDynamicTooltip().onChange(s=>g(this,null,function*(){this.plugin.settings.pomodoroSessionsBeforeLongBreak=s,yield this.plugin.saveSettings()}))),new h.Setting(t).setName(e?"Auto-\xEEncepe pauzele":"Auto-start Breaks").setDesc(e?"\xCEncepe automat pauzele dup\u0103 sesiunile de lucru":"Automatically start breaks after work sessions").addToggle(i=>i.setValue(this.plugin.settings.pomodoroAutoStartBreaks).onChange(s=>g(this,null,function*(){this.plugin.settings.pomodoroAutoStartBreaks=s,yield this.plugin.saveSettings()}))),new h.Setting(t).setName(e?"Auto-\xEEncepe lucrul":"Auto-start Work").setDesc(e?"\xCEncepe automat sesiunile de lucru dup\u0103 pauze":"Automatically start work sessions after breaks").addToggle(i=>i.setValue(this.plugin.settings.pomodoroAutoStartWork).onChange(s=>g(this,null,function*(){this.plugin.settings.pomodoroAutoStartWork=s,yield this.plugin.saveSettings()})))}};
//# sourceMappingURL=main.js.map
