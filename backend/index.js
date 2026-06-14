const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
const { User } = require('./models'); // If models.js is in the same folder as index.js
require('dotenv').config();
const cors = require("cors");
const app = express(); 

// Middleware
app.use(cors());
app.use(express.json());



// 2. Configure CORS to explicitly trust your Vercel frontend
app.use(cors({
  origin: 'https://skillfetch-portal.vercel.app', // No trailing slash at the end!
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true // Important if you are passing cookies or authorization headers
}));


app.use(express.json()); // Your existing body parser


// ==========================================
// RESUME UPLOAD CONFIGURATION (MEMORY STORAGE)
// ==========================================

// 1. Tell Multer to hold the file in RAM instead of saving to a folder
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 2. The API endpoint to save the file into MongoDB
app.post('/upload-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const userId = req.body.userId;

    // Save the raw buffer data, the file type (e.g., application/pdf), and the original name
    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      { 
        resume: {
          data: req.file.buffer,
          contentType: req.file.mimetype,
          name: req.file.originalname
        }
      }, 
      { new: true } 
    );


    if (!updatedUser) {
       return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ 
      message: "Resume saved to database successfully", 
      // We send back the name so the frontend knows it worked, but NOT the heavy buffer data
      resumeName: req.file.originalname 
    });

  } catch (error) {
    console.error("Database Upload Error:", error);
    res.status(500).json({ message: "Server error during database upload" });
  }
});


// 3. The API endpoint to retrieve and download the file from MongoDB
app.get('/api/users/:id/resume', async (req, res) => {
  try {
    // We explicitly ask Mongoose to include the heavy 'resume.data' field this time
    const user = await User.findById(req.params.id).select('+resume.data');

    if (!user || !user.resume || !user.resume.data) {
      return res.status(404).json({ message: "No resume found for this user." });
    }

    // Tell the browser what kind of file this is (PDF, DOCX, etc.)
    res.set('Content-Type', user.resume.contentType);
    
    // Tell the browser to display it or download it with the original file name
    res.set('Content-Disposition', `inline; filename="${user.resume.name}"`);

    // Send the raw binary data back to the browser
    res.send(user.resume.data);

  } catch (error) {
    console.error("Download Error:", error);
    res.status(500).json({ message: "Error retrieving the file from the database." });
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
;

