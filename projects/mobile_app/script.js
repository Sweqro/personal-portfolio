// Task Management
class Task {
    constructor(text, priority = 'low', dueDate = null) {
        this.id = Date.now().toString();
        this.text = text;
        this.completed = false;
        this.priority = priority;
        this.dueDate = dueDate;
        this.createdAt = new Date();
    }
}

class TaskManager {
    constructor() {
        this.tasks = [];
        this.loadTasks();
        this.setupEventListeners();
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
        const task = new Task(text, priority, dueDate);
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

        taskElement.innerHTML = `
            <div class="task-priority">
                <span class="priority-indicator"></span>
            </div>
            <input type="checkbox" ${task.completed ? 'checked' : ''}>
            <div class="task-content">
                <div class="task-text" ${task.completed ? 'class="completed"' : ''} contenteditable="true">${task.text}</div>
                <div class="task-meta">
                    ${task.dueDate ? `<span class="due-date">Due: ${new Date(task.dueDate).toLocaleDateString()}</span>` : ''}
                    <div class="task-actions">
                        <button class="priority-btn" title="Set Priority">
                            <i class="fas fa-flag"></i>
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

    renderTasks() {
        const taskList = document.querySelector('.task-list');
        taskList.innerHTML = '';
        this.tasks.forEach(task => {
            taskList.appendChild(this.createTaskElement(task));
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
}

// Initialize Task Manager
document.addEventListener('DOMContentLoaded', () => {
    const taskManager = new TaskManager();
});
