const { User, Job, Application } = require('./models');

async function seedDatabase() {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('Database already has data. Skipping seeding.');
      return;
    }

    console.log('Seeding initial database data...');

    // 1. Seed Users
    const adminUser = new User({
      name: 'System Admin',
      email: 'admin@jobportal.com',
      password: 'admin123',
      role: 'admin',
      isSuspended: false
    });
    await adminUser.save();

    const candidateUser = new User({
      name: 'John Doe (Candidate)',
      email: 'candidate@jobportal.com',
      password: 'candidate123',
      role: 'candidate',
      isSuspended: false,
      phone: '123-456-7890',
      location: 'New York',
      bio: 'Web developer.',
      skills: 'React, HTML, CSS',
      education: 'BS Computer Science',
      experience: '1 year React Dev',
      resumeName: 'john_resume.pdf'
    });
    await candidateUser.save();

    const employerUser = new User({
      name: 'Jane Smith (Employer)',
      email: 'employer@jobportal.com',
      password: 'employer123',
      role: 'employer',
      isSuspended: false,
      companyName: 'Aura Tech Inc',
      companyLocation: 'San Francisco',
      companyDesc: 'Creative software agency.'
    });
    await employerUser.save();

    console.log('Users seeded successfully!');

    // 2. Seed Jobs
    const job1 = new Job({
      employerId: employerUser._id,
      companyName: 'Aura Tech Inc',
      title: 'React Frontend Developer',
      category: 'Frontend Development',
      description: 'Build simple and clean user interfaces. Focus on HTML, CSS and React state management.',
      qualifications: 'Basic React knowledge.',
      salaryRange: '$80,000 - $90,000',
      location: 'San Francisco (Hybrid)',
      type: 'Full-time',
      experienceLevel: 'Junior',
      skillsRequired: 'React, HTML, CSS'
    });
    await job1.save();

    const job2 = new Job({
      employerId: employerUser._id,
      companyName: 'Aura Tech Inc',
      title: 'Web Designer',
      category: 'Design & Creative',
      description: 'Create simple page layouts in Figma and convert them to basic HTML templates.',
      qualifications: 'Good design eye.',
      salaryRange: '$60,000 - $70,000',
      location: 'Remote',
      type: 'Full-time',
      experienceLevel: 'Junior',
      skillsRequired: 'Figma, HTML, CSS'
    });
    await job2.save();

    console.log('Jobs seeded successfully!');

    // 3. Seed Applications
    const application = new Application({
      jobId: job1._id,
      candidateId: candidateUser._id,
      status: 'Applied',
      coverLetter: 'I am excited to apply for this job. I have 1 year of basic React experience.'
    });
    await application.save();

    console.log('Applications seeded successfully!');
    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

module.exports = seedDatabase;
