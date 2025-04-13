import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Volunteer from '../../../lib/models/Volunteer';

// Get a specific volunteer
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const volunteer = await Volunteer.findById(params.id)
      .select('-cv.data -motivationLetter.data'); // Exclude file data
    
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

// Update volunteer status (approve or reject)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const { action } = await request.json();
    
    // Validate action
    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json(
        { error: 'Ongeldige actie. Gebruik "approve" of "reject"' },
        { status: 400 }
      );
    }
    
    // Map action to status
    const status = action === 'approve' ? 'approved' : 'rejected';
    
    // Find and update volunteer
    const volunteer = await Volunteer.findByIdAndUpdate(
      params.id,
      { status },
      { new: true } // Return updated document
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

// Delete a volunteer
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const volunteer = await Volunteer.findByIdAndDelete(params.id);
    
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