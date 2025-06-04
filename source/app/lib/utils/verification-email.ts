import { createTransporter } from './email';

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
        <strong>Stichting Asha</strong>
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