// app/api/contacts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../lib/mongodb';
import ContactSettings from '../../lib/models/ContactSettings';
import User from '../../lib/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../api/auth/[...nextauth]/route';

// GET endpoint to retrieve current contact persons
export async function GET() {
  try {
    await dbConnect();
    
    // Find the contact settings document (should be only one)
    let settings = await ContactSettings.findOne().populate('contactPersons');
    
    // If no settings exist yet, return empty array
    if (!settings) {
      return NextResponse.json({ contactPersons: [] });
    }
    
    return NextResponse.json({ contactPersons: settings.contactPersons });
  } catch (error) {
    console.error('Error fetching contact persons:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contact persons' },
      { status: 500 }
    );
  }
}

// POST endpoint to update contact persons
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authorized (beheerder or developer)
    if (!session || !session.user || !['beheerder', 'developer'].includes(session.user.role as string)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { contactPersonIds } = await request.json();
    
    // Validate that there are exactly 2 contact persons
    if (!Array.isArray(contactPersonIds) || contactPersonIds.length > 2) {
      return NextResponse.json(
        { error: 'Er kunnen maximaal 2 contactpersonen worden ingesteld' },
        { status: 400 }
      );
    }
    
    // Verify that all specified users exist
    await dbConnect();
    for (const userId of contactPersonIds) {
      const userExists = await User.exists({ _id: userId });
      if (!userExists) {
        return NextResponse.json(
          { error: `Gebruiker met ID ${userId} bestaat niet` },
          { status: 400 }
        );
      }
    }
    
    // Update or create the contact settings
    const settings = await ContactSettings.findOneAndUpdate(
      {}, // empty filter to find any document
      { 
        contactPersons: contactPersonIds,
        lastUpdated: new Date(),
        updatedBy: session.user.email
      },
      { 
        upsert: true, // create if doesn't exist
        new: true // return the updated document
      }
    ).populate('contactPersons');
    
    return NextResponse.json({ 
      message: 'Contactpersonen zijn bijgewerkt',
      contactPersons: settings.contactPersons
    });
  } catch (error) {
    console.error('Error updating contact persons:', error);
    return NextResponse.json(
      { error: 'Failed to update contact persons' },
      { status: 500 }
    );
  }
}