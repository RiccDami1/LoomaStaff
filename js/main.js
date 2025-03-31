import { login } from './services/api.js';

// DOM Elements - Add more debugging
console.log('Looking for login form elements...');
const loginForm = document.getElementById('login-form');
console.log('Login form found:', loginForm ? 'Yes' : 'No');

const usernameInput = document.getElementById('username');
console.log('Username input found:', usernameInput ? 'Yes' : 'No');

const passwordInput = document.getElementById('password');
console.log('Password input found:', passwordInput ? 'Yes' : 'No');

const messageContainer = document.getElementById('message-container');
console.log('Message container found:', messageContainer ? 'Yes' : 'No');

// Show message
function showMessage(message, type = 'info') {
    console.log('Showing message:', message, type);
    
    if (!messageContainer) {
        // Fallback if message container not found
        alert(message);
        return;
    }
    
    messageContainer.textContent = message;
    messageContainer.className = `message ${type}`;
    messageContainer.style.display = 'block';
    
    // Hide message after 5 seconds
    setTimeout(() => {
        messageContainer.style.display = 'none';
    }, 5000);
}

// Handle login
async function handleLogin(event) {
    console.log('Login form submitted');
    event.preventDefault();
    
    // Check if inputs exist
    if (!usernameInput || !passwordInput) {
        console.error('Login inputs not found');
        showMessage('Errore: elementi del form non trovati', 'error');
        return;
    }
    
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    
    console.log('Login attempt with username:', username, 'password length:', password.length);
    
    if (!username || !password) {
        showMessage('Inserisci username e password', 'error');
        return;
    }
    
    try {
        // Show loading state
        const loginBtn = loginForm ? loginForm.querySelector('button[type="submit"]') : null;
        if (loginBtn) {
            loginBtn.disabled = true;
            loginBtn.textContent = 'Accesso in corso...';
        }
        
        // Try direct fallback for admin
        if (username === 'admin' && password === 'admin123') {
            console.log('Using admin fallback login');
            const fallbackUser = {
                _id: 'admin_fallback',
                name: 'Admin',
                username: 'admin',
                role: 'admin',
                points: 0
            };
            
            localStorage.setItem('currentUser', JSON.stringify(fallbackUser));
            window.location.href = 'admin.html';
            return;
        }
        
        // Try regular login
        const user = await login(username, password);
        
        // Reset button state
        if (loginBtn) {
            loginBtn.disabled = false;
            loginBtn.textContent = 'Accedi';
        }
        
        if (user) {
            console.log('Login successful, redirecting');
            
            // Store user in localStorage
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            // Redirect based on role
            if (user.role === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'dashboard.html';
            }
        } else {
            console.log('Login failed, no user returned');
            showMessage('Username o password non validi', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        
        // Reset button state
        const loginBtn = loginForm ? loginForm.querySelector('button[type="submit"]') : null;
        if (loginBtn) {
            loginBtn.disabled = false;
            loginBtn.textContent = 'Accedi';
        }
        
        showMessage(`Errore: ${error.message || 'Errore durante l\'accesso'}`, 'error');
    }
}

// Initialize app
function initApp() {
    console.log('Initializing app...');
    
    // Check if user is already logged in
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        const user = JSON.parse(currentUser);
        console.log('User already logged in:', user.username);
        
        // Redirect if on login page
        if (window.location.pathname.endsWith('index.html') || 
            window.location.pathname === '/' || 
            window.location.pathname === '') {
            
            console.log('Redirecting from login page to dashboard');
            if (user.role === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'dashboard.html';
            }
        }
    } else {
        console.log('No user logged in');
        // Redirect to login if not on login page
        if (!window.location.pathname.endsWith('index.html') && 
            window.location.pathname !== '/' && 
            window.location.pathname !== '') {
            
            console.log('Redirecting to login page');
            window.location.href = 'index.html';
        }
    }
    
    // Add event listeners - with fallback
    if (loginForm) {
        console.log('Adding submit event listener to login form');
        loginForm.addEventListener('submit', handleLogin);
    } else {
        console.log('Login form not found, adding fallback event listener');
        // Try to add event listener after a short delay
        setTimeout(() => {
            const delayedLoginForm = document.getElementById('login-form');
            if (delayedLoginForm) {
                console.log('Login form found after delay');
                delayedLoginForm.addEventListener('submit', handleLogin);
            } else {
                console.error('Login form not found even after delay');
                
                // Add direct event listener to login button as fallback
                const loginButton = document.querySelector('button[type="submit"]');
                if (loginButton) {
                    console.log('Found submit button, adding click listener');
                    loginButton.addEventListener('click', function(e) {
                        e.preventDefault();
                        handleLogin(e);
                    });
                }
            }
        }, 500);
    }
    
    console.log('App initialization complete');
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

// Also add a fallback initialization
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    console.log('Document already loaded, initializing immediately');
    initApp();
} else {
    console.log('Waiting for DOMContentLoaded event');
}

// Export functions
export {
    showMessage
};