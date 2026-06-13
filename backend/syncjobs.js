const axios = require('axios');
const Job = require('../models/Job'); // Your existing Job model

const syncJobsFromAdzuna = async () => {
  console.log("DEBUG: Starting Adzuna Sync..."); // Added log
  try {
    const ADZUNA_APP_ID = '39d63b7b';
    const ADZUNA_APP_KEY = '8fb030194b91cf924b6e4a4c8c0e7994';
    const url = `https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=${ADZUNA_APP_ID}&app_key=${ADZUNA_APP_KEY}&results_per_page=50`;

    const response = await axios.get(url);
    const jobs = response.data.results;
    console.log(`DEBUG: Adzuna returned ${jobs.length} jobs.`); // Added log

    for (const job of jobs) {
      const exists = await Job.findOne({ title: job.title, location: job.location.display_name });
      
      if (!exists) {
        await Job.create({
          title: job.title,
          companyName: job.company.display_name,
          location: job.location.display_name,
          type: job.contract_time === 'full_time' ? 'Full-time' : 'Contract',
          salaryRange: job.salary_min ? `₹${job.salary_min}` : 'Not specified',
          description: job.description,
          source: 'Adzuna',
          companyLogo: 'https://via.placeholder.com/150' // Added default logo
        });
      }
    }
    console.log("DEBUG: Sync finished successfully!");
  } catch (err) {
    console.error("DEBUG: SYNC FAILED:", err.message);
    if (err.response) {
       console.error("DEBUG: RESPONSE DATA:", err.response.data);
    }
  }
};

module.exports = syncJobsFromAdzuna;