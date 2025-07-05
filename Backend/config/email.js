import nodemailer from 'nodemailer';

export const createTransporter = () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('Email configuration not found. Email functionality will be disabled.');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, 
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export const sendWelcomeEmail = async (userEmail, userName, tempPassword) => {
  try {
    const transporter = createTransporter();

    if (!transporter) {
      console.warn(`Email not configured. Would have sent welcome email to ${userEmail}`);
      console.log(`Login credentials for ${userName}:`);
      console.log(`Email: ${userEmail}`);
      console.log(`Password: ${tempPassword}`);
      return { success: true, messageId: 'email-not-configured' };
    }

    const mailOptions = {
      from: process.env.SMTP_USER || 'noreply@taskflow.com',
      to: userEmail,
      subject: 'Welcome to TaskFlow - Your Account Details',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .credentials { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to Smart Task Manager!</h1>
              <p>Your account has been created successfully</p>
            </div>
            <div class="content">
              <h2>Hello ${userName},</h2>
              <p>Your administrator has created an account for you on Smart Task Manager. You can now start managing your tasks efficiently!</p>

              <div class="credentials">
                <h3>🔑 Your Login Credentials:</h3>
                <p><strong>Email:</strong> ${userEmail}</p>
                <p><strong>Temporary Password:</strong> <code style="background: #e9ecef; padding: 4px 8px; border-radius: 4px; font-size: 16px;">${tempPassword}</code></p>
              </div>

              <div class="warning">
                <p><strong>⚠️ Important Security Notice:</strong></p>
                <ul>
                  <li>Please change your password after your first login</li>
                  <li>Keep your login credentials secure</li>
                  <li>Do not share your password with anyone</li>
                </ul>
              </div>

              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" class="button">🚀 Login to Smart Task Manager</a>
              </div>

              <h3>✨ Getting Started:</h3>
              <ul>
                <li>📝 Create and organize your tasks</li>
                <li>📅 Set due dates and priorities</li>
                <li>📊 Track your progress with analytics</li>
                <li>📤 Export your data when needed</li>
              </ul>

              <p>If you have any questions or need assistance, please contact your administrator.</p>
              <p>Happy task managing!</p>
              <p><strong>The Smart Task Manager Team</strong></p>
            </div>
            <div class="footer">
              <p>This email was sent from Smart Task Manager, The Task Management System</p>
              <p>Please do not reply to this email</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Test email configuration
export const testEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      return { success: false, error: 'Email configuration not found' };
    }

    await transporter.verify();
    console.log('✅ Email configuration is valid');
    return { success: true };
  } catch (error) {
    console.error('❌ Email configuration test failed:', error);
    return { success: false, error: error.message };
  }
};
