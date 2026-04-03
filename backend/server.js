require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

mongoose.set('strictQuery', false);

const app = express();

// Debug: Check if .env is loading
console.log("Loaded MONGO_URI:", process.env.MONGO_URI);

app.use(cors());
app.use(express.json());

// MongoDB connection
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is undefined. Check your .env file.");
    }

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

connectDB();

// Test route to verify server is running
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Server is running!', 
    timestamp: new Date().toISOString(),
    routes: {
      auth: '/api/auth',
      users: '/api/users',
      skills: '/api/skills',
      swaps: '/api/swaps',
      reviews: '/api/reviews',
      leaderboard: '/api/leaderboard'
    }
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/skills', require('./routes/skills'));
app.use('/api/swaps', require('./routes/swaps'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/leaderboard', require('./routes/leaderboard'));

// Handle 404 for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    message: 'API endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Handle 404 for non-API routes (serves React app in production)
app.use('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ 
      message: 'API endpoint not found',
      path: req.originalUrl,
      method: req.method
    });
  } else {
    // In development, you might want to serve the React app
    // In production with Create React App:
    if (process.env.NODE_ENV === 'production') {
      res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
    } else {
      res.status(404).json({ 
        message: 'Page not found',
        path: req.originalUrl,
        method: req.method
      });
    }
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`📋 Available API routes:`);
  console.log(`   GET  /api/test`);
  console.log(`   POST /api/auth/login`);
  console.log(`   POST /api/auth/register`);
  console.log(`   GET  /api/users/profile`);
  console.log(`   PUT  /api/users/profile`);
  console.log(`   GET  /api/skills/users`);
  console.log(`   GET  /api/skills/all`);
  console.log(`   POST /api/swaps/`);
  console.log(`   GET  /api/swaps/`);
  console.log(`   PUT  /api/swaps/:swapId/accept`);
  console.log(`   PUT  /api/swaps/:swapId/reject`);
  console.log(`   PUT  /api/swaps/:swapId/schedule`);
  console.log(`   PUT  /api/swaps/:swapId/reschedule`);
  console.log(`   PUT  /api/swaps/:swapId/respond-time`);
  console.log(`   PUT  /api/swaps/:swapId/confirm-time`);
  console.log(`   GET  /api/swaps/:swapId/room`);
  console.log(`   POST /api/swaps/:swapId/notes`);
  console.log(`   POST /api/swaps/:swapId/chat`);
  console.log(`   PUT  /api/swaps/:swapId/complete`);
});