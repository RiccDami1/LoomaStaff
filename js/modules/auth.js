import { login } from '../services/api.js';

// Current logged in user
let currentUser = null;

// DOM Elements
const loginContainer = document.getElementById('login-container');
const dashboardContainer = document.getElementById('dashboard-container');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');
const adminPanel = document.getElementById('admin-panel');
const userNameSpan = document.getElementById('user-name');

// Handle login
async function handleLogin() {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
        loginError.textContent = 'Inserisci username e password';
        return;
    }

    try {
        const user = await login(username, password);
        
        if (user) {
            currentUser = user;
            loginContainer.style.display = 'none';
            dashboardContainer.style.display = 'flex';
            
            // Show admin panel if user is admin
            if (user.role === 'admin') {
                adminPanel.style.display = 'flex';
            } else {
                adminPanel.style.display = 'none';
            }

            // Update user name
            userNameSpan.textContent = user.name;

            // Trigger dashboard load event
            const event = new CustomEvent('user-logged-in');
            document.dispatchEvent(event);
            
            return true;
        } else {
            loginError.textContent = 'Username o password non validi';
            return false;
        }
    } catch (error) {
        console.error('Login error:', error);
        loginError.textContent = 'Errore di connessione al server';
        return false;
    }
}

// Handle logout
function handleLogout() {
    currentUser = null;
    dashboardContainer.style.display = 'none';
    loginContainer.style.display = 'flex';
    usernameInput.value = '';
    passwordInput.value = '';
    loginError.textContent = '';
    
    // Trigger logout event
    const event = new CustomEvent('user-logged-out');
    document.dispatchEvent(event);
}

// Initialize auth module
function initAuth() {
    // Login event
    loginBtn.addEventListener('click', handleLogin);

    // Logout event
    logoutBtn.addEventListener('click', handleLogout);
    
    // Handle Enter key press on login form
    usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            passwordInput.focus();
        }
    });

    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    });
}

export {
    currentUser,
    handleLogin,
    handleLogout,
    initAuth
};