const express = require('express');
const router = express.Router();
const { User, Job, Application, Connection, Story, Avatar } = require('./models');
const multer = require('multer');
const path = require('path');
const { sendWelcomeEmail, sendHiredEmail } = require('./emailService');
const mongoose = require('mongoose');
const cors = require("cors");
const axios = require('axios');



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
    const { role, name, email, password, gender, companyName, companyLocation } = req.body;
    
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
      gender: role === 'candidate' ? (gender || '') : '',
      isSuspended: false
    };

    if (role === 'employer') {
      userData.companyName = companyName;
      userData.companyLocation = companyLocation;
      userData.companyDesc = '';
    }

    const newUser = new User(userData);
    await newUser.save();

    // Trigger welcome email asynchronously
    sendWelcomeEmail(newUser).catch(err => {
      console.error('Welcome email failed to send:', err);
    });

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
    const { 
      name, phone, location, bio, skills, education, experience, resumeName,
      avatar, headline, gender, companyName, companyLocation, companyDesc, companyLogo
    } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = name !== undefined ? name : user.name;
    user.phone = phone !== undefined ? phone : user.phone;
    user.location = location !== undefined ? location : user.location;
    user.bio = bio !== undefined ? bio : user.bio;
    user.skills = skills !== undefined ? skills : user.skills;
    user.education = education !== undefined ? education : user.education;
    user.experience = experience !== undefined ? experience : user.experience;
    user.resumeName = resumeName !== undefined ? resumeName : user.resumeName;
    user.avatar = avatar !== undefined ? avatar : user.avatar;
    user.headline = headline !== undefined ? headline : user.headline;
    user.gender = gender !== undefined ? gender : user.gender;

    if (user.role === 'employer') {
      user.companyName = companyName !== undefined ? companyName : user.companyName;
      user.companyLocation = companyLocation !== undefined ? companyLocation : user.companyLocation;
      user.companyDesc = companyDesc !== undefined ? companyDesc : user.companyDesc;
      user.companyLogo = companyLogo !== undefined ? companyLogo : user.companyLogo;

      // CASCADE UPDATE: Update all jobs posted by this employer
      await Job.updateMany(
        { employerId: id },
        { 
          companyName: user.companyName, 
          companyLogo: user.companyLogo 
        }
      );
    }

    await user.save();
    res.json(user);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error during profile update' });
  }
});


// ==================== JOB OPPORTUNITIES ROUTES ====================

// GET route for jobs (Consolidated Pure MongoDB, No External API)
router.get('/jobs', async (req, res) => {
  try {
    const allJobs = await Job.find().sort({ createdAt: -1 });
    res.json(allJobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Error fetching jobs from database' });
  }
});

// POST route for jobs
router.post('/jobs', async (req, res) => {
  try {
    const {
      employerId,
      companyName,
      companyLogo,
      title,
      category,
      type,
      location,
      salaryRange,
      experienceLevel,
      skillsRequired,
      description,
      qualifications
    } = req.body;

    if (!employerId || !title || !location) {
      return res.status(400).json({ message: "Employer ID, Title, and Location are required." });
    }

    const newJob = new Job({
      employerId,
      companyName,
      companyLogo,
      title,
      category,
      type,
      location,
      salaryRange,
      experienceLevel,
      skillsRequired,
      description,
      qualifications,
      createdAt: new Date()
    });

    await newJob.save();
    res.status(201).json(newJob);
    
  } catch (error) {
    console.error('Post job error:', error);
    res.status(500).json({ message: 'Server error while posting job' });
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

    const oldStatus = application.status;
    application.status = status;
    await application.save();

    // Trigger email notification if status updated to 'Hired'
    if (status === 'Hired' && oldStatus !== 'Hired') {
      try {
        const populatedApp = await Application.findById(application._id)
          .populate('candidateId')
          .populate({
            path: 'jobId',
            populate: { path: 'employerId' }
          });
        if (populatedApp && populatedApp.candidateId && populatedApp.jobId) {
          sendHiredEmail(populatedApp).catch(err => {
            console.error('Hired email notification failed:', err);
          });
        }
      } catch (err) {
        console.error('Failed to trigger hired email flow:', err);
      }
    }

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

// Network Recommendations ("People You May Know")
router.get('/users/network-recommendations', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Valid userId is required' });
    }
    
    // Find all connections for the user
    const conns = await Connection.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    });
    
    const connectedUserIds = conns.map(c => 
      c.senderId.toString() === userId ? c.receiverId.toString() : c.senderId.toString()
    );
    connectedUserIds.push(userId); // Exclude self
    
    // Recommend users who are not connected (excluding admins)
    const recommendations = await User.find({
      _id: { $nin: connectedUserIds },
      role: { $ne: 'admin' },
      isSuspended: false
    }).select('name email avatar headline location bio skills education experience role');
    
    res.json(recommendations);
  } catch (err) {
    console.error('Error fetching recommendations:', err);
    res.status(500).json({ message: 'Error fetching network recommendations' });
  }
});

// Get Single User Profile
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get single user error:', error);
    res.status(500).json({ message: 'Server error fetching user details' });
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

// ==================== NETWORKING (CONNECTION) ROUTES ====================

// Get Connections for a User
router.get('/connections', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Valid userId is required' });
    }
    
    const conns = await Connection.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    }).populate('senderId receiverId', 'name email avatar headline role location');
    
    res.json(conns);
  } catch (err) {
    console.error('Error fetching connections:', err);
    res.status(500).json({ message: 'Error fetching connections' });
  }
});

// Send Connection Request
router.post('/connections/request', async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;
    if (!senderId || !receiverId) {
      return res.status(400).json({ message: 'senderId and receiverId are required' });
    }
    
    // Check if connection already exists
    const existing = await Connection.findOne({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    });
    if (existing) return res.status(400).json({ message: 'Connection or request already exists' });
    
    const conn = new Connection({ senderId, receiverId, status: 'pending' });
    await conn.save();
    
    const populated = await Connection.findById(conn._id).populate('senderId receiverId', 'name email avatar headline role location');
    res.status(201).json(populated);
  } catch (err) {
    console.error('Error sending connection request:', err);
    res.status(500).json({ message: 'Error sending connection request' });
  }
});

// Accept or Reject Request
router.put('/connections/respond', async (req, res) => {
  try {
    const { connectionId, status } = req.body;
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    if (status === 'rejected') {
      await Connection.findByIdAndDelete(connectionId);
      return res.json({ id: connectionId, status: 'rejected', message: 'Connection request rejected and deleted' });
    }
    
    const conn = await Connection.findByIdAndUpdate(connectionId, { status }, { new: true })
      .populate('senderId receiverId', 'name email avatar headline role location');
    if (!conn) return res.status(404).json({ message: 'Connection not found' });
    
    res.json(conn);
  } catch (err) {
    console.error('Error responding to request:', err);
    res.status(500).json({ message: 'Error responding to request' });
  }
});

// Remove connection or cancel request
router.delete('/connections/:id', async (req, res) => {
  try {
    await Connection.findByIdAndDelete(req.params.id);
    res.json({ message: 'Connection removed successfully', id: req.params.id });
  } catch (err) {
    console.error('Error deleting connection:', err);
    res.status(500).json({ message: 'Error deleting connection' });
  }
});


// ==================== CAREER STORIES / NEWS ROUTES ====================

// Get shuffled career stories
router.get('/stories', async (req, res) => {
  try {
    const stories = await Story.find();
    const shuffled = stories.sort(() => 0.5 - Math.random());
    res.json(shuffled);
  } catch (err) {
    console.error('Error fetching stories:', err);
    res.status(500).json({ message: 'Error fetching stories' });
  }
});

// Get all stored avatars
router.get('/avatars', async (req, res) => {
  try {
    const avatars = await Avatar.find({});
    res.json(avatars);
  } catch (err) {
    console.error('Error fetching avatars:', err);
    res.status(500).json({ message: 'Error fetching avatars' });
  }
});

module.exports = router;