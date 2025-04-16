
const nodemailer = require('nodemailer');

// Create a transporter
const createTransporter = () => {
  // For production
  if (process.env.EMAIL_SERVER && process.env.EMAIL_FROM) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      secure: Boolean(process.env.EMAIL_SERVER_SECURE),
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });
  }
  
  // For development - use ethereal.email (a test SMTP service)
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: process.env.ETHEREAL_EMAIL || 'ethereal.user@ethereal.email',
      pass: process.env.ETHEREAL_PASSWORD || 'ethereal_pass',
    },
  });
};

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Your App" <noreply@stichtingasha.nl>',
    to: email,
    subject: 'Reset Your Password',
    text: `
      Hello,
      
      You requested to reset your password.
      
      Please click the link below to reset your password:
      ${resetUrl}
      
      This link is valid for 1 hour.
      
      If you didn't request this, please ignore this email.
      
      Regards,
      Your App Team
    `,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Reset Your Password</h2>
        <p>Hello,</p>
        <p>You requested to reset your password.</p>
        <p>Please click the button below to reset your password:</p>
        <p>
          <a 
            href="${resetUrl}" 
            style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;"
          >
            Reset Password
          </a>
        </p>
        <p>Or copy and paste this link in your browser:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p><strong>This link is valid for 1 hour.</strong></p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>
          Regards,<br />
          Your App Team
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    
    // For development - log the preview URL
    if (process.env.NODE_ENV === 'development') {
      console.log('Password reset email preview URL:', nodemailer.getTestMessageUrl(info));
    }
    
    return info;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
}