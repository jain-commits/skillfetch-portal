

const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require("cors");

const app = express(); // ✅ correct placement

// Middleware
app.use(cors());
app.use(express.json());

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
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });