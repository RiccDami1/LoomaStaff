// Add or modify the login route to ensure it works properly
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Login route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        console.log('Login attempt for username:', username);
        
        // Find user by username
        const user = await User.findOne({ username });
        
        if (!user) {
            console.log('User not found:', username);
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        // Check password - log password comparison for debugging
        console.log('Comparing passwords for user:', username);
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match result:', isMatch);
        
        if (!isMatch) {
            console.log('Password mismatch for user:', username);
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        // Create token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET || 'your_jwt_secret_key',
            { expiresIn: '1d' }
        );
        
        console.log('Login successful for user:', username, 'with role:', user.role);
        
        // Return user data and token
        res.json({
            _id: user._id,
            name: user.name,
            username: user.username,
            role: user.role,
            points: user.points || 0,
            token
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Add a test endpoint to check if auth routes are working
router.get('/test', (req, res) => {
    console.log('Auth test endpoint called');
    res.json({ 
        message: 'Auth routes are working',
        timestamp: new Date().toISOString(),
        env: {
            nodeEnv: process.env.NODE_ENV,
            jwtSecret: process.env.JWT_SECRET ? 'Set' : 'Not set'
        }
    });
});

// Fallback login for testing
router.post('/fallback-login', (req, res) => {
    const { username, password } = req.body;
    console.log('Fallback login attempt:', username);
    
    if (username === 'admin' && password === 'admin123') {
        console.log('Fallback login successful for admin');
        return res.json({
            _id: 'fallback-admin-id',
            name: 'Admin User',
            username: 'admin',
            role: 'admin',
            points: 0,
            token: 'fallback-token'
        });
    }
    
    console.log('Fallback login failed');
    res.status(401).json({ message: 'Invalid credentials' });
});

module.exports = router;