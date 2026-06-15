const mongoose = require('mongoose');

// ==================== USER SCHEMA ====================
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['candidate', 'employer', 'admin'] },
  isSuspended: { type: Boolean, default: false },
  
  // Profile system enhancements
  avatar: { type: String, default: '' },      // Holds base64 or selected default avatar URL/key
  headline: { type: String, default: '' },    // Professional headline
  companyLogo: { type: String, default: '' }, // For employers, base64 or URL

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
  companyName: { type: String, default: '' },
  companyLocation: { type: String, default: '' },
  companyDesc: { type: String, default: '' }
}, 

  {
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

const jobSchema = new mongoose.Schema({
  employerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
  source: { type: String, default: 'SkillFetch' }, 
  companyName: { type: String, required: true },
  companyLogo: { type: String, default: '' },
  title: { type: String, required: true },
  category: { type: String },
  description: { type: String, required: true },
  qualifications: { type: String },
  salaryRange: { type: String, required: true },
  location: { type: String, required: true },
  type: { type: String, required: true },
  experienceLevel: { type: String },
  skillsRequired: { type: String }
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

// ==================== CONNECTION SCHEMA ====================

const connectionSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }
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

// ==================== STORY / NEWS SCHEMA ====================

const storySchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  summary: { type: String, required: true },
  author: { type: String, default: 'SkillFetch Editorial' },
  readTime: { type: String, default: '3 min read' },
  publishedAt: { type: Date, default: Date.now }
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
const Connection = mongoose.model('Connection', connectionSchema);
const Story = mongoose.model('Story', storySchema);

module.exports = { User, Job, Application, Connection, Story };
