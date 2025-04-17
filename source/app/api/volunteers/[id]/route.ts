import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Volunteer from '../../../lib/models/Volunteer';

// Utility to extract [id] from URL
function extractIdFromRequest(req: NextRequest): string {
  return req.nextUrl.pathname.split('/')[4]; // /api/volunteers/[id] → index 4 = [id]
}

// GET a specific volunteer
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const id = extractIdFromRequest(request);

    const volunteer = await Volunteer.findById(id).select('-cv.data -motivationLetter.data');
    if (!volunteer) {
      return NextResponse.json(
        { error: 'Vrijwilliger niet gevonden' },
        { status: 404 }
      );
    }

    return NextResponse.json(volunteer);
  } catch (error) {
    console.error('Error fetching volunteer:', error);
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het ophalen van de vrijwilliger' },
      { status: 500 }
    );
  }
}

// PUT - Update volunteer status (approve or reject)
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const id = extractIdFromRequest(request);
    const { action } = await request.json();

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json(
        { error: 'Ongeldige actie. Gebruik "approve" of "reject"' },
        { status: 400 }
      );
    }

    const status = action === 'approve' ? 'approved' : 'rejected';

    const volunteer = await Volunteer.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).select('-cv.data -motivationLetter.data');

    if (!volunteer) {
      return NextResponse.json(
        { error: 'Vrijwilliger niet gevonden' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: `Vrijwilliger succesvol ${status === 'approved' ? 'goedgekeurd' : 'afgewezen'}`,
      volunteer
    });
  } catch (error) {
    console.error('Error updating volunteer status:', error);
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het bijwerken van de vrijwilliger' },
      { status: 500 }
    );
  }
}

// DELETE a volunteer
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    const id = extractIdFromRequest(request);

    const volunteer = await Volunteer.findByIdAndDelete(id);

    if (!volunteer) {
      return NextResponse.json(
        { error: 'Vrijwilliger niet gevonden' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Vrijwilliger succesvol verwijderd'
    });
  } catch (error) {
    console.error('Error deleting volunteer:', error);
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het verwijderen van de vrijwilliger' },
      { status: 500 }
    );
  }
}