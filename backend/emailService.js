const nodemailer = require('nodemailer');
const dns = require('dns');

// Force Node's DNS resolver to prioritize IPv4 addresses.
// This prevents ENETUNREACH errors in environments like Render where outbound IPv6 is blocked.
if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
  console.log('✉️ Mailer: Global DNS resolution configured to prefer IPv4 first.');
}

const SMTP_SERVICE = process.env.SMTP_SERVICE;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM; // Will fall back to SMTP_USER if not set

let transporter = null;
let isTestAccount = false;

/**
 * Gets or initializes the email transporter.
 * If SMTP details are not configured, dynamically creates a test SMTP account via Ethereal Email.
 */
async function getTransporter() {
  if (transporter) return transporter;

  const resolvedFrom = SMTP_FROM || (SMTP_USER ? `SkillFetch <${SMTP_USER}>` : 'no-reply@skillfetch.com');

  if (SMTP_USER && SMTP_PASS) {
    const config = {
      family: 4, // Force IPv4 to bypass ENETUNREACH issues in cloud environments like Render (which lack IPv6 routing)
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      }
    };

    // Auto-detect Gmail to bypass port/SSL connection blocks
    const isGmail = (SMTP_SERVICE && SMTP_SERVICE.toLowerCase() === 'gmail') || 
                    (SMTP_HOST && SMTP_HOST.toLowerCase().includes('gmail'));

    if (isGmail) {
      config.service = 'gmail';
      console.log('✉️ Mailer: Using built-in Gmail service configuration (forcing IPv4).');
    } else if (SMTP_HOST) {
      config.host = SMTP_HOST;
      config.port = SMTP_PORT;
      config.secure = SMTP_PORT === 465;
      console.log(`✉️ Mailer: Using custom SMTP host: ${SMTP_HOST}:${SMTP_PORT} (forcing IPv4)`);
    } else {
      // Default fallback if host is missing but user is gmail-like
      if (SMTP_USER.includes('gmail.com')) {
        config.service = 'gmail';
        console.log('✉️ Mailer: Detected Gmail address, using Gmail service configuration (forcing IPv4).');
      } else {
        config.host = SMTP_HOST || 'localhost';
        config.port = SMTP_PORT;
        config.secure = SMTP_PORT === 465;
      }
    }

    transporter = nodemailer.createTransport(config);
    isTestAccount = false;

    // Run connection diagnostic check
    try {
      await transporter.verify();
      console.log('✅ Mailer: SMTP connection verified successfully! Ready to send emails.');
    } catch (err) {
      console.error('❌ Mailer: SMTP connection verification failed!');
      console.error('   Error details:', err.message);
      console.error('   Please check your SMTP credentials, App Password, or network restrictions.');
    }

    return transporter;
  }

  // Fallback: Create Ethereal test SMTP credentials dynamically
  console.log('✉️ Mailer: SMTP environment variables are not configured in backend/.env.');
  console.log('✉️ Mailer: Dynamically generating a test SMTP account via Ethereal Email...');
  try {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    isTestAccount = true;
    console.log(`✉️ Mailer: Ethereal test SMTP account created!`);
    console.log(`   - Username: ${testAccount.user}`);
    console.log(`   - Host: ${testAccount.smtp.host}`);
    return transporter;
  } catch (err) {
    console.error('❌ Mailer: Failed to generate Ethereal SMTP account. Falling back to dummy log-only transport.', err);
    return null;
  }
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

  const client = await getTransporter();
  const fromField = SMTP_FROM || (SMTP_USER ? `SkillFetch <${SMTP_USER}>` : 'no-reply@skillfetch.com');

  if (!client) {
    console.log('\n=================== DUMMY MODE: EMAIL LOGGED ===================');
    console.log(`TO: ${user.email}`);
    console.log(`SUBJECT: ${subject}`);
    console.log('HTML CONTENT:');
    console.log(htmlContent);
    console.log('=======================================================================\n');
    return true;
  }

  try {
    const info = await client.sendMail({
      from: fromField,
      to: user.email,
      subject: subject,
      html: htmlContent,
    });
    console.log(`✉️ Welcome email sent successfully to ${user.email}. MessageId: ${info.messageId}`);
    
    // Log Ethereal preview link if applicable
    if (isTestAccount) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`🔗 Ethereal Inbox Link (Click to inspect sent mail): ${previewUrl}`);
      }
    }
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

  const client = await getTransporter();
  const fromField = SMTP_FROM || (SMTP_USER ? `SkillFetch <${SMTP_USER}>` : 'no-reply@skillfetch.com');

  if (!client) {
    console.log('\n=================== DUMMY MODE: EMAIL LOGGED ===================');
    console.log(`TO: ${candidate.email}`);
    console.log(`SUBJECT: ${subject}`);
    console.log('HTML CONTENT:');
    console.log(htmlContent);
    console.log('=======================================================================\n');
    return true;
  }

  try {
    const info = await client.sendMail({
      from: fromField,
      to: candidate.email,
      subject: subject,
      html: htmlContent,
    });
    console.log(`✉️ Hired email sent successfully to candidate ${candidate.email}. MessageId: ${info.messageId}`);
    
    // Log Ethereal preview link if applicable
    if (isTestAccount) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`🔗 Ethereal Inbox Link (Click to inspect sent mail): ${previewUrl}`);
      }
    }
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
