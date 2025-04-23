import { NextRequest } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import User from '../../../lib/models/User';
import UserVerification from '../../../lib/models/UserVerification';
import { createTransporter } from '../../../lib/utils/email';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Helper to send password via email
async function sendPasswordEmail(email: string, plainPassword: string) {
  const transporter = await createTransporter();

  const mailOptions = {
    from: `"Stichting Asha" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Uw account is geverifieerd',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welkom bij Stichting Asha</h2>
        <p>Uw e-mailadres is succesvol geverifieerd en uw account is aangemaakt.</p>
        <p>Hieronder vindt u uw inloggegevens:</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Wachtwoord:</strong> ${plainPassword}</p>
        <p>Wij raden u aan om in te loggen en uw wachtwoord zo snel mogelijk te wijzigen.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login" 
           style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
           Inloggen
        </a>
        <p>Met vriendelijke groet,<br />Stichting Asha</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    const action = searchParams.get('action');

    if (!token || !['verify', 'cancel'].includes(action as string)) {
      return new Response('Ongeldige aanvraag.', {
        status: 400,
        headers: { 'Content-Type': 'text/html' }
      });
    }

    await dbConnect();

    const verification = await UserVerification.findOne({
      verificationToken: token,
      expires: { $gt: new Date() }
    });

    if (!verification) {
      return new Response(`
        <html><body style="text-align:center;font-family:Arial;">
          <div style="margin:50px auto;max-width:600px;padding:30px;border:1px solid #ccc;border-radius:8px;background:#fff;">
            <h2 style="color:#f44336;">Ongeldige of verlopen link</h2>
            <p>Deze verificatielink is ongeldig of verlopen.</p>
            <p>Vraag een nieuwe verificatie aan of neem contact op met ondersteuning.</p>
          </div>
        </body></html>`, {
        status: 400,
        headers: { 'Content-Type': 'text/html' }
      });
    }

    if (action === 'verify') {
      const plainPassword = crypto.randomBytes(6).toString('base64'); // e.g., 8-char password
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      const userData = {
        ...verification.toObject(),
        password: hashedPassword,
      };
      delete userData._id;
      delete userData.verificationToken;
      delete userData.expires;
      delete userData.verified;
      delete userData.createdAt;
      delete userData.updatedAt;
      delete userData.__v;

      await User.create(userData);

      verification.verified = true;
      await verification.save();

      // Send password by email
      await sendPasswordEmail(userData.email, plainPassword);

      return new Response(`
        <html><body style="text-align:center;font-family:Arial;">
          <div style="margin:50px auto;max-width:600px;padding:30px;border:1px solid #ccc;border-radius:8px;background:#f0fff0;">
            <h2 style="color:#4CAF50;">Account succesvol geverifieerd</h2>
            <p>Uw account is succesvol aangemaakt. Uw wachtwoord is per e-mail verzonden.</p>
            <a href="/login" style="display:inline-block;margin-top:20px;background:#4CAF50;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Inloggen</a>
          </div>
        </body></html>`, {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      });
    }

    if (action === 'cancel') {
      await verification.deleteOne();

      return new Response(`
        <html><body style="text-align:center;font-family:Arial;">
          <div style="margin:50px auto;max-width:600px;padding:30px;border:1px solid #ccc;border-radius:8px;background:#fff;">
            <h2 style="color:#2196F3;">Accountaanvraag geannuleerd</h2>
            <p>De aanmaak van het account is geannuleerd. Er wordt geen account aangemaakt voor dit e-mailadres.</p>
          </div>
        </body></html>`, {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      });
    }

  } catch (error) {
    console.error('Fout bij verificatie:', error);
    return new Response(`
      <html><body style="text-align:center;font-family:Arial;">
        <div style="margin:50px auto;max-width:600px;padding:30px;border:1px solid #ccc;border-radius:8px;background:#fff;">
          <h2 style="color:#f44336;">Er is een fout opgetreden</h2>
          <p>Probeer het later opnieuw of neem contact op met ondersteuning.</p>
        </div>
      </body></html>`, {
      status: 500,
      headers: { 'Content-Type': 'text/html' }
    });
  }
}
