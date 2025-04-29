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
        <p>Hallo,</p>
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
  volunteerEmail: string, 
  volunteerName: string,
  status: 'approved' | 'rejected'
) {
  const transporter = await createTransporter();
  
  const subject = status === 'approved' 
    ? 'Goed nieuws! Je aanmelding als vrijwilliger is goedgekeurd' 
    : 'Update over jouw vrijwilliger aanmelding';
  
  const textContent = status === 'approved'
    ? `
      Beste ${volunteerName},

      Goed nieuws! We zijn verheugd je te laten weten dat je aanmelding als vrijwilliger bij Stichting Asha is goedgekeurd.

      We kijken ernaar uit om samen met je te werken en samen impact te maken voor onze doelgroep. Iemand van ons team zal binnenkort contact met je opnemen om de volgende stappen te bespreken.

      Hartelijk dank voor je enthousiasme en betrokkenheid!

      Met vriendelijke groet,
      Team Stichting Asha
    `
    : `
      Beste ${volunteerName},

      Hartelijk dank voor je interesse in vrijwilligerswerk bij Stichting Asha.

      Na zorgvuldige overweging van alle aanmeldingen hebben we helaas moeten besluiten om op dit moment niet met je aanmelding verder te gaan.

      We waarderen je interesse en inzet enorm en hopen dat je begrip hebt voor onze beslissing.

      We wensen je alle succes in de toekomst.

      Met vriendelijke groet,
      Team Stichting Asha
    `;
  
  const htmlContent = status === 'approved'
    ? `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Je aanmelding is goedgekeurd!</h2>
        <p>Beste ${volunteerName},</p>
        <p>Goed nieuws! We zijn verheugd je te laten weten dat je aanmelding als vrijwilliger bij Stichting Asha is goedgekeurd.</p>
        <p>We kijken ernaar uit om samen met je te werken en samen impact te maken voor onze doelgroep. Iemand van ons team zal binnenkort contact met je opnemen om de volgende stappen te bespreken.</p>
        <p>Hartelijk dank voor je enthousiasme en betrokkenheid!</p>
        <p>
          Met vriendelijke groet,<br />
          Team Stichting Asha
        </p>
      </div>
    `
    : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Update over jouw aanmelding</h2>
        <p>Beste ${volunteerName},</p>
        <p>Hartelijk dank voor je interesse in vrijwilligerswerk bij Stichting Asha.</p>
        <p>Na zorgvuldige overweging van alle aanmeldingen hebben we helaas moeten besluiten om op dit moment niet met je aanmelding verder te gaan.</p>
        <p>We waarderen je interesse en inzet enorm en hopen dat je begrip hebt voor onze beslissing.</p>
        <p>We wensen je alle succes in de toekomst.</p>
        <p>
          Met vriendelijke groet,<br />
          Team Stichting Asha
        </p>
      </div>
    `;

  const mailOptions = {
    from: `"Stichting Asha" <${process.env.GMAIL_USER}>`,
    to: volunteerEmail,
    subject: subject,
    text: textContent,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error(`Error sending volunteer ${status} email:`, error);
    throw error;
  }
}