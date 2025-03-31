// Configuration settings for the application
const API_BASE_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : '/api';

// Export configuration
const config = {
    API_BASE_URL
};

export default config;