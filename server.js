const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/loomastaff';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '/')));

// Log startup information
console.log('Starting LoomaStaff server...');
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`Port: ${PORT}`);

// Connessione al database
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    console.log('Running in fallback mode with local data');
  });

// Simple health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Importa i modelli e le route
const userRoutes = require('./server/routes/users');
const taskRoutes = require('./server/routes/tasks');
const pointsRoutes = require('./server/routes/points');
const employeeRoutes = require('./server/routes/employee');
const authRoutes = require('./server/routes/auth');

// Usa le route
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/points-history', pointsRoutes);
app.use('/api/employee-of-month', employeeRoutes);
app.use('/api/previous-winners', employeeRoutes);
app.use('/api', authRoutes);

// Serve l'app frontend per qualsiasi altra richiesta
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Avvia il server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Server URL: http://localhost:${PORT}`);
});

// Handle shutdown gracefully
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});