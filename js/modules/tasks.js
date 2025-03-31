import { db, fetchTasks, completeTask } from '../services/api.js';
import { currentUser } from './auth.js';
import { formatDate, getPriorityText } from '../utils/ui-utils.js';
import { loadDashboard } from './dashboard.js';

// DOM Elements
const tasksList = document.getElementById('tasks-list');
const filterBtns = document.querySelectorAll('.filter-btn');
const taskViewModal = document.getElementById('task-view-modal');
const viewTaskTitle = document.getElementById('view-task-title');
const viewTaskDescription = document.getElementById('view-task-description');
const viewTaskDeadline = document.getElementById('view-task-deadline');
const viewTaskAssignee = document.getElementById('view-task-assignee');
const viewTaskPriority = document.getElementById('view-task-priority');
const viewTaskStatus = document.getElementById('view-task-status');
const completeTaskBtn = document.getElementById('complete-task-btn');

function loadTasks() {
    if (!currentUser) return;

    // Clear tasks list
    tasksList.innerHTML = '';

    // Get tasks for current user
    const userTasks = db.tasks.filter(task => task.assigneeId === currentUser._id);

    if (userTasks.length === 0) {
        tasksList.innerHTML = '<p class="no-data">Nessun lavoro assegnato.</p>';
        return;
    }

    // Render tasks
    userTasks.forEach(task => {
        const taskCard = document.createElement('div');
        taskCard.className = `task-card ${task.status === 'completed' ? 'completed' : ''}`;
        taskCard.dataset.id = task._id;
        taskCard.dataset.status = task.status;

        const priorityClass = `priority-${task.priority}`;
        const statusClass = `status-${task.status}`;

        taskCard.innerHTML = `
            <div class="task-priority ${priorityClass}"></div>
            <h3>${task.title}</h3>
            <p>${task.description.substring(0, 100)}${task.description.length > 100 ? '...' : ''}</p>
            <div class="task-meta">
                <span>Scadenza: ${formatDate(task.deadline)}</span>
                <span class="task-status ${statusClass}">${task.status === 'pending' ? 'In Corso' : 'Completato'}</span>
            </div>
        `;

        taskCard.addEventListener('click', () => {
            openTaskViewModal(task);
        });

        tasksList.appendChild(taskCard);
    });
}

function filterTasks(filter) {
    // Update active filter button
    filterBtns.forEach(btn => {
        if (btn.getAttribute('data-filter') === filter) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Filter tasks
    const taskCards = document.querySelectorAll('.task-card');
    
    if (filter === 'all') {
        taskCards.forEach(card => {
            card.style.display = 'block';
        });
    } else {
        taskCards.forEach(card => {
            if (card.dataset.status === filter) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }
}

function openTaskViewModal(task) {
    const assignee = db.users.find(user => user._id === task.assigneeId);

    viewTaskTitle.textContent = task.title;
    viewTaskDescription.textContent = task.description;
    viewTaskDeadline.textContent = formatDate(task.deadline);
    viewTaskAssignee.textContent = assignee ? assignee.name : 'N/A';
    viewTaskPriority.textContent = getPriorityText(task.priority);
    viewTaskStatus.textContent = task.status === 'pending' ? 'In Corso' : 'Completato';

    // Show/hide complete button based on task status and ownership
    if (currentUser && task.assigneeId === currentUser._id && task.status === 'pending') {
        completeTaskBtn.style.display = 'block';
        completeTaskBtn.onclick = async () => {
            await handleCompleteTask(task._id);
        };
    } else {
        completeTaskBtn.style.display = 'none';
    }

    // Show modal
    taskViewModal.style.display = 'flex';
}

async function handleCompleteTask(taskId) {
    try {
        await completeTask(taskId);
        
        // Close modal and refresh tasks
        document.querySelector('.close-modal').click();
        await fetchTasks();
        loadTasks();
        loadDashboard();
    } catch (error) {
        alert(`Errore: ${error.message}`);
    }
}

function initTasks() {
    // Task filters
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');
            filterTasks(filter);
        });
    });
    
    // Listen for user login event
    document.addEventListener('user-logged-in', loadTasks);
}

export {
    loadTasks,
    filterTasks,
    openTaskViewModal,
    initTasks
};