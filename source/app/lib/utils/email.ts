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

const getEmailTemplate = (content: string) => `
  <!DOCTYPE html>
  <html lang="nl">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Stichting Asha</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        /* Custom styles for email clients that don't support all Tailwind classes */
        @media screen and (max-width: 640px) {
          .email-container {
            margin: 10px !important;
          }
          .email-content {
            padding: 20px !important;
          }
          .email-header {
            padding: 20px !important;
          }
          .email-footer {
            padding: 20px !important;
          }
          .email-button {
            display: block !important;
            width: 100% !important;
            text-align: center !important;
          }
        }
        
        /* Ensure consistent styling across email clients */
        .email-text {
          color: #374151;
          line-height: 1.6;
          font-size: 16px;
        }
        
        .email-heading {
          color: #1e3a8a;
          font-weight: 600;
          font-size: 24px;
          margin-bottom: 25px;
        }
        
        .email-button-primary {
          background-color: #1e3a8a;
          color: #ffffff;
          padding: 15px 30px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 16px;
          display: inline-block;
          box-shadow: 0 2px 4px rgba(30, 58, 138, 0.2);
        }
        
        .email-button-success {
          background-color: #059669;
          color: #ffffff;
          padding: 15px 30px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 16px;
          display: inline-block;
          box-shadow: 0 2px 4px rgba(5, 150, 105, 0.2);
        }
      </style>
  </head>
  <body class="bg-gray-50 font-sans m-0 p-0">
      <div class="min-h-screen py-4 px-2 sm:py-10 sm:px-6">
          <div class="email-container max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
              
              <!-- Content -->
              <div class="email-content px-4 py-6 sm:px-8 sm:py-10">
                  ${content}
              </div>
              
              <!-- Footer -->
              <div class="email-footer bg-blue-900 text-center px-4 py-6 sm:px-8 sm:py-10">
                  <p class="text-blue-200 text-xs m-0">
                      © 2025 Stichting Asha. Alle rechten voorbehouden.
                  </p>
              </div>
          </div>
      </div>
  </body>
  </html>
`;

// Send password reset email
export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const transporter = await createTransporter();

  const content = `
    <h2 style="color: #1e3a8a; margin: 0 0 25px 0; font-size: 24px; font-weight: 600;">Wachtwoord Resetten</h2>
    
    <p style="color: #374151; line-height: 1.6; margin-bottom: 20px; font-size: 16px;">
      Geachte heer/mevrouw,
    </p>
    
    <p style="color: #374151; line-height: 1.6; margin-bottom: 25px; font-size: 16px;">
      Wij hebben een verzoek ontvangen om het wachtwoord van uw account te resetten. 
      Om uw wachtwoord veilig te wijzigen, klikt u op onderstaande knop:
    </p>
    
    <div style="text-align: center; margin: 35px 0;">
      <a href="${resetUrl}" 
         style="background-color: #1e3a8a; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 2px 4px rgba(30, 58, 138, 0.2);">
        Wachtwoord Resetten
      </a>
    </div>
    
    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0; border-radius: 4px;">
      <p style="color: #92400e; margin: 0; font-size: 14px; font-weight: 600;">
        ⚠️ Belangrijk: Deze link is slechts 1 uur geldig om veiligheidsredenen.
      </p>
    </div>
    
    <p style="color: #6b7280; line-height: 1.6; margin-bottom: 15px; font-size: 14px;">
      Werkt de knop niet? Kopieer en plak deze link in uw browser:
    </p>
    
    <p style="color: #1e3a8a; word-break: break-all; background-color: #f8fafc; padding: 10px; border-radius: 4px; font-size: 14px; margin-bottom: 25px;">
      ${resetUrl}
    </p>
    
    <p style="color: #374151; line-height: 1.6; margin-bottom: 25px; font-size: 16px;">
      Hebt u geen wachtwoord reset aangevraagd? Dan kunt u deze e-mail veilig negeren. 
      Uw account blijft beveiligd en er worden geen wijzigingen aangebracht.
    </p>
    
    <div style="border-top: 1px solid #e5e7eb; padding-top: 25px; margin-top: 35px;">
      <p style="color: #374151; line-height: 1.6; margin: 0; font-size: 16px;">
        Met vriendelijke groet,<br>
        <strong>Stichting Asha</strong>
      </p>
    </div>
  `;

  const mailOptions = {
    from: `"Stichting Asha" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Wachtwoord Reset Verzoek - Stichting Asha',
    html: getEmailTemplate(content),
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

  const content = `
    <h2 style="color: #1e3a8a; margin: 0 0 25px 0; font-size: 24px; font-weight: 600;">Account Verificatie</h2>
    
    <p style="color: #374151; line-height: 1.6; margin-bottom: 20px; font-size: 16px;">
      Geachte heer/mevrouw,
    </p>
    
    <p style="color: #374151; line-height: 1.6; margin-bottom: 25px; font-size: 16px;">
      Hartelijk dank voor uw registratie bij Stichting Asha. Om uw account te activeren 
      en toegang te krijgen tot alle functionaliteiten, dient u uw e-mailadres te verifiëren.
    </p>
    
    <div style="text-align: center; margin: 35px 0;">
      <a href="${verificationUrl}" 
         style="background-color: #059669; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 2px 4px rgba(5, 150, 105, 0.2);">
        E-mailadres Verifiëren
      </a>
    </div>
    
    <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0; border-radius: 4px;">
      <p style="color: #1e40af; margin: 0; font-size: 14px; font-weight: 600;">
        ℹ️ Deze verificatielink is 24 uur geldig vanaf het moment van verzending.
      </p>
    </div>
    
    <p style="color: #6b7280; line-height: 1.6; margin-bottom: 15px; font-size: 14px;">
      Werkt de knop niet? Kopieer en plak deze link in uw browser:
    </p>
    
    <p style="color: #1e3a8a; word-break: break-all; background-color: #f8fafc; padding: 10px; border-radius: 4px; font-size: 14px; margin-bottom: 25px;">
      ${verificationUrl}
    </p>
    
    <p style="color: #374151; line-height: 1.6; margin-bottom: 25px; font-size: 16px;">
      Hebt u zich niet geregistreerd bij Stichting Asha? Dan kunt u deze e-mail negeren. 
      Er wordt geen account aangemaakt zonder verificatie.
    </p>
    
    <div style="border-top: 1px solid #e5e7eb; padding-top: 25px; margin-top: 35px;">
      <p style="color: #374151; line-height: 1.6; margin: 0; font-size: 16px;">
        Met vriendelijke groet,<br>
        <strong>Stichting Asha</strong>
      </p>
    </div>
  `;

  const mailOptions = {
    from: `"Stichting Asha" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Verifieer uw account - Stichting Asha',
    html: getEmailTemplate(content),
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
  const volunteerContent = `
    <h2 style="color: #1e3a8a; margin: 0 0 25px 0; font-size: 24px; font-weight: 600;">Bevestiging Vrijwilligersaanmelding</h2>
    
    <p style="color: #374151; line-height: 1.6; margin-bottom: 20px; font-size: 16px;">
      Beste ${volunteerName},
    </p>
    
    <p style="color: #374151; line-height: 1.6; margin-bottom: 25px; font-size: 16px;">
      Hartelijk dank voor uw interesse om vrijwilliger te worden bij Stichting Asha. 
      Wij waarderen uw bereidheid om een bijdrage te leveren aan onze missie.
    </p>
    
    <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 20px; margin: 25px 0; border-radius: 4px;">
      <h3 style="color: #065f46; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">Uw aanmelding is ontvangen</h3>
      <p style="color: #047857; margin: 0; font-size: 14px; line-height: 1.6;">
        Wij hebben uw aanmelding in goede orde ontvangen en zullen deze zorgvuldig beoordelen. 
        Ons team neemt binnen 5 werkdagen contact met u op over de vervolgstappen.
      </p>
    </div>
    
    <h3 style="color: #374151; margin: 30px 0 15px 0; font-size: 18px; font-weight: 600;">Wat kunt u verwachten?</h3>
    
    <ul style="color: #374151; line-height: 1.8; margin-bottom: 25px; font-size: 16px; padding-left: 20px;">
      <li>Beoordeling van uw aanmelding door ons vrijwilligersteam</li>
      <li>Persoonlijk gesprek (indien van toepassing)</li>
      <li>Informatie over beschikbare vrijwilligersposities</li>
      <li>Introductie en training wanneer u wordt toegelaten</li>
    </ul>
    
    <p style="color: #374151; line-height: 1.6; margin-bottom: 25px; font-size: 16px;">
      Heeft u vragen over uw aanmelding of over het vrijwilligerswerk bij Stichting Asha? 
      Aarzel niet om contact met ons op te nemen.
    </p>
    
    <div style="border-top: 1px solid #e5e7eb; padding-top: 25px; margin-top: 35px;">
      <p style="color: #374151; line-height: 1.6; margin: 0; font-size: 16px;">
        Met dank en vriendelijke groet,<br>
        <strong>Stichting Asha</strong>
      </p>
    </div>
  `;

  // Email to the admin
  const adminContent = `
    <h2 style="color: #1e3a8a; margin: 0 0 25px 0; font-size: 24px; font-weight: 600;">Nieuwe Vrijwilligersaanmelding</h2>
    
    <p style="color: #374151; line-height: 1.6; margin-bottom: 25px; font-size: 16px;">
      Er is een nieuwe aanmelding voor vrijwilligerswerk binnengekomen die uw aandacht vereist.
    </p>
    
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 25px; border-radius: 6px; margin: 25px 0;">
      <h3 style="color: #374151; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">Aanmelding Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #374151; width: 120px;">Naam:</td>
          <td style="padding: 8px 0; color: #374151;">${volunteerName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #374151;">E-mailadres:</td>
          <td style="padding: 8px 0; color: #374151;">${volunteerEmail}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #374151;">Datum:</td>
          <td style="padding: 8px 0; color: #374151;">${new Date().toLocaleDateString('nl-NL', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</td>
        </tr>
      </table>
    </div>
    
    <div style="text-align: center; margin: 35px 0;">
      <a href="${process.env.NEXT_PUBLIC_BASE_URL}/beheer/vrijwilligers" 
         style="background-color: #1e3a8a; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 2px 4px rgba(30, 58, 138, 0.2);">
        Bekijk Volledige Aanmelding
      </a>
    </div>
    
    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0; border-radius: 4px;">
      <p style="color: #92400e; margin: 0; font-size: 14px; font-weight: 600;">
        📋 Vergeet niet om binnen 5 werkdagen te reageren op deze aanmelding.
      </p>
    </div>
    
    <div style="border-top: 1px solid #e5e7eb; padding-top: 25px; margin-top: 35px;">
      <p style="color: #374151; line-height: 1.6; margin: 0; font-size: 16px;">
        Met vriendelijke groet,<br>
        <strong>Stichting Asha Systeem</strong>
      </p>
    </div>
  `;

  const volunteerMailOptions = {
    from: `"Stichting Asha" <${process.env.GMAIL_USER}>`,
    to: volunteerEmail,
    subject: 'Bevestiging vrijwilligersaanmelding - Stichting Asha',
    html: getEmailTemplate(volunteerContent),
  };

  const adminMailOptions = {
    from: `"Stichting Asha" <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_USER!,
    subject: 'Nieuwe vrijwilligersaanmelding - Actie vereist',
    html: getEmailTemplate(adminContent),
  };

  try {
    await transporter.sendMail(volunteerMailOptions);
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
  const transporter = await createTransporter();

  let subject: string;
  let content: string;

  if (status === 'approved') {
    subject = 'Welkom als vrijwilliger bij Stichting Asha! 🎉';
    
    content = `
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="background-color: #10b981; color: white; padding: 20px; border-radius: 8px; display: inline-block;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 600;">🎉 Gefeliciteerd!</h1>
        </div>
      </div>
      
      <h2 style="color: #1e3a8a; margin: 0 0 25px 0; font-size: 24px; font-weight: 600;">U bent toegelaten als vrijwilliger</h2>
      
      <p style="color: #374151; line-height: 1.6; margin-bottom: 20px; font-size: 16px;">
        Beste ${name},
      </p>
      
      <p style="color: #374151; line-height: 1.6; margin-bottom: 25px; font-size: 16px;">
        Wij hebben het genoegen u te informeren dat uw aanmelding als vrijwilliger is goedgekeurd. 
        Van harte welkom in ons toegewijde team van vrijwilligers!
      </p>

      ${tempPassword ? `
      <div style="background-color: #dbeafe; border: 1px solid #3b82f6; padding: 25px; margin: 25px 0; border-radius: 6px;">
        <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">🔐 Uw Account Gegevens</h3>
        <p style="color: #374151; margin-bottom: 15px; font-size: 16px;">
          Er is automatisch een persoonlijk account voor u aangemaakt:
        </p>
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 4px; font-family: 'Courier New', monospace; border: 1px solid #e2e8f0;">
          <div style="margin-bottom: 10px;"><strong>E-mailadres:</strong> ${email}</div>
          <div><strong>Tijdelijk wachtwoord:</strong> <span style="background-color: #fef3c7; padding: 2px 6px; border-radius: 3px;">${tempPassword}</span></div>
        </div>
        <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin-top: 15px; border-radius: 4px;">
          <p style="color: #b91c1c; margin: 0; font-size: 14px; font-weight: 600;">
            ⚠️ Belangrijk: Wijzig uw wachtwoord direct na de eerste inlog voor uw veiligheid.
          </p>
        </div>
      </div>
      ` : ''}

      <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 25px; margin: 25px 0; border-radius: 4px;">
        <h3 style="color: #065f46; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">📋 Volgende Stappen</h3>
        <ul style="color: #047857; line-height: 1.8; margin: 0; font-size: 16px; padding-left: 20px;">
          <li>U ontvangt binnenkort gedetailleerde informatie over uw vrijwilligersrol</li>
          <li>Ons team zal contact met u opnemen voor de introductie en eventuele training</li>
          ${tempPassword ? '<li>Log in op uw account om uw profiel compleet te maken</li>' : ''}
          <li>Bij vragen of onduidelijkheden kunt u altijd contact met ons opnemen</li>
        </ul>
      </div>
      
      <p style="color: #374151; line-height: 1.6; margin-bottom: 25px; font-size: 16px;">
        Wij kijken ernaar uit om samen met u een positieve impact te maken in onze gemeenschap. 
        Bedankt voor uw toewijding en welkom bij de Stichting Asha familie!
      </p>
      
      <div style="border-top: 1px solid #e5e7eb; padding-top: 25px; margin-top: 35px;">
        <p style="color: #374151; line-height: 1.6; margin: 0; font-size: 16px;">
          Met veel dank en vriendelijke groet,<br>
          <strong>Stichting Asha</strong>
        </p>
      </div>
    `;
  } else {
    subject = 'Update betreffende uw vrijwilligersaanmelding';
    
    content = `
      <h2 style="color: #1e3a8a; margin: 0 0 25px 0; font-size: 24px; font-weight: 600;">Betreffende uw vrijwilligersaanmelding</h2>
      
      <p style="color: #374151; line-height: 1.6; margin-bottom: 20px; font-size: 16px;">
        Beste ${name},
      </p>
      
      <p style="color: #374151; line-height: 1.6; margin-bottom: 25px; font-size: 16px;">
        Hartelijk dank voor uw interesse om vrijwilliger te worden bij Stichting Asha en 
        de tijd die u heeft geïnvesteerd in uw aanmelding.
      </p>

      <p style="color: #374151; line-height: 1.6; margin-bottom: 25px; font-size: 16px;">
        Na zorgvuldige overweging van alle aanmeldingen en onze huidige behoeften, moeten wij u helaas 
        meedelen dat wij op dit moment geen geschikte vrijwilligerspositie voor u hebben.
      </p>

      <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 25px; margin: 25px 0; border-radius: 4px;">
        <h3 style="color: #b91c1c; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">Toekomstige Mogelijkheden</h3>
        <p style="color: #7f1d1d; margin: 0; font-size: 16px; line-height: 1.6;">
          Deze beslissing betekent niet dat u in de toekomst geen kansen heeft bij onze organisatie. 
          Wij moedigen u van harte aan om in de toekomst opnieuw te solliciteren wanneer er nieuwe 
          mogelijkheden ontstaan die beter aansluiten bij uw profiel en onze behoeften.
        </p>
      </div>
      
      <p style="color: #374151; line-height: 1.6; margin-bottom: 25px; font-size: 16px;">
        Wij waarderen uw betrokkenheid bij onze missie en hopen dat u op andere manieren 
        verbonden blijft met het werk van Stichting Asha.
      </p>
      
      <div style="background-color: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 25px; margin: 25px 0; border-radius: 4px;">
        <h3 style="color: #0c4a6e; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">💡 Andere Manieren om Betrokken te Blijven</h3>
        <ul style="color: #0369a1; line-height: 1.8; margin: 0; font-size: 16px; padding-left: 20px;">
          <li>Volg ons op sociale media voor updates over onze activiteiten</li>
          <li>Overweeg een donatie om ons werk te ondersteunen</li>
          <li>Deel onze missie met vrienden en familie</li>
          <li>Meld u aan voor onze nieuwsbrief</li>
        </ul>
      </div>
      
      <p style="color: #374151; line-height: 1.6; margin-bottom: 25px; font-size: 16px;">
        Nogmaals bedankt voor uw interesse en begrip voor deze beslissing. 
        Wij wensen u veel succes met uw toekomstige vrijwilligerswerk.
      </p>
      
      <div style="border-top: 1px solid #e5e7eb; padding-top: 25px; margin-top: 35px;">
        <p style="color: #374151; line-height: 1.6; margin: 0; font-size: 16px;">
          Met respect en vriendelijke groet,<br>
          <strong>Stichting Asha</strong>
        </p>
      </div>
    `;
  }

  const mailOptions = {
    from: `"Stichting Asha" <${process.env.GMAIL_USER}>`,
    to: email,
    subject,
    html: getEmailTemplate(content)
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error(`Error sending volunteer ${status} email:`, error);
    throw error;
  }
}