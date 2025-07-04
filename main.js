var w=Object.defineProperty;var x=Object.getOwnPropertyDescriptor;var A=Object.getOwnPropertyNames;var M=Object.prototype.hasOwnProperty;var H=(T,k)=>{for(var e in k)w(T,e,{get:k[e],enumerable:!0})},P=(T,k,e,t)=>{if(k&&typeof k=="object"||typeof k=="function")for(let i of A(k))!M.call(T,i)&&i!==e&&w(T,i,{get:()=>k[i],enumerable:!(t=x(k,i))||t.enumerable});return T};var R=T=>P(w({},"__esModule",{value:!0}),T);var g=(T,k,e)=>new Promise((t,i)=>{var a=o=>{try{s(e.next(o))}catch(r){i(r)}},n=o=>{try{s(e.throw(o))}catch(r){i(r)}},s=o=>o.done?t(o.value):Promise.resolve(o.value).then(a,n);s((e=e.apply(T,k)).next())});var N={};H(N,{RelaxingTodoView:()=>L,VIEW_TYPE_RELAXING_TODO:()=>S,default:()=>$});module.exports=R(N);var p=require("obsidian");const I={defaultCategory:"personal",enableNotifications:!0,theme:"default",userName:"Vlad",language:"ro",sidebarPosition:"left",autoDeleteExpired:!1,pomodoroWorkTime:25,pomodoroBreakTime:5,pomodoroLongBreakTime:15,pomodoroSessionsBeforeLongBreak:4,pomodoroAutoStartBreaks:!1,pomodoroAutoStartWork:!1,enableTasks:!0,enableReminders:!1,enableHabits:!1,enableAnalytics:!1,enableCalendar:!1,enablePomodoro:!1},S="relaxing-todo-view";class $ extends p.Plugin{constructor(){super(...arguments);this.lastDataUpdate=0}onload(){return g(this,null,function*(){yield this.loadSettings(),this.dataFilePath=this.app.vault.configDir+"/plugins/mindfuldo/data.json",this.registerView(S,t=>new L(t,this)),this.registerEvent(this.app.vault.on("modify",t=>{(t.path.includes("mindfuldo")||t.path.includes("data.json"))&&this.handleDataFileChange()})),this.registerInterval(window.setInterval(()=>{this.checkForDataChanges()},5e3)),this.addRibbonIcon("checkmark","MindfulDo - Task Manager",t=>{this.activateView()}).addClass("relaxing-todo-ribbon-class"),this.addCommand({id:"open-relaxing-todo",name:"Open MindfulDo",callback:()=>{this.activateView()}}),this.addSettingTab(new q(this.app,this))})}onunload(){}activateView(){return g(this,null,function*(){const{workspace:e}=this.app;let t=null;const i=e.getLeavesOfType(S);i.length>0?t=i[0]:(this.settings.sidebarPosition==="right"?t=e.getRightLeaf(!1):t=e.getLeftLeaf(!1),yield t==null?void 0:t.setViewState({type:S,active:!0})),t&&e.revealLeaf(t)})}moveViewToSidebar(e){return g(this,null,function*(){const{workspace:t}=this.app,i=t.getLeavesOfType(S);if(i.length>0){i[0].detach();let n;e==="right"?n=t.getRightLeaf(!1):n=t.getLeftLeaf(!1),yield n==null?void 0:n.setViewState({type:S,active:!0}),n&&t.revealLeaf(n)}})}loadSettings(){return g(this,null,function*(){this.settings=Object.assign({},I,yield this.loadData())})}saveSettings(){return g(this,null,function*(){yield this.saveData(this.settings),this.refreshViews()})}refreshViews(){this.app.workspace.getLeavesOfType(S).forEach(t=>{t.view instanceof L&&t.view.refreshInterface()})}handleDataFileChange(){return g(this,null,function*(){const e=Date.now();if(e-this.lastDataUpdate<1e3)return;this.lastDataUpdate=e,this.app.workspace.getLeavesOfType(S).forEach(i=>{i.view instanceof L&&i.view.syncWithExternalChanges()})})}checkForDataChanges(){return g(this,null,function*(){try{const e=yield this.app.vault.adapter.stat(this.dataFilePath);e&&e.mtime>this.lastDataUpdate&&this.handleDataFileChange()}catch(e){}})}}class L extends p.ItemView{constructor(e,t){super(e);this.tasks=[];this.reminders=[];this.habits=[];this.currentCategory="toate";this.currentView="tasks";this.pomodoroTimer=null;this.pomodoroTimeLeft=0;this.pomodoroIsRunning=!1;this.pomodoroMode="work";this.pomodoroCompletedSessions=0;this.pomodoroCurrentCycle=1;this.currentAnalyticsWeek=new Date;this.currentMonth=new Date().getMonth();this.currentYear=new Date().getFullYear();this.plugin=t}getViewType(){return S}getDisplayText(){return"MindfulDo"}getIcon(){return"checkmark"}onOpen(){return g(this,null,function*(){const e=this.containerEl.children[1];e.empty(),e.addClass("mindfuldo-container"),e.setAttribute("data-theme",this.plugin.settings.theme),yield this.loadData(),this.createInterface(e),this.updateDateTime(),setInterval(()=>this.updateDateTime(),1e3),this.checkExpiredReminders(),setInterval(()=>this.checkExpiredReminders(),6e4),setInterval(()=>g(this,null,function*(){return yield this.saveData()}),3e4)})}onClose(){return g(this,null,function*(){yield this.saveData(),this.pomodoroTimer&&(clearInterval(this.pomodoroTimer),this.pomodoroTimer=null)})}refreshInterface(){const e=this.containerEl.children[1];e.empty(),e.addClass("mindfuldo-container"),e.setAttribute("data-theme",this.plugin.settings.theme),this.createInterface(e),this.updateDateTime(),this.renderCurrentView()}syncWithExternalChanges(){return g(this,null,function*(){try{switch(yield this.loadData(),this.currentView){case"habits":this.renderHabits();break;case"tasks":this.renderTasks();break;case"reminders":this.renderReminders();break;case"analytics":this.renderAnalytics();break;case"calendar":this.renderCalendar();break;case"pomodoro":this.renderPomodoro();break}}catch(e){console.log("MindfulDo: Error syncing external changes:",e)}})}createInterface(e){e.innerHTML=`
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
		`,this.setupEventListeners(),this.renderCurrentView()}generateNavigationTabs(){const e=this.plugin.settings.language==="ro",t=[];let i=!0;const a=[this.plugin.settings.enableTasks,this.plugin.settings.enableReminders,this.plugin.settings.enableHabits,this.plugin.settings.enableAnalytics,this.plugin.settings.enableCalendar,this.plugin.settings.enablePomodoro].filter(Boolean).length;return this.plugin.settings.enableTasks&&(t.push(`
				<button class="nav-tab ${i?"active":""} nav-tab-tasks" data-view="tasks">
					<span>\u{1F4DD}</span> ${e?"Sarcini":"Tasks"}
				</button>
			`),i&&(i=!1)),this.plugin.settings.enableReminders&&(t.push(`
				<button class="nav-tab ${i?"active":""} nav-tab-reminders" data-view="reminders">
					<span>\u23F0</span> ${e?"Amintiri":"Reminders"}
				</button>
			`),i&&(i=!1)),this.plugin.settings.enableHabits&&(t.push(`
				<button class="nav-tab ${i?"active":""} nav-tab-habits" data-view="habits">
					<span>\u{1F504}</span> ${e?"Obiceiuri":"Habits"}
				</button>
			`),i&&(i=!1)),this.plugin.settings.enableAnalytics&&(t.push(`
				<button class="nav-tab ${i?"active":""} nav-tab-analytics" data-view="analytics">
					<span>\u{1F4CA}</span> Analytics
				</button>
			`),i&&(i=!1)),this.plugin.settings.enableCalendar&&(t.push(`
				<button class="nav-tab ${i?"active":""} nav-tab-calendar" data-view="calendar">
					<span>\u{1F4C5}</span> Calendar
				</button>
			`),i&&(i=!1)),this.plugin.settings.enablePomodoro&&(t.push(`
				<button class="nav-tab ${i?"active":""} nav-tab-pomodoro" data-view="pomodoro">
					<span>\u{1F345}</span> Pomodoro
				</button>
			`),i&&(i=!1)),t.length===0&&t.push(`
				<button class="nav-tab active nav-tab-tasks" data-view="tasks">
					<span>\u{1F4DD}</span> ${e?"Sarcini":"Tasks"}
				</button>
			`),`
			<style id="dynamic-nav-grid">
				${this.generateDynamicGridCSS(a)}
			</style>
			${t.join("")}
		`}generateDynamicGridCSS(e){return e<=3?`
				.mindfuldo-content .navigation-tabs {
					grid-template-columns: repeat(${e}, 1fr);
					grid-template-rows: 1fr;
				}
			`:e===4?`
				.mindfuldo-content .navigation-tabs {
					grid-template-columns: repeat(2, 1fr);
					grid-template-rows: repeat(2, 1fr);
				}
			`:e===5?`
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
			`}setupEventListeners(){const e=this.containerEl.querySelector("#addBtn"),t=this.containerEl.querySelector("#taskInput"),i=this.containerEl.querySelector("#clearCompleted"),a=this.containerEl.querySelector("#addReminderBtn"),n=this.containerEl.querySelector("#reminderTextInput"),s=this.containerEl.querySelector("#addHabitBtn"),o=this.containerEl.querySelector("#habitNameInput");e==null||e.addEventListener("click",()=>this.addTask()),t==null||t.addEventListener("keypress",h=>{h.key==="Enter"&&this.addTask()}),i==null||i.addEventListener("click",()=>this.clearCompleted()),a==null||a.addEventListener("click",()=>this.addReminder()),n==null||n.addEventListener("keypress",h=>{h.key==="Enter"&&this.addReminder()}),s==null||s.addEventListener("click",()=>g(this,null,function*(){return yield this.addHabit()})),o==null||o.addEventListener("keypress",h=>g(this,null,function*(){h.key==="Enter"&&(yield this.addHabit())})),this.containerEl.querySelectorAll(".color-option").forEach(h=>{h.addEventListener("click",y=>{this.containerEl.querySelectorAll(".color-option").forEach(f=>f.classList.remove("active")),y.currentTarget.classList.add("active")})}),this.containerEl.querySelectorAll(".category-btn").forEach(h=>{h.addEventListener("click",y=>{const f=y.currentTarget.getAttribute("data-category");f&&this.setCategory(f)})}),this.containerEl.querySelectorAll(".nav-tab").forEach(h=>{h.addEventListener("click",y=>{const f=y.currentTarget.getAttribute("data-view");if(f){this.currentView=f,this.containerEl.querySelectorAll(".nav-tab").forEach(D=>D.classList.remove("active")),y.currentTarget.classList.add("active"),this.containerEl.querySelectorAll(".view-container").forEach(D=>{D.style.display="none"});const E=this.containerEl.querySelector(`#${f}View`);E&&(E.style.display="block"),this.renderCurrentView()}})});const r=this.containerEl.querySelector("#startPauseBtn"),d=this.containerEl.querySelector("#resetBtn"),l=this.containerEl.querySelector("#skipBtn"),c=this.containerEl.querySelector("#workTimeInput"),u=this.containerEl.querySelector("#breakTimeInput"),m=this.containerEl.querySelector("#longBreakTimeInput");r==null||r.addEventListener("click",()=>this.togglePomodoroTimer()),d==null||d.addEventListener("click",()=>this.resetPomodoroTimer()),l==null||l.addEventListener("click",()=>this.skipPomodoroSession()),c==null||c.addEventListener("change",()=>{this.plugin.settings.pomodoroWorkTime=parseInt(c.value),this.savePomodoroSettingsQuietly(),!this.pomodoroIsRunning&&this.pomodoroMode==="work"&&this.initializePomodoroTimer(),this.updateActivePreset()}),u==null||u.addEventListener("change",()=>{this.plugin.settings.pomodoroBreakTime=parseInt(u.value),this.savePomodoroSettingsQuietly(),!this.pomodoroIsRunning&&this.pomodoroMode==="break"&&this.initializePomodoroTimer(),this.updateActivePreset()}),m==null||m.addEventListener("change",()=>{this.plugin.settings.pomodoroLongBreakTime=parseInt(m.value),this.savePomodoroSettingsQuietly(),!this.pomodoroIsRunning&&this.pomodoroMode==="longBreak"&&this.initializePomodoroTimer(),this.updateActivePreset()}),this.containerEl.querySelectorAll(".preset-btn").forEach(h=>{h.addEventListener("click",y=>{const f=y.currentTarget.getAttribute("data-preset");f&&this.applyPomodoroPreset(f)})});const v=this.containerEl.querySelector("#prevWeek"),b=this.containerEl.querySelector("#nextWeek");v==null||v.addEventListener("click",()=>{this.navigateToPreviousWeek()}),b==null||b.addEventListener("click",()=>{this.navigateToNextWeek()})}updateDateTime(){const e=new Date,t=e.getHours();let i="";const a=this.plugin.settings.userName,n=this.plugin.settings.language==="ro";t>=5&&t<12?i=n?`Bun\u0103 diminea\u021Ba, ${a}!`:`Good morning, ${a}!`:t>=12&&t<17?i=n?`Bun\u0103 ziua, ${a}!`:`Good afternoon, ${a}!`:i=n?`Bun\u0103 seara, ${a}!`:`Good evening, ${a}!`;const s=this.containerEl.querySelector("#greeting");s&&(s.textContent=i);const o={weekday:"long",year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit"},r=n?"ro-RO":"en-US",d=e.toLocaleDateString(r,o),l=this.containerEl.querySelector("#timeInfo");l&&(l.textContent=d)}addTask(){return g(this,null,function*(){const e=this.containerEl.querySelector("#taskInput"),t=e.value.trim();if(t==="")return;const i={id:Date.now(),text:t,completed:!1,category:this.currentCategory==="toate"?"work":this.currentCategory,createdAt:this.getLocalDateString(new Date),order:this.tasks.length+1};this.tasks.push(i),yield this.saveData(),e.value="",e.style.transform="scale(0.99)",e.style.background="rgba(76, 175, 80, 0.15)",e.style.borderColor="#66bb6a",setTimeout(()=>{e.style.transform="scale(1)",e.style.background="",e.style.borderColor=""},800),setTimeout(()=>{this.renderCurrentView()},100)})}setCategory(e){this.currentCategory=e,this.containerEl.querySelectorAll(".category-btn").forEach(i=>{i.classList.remove("active")});const t=this.containerEl.querySelector(`[data-category="${e}"]`);t==null||t.classList.add("active"),setTimeout(()=>{this.renderCurrentView()},150)}toggleTask(e){const t=this.tasks.findIndex(i=>i.id===e);t!==-1&&(this.tasks[t].completed=!this.tasks[t].completed,this.tasks[t].completed?this.tasks[t].completedAt=this.getLocalDateTimeString(new Date):delete this.tasks[t].completedAt,this.saveData(),this.currentView==="tasks"&&this.renderTasks())}deleteTask(e){this.tasks=this.tasks.filter(t=>t.id!==e),this.saveData(),this.renderTasks()}confirmDeleteTask(e){const t=this.tasks.find(l=>l.id===e);if(!t)return;const i=this.plugin.settings.language==="ro",a=document.querySelector(".mindfuldo-confirm-modal");a&&document.body.removeChild(a);const n=document.createElement("div");n.className="mindfuldo-confirm-modal",n.innerHTML=`
			<div class="confirm-modal-content">
				<h3>${i?"Confirmare \u0219tergere":"Confirm Delete"}</h3>
				<div class="confirm-message">
					<p>${i?"Sigur dori\u021Bi s\u0103 \u0219terge\u021Bi sarcina:":"Are you sure you want to delete the task:"}</p>
					<p class="task-text">"${t.text}"</p>
				</div>
				<div class="confirm-actions">
					<button id="confirmDelete" class="delete-btn">${i?"\u0218terge":"Delete"}</button>
					<button id="cancelDelete" class="cancel-btn">${i?"Anuleaz\u0103":"Cancel"}</button>
				</div>
			</div>
		`,document.body.appendChild(n);const s=n.querySelector("#confirmDelete"),o=n.querySelector("#cancelDelete"),r=()=>{document.body.contains(n)&&document.body.removeChild(n)},d=()=>{this.deleteTask(e),r(),new p.Notice(i?"Sarcina a fost \u0219tears\u0103!":"Task deleted successfully!")};s==null||s.addEventListener("click",d),o==null||o.addEventListener("click",r),n.addEventListener("click",l=>{l.target===n&&r()}),n.addEventListener("keydown",l=>{l.key==="Escape"&&r()}),setTimeout(()=>s==null?void 0:s.focus(),100)}editTask(e){const t=this.tasks.find(u=>u.id===e);if(!t)return;const i=this.plugin.settings.language==="ro",a=document.querySelector(".mindfuldo-edit-modal");a&&document.body.removeChild(a);const n=document.createElement("div");n.className="mindfuldo-edit-modal",n.innerHTML=`
			<div class="edit-modal-content">
				<h3>${i?"Editeaz\u0103 sarcina":"Edit Task"}</h3>
				<div class="edit-form">
					<div class="form-group">
						<label>Text:</label>
						<input type="text" id="editTaskText" value="${t.text}" placeholder="${i?"Introduce\u021Bi textul sarcinii":"Enter task text"}">
					</div>
					<div class="form-group">
						<label>${i?"Categoria:":"Category:"}</label>
						<select id="editTaskCategory">
							<option value="work" ${t.category==="work"?"selected":""}>${this.getCategoryName("work")}</option>
							<option value="personal" ${t.category==="personal"?"selected":""}>${this.getCategoryName("personal")}</option>
							<option value="health" ${t.category==="health"?"selected":""}>${this.getCategoryName("health")}</option>
							<option value="learning" ${t.category==="learning"?"selected":""}>${this.getCategoryName("learning")}</option>
							<option value="hobby" ${t.category==="hobby"?"selected":""}>${this.getCategoryName("hobby")}</option>
						</select>
					</div>
					<div class="form-actions">
						<button id="saveTaskEdit" class="save-btn">${i?"Salveaz\u0103":"Save"}</button>
						<button id="cancelTaskEdit" class="cancel-btn">${i?"Anuleaz\u0103":"Cancel"}</button>
					</div>
				</div>
			</div>
		`,document.body.appendChild(n);const s=n.querySelector("#saveTaskEdit"),o=n.querySelector("#cancelTaskEdit"),r=n.querySelector("#editTaskText"),d=n.querySelector("#editTaskCategory"),l=()=>{document.body.contains(n)&&document.body.removeChild(n)},c=()=>g(this,null,function*(){const u=r.value.trim(),m=d.value;if(!u){new p.Notice(i?"Textul nu poate fi gol!":"Text cannot be empty!"),r.focus();return}try{t.text=u,t.category=m,yield this.saveData(),this.currentView==="tasks"&&this.renderTasks(),new p.Notice(i?"Sarcina a fost actualizat\u0103!":"Task updated successfully!"),l()}catch(v){console.error("Error saving task:",v),new p.Notice(i?"Eroare la salvarea sarcinii!":"Error saving task!")}});s==null||s.addEventListener("click",c),o==null||o.addEventListener("click",l),n.addEventListener("click",u=>{u.target===n&&l()}),r.addEventListener("keypress",u=>{u.key==="Enter"&&c()}),n.addEventListener("keydown",u=>{u.key==="Escape"&&l()}),setTimeout(()=>r.focus(),100)}clearCompleted(){this.tasks=this.tasks.filter(e=>!e.completed),this.saveData(),setTimeout(()=>{this.renderCurrentView()},50)}renderCurrentView(){const e=this.containerEl.querySelector("#tasksView"),t=this.containerEl.querySelector("#remindersView"),i=this.containerEl.querySelector("#habitsView"),a=this.containerEl.querySelector("#analyticsView"),n=this.containerEl.querySelector("#calendarView"),s=this.containerEl.querySelector("#pomodoroView");this.currentView==="tasks"?(e==null||e.classList.add("active"),t==null||t.classList.remove("active"),i==null||i.classList.remove("active"),a==null||a.classList.remove("active"),n==null||n.classList.remove("active"),s==null||s.classList.remove("active"),this.renderTasks()):this.currentView==="reminders"?(e==null||e.classList.remove("active"),t==null||t.classList.add("active"),i==null||i.classList.remove("active"),a==null||a.classList.remove("active"),n==null||n.classList.remove("active"),s==null||s.classList.remove("active"),this.renderReminders()):this.currentView==="habits"?(e==null||e.classList.remove("active"),t==null||t.classList.remove("active"),i==null||i.classList.add("active"),a==null||a.classList.remove("active"),n==null||n.classList.remove("active"),s==null||s.classList.remove("active"),this.renderHabits()):this.currentView==="analytics"?(e==null||e.classList.remove("active"),t==null||t.classList.remove("active"),i==null||i.classList.remove("active"),a==null||a.classList.add("active"),n==null||n.classList.remove("active"),s==null||s.classList.remove("active"),this.renderAnalytics()):this.currentView==="calendar"?(e==null||e.classList.remove("active"),t==null||t.classList.remove("active"),i==null||i.classList.remove("active"),a==null||a.classList.remove("active"),n==null||n.classList.add("active"),s==null||s.classList.remove("active"),this.renderCalendar()):this.currentView==="pomodoro"&&(e==null||e.classList.remove("active"),t==null||t.classList.remove("active"),i==null||i.classList.remove("active"),a==null||a.classList.remove("active"),n==null||n.classList.remove("active"),s==null||s.classList.add("active"),this.renderPomodoro())}renderTasks(){const e=this.containerEl.querySelector("#tasksList"),t=this.containerEl.querySelector("#taskCounter"),i=this.containerEl.querySelector("#clearCompleted");if(!e||!t)return;let a=this.tasks;this.currentCategory!=="toate"&&(a=this.tasks.filter(r=>r.category===this.currentCategory)),a.sort((r,d)=>r.completed&&!d.completed?1:!r.completed&&d.completed?-1:(r.order||0)-(d.order||0));const n=this.tasks.filter(r=>r.completed),s=this.tasks.filter(r=>!r.completed),o=this.plugin.settings.language==="ro";if(o?t.textContent=`${s.length} ${s.length!==1?"sarcini":"sarcin\u0103"}`:t.textContent=`${s.length} ${s.length!==1?"tasks":"task"}`,i.style.display=n.length>0?"block":"none",a.length===0){e.innerHTML="";return}e.innerHTML=a.map(r=>`
			<div class="task-item ${r.completed?"completed":""}" data-task-id="${r.id}" draggable="true">
				<div class="drag-handle" title="${o?"Trage\u021Bi pentru a reordona":"Drag to reorder"}">\u22EE\u22EE</div>
				<div class="task-checkbox ${r.completed?"checked":""}" data-task-id="${r.id}"></div>
				<div class="task-text" data-task-id="${r.id}">${r.text}</div>
				<div class="task-category ${r.category}" data-task-id="${r.id}">${this.getCategoryName(r.category)}</div>
				<div class="task-actions">
					<button class="task-edit" data-task-id="${r.id}" title="${o?"Editeaz\u0103":"Edit"}">\u270F\uFE0F</button>
					<button class="task-delete" data-task-id="${r.id}" title="${o?"\u0218terge":"Delete"}">\xD7</button>
				</div>
			</div>
		`).join(""),e.querySelectorAll(".task-checkbox").forEach(r=>{r.addEventListener("click",d=>{const l=parseInt(d.target.getAttribute("data-task-id")||"0");this.toggleTask(l)})}),e.querySelectorAll(".task-edit").forEach(r=>{r.addEventListener("click",d=>{const l=parseInt(d.target.getAttribute("data-task-id")||"0");this.editTask(l)})}),e.querySelectorAll(".task-delete").forEach(r=>{r.addEventListener("click",d=>{const l=parseInt(d.target.getAttribute("data-task-id")||"0");this.confirmDeleteTask(l)})}),this.setupTasksDragAndDrop()}setupTasksDragAndDrop(){const e=this.containerEl.querySelector("#tasksList");if(!e)return;const t=Array.from(e.querySelectorAll(".task-item"));let i=null,a=null,n=null;t.forEach(s=>{s.addEventListener("dragstart",o=>{i=s,a=parseInt(s.getAttribute("data-task-id")||"0"),s.classList.add("dragging"),o.dataTransfer&&(o.dataTransfer.effectAllowed="move",o.dataTransfer.setData("text/plain",a.toString()))}),s.addEventListener("dragend",()=>{s.classList.remove("dragging"),i=null,a=null,n=null}),s.addEventListener("dragover",o=>{if(o.preventDefault(),!i||i===s)return;const r=s.getBoundingClientRect(),d=r.top+r.height/2,l=o.clientY<d;n!==s&&(n&&n.classList.remove("drop-above","drop-below"),n=s),s.classList.toggle("drop-above",l),s.classList.toggle("drop-below",!l),i.parentElement===e&&(l&&s!==i.nextElementSibling?e.insertBefore(i,s):!l&&s!==i&&e.insertBefore(i,s.nextElementSibling))}),s.addEventListener("dragleave",()=>{s.classList.remove("drop-above","drop-below")}),s.addEventListener("drop",o=>g(this,null,function*(){if(o.preventDefault(),s.classList.remove("drop-above","drop-below"),!a||!i||i===s)return;const r=[];Array.from(e.querySelectorAll(".task-item")).forEach((l,c)=>{const u=parseInt(l.getAttribute("data-task-id")||"0");r.push(u)}),this.tasks.sort((l,c)=>r.indexOf(l.id)-r.indexOf(c.id)),this.tasks.forEach((l,c)=>{l.order=c+1}),yield this.saveData(),this.renderTasks()}))})}reorderTasks(e,t,i){return g(this,null,function*(){const a=this.tasks.find(d=>d.id===e),n=this.tasks.find(d=>d.id===t);if(!a||!n)return;const s=this.tasks.indexOf(a);this.tasks.splice(s,1);const o=this.tasks.indexOf(n),r=i?o:o+1;this.tasks.splice(r,0,a),this.tasks.forEach((d,l)=>{d.order=l+1}),yield this.saveData(),this.renderTasks()})}getCategoryName(e){const t=this.plugin.settings.language==="ro";return{toate:t?"Toate":"All",lucru:t?"Lucru":"Work",work:t?"Lucru":"Work",personal:"Personal",sanatate:t?"S\u0103n\u0103tate":"Health",health:t?"S\u0103n\u0103tate":"Health",invatare:t?"\xCEnv\u0103\u021Bare":"Learning",learning:t?"\xCEnv\u0103\u021Bare":"Learning",hobby:"Hobby"}[e]||e}loadTasks(){return g(this,null,function*(){const e=yield this.plugin.loadData();this.tasks=(e==null?void 0:e.tasks)||[]})}saveTasks(){return g(this,null,function*(){const e=(yield this.plugin.loadData())||{};e.tasks=this.tasks,yield this.plugin.saveData(e)})}loadData(){return g(this,null,function*(){const e=yield this.plugin.loadData();this.tasks=(e==null?void 0:e.tasks)||[],this.reminders=(e==null?void 0:e.reminders)||[],this.habits=(e==null?void 0:e.habits)||[],this.migrateDataToIncludeOrder()})}migrateDataToIncludeOrder(){let e=!1;this.tasks.forEach((t,i)=>{t.order===void 0&&(t.order=i+1,e=!0)}),this.reminders.forEach((t,i)=>{t.order===void 0&&(t.order=i+1,e=!0)}),this.habits.forEach((t,i)=>{t.order===void 0&&(t.order=i+1,e=!0)}),e&&this.saveData()}saveData(){return g(this,null,function*(){const e=(yield this.plugin.loadData())||{};e.tasks=this.tasks,e.reminders=this.reminders,e.habits=this.habits,yield this.plugin.saveData(e)})}getTaskPlaceholder(){return this.plugin.settings.language==="ro"?`Ce ave\u021Bi de f\u0103cut ast\u0103zi, ${this.plugin.settings.userName}?`:`What do you need to do today, ${this.plugin.settings.userName}?`}getReminderPlaceholder(){return this.plugin.settings.language==="ro"?"Despre ce s\u0103 v\u0103 amintim?":"What should I remind you about?"}getLocalDateString(e){const t=e.getFullYear(),i=String(e.getMonth()+1).padStart(2,"0"),a=String(e.getDate()).padStart(2,"0");return`${t}-${i}-${a}`}getLocalDateTimeString(e){const t=this.getLocalDateString(e),i=String(e.getHours()).padStart(2,"0"),a=String(e.getMinutes()).padStart(2,"0");return`${t}T${i}:${a}`}checkExpiredReminders(){const e=new Date;let t=!1;this.reminders.forEach(i=>{const a=new Date(i.dateTime);!i.expired&&a<=e&&(i.expired=!0,t=!0,this.plugin.settings.enableNotifications&&new p.Notice(`\u23F0 Amintire: ${i.text}`,5e3))}),t&&(this.saveData(),this.currentView==="reminders"&&this.renderReminders())}addReminder(){return g(this,null,function*(){const e=this.containerEl.querySelector("#reminderTextInput"),t=this.containerEl.querySelector("#reminderDateInput"),i=this.containerEl.querySelector("#reminderTimeInput"),a=e.value.trim(),n=t.value,s=i.value;if(!a||!n||!s){new p.Notice(this.plugin.settings.language==="ro"?"Completa\u021Bi toate c\xE2mpurile pentru amintire!":"Fill in all fields!");return}const o=`${n}T${s}`;if(new Date(o)<=new Date){new p.Notice(this.plugin.settings.language==="ro"?"V\u0103 rug\u0103m s\u0103 alege\u021Bi o dat\u0103 \u0219i or\u0103 din viitor!":"Date must be in the future!");return}const d={id:Date.now(),text:a,dateTime:o,expired:!1,createdAt:this.getLocalDateString(new Date),order:this.reminders.length+1};this.reminders.push(d),yield this.saveData(),e.value="",t.value="",i.value="",this.renderReminders()})}deleteReminder(e){this.reminders=this.reminders.filter(t=>t.id!==e),this.saveData(),this.renderReminders()}renderReminders(){const e=this.containerEl.querySelector("#remindersList"),t=this.containerEl.querySelector("#reminderCounter");if(!e||!t)return;const i=this.plugin.settings.language==="ro",a=this.reminders.sort((s,o)=>{if(s.expired&&!o.expired)return 1;if(!s.expired&&o.expired)return-1;if(s.expired===o.expired){const r=(s.order||0)-(o.order||0);if(r!==0)return r}return new Date(s.dateTime).getTime()-new Date(o.dateTime).getTime()}),n=this.reminders.filter(s=>!s.expired);if(i?t.textContent=`${n.length} ${n.length!==1?"amintiri":"amintire"}`:t.textContent=`${n.length} ${n.length!==1?"reminders":"reminder"}`,a.length===0){e.innerHTML=`
				<div class="empty-reminders">
					<div class="empty-reminders-icon">\u23F0</div>
					<p>${this.plugin.settings.language==="ro"?"Nicio amintire \xEEnc\u0103. Adaug\u0103 prima pentru a \xEEncepe!":"No reminders yet. Add your first to get started!"}</p>
				</div>
			`;return}e.innerHTML=a.map(s=>{const o=new Date(s.dateTime),r=o.toLocaleDateString("ro-RO"),d=o.toLocaleTimeString("ro-RO",{hour:"2-digit",minute:"2-digit"});return`
				<div class="reminder-item ${s.expired?"expired":""}" data-reminder-id="${s.id}" draggable="true">
					<div class="drag-handle" title="${i?"Trage\u021Bi pentru a reordona":"Drag to reorder"}">\u22EE\u22EE</div>
					<div class="reminder-content">
						<div class="reminder-text">${s.text}</div>
						<div class="reminder-time">${r} la ${d}</div>
						${s.expired?`<div class="time-left expired">${this.plugin.settings.language==="ro"?"Expirat":"Expired"}</div>`:""}
					</div>
					<div class="reminder-actions">
						<button class="reminder-edit" data-reminder-id="${s.id}" title="${i?"Editeaz\u0103":"Edit"}">\u270F\uFE0F</button>
						<button class="reminder-delete" data-reminder-id="${s.id}" title="${i?"\u0218terge":"Delete"}">\xD7</button>
					</div>
				</div>
			`}).join(""),e.querySelectorAll(".reminder-delete").forEach(s=>{s.addEventListener("click",o=>{const r=parseInt(o.target.getAttribute("data-reminder-id")||"0");this.confirmDeleteReminder(r)})}),e.querySelectorAll(".reminder-edit").forEach(s=>{s.addEventListener("click",o=>{const r=parseInt(o.target.getAttribute("data-reminder-id")||"0");this.editReminder(r)})}),this.setupRemindersDragAndDrop()}setupRemindersDragAndDrop(){const e=this.containerEl.querySelector("#remindersList");if(!e)return;const t=e.querySelectorAll(".reminder-item");let i=null,a=null;t.forEach(n=>{const s=n;s.addEventListener("dragstart",o=>{i=s,a=parseInt(s.getAttribute("data-reminder-id")||"0"),s.classList.add("dragging"),o.dataTransfer&&(o.dataTransfer.effectAllowed="move",o.dataTransfer.setData("text/html",s.outerHTML))}),s.addEventListener("dragend",()=>{s.classList.remove("dragging"),i=null,a=null}),s.addEventListener("dragover",o=>{if(o.preventDefault(),o.dataTransfer&&(o.dataTransfer.dropEffect="move"),i&&i!==s){const r=s.getBoundingClientRect(),d=r.top+r.height/2;o.clientY<d?(s.classList.add("drop-above"),s.classList.remove("drop-below")):(s.classList.add("drop-below"),s.classList.remove("drop-above"))}}),s.addEventListener("dragleave",()=>{s.classList.remove("drop-above","drop-below")}),s.addEventListener("drop",o=>{if(o.preventDefault(),s.classList.remove("drop-above","drop-below"),a&&i&&i!==s){const r=parseInt(s.getAttribute("data-reminder-id")||"0");this.reorderReminders(a,r,o.clientY<s.getBoundingClientRect().top+s.getBoundingClientRect().height/2)}})})}reorderReminders(e,t,i){return g(this,null,function*(){const a=this.reminders.find(d=>d.id===e),n=this.reminders.find(d=>d.id===t);if(!a||!n)return;const s=this.reminders.indexOf(a);this.reminders.splice(s,1);const o=this.reminders.indexOf(n),r=i?o:o+1;this.reminders.splice(r,0,a),this.reminders.forEach((d,l)=>{d.order=l+1}),yield this.saveData(),this.renderReminders()})}editReminder(e){const t=this.reminders.find(h=>h.id===e);if(!t)return;const i=this.plugin.settings.language==="ro",a=new Date(t.dateTime),n=this.getLocalDateString(a),s=a.toTimeString().slice(0,5),o=document.querySelector(".mindfuldo-edit-modal");o&&document.body.removeChild(o);const r=document.createElement("div");r.className="mindfuldo-edit-modal",r.innerHTML=`
			<div class="edit-modal-content">
				<h3>${i?"Editeaz\u0103 amintirea":"Edit Reminder"}</h3>
				<div class="edit-form">
					<div class="form-group">
						<label>Text:</label>
						<input type="text" id="editReminderText" value="${t.text}" placeholder="${i?"Introduce\u021Bi textul amintirii":"Enter reminder text"}">
					</div>
					<div class="form-group">
						<label>${i?"Data:":"Date:"}</label>
						<input type="date" id="editReminderDate" value="${n}">
					</div>
					<div class="form-group">
						<label>${i?"Ora:":"Time:"}</label>
						<input type="time" id="editReminderTime" value="${s}">
					</div>
					<div class="form-actions">
						<button id="saveReminderEdit" class="save-btn">${i?"Salveaz\u0103":"Save"}</button>
						<button id="cancelReminderEdit" class="cancel-btn">${i?"Anuleaz\u0103":"Cancel"}</button>
					</div>
				</div>
			</div>
		`,document.body.appendChild(r);const d=r.querySelector("#saveReminderEdit"),l=r.querySelector("#cancelReminderEdit"),c=r.querySelector("#editReminderText"),u=r.querySelector("#editReminderDate"),m=r.querySelector("#editReminderTime"),v=()=>{document.body.contains(r)&&document.body.removeChild(r)},b=()=>g(this,null,function*(){const h=c.value.trim(),y=u.value,f=m.value;if(!h||!y||!f){new p.Notice(i?"Completa\u021Bi toate c\xE2mpurile!":"Fill in all fields!");return}const E=`${y}T${f}`;if(new Date(E)<=new Date){new p.Notice(i?"V\u0103 rug\u0103m s\u0103 alege\u021Bi o dat\u0103 \u0219i or\u0103 din viitor!":"Date must be in the future!");return}try{t.text=h,t.dateTime=E,t.expired=!1,yield this.saveData(),this.currentView==="reminders"&&this.renderReminders(),new p.Notice(i?"Amintirea a fost actualizat\u0103!":"Reminder updated successfully!"),v()}catch(C){console.error("Error saving reminder:",C),new p.Notice(i?"Eroare la salvarea amintirii!":"Error saving reminder!")}});d==null||d.addEventListener("click",b),l==null||l.addEventListener("click",v),r.addEventListener("click",h=>{h.target===r&&v()}),c.addEventListener("keypress",h=>{h.key==="Enter"&&b()}),r.addEventListener("keydown",h=>{h.key==="Escape"&&v()}),setTimeout(()=>c.focus(),100)}addHabit(){return g(this,null,function*(){var s;yield this.loadData();const e=this.containerEl.querySelector("#habitNameInput");if(!e)return;const t=e.value.trim();if(t==="")return;const i=this.containerEl.querySelector(".color-option.active"),a=(i==null?void 0:i.getAttribute("data-color"))||"#4CAF50",n={id:Date.now(),name:t,color:a,createdAt:this.getLocalDateString(new Date),streak:0,bestStreak:0,completions:{},order:this.habits.length+1};this.habits.push(n),yield this.saveData(),e.value="",this.containerEl.querySelectorAll(".color-option").forEach(o=>o.classList.remove("active")),(s=this.containerEl.querySelector(".color-option"))==null||s.classList.add("active"),this.renderHabits()})}toggleHabit(e,t){return g(this,null,function*(){yield this.loadData();const i=this.habits.findIndex(s=>s.id===e);if(i===-1)return;const a=this.habits[i],n=t||this.getLocalDateString(new Date);a.completions[n]=!a.completions[n],this.updateHabitStreak(a),yield this.saveData(),this.currentView==="habits"&&this.renderHabits()})}updateHabitStreak(e){const t=new Date,i=this.getLocalDateString(t);let a=0,n=0,s=0;const o=Object.keys(e.completions).filter(r=>e.completions[r]).sort();if(o.length===0){e.streak=0,e.bestStreak=Math.max(0,e.bestStreak);return}if(e.completions[i]){a=1;let r=new Date(t);for(;;){r.setDate(r.getDate()-1);const d=this.getLocalDateString(r);if(e.completions[d])a++;else break}}else a=0;for(let r=0;r<o.length;r++){if(r===0)s=1;else{const d=new Date(o[r-1]),c=new Date(o[r]).getTime()-d.getTime();Math.ceil(c/(1e3*60*60*24))===1?s++:s=1}s>n&&(n=s)}e.streak=a,e.bestStreak=Math.max(n,e.bestStreak)}deleteHabit(e){return g(this,null,function*(){yield this.loadData(),this.habits=this.habits.filter(t=>t.id!==e),yield this.saveData(),this.renderHabits()})}renderHabits(){const e=this.containerEl.querySelector("#habitsList"),t=this.containerEl.querySelector("#habitCounter");if(!e||!t)return;const i=this.plugin.settings.language==="ro",a=this.getLocalDateString(new Date),n=this.habits.filter(c=>c.completions[a]).length;if(i?t.textContent=`${n}/${this.habits.length} ${this.habits.length!==1?"obiceiuri":"obicei"} ast\u0103zi`:t.textContent=`${n}/${this.habits.length} ${this.habits.length!==1?"habits":"habit"} today`,this.habits.length===0){e.innerHTML="";return}const s=[...this.habits].sort((c,u)=>(c.order||0)-(u.order||0)),o=new Date,r=[];for(let c=6;c>=0;c--){const u=new Date(o);u.setDate(u.getDate()-c),r.push(u)}const d=i?["D","L","M","M","J","V","S"]:["S","M","T","W","T","F","S"],l=s.map(c=>{const u=r.map((m,v)=>{const b=this.getLocalDateString(m),h=c.completions[b]||!1,y=b===this.getLocalDateString(o),f=d[m.getDay()];return`
					<div class="habit-day-container">
						<div class="habit-day ${h?"completed":""} ${y?"today":""}" 
							 data-habit-id="${c.id}" 
							 data-date="${b}"
							 style="border-color: ${c.color}; ${h&&!y?`background-color: ${c.color};`:""}"
							 title="${y?i?"Ast\u0103zi":"Today":m.toLocaleDateString()}">
							${h?"\u2713":""}
						</div>
						<div class="habit-day-label">${f}</div>
					</div>
				`}).join("");return`
				<div class="habit-item" data-habit-id="${c.id}" draggable="true">
					<div class="drag-handle" title="${i?"Trage\u021Bi pentru a reordona":"Drag to reorder"}">\u22EE\u22EE</div>
					<div class="habit-header">
						<div class="habit-info">
							<div class="habit-name" style="color: ${c.color};">${c.name}</div>
							<div class="habit-stats">
								<span class="streak-current">${c.streak} ${i?"zile":"days"}</span>
								<span class="streak-separator">\u2022</span>
								<span class="streak-best">${i?"Record":"Best"}: ${c.bestStreak}</span>
							</div>
						</div>
						<div class="habit-actions">
							<button class="habit-edit" data-habit-id="${c.id}" title="${i?"Editeaz\u0103":"Edit"}">\u270F\uFE0F</button>
							<button class="habit-delete" data-habit-id="${c.id}" title="${i?"\u0218terge":"Delete"}">\xD7</button>
						</div>
					</div>
					<div class="habit-tracking">
						<div class="habit-days">
							${u}
						</div>
					</div>
				</div>
			`}).join("");e.innerHTML!==l&&(e.innerHTML=l),e.querySelectorAll(".habit-day").forEach(c=>{c.addEventListener("click",u=>g(this,null,function*(){const m=parseInt(u.target.getAttribute("data-habit-id")||"0"),v=u.target.getAttribute("data-date")||"";yield this.toggleHabit(m,v)}))}),e.querySelectorAll(".habit-delete").forEach(c=>{c.addEventListener("click",u=>g(this,null,function*(){const m=parseInt(u.target.getAttribute("data-habit-id")||"0");this.confirmDeleteHabit(m)}))}),e.querySelectorAll(".habit-edit").forEach(c=>{c.addEventListener("click",u=>g(this,null,function*(){const m=parseInt(u.target.getAttribute("data-habit-id")||"0");yield this.editHabit(m)}))}),this.setupHabitsDragAndDrop()}setupHabitsDragAndDrop(){const e=this.containerEl.querySelector("#habitsList");if(!e)return;const t=e.querySelectorAll(".habit-item");let i=null,a=null;t.forEach(n=>{const s=n;s.addEventListener("dragstart",o=>{i=s,a=parseInt(s.getAttribute("data-habit-id")||"0"),s.classList.add("dragging"),o.dataTransfer&&(o.dataTransfer.effectAllowed="move",o.dataTransfer.setData("text/html",s.outerHTML))}),s.addEventListener("dragend",()=>{s.classList.remove("dragging"),i=null,a=null}),s.addEventListener("dragover",o=>{if(o.preventDefault(),o.dataTransfer&&(o.dataTransfer.dropEffect="move"),i&&i!==s){const r=s.getBoundingClientRect(),d=r.top+r.height/2;o.clientY<d?(s.classList.add("drop-above"),s.classList.remove("drop-below")):(s.classList.add("drop-below"),s.classList.remove("drop-above"))}}),s.addEventListener("dragleave",()=>{s.classList.remove("drop-above","drop-below")}),s.addEventListener("drop",o=>{if(o.preventDefault(),s.classList.remove("drop-above","drop-below"),a&&i&&i!==s){const r=parseInt(s.getAttribute("data-habit-id")||"0");this.reorderHabits(a,r,o.clientY<s.getBoundingClientRect().top+s.getBoundingClientRect().height/2)}})})}reorderHabits(e,t,i){return g(this,null,function*(){const a=this.habits.find(d=>d.id===e),n=this.habits.find(d=>d.id===t);if(!a||!n)return;const s=this.habits.indexOf(a);this.habits.splice(s,1);const o=this.habits.indexOf(n),r=i?o:o+1;this.habits.splice(r,0,a),this.habits.forEach((d,l)=>{d.order=l+1}),yield this.saveData(),this.renderHabits()})}editHabit(e){return g(this,null,function*(){const t=this.habits.find(u=>u.id===e);if(!t)return;const i=this.plugin.settings.language==="ro",a=document.querySelector(".mindfuldo-edit-modal");a&&document.body.removeChild(a);const n=document.createElement("div");n.className="mindfuldo-edit-modal",n.innerHTML=`
			<div class="edit-modal-content">
				<h3>${i?"Editeaz\u0103 obiceiul":"Edit Habit"}</h3>
				<div class="edit-form">
					<div class="form-group">
						<label>${i?"Nume:":"Name:"}</label>
						<input type="text" id="editHabitName" value="${t.name}" placeholder="${i?"Introduce\u021Bi numele obiceiului":"Enter habit name"}">
					</div>
					<div class="form-group">
						<label>${i?"Culoare:":"Color:"}</label>
						<div class="color-options" id="editHabitColors">
							<div class="color-option ${t.color==="#4CAF50"?"active":""}" data-color="#4CAF50" style="background: #4CAF50;"></div>
							<div class="color-option ${t.color==="#2196F3"?"active":""}" data-color="#2196F3" style="background: #2196F3;"></div>
							<div class="color-option ${t.color==="#FF9800"?"active":""}" data-color="#FF9800" style="background: #FF9800;"></div>
							<div class="color-option ${t.color==="#E91E63"?"active":""}" data-color="#E91E63" style="background: #E91E63;"></div>
							<div class="color-option ${t.color==="#9C27B0"?"active":""}" data-color="#9C27B0" style="background: #9C27B0;"></div>
							<div class="color-option ${t.color==="#00BCD4"?"active":""}" data-color="#00BCD4" style="background: #00BCD4;"></div>
						</div>
					</div>
					<div class="form-actions">
						<button id="saveHabitEdit" class="save-btn">${i?"Salveaz\u0103":"Save"}</button>
						<button id="cancelHabitEdit" class="cancel-btn">${i?"Anuleaz\u0103":"Cancel"}</button>
					</div>
				</div>
			</div>
		`,document.body.appendChild(n);const s=n.querySelectorAll(".color-option");s.forEach(u=>{u.addEventListener("click",()=>{s.forEach(m=>m.classList.remove("active")),u.classList.add("active")})});const o=n.querySelector("#saveHabitEdit"),r=n.querySelector("#cancelHabitEdit"),d=n.querySelector("#editHabitName"),l=()=>{document.body.contains(n)&&document.body.removeChild(n)},c=()=>g(this,null,function*(){const u=d.value.trim(),m=n.querySelector(".color-option.active"),v=(m==null?void 0:m.getAttribute("data-color"))||t.color;if(!u){new p.Notice(i?"Numele nu poate fi gol!":"Name cannot be empty!"),d.focus();return}try{t.name=u,t.color=v,yield this.saveData(),this.currentView==="habits"&&this.renderHabits(),new p.Notice(i?"Obiceiul a fost actualizat!":"Habit updated successfully!"),l()}catch(b){console.error("Error saving habit:",b),new p.Notice(i?"Eroare la salvarea obiceiului!":"Error saving habit!")}});o==null||o.addEventListener("click",c),r==null||r.addEventListener("click",l),n.addEventListener("click",u=>{u.target===n&&l()}),d.addEventListener("keypress",u=>{u.key==="Enter"&&c()}),n.addEventListener("keydown",u=>{u.key==="Escape"&&l()}),setTimeout(()=>d.focus(),100)})}renderCalendar(){const e=this.containerEl.querySelector("#calendarGrid"),t=this.containerEl.querySelector("#calendarTitle");if(!e||!t)return;const i=this.plugin.settings.language==="ro"?["Ianuarie","Februarie","Martie","Aprilie","Mai","Iunie","Iulie","August","Septembrie","Octombrie","Noiembrie","Decembrie"]:["January","February","March","April","May","June","July","August","September","October","November","December"];t.textContent=`${i[this.currentMonth]} ${this.currentYear}`;const a=new Date(this.currentYear,this.currentMonth,1),n=new Date(a);n.setDate(n.getDate()-a.getDay());const s=this.plugin.settings.language==="ro"?["D","L","M","M","J","V","S"]:["S","M","T","W","T","F","S"];let o='<div class="calendar-weekdays">';s.forEach(r=>{o+=`<div class="calendar-weekday">${r}</div>`}),o+='</div><div class="calendar-days">';for(let r=0;r<42;r++){const d=new Date(n);d.setDate(n.getDate()+r);const l=this.getLocalDateString(d),c=d.getMonth()===this.currentMonth,u=d.toDateString()===new Date().toDateString(),m=this.tasks.filter(h=>h.createdAt.startsWith(l)),v=this.reminders.filter(h=>h.dateTime.startsWith(l));let b="calendar-day";c||(b+=" other-month"),u&&(b+=" today"),m.length>0&&(b+=" has-tasks"),v.length>0&&(b+=" has-reminders"),o+=`
				<div class="${b}" data-date="${l}" data-tasks="${m.length}" data-reminders="${v.length}">
					<div class="calendar-day-number">${d.getDate()}</div>
					<div class="calendar-day-indicators">
						${m.length>0?`<span class="indicator task-indicator">${m.length}</span>`:""}
						${v.length>0?`<span class="indicator reminder-indicator">${v.length}</span>`:""}
					</div>
				</div>
			`}o+="</div>",o+='<div class="calendar-day-details" id="calendarDayDetails" style="display: none;"></div>',e.innerHTML=o,this.setupCalendarNavigation(),this.setupCalendarDayClicks()}setupCalendarNavigation(){var i,a;const e=this.containerEl.querySelector("#prevMonth"),t=this.containerEl.querySelector("#nextMonth");if(e){const n=e.cloneNode(!0);(i=e.parentNode)==null||i.replaceChild(n,e),n.addEventListener("click",s=>{s.preventDefault(),s.stopPropagation(),this.navigateToPreviousMonth()})}if(t){const n=t.cloneNode(!0);(a=t.parentNode)==null||a.replaceChild(n,t),n.addEventListener("click",s=>{s.preventDefault(),s.stopPropagation(),this.navigateToNextMonth()})}}navigateToPreviousMonth(){this.currentMonth--,this.currentMonth<0&&(this.currentMonth=11,this.currentYear--),setTimeout(()=>{this.renderCalendar()},50)}navigateToNextMonth(){this.currentMonth++,this.currentMonth>11&&(this.currentMonth=0,this.currentYear++),setTimeout(()=>{this.renderCalendar()},50)}setupCalendarDayClicks(){this.containerEl.querySelectorAll(".calendar-day").forEach(t=>{t.addEventListener("click",i=>{const a=i.currentTarget,n=a.getAttribute("data-date"),s=parseInt(a.getAttribute("data-tasks")||"0"),o=parseInt(a.getAttribute("data-reminders")||"0");n&&(s>0||o>0)&&this.showDayDetails(n,s,o)})})}showDayDetails(e,t,i){const a=this.containerEl.querySelector("#calendarDayDetails");if(!a)return;const n=this.tasks.filter(c=>c.createdAt.startsWith(e)),s=this.reminders.filter(c=>c.dateTime.startsWith(e));let d=`
			<div class="day-details-header">
				<h3>${new Date(e).toLocaleDateString(this.plugin.settings.language==="ro"?"ro-RO":"en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</h3>
				<button class="close-details" id="closeDayDetails">\xD7</button>
			</div>
		`;n.length>0&&(d+=`
				<div class="day-tasks">
					<h4><span class="task-indicator-small"></span> ${this.plugin.settings.language==="ro"?"Task-uri":"Tasks"} (${n.length})</h4>
					<ul>
						${n.map(c=>`
							<li class="${c.completed?"completed":""}">
								<span class="task-category-badge ${c.category}">${this.getCategoryName(c.category)}</span>
								${c.text}
							</li>
						`).join("")}
					</ul>
				</div>
			`),s.length>0&&(d+=`
				<div class="day-reminders">
					<h4><span class="reminder-indicator-small"></span> ${this.plugin.settings.language==="ro"?"Amintiri":"Reminders"} (${s.length})</h4>
					<ul>
						${s.map(c=>{const m=new Date(c.dateTime).toLocaleTimeString(this.plugin.settings.language==="ro"?"ro-RO":"en-US",{hour:"2-digit",minute:"2-digit"});return`
								<li class="${c.expired?"expired":""}">
									<span class="reminder-time-badge">${m}</span>
									${c.text}
									${c.expired?`<span class="expired-badge">${this.plugin.settings.language==="ro"?"Expirat":"Expired"}</span>`:""}
								</li>
							`}).join("")}
					</ul>
				</div>
			`),a.innerHTML=d,a.style.display="block";const l=a.querySelector("#closeDayDetails");l==null||l.addEventListener("click",()=>{a.style.display="none"})}renderAnalytics(){this.updateCurrentWeekDisplay(),this.calculateWeeklyStats()}navigateToPreviousWeek(){this.currentAnalyticsWeek.setDate(this.currentAnalyticsWeek.getDate()-7),this.renderAnalytics()}navigateToNextWeek(){this.currentAnalyticsWeek.setDate(this.currentAnalyticsWeek.getDate()+7),this.renderAnalytics()}updateCurrentWeekDisplay(){const e=this.containerEl.querySelector("#currentWeek");if(!e)return;const t=this.getStartOfWeek(this.currentAnalyticsWeek),i=new Date(t);i.setDate(t.getDate()+6);const a=this.plugin.settings.language==="ro",n=t.toLocaleDateString(a?"ro-RO":"en-US",{month:"short",day:"numeric"}),s=i.toLocaleDateString(a?"ro-RO":"en-US",{month:"short",day:"numeric",year:"numeric"});e.textContent=`${n} - ${s}`}getStartOfWeek(e){const t=new Date(e),i=t.getDay(),a=t.getDate()-i+(i===0?-6:1);return new Date(t.setDate(a))}calculateWeeklyStats(){const e=this.getStartOfWeek(this.currentAnalyticsWeek),t=new Date(e);t.setDate(e.getDate()+6),t.setHours(23,59,59,999);const i=this.tasks.filter(u=>{if(!u.completedAt)return!1;const m=new Date(u.completedAt);return m>=e&&m<=t}),a=this.habits.length;let n=0,s=0;this.habits.forEach(u=>{let m=0;for(let v=new Date(e);v<=t;v.setDate(v.getDate()+1)){const b=this.getLocalDateString(v);u.completions[b]&&m++}m>0&&(n+=m),u.streak>0&&s++});const o=Math.min(30,i.length*3),r=a>0?n/7:0,d=Math.min(40,Math.round(r*2.86)),l=Math.min(30,this.pomodoroCompletedSessions*2),c=o+d+l;this.updateTasksAnalytics(i,e,t),this.updateHabitsAnalytics(n,a,s),this.updatePomodoroAnalytics(),this.updateProductivityScore(c,o,d,l),this.renderDailyChart(e,t)}updateTasksAnalytics(e,t,i){const a=this.containerEl.querySelector("#weeklyTasksCompleted"),n=this.containerEl.querySelector("#tasksChange"),s=this.containerEl.querySelector("#tasksPeakDay");a&&(a.textContent=e.length.toString());const o=new Date(t);o.setDate(o.getDate()-7);const r=new Date(i);r.setDate(r.getDate()-7);const d=this.tasks.filter(l=>{if(!l.completedAt)return!1;const c=new Date(l.completedAt);return c>=o&&c<=r});if(n){const l=d.length>0?Math.round((e.length-d.length)/d.length*100):e.length>0?100:0;n.textContent=`${l>=0?"+":""}${l}%`,n.className=`change-indicator ${l>=0?"positive":"negative"}`}if(s){const l={};e.forEach(h=>{const y=new Date(h.completedAt).toLocaleDateString("en-US",{weekday:"long"});l[y]=(l[y]||0)+1});let c="",u=0;Object.entries(l).forEach(([h,y])=>{y>u&&(u=y,c=h)});const m=this.plugin.settings.language==="ro",v={Monday:m?"Luni":"Monday",Tuesday:m?"Mar\u021Bi":"Tuesday",Wednesday:m?"Miercuri":"Wednesday",Thursday:m?"Joi":"Thursday",Friday:m?"Vineri":"Friday",Saturday:m?"S\xE2mb\u0103t\u0103":"Saturday",Sunday:m?"Duminic\u0103":"Sunday"},b=m?"Cea mai bun\u0103: ":"Best day: ";s.textContent=c?`${b}${v[c]||c}`:`${b}-`}}updateHabitsAnalytics(e,t,i){const a=this.containerEl.querySelector("#weeklyHabitsRate"),n=this.containerEl.querySelector("#habitsCompleted"),s=this.containerEl.querySelector("#activeStreaks");if(a){const o=t>0?Math.round(e/(t*7)*100):0;a.textContent=`${o}%`}if(n){const r=(t>0?e/7:0).toFixed(1),d=this.plugin.settings.language==="ro";n.textContent=`${r} ${d?"habit-uri/zi":"habits/day"}`}s&&(s.textContent=i.toString())}updatePomodoroAnalytics(){const e=this.containerEl.querySelector("#weeklyPomodoroSessions"),t=this.containerEl.querySelector("#totalFocusTime"),i=this.containerEl.querySelector("#avgSessionLength");if(e&&(e.textContent=this.pomodoroCompletedSessions.toString()),t){const a=this.pomodoroCompletedSessions*this.plugin.settings.pomodoroWorkTime,n=Math.floor(a/60),s=a%60;t.textContent=`${n}h ${s}min`}i&&(i.textContent=`${this.plugin.settings.pomodoroWorkTime}min`)}updateProductivityScore(e,t,i,a){const n=this.containerEl.querySelector("#productivityScore"),s=this.containerEl.querySelector("#scoreProgress"),o=this.containerEl.querySelector("#tasksScore"),r=this.containerEl.querySelector("#habitsScore"),d=this.containerEl.querySelector("#focusScore");if(n&&(n.textContent=e.toString()),s){const l=2*Math.PI*50,c=e/100,u=l-c*l;s.style.strokeDasharray=`${l} ${l}`,s.style.strokeDashoffset=u.toString()}o&&(o.textContent=`${t}/30`),r&&(r.textContent=`${i}/40`),d&&(d.textContent=`${a}/30`)}renderDailyChart(e,t){const i=this.containerEl.querySelector("#dailyChart");if(!i)return;const a=[];for(let o=new Date(e);o<=t;o.setDate(o.getDate()+1))a.push(new Date(o));const n=this.plugin.settings.language==="ro",s=a.map(o=>o.toLocaleDateString(n?"ro-RO":"en-US",{weekday:"short"}));i.innerHTML=`
			<div class="chart-days">
				${a.map((o,r)=>{const d=this.getLocalDateString(o),l=this.tasks.filter(m=>m.completedAt&&this.getLocalDateString(new Date(m.completedAt))===d).length,c=this.habits.filter(m=>m.completions[d]).length,u=Math.max(l,c,1);return`
						<div class="chart-day">
							<div class="chart-bars">
								<div class="chart-bar tasks" style="height: ${l/Math.max(u,5)*100}%" title="${l} tasks"></div>
								<div class="chart-bar habits" style="height: ${c/Math.max(u,5)*100}%" title="${c} habits"></div>
							</div>
							<div class="chart-label">${s[r]}</div>
						</div>
					`}).join("")}
			</div>
			<div class="chart-legend">
				<div class="chart-legend-item">
					<div class="chart-legend-color tasks"></div>
					<span>${n?"Sarcini completate":"Tasks completed"}</span>
				</div>
				<div class="chart-legend-item">
					<div class="chart-legend-color habits"></div>
					<span>${n?"Habit-uri completate":"Habits completed"}</span>
				</div>
			</div>
		`}savePomodoroSettingsQuietly(){return g(this,null,function*(){yield this.plugin.saveData(this.plugin.settings)})}applyPomodoroPreset(e){this.pomodoroIsRunning&&this.pausePomodoroTimer(),this.containerEl.querySelectorAll(".preset-btn").forEach(s=>s.classList.remove("active"));const t=this.containerEl.querySelector(`[data-preset="${e}"]`);switch(t&&t.classList.add("active"),e){case"classic":this.plugin.settings.pomodoroWorkTime=25,this.plugin.settings.pomodoroBreakTime=5,this.plugin.settings.pomodoroLongBreakTime=15;break;case"extended":this.plugin.settings.pomodoroWorkTime=45,this.plugin.settings.pomodoroBreakTime=10,this.plugin.settings.pomodoroLongBreakTime=30;break;case"short":this.plugin.settings.pomodoroWorkTime=15,this.plugin.settings.pomodoroBreakTime=3,this.plugin.settings.pomodoroLongBreakTime=10;break;case"custom":break}const i=this.containerEl.querySelector("#workTimeInput"),a=this.containerEl.querySelector("#breakTimeInput"),n=this.containerEl.querySelector("#longBreakTimeInput");i&&(i.value=this.plugin.settings.pomodoroWorkTime.toString()),a&&(a.value=this.plugin.settings.pomodoroBreakTime.toString()),n&&(n.value=this.plugin.settings.pomodoroLongBreakTime.toString()),this.savePomodoroSettingsQuietly(),this.initializePomodoroTimer()}renderPomodoro(){this.initializePomodoroTimer(),this.updatePomodoroDisplay(),this.updateActivePreset()}updateActivePreset(){this.containerEl.querySelectorAll(".preset-btn").forEach(s=>s.classList.remove("active"));const{pomodoroWorkTime:e,pomodoroBreakTime:t,pomodoroLongBreakTime:i}=this.plugin.settings;let a="custom";e===25&&t===5&&i===15?a="classic":e===45&&t===10&&i===30?a="extended":e===15&&t===3&&i===10&&(a="short");const n=this.containerEl.querySelector(`[data-preset="${a}"]`);n&&n.classList.add("active")}initializePomodoroTimer(){let e;switch(this.pomodoroMode){case"work":e=this.plugin.settings.pomodoroWorkTime;break;case"break":e=this.plugin.settings.pomodoroBreakTime;break;case"longBreak":e=this.plugin.settings.pomodoroLongBreakTime;break}this.pomodoroTimeLeft=e*60,this.updatePomodoroDisplay()}togglePomodoroTimer(){this.pomodoroIsRunning?this.pausePomodoroTimer():this.startPomodoroTimer()}startPomodoroTimer(){this.pomodoroTimeLeft<=0&&this.initializePomodoroTimer(),this.pomodoroIsRunning=!0,this.updateStartPauseButton(),this.pomodoroTimer=setInterval(()=>{this.pomodoroTimeLeft--,this.updatePomodoroDisplay(),this.pomodoroTimeLeft<=0&&this.completePomodoroSession()},1e3)}pausePomodoroTimer(){this.pomodoroIsRunning=!1,this.pomodoroTimer&&(clearInterval(this.pomodoroTimer),this.pomodoroTimer=null),this.updateStartPauseButton()}resetPomodoroTimer(){this.pausePomodoroTimer(),this.initializePomodoroTimer(),this.updateStartPauseButton()}skipPomodoroSession(){this.pausePomodoroTimer(),this.completePomodoroSession()}completePomodoroSession(){this.pausePomodoroTimer();const e=this.plugin.settings.language==="ro";this.pomodoroMode==="work"?(this.pomodoroCompletedSessions++,this.plugin.settings.enableNotifications&&new p.Notice(e?"\u{1F345} Sesiune de lucru complet\u0103! Timp pentru o pauz\u0103.":"\u{1F345} Work session complete! Time for a break.",5e3),this.pomodoroCompletedSessions%this.plugin.settings.pomodoroSessionsBeforeLongBreak===0?(this.pomodoroMode="longBreak",this.pomodoroCurrentCycle++):this.pomodoroMode="break"):(this.plugin.settings.enableNotifications&&new p.Notice(e?"\u26A1 Pauz\u0103 terminat\u0103! \xCEnapoi la lucru.":"\u26A1 Break finished! Back to work.",5e3),this.pomodoroMode="work"),this.initializePomodoroTimer(),this.updatePomodoroModeDisplay(),this.updateStatsDisplay(),this.savePomodoroSettingsQuietly(),(this.pomodoroMode==="work"&&this.plugin.settings.pomodoroAutoStartWork||this.pomodoroMode!=="work"&&this.plugin.settings.pomodoroAutoStartBreaks)&&setTimeout(()=>{this.startPomodoroTimer()},2e3)}updatePomodoroDisplay(){const e=this.containerEl.querySelector("#timerDisplay"),t=this.containerEl.querySelector("#progressRing");if(e){const i=Math.floor(this.pomodoroTimeLeft/60),a=this.pomodoroTimeLeft%60;e.textContent=`${i.toString().padStart(2,"0")}:${a.toString().padStart(2,"0")}`}if(t){let i;switch(this.pomodoroMode){case"work":i=this.plugin.settings.pomodoroWorkTime*60;break;case"break":i=this.plugin.settings.pomodoroBreakTime*60;break;case"longBreak":i=this.plugin.settings.pomodoroLongBreakTime*60;break}const a=(i-this.pomodoroTimeLeft)/i,n=2*Math.PI*90,s=n-a*n;t.style.strokeDasharray=`${n} ${n}`,t.style.strokeDashoffset=s.toString()}this.updateStatsDisplay()}updateStartPauseButton(){const e=this.containerEl.querySelector("#startPauseBtn"),t=this.containerEl.querySelector("#startPauseIcon"),i=this.containerEl.querySelector("#startPauseText"),a=this.plugin.settings.language==="ro";e&&t&&i&&(this.pomodoroIsRunning?(t.textContent="\u23F8\uFE0F",i.textContent=a?"Pauz\u0103":"Pause",e.classList.add("running")):(t.textContent="\u25B6\uFE0F",i.textContent=a?"\xCEnceput":"Start",e.classList.remove("running")))}updatePomodoroModeDisplay(){const e=this.containerEl.querySelector("#pomodoroMode"),t=this.plugin.settings.language==="ro";if(e)switch(this.pomodoroMode){case"work":e.textContent=t?"Timp de lucru":"Work Time",e.className="pomodoro-mode work";break;case"break":e.textContent=t?"Pauz\u0103 scurt\u0103":"Short Break",e.className="pomodoro-mode break";break;case"longBreak":e.textContent=t?"Pauz\u0103 lung\u0103":"Long Break",e.className="pomodoro-mode long-break";break}}updateStatsDisplay(){const e=this.containerEl.querySelector("#completedSessions"),t=this.containerEl.querySelector("#currentCycle");e&&(e.textContent=this.pomodoroCompletedSessions.toString()),t&&(t.textContent=this.pomodoroCurrentCycle.toString())}confirmDeleteReminder(e){const t=this.reminders.find(l=>l.id===e);if(!t)return;const i=this.plugin.settings.language==="ro",a=document.querySelector(".mindfuldo-confirm-modal");a&&document.body.removeChild(a);const n=document.createElement("div");n.className="mindfuldo-confirm-modal",n.innerHTML=`
			<div class="confirm-modal-content">
				<h3>${i?"Confirmare \u0219tergere":"Confirm Delete"}</h3>
				<div class="confirm-message">
					<p>${i?"Sigur dori\u021Bi s\u0103 \u0219terge\u021Bi amintirea:":"Are you sure you want to delete the reminder:"}</p>
					<p class="task-text">"${t.text}"</p>
				</div>
				<div class="confirm-actions">
					<button id="confirmDelete" class="delete-btn">${i?"\u0218terge":"Delete"}</button>
					<button id="cancelDelete" class="cancel-btn">${i?"Anuleaz\u0103":"Cancel"}</button>
				</div>
			</div>
		`,document.body.appendChild(n);const s=n.querySelector("#confirmDelete"),o=n.querySelector("#cancelDelete"),r=()=>{document.body.contains(n)&&document.body.removeChild(n)},d=()=>{this.deleteReminder(e),r(),new p.Notice(i?"Amintirea a fost \u0219tears\u0103!":"Reminder deleted successfully!")};s==null||s.addEventListener("click",d),o==null||o.addEventListener("click",r),n.addEventListener("click",l=>{l.target===n&&r()}),n.addEventListener("keydown",l=>{l.key==="Escape"&&r()}),setTimeout(()=>s==null?void 0:s.focus(),100)}confirmDeleteHabit(e){const t=this.habits.find(l=>l.id===e);if(!t)return;const i=this.plugin.settings.language==="ro",a=document.querySelector(".mindfuldo-confirm-modal");a&&document.body.removeChild(a);const n=document.createElement("div");n.className="mindfuldo-confirm-modal",n.innerHTML=`
			<div class="confirm-modal-content">
				<h3>${i?"Confirmare \u0219tergere":"Confirm Delete"}</h3>
				<div class="confirm-message">
					<p>${i?"Sigur dori\u021Bi s\u0103 \u0219terge\u021Bi obiceiul:":"Are you sure you want to delete the habit:"}</p>
					<p class="task-text">"${t.name}"</p>
				</div>
				<div class="confirm-actions">
					<button id="confirmDelete" class="delete-btn">${i?"\u0218terge":"Delete"}</button>
					<button id="cancelDelete" class="cancel-btn">${i?"Anuleaz\u0103":"Cancel"}</button>
				</div>
			</div>
		`,document.body.appendChild(n);const s=n.querySelector("#confirmDelete"),o=n.querySelector("#cancelDelete"),r=()=>{document.body.contains(n)&&document.body.removeChild(n)},d=()=>g(this,null,function*(){yield this.deleteHabit(e),r(),new p.Notice(i?"Obiceiul a fost \u0219ters!":"Habit deleted successfully!")});s==null||s.addEventListener("click",d),o==null||o.addEventListener("click",r),n.addEventListener("click",l=>{l.target===n&&r()}),n.addEventListener("keydown",l=>{l.key==="Escape"&&r()}),setTimeout(()=>s==null?void 0:s.focus(),100)}}class q extends p.PluginSettingTab{constructor(e,t){super(e,t);this.plugin=t}display(){const{containerEl:e}=this,t=this.plugin.settings.language==="ro";e.empty(),new p.Setting(e).setName(t?"Categoria implicit\u0103":"Default Category").setDesc(t?"Categoria care va fi selectat\u0103 automat pentru task-uri noi":"Category that will be auto-selected for new tasks").addDropdown(i=>i.addOption("personal","Personal").addOption("lucru",t?"Lucru":"Work").addOption("sanatate",t?"S\u0103n\u0103tate":"Health").addOption("invatare",t?"\xCEnv\u0103\u021Bare":"Learning").addOption("hobby","Hobby").setValue(this.plugin.settings.defaultCategory).onChange(a=>g(this,null,function*(){this.plugin.settings.defaultCategory=a,yield this.plugin.saveSettings()}))),new p.Setting(e).setName(t?"Notific\u0103ri":"Notifications").setDesc(t?"Activeaz\u0103 notific\u0103rile pentru reminder-e":"Enable notifications for reminders").addToggle(i=>i.setValue(this.plugin.settings.enableNotifications).onChange(a=>g(this,null,function*(){this.plugin.settings.enableNotifications=a,yield this.plugin.saveSettings()}))),new p.Setting(e).setName(t?"Tem\u0103":"Theme").setDesc(t?"Alege\u021Bi tema de culori":"Choose color theme").addDropdown(i=>i.addOption("default","Default").addOption("ocean","Ocean (Blue-Teal)").addOption("forest","Forest (Green)").addOption("sunset","Sunset (Pink-Orange)").addOption("purple","Purple (Violet)").addOption("midnight","Midnight (Dark Blue)").setValue(this.plugin.settings.theme).onChange(a=>g(this,null,function*(){this.plugin.settings.theme=a,yield this.plugin.saveSettings()}))),new p.Setting(e).setName(t?"Numele dumneavoastr\u0103":"Your Name").setDesc(t?"Introduce\u021Bi numele pentru salut\u0103ri personalizate":"Enter your name for personalized greetings").addText(i=>i.setValue(this.plugin.settings.userName).onChange(a=>g(this,null,function*(){this.plugin.settings.userName=a,yield this.plugin.saveSettings()}))),new p.Setting(e).setName(t?"Limba":"Language").setDesc(t?"Alege\u021Bi limba aplica\u021Biei":"Choose language").addDropdown(i=>i.addOption("ro",t?"Rom\xE2n\u0103":"Romanian").addOption("en",t?"Englez\u0103":"English").setValue(this.plugin.settings.language).onChange(a=>g(this,null,function*(){this.plugin.settings.language=a,yield this.plugin.saveSettings()}))),new p.Setting(e).setName(t?"Pozi\u021Bia sidebar-ului":"Sidebar Position").setDesc(t?"Alege\u021Bi pozi\u021Bia sidebar-ului":"Choose sidebar position").addDropdown(i=>i.addOption("left",t?"St\xE2nga":"Left").addOption("right",t?"Dreapta":"Right").setValue(this.plugin.settings.sidebarPosition).onChange(a=>g(this,null,function*(){this.plugin.settings.sidebarPosition=a,yield this.plugin.saveSettings(),this.plugin.moveViewToSidebar(a)}))),new p.Setting(e).setName(t?"Auto-\u0219terge expirate":"Auto-delete Expired").setDesc(t?"\u0218terge automat reminder-urile expirate":"Automatically delete expired reminders").addToggle(i=>i.setValue(this.plugin.settings.autoDeleteExpired).onChange(a=>g(this,null,function*(){this.plugin.settings.autoDeleteExpired=a,yield this.plugin.saveSettings()}))),e.createEl("h3",{text:t?"\u{1F527} Func\u021Bionalit\u0103\u021Bi":"\u{1F527} Features"}),new p.Setting(e).setName(t?"Activeaz\u0103 Sarcini":"Enable Tasks").setDesc(t?"Afi\u0219eaz\u0103 sec\u021Biunea de sarcini \xEEn toolbar":"Show tasks section in toolbar").addToggle(i=>i.setValue(this.plugin.settings.enableTasks).onChange(a=>g(this,null,function*(){this.plugin.settings.enableTasks=a,yield this.plugin.saveSettings()}))),new p.Setting(e).setName(t?"Activeaz\u0103 Amintiri":"Enable Reminders").setDesc(t?"Afi\u0219eaz\u0103 sec\u021Biunea de amintiri \xEEn toolbar":"Show reminders section in toolbar").addToggle(i=>i.setValue(this.plugin.settings.enableReminders).onChange(a=>g(this,null,function*(){this.plugin.settings.enableReminders=a,yield this.plugin.saveSettings()}))),new p.Setting(e).setName(t?"Activeaz\u0103 Obiceiuri":"Enable Habits").setDesc(t?"Afi\u0219eaz\u0103 sec\u021Biunea de obiceiuri \xEEn toolbar":"Show habits section in toolbar").addToggle(i=>i.setValue(this.plugin.settings.enableHabits).onChange(a=>g(this,null,function*(){this.plugin.settings.enableHabits=a,yield this.plugin.saveSettings()}))),new p.Setting(e).setName(t?"Activeaz\u0103 Analytics":"Enable Analytics").setDesc(t?"Afi\u0219eaz\u0103 sec\u021Biunea de analiz\u0103 \xEEn toolbar":"Show analytics section in toolbar").addToggle(i=>i.setValue(this.plugin.settings.enableAnalytics).onChange(a=>g(this,null,function*(){this.plugin.settings.enableAnalytics=a,yield this.plugin.saveSettings()}))),new p.Setting(e).setName(t?"Activeaz\u0103 Calendar":"Enable Calendar").setDesc(t?"Afi\u0219eaz\u0103 sec\u021Biunea de calendar \xEEn toolbar":"Show calendar section in toolbar").addToggle(i=>i.setValue(this.plugin.settings.enableCalendar).onChange(a=>g(this,null,function*(){this.plugin.settings.enableCalendar=a,yield this.plugin.saveSettings()}))),new p.Setting(e).setName(t?"Activeaz\u0103 Pomodoro":"Enable Pomodoro").setDesc(t?"Afi\u0219eaz\u0103 sec\u021Biunea de Pomodoro \xEEn toolbar":"Show Pomodoro section in toolbar").addToggle(i=>i.setValue(this.plugin.settings.enablePomodoro).onChange(a=>g(this,null,function*(){this.plugin.settings.enablePomodoro=a,yield this.plugin.saveSettings()}))),e.createEl("h3",{text:t?"\u{1F345} Set\u0103ri Pomodoro":"\u{1F345} Pomodoro Settings"}),new p.Setting(e).setName(t?"Timp de lucru (minute)":"Work Time (minutes)").setDesc(t?"Durata unei sesiuni de lucru":"Duration of a work session").addSlider(i=>i.setLimits(1,60,1).setValue(this.plugin.settings.pomodoroWorkTime).setDynamicTooltip().onChange(a=>g(this,null,function*(){this.plugin.settings.pomodoroWorkTime=a,yield this.plugin.saveSettings()}))),new p.Setting(e).setName(t?"Pauz\u0103 scurt\u0103 (minute)":"Short Break (minutes)").setDesc(t?"Durata unei pauze scurte":"Duration of a short break").addSlider(i=>i.setLimits(1,30,1).setValue(this.plugin.settings.pomodoroBreakTime).setDynamicTooltip().onChange(a=>g(this,null,function*(){this.plugin.settings.pomodoroBreakTime=a,yield this.plugin.saveSettings()}))),new p.Setting(e).setName(t?"Pauz\u0103 lung\u0103 (minute)":"Long Break (minutes)").setDesc(t?"Durata unei pauze lungi":"Duration of a long break").addSlider(i=>i.setLimits(5,60,1).setValue(this.plugin.settings.pomodoroLongBreakTime).setDynamicTooltip().onChange(a=>g(this,null,function*(){this.plugin.settings.pomodoroLongBreakTime=a,yield this.plugin.saveSettings()}))),new p.Setting(e).setName(t?"Sesiuni p\xE2n\u0103 la pauza lung\u0103":"Sessions Before Long Break").setDesc(t?"Num\u0103rul de sesiuni de lucru \xEEnainte de o pauz\u0103 lung\u0103":"Number of work sessions before a long break").addSlider(i=>i.setLimits(2,8,1).setValue(this.plugin.settings.pomodoroSessionsBeforeLongBreak).setDynamicTooltip().onChange(a=>g(this,null,function*(){this.plugin.settings.pomodoroSessionsBeforeLongBreak=a,yield this.plugin.saveSettings()}))),new p.Setting(e).setName(t?"Auto-\xEEncepe pauzele":"Auto-start Breaks").setDesc(t?"\xCEncepe automat pauzele dup\u0103 sesiunile de lucru":"Automatically start breaks after work sessions").addToggle(i=>i.setValue(this.plugin.settings.pomodoroAutoStartBreaks).onChange(a=>g(this,null,function*(){this.plugin.settings.pomodoroAutoStartBreaks=a,yield this.plugin.saveSettings()}))),new p.Setting(e).setName(t?"Auto-\xEEncepe lucrul":"Auto-start Work").setDesc(t?"\xCEncepe automat sesiunile de lucru dup\u0103 pauze":"Automatically start work sessions after breaks").addToggle(i=>i.setValue(this.plugin.settings.pomodoroAutoStartWork).onChange(a=>g(this,null,function*(){this.plugin.settings.pomodoroAutoStartWork=a,yield this.plugin.saveSettings()})))}}0&&(module.exports={RelaxingTodoView,VIEW_TYPE_RELAXING_TODO});
