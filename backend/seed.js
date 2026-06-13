const https = require('https');
const { User, Job, Application } = require('./models');

// Helper to fetch JSON using Node's native HTTPS module (compatible with all Node.js versions)
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'NodeJS/Skillfetch' } }, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to fetch: Status Code ${res.statusCode}`));
        return;
      }
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Normalize job type to match enum: ['Full-time', 'Part-time', 'Contract', 'Internship']
function normalizeJobType(jobType) {
  if (!jobType) return 'Full-time';
  let typeStr = '';
  if (Array.isArray(jobType)) {
    typeStr = jobType.join(' ');
  } else if (typeof jobType === 'string') {
    typeStr = jobType;
  } else {
    typeStr = String(jobType);
  }
  const lt = typeStr.toLowerCase();
  if (lt.includes('full')) return 'Full-time';
  if (lt.includes('part')) return 'Part-time';
  if (lt.includes('contract')) return 'Contract';
  if (lt.includes('intern')) return 'Internship';
  return 'Full-time';
}

// Parse experience level from title: ['Junior', 'Mid-Level', 'Senior']
function parseExperienceLevel(title) {
  if (!title) return 'Mid-Level';
  const lt = title.toLowerCase();
  if (lt.includes('senior') || lt.includes('lead') || lt.includes('sr') || lt.includes('principal') || lt.includes('architect')) {
    return 'Senior';
  }
  if (lt.includes('junior') || lt.includes('jr') || lt.includes('intern') || lt.includes('entry') || lt.includes('associate')) {
    return 'Junior';
  }
  return 'Mid-Level';
}

async function seedDatabase() {
  try {
    console.log('Seeding database users check...');


    
    // 1. Seed/Ensure Users Exist
    let adminUser = await User.findOne({ email: 'admin@jobportal.com' });
    if (!adminUser) {
      adminUser = new User({
        name: 'System Admin',
        email: 'admin@jobportal.com',
        password: 'admin123',
        role: 'admin',
        isSuspended: false
      });
      await adminUser.save();
      console.log('Admin user seeded.');
    }

    let candidateUser = await User.findOne({ email: 'fasil@jobportal.com' });
    if (!candidateUser) {
      candidateUser = new User({
        name: 'Fasil V (Candidate)',
        email: 'fasil@jobportal.com',
        password: 'fasil123',
        role: 'candidate',
        isSuspended: false,
        phone: '123-456-7890',
        location: 'New York',
        bio: 'Web developer.',
        skills: 'React, HTML, CSS',
        education: 'BS Computer Science',
        experience: '1 year React Dev',
        resumeName: 'fasil_resume.pdf'
      });
      await candidateUser.save();
      console.log('Candidate user seeded.');
    }

    let employerUser = await User.findOne({ email: 'employer@jobportal.com' });
    if (!employerUser) {
      employerUser = new User({
        name: 'Ajay S (Employer)',
        email: 'employer@jobportal.com',
        password: 'employer123',
        role: 'employer',
        isSuspended: false,
        companyName: 'Aura Tech Inc',
        companyLocation: 'San Francisco',
        companyDesc: 'Creative software agency.'
      });
      await employerUser.save();
      console.log('Employer user seeded.');
    }

    // 2. Fetch and Seed Jobs
    let jobListings = [];
    try {
      console.log('Fetching live jobs from Jobicy API...');
      const response = await fetchJson('https://jobicy.com/api/v2/remote-jobs');
      if (response && Array.isArray(response.jobs)) {
        jobListings = response.jobs.slice(0, 15); // Sync top 15 real jobs
        console.log(`Fetched ${jobListings.length} jobs successfully.`);
      } else {
        console.warn('Failed to parse jobs array from Jobicy. Using fallback.');
      }
    } catch (err) {
      console.error('Error fetching jobs from API, falling back to static jobs:', err.message);
    }

    let jobIds = [];

    if (jobListings.length > 0) {
      // Upsert real fetched jobs
      for (const apiJob of jobListings) {
        // Map fields
        const title = apiJob.jobTitle || 'Software Engineer';
        const companyName = apiJob.companyName || 'Unknown Company';
        
        let existingJob = await Job.findOne({ title, companyName });
        if (!existingJob) {
          // Parse salary range
          let salaryRange = '$80,000 - $110,000';
          if (apiJob.annualSalaryMin && apiJob.annualSalaryMax) {
            salaryRange = `$${Number(apiJob.annualSalaryMin).toLocaleString()} - $${Number(apiJob.annualSalaryMax).toLocaleString()}`;
          } else if (apiJob.annualSalaryMin) {
            salaryRange = `$${Number(apiJob.annualSalaryMin).toLocaleString()}+`;
          }

          existingJob = new Job({
            employerId: employerUser._id,
            companyName: companyName,
            companyLogo: apiJob.companyLogo || '',
            title: title,
            category: apiJob.jobCategory || 'Software Development',
            description: apiJob.jobDescription || 'Detailed job description is not provided.',
            qualifications: 'Relevant technical experience and skills as specified in the description.',
            salaryRange: salaryRange,
            location: apiJob.jobGeo || 'Remote',
            type: normalizeJobType(apiJob.jobType),
            experienceLevel: parseExperienceLevel(title),
            skillsRequired: apiJob.jobCategory || 'Software'
          });
          await existingJob.save();
          console.log(`Synced job: ${title} @ ${companyName}`);
        }
        jobIds.push(existingJob._id);
      }
    } else {
      
      // Offline fallback: static jobs
      const fallbackJobs = [
        {
          employerId: employerUser._id,
          companyName: 'Aura Tech Inc',
          companyLogo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&w=100&h=100&q=80',
          title: 'React Frontend Developer',
          category: 'Frontend Development',
          description: 'Build simple and clean user interfaces. Focus on HTML, CSS and React state management.',
          qualifications: 'Basic React knowledge.',
          salaryRange: '$80,000 - $90,000',
          location: 'San Francisco (Hybrid)',
          type: 'Full-time',
          experienceLevel: 'Junior',
          skillsRequired: 'React, HTML, CSS'
        },
        {
          employerId: employerUser._id,
          companyName: 'Aura Tech Inc',
          companyLogo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=100&h=100&q=80',
          title: 'Web Designer',
          category: 'Design & Creative',
          description: 'Create simple page layouts in Figma and convert them to basic HTML templates.',
          qualifications: 'Good design eye.',
          salaryRange: '$60,000 - $70,000',
          location: 'Remote',
          type: 'Full-time',
          experienceLevel: 'Junior',
          skillsRequired: 'Figma, HTML, CSS'
        }
      ];

      for (const fallback of fallbackJobs) {
        let existingJob = await Job.findOne({ title: fallback.title, companyName: fallback.companyName });
        if (!existingJob) {
          existingJob = new Job(fallback);
          await existingJob.save();
          console.log(`Seeded fallback job: ${fallback.title}`);
        }
        jobIds.push(existingJob._id);
      }
    }

    // 3. Seed application if none exists
    const appCount = await Application.countDocuments();
    if (appCount === 0 && jobIds.length > 0 && candidateUser) {
      const application = new Application({
        jobId: jobIds[0],
        candidateId: candidateUser._id,
        status: 'Applied',
        coverLetter: 'I am excited to apply for this job. I have 1 year of basic React experience.'
      });
      await application.save();
      console.log('Seeded candidate application.');
    }

    console.log('Seeding/Sync check completed successfully.');
  } catch (error) {
    console.error('Error during database seeding:', error);
  }
}

module.exports = seedDatabase;
