const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '/')));

// Connessione al database
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    console.log('Running in fallback mode with local data');
  });

// API routes - simplified version
app.get('/api/users', (req, res) => {
  res.json([]);  // Return empty array for now
});

app.get('/api/tasks', (req, res) => {
  res.json([]);  // Return empty array for now
});

app.get('/api/employee-of-month', (req, res) => {
  res.json(null);  // Return null for now
});

app.get('/api/previous-winners', (req, res) => {
  res.json([]);  // Return empty array for now
});

app.get('/api/points-history', (req, res) => {
  res.json([]);  // Return empty array for now
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  // Simple fallback login
  if (username === 'admin' && password === 'admin123') {
    res.json({
      _id: 'admin-id',
      name: 'Admin User',
      username: 'admin',
      role: 'admin',
      points: 0
    });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Serve l'app frontend per qualsiasi altra richiesta
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Avvia il server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});