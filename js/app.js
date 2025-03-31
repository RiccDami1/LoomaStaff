import { loadAllData } from './services/api.js';
import { initAuth } from './modules/auth.js';
import { initDashboard } from './modules/dashboard.js';
import { initTasks } from './modules/tasks.js';
import { initAdminPanel } from './modules/admin.js'; // Make sure this is imported
import { initYearSelect } from './utils/ui-utils.js';

// DOM Elements
const navLinks = document.querySelectorAll('.nav-links li[data-page]');
const pages = document.querySelectorAll('.page');
const closeModalBtns = document.querySelectorAll('.close-modal');

// Navigation function
function showPage(pageId) {
    // Update active nav link
    navLinks.forEach(link => {
        if (link.getAttribute('data-page') === pageId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Show selected page
    pages.forEach(page => {
        if (page.id === `${pageId}-page`) {
            page.style.display = 'block';
            
            // Trigger page load event
            const event = new CustomEvent('page-loaded', { detail: { pageId } });
            document.dispatchEvent(event);
        } else {
            page.style.display = 'none';
        }
    });
}

// Close all modals
function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
}

// Initialize the app
document.addEventListener('DOMContentLoaded', async () => {
    console.log('App initializing...');
    
    // Initialize modules
    initAuth();
    initDashboard();
    initTasks();
    if (typeof initAdminPanel === 'function') {
        initAdminPanel();
    } else {
        console.error('Admin panel module not loaded correctly');
    }
    
    // Initialize year select
    initYearSelect();
    
    // Load initial data
    try {
        await loadAllData();
        console.log('Data loaded successfully');
    } catch (error) {
        console.error('Error loading data:', error);
    }
    
    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const pageId = link.getAttribute('data-page');
            showPage(pageId);
        });
    });
    
    // Close modals
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });
    
    // Handle window clicks to close modals when clicking outside
    window.addEventListener('click', (e) => {
        document.querySelectorAll('.modal').forEach(modal => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Show login page initially
    document.getElementById('login-container').style.display = 'flex';
    document.getElementById('dashboard-container').style.display = 'none';
    
    console.log('App initialization complete');
});

// Export functions that might be needed by other modules
export {
    showPage,
    closeAllModals
};