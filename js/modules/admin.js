import { db, fetchUsers, fetchTasks, fetchPointsHistory, saveUser, deleteUser, saveTask, deleteTask, assignPoints, setEmployeeOfMonth } from '../services/api.js';
import { formatDate, getMonthName } from '../utils/ui-utils.js';
import { closeAllModals } from '../app.js';

// DOM Elements - Admin Panel
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const addUserBtn = document.getElementById('add-user-btn');
const addTaskBtn = document.getElementById('add-task-btn');
const usersList = document.getElementById('users-list');
const adminTasksList = document.getElementById('admin-tasks-list');
const pointsUserSelect = document.getElementById('points-user');
const pointsAmountInput = document.getElementById('points-amount');
const pointsReasonInput = document.getElementById('points-reason');
const assignPointsBtn = document.getElementById('assign-points-btn');
const pointsHistoryList = document.getElementById('points-history-list');
const userModal = document.getElementById('user-modal');
const userNameInput = document.getElementById('user-name');
const userUsernameInput = document.getElementById('user-username');
const userPasswordInput = document.getElementById('user-password');
const userRoleSelect = document.getElementById('user-role');
const saveUserBtn = document.getElementById('save-user-btn');
const taskModal = document.getElementById('task-modal');
const taskTitleInput = document.getElementById('task-title');
const taskDescriptionInput = document.getElementById('task-description');
const taskDeadlineInput = document.getElementById('task-deadline');
const taskAssigneeSelect = document.getElementById('task-assignee');
const taskPrioritySelect = document.getElementById('task-priority');
const saveTaskBtn = document.getElementById('save-task-btn');
const employeeSelect = document.getElementById('employee-select');
const reasonTextarea = document.getElementById('reason-textarea');
const monthSelect = document.getElementById('month-select');
const yearSelect = document.getElementById('year-select');
const setEmployeeBtn = document.getElementById('set-employee-btn');

// Show tab content
function showTab(tabId) {
    tabBtns.forEach(btn => {
        if (btn.getAttribute('data-tab') === tabId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    tabContents.forEach(content => {
        if (content.id === `${tabId}-tab`) {
            content.style.display = 'block';
        } else {
            content.style.display = 'none';
        }
    });
}

// Load users list
function loadUsers() {
    if (!usersList) {
        console.error('Users list element not found');
        return;
    }
    
    usersList.innerHTML = '';
    
    if (db.users.length === 0) {
        usersList.innerHTML = '<p class="no-data">Nessun utente trovato.</p>';
        return;
    }
    
    db.users.forEach(user => {
        const userCard = document.createElement('div');
        userCard.className = 'user-card';
        userCard.innerHTML = `
            <div class="user-info">
                <h3>${user.name}</h3>
                <p>Username: ${user.username}</p>
                <p>Ruolo: ${user.role === 'admin' ? 'Amministratore' : 'Utente'}</p>
                <p>Punti: ${user.points}</p>
            </div>
            <div class="user-actions">
                <button class="edit-btn" data-id="${user._id}"><i class="fas fa-edit"></i></button>
                <button class="delete-btn" data-id="${user._id}"><i class="fas fa-trash"></i></button>
            </div>
        `;
        
        // Edit user
        userCard.querySelector('.edit-btn').addEventListener('click', () => {
            openUserModal(user);
        });
        
        // Delete user
        userCard.querySelector('.delete-btn').addEventListener('click', () => {
            if (confirm(`Sei sicuro di voler eliminare l'utente ${user.name}?`)) {
                handleDeleteUser(user._id);
            }
        });
        
        usersList.appendChild(userCard);
    });
    
    // Update user select in points assignment
    if (pointsUserSelect) {
        pointsUserSelect.innerHTML = '';
        db.users.filter(user => user.role !== 'admin').forEach(user => {
            const option = document.createElement('option');
            option.value = user._id;
            option.textContent = user.name;
            pointsUserSelect.appendChild(option);
        });
    }
    
    // Update employee select in employee of month
    if (employeeSelect) {
        employeeSelect.innerHTML = '';
        db.users.filter(user => user.role !== 'admin').forEach(user => {
            const option = document.createElement('option');
            option.value = user._id;
            option.textContent = user.name;
            employeeSelect.appendChild(option);
        });
    }
}

// Load admin tasks
function loadAdminTasks() {
    if (!adminTasksList) {
        console.error('Admin tasks list element not found');
        return;
    }
    
    adminTasksList.innerHTML = '';
    
    if (db.tasks.length === 0) {
        adminTasksList.innerHTML = '<p class="no-data">Nessun lavoro trovato.</p>';
        return;
    }
    
    db.tasks.forEach(task => {
        const assignee = db.users.find(user => user._id === task.assigneeId);
        
        const taskCard = document.createElement('div');
        taskCard.className = `task-card ${task.status === 'completed' ? 'completed' : ''}`;
        
        const priorityClass = `priority-${task.priority}`;
        
        taskCard.innerHTML = `
            <div class="task-priority ${priorityClass}"></div>
            <h3>${task.title}</h3>
            <p>${task.description.substring(0, 100)}${task.description.length > 100 ? '...' : ''}</p>
            <div class="task-meta">
                <span>Scadenza: ${formatDate(task.deadline)}</span>
                <span>Assegnato a: ${assignee ? assignee.name : 'N/A'}</span>
                <span class="task-status status-${task.status}">${task.status === 'pending' ? 'In Corso' : 'Completato'}</span>
            </div>
            <div class="task-actions">
                <button class="edit-btn" data-id="${task._id}"><i class="fas fa-edit"></i></button>
                <button class="delete-btn" data-id="${task._id}"><i class="fas fa-trash"></i></button>
            </div>
        `;
        
        // Edit task
        taskCard.querySelector('.edit-btn').addEventListener('click', () => {
            openTaskModal(task);
        });
        
        // Delete task
        taskCard.querySelector('.delete-btn').addEventListener('click', () => {
            if (confirm(`Sei sicuro di voler eliminare il lavoro "${task.title}"?`)) {
                handleDeleteTask(task._id);
            }
        });
        
        adminTasksList.appendChild(taskCard);
    });
    
    // Update task assignee select
    if (taskAssigneeSelect) {
        taskAssigneeSelect.innerHTML = '';
        db.users.filter(user => user.role !== 'admin').forEach(user => {
            const option = document.createElement('option');
            option.value = user._id;
            option.textContent = user.name;
            taskAssigneeSelect.appendChild(option);
        });
    }
}

// Load points history
function loadPointsHistory() {
    if (!pointsHistoryList) {
        console.error('Points history list element not found');
        return;
    }
    
    pointsHistoryList.innerHTML = '';
    
    if (db.pointsHistory.length === 0) {
        pointsHistoryList.innerHTML = '<p class="no-data">Nessuna assegnazione di punti trovata.</p>';
        return;
    }
    
    db.pointsHistory.forEach(points => {
        const user = db.users.find(u => u._id === points.userId);
        
        const pointsItem = document.createElement('div');
        pointsItem.className = 'points-item';
        pointsItem.innerHTML = `
            <div class="points-info">
                <p><strong>${user ? user.name : 'Utente sconosciuto'}</strong> ha ricevuto <strong>${points.points} punti</strong></p>
                <p>Motivo: ${points.reason}</p>
                <p class="points-date">Data: ${formatDate(points.date)}</p>
            </div>
        `;
        
        pointsHistoryList.appendChild(pointsItem);
    });
}

// Open user modal
function openUserModal(user = null) {
    if (!userModal) {
        console.error('User modal element not found');
        return;
    }
    
    if (user) {
        userNameInput.value = user.name;
        userUsernameInput.value = user.username;
        userPasswordInput.value = user.password;
        userRoleSelect.value = user.role;
        saveUserBtn.dataset.id = user._id;
    } else {
        userNameInput.value = '';
        userUsernameInput.value = '';
        userPasswordInput.value = '';
        userRoleSelect.value = 'user';
        saveUserBtn.dataset.id = '';
    }
    
    // Aggiungiamo un controllo per verificare che gli elementi del form esistano
    console.log('Form elements check:', {
        nameInput: userNameInput ? 'exists' : 'missing',
        usernameInput: userUsernameInput ? 'exists' : 'missing',
        passwordInput: userPasswordInput ? 'exists' : 'missing',
        roleSelect: userRoleSelect ? 'exists' : 'missing'
    });
    
    userModal.style.display = 'flex';
}

// Open task modal
function openTaskModal(task = null) {
    if (!taskModal) {
        console.error('Task modal element not found');
        return;
    }
    
    if (task) {
        taskTitleInput.value = task.title;
        taskDescriptionInput.value = task.description;
        taskDeadlineInput.value = task.deadline;
        taskAssigneeSelect.value = task.assigneeId;
        taskPrioritySelect.value = task.priority;
        saveTaskBtn.dataset.id = task._id;
    } else {
        const today = new Date().toISOString().split('T')[0];
        taskTitleInput.value = '';
        taskDescriptionInput.value = '';
        taskDeadlineInput.value = today;
        taskAssigneeSelect.value = '';
        taskPrioritySelect.value = 'medium';
        saveTaskBtn.dataset.id = '';
    }
    
    taskModal.style.display = 'flex';
}

// Handle save user
async function handleSaveUser() {
    // Aggiungiamo un controllo per verificare che gli elementi del form esistano
    console.log('Form elements before getting values:', {
        nameInput: userNameInput ? 'exists' : 'missing',
        usernameInput: userUsernameInput ? 'exists' : 'missing',
        passwordInput: userPasswordInput ? 'exists' : 'missing',
        roleSelect: userRoleSelect ? 'exists' : 'missing'
    });
    
    // Verifichiamo i valori direttamente dagli elementi DOM
    console.log('Direct DOM values:', {
        nameValue: document.getElementById('user-name') ? document.getElementById('user-name').value : 'not found',
        usernameValue: document.getElementById('user-username') ? document.getElementById('user-username').value : 'not found'
    });
    
    const userId = saveUserBtn.dataset.id;
    const name = userNameInput ? userNameInput.value.trim() : '';
    const username = userUsernameInput ? userUsernameInput.value.trim() : '';
    const password = userPasswordInput ? userPasswordInput.value.trim() : '';
    const role = userRoleSelect ? userRoleSelect.value : 'user';
    
    console.log('Form values:', { 
        name: name, 
        username: username, 
        password: password ? '(provided)' : '(empty)', 
        role: role 
    });
    
    // Fallback per il nome se è vuoto ma l'username è presente
    let finalName = name;
    if (name.length === 0 && username.length > 0) {
        finalName = username; // Usa l'username come nome se il nome è vuoto
        console.log('Using username as name because name is empty');
    }
    
    // More lenient validation - check if fields have any content
    if (finalName.length === 0 || username.length === 0 || password.length === 0) {
        alert('Compila tutti i campi obbligatori');
        return;
    }
    
    try {
        console.log('Saving user data:', { name: finalName, username, role, userId: userId || 'new' });
        const userData = { 
            name: finalName, 
            username, 
            password, 
            role,
            points: 0 // Always set points to 0 for consistency
        };
        
        // Directly add to local DB first for immediate feedback
        if (!userId) {
            // Creating new user
            const newUser = {
                _id: 'user_' + Date.now(),
                ...userData
            };
            db.users.push(newUser);
            console.log('Added user to local DB:', newUser);
        } else {
            // Updating existing user
            const userIndex = db.users.findIndex(u => u._id === userId);
            if (userIndex !== -1) {
                db.users[userIndex] = {
                    ...db.users[userIndex],
                    ...userData
                };
            }
        }
        
        // Try API call but don't block on it
        try {
            await saveUser(userData, userId);
            console.log('User saved to API successfully');
        } catch (apiError) {
            console.error('API error (continuing with local data):', apiError);
            // Continue with local data
        }
        
        // Close modal and refresh users list
        closeAllModals();
        loadUsers(); // Use local data immediately
        
    } catch (error) {
        console.error('Error in handleSaveUser:', error);
        alert(`Errore: ${error.message || 'Errore sconosciuto durante il salvataggio dell\'utente'}`);
    }
}

// Handle delete user
async function handleDeleteUser(userId) {
    try {
        await deleteUser(userId);
        
        // Refresh users list
        await fetchUsers();
        loadUsers();
    } catch (error) {
        alert(`Errore: ${error.message}`);
    }
}

// Handle save task
async function handleSaveTask() {
    const taskId = saveTaskBtn.dataset.id;
    const title = taskTitleInput.value.trim();
    const description = taskDescriptionInput.value.trim();
    const deadline = taskDeadlineInput.value;
    const assigneeId = taskAssigneeSelect.value;
    const priority = taskPrioritySelect.value;
    
    if (!title || !description || !deadline || !assigneeId) {
        alert('Compila tutti i campi obbligatori');
        return;
    }
    
    try {
        const taskData = { 
            title, 
            description, 
            deadline, 
            assigneeId, 
            priority, 
            status: taskId ? (db.tasks.find(t => t._id === taskId)?.status || 'pending') : 'pending' 
        };
        
        await saveTask(taskData, taskId);
        
        // Close modal and refresh tasks list
        closeAllModals();
        await fetchTasks();
        loadAdminTasks();
    } catch (error) {
        alert(`Errore: ${error.message}`);
    }
}

// Handle delete task
async function handleDeleteTask(taskId) {
    try {
        await deleteTask(taskId);
        
        // Refresh tasks list
        await fetchTasks();
        loadAdminTasks();
    } catch (error) {
        alert(`Errore: ${error.message}`);
    }
}

// Handle assign points
async function handleAssignPoints() {
    const userId = pointsUserSelect.value;
    const points = parseInt(pointsAmountInput.value);
    const reason = pointsReasonInput.value.trim();
    
    if (!userId || isNaN(points) || points <= 0 || !reason) {
        alert('Compila tutti i campi correttamente');
        return;
    }
    
    try {
        const date = new Date().toISOString().split('T')[0];
        const pointsData = { userId, points, reason, date };
        
        await assignPoints(pointsData);
        
        // Reset form and refresh data
        pointsAmountInput.value = 1;
        pointsReasonInput.value = '';
        
        await Promise.all([
            fetchUsers(),
            fetchPointsHistory()
        ]);
        
        loadUsers();
        loadPointsHistory();
    } catch (error) {
        alert(`Errore: ${error.message}`);
    }
}

// Handle set employee of month
async function handleSetEmployeeOfMonth() {
    const employeeId = employeeSelect.value;
    const reason = reasonTextarea.value.trim();
    const month = parseInt(monthSelect.value);
    const year = parseInt(yearSelect.value);
    
    if (!employeeId || !reason || isNaN(month) || isNaN(year)) {
        alert('Compila tutti i campi correttamente');
        return;
    }
    
    try {
        const employeeData = { employeeId, reason, month, year };
        
        await setEmployeeOfMonth(employeeData);
        
        // Reset form
        reasonTextarea.value = '';
        
        alert(`${db.users.find(u => u._id === employeeId)?.name || 'Utente'} è stato impostato come impiegato del mese di ${getMonthName(month)} ${year}`);
    } catch (error) {
        alert(`Errore: ${error.message}`);
    }
}

// Initialize admin panel
function initAdminPanel() {
    console.log('Initializing admin panel...');
    
    // Tab navigation
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            showTab(tabId);
        });
    });
    
    // Add user button
    if (addUserBtn) {
        addUserBtn.addEventListener('click', () => {
            openUserModal();
        });
    } else {
        console.error('Add user button not found');
    }
    
    // Add task button
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', () => {
            openTaskModal();
        });
    } else {
        console.error('Add task button not found');
    }
    
    // Save user button
    if (saveUserBtn) {
        saveUserBtn.addEventListener('click', handleSaveUser);
    } else {
        console.error('Save user button not found');
    }
    
    // Save task button
    if (saveTaskBtn) {
        saveTaskBtn.addEventListener('click', handleSaveTask);
    } else {
        console.error('Save task button not found');
    }
    
    // Assign points button
    if (assignPointsBtn) {
        assignPointsBtn.addEventListener('click', handleAssignPoints);
    } else {
        console.error('Assign points button not found');
    }
    
    // Set employee button
    if (setEmployeeBtn) {
        setEmployeeBtn.addEventListener('click', handleSetEmployeeOfMonth);
    } else {
        console.error('Set employee button not found');
    }
    
    // Load admin data when page is loaded
    document.addEventListener('page-loaded', (e) => {
        if (e.detail.pageId === 'admin') {
            Promise.all([
                fetchUsers(),
                fetchTasks(),
                fetchPointsHistory()
            ]).then(() => {
                loadUsers();
                loadAdminTasks();
                loadPointsHistory();
                showTab('manage-users'); // Show default tab
            }).catch(error => {
                console.error('Error loading admin data:', error);
            });
        }
    });
    
    console.log('Admin panel initialized');
}

export {
    initAdminPanel,
    loadUsers,
    loadAdminTasks,
    loadPointsHistory
};