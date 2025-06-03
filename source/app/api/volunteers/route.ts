import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../lib/mongodb';
import Volunteer from '../../lib/models/Volunteer';
import { sendVolunteerApplicationEmails } from '../../lib/utils/email';

// File size limits (in bytes)
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB per file (reduced for Vercel)
const MAX_TOTAL_SIZE = 4 * 1024 * 1024; // 4MB total (within Vercel's 4.5MB limit)

// Allowed file types
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    // Parse the multipart form data
    const formData = await request.formData();
    
    // Extract basic fields
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string;
    const phoneNumber = formData.get('phoneNumber') as string;
    const message = formData.get('message') as string;
    
    // Extract and process files
    const cvFile = formData.get('cv') as File;
    const motivationFile = formData.get('motivationLetter') as File;

    // Validate required fields
    if (!firstName || !lastName || !email || !phoneNumber || !message || !cvFile || !motivationFile) {
      return NextResponse.json(
        { error: 'Alle velden zijn verplicht' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Ongeldig e-mailadres' },
        { status: 400 }
      );
    }

    // Validate file sizes
    if (cvFile.size > MAX_FILE_SIZE) {
        return NextResponse.json(
            { error: `CV bestand is te groot. Maximum grootte is ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
            { status: 400 }
        );
    }

    if (motivationFile.size > MAX_FILE_SIZE) {
        return NextResponse.json(
            { error: `Motivatiebrief bestand is te groot. Maximum grootte is ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
            { status: 400 }
        );
    }

    // Check total file size (base64 encoding increases size by ~33%)
    const totalSize = cvFile.size + motivationFile.size;
    const estimatedBase64Size = totalSize * 1.33; // Account for base64 expansion
    
    if (estimatedBase64Size > MAX_TOTAL_SIZE) {
        return NextResponse.json(
            { error: `Gecombineerde bestandsgrootte is te groot. Maximum totaal is ${MAX_TOTAL_SIZE / (1024 * 1024)}MB` },
            { status: 400 }
        );
    }

    // Validate file types
    if (!ALLOWED_FILE_TYPES.includes(cvFile.type)) {
      return NextResponse.json(
        { error: 'CV moet een PDF of Word document zijn (.pdf, .doc, .docx)' },
        { status: 400 }
      );
    }

    if (!ALLOWED_FILE_TYPES.includes(motivationFile.type)) {
      return NextResponse.json(
        { error: 'Motivatiebrief moet een PDF of Word document zijn (.pdf, .doc, .docx)' },
        { status: 400 }
      );
    }

    // Validate file names (prevent potential security issues)
    const fileNameRegex = /^[a-zA-Z0-9._\-\s]+$/;
    if (!fileNameRegex.test(cvFile.name) || !fileNameRegex.test(motivationFile.name)) {
      return NextResponse.json(
        { error: 'Bestandsnamen bevatten ongeldige karakters' },
        { status: 400 }
      );
    }

    try {
      // Convert CV file to base64
      const cvBuffer = await cvFile.arrayBuffer();
      const cvBase64 = Buffer.from(cvBuffer).toString('base64');
      
      // Convert motivation letter to base64
      const motivationBuffer = await motivationFile.arrayBuffer();
      const motivationBase64 = Buffer.from(motivationBuffer).toString('base64');

      // Create new volunteer document with status "pending"
      const volunteer = await Volunteer.create({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase().trim(),
        phoneNumber: phoneNumber.trim(),
        message: message.trim(),
        cv: {
          filename: cvFile.name,
          contentType: cvFile.type,
          data: cvBase64
        },
        motivationLetter: {
          filename: motivationFile.name,
          contentType: motivationFile.type,
          data: motivationBase64
        },
        status: 'pending' // Default status
      });

      console.log(`New volunteer application created with ID: ${volunteer._id}`);

      // Send confirmation emails to both volunteer and admin
      try {
        await sendVolunteerApplicationEmails(
          email,
          `${firstName} ${lastName}`
        );
        console.log(`Confirmation emails sent for volunteer: ${email}`);
      } catch (emailError) {
        console.error('Failed to send confirmation emails:', emailError);
        // Continue with the response, even if email sending fails
      }

      return NextResponse.json(
        { message: 'Aanmelding succesvol ontvangen', id: volunteer._id },
        { status: 201 }
      );

    } catch (fileProcessingError: any) {
      console.error('Error processing files:', fileProcessingError);
      
      // Check if it's a size-related error
      if (fileProcessingError.message?.includes('too large') || 
          fileProcessingError.message?.includes('size') ||
          fileProcessingError.name === 'RangeError') {
        return NextResponse.json(
          { error: 'De geüploade bestanden zijn te groot. Probeer kleinere bestanden te gebruiken.' },
          { status: 400 }
        );
      }
      
      throw fileProcessingError; // Re-throw if it's not a size error
    }

  } catch (error: any) {
    console.error('Error creating volunteer:', error);
    
    // Handle duplicate email error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Er bestaat al een aanmelding met dit e-mailadres' },
        { status: 409 }
      );
    }

    // Handle MongoDB document too large error
    if (error.name === 'RangeError' || 
        error.message?.includes('too large') || 
        error.message?.includes('16777216')) {
      return NextResponse.json(
        { error: 'De geüploade bestanden zijn te groot voor het systeem. Probeer kleinere bestanden te gebruiken.' },
        { status: 400 }
      );
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const firstError = Object.values(error.errors)[0] as any;
      return NextResponse.json(
        { error: firstError?.message || 'Validatiefout in de ingevoerde gegevens' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het verwerken van je aanmelding' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Get status and pagination from query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    
    // Build query based on status parameter
    let query = {};
    if (status && status !== 'all') {
      query = { status };
    }
    
    // Fetch volunteers from database with pagination
    const volunteers = await Volunteer.find(query)
      .select('-cv.data -motivationLetter.data') // Exclude file data for better performance
      .sort({ createdAt: -1 })  // Sort by newest first
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Volunteer.countDocuments(query);
    
    return NextResponse.json({
      volunteers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching volunteers:', error);
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het ophalen van vrijwilligers' },
      { status: 500 }
    );
  }
}