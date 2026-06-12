const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
const User = require('./models/User'); // Adjust path to your model
require('dotenv').config();
const cors = require("cors");
const app = express(); 

// Middleware
app.use(cors());
app.use(express.json());

// ==========================================
// RESUME UPLOAD CONFIGURATION (MULTER)
// ==========================================

// 1. Configure where and how Multer should save the files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Saves files to the 'uploads' folder
  },
  filename: (req, file, cb) => {
    // Generates a unique filename using the current timestamp to prevent overwrites
    cb(null, Date.now() + '-' + file.originalname); 
  }
});

const upload = multer({ storage: storage });

// 2. Serve the 'uploads' directory publicly so React can fetch the PDFs later
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 3. The API endpoint to catch the file from React
app.post('/api/upload-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const userId = req.body.userId;
    const filePath = `/uploads/${req.file.filename}`;
    const originalName = req.file.originalname;

    // Update the user in MongoDB with the new file path AND the file name
    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      { 
        resumeUrl: filePath,
        resumeName: originalName 
      }, 
      { new: true } // Returns the updated user document
    );

    if (!updatedUser) {
       return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ 
      message: "Resume uploaded successfully", 
      user: updatedUser 
    });

  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ message: "Server error during upload" });
  }
});

// ==========================================
// STANDARD API ROUTES
// ==========================================

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
    // await seedDatabase(); // Uncomment if you need to run your seeder again

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });