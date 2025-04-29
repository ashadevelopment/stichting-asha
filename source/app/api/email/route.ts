import { NextRequest, NextResponse } from 'next/server';
import { createTransporter } from '../../lib/utils/email';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract fields
    const fromName = formData.get('fromName') as string;
    const fromEmail = formData.get('fromEmail') as string;
    const toEmail = formData.get('toEmail') as string;
    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;
    const attachment = formData.get('attachment') as File | null;
    
    // Validate required fields
    if (!fromName || !fromEmail || !toEmail || !subject || !message) {
      return NextResponse.json(
        { error: 'Alle verplichte velden moeten worden ingevuld' },
        { status: 400 }
      );
    }
    
    // Get email transporter from existing utility
    const transporter = await createTransporter();
    
    // Set up email data
    const mailOptions: any = {
      from: `"${fromName}" <${process.env.GMAIL_USER}>`, // Use authenticated email as sender
      replyTo: `"${fromName}" <${fromEmail}>`, // Set reply-to as the contact form submitter
      to: toEmail,
      subject: `[Contact Formulier] ${subject}`,
      text: `
        Bericht van: ${fromName} (${fromEmail})
        
        ${message}
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Nieuw contactformulier bericht</h2>
          <p><strong>Van:</strong> ${fromName} (${fromEmail})</p>
          <p><strong>Onderwerp:</strong> ${subject}</p>
          <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
            ${message.replace(/\n/g, '<br>')}
          </div>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            Dit bericht is verzonden via het contactformulier van Stichting Asha.
          </p>
        </div>
      `,
    };
    
    // Handle attachment if present
    if (attachment) {
      const buffer = Buffer.from(await attachment.arrayBuffer());
      mailOptions.attachments = [
        {
          filename: attachment.name,
          content: buffer,
        },
      ];
    }
    
    // Send email
    await transporter.sendMail(mailOptions);
    
    return NextResponse.json(
      { message: 'E-mail succesvol verzonden' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het versturen van de e-mail' },
      { status: 500 }
    );
  }
}