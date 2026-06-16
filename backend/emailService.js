const nodemailer = require('nodemailer');
const axios = require('axios');
const dns = require('dns');

// Force Node's DNS resolver to prioritize IPv4 addresses.
if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

// Environment Credentials
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const BREVO_API_KEY = process.env.BREVO_API_KEY;

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

const SMTP_FROM = process.env.SMTP_FROM || (SMTP_USER ? `SkillFetch <${SMTP_USER}>` : 'no-reply@skillfetch.com');

// Initialize SMTP transporter if SMTP credentials are provided (fallback for non-Render environments)
let smtpTransporter = null;
if (SMTP_USER && SMTP_PASS) {
  const config = {
    family: 4,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  };
  if (SMTP_HOST && SMTP_HOST.includes('gmail')) {
    config.service = 'gmail';
  } else if (SMTP_HOST) {
    config.host = SMTP_HOST;
    config.port = SMTP_PORT;
    config.secure = SMTP_PORT === 465;
  } else {
    config.host = 'localhost';
    config.port = SMTP_PORT;
  }
  smtpTransporter = nodemailer.createTransport(config);
}

/**
 * Universal email sender. Automatically checks environment variables and chooses 
 * the appropriate delivery method: SendGrid API, Brevo API, SMTP, or Console Logging.
 */
async function sendMail({ to, subject, html }) {
  const fromName = 'SkillFetch';
  // Strip HTML tags for from email address
  const fromEmail = SMTP_FROM.includes('<') ? SMTP_FROM.split('<')[1].replace('>', '').trim() : SMTP_FROM;

  // 1. Check for SendGrid HTTP API (Port 443 - Allowed on Render)
  if (SENDGRID_API_KEY) {
    try {
      console.log(`✉️ Mailer: Sending email to ${to} via SendGrid HTTP API...`);
      const response = await axios.post('https://api.sendgrid.com/v3/mail/send', {
        personalizations: [{ to: [{ email: to }] }],
        from: { email: fromEmail, name: fromName },
        subject: subject,
        content: [{ type: 'text/html', value: html }]
      }, {
        headers: {
          'Authorization': `Bearer ${SENDGRID_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      console.log(`✅ Mailer: SendGrid email sent successfully (Status: ${response.status})`);
      return true;
    } catch (error) {
      console.error('❌ Mailer: SendGrid API error details:', error.response ? error.response.data : error.message);
      throw error;
    }
  }

  // 2. Check for Brevo HTTP API (Port 443 - Allowed on Render)
  if (BREVO_API_KEY) {
    try {
      console.log(`✉️ Mailer: Sending email to ${to} via Brevo HTTP API...`);
      const response = await axios.post('https://api.brevo.com/v3/smtp/email', {
        sender: { name: fromName, email: fromEmail },
        to: [{ email: to }],
        subject: subject,
        htmlContent: html
      }, {
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json'
        }
      });
      console.log(`✅ Mailer: Brevo email sent successfully (MessageId: ${response.data.messageId})`);
      return true;
    } catch (error) {
      console.error('❌ Mailer: Brevo API error details:', error.response ? error.response.data : error.message);
      throw error;
    }
  }

  // 3. Fallback to standard SMTP (May fail on Render due to port blocks, but works locally)
  if (smtpTransporter) {
    try {
      console.log(`✉️ Mailer: Sending email to ${to} via SMTP...`);
      const info = await smtpTransporter.sendMail({
        from: SMTP_FROM,
        to: to,
        subject: subject,
        html: html
      });
      console.log(`✅ Mailer: SMTP email sent successfully (MessageId: ${info.messageId})`);
      return true;
    } catch (error) {
      console.error('❌ Mailer: SMTP connection failed. Check if your hosting provider blocks ports 465/587.', error.message);
      throw error;
    }
  }

  // 4. Default Local Development Log fallback
  console.log('\n=================== DUMMY MODE: EMAIL LOGGED ===================');
  console.log(`TO: ${to}`);
  console.log(`SUBJECT: ${subject}`);
  console.log('HTML CONTENT:');
  console.log(html);
  console.log('=======================================================================\n');
  return true;
}

/**
 * Sends a welcome email to a new user
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

  return sendMail({ to: user.email, subject, html: htmlContent });
}

/**
 * Sends a job offer / hired email to a candidate containing employer details and job info
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

  return sendMail({ to: candidate.email, subject, html: htmlContent });
}

module.exports = {
  sendWelcomeEmail,
  sendHiredEmail
};
