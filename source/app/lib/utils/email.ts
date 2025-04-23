import nodemailer from 'nodemailer';

// Create a transporter using Gmail
export const createTransporter = async () => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    throw new Error('GMAIL_USER and GMAIL_APP_PASSWORD must be defined in the environment');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
};

// Send password reset email
export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const transporter = await createTransporter();

  const mailOptions = {
    from: `"Stichting Asha" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Uw wachtwoord resetten',
    text: `
      Hallo,

      U heeft een verzoek ingediend om uw wachtwoord te resetten.

      Klik op de onderstaande link om uw wachtwoord te resetten:
      ${resetUrl}

      Deze link is 1 uur geldig.

      Als u dit verzoek niet heeft ingediend, kunt u deze e-mail negeren.

      Met vriendelijke groet,
      Stichting Asha
    `,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Wachtwoord Resetten</h2>
        <p>Hallo,</p>
        <p>U heeft een verzoek ingediend om uw wachtwoord te resetten.</p>
        <p>Klik op de onderstaande knop om uw wachtwoord te resetten:</p>
        <p>
          <a 
            href="${resetUrl}" 
            style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;"
          >
            Wachtwoord Resetten
          </a>
        </p>
        <p>Of kopieer en plak deze link in uw browser:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p><strong>Deze link is 1 uur geldig.</strong></p>
        <p>Als u dit verzoek niet heeft ingediend, kunt u deze e-mail negeren.</p>
        <p>
          Met vriendelijke groet,<br />
          Stichting Asha
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    if (process.env.NODE_ENV === 'development' && info.messageId) {
      console.log('Password reset email preview URL:', nodemailer.getTestMessageUrl(info));
    }
    return info;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
}

// Send verification email
export async function sendVerificationEmail(email: string, verificationUrl: string) {
  const transporter = await createTransporter();

  const mailOptions = {
    from: `"Stichting Asha" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Verifieer uw e-mailadres',
    text: `
      Hallo,

      Bedankt voor uw registratie. Verifieer uw e-mailadres door op de onderstaande link te klikken:
      ${verificationUrl}

      Deze link is 24 uur geldig.

      Met vriendelijke groet,
      Stichting Asha
    `,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>E-mail Verificatie</h2>
        <p>Hallo,</p>
        <p>Bedankt voor uw registratie. Verifieer uw e-mailadres door op de onderstaande knop te klikken:</p>
        <p>
          <a 
            href="${verificationUrl}" 
            style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;"
          >
            E-mailadres Verifiëren
          </a>
        </p>
        <p>Of kopieer en plak deze link in uw browser:</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        <p><strong>Deze link is 24 uur geldig.</strong></p>
        <p>
          Met vriendelijke groet,<br />
          Stichting Asha
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    if (process.env.NODE_ENV === 'development' && info.messageId) {
      console.log('Verification email preview URL:', nodemailer.getTestMessageUrl(info));
    }
    return info;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
}
