// Create a test file: app/api/test-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createTransporter } from '../../lib/utils/email';

export async function GET() {
  try {
    console.log('Testing email configuration...');
    console.log('GMAIL_USER:', process.env.GMAIL_USER ? 'Set' : 'NOT SET');
    console.log('GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD ? 'Set' : 'NOT SET');
    
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      return NextResponse.json({
        error: 'Environment variables missing',
        details: {
          GMAIL_USER: !!process.env.GMAIL_USER,
          GMAIL_APP_PASSWORD: !!process.env.GMAIL_APP_PASSWORD
        }
      }, { status: 500 });
    }

    // Test transporter creation
    const transporter = await createTransporter();
    console.log('Transporter created successfully');
    
    // Verify connection
    await transporter.verify();
    console.log('SMTP connection verified successfully');
    
    // Send test email
    const testEmail = {
      from: `"Test Stichting Asha" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER, // Send to yourself for testing
      subject: 'Test Email - Stichting Asha',
      text: 'This is a test email to verify email configuration.',
      html: '<p>This is a test email to verify email configuration.</p>'
    };
    
    const result = await transporter.sendMail(testEmail);
    console.log('Test email sent successfully:', result.messageId);
    
    return NextResponse.json({
      success: true,
      message: 'Email configuration is working',
      messageId: result.messageId
    });
    
  } catch (error: unknown) {
    console.error('Email test failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorCode = error instanceof Error && 'code' in error ? (error as any).code : undefined;
    
    return NextResponse.json({
      error: 'Email test failed',
      details: errorMessage,
      code: errorCode
    }, { status: 500 });
  }
}