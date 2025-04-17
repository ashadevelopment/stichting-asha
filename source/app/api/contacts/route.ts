// app/api/contacts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../lib/mongodb';
import ContactSettings from '../../lib/models/ContactSettings';
import User from '../../lib/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../lib/authOptions';

// GET endpoint to retrieve current contact persons
export async function GET(request: Request) {
  try {
    await dbConnect();
    console.log("Database verbonden in GET contacts route");
    
    const settings = await ContactSettings.findOne().populate("contactPersons");
    console.log("Contact settings gevonden:", settings ? "Ja" : "Nee");

    if (!settings || !Array.isArray(settings.contactPersons)) {
      console.log("Geen contactpersonen gevonden of populate werkte niet goed");
      return NextResponse.json({ contactPersons: [] });
    }

    console.log("Aantal contactpersonen gevonden:", settings.contactPersons.length);
    return NextResponse.json({ contactPersons: settings.contactPersons });

  } catch (error) {
    console.error("Error fetching contact persons:", error);
    return NextResponse.json(
      { error: "Failed to fetch contact persons" },
      { status: 500 }
    );
  }
}

// POST endpoint to update contact persons
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log("Session in POST contacts route:", session?.user?.email);
    
    // Check if user is authorized (beheerder or developer)
    if (!session || !session.user || !['beheerder', 'developer'].includes(session.user.role as string)) {
      console.log("Niet geautoriseerd om contactpersonen bij te werken");
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { contactPersonIds } = await request.json();
    console.log("Ontvangen contactpersonen IDs:", contactPersonIds);
    
    // Validate that there are exactly 2 contact persons
    if (!Array.isArray(contactPersonIds) || contactPersonIds.length > 2) {
      console.log("Ongeldig aantal contactpersonen:", contactPersonIds?.length);
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
        console.log("Gebruiker bestaat niet:", userId);
        return NextResponse.json(
          { error: `Gebruiker met ID ${userId} bestaat niet` },
          { status: 400 }
        );
      }
    }
    
    console.log("Alle gebruikers bestaan, bijwerken contactinstellingen");
    
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
    
    console.log("Contactinstellingen bijgewerkt, aantal personen:", settings.contactPersons?.length);
    
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