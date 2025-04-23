import { createTransporter } from './email';

export async function sendVerificationEmail(
  email: string,
  firstName: string,
  verificationToken: string
) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const verifyUrl = `${baseUrl}/api/auth/verify?token=${verificationToken}&action=verify`;
  const cancelUrl = `${baseUrl}/api/auth/verify?token=${verificationToken}&action=cancel`;

  const transporter = await createTransporter();

  const mailOptions = {
    from: `"Stichting Asha" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Verifieer uw account',
    text: `
      Hallo ${firstName},

      Er is een account aangemaakt voor dit e-mailadres.

      Als dit door u is gedaan, klik dan op de volgende link om uw e-mailadres te verifiëren:
      ${verifyUrl}

      Als dit niet door u is gedaan, kunt u op de volgende link klikken om het verzoek te annuleren:
      ${cancelUrl}

      Met vriendelijke groet,
      Stichting Asha
    `,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Accountverificatie</h2>
        <p>Hallo ${firstName},</p>
        <p>Er is een account aangemaakt voor <strong>${email}</strong>.</p>
        <p>Als u dit was, klik dan op de onderstaande knop om uw e-mailadres te verifiëren:</p>
        <p>
          <a 
            href="${verifyUrl}" 
            style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;"
          >
            Verifieer mijn account
          </a>
        </p>
        <p>Als u dit niet was, klik dan hieronder om dit verzoek te annuleren:</p>
        <p>
          <a 
            href="${cancelUrl}" 
            style="display: inline-block; background-color: #f44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;"
          >
            Dit was ik niet
          </a>
        </p>
        <p>U kunt deze e-mail negeren als u dit verzoek niet hebt gedaan.</p>
        <p>
          Met vriendelijke groet,<br />
          Stichting Asha
        </p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    if (process.env.NODE_ENV === 'development' && info.messageId) {
      console.log('Verification email preview URL:', require('nodemailer').getTestMessageUrl(info));
    }
    return info;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
}
