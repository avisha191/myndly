require('dotenv').config();   // Load env variables from .env
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors'); // Import cors
const authRoutes = require('./routes/auth');
const chatbotRoutes = require('./routes/chatbot');
const journalRoutes = require('./routes/journal');  // <--- added
const moodRoutes = require('./routes/moodRoutes');  // match exact file name
const insightsRoutes = require("./routes/insights");
const userRoutes = require("./routes/user");


const app = express();        // Create app

// Enable CORS so frontend (localhost:3000) can call backend (localhost:5000)
app.use(cors());

// Middleware to parse JSON
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatbotRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/moods', moodRoutes);
app.use("/api/insights", insightsRoutes);
app.use("/api/user", userRoutes)


// Example of a protected route
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid token' });
  }
}

app.get('/api/secure', authMiddleware, (req, res) => {
  res.json({ message: `Hello ${req.user.email}, this is a protected route` });
});

// Health check route
app.get('/', (req, res) => {
  res.send('🌸 Backend running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Server is running at http://localhost:${PORT}`)
);




