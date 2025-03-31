// Configuration file for LoomaStaff
const config = {
    // API base URL - adjust based on environment
    API_BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:3000/api' 
        : '/api',
    
    // App version
    VERSION: '1.0.0',
    
    // Default date format
    DATE_FORMAT: 'DD/MM/YYYY',
    
    // Points settings
    DEFAULT_POINTS: 1,
    MAX_POINTS: 100
};

export default config;