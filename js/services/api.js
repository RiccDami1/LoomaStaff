import config from '../config.js';

// Database state
const db = {
    users: [],
    tasks: [],
    employeeOfMonth: null,
    previousWinners: [],
    pointsHistory: []
};

// API functions
async function fetchUsers() {
    try {
        const response = await fetch(`${config.API_BASE_URL}/users`);
        if (!response.ok) throw new Error('Failed to fetch users');
        db.users = await response.json();
        return db.users;
    } catch (error) {
        console.error('Error fetching users:', error);
        // Try to load from localStorage as fallback
        const storedUsers = localStorage.getItem('loomastaff_users');
        if (storedUsers) {
            db.users = JSON.parse(storedUsers);
        }
        return db.users;
    }
}

async function fetchTasks() {
    try {
        const response = await fetch(`${config.API_BASE_URL}/tasks`);
        if (!response.ok) throw new Error('Failed to fetch tasks');
        db.tasks = await response.json();
        return db.tasks;
    } catch (error) {
        console.error('Error fetching tasks:', error);
        // Try to load from localStorage as fallback
        const storedTasks = localStorage.getItem('loomastaff_tasks');
        if (storedTasks) {
            db.tasks = JSON.parse(storedTasks);
        }
        return db.tasks;
    }
}

async function fetchEmployeeOfMonth() {
    try {
        const response = await fetch(`${config.API_BASE_URL}/employee-of-month`);
        if (!response.ok) throw new Error('Failed to fetch employee of month');
        db.employeeOfMonth = await response.json();
        return db.employeeOfMonth;
    } catch (error) {
        console.error('Error fetching employee of month:', error);
        // Try to load from localStorage as fallback
        const storedEmployee = localStorage.getItem('loomastaff_employee');
        if (storedEmployee) {
            db.employeeOfMonth = JSON.parse(storedEmployee);
        }
        return db.employeeOfMonth;
    }
}

async function fetchPreviousWinners() {
    try {
        const response = await fetch(`${config.API_BASE_URL}/previous-winners`);
        if (!response.ok) throw new Error('Failed to fetch previous winners');
        db.previousWinners = await response.json();
        return db.previousWinners;
    } catch (error) {
        console.error('Error fetching previous winners:', error);
        // Try to load from localStorage as fallback
        const storedWinners = localStorage.getItem('loomastaff_winners');
        if (storedWinners) {
            db.previousWinners = JSON.parse(storedWinners);
        }
        return db.previousWinners;
    }
}

async function fetchPointsHistory() {
    try {
        const response = await fetch(`${config.API_BASE_URL}/points-history`);
        if (!response.ok) throw new Error('Failed to fetch points history');
        db.pointsHistory = await response.json();
        return db.pointsHistory;
    } catch (error) {
        console.error('Error fetching points history:', error);
        // Try to load from localStorage as fallback
        const storedPoints = localStorage.getItem('loomastaff_points');
        if (storedPoints) {
            db.pointsHistory = JSON.parse(storedPoints);
        }
        return db.pointsHistory;
    }
}

async function login(username, password) {
    try {
        const response = await fetch(`${config.API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        if (!response.ok) {
            // Try fallback login for testing
            if (username === 'admin' && password === 'admin123') {
                const fallbackUser = {
                    _id: 'admin_fallback',
                    name: 'Admin',
                    username: 'admin',
                    role: 'admin',
                    points: 0
                };
                localStorage.setItem('currentUser', JSON.stringify(fallbackUser));
                return fallbackUser;
            }
            throw new Error('Invalid credentials');
        }
        
        const userData = await response.json();
        localStorage.setItem('currentUser', JSON.stringify(userData));
        return userData;
    } catch (error) {
        console.error('Login error:', error);
        
        // Fallback for testing
        if (username === 'admin' && password === 'admin123') {
            const fallbackUser = {
                _id: 'admin_fallback',
                name: 'Admin',
                username: 'admin',
                role: 'admin',
                points: 0
            };
            localStorage.setItem('currentUser', JSON.stringify(fallbackUser));
            return fallbackUser;
        }
        
        throw error;
    }
}

async function saveUser(userData, userId = null) {
    try {
        let url = `${config.API_BASE_URL}/users`;
        let method = 'POST';
        
        if (userId) {
            url = `${config.API_BASE_URL}/users/${userId}`;
            method = 'PUT';
        }
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        if (!response.ok) throw new Error('Failed to save user');
        
        const savedUser = await response.json();
        
        // Update local data
        if (userId) {
            const index = db.users.findIndex(u => u._id === userId);
            if (index !== -1) {
                db.users[index] = savedUser;
            }
        } else {
            db.users.push(savedUser);
        }
        
        // Save to localStorage as backup
        localStorage.setItem('loomastaff_users', JSON.stringify(db.users));
        
        return savedUser;
    } catch (error) {
        console.error('Error saving user:', error);
        
        // Update local data anyway for offline functionality
        if (userId) {
            const index = db.users.findIndex(u => u._id === userId);
            if (index !== -1) {
                db.users[index] = { ...db.users[index], ...userData };
            }
        } else {
            const newUser = {
                _id: 'user_' + Date.now(),
                ...userData
            };
            db.users.push(newUser);
        }
        
        // Save to localStorage as backup
        localStorage.setItem('loomastaff_users', JSON.stringify(db.users));
        
        throw error;
    }
}

async function deleteUser(userId) {
    try {
        const response = await fetch(`${config.API_BASE_URL}/users/${userId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete user');
        
        // Update local data
        const index = db.users.findIndex(u => u._id === userId);
        if (index !== -1) {
            db.users.splice(index, 1);
            localStorage.setItem('loomastaff_users', JSON.stringify(db.users));
        }
        
        return true;
    } catch (error) {
        console.error('Error deleting user:', error);
        
        // Update local data anyway for offline functionality
        const index = db.users.findIndex(u => u._id === userId);
        if (index !== -1) {
            db.users.splice(index, 1);
            localStorage.setItem('loomastaff_users', JSON.stringify(db.users));
        }
        
        throw error;
    }
}

async function saveTask(taskData, taskId = null) {
    try {
        let url = `${config.API_BASE_URL}/tasks`;
        let method = 'POST';
        
        if (taskId) {
            url = `${config.API_BASE_URL}/tasks/${taskId}`;
            method = 'PUT';
        }
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        });
        
        if (!response.ok) throw new Error('Failed to save task');
        
        const savedTask = await response.json();
        
        // Update local data
        if (taskId) {
            const index = db.tasks.findIndex(t => t._id === taskId);
            if (index !== -1) {
                db.tasks[index] = savedTask;
            }
        } else {
            db.tasks.push(savedTask);
        }
        
        // Save to localStorage as backup
        localStorage.setItem('loomastaff_tasks', JSON.stringify(db.tasks));
        
        return savedTask;
    } catch (error) {
        console.error('Error saving task:', error);
        
        // Update local data anyway for offline functionality
        if (taskId) {
            const index = db.tasks.findIndex(t => t._id === taskId);
            if (index !== -1) {
                db.tasks[index] = { ...db.tasks[index], ...taskData };
            }
        } else {
            const newTask = {
                _id: 'task_' + Date.now(),
                ...taskData
            };
            db.tasks.push(newTask);
        }
        
        // Save to localStorage as backup
        localStorage.setItem('loomastaff_tasks', JSON.stringify(db.tasks));
        
        throw error;
    }
}

async function deleteTask(taskId) {
    try {
        const response = await fetch(`${config.API_BASE_URL}/tasks/${taskId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete task');
        
        // Update local data
        const index = db.tasks.findIndex(t => t._id === taskId);
        if (index !== -1) {
            db.tasks.splice(index, 1);
            localStorage.setItem('loomastaff_tasks', JSON.stringify(db.tasks));
        }
        
        return true;
    } catch (error) {
        console.error('Error deleting task:', error);
        
        // Update local data anyway for offline functionality
        const index = db.tasks.findIndex(t => t._id === taskId);
        if (index !== -1) {
            db.tasks.splice(index, 1);
            localStorage.setItem('loomastaff_tasks', JSON.stringify(db.tasks));
        }
        
        throw error;
    }
}

// Add the missing assignPoints function
async function assignPoints(pointsData) {
    try {
        const response = await fetch(`${config.API_BASE_URL}/points-history`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pointsData)
        });
        
        if (!response.ok) throw new Error('Failed to assign points');
        
        const savedPoints = await response.json();
        
        // Update local data
        db.pointsHistory.push(savedPoints);
        
        // Update user points
        const userIndex = db.users.findIndex(u => u._id === pointsData.userId);
        if (userIndex !== -1) {
            db.users[userIndex].points = (db.users[userIndex].points || 0) + pointsData.points;
        }
        
        // Save to localStorage as backup
        localStorage.setItem('loomastaff_points', JSON.stringify(db.pointsHistory));
        localStorage.setItem('loomastaff_users', JSON.stringify(db.users));
        
        return savedPoints;
    } catch (error) {
        console.error('Error assigning points:', error);
        
        // Update local data anyway for offline functionality
        const newPoints = {
            _id: 'points_' + Date.now(),
            ...pointsData,
            date: pointsData.date || new Date().toISOString().split('T')[0]
        };
        db.pointsHistory.push(newPoints);
        
        // Update user points
        const userIndex = db.users.findIndex(u => u._id === pointsData.userId);
        if (userIndex !== -1) {
            db.users[userIndex].points = (db.users[userIndex].points || 0) + pointsData.points;
        }
        
        // Save to localStorage as backup
        localStorage.setItem('loomastaff_points', JSON.stringify(db.pointsHistory));
        localStorage.setItem('loomastaff_users', JSON.stringify(db.users));
        
        throw error;
    }
}

async function setEmployeeOfMonth(employeeData) {
    try {
        const response = await fetch(`${config.API_BASE_URL}/employee-of-month`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(employeeData)
        });
        
        if (!response.ok) throw new Error('Failed to set employee of month');
        
        const savedEmployee = await response.json();
        
        // Update local data
        db.employeeOfMonth = savedEmployee;
        
        // Add to previous winners
        if (db.previousWinners) {
            db.previousWinners.push(savedEmployee);
        } else {
            db.previousWinners = [savedEmployee];
        }
        
        // Save to localStorage as backup
        localStorage.setItem('loomastaff_employee', JSON.stringify(db.employeeOfMonth));
        localStorage.setItem('loomastaff_winners', JSON.stringify(db.previousWinners));
        
        return savedEmployee;
    } catch (error) {
        console.error('Error setting employee of month:', error);
        
        // Update local data anyway for offline functionality
        const newEmployee = {
            _id: 'employee_' + Date.now(),
            ...employeeData,
            date: new Date().toISOString()
        };
        
        db.employeeOfMonth = newEmployee;
        
        // Add to previous winners
        if (db.previousWinners) {
            db.previousWinners.push(newEmployee);
        } else {
            db.previousWinners = [newEmployee];
        }
        
        // Save to localStorage as backup
        localStorage.setItem('loomastaff_employee', JSON.stringify(db.employeeOfMonth));
        localStorage.setItem('loomastaff_winners', JSON.stringify(db.previousWinners));
        
        throw error;
    }
}

// Make sure to export all functions
export {
    db,
    fetchUsers,
    fetchTasks,
    fetchEmployeeOfMonth,
    fetchPreviousWinners,
    fetchPointsHistory,
    login,
    saveUser,
    deleteUser,
    saveTask,
    deleteTask,
    assignPoints,
    setEmployeeOfMonth
};