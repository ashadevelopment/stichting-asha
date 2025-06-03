import { NextRequest, NextResponse } from 'next/server';
import { createTransporter } from '../../lib/utils/email';

export async function POST(request: NextRequest) {
  try {
    console.log('=== EMAIL ROUTE DEBUG START ===');
    
    const formData = await request.formData();
    console.log('FormData received');
    
    // Extract fields
    const fromName = formData.get('fromName') as string;
    const fromEmail = formData.get('fromEmail') as string;
    const toEmail = formData.get('toEmail') as string;
    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;
    const attachment = formData.get('attachment') as File | null;
    
    console.log('Form fields:', {
      fromName: !!fromName,
      fromEmail: !!fromEmail,
      toEmail: !!toEmail,
      subject: !!subject,
      message: !!message,
      attachment: !!attachment
    });
    
    // Validate required fields
    if (!fromName || !fromEmail || !toEmail || !subject || !message) {
      console.log('Validation failed - missing required fields');
      return NextResponse.json(
        { error: 'Alle verplichte velden moeten worden ingevuld' },
        { status: 400 }
      );
    }
    
    console.log('Environment check:', {
      GMAIL_USER: !!process.env.GMAIL_USER,
      GMAIL_APP_PASSWORD: !!process.env.GMAIL_APP_PASSWORD
    });
    
    // Get email transporter from existing utility
    console.log('Creating transporter...');
    const transporter = await createTransporter();
    console.log('Transporter created successfully');
    
    // Test connection
    try {
      await transporter.verify();
      console.log('SMTP connection verified');
    } catch (verifyError: unknown) {
      console.error('SMTP verification failed:', verifyError);
      const errorMessage = verifyError instanceof Error ? verifyError.message : 'Unknown verification error';
      throw new Error(`SMTP verification failed: ${errorMessage}`);
    }
    
    // Set up email data
    const mailOptions: any = {
      from: `"${fromName}" <${process.env.GMAIL_USER}>`,
      replyTo: `"${fromName}" <${fromEmail}>`,
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
      console.log('Processing attachment:', attachment.name, attachment.size);
      const buffer = Buffer.from(await attachment.arrayBuffer());
      mailOptions.attachments = [
        {
          filename: attachment.name,
          content: buffer,
        },
      ];
    }
    
    console.log('Sending email...');
    console.log('Mail options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      hasAttachment: !!mailOptions.attachments
    });
    
    // Send email
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    console.log('=== EMAIL ROUTE DEBUG END ===');
    
    return NextResponse.json(
      { message: 'E-mail succesvol verzonden', messageId: result.messageId },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('=== EMAIL ROUTE ERROR ===');
    
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      code: error instanceof Error && 'code' in error ? (error as any).code : undefined,
      command: error instanceof Error && 'command' in error ? (error as any).command : undefined,
      response: error instanceof Error && 'response' in error ? (error as any).response : undefined,
      stack: error instanceof Error ? error.stack : undefined
    };
    
    console.error('Error details:', errorDetails);
    console.error('=== EMAIL ROUTE ERROR END ===');
    
    return NextResponse.json(
      { 
        error: 'Er is een fout opgetreden bij het versturen van de e-mail',
        details: process.env.NODE_ENV === 'development' ? errorDetails.message : undefined
      },
      { status: 500 }
    );
  }
}