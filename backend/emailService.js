const { Resend } = require('resend');

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SMTP_FROM = process.env.SMTP_FROM || 'SkillFetch <onboarding@resend.dev>';

let resend = null;
let isDevMode = true;

if (RESEND_API_KEY) {
  resend = new Resend(RESEND_API_KEY);
  isDevMode = false;
  console.log('✉️ Mailer: Initialized with Resend HTTP API.');
} else {
  console.log('✉️ Mailer: RESEND_API_KEY is not configured in backend/.env. Running in console logging (development) fallback mode.');
}

/**
 * Sends a welcome email to a new user
 * @param {Object} user - User document
 */
async function sendWelcomeEmail(user) {
  const subject = 'Welcome to SkillFetch - Start Your Journey!';
  const roleText = user.role === 'employer' ? 'employer/recruiter' : 'job seeker/candidate';
  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 20px; color: #333333; line-height: 1.6;">
      <h2 style="color: #1546ab; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Welcome to SkillFetch!</h2>
      <p>Hello <strong>${user.name}</strong>,</p>
      <p>Thank you for registering on the <strong>SkillFetch</strong> job portal. We are thrilled to welcome you to our community as a <strong>${roleText}</strong>.</p>
      
      ${user.role === 'candidate' ? `
        <div style="background-color: #f3f4f6; border-left: 4px solid #1546ab; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <h4 style="margin: 0 0 8px 0; color: #213767;">Next Steps for Candidates:</h4>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Complete your profile and select your avatar.</li>
            <li>Upload your professional resume (PDF format).</li>
            <li>Explore recommended jobs and apply directly with custom cover letters.</li>
            <li>Connect with fellow professionals and recruiters to build your network.</li>
          </ul>
        </div>
      ` : `
        <div style="background-color: #f3f4f6; border-left: 4px solid #1546ab; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <h4 style="margin: 0 0 8px 0; color: #213767;">Next Steps for Employers:</h4>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Manage your company profile details.</li>
            <li>Post new job listings to attract high-quality candidates.</li>
            <li>Review candidate applications and track their status in real-time.</li>
            <li>Hire candidates and automatically send offer notifications.</li>
          </ul>
        </div>
      `}

      <p>If you have any questions or need support, feel free to reach out to our team at support@skillfetch.com.</p>
      <p style="margin-top: 30px; font-size: 14px; color: #777777;">
        Best regards,<br>
        <strong>The SkillFetch Team</strong>
      </p>
      <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0 10px 0;">
      <p style="font-size: 11px; color: #9ca3af; text-align: center;">
        © 2026 SkillFetch Job Portal. All Rights Reserved.
      </p>
    </div>
  `;

  if (isDevMode) {
    console.log('\n=================== RESEND API FALLBACK LOG (WELCOME) ===================');
    console.log(`TO: ${user.email}`);
    console.log(`SUBJECT: ${subject}`);
    console.log('HTML CONTENT:');
    console.log(htmlContent);
    console.log('=========================================================================\n');
    return true;
  }

  try {
    const response = await resend.emails.send({
      from: SMTP_FROM,
      to: user.email,
      subject: subject,
      html: htmlContent,
    });
    
    if (response.error) {
      console.error(`❌ Resend API failed to send welcome email to ${user.email}:`, response.error);
      throw new Error(response.error.message || 'Resend error');
    }
    
    console.log(`✉️ Welcome email sent successfully to ${user.email} (Id: ${response.data.id})`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send welcome email to ${user.email}:`, error);
    throw error;
  }
}

/**
 * Sends a job offer / hired email to a candidate containing employer details and job info
 * @param {Object} application - Populated application document
 */
async function sendHiredEmail(application) {
  const candidate = application.candidateId;
  const job = application.jobId;
  const employer = job.employerId; // Populated employer details

  if (!candidate || !job) {
    console.error('❌ Cannot send hired email: candidate or job object is missing/unpopulated.');
    return false;
  }

  const subject = `Congratulations! You have been Hired at ${job.companyName}`;
  const employerName = employer ? employer.name : 'SkillFetch Partner';
  const employerEmail = employer ? employer.email : 'support@skillfetch.com';

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 20px; color: #333333; line-height: 1.6;">
      <h2 style="color: #10b981; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">🎉 Congratulations, ${candidate.name}!</h2>
      <p>We are absolutely thrilled to inform you that you have been selected and <strong>hired</strong> for the following position on <strong>SkillFetch</strong>:</p>
      
      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 25px 0;">
        <h3 style="margin-top: 0; color: #15803d; font-size: 18px;">Job Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; font-weight: bold; width: 130px; color: #374151;">Role:</td>
            <td style="padding: 6px 0; color: #4b5563;">${job.title}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #374151;">Company:</td>
            <td style="padding: 6px 0; color: #4b5563;">${job.companyName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #374151;">Location:</td>
            <td style="padding: 6px 0; color: #4b5563;">${job.location}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #374151;">Job Type:</td>
            <td style="padding: 6px 0; color: #4b5563;">${job.type}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #374151;">Salary:</td>
            <td style="padding: 6px 0; color: #4b5563;">${job.salaryRange}</td>
          </tr>
        </table>
      </div>

      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 25px 0;">
        <h3 style="margin-top: 0; color: #1e293b; font-size: 18px;">Employer Contact Info</h3>
        <p style="margin-bottom: 5px;">Please get in touch with your hiring manager to discuss the next steps, including your offer letter, joining date, and onboarding process:</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; font-weight: bold; width: 130px; color: #374151;">Contact Person:</td>
            <td style="padding: 6px 0; color: #4b5563;">${employerName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #374151;">Email Address:</td>
            <td style="padding: 6px 0; color: #4b5563;">
              <a href="mailto:${employerEmail}" style="color: #1546ab; text-decoration: none; font-weight: 500;">${employerEmail}</a>
            </td>
          </tr>
        </table>
      </div>

      <p>Thank you for using SkillFetch to pursue your professional goals. We wish you the absolute best in this exciting new chapter of your career!</p>
      
      <p style="margin-top: 30px; font-size: 14px; color: #777777;">
        Warm congratulations,<br>
        <strong>The SkillFetch Team</strong>
      </p>
      <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0 10px 0;">
      <p style="font-size: 11px; color: #9ca3af; text-align: center;">
        © 2026 SkillFetch Job Portal. All Rights Reserved.
      </p>
    </div>
  `;

  if (isDevMode) {
    console.log('\n=================== RESEND API FALLBACK LOG (HIRED) ===================');
    console.log(`TO: ${candidate.email}`);
    console.log(`SUBJECT: ${subject}`);
    console.log('HTML CONTENT:');
    console.log(htmlContent);
    console.log('========================================================================\n');
    return true;
  }

  try {
    const response = await resend.emails.send({
      from: SMTP_FROM,
      to: candidate.email,
      subject: subject,
      html: htmlContent,
    });
    
    if (response.error) {
      console.error(`❌ Resend API failed to send hired offer email to ${candidate.email}:`, response.error);
      throw new Error(response.error.message || 'Resend error');
    }
    
    console.log(`✉️ Hired offer email sent successfully to ${candidate.email} (Id: ${response.data.id})`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send hired email to ${candidate.email}:`, error);
    throw error;
  }
}

module.exports = {
  sendWelcomeEmail,
  sendHiredEmail
};
