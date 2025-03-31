const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Hardcoded MongoDB URI (since we can't use secrets in HTML Replit)
const MONGODB_URI = "mongodb+srv://stefaniavecchi1:5euiceVOGl0CIMxz@sitolooma.m4qhv7n.mongodb.net/?retryWrites=true&w=majority&appName=SitoLooma";

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// MongoDB connection with fallback
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000 // Timeout after 5s instead of 30s
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    console.log('Starting server without database connection...');
    return false;
  }
};

// Modify the server startup to work even without DB connection
// Start server
connectDB().then((connected) => {
  if (connected) {
    initializeDB().catch(err => {
      console.error('Error initializing database:', err);
    });
  }
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

// Define schemas
const userSchema = new mongoose.Schema({
  name: String,
  username: { type: String, unique: true },
  password: String,
  role: String,
  points: { type: Number, default: 0 }
});

const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  deadline: String,
  assigneeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  priority: String,
  status: String
});

const employeeOfMonthSchema = new mongoose.Schema({
  month: Number,
  year: Number,
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reason: String
});

const pointsHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  points: Number,
  reason: String,
  date: String
});

// Create models
const User = mongoose.model('User', userSchema);
const Task = mongoose.model('Task', taskSchema);
const EmployeeOfMonth = mongoose.model('EmployeeOfMonth', employeeOfMonthSchema);
const PointsHistory = mongoose.model('PointsHistory', pointsHistorySchema);

// API Routes
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const user = new User(req.body);
    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find().populate('assigneeId', 'name');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const task = new Task(req.body);
    const savedTask = await task.save();
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/employee-of-month', async (req, res) => {
  try {
    const employeeOfMonth = await EmployeeOfMonth.findOne().sort({ year: -1, month: -1 }).populate('employeeId', 'name');
    res.json(employeeOfMonth);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/previous-winners', async (req, res) => {
  try {
    const winners = await EmployeeOfMonth.find().sort({ year: -1, month: -1 }).limit(10).populate('employeeId', 'name');
    res.json(winners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/employee-of-month', async (req, res) => {
  try {
    const employeeOfMonth = new EmployeeOfMonth(req.body);
    const savedEmployee = await employeeOfMonth.save();
    res.status(201).json(savedEmployee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/api/points-history', async (req, res) => {
  try {
    const pointsHistory = await PointsHistory.find().populate('userId', 'name');
    res.json(pointsHistory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/points-history', async (req, res) => {
  try {
    const pointsHistory = new PointsHistory(req.body);
    const savedPoints = await pointsHistory.save();
    
    // Update user points
    await User.findByIdAndUpdate(req.body.userId, { $inc: { points: req.body.points } });
    
    res.status(201).json(savedPoints);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update the login route
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Fallback admin login if DB is not connected
    if (username === 'admin' && password === 'admin123' && 
        mongoose.connection.readyState !== 1) {
      return res.json({
        _id: 'fallback-admin-id',
        name: 'Admin User',
        username: 'admin',
        role: 'admin',
        points: 0
      });
    }
    
    const user = await User.findOne({ username, password });
    
    if (user) {
      res.json(user);
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    
    // Fallback admin login if error occurs
    if (req.body.username === 'admin' && req.body.password === 'admin123') {
      return res.json({
        _id: 'fallback-admin-id',
        name: 'Admin User',
        username: 'admin',
        role: 'admin',
        points: 0
      });
    }
    
    res.status(500).json({ message: error.message });
  }
});

// Initialize database with sample data if empty
const initializeDB = async () => {
  const usersCount = await User.countDocuments();
  
  if (usersCount === 0) {
    console.log('Initializing database with sample data...');
    
    // Create users
    const users = [
      {
        name: "Admin User",
        username: "admin",
        password: "admin123",
        role: "admin",
        points: 0
      },
      {
        name: "Mario Rossi",
        username: "mario",
        password: "mario123",
        role: "user",
        points: 150
      },
      {
        name: "Giulia Bianchi",
        username: "giulia",
        password: "giulia123",
        role: "user",
        points: 120
      },
      {
        name: "Luca Verdi",
        username: "luca",
        password: "luca123",
        role: "user",
        points: 180
      }
    ];
    
    const createdUsers = await User.insertMany(users);
    
    // Create tasks
    const tasks = [
      {
        title: "Redesign del logo aziendale",
        description: "Creare un nuovo logo per l'azienda XYZ seguendo le linee guida fornite.",
        deadline: "2023-12-15",
        assigneeId: createdUsers[1]._id,
        priority: "high",
        status: "pending"
      },
      {
        title: "Brochure promozionale",
        description: "Progettare una brochure di 4 pagine per la nuova campagna marketing.",
        deadline: "2023-12-10",
        assigneeId: createdUsers[2]._id,
        priority: "medium",
        status: "pending"
      },
      {
        title: "Banner per social media",
        description: "Creare una serie di banner per la promozione sui social media.",
        deadline: "2023-12-05",
        assigneeId: createdUsers[3]._id,
        priority: "low",
        status: "completed"
      },
      {
        title: "Mockup sito web",
        description: "Progettare il mockup per il nuovo sito web del cliente.",
        deadline: "2023-12-20",
        assigneeId: createdUsers[1]._id,
        priority: "high",
        status: "pending"
      }
    ];
    
    await Task.insertMany(tasks);
    
    // Create employee of month
    const employeeOfMonth = {
      month: 11,
      year: 2023,
      employeeId: createdUsers[3]._id,
      reason: "Ha completato tutti i progetti in anticipo e con un'eccellente qualità, ricevendo feedback molto positivi dai clienti."
    };
    
    await EmployeeOfMonth.create(employeeOfMonth);
    
    // Create previous winners
    const previousWinners = [
      {
        month: 10,
        year: 2023,
        employeeId: createdUsers[1]._id,
        reason: "Ottimo lavoro sul rebrand del cliente principale."
      },
      {
        month: 9,
        year: 2023,
        employeeId: createdUsers[2]._id,
        reason: "Eccellente gestione di più progetti contemporaneamente."
      }
    ];
    
    await EmployeeOfMonth.insertMany(previousWinners);
    
    // Create points history
    const pointsHistory = [
      {
        userId: createdUsers[1]._id,
        points: 50,
        reason: "Completamento anticipato del progetto",
        date: "2023-11-15"
      },
      {
        userId: createdUsers[2]._id,
        points: 30,
        reason: "Feedback positivo dal cliente",
        date: "2023-11-10"
      },
      {
        userId: createdUsers[3]._id,
        points: 70,
        reason: "Eccellenza nel design",
        date: "2023-11-20"
      }
    ];
    
    await PointsHistory.insertMany(pointsHistory);
    
    console.log('Sample data initialized successfully');
  }
};