const mongoose = require('mongoose');

// ==================== USER SCHEMA ====================
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['candidate', 'employer', 'admin'] },
  isSuspended: { type: Boolean, default: false },
  
// Candidate profile fields
  phone: { type: String, default: '' },
  location: { type: String, default: '' },
  bio: { type: String, default: '' },
  skills: { type: String, default: '' },
  education: { type: String, default: '' },
  experience: { type: String, default: '' },
  
  // NATIVE MONGODB FILE STORAGE
  resume: {
    data: { type: Buffer, select: false }, // 'select: false' prevents this heavy data from slowing down normal user queries
    contentType: { type: String },
    name: { type: String }
  },

  // Employer profile fields
  companyName: { type: String, defaut: '' },
  companyLocation: { type: String, default: '' },
  companyDesc: { type: String, default: '' }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// ==================== JOB SCHEMA ====================
// ==================== JOB SCHEMA ====================
const jobSchema = new mongoose.Schema({
  // Make employerId optional for API-fetched jobs
  employerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
  
  // New field to identify where the job came from
  source: { type: String, default: 'SkillFetch' }, 
  
  companyName: { type: String, required: true },
  companyLogo: { type: String, default: '' },
  title: { type: String, required: true },
  
  // Make category/qualifications optional for Adzuna jobs
  category: { type: String },
  description: { type: String, required: true },
  qualifications: { type: String },
  
  salaryRange: { type: String, required: true },
  location: { type: String, required: true },
  type: { type: String, required: true },
  
  // Make experience/skills optional for Adzuna jobs
  experienceLevel: { type: String },
  skillsRequired: { type: String }
}, {
  timestamps: true,
  // ... (rest of your toJSON logic remains exactly the same)
});

// ==================== APPLICATION SCHEMA ====================
const applicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, default: 'Applied', enum: ['Applied', 'Shortlisted', 'Hired', 'Rejected'] },
  coverLetter: { type: String, required: true }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

const User = mongoose.model('User', userSchema);
const Job = mongoose.model('Job', jobSchema);
const Application = mongoose.model('Application', applicationSchema);

module.exports = { User, Job, Application };
