const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
const { User } = require('./models'); // If models.js is in the same folder as index.js
require('dotenv').config();
const cors = require("cors");
const app = express(); 

// Middleware
app.use(cors({
  origin: 'https://skillfetch-portal.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));


// API Routes
const apiRoutes = require('./routes');
app.use('/api', apiRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('SkillFetch API Server is running...');
});

// MongoDB connection
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error("MONGODB_URI is not defined!");
  process.exit(1);
}

const seedDatabase = require('./seed');

const PORT = process.env.PORT || 5000;

mongoose.connect(mongoUri)
  .then(async () => {
    console.log('Connected to MongoDB Atlas!');

    
    await seedDatabase(); // Uncomment if you need to run your seeder again

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });
;

