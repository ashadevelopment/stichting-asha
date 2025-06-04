import { createTransporter } from './email';

// Professional email template base (same as in email.ts)
const getEmailTemplate = (content: string) => `
  <!DOCTYPE html>
  <html lang="nl">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Stichting Asha</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
              <td style="padding: 40px 20px;">
                  <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                      <!-- Header -->
                      <tr>
                          <td style="background-color: #1e3a8a; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                              <img src="/logo.png" alt="Logo">
                              <h1 style="color: #ffffff; margin: 20px 0 0 0; font-size: 28px; font-weight: 300; letter-spacing: 1px;">STICHTING ASHA</h1>
                              <p style="color: #e2e8f0; margin: 5px 0 0 0; font-size: 14px; letter-spacing: 0.5px;">UTRECHT</p>
                          </td>
                      </tr>
                      
                      <!-- Content -->
                      <tr>
                          <td style="padding: 40px 30px;">
                              ${content}
                          </td>
                      </tr>
                      
                      <!-- Footer -->
                      <tr>
                          <td style="background-color: #1e3a8a; padding: 30px; text-align: center; border-radius: 0 0 8px 8px;">
                              <h3 style="color: #ffffff; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">Volg Ons</h3>
                              <div style="margin-bottom: 20px;">
                                  <a href="#" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                                      <span style="background-color: #ffffff; color: #1e3a8a; width: 40px; height: 40px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold;">X</span>
                                  </a>
                                  <a href="#" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                                      <span style="background-color: #ffffff; color: #1e3a8a; width: 40px; height: 40px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold;">IG</span>
                                  </a>
                                  <a href="#" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                                      <span style="background-color: #ffffff; color: #1e3a8a; width: 40px; height: 40px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold;">F</span>
                                  </a>
                                  <a href="#" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                                      <span style="background-color: #ffffff; color: #1e3a8a; width: 40px; height: 40px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold;">•••</span>
                                  </a>
                              </div>
                              <p style="color: #e2e8f0; margin: 0; font-size: 12px;">© 2025 Stichting Asha. Alle rechten voorbehouden.</p>
                          </td>
                      </tr>
                  </table>
              </td>
          </tr>
      </table>
  </body>
  </html>
`;

export async function sendVerificationEmail(
  email: string,
  firstName: string,
  verificationToken: string
) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const verifyUrl = `${baseUrl}/api/auth/verify?token=${verificationToken}&action=verify`;
  const cancelUrl = `${baseUrl}/api/auth/verify?token=${verificationToken}&action=cancel`;

  const transporter = await createTransporter();

  const content = `
    <h2 style="color: #1e3a8a; margin: 0 0 25px 0; font-size: 24px; font-weight: 600;">Account Verificatie Vereist</h2>
    
    <p style="color: #374151; line-height: 1.6; margin-bottom: 20px; font-size: 16px;">
      Beste ${firstName},
    </p>
    
    <p style="color: #374151; line-height: 1.6; margin-bottom: 25px; font-size: 16px;">
      Er is een account aangemaakt voor het e-mailadres <strong>${email}</strong> 
      bij Stichting Asha. Om de veiligheid van uw account te waarborgen, 
      moet u bevestigen dat u deze registratie heeft geïnitieerd.
    </p>
    
    <div style="background-color: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 25px; margin: 25px 0; border-radius: 4px;">
      <h3 style="color: #0c4a6e; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">✅ Hebt u zich geregistreerd?</h3>
      <p style="color: #0369a1; margin: 0; font-size: 16px; line-height: 1.6;">
        Klik op onderstaande knop om uw account te activeren en toegang te krijgen tot alle functionaliteiten.
      </p>
    </div>
    
    <div style="text-align: center; margin: 35px 0;">
      <a href="${verifyUrl}" 
         style="background-color: #059669; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 2px 4px rgba(5, 150, 105, 0.2);">
        ✓ Ja, verifieer mijn account
      </a>
    </div>
    
    <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 25px; margin: 25px 0; border-radius: 4px;">
      <h3 style="color: #b91c1c; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">❌ Hebt u zich NIET geregistreerd?</h3>
      <p style="color: #7f1d1d; margin-bottom: 15px; font-size: 16px; line-height: 1.6;">
        Als u zich niet heeft geregistreerd bij Stichting Asha, klik dan op onderstaande knop 
        om deze registratie te annuleren en uw e-mailadres te beschermen.
      </p>
      
      <div style="text-align: center; margin: 20px 0;">
        <a href="${cancelUrl}" 
           style="background-color: #dc2626; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; display: inline-block; box-shadow: 0 2px 4px rgba(220, 38, 38, 0.2);">
          ❌ Dit was ik niet - Annuleer registratie
        </a>
      </div>
    </div>
    
    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0; border-radius: 4px;">
      <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">⚠️ Belangrijk om te weten</h3>
      <ul style="color: #78350f; margin: 0; font-size: 14px; line-height: 1.6; padding-left: 20px;">
        <li>Deze verificatielinks zijn slechts één keer te gebruiken</li>
        <li>Zonder verificatie wordt uw account niet geactiveerd</li>
        <li>U kunt deze e-mail veilig negeren als u geen actie onderneemt</li>
      </ul>
    </div>
    
    <p style="color: #6b7280; line-height: 1.6; margin-bottom: 15px; font-size: 14px;">
      Werken de knoppen niet? Kopieer en plak één van deze links in uw browser:
    </p>
    
    <div style="background-color: #f8fafc; padding: 15px; border-radius: 4px; margin-bottom: 15px; border: 1px solid #e2e8f0;">
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #374151;"><strong>Verifiëren:</strong></p>
      <p style="color: #1e3a8a; word-break: break-all; margin: 0; font-size: 12px; font-family: 'Courier New', monospace;">
        ${verifyUrl}
      </p>
    </div>
    
    <div style="background-color: #f8fafc; padding: 15px; border-radius: 4px; margin-bottom: 25px; border: 1px solid #e2e8f0;">
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #374151;"><strong>Annuleren:</strong></p>
      <p style="color: #dc2626; word-break: break-all; margin: 0; font-size: 12px; font-family: 'Courier New', monospace;">
        ${cancelUrl}
      </p>
    </div>
    
    <div style="border-top: 1px solid #e5e7eb; padding-top: 25px; margin-top: 35px;">
      <p style="color: #374151; line-height: 1.6; margin: 0; font-size: 16px;">
        Met vriendelijke groet,<br>
        <strong>Het Stichting Asha Team</strong>
      </p>
      <p style="color: #6b7280; line-height: 1.6; margin: 10px 0 0 0; font-size: 14px;">
        Bij vragen over deze e-mail kunt u contact met ons opnemen.
      </p>
    </div>
  `;

  const mailOptions = {
    from: `"Stichting Asha" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Account Verificatie - Actie Vereist - Stichting Asha',
    html: getEmailTemplate(content)
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