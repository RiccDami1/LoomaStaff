import config from '../config.js';

// Database state
const db = {
    users: [],
    tasks: [],
    employeeOfMonth: null,
    previousWinners: [],
    pointsHistory: []
};

// Funzione helper per gestire le richieste API con timeout
async function fetchWithTimeout(url, options = {}, timeout = 8000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    const defaultOptions = {
        signal: controller.signal,
        ...options
    };
    
    try {
        const response = await fetch(url, defaultOptions);
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
}

// API functions
async function fetchUsers() {
    try {
        const response = await fetchWithTimeout(`${config.API_BASE_URL}/users`);
        db.users = await response.json();
        return db.users;
    } catch (error) {
        console.error('Error fetching users:', error);
        // Carica dati dal localStorage come fallback
        const storedUsers = localStorage.getItem('loomastaff_users');
        if (storedUsers) {
            db.users = JSON.parse(storedUsers);
            console.log('Loaded users from localStorage');
        }
        return db.users;
    }
}

// Modifica le altre funzioni API in modo simile...

// Save user (create or update)
async function saveUser(userData, userId = null) {
    console.log('API saveUser called with:', userData, userId);
    
    // Salva sempre nel localStorage come backup
    try {
        if (userId) {
            // Update existing user
            const userIndex = db.users.findIndex(user => user._id === userId);
            if (userIndex !== -1) {
                db.users[userIndex] = { ...db.users[userIndex], ...userData };
            }
        } else {
            // Add new user with temporary ID
            const tempUser = {
                _id: 'temp_' + Date.now(),
                ...userData
            };
            db.users.push(tempUser);
        }
        
        // Salva nel localStorage
        localStorage.setItem('loomastaff_users', JSON.stringify(db.users));
    } catch (localError) {
        console.error('Error saving to localStorage:', localError);
    }
    
    // Ora prova a salvare sul server
    try {
        let url = `${config.API_BASE_URL}/users`;
        let method = 'POST';
        
        if (userId) {
            url = `${config.API_BASE_URL}/users/${userId}`;
            method = 'PUT';
        }
        
        const response = await fetchWithTimeout(url, {
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
        
        // Aggiorna l'ID temporaneo con quello reale dal server
        if (!userId) {
            const tempIndex = db.users.findIndex(u => u._id.startsWith('temp_'));
            if (tempIndex !== -1) {
                db.users[tempIndex]._id = data._id;
                localStorage.setItem('loomastaff_users', JSON.stringify(db.users));
            }
        }
        
        return data;
    } catch (error) {
        console.error('Error in saveUser API call:', error);
        // Ritorna comunque i dati locali
        return userId 
            ? db.users.find(u => u._id === userId)
            : db.users[db.users.length - 1];
    }
}

// Continua a modificare le altre funzioni API...

// Modify the login function to add better error handling and debugging
async function login(username, password) {
    try {
        console.log('Attempting login with:', username);
        
        const response = await fetch(`${config.API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        console.log('Login response status:', response.status);
        
        if (response.ok) {
            const userData = await response.json();
            console.log('Login successful, user data:', userData);
            
            // Store user data in localStorage for persistence
            localStorage.setItem('currentUser', JSON.stringify(userData));
            
            return userData;
        }
        
        console.log('Login failed with server response');
        
        // Fallback for testing if server is running but DB is not connected
        if (username === 'admin' && password === 'admin123') {
            console.log('Using fallback login');
            const fallbackUser = {
                _id: 'fallback-admin-id',
                name: 'Admin User',
                username: 'admin',
                role: 'admin',
                points: 0
            };
            
            // Store fallback user in localStorage
            localStorage.setItem('currentUser', JSON.stringify(fallbackUser));
            
            return fallbackUser;
        }
        
        return null;
    } catch (error) {
        console.error('Login error:', error);
        
        // Fallback for testing if server is down
        if (username === 'admin' && password === 'admin123') {
            console.log('Using offline fallback login');
            const fallbackUser = {
                _id: 'fallback-admin-id',
                name: 'Admin User',
                username: 'admin',
                role: 'admin',
                points: 0
            };
            
            // Store fallback user in localStorage
            localStorage.setItem('currentUser', JSON.stringify(fallbackUser));
            
            return fallbackUser;
        }
        
        return null;
    }
}

// Add or fix the assignPoints function
async function assignPoints(pointsData) {
    try {
        const response = await fetch(`${config.API_BASE_URL}/points-history`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pointsData)
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Server returned ${response.status}`);
        }
        
        const data = await response.json();
        
        // Update local data
        db.pointsHistory.push(data);
        
        // Update user points
        const userIndex = db.users.findIndex(u => u._id === pointsData.userId);
        if (userIndex !== -1) {
            db.users[userIndex].points = (db.users[userIndex].points || 0) + pointsData.points;
        }
        
        return data;
    } catch (error) {
        console.error('Error assigning points:', error);
        
        // Add to local data anyway for offline functionality
        const newPointsEntry = {
            _id: 'points_' + Date.now(),
            ...pointsData
        };
        db.pointsHistory.push(newPointsEntry);
        
        // Update user points locally
        const userIndex = db.users.findIndex(u => u._id === pointsData.userId);
        if (userIndex !== -1) {
            db.users[userIndex].points = (db.users[userIndex].points || 0) + pointsData.points;
        }
        
        throw error;
    }
}

// Make sure all functions are properly exported
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
    assignPoints,  // Make sure this is included in the exports
    setEmployeeOfMonth
};