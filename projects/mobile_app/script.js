// Task Management
class Task {
    constructor(text, priority = 'low', dueDate = null, category = 'default') {
        this.id = Date.now().toString();
        this.text = text;
        this.completed = false;
        this.priority = priority;
        this.dueDate = dueDate;
        this.category = category;
        this.createdAt = new Date();
    }
}

class TaskManager {
    constructor() {
        this.tasks = [];
        this.categories = ['All', 'Personal', 'Work', 'Shopping', 'Health'];
        this.currentFilter = {
            category: 'All',
            priority: 'all',
            search: '',
            status: 'all' // all, active, completed
        };
        this.loadTasks();
        this.setupEventListeners();
        this.initializeCategories();
        this.addSearchAndFilter();
    }

    loadTasks() {
        const savedTasks = localStorage.getItem('tasks');
        this.tasks = savedTasks ? JSON.parse(savedTasks) : [];
        this.renderTasks();
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    addTask(text, priority = 'low', dueDate = null) {
        const category = this.currentFilter.category === 'All' ? 'Personal' : this.currentFilter.category;
        const task = new Task(text, priority, dueDate, category);
        this.tasks.unshift(task);
        this.saveTasks();
        this.renderTasks();
    }

    deleteTask(taskId) {
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        this.saveTasks();
        this.renderTasks();
    }

    toggleTaskComplete(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderTasks();
        }
    }

    updateTaskText(taskId, newText) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.text = newText;
            this.saveTasks();
        }
    }

    updateTaskPriority(taskId, priority) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.priority = priority;
            this.saveTasks();
            this.renderTasks();
        }
    }

    updateTaskDueDate(taskId, dueDate) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.dueDate = dueDate;
            this.saveTasks();
            this.renderTasks();
        }
    }

    createTaskElement(task) {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-item';
        taskElement.setAttribute('data-task-id', task.id);
        taskElement.setAttribute('data-priority', task.priority);
        taskElement.setAttribute('data-category', task.category);

        taskElement.innerHTML = `
            <div class="task-priority">
                <span class="priority-indicator"></span>
            </div>
            <input type="checkbox" ${task.completed ? 'checked' : ''}>
            <div class="task-content">
                <div class="task-text" ${task.completed ? 'class="completed"' : ''} contenteditable="true">${task.text}</div>
                <div class="task-meta">
                    <div class="task-info">
                        ${task.dueDate ? `<span class="due-date">Due: ${new Date(task.dueDate).toLocaleDateString()}</span>` : ''}
                        <span class="category-tag">${task.category}</span>
                    </div>
                    <div class="task-actions">
                        <button class="priority-btn" title="Set Priority">
                            <i class="fas fa-flag"></i>
                        </button>
                        <button class="category-btn" title="Change Category">
                            <i class="fas fa-tag"></i>
                        </button>
                        <button class="date-btn" title="Set Due Date">
                            <i class="fas fa-calendar"></i>
                        </button>
                        <button class="delete-btn" title="Delete Task">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        return taskElement;
    }

    initializeCategories() {
        const categoriesContainer = document.querySelector('.categories');
        categoriesContainer.innerHTML = this.categories.map(category => `
            <button class="category ${category === 'All' ? 'active' : ''}" data-category="${category}">
                ${category}
            </button>
        `).join('');

        // Add new category button
        const addCategoryBtn = document.createElement('button');
        addCategoryBtn.className = 'category add-category';
        addCategoryBtn.innerHTML = '<i class="fas fa-plus"></i>';
        categoriesContainer.appendChild(addCategoryBtn);

        // Category click handler
        categoriesContainer.addEventListener('click', (e) => {
            const categoryBtn = e.target.closest('.category');
            if (!categoryBtn) return;

            if (categoryBtn.classList.contains('add-category')) {
                this.showAddCategoryDialog();
                return;
            }

            document.querySelectorAll('.category').forEach(btn => btn.classList.remove('active'));
            categoryBtn.classList.add('active');
            this.currentFilter.category = categoryBtn.dataset.category;
            this.renderTasks();
        });
    }

    showAddCategoryDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'modal';
        dialog.innerHTML = `
            <div class="modal-content">
                <h3>Add New Category</h3>
                <input type="text" class="category-input" placeholder="Category name">
                <div class="modal-actions">
                    <button class="cancel-btn">Cancel</button>
                    <button class="save-btn">Save</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        const input = dialog.querySelector('.category-input');
        const saveBtn = dialog.querySelector('.save-btn');
        const cancelBtn = dialog.querySelector('.cancel-btn');

        input.focus();

        saveBtn.addEventListener('click', () => {
            const categoryName = input.value.trim();
            if (categoryName && !this.categories.includes(categoryName)) {
                this.categories.push(categoryName);
                this.initializeCategories();
                localStorage.setItem('categories', JSON.stringify(this.categories));
            }
            dialog.remove();
        });

        cancelBtn.addEventListener('click', () => dialog.remove());
    }

    addSearchAndFilter() {
        const filterContainer = document.createElement('div');
        filterContainer.className = 'filter-container';
        filterContainer.innerHTML = `
            <div class="search-box">
                <input type="text" class="search-input" placeholder="Search tasks...">
                <i class="fas fa-search"></i>
            </div>
            <div class="filter-options">
                <select class="priority-filter">
                    <option value="all">All Priorities</option>
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                </select>
                <select class="status-filter">
                    <option value="all">All Tasks</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                </select>
            </div>
        `;

        const taskInput = document.querySelector('.task-input-container');
        taskInput.parentNode.insertBefore(filterContainer, taskInput);

        // Search handler
        const searchInput = filterContainer.querySelector('.search-input');
        searchInput.addEventListener('input', (e) => {
            this.currentFilter.search = e.target.value.toLowerCase();
            this.renderTasks();
        });

        // Priority filter handler
        const priorityFilter = filterContainer.querySelector('.priority-filter');
        priorityFilter.addEventListener('change', (e) => {
            this.currentFilter.priority = e.target.value;
            this.renderTasks();
        });

        // Status filter handler
        const statusFilter = filterContainer.querySelector('.status-filter');
        statusFilter.addEventListener('change', (e) => {
            this.currentFilter.status = e.target.value;
            this.renderTasks();
        });
    }

    filterTasks() {
        return this.tasks.filter(task => {
            const matchesCategory = this.currentFilter.category === 'All' || task.category === this.currentFilter.category;
            const matchesPriority = this.currentFilter.priority === 'all' || task.priority === this.currentFilter.priority;
            const matchesSearch = task.text.toLowerCase().includes(this.currentFilter.search);
            const matchesStatus = this.currentFilter.status === 'all' || 
                (this.currentFilter.status === 'completed' && task.completed) ||
                (this.currentFilter.status === 'active' && !task.completed);

            return matchesCategory && matchesPriority && matchesSearch && matchesStatus;
        });
    }

    setupEventListeners() {
        const taskList = document.querySelector('.task-list');
        const addTaskBtn = document.querySelector('.add-task-btn');
        const addTaskInput = document.querySelector('.add-task-input');

        addTaskBtn.addEventListener('click', () => {
            const text = addTaskInput.value.trim();
            if (text) {
                this.addTask(text);
                addTaskInput.value = '';
            }
        });

        addTaskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const text = addTaskInput.value.trim();
                if (text) {
                    this.addTask(text);
                    addTaskInput.value = '';
                }
            }
        });

        taskList.addEventListener('click', (e) => {
            const taskItem = e.target.closest('.task-item');
            if (!taskItem) return;

            const taskId = taskItem.dataset.taskId;

            if (e.target.type === 'checkbox') {
                this.toggleTaskComplete(taskId);
            } else if (e.target.closest('.delete-btn')) {
                this.deleteTask(taskId);
            } else if (e.target.closest('.priority-btn')) {
                this.showPriorityMenu(taskId, e);
            } else if (e.target.closest('.date-btn')) {
                this.showDatePicker(taskId);
            } else if (e.target.closest('.category-btn')) {
                this.showCategoryMenu(taskId, e);
            }
        });

        taskList.addEventListener('focusout', (e) => {
            if (e.target.classList.contains('task-text')) {
                const taskItem = e.target.closest('.task-item');
                const taskId = taskItem.dataset.taskId;
                this.updateTaskText(taskId, e.target.innerText.trim());
            }
        });
    }

    showPriorityMenu(taskId, event) {
        const existingMenu = document.querySelector('.priority-menu');
        if (existingMenu) existingMenu.remove();

        const menu = document.createElement('div');
        menu.className = 'priority-menu';
        menu.innerHTML = `
            <button data-priority="high">High Priority</button>
            <button data-priority="medium">Medium Priority</button>
            <button data-priority="low">Low Priority</button>
        `;

        document.body.appendChild(menu);

        const rect = event.target.getBoundingClientRect();
        menu.style.top = `${rect.bottom + window.scrollY + 5}px`;
        menu.style.left = `${rect.left + window.scrollX}px`;

        menu.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (button) {
                const priority = button.dataset.priority;
                this.updateTaskPriority(taskId, priority);
                menu.remove();
            }
        });

        document.addEventListener('click', (e) => {
            if (!menu.contains(e.target) && !event.target.contains(e.target)) {
                menu.remove();
            }
        }, { once: true });
    }

    showDatePicker(taskId) {
        const existingPicker = document.querySelector('.date-picker');
        if (existingPicker) existingPicker.remove();

        const picker = document.createElement('div');
        picker.className = 'date-picker';
        picker.innerHTML = `
            <div class="date-picker-header">
                <h3>Set Due Date</h3>
                <button class="close-picker">&times;</button>
            </div>
            <input type="date" class="date-input">
            <div class="quick-dates">
                <button data-days="1">Tomorrow</button>
                <button data-days="7">Next Week</button>
                <button data-days="30">Next Month</button>
            </div>
        `;

        document.body.appendChild(picker);

        const dateInput = picker.querySelector('.date-input');
        const task = this.tasks.find(t => t.id === taskId);
        if (task.dueDate) {
            dateInput.value = new Date(task.dueDate).toISOString().split('T')[0];
        }

        picker.addEventListener('click', (e) => {
            if (e.target.classList.contains('close-picker')) {
                picker.remove();
            }

            const quickDateBtn = e.target.closest('.quick-dates button');
            if (quickDateBtn) {
                const days = parseInt(quickDateBtn.dataset.days);
                const date = new Date();
                date.setDate(date.getDate() + days);
                this.updateTaskDueDate(taskId, date.toISOString());
                picker.remove();
            }
        });

        dateInput.addEventListener('change', () => {
            this.updateTaskDueDate(taskId, new Date(dateInput.value).toISOString());
            picker.remove();
        });
    }

    showCategoryMenu(taskId, event) {
        const existingMenu = document.querySelector('.category-menu');
        if (existingMenu) existingMenu.remove();

        const menu = document.createElement('div');
        menu.className = 'category-menu';
        menu.innerHTML = this.categories
            .filter(category => category !== 'All')
            .map(category => `<button data-category="${category}">${category}</button>`)
            .join('');

        document.body.appendChild(menu);

        const rect = event.target.getBoundingClientRect();
        menu.style.top = `${rect.bottom + window.scrollY + 5}px`;
        menu.style.left = `${rect.left + window.scrollX}px`;

        menu.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (button) {
                const category = button.dataset.category;
                const task = this.tasks.find(t => t.id === taskId);
                if (task) {
                    task.category = category;
                    this.saveTasks();
                    this.renderTasks();
                }
                menu.remove();
            }
        });

        document.addEventListener('click', (e) => {
            if (!menu.contains(e.target) && !event.target.contains(e.target)) {
                menu.remove();
            }
        }, { once: true });
    }

    renderTasks() {
        const taskList = document.querySelector('.task-list');
        taskList.innerHTML = '';
        
        const filteredTasks = this.filterTasks();
        if (filteredTasks.length === 0) {
            taskList.innerHTML = `
                <div class="no-tasks">
                    <i class="fas fa-tasks"></i>
                    <p>No tasks found</p>
                </div>
            `;
            return;
        }

        filteredTasks.forEach(task => {
            taskList.appendChild(this.createTaskElement(task));
        });
    }
}

// Drag and Drop Handlers
let draggedItem = null;

function handleDragStart(e) {
    draggedItem = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    draggedItem = null;
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleDrop(e) {
    e.preventDefault();
    if (draggedItem === this) return;

    const taskList = document.getElementById('taskList');
    const tasks = [...taskList.querySelectorAll('.task-item')];
    const draggedIndex = tasks.indexOf(draggedItem);
    const droppedIndex = tasks.indexOf(this);

    if (draggedIndex < droppedIndex) {
        this.parentNode.insertBefore(draggedItem, this.nextSibling);
    } else {
        this.parentNode.insertBefore(draggedItem, this);
    }
}

// State Management
let currentView = 'all';
let currentFilter = 'all';

// DOM Elements
const taskList = document.getElementById('taskList');
const addTaskBtn = document.querySelector('.add-task-btn');
const themeToggle = document.getElementById('themeToggle');
const filterBtn = document.querySelector('.filter-btn');
const categories = document.querySelectorAll('.category');

// Theme Management
function toggleTheme() {
    document.body.dataset.theme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', document.body.dataset.theme);
    updateThemeIcon();
}

function updateThemeIcon() {
    const icon = themeToggle.querySelector('i');
    if (icon) {
        icon.className = document.body.dataset.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// Task Management
function createTask(text = 'New Task', priority = 'medium', dueDate = 'Today') {
    const taskId = `task-${Date.now()}`;
    const taskItem = document.createElement('div');
    taskItem.className = 'task-item';
    taskItem.setAttribute('draggable', 'true');
    taskItem.dataset.priority = priority;

    taskItem.innerHTML = `
        <div class="task-priority">
            <span class="priority-indicator"></span>
        </div>
        <div class="task-checkbox">
            <input type="checkbox" id="${taskId}">
            <label for="${taskId}"></label>
        </div>
        <div class="task-content">
            <span class="task-text" contenteditable="true">${text}</span>
            <div class="task-meta">
                <span class="task-date"><i class="far fa-calendar"></i> ${dueDate}</span>
                <div class="task-actions">
                    <button class="priority-btn" title="Set Priority">
                        <i class="fas fa-flag"></i>
                    </button>
                    <button class="schedule-btn" title="Schedule">
                        <i class="far fa-clock"></i>
                    </button>
                    <button class="delete-btn" title="Delete">
                        <i class="far fa-trash-alt"></i>
                    </button>
                </div>
            </div>
        </div>
    `;

    // Add event listeners
    const checkbox = taskItem.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', () => {
        taskItem.classList.toggle('completed', checkbox.checked);
        updateProgress();
        updateTaskVisibility();
        updateTaskCounts();
    });

    const deleteBtn = taskItem.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => {
        taskItem.remove();
        updateProgress();
        updateTaskCounts();
    });

    const priorityBtn = taskItem.querySelector('.priority-btn');
    priorityBtn.addEventListener('click', () => showPriorityMenu(priorityBtn));

    const scheduleBtn = taskItem.querySelector('.schedule-btn');
    scheduleBtn.addEventListener('click', () => showScheduleMenu(scheduleBtn));

    // Add drag and drop listeners
    taskItem.addEventListener('dragstart', handleDragStart);
    taskItem.addEventListener('dragend', handleDragEnd);
    taskItem.addEventListener('dragover', handleDragOver);
    taskItem.addEventListener('drop', handleDrop);

    return taskItem;
}

// Progress Management
function updateProgress() {
    const totalTasks = document.querySelectorAll('.task-item').length;
    const completedTasks = document.querySelectorAll('.task-item.completed').length;
    const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-percent');

    if (progressFill) {
        progressFill.style.width = `${progressPercent}%`;
    }
    if (progressText) {
        progressText.textContent = `${progressPercent}%`;
    }
}

// Task Count Management
function updateTaskCounts() {
    const totalTasks = document.querySelectorAll('.task-item').length;
    const headerCount = document.querySelector('.header-left .task-count');
    if (headerCount) {
        headerCount.textContent = `${totalTasks} task${totalTasks !== 1 ? 's' : ''}`;
    }

    // Update category counts
    const allCount = document.querySelectorAll('.task-item').length;
    const importantCount = document.querySelectorAll('.task-item[data-priority="high"]').length;
    const scheduledCount = Array.from(document.querySelectorAll('.task-item')).filter(task => {
        const dateText = task.querySelector('.task-date').textContent;
        return dateText && !dateText.includes('Today');
    }).length;

    // Update counts in category tabs
    document.querySelectorAll('.category').forEach(category => {
        const countSpan = category.querySelector('.task-count');
        if (countSpan) {
            if (category.textContent.includes('All')) {
                countSpan.textContent = allCount;
            } else if (category.textContent.includes('Important')) {
                countSpan.textContent = importantCount;
            } else if (category.textContent.includes('Scheduled')) {
                countSpan.textContent = scheduledCount;
            }
        }
    });
}

// View Management
function updateTaskVisibility() {
    const tasks = document.querySelectorAll('.task-item');
    tasks.forEach(task => {
        let visible = true;

        // View filtering
        switch(currentView) {
            case 'important':
                visible = task.dataset.priority === 'high';
                break;
            case 'scheduled':
                const dateText = task.querySelector('.task-date').textContent;
                visible = !dateText.includes('Today');
                break;
        }

        // Filter state
        if (visible && currentFilter !== 'all') {
            const isCompleted = task.classList.contains('completed');
            visible = (currentFilter === 'completed') === isCompleted;
        }

        task.style.display = visible ? 'flex' : 'none';
    });

    updateTaskCounts();
}

// Show Filter Menu
function handleFilterClick(e) {
    const filterBtn = e.currentTarget;
    const menu = document.querySelector('.filter-menu');
    if (!menu) return;
    
    // Toggle menu visibility
    const isVisible = menu.style.display === 'block';
    menu.style.display = isVisible ? 'none' : 'block';
    
    if (!isVisible) {
        // Position the menu below the button
        const buttonRect = filterBtn.getBoundingClientRect();
        menu.style.position = 'absolute';
        menu.style.top = `${buttonRect.bottom + 5}px`;
        menu.style.right = '20px';
        
        // Handle clicking outside
        const closeMenu = (event) => {
            if (!menu.contains(event.target) && !filterBtn.contains(event.target)) {
                menu.style.display = 'none';
                document.removeEventListener('click', closeMenu);
            }
        };
        
        setTimeout(() => {
            document.addEventListener('click', closeMenu);
        }, 0);
    }
}

// Filter button
const filterBtn = document.querySelector('.filter-btn');
if (filterBtn) {
    filterBtn.removeEventListener('click', handleFilterClick); // Remove any existing listener
    filterBtn.addEventListener('click', handleFilterClick);
    
    // Set up filter menu item clicks
    const filterMenu = document.querySelector('.filter-menu');
    if (filterMenu) {
        filterMenu.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
                currentFilter = btn.dataset.filter;
                
                // Update main filter button icon
                const filterIcon = filterBtn.querySelector('i');
                if (filterIcon) {
                    filterIcon.className = btn.querySelector('i').className;
                }
                
                updateTaskVisibility();
                filterMenu.style.display = 'none';
            });
        });
    }
}

// Priority Menu
function showPriorityMenu(button) {
    const menu = document.querySelector('.priority-menu');
    if (!menu) return;
    
    menu.style.display = 'block';
    
    const buttonRect = button.getBoundingClientRect();
    menu.style.top = `${buttonRect.top - menu.offsetHeight - 10}px`;
    menu.style.left = `${buttonRect.left - menu.offsetWidth + buttonRect.width}px`;

    const priorityButtons = menu.querySelectorAll('button');
    priorityButtons.forEach(btn => {
        btn.onclick = () => {
            const taskItem = button.closest('.task-item');
            taskItem.dataset.priority = btn.dataset.priority;
            menu.style.display = 'none';
            updateTaskVisibility();
            updateTaskCounts();
        };
    });

    // Close menu when clicking outside
    const closeMenu = (e) => {
        if (!menu.contains(e.target) && !button.contains(e.target)) {
            menu.style.display = 'none';
            document.removeEventListener('click', closeMenu);
        }
    };
    
    // Remove any existing listener before adding a new one
    document.removeEventListener('click', closeMenu);
    // Add the click listener with a slight delay to prevent immediate triggering
    setTimeout(() => {
        document.addEventListener('click', closeMenu);
    }, 0);
}

// Schedule Menu
function showScheduleMenu(button) {
    const menu = document.querySelector('.schedule-menu');
    if (!menu) return;
    
    menu.style.display = 'block';
    
    const buttonRect = button.getBoundingClientRect();
    menu.style.top = `${buttonRect.top - menu.offsetHeight - 10}px`;
    menu.style.left = `${buttonRect.left - menu.offsetWidth + buttonRect.width}px`;

    const dateButtons = menu.querySelectorAll('.quick-dates button');
    dateButtons.forEach(btn => {
        btn.onclick = () => {
            const taskDate = button.closest('.task-meta').querySelector('.task-date');
            taskDate.innerHTML = `<i class="far fa-calendar"></i> ${btn.textContent}`;
            menu.style.display = 'none';
            updateTaskVisibility();
            updateTaskCounts();
        };
    });

    const customDateInput = menu.querySelector('input[type="date"]');
    if (customDateInput) {
        customDateInput.onchange = () => {
            const taskDate = button.closest('.task-meta').querySelector('.task-date');
            const date = new Date(customDateInput.value);
            const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            taskDate.innerHTML = `<i class="far fa-calendar"></i> ${formattedDate}`;
            menu.style.display = 'none';
            updateTaskVisibility();
            updateTaskCounts();
        };
    }

    // Close menu when clicking outside
    const closeMenu = (e) => {
        if (!menu.contains(e.target) && !button.contains(e.target)) {
            menu.style.display = 'none';
            document.removeEventListener('click', closeMenu);
        }
    };
    
    // Remove any existing listener before adding a new one
    document.removeEventListener('click', closeMenu);
    // Add the click listener with a slight delay to prevent immediate triggering
    setTimeout(() => {
        document.addEventListener('click', closeMenu);
    }, 0);
}

// Initialize everything when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize DOM elements
    const taskList = document.getElementById('taskList');
    const addTaskBtn = document.querySelector('.add-task-btn');
    const themeToggle = document.getElementById('themeToggle');
    const filterBtn = document.querySelector('.filter-btn');
    const categories = document.querySelectorAll('.category');

    // Initialize state
    let currentView = 'all';
    let currentFilter = 'all';

    // Theme initialization
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.dataset.theme = savedTheme;
    updateThemeIcon();
    themeToggle.addEventListener('click', toggleTheme);

    // Add Task Button
    if (addTaskBtn && taskList) {
        addTaskBtn.addEventListener('click', () => {
            const newTask = createTask();
            taskList.appendChild(newTask);
            
            // Focus and select text
            const textElement = newTask.querySelector('.task-text');
            if (textElement) {
                textElement.focus();
                const range = document.createRange();
                range.selectNodeContents(textElement);
                const selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(range);
            }

            updateProgress();
            updateTaskVisibility();
            updateTaskCounts();
        });
    }

    // Category tabs
    categories.forEach(category => {
        category.addEventListener('click', () => {
            categories.forEach(c => c.classList.remove('active'));
            category.classList.add('active');
            
            if (category.textContent.includes('All')) {
                currentView = 'all';
            } else if (category.textContent.includes('Important')) {
                currentView = 'important';
            } else if (category.textContent.includes('Scheduled')) {
                currentView = 'scheduled';
            }
            
            updateTaskVisibility();
        });
    });

    // Filter button
    if (filterBtn) {
        filterBtn.addEventListener('click', handleFilterClick);
    }

    // Set initial states
    updateProgress();
    updateTaskVisibility();
    updateTaskCounts();
    document.querySelector('.category').classList.add('active');

    // Initialize Task Manager
    const taskManager = new TaskManager();
});
