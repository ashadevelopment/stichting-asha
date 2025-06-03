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
      Geachte heer/mevrouw,

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
        <p>Geachte heer/mevrouw,</p>
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
      Geachte heer/mevrouw,

      Bedankt voor uw registratie. Verifieer uw e-mailadres door op de onderstaande link te klikken:
      ${verificationUrl}

      Deze link is 24 uur geldig.

      Met vriendelijke groet,
      Stichting Asha
    `,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>E-mail Verificatie</h2>
        <p>Geachte heer/mevrouw,</p>
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

// Send volunteer application confirmation emails
export async function sendVolunteerApplicationEmails(
  volunteerEmail: string, 
  volunteerName: string
) {
  const transporter = await createTransporter();
  
  // Email to the volunteer
  const volunteerMailOptions = {
    from: `"Stichting Asha" <${process.env.GMAIL_USER}>`,
    to: volunteerEmail,
    subject: 'Bevestiging aanmelding als vrijwilliger',
    text: `
      Beste ${volunteerName},

      Hartelijk dank voor je aanmelding als vrijwilliger bij Stichting Asha!

      We hebben je aanmelding in goede orde ontvangen en deze wordt momenteel door ons team beoordeeld.
      Je hoort zo spoedig mogelijk van ons over de status van je aanmelding.

      Mocht je vragen hebben, aarzel dan niet om contact met ons op te nemen.

      Met vriendelijke groet,
      Team Stichting Asha
    `,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Bedankt voor je aanmelding!</h2>
        <p>Beste ${volunteerName},</p>
        <p>Hartelijk dank voor je aanmelding als vrijwilliger bij Stichting Asha!</p>
        <p>We hebben je aanmelding in goede orde ontvangen en deze wordt momenteel door ons team beoordeeld. 
           Je hoort zo spoedig mogelijk van ons over de status van je aanmelding.</p>
        <p>Mocht je vragen hebben, aarzel dan niet om contact met ons op te nemen.</p>
        <p>
          Met vriendelijke groet,<br />
          Team Stichting Asha
        </p>
      </div>
    `,
  };

  // Email to the admin
  const adminMailOptions = {
    from: `"Stichting Asha" <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_USER!,
    subject: 'Nieuwe vrijwilliger aanmelding',
    text: `
      Geachte heer/mevrouw,

      Er is een nieuwe aanmelding als vrijwilliger binnengekomen.

      Naam: ${volunteerName}
      Email: ${volunteerEmail}

      Log in op het beheerderspaneel om de volledige aanmelding te bekijken en te beoordelen.

      Met vriendelijke groet,
      Stichting Asha Systeem
    `,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Nieuwe Vrijwilliger Aanmelding</h2>
        <p>Geachte heer/mevrouw,</p>
        <p>Er is een nieuwe aanmelding als vrijwilliger binnengekomen.</p>
        <p>
          <strong>Naam:</strong> ${volunteerName}<br />
          <strong>Email:</strong> ${volunteerEmail}
        </p>
        <p>Log in op het beheerderspaneel om de volledige aanmelding te bekijken en te beoordelen.</p>
        <p>
          <a 
            href="${process.env.NEXT_PUBLIC_BASE_URL}/beheer/vrijwilligers" 
            style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;"
          >
            Naar Vrijwilligers Beheer
          </a>
        </p>
        <p>
          Met vriendelijke groet,<br />
          Stichting Asha Systeem
        </p>
      </div>
    `,
  };

  try {
    // Send email to volunteer
    await transporter.sendMail(volunteerMailOptions);
    
    // Send notification to admin
    await transporter.sendMail(adminMailOptions);
    
    return true;
  } catch (error) {
    console.error('Error sending volunteer application emails:', error);
    throw error;
  }
}

// Send volunteer application status update email (approved/rejected)
export async function sendVolunteerStatusEmail(
  email: string, 
  name: string, 
  status: 'approved' | 'rejected',
  tempPassword?: string
) {
  const transporter = await createTransporter(); // Your existing transporter setup

  let subject: string;
  let htmlContent: string;

  if (status === 'approved') {
    subject = 'Uw vrijwilligersaanmelding is goedgekeurd! 🎉';
    
    htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #10b981; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Gefeliciteerd! 🎉</h1>
        </div>
        
        <div style="padding: 30px; background-color: #f9fafb;">
          <h2 style="color: #374151;">Beste ${name},</h2>
          
          <p style="color: #6b7280; line-height: 1.6;">
            Geweldig nieuws! Uw aanmelding als vrijwilliger is goedgekeurd. 
            We zijn verheugd u te verwelkomen in ons team van vrijwilligers.
          </p>

          ${tempPassword ? `
          <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">Uw account gegevens</h3>
            <p style="color: #374151; margin-bottom: 10px;">
              Er is automatisch een gebruikersaccount voor u aangemaakt:
            </p>
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 5px; font-family: monospace;">
              <strong>Email:</strong> ${email}<br>
              <strong>Tijdelijk wachtwoord:</strong> ${tempPassword}
            </div>
            <p style="color: #6b7280; font-size: 14px; margin-top: 10px;">
              <strong>Belangrijk:</strong> Log in met deze gegevens en wijzig uw wachtwoord zo snel mogelijk.
            </p>
          </div>
          ` : ''}

          <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0;">
            <h3 style="color: #065f46; margin-top: 0;">Volgende stappen</h3>
            <ul style="color: #374151; line-height: 1.6;">
              <li>U ontvangt binnenkort meer informatie over uw rol als vrijwilliger</li>
              <li>Houd uw e-mail in de gaten voor verdere instructies</li>
              ${tempPassword ? '<li>Log in op uw account om uw profiel aan te vullen</li>' : ''}
              <li>Bij vragen kunt u contact met ons opnemen</li>
            </ul>
          </div>

          <p style="color: #6b7280; line-height: 1.6;">
            Bedankt voor uw interesse en welkom bij ons team!
          </p>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 14px;">
              Met vriendelijke groet,<br>
              Het Vrijwilligers Team
            </p>
          </div>
        </div>
      </div>
    `;
  } else {
    subject = 'Update over uw vrijwilligersaanmelding';
    
    htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #ef4444; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Vrijwilligersaanmelding</h1>
        </div>
        
        <div style="padding: 30px; background-color: #f9fafb;">
          <h2 style="color: #374151;">Beste ${name},</h2>
          
          <p style="color: #6b7280; line-height: 1.6;">
            Bedankt voor uw interesse om vrijwilliger te worden. 
            Na zorgvuldige overweging kunnen we u op dit moment helaas niet toelaten als vrijwilliger.
          </p>

          <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0;">
            <p style="color: #374151; margin: 0;">
              Dit betekent niet dat u in de toekomst geen kansen heeft. 
              We moedigen u aan om in de toekomst opnieuw te solliciteren.
            </p>
          </div>

          <p style="color: #6b7280; line-height: 1.6;">
            Bedankt voor uw begrip en uw interesse in onze organisatie.
          </p>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 14px;">
              Met vriendelijke groet,<br>
              Het Vrijwilligers Team
            </p>
          </div>
        </div>
      </div>
    `;
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject,
    html: htmlContent
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error(`Error sending volunteer ${status} email:`, error);
    throw error;
  }
}