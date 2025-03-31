import { db } from '../services/api.js';
import { currentUser } from './auth.js';

// Dashboard stats
const assignedTasksEl = document.getElementById('assigned-tasks');
const completedTasksEl = document.getElementById('completed-tasks');
const totalPointsEl = document.getElementById('total-points');
const rankingPositionEl = document.getElementById('ranking-position');

function loadDashboard() {
    if (!currentUser) return;

    // Count assigned tasks
    const assignedTasks = db.tasks.filter(task => task.assigneeId === currentUser._id);
    const completedTasks = assignedTasks.filter(task => task.status === 'completed');
    
    assignedTasksEl.textContent = assignedTasks.length;
    completedTasksEl.textContent = completedTasks.length;
    totalPointsEl.textContent = currentUser.points;

    // Calculate ranking position
    const sortedUsers = [...db.users].sort((a, b) => b.points - a.points);
    const rankingPosition = sortedUsers.findIndex(user => user._id === currentUser._id) + 1;
    rankingPositionEl.textContent = rankingPosition;
}

function initDashboard() {
    // Listen for user login event
    document.addEventListener('user-logged-in', loadDashboard);
}

export {
    loadDashboard,
    initDashboard
};