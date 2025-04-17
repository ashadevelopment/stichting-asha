import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Volunteer from '../../../../lib/models/Volunteer';

// Utility to extract the [id] from URL
function extractIdFromRequest(req: NextRequest): string {
  return req.nextUrl.pathname.split('/')[4]; // /api/volunteers/[id]/file → [id] is index 4
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const id = extractIdFromRequest(request);

    // Get file type from query parameters
    const { searchParams } = new URL(request.url);
    const fileType = searchParams.get('type');

    if (fileType !== 'cv' && fileType !== 'motivationLetter') {
      return NextResponse.json(
        { error: 'Ongeldig bestandstype. Gebruik "cv" of "motivationLetter"' },
        { status: 400 }
      );
    }

    const volunteer = await Volunteer.findById(id);

    if (!volunteer) {
      return NextResponse.json(
        { error: 'Vrijwilliger niet gevonden' },
        { status: 404 }
      );
    }

    const file = volunteer[fileType];

    if (!file || !file.data) {
      return NextResponse.json(
        { error: 'Bestand niet gevonden' },
        { status: 404 }
      );
    }

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