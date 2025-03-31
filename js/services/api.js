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
        db.users = await response.json();
        return db.users;
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
}

async function fetchTasks() {
    try {
        const response = await fetch(`${config.API_BASE_URL}/tasks`);
        db.tasks = await response.json();
        return db.tasks;
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return [];
    }
}

async function fetchEmployeeOfMonth() {
    try {
        const response = await fetch(`${config.API_BASE_URL}/employee-of-month`);
        db.employeeOfMonth = await response.json();
        return db.employeeOfMonth;
    } catch (error) {
        console.error('Error fetching employee of month:', error);
        return null;
    }
}

async function fetchPreviousWinners() {
    try {
        const response = await fetch(`${config.API_BASE_URL}/previous-winners`);
        db.previousWinners = await response.json();
        return db.previousWinners;
    } catch (error) {
        console.error('Error fetching previous winners:', error);
        return [];
    }
}

async function fetchPointsHistory() {
    try {
        const response = await fetch(`${config.API_BASE_URL}/points-history`);
        db.pointsHistory = await response.json();
        return db.pointsHistory;
    } catch (error) {
        console.error('Error fetching points history:', error);
        return [];
    }
}

// Add a fallback login function
async function login(username, password) {
    try {
        const response = await fetch(`${config.API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        if (response.ok) {
            return await response.json();
        }
        
        // Fallback for testing if server is running but DB is not connected
        if (username === 'admin' && password === 'admin123') {
            console.log('Using fallback login');
            return {
                _id: 'fallback-admin-id',
                name: 'Admin User',
                username: 'admin',
                role: 'admin',
                points: 0
            };
        }
        
        return null;
    } catch (error) {
        console.error('Login error:', error);
        
        // Fallback for testing if server is down
        if (username === 'admin' && password === 'admin123') {
            console.log('Using offline fallback login');
            return {
                _id: 'fallback-admin-id',
                name: 'Admin User',
                username: 'admin',
                role: 'admin',
                points: 0
            };
        }
        
        return null;
    }
}

// Find the saveUser function and update it like this:

// Save user (create or update)
async function saveUser(userData, userId = null) {
    console.log('API saveUser called with:', userData, userId);
    
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
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Server error response:', response.status, errorData);
            throw new Error(errorData.message || `Server returned ${response.status}`);
        }
        
        const data = await response.json();
        
        // Update local data
        if (userId) {
            // Update existing user
            const userIndex = db.users.findIndex(user => user._id === userId);
            if (userIndex !== -1) {
                db.users[userIndex] = { ...db.users[userIndex], ...userData };
            }
        } else {
            // Add new user
            db.users.push(data);
        }
        
        return data;
    } catch (error) {
        console.error('Error in saveUser:', error);
        
        // Fallback: Add user directly to the db object if API fails
        if (!userId) {
            // Creating new user
            const newUser = {
                _id: 'user_' + Date.now(),
                ...userData,
                points: 0
            };
            
            db.users.push(newUser);
            console.log('Added user directly to db:', newUser);
            return newUser;
        } else {
            // Updating existing user
            const userIndex = db.users.findIndex(u => u._id === userId);
            if (userIndex !== -1) {
                db.users[userIndex] = {
                    ...db.users[userIndex],
                    ...userData
                };
                console.log('Updated user directly in db:', db.users[userIndex]);
                return db.users[userIndex];
            }
        }
        
        throw error;
    }
}

async function deleteUser(userId) {
    try {
        const response = await fetch(`${config.API_BASE_URL}/users/${userId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            return true;
        }
        
        const error = await response.json();
        throw new Error(error.message);
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
}

async function saveTask(taskData, taskId = null) {
    try {
        let response;
        
        if (taskId) {
            // Update existing task
            response = await fetch(`${config.API_BASE_URL}/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(taskData)
            });
        } else {
            // Add new task
            response = await fetch(`${config.API_BASE_URL}/tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(taskData)
            });
        }
        
        if (response.ok) {
            return await response.json();
        }
        
        const error = await response.json();
        throw new Error(error.message);
    } catch (error) {
        console.error('Error saving task:', error);
        throw error;
    }
}

async function deleteTask(taskId) {
    try {
        const response = await fetch(`${config.API_BASE_URL}/tasks/${taskId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            return true;
        }
        
        const error = await response.json();
        throw new Error(error.message);
    } catch (error) {
        console.error('Error deleting task:', error);
        throw error;
    }
}

async function completeTask(taskId) {
    try {
        const response = await fetch(`${config.API_BASE_URL}/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'completed' })
        });
        
        if (response.ok) {
            return await response.json();
        }
        
        const error = await response.json();
        throw new Error(error.message);
    } catch (error) {
        console.error('Error completing task:', error);
        throw error;
    }
}

async function assignPoints(pointsData) {
    try {
        const response = await fetch(`${config.API_BASE_URL}/points-history`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pointsData)
        });
        
        if (response.ok) {
            return await response.json();
        }
        
        const error = await response.json();
        throw new Error(error.message);
    } catch (error) {
        console.error('Error assigning points:', error);
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
        
        if (response.ok) {
            return await response.json();
        }
        
        const error = await response.json();
        throw new Error(error.message);
    } catch (error) {
        console.error('Error setting employee of month:', error);
        throw error;
    }
}

// Load all data at once
async function loadAllData() {
    await Promise.all([
        fetchUsers(),
        fetchTasks(),
        fetchEmployeeOfMonth(),
        fetchPreviousWinners(),
        fetchPointsHistory()
    ]);
    return db;
}

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
    completeTask,
    assignPoints,
    setEmployeeOfMonth,
    loadAllData
};