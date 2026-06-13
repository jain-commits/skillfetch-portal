const express = require('express');
const router = express.Router();
const { User, Job, Application } = require('./models');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const cors = require("cors");

// Middleware
router.use(cors());
router.use(express.json());

// ==================== RESUME UPLOAD & DOWNLOAD ROUTES ====================

// 1. Tell Multer to hold the file in RAM (Memory)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// 2. Upload Route
router.post('/upload-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const userId = req.body.userId;

    // Save the raw buffer data, file type, and original name directly to MongoDB
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
      resumeName: req.file.originalname 
    });

  } catch (error) {
    console.error("Database Upload Error:", error);
    res.status(500).json({ message: "Server error during database upload" });
  }
});

// 3. Download/View Route
router.get('/users/:id/resume', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('+resume.data');

    if (!user || !user.resume || !user.resume.data) {
      return res.status(404).json({ message: "No resume found for this user." });
    }

    // --- FIX: Force the browser to read it as a PDF ---
    res.set('Content-Type', 'application/pdf'); 
    res.set('Content-Disposition', `inline; filename="${user.resume.name}"`);

    res.send(user.resume.data);

  } catch (error) {
    console.error("Download Error:", error);
    res.status(500).json({ message: "Error retrieving the file from the database." });
  }
});


// ==================== AUTHENTICATION ROUTES ====================

// Register
router.post('/auth/register', async (req, res) => {
  try {
    const { role, name, email, password, companyName, companyLocation } = req.body;
    
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email already registered!' });
    }

    // Create user data based on role
    const userData = {
      name,
      email,
      password,
      role,
      isSuspended: false
    };

    if (role === 'employer') {
      userData.companyName = companyName;
      userData.companyLocation = companyLocation;
      userData.companyDesc = '';
    }

    const newUser = new User(userData);
    await newUser.save();

    res.status(201).json(newUser);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    
    if (!user) {
      return res.status(401).json({ message: 'Wrong email or password!' });
    }

    if (user.isSuspended) {
      return res.status(403).json({ message: 'Your account is suspended by Admin!' });
    }

    res.json(user);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});


// ==================== USER PROFILE ROUTES ====================

// Update Profile
router.put('/users/:id/profile', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, location, bio, skills, education, experience, resumeName } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = name;
    user.phone = phone;
    user.location = location;
    user.bio = bio;
    user.skills = skills;
    user.education = education;
    user.experience = experience;
    user.resumeName = resumeName;

    await user.save();
    res.json(user);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error during profile update' });
  }
});


// ==================== JOB OPPORTUNITIES ROUTES ====================

// // Get All Jobs
// router.get('/jobs', async (req, res) => {
//   try {
//     const jobs = await Job.find().sort({ createdAt: -1 });
//     res.json(jobs);
//   } catch (error) {
//     console.error('Get jobs error:', error);
//     res.status(500).json({ message: 'Server error fetching jobs' });
//   }
// });

// // Post a Job
// router.post('/jobs', async (req, res) => {
//   try {
//     const {
//       employerId,
//       companyName,
//       title,
//       category,
//       type,
//       location,
//       salaryRange,
//       experienceLevel,
//       skillsRequired,
//       description,
//       qualifications
//     } = req.body;

//     const newJob = new Job({
//       employerId,
//       companyName,
//       title,
//       category,
//       type,
//       location,
//       salaryRange,
//       experienceLevel,
//       skillsRequired,
//       description,
//       qualifications
//     });

//     await newJob.save();
//     res.status(201).json(newJob);
//   } catch (error) {
//     console.error('Post job error:', error);
//     res.status(500).json({ message: 'Server error posting job' });
//   }
// });

// // Delete a Job (Employer/Admin)
// router.delete('/jobs/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
    
//     // Delete job
//     const job = await Job.findByIdAndDelete(id);
//     if (!job) {
//       return res.status(404).json({ message: 'Job not found' });
//     }

//     // Cascade: delete applications for this job
//     await Application.deleteMany({ jobId: id });

//     res.json({ message: 'Job posting deleted and cascaded applications.' });
//   } catch (error) {
//     console.error('Delete job error:', error);
//     res.status(500).json({ message: 'Server error deleting job' });
//   }
// });


// ==================== JOB OPPORTUNITIES ROUTES ====================

// Get All Jobs (Merged Local + Adzuna)
router.get('/jobs', async (req, res) => {
  try {
    // 1. Fetch custom jobs posted by your local Employers in MongoDB
    const localJobs = await Job.find().sort({ createdAt: -1 });
    
    // Map local jobs to ensure they have the standard structure
    const formattedLocalJobs = localJobs.map(job => ({
      id: job._id.toString(),
      employerId: job.employerId,
      title: job.title,
      companyName: job.companyName,
      location: job.location,
      type: job.type,
      salaryRange: job.salaryRange,
      description: job.description,
      source: 'SkillFetch' // Tagging to know it's local
    }));

    // 2. Fetch live jobs from Adzuna API
    const ADZUNA_APP_ID = '39d63b7b';
    const ADZUNA_APP_KEY = '8fb030194b91cf924b6e4a4c8c0e7994';
    
    // 'in' is for India jobs. 'results_per_page=50' grabs a good chunk.
    const adzunaUrl = `https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=${ADZUNA_APP_ID}&app_key=${ADZUNA_APP_KEY}&results_per_page=50`;

    let adzunaJobs = [];
    try {
      // (Note: Requires Node.js v18+ for native fetch. If using an older version, install and use axios)
      const adzunaResponse = await fetch(adzunaUrl);
      const adzunaData = await adzunaResponse.json();

      // Map Adzuna's weird JSON format to exactly match your SkillFetch format!
      adzunaJobs = adzunaData.results.map(job => ({
        id: String(job.id), 
        title: job.title,
        companyName: job.company.display_name,
        location: job.location.display_name,
        // Clean up Adzuna's snake_case job types
        type: job.contract_time === 'full_time' ? 'Full-time' : (job.contract_time === 'part_time' ? 'Part-time' : 'Contract'),
        salaryRange: job.salary_min && job.salary_max ? `₹${job.salary_min} - ₹${job.salary_max}` : 'Not specified',
        // Adzuna sends raw text descriptions
        description: job.description,
        source: 'Adzuna',
        applyUrl: job.redirect_url // The actual link to apply on Adzuna
      }));
    } catch (apiError) {
      console.error("Adzuna API Error:", apiError);
      // If Adzuna crashes, we silently catch it so the app still loads local jobs
    }

    // 3. Combine both lists and send to React
    const allJobs = [...formattedLocalJobs, ...adzunaJobs];
    res.json(allJobs);

  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ message: 'Server error fetching jobs' });
  }
});


// ==================== APPLICATION ROUTES ====================

// Get Applications (with optional filters)
router.get('/applications', async (req, res) => {
  try {
    const { candidateId, jobId } = req.query;
    const filter = {};
    if (candidateId) filter.candidateId = candidateId;
    if (jobId) filter.jobId = jobId;

    const applications = await Application.find(filter).sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ message: 'Server error fetching applications' });
  }
});

// Submit Application
router.post('/applications', async (req, res) => {
  try {
    const { jobId, candidateId, coverLetter } = req.body;

    // Check if already applied
    const alreadyApplied = await Application.findOne({ jobId, candidateId });
    if (alreadyApplied) {
      return res.status(400).json({ message: 'You have already applied for this job listing.' });
    }

    const newApplication = new Application({
      jobId,
      candidateId,
      status: 'Applied',
      coverLetter
    });

    await newApplication.save();
    res.status(201).json(newApplication);
  } catch (error) {
    console.error('Submit application error:', error);
    res.status(500).json({ message: 'Server error submitting application' });
  }
});

// Update Application Status (Employer/Admin)
router.put('/applications/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.status = status;
    await application.save();

    res.json(application);
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Server error updating status' });
  }
});


// ==================== ADMINISTRATIVE BOARD ROUTES ====================

// Get All Users (Admin)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

// Suspend/Unsuspend User
router.put('/users/:id/suspend', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isSuspended = !user.isSuspended;
    await user.save();

    res.json(user);
  } catch (error) {
    console.error('Suspend user error:', error);
    res.status(500).json({ message: 'Server error toggling user suspension' });
  }
});

// Delete User (Cascading)
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Perform cascade delete based on role
    if (user.role === 'candidate') {
      // Delete all applications submitted by candidate
      await Application.deleteMany({ candidateId: id });
    } else if (user.role === 'employer') {
      // Find all jobs posted by employer
      const employerJobs = await Job.find({ employerId: id });
      const jobIds = employerJobs.map(job => job._id);

      // Delete all applications submitted for those jobs
      await Application.deleteMany({ jobId: { $in: jobIds } });

      // Delete all jobs posted by employer
      await Job.deleteMany({ employerId: id });
    }

    // Finally delete the user
    await User.findByIdAndDelete(id);

    res.json({ message: 'User account and all associated jobs/applications deleted successfully.' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error deleting user' });
  }
});

module.exports = router;