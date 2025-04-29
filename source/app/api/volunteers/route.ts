import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../lib/mongodb';
import Volunteer from '../../lib/models/Volunteer';
import { sendVolunteerApplicationEmails } from '../../lib/utils/email';

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

    if (!firstName || !lastName || !email || !phoneNumber || !message || !cvFile || !motivationFile) {
      return NextResponse.json(
        { error: 'Alle velden zijn verplicht' },
        { status: 400 }
      );
    }

    // Convert CV file to base64
    const cvBuffer = await cvFile.arrayBuffer();
    const cvBase64 = Buffer.from(cvBuffer).toString('base64');
    
    // Convert motivation letter to base64
    const motivationBuffer = await motivationFile.arrayBuffer();
    const motivationBase64 = Buffer.from(motivationBuffer).toString('base64');

    // Create new volunteer document with status "pending"
    const volunteer = await Volunteer.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      message,
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

    // Send confirmation emails to both volunteer and admin
    try {
      await sendVolunteerApplicationEmails(
        email,
        `${firstName} ${lastName}`
      );
    } catch (emailError) {
      console.error('Failed to send confirmation emails:', emailError);
      // Continue with the response, even if email sending fails
    }

    return NextResponse.json(
      { message: 'Aanmelding succesvol ontvangen', id: volunteer._id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating volunteer:', error);
    
    // Handle duplicate email error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Er bestaat al een aanmelding met dit e-mailadres' },
        { status: 409 }
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
    
    // Get status from query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    // Build query based on status parameter
    let query = {};
    if (status && status !== 'all') {
      query = { status };
    }
    
    // Fetch volunteers from database
    const volunteers = await Volunteer.find(query)
      .select('-cv.data -motivationLetter.data') // Exclude file data for better performance
      .sort({ createdAt: -1 });  // Sort by newest first
    
    return NextResponse.json(volunteers);
  } catch (error) {
    console.error('Error fetching volunteers:', error);
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het ophalen van vrijwilligers' },
      { status: 500 }
    );
  }
}