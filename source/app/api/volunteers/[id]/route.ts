import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Volunteer from '../../../lib/models/Volunteer';
import { sendVolunteerStatusEmail } from '../../../lib/utils/email';

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
    console.log(`Updating volunteer status for ID: ${id}`);
    
    const body = await request.json();
    const { action } = body;

    console.log(`Action received: ${action}`);

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json(
        { error: 'Ongeldige actie. Gebruik "approve" of "reject"' },
        { status: 400 }
      );
    }

    const status = action === 'approve' ? 'approved' : 'rejected';

    // First get the volunteer to access email and name for notification
    const volunteer = await Volunteer.findById(id);
    
    if (!volunteer) {
      console.log(`Volunteer with ID ${id} not found`);
      return NextResponse.json(
        { error: 'Vrijwilliger niet gevonden' },
        { status: 404 }
      );
    }

    // Update status
    volunteer.status = status;
    await volunteer.save();
    console.log(`Volunteer status updated to: ${status}`);

    // Get updated volunteer without file data
    const updatedVolunteer = await Volunteer.findById(id)
      .select('-cv.data -motivationLetter.data');

    // Send notification email based on status
    try {
      await sendVolunteerStatusEmail(
        volunteer.email,
        `${volunteer.firstName} ${volunteer.lastName}`,
        status === 'approved' ? 'approved' : 'rejected'
      );
      console.log(`Status notification email sent to ${volunteer.email}`);
    } catch (emailError) {
      console.error('Failed to send status update email:', emailError);
      // Continue with the response, even if email sending fails
    }

    return NextResponse.json({
      message: `Vrijwilliger succesvol ${status === 'approved' ? 'goedgekeurd' : 'afgewezen'}`,
      volunteer: updatedVolunteer
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
    console.log(`Deleting volunteer with ID: ${id}`);

    const volunteer = await Volunteer.findByIdAndDelete(id);

    if (!volunteer) {
      console.log(`Volunteer with ID ${id} not found for deletion`);
      return NextResponse.json(
        { error: 'Vrijwilliger niet gevonden' },
        { status: 404 }
      );
    }

    console.log(`Successfully deleted volunteer with ID: ${id}`);
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