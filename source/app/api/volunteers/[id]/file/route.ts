import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Volunteer from '../../../../lib/models/Volunteer';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    // Get file type from query parameters
    const { searchParams } = new URL(request.url);
    const fileType = searchParams.get('type');
    
    // Validate file type
    if (fileType !== 'cv' && fileType !== 'motivationLetter') {
      return NextResponse.json(
        { error: 'Ongeldig bestandstype. Gebruik "cv" of "motivationLetter"' },
        { status: 400 }
      );
    }
    
    // Find volunteer
    const volunteer = await Volunteer.findById(params.id);
    
    if (!volunteer) {
      return NextResponse.json(
        { error: 'Vrijwilliger niet gevonden' },
        { status: 404 }
      );
    }
    
    // Get the requested file
    const file = volunteer[fileType];
    
    if (!file || !file.data) {
      return NextResponse.json(
        { error: 'Bestand niet gevonden' },
        { status: 404 }
      );
    }
    
    // Return file data
    return NextResponse.json({
      filename: file.filename,
      contentType: file.contentType,
      data: file.data
    });
  } catch (error) {
    console.error('Error fetching file:', error);
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het ophalen van het bestand' },
      { status: 500 }
    );
  }
}