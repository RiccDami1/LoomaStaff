// Configurazione per supportare sia ambiente locale che Render
const config = {
    API_BASE_URL: process.env.API_URL || 'https://loomastaff-api.onrender.com/api',
    // Fallback all'URL locale per lo sviluppo
    LOCAL_API_URL: 'http://localhost:3000/api',
    // Flag per indicare se siamo in modalità di sviluppo
    isDevelopment: process.env.NODE_ENV !== 'production'
};

export default config;