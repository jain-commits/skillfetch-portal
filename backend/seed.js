const mongoose = require('mongoose');
const axios = require('axios'); // Used to fetch the images on the backend
const { User, Job, Application } = require('./models');

// ==========================================
// DUMMY DATA POOLS FOR GENERATION
// ==========================================

const companies = [
  'Tata Consultancy Services', 'Infosys', 'Wipro', 'HCL Technologies', 'Tech Mahindra', 
  'LTIMindtree', 'Mphasis', 'Persistent Systems', 'Coforge', 'Oracle Financial Services',
  'Hexaware Technologies', 'KPIT Technologies', 'Birlasoft', 'Zensar Technologies', 
  'Cyient', 'Sonata Software', 'Newgen Software', 'Ramco Systems', 'Sasken Technologies', 
  'eClerx', 'Flipkart', 'Paytm', 'PhonePe', 'Zomato', 'Swiggy', 'Ola', 'Razorpay', 
  'CRED', 'Meesho', 'Myntra', 'Nykaa', 'Freshworks', 'Zoho', 'BrowserStack', 'Postman', 
  'Unacademy', 'upGrad', 'NoBroker', 'Policybazaar', 'Lenskart', 'Reliance Jio', 
  'Bharti Airtel', 'Vodafone Idea', 'BSNL', 'Tata Communications', 'Microsoft', 
  'Google', 'Apple', 'Amazon', 'Meta', 'IBM', 'Oracle', 'Salesforce', 'Adobe', 'SAP', 
  'Intel', 'AMD', 'NVIDIA', 'Cisco', 'Dell Technologies', 'HP', 'Lenovo', 'Accenture', 
  'Capgemini', 'Cognizant', 'OpenAI', 'Netflix', 'Spotify', 'Uber', 'Samsung', 'Sony'
];

const companyDomains = {
  'Tata Consultancy Services': 'tcs.com', 'Infosys': 'infosys.com', 'Wipro': 'wipro.com', 
  'HCL Technologies': 'hcltech.com', 'Tech Mahindra': 'techmahindra.com', 'LTIMindtree': 'ltimindtree.com', 
  'Mphasis': 'mphasis.com', 'Persistent Systems': 'persistent.com', 'Coforge': 'coforge.com', 
  'Oracle Financial Services': 'oracle.com', 'Hexaware Technologies': 'hexaware.com', 
  'KPIT Technologies': 'kpit.com', 'Birlasoft': 'birlasoft.com', 'Zensar Technologies': 'zensar.com', 
  'Cyient': 'cyient.com', 'Sonata Software': 'sonata-software.com', 'Newgen Software': 'newgensoft.com', 
  'Ramco Systems': 'ramco.com', 'Sasken Technologies': 'sasken.com', 'eClerx': 'eclerx.com', 
  'Flipkart': 'flipkart.com', 'Paytm': 'paytm.com', 'PhonePe': 'phonepe.com', 'Zomato': 'zomato.com', 
  'Swiggy': 'swiggy.com', 'Ola': 'olacabs.com', 'Razorpay': 'razorpay.com', 'CRED': 'cred.club', 
  'Meesho': 'meesho.com', 'Myntra': 'myntra.com', 'Nykaa': 'nykaa.com', 'Freshworks': 'freshworks.com', 
  'Zoho': 'zoho.com', 'BrowserStack': 'browserstack.com', 'Postman': 'postman.com', 'Unacademy': 'unacademy.com', 
  'upGrad': 'upgrad.com', 'NoBroker': 'nobroker.in', 'Policybazaar': 'policybazaar.com', 'Lenskart': 'lenskart.com', 
  'Reliance Jio': 'jio.com', 'Bharti Airtel': 'airtel.in', 'Vodafone Idea': 'myvi.in', 'BSNL': 'bsnl.co.in', 
  'Tata Communications': 'tatacommunications.com', 'Microsoft': 'microsoft.com', 'Google': 'google.com', 
  'Apple': 'apple.com', 'Amazon': 'amazon.com', 'Meta': 'meta.com', 'IBM': 'ibm.com', 'Oracle': 'oracle.com', 
  'Salesforce': 'salesforce.com', 'Adobe': 'adobe.com', 'SAP': 'sap.com', 'Intel': 'intel.com', 'AMD': 'amd.com', 
  'NVIDIA': 'nvidia.com', 'Cisco': 'cisco.com', 'Dell Technologies': 'dell.com', 'HP': 'hp.com', 
  'Lenovo': 'lenovo.com', 'Accenture': 'accenture.com', 'Capgemini': 'capgemini.com', 'Cognizant': 'cognizant.com', 
  'OpenAI': 'openai.com', 'Netflix': 'netflix.com', 'Spotify': 'spotify.com', 'Uber': 'uber.com', 
  'Samsung': 'samsung.com', 'Sony': 'sony.com'
};

const locations = [
  'Bangalore, Karnataka', 'Bangalore, Karnataka', 'Bangalore, Karnataka', 
  'Trivandrum, Kerala', 'Trivandrum, Kerala', 'Kochi, Kerala', 'Kochi, Kerala', 
  'Kozhikode, Kerala', 'Chennai, Tamil Nadu', 'Hyderabad, Telangana', 
  'Pune, Maharashtra', 'Mumbai, Maharashtra', 'Gurugram, Haryana', 'Noida, UP',
  'Remote - India'
];

const jobTitles = [
  { title: 'Frontend Developer', category: 'Software Development', skills: 'React, Angular, HTML, CSS, JavaScript' },
  { title: 'Backend Engineer', category: 'Software Development', skills: 'Node.js, Express, Python, Java, Spring Boot' },
  { title: 'Full Stack Developer', category: 'Software Development', skills: 'MERN Stack, REST APIs, MongoDB, SQL' },
  { title: 'Data Scientist', category: 'Data Science & Analytics', skills: 'Python, Machine Learning, Pandas, SQL' },
  { title: 'DevOps Engineer', category: 'DevOps & Cloud', skills: 'AWS, Docker, Kubernetes, CI/CD, Jenkins' },
  { title: 'UI/UX Designer', category: 'Design & UX', skills: 'Figma, Adobe XD, Sketch, Wireframing' },
  { title: 'Product Manager', category: 'Product Management', skills: 'Agile, Scrum, Roadmap Planning, Jira' },
  { title: 'Android Developer', category: 'Software Development', skills: 'Kotlin, Java, Android Studio' },
  { title: 'iOS Developer', category: 'Software Development', skills: 'Swift, Objective-C, Xcode' },
  { title: 'Cloud Architect', category: 'DevOps & Cloud', skills: 'AWS, Azure, GCP, System Design' }
];

const types = ['Full-time', 'Full-time', 'Contract', 'Internship'];
const levels = ['Junior', 'Mid-Level', 'Senior'];

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const generateSalary = (level) => {
  let min = level === 'Junior' ? 4 : level === 'Mid-Level' ? 8 : 18;
  let max = min + (level === 'Junior' ? 3 : level === 'Mid-Level' ? 6 : 12);
  return `₹${min},00,000 - ₹${max},00,000 INR`;
};

// HELPER FUNCTION: Downloads image on the server and converts it to a Base64 Data URI
async function downloadLogoAsBase64(domain, companyName) {
  try {
    if (!domain) throw new Error("No domain");
    const url = `https://logo.clearbit.com/${domain}`;
    
    // Download image as binary arraybuffer
    const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 5000 });
    const base64 = Buffer.from(response.data, 'binary').toString('base64');
    const contentType = response.headers['content-type'] || 'image/png';
    
    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    // Fallback directly to a pre-rendered text avatar link if the download fails
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=0056b3&color=fff&size=128`;
  }
}

async function seedDatabase() {
  try {
    console.log('Starting Database Seed Process...');

    // 1. SEED USERS (Kept completely intact)
    let adminUser = await User.findOne({ email: 'admin@jobportal.com' });
    if (!adminUser) {
      adminUser = new User({ name: 'System Admin', email: 'admin@jobportal.com', password: 'admin123', role: 'admin', isSuspended: false });
      await adminUser.save();
    }
    let candidateUser = await User.findOne({ email: 'fasil@jobportal.com' });
    if (!candidateUser) {
      candidateUser = new User({ name: 'Fasil V (Candidate)', email: 'fasil@jobportal.com', password: 'fasil123', role: 'candidate', isSuspended: false, phone: '123-456-7890', location: 'New York', bio: 'Web developer.', skills: 'React, HTML, CSS', education: 'BS Computer Science', experience: '1 year React Dev', resumeName: 'fasil_resume.pdf' });
      await candidateUser.save();
    }
    let employerUser = await User.findOne({ email: 'employer@jobportal.com' });
    if (!employerUser) {
      employerUser = new User({ name: 'Ajay S (Employer)', email: 'employer@jobportal.com', password: 'employer123', role: 'employer', isSuspended: false, companyName: 'Aura Tech Inc', companyLocation: 'San Francisco', companyDesc: 'Creative software agency.' });
      await employerUser.save();
    }

    // 2. PRE-DOWNLOAD UNIQUE LOGOS TO MEMORY TO SPEED UP INSERTS
    console.log('Fetching and encoding company logos directly into server memory...');
    const logoCache = {};
    for (const company of companies) {
      const domain = companyDomains[company];
      logoCache[company] = await downloadLogoAsBase64(domain, company);
    }
    console.log('🎯 All logos converted to database-ready strings.');

    // 3. GENERATE 100 JOBS WITH EMBEDDED LOGOS
    await Job.deleteMany({});
    console.log('🧹 Cleared old job postings.');

    const jobsToInsert = [];
    for (let i = 0; i < 100; i++) {
      const level = getRandom(levels);
      const roleData = getRandom(jobTitles);
      const company = getRandom(companies);
      const type = getRandom(types);
      
      let finalTitle = type === 'Internship' ? `${roleData.title} Intern` : `${level} ${roleData.title}`;

      jobsToInsert.push({
        employerId: employerUser._id,
        companyName: company,
        companyLogo: logoCache[company], // <--- SAVED AS RAW IMAGE DATA IN MONGODB
        title: finalTitle,
        category: roleData.category,
        description: `<strong>About the Role:</strong><br/>${company} is looking for a talented ${finalTitle}. You will design, develop, and maintain efficient code while collaborating with global product squads.`,
        qualifications: `Bachelor's degree in Engineering, Computer Science or equivalent technical field. Strong grasp of programming fundamentals.`,
        salaryRange: type === 'Internship' ? '₹20,000 - ₹35,000 / month' : generateSalary(level),
        location: getRandom(locations),
        type: type,
        experienceLevel: level,
        skillsRequired: roleData.skills,
        source: 'SkillFetch'
      });
    }

    const insertedJobs = await Job.insertMany(jobsToInsert);
    console.log(`✅ Successfully stored ${insertedJobs.length} jobs with built-in images inside MongoDB!`);

    // 4. SEED APPLICATION
    const appCount = await Application.countDocuments();
    if (appCount === 0 && insertedJobs.length > 0 && candidateUser) {
      const application = new Application({ jobId: insertedJobs[0]._id, candidateId: candidateUser._id, status: 'Applied', coverLetter: 'Applying with database-backed profile data.' });
      await application.save();
    }

    console.log('🚀 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during database seeding:', error);
  }
}

module.exports = seedDatabase;;









// OLD SEEDING LOGIC (RETAINED FOR REFERENCE, NOT USED IN CURRENT VERSION)
// const https = require('https');
// const { User, Job, Application } = require('./models');

// // Helper to fetch JSON using Node's native HTTPS module (compatible with all Node.js versions)
// function fetchJson(url) {
//   return new Promise((resolve, reject) => {
//     https.get(url, { headers: { 'User-Agent': 'NodeJS/Skillfetch' } }, (res) => {
//       if (res.statusCode !== 200) {
//         reject(new Error(`Failed to fetch: Status Code ${res.statusCode}`));
//         return;
//       }
//       let data = '';
//       res.on('data', (chunk) => { data += chunk; });
//       res.on('end', () => {
//         try {
//           resolve(JSON.parse(data));
//         } catch (e) {
//           reject(e);
//         }
//       });
//     }).on('error', (err) => {
//       reject(err);
//     });
//   });
// }



// // Normalize job type to match enum: ['Full-time', 'Part-time', 'Contract', 'Internship']
// function normalizeJobType(jobType) {
//   if (!jobType) return 'Full-time';
//   let typeStr = '';
//   if (Array.isArray(jobType)) {
//     typeStr = jobType.join(' ');
//   } else if (typeof jobType === 'string') {
//     typeStr = jobType;
//   } else {
//     typeStr = String(jobType);
//   }
//   const lt = typeStr.toLowerCase();
//   if (lt.includes('full')) return 'Full-time';
//   if (lt.includes('part')) return 'Part-time';
//   if (lt.includes('contract')) return 'Contract';
//   if (lt.includes('intern')) return 'Internship';
//   return 'Full-time';
// }

// // Parse experience level from title: ['Junior', 'Mid-Level', 'Senior']
// function parseExperienceLevel(title) {
//   if (!title) return 'Mid-Level';
//   const lt = title.toLowerCase();
//   if (lt.includes('senior') || lt.includes('lead') || lt.includes('sr') || lt.includes('principal') || lt.includes('architect')) {
//     return 'Senior';
//   }
//   if (lt.includes('junior') || lt.includes('jr') || lt.includes('intern') || lt.includes('entry') || lt.includes('associate')) {
//     return 'Junior';
//   }
//   return 'Mid-Level';
// }

// async function seedDatabase() {
//   try {
//     console.log('Seeding database users check...');


    
//     // 1. Seed/Ensure Users Exist
//     let adminUser = await User.findOne({ email: 'admin@jobportal.com' });
//     if (!adminUser) {
//       adminUser = new User({
//         name: 'System Admin',
//         email: 'admin@jobportal.com',
//         password: 'admin123',
//         role: 'admin',
//         isSuspended: false
//       });
//       await adminUser.save();
//       console.log('Admin user seeded.');
//     }

//     let candidateUser = await User.findOne({ email: 'fasil@jobportal.com' });
//     if (!candidateUser) {
//       candidateUser = new User({
//         name: 'Fasil V (Candidate)',
//         email: 'fasil@jobportal.com',
//         password: 'fasil123',
//         role: 'candidate',
//         isSuspended: false,
//         phone: '123-456-7890',
//         location: 'New York',
//         bio: 'Web developer.',
//         skills: 'React, HTML, CSS',
//         education: 'BS Computer Science',
//         experience: '1 year React Dev',
//         resumeName: 'fasil_resume.pdf'
//       });
//       await candidateUser.save();
//       console.log('Candidate user seeded.');
//     }

//     let employerUser = await User.findOne({ email: 'employer@jobportal.com' });
//     if (!employerUser) {
//       employerUser = new User({
//         name: 'Ajay S (Employer)',
//         email: 'employer@jobportal.com',
//         password: 'employer123',
//         role: 'employer',
//         isSuspended: false,
//         companyName: 'Aura Tech Inc',
//         companyLocation: 'San Francisco',
//         companyDesc: 'Creative software agency.'
//       });
//       await employerUser.save();
//       console.log('Employer user seeded.');
//     }

//     // 2. Fetch and Seed Jobs
//     let jobListings = [];
//     try {
//       console.log('Fetching live jobs from Jobicy API...');
//       const response = await fetchJson('https://jobicy.com/api/v2/remote-jobs');
//       if (response && Array.isArray(response.jobs)) {
//         jobListings = response.jobs.slice(0, 15); // Sync top 15 real jobs
//         console.log(`Fetched ${jobListings.length} jobs successfully.`);
//       } else {
//         console.warn('Failed to parse jobs array from Jobicy. Using fallback.');
//       }
//     } catch (err) {
//       console.error('Error fetching jobs from API, falling back to static jobs:', err.message);
//     }

//     let jobIds = [];

//     if (jobListings.length > 0) {
//       // Upsert real fetched jobs
//       for (const apiJob of jobListings) {
//         // Map fields
//         const title = apiJob.jobTitle || 'Software Engineer';
//         const companyName = apiJob.companyName || 'Unknown Company';
        
//         let existingJob = await Job.findOne({ title, companyName });
//         if (!existingJob) {
//           // Parse salary range
//           let salaryRange = '$80,000 - $110,000';
//           if (apiJob.annualSalaryMin && apiJob.annualSalaryMax) {
//             salaryRange = `$${Number(apiJob.annualSalaryMin).toLocaleString()} - $${Number(apiJob.annualSalaryMax).toLocaleString()}`;
//           } else if (apiJob.annualSalaryMin) {
//             salaryRange = `$${Number(apiJob.annualSalaryMin).toLocaleString()}+`;
//           }

//           existingJob = new Job({
//             employerId: employerUser._id,
//             companyName: companyName,
//             companyLogo: apiJob.companyLogo || '',
//             title: title,
//             category: apiJob.jobCategory || 'Software Development',
//             description: apiJob.jobDescription || 'Detailed job description is not provided.',
//             qualifications: 'Relevant technical experience and skills as specified in the description.',
//             salaryRange: salaryRange,
//             location: apiJob.jobGeo || 'Remote',
//             type: normalizeJobType(apiJob.jobType),
//             experienceLevel: parseExperienceLevel(title),
//             skillsRequired: apiJob.jobCategory || 'Software'
//           });
//           await existingJob.save();
//           console.log(`Synced job: ${title} @ ${companyName}`);
//         }
//         jobIds.push(existingJob._id);
//       }
//     } else {

//       // Offline fallback: static jobs
//       const fallbackJobs = [
//         {
//           employerId: employerUser._id,
//           companyName: 'Aura Tech Inc',
//           companyLogo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&w=100&h=100&q=80',
//           title: 'React Frontend Developer',
//           category: 'Frontend Development',
//           description: 'Build simple and clean user interfaces. Focus on HTML, CSS and React state management.',
//           qualifications: 'Basic React knowledge.',
//           salaryRange: '$80,000 - $90,000',
//           location: 'San Francisco (Hybrid)',
//           type: 'Full-time',
//           experienceLevel: 'Junior',
//           skillsRequired: 'React, HTML, CSS'
//         },
//         {
//           employerId: employerUser._id,
//           companyName: 'Aura Tech Inc',
//           companyLogo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=100&h=100&q=80',
//           title: 'Web Designer',
//           category: 'Design & Creative',
//           description: 'Create simple page layouts in Figma and convert them to basic HTML templates.',
//           qualifications: 'Good design eye.',
//           salaryRange: '$60,000 - $70,000',
//           location: 'Remote',
//           type: 'Full-time',
//           experienceLevel: 'Junior',
//           skillsRequired: 'Figma, HTML, CSS'
//         }
//       ];

//       for (const fallback of fallbackJobs) {
//         let existingJob = await Job.findOne({ title: fallback.title, companyName: fallback.companyName });
//         if (!existingJob) {
//           existingJob = new Job(fallback);
//           await existingJob.save();
//           console.log(`Seeded fallback job: ${fallback.title}`);
//         }
//         jobIds.push(existingJob._id);
//       }
//     }

//     // 3. Seed application if none exists
//     const appCount = await Application.countDocuments();
//     if (appCount === 0 && jobIds.length > 0 && candidateUser) {
//       const application = new Application({
//         jobId: jobIds[0],
//         candidateId: candidateUser._id,
//         status: 'Applied',
//         coverLetter: 'I am excited to apply for this job. I have 1 year of basic React experience.'
//       });
//       await application.save();
//       console.log('Seeded candidate application.');
//     }

//     console.log('Seeding/Sync check completed successfully.');
//   } catch (error) {
//     console.error('Error during database seeding:', error);
//   }
// }

// module.exports = seedDatabase;
