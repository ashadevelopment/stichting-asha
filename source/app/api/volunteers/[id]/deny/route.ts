import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Volunteer from '../../../../lib/models/Volunteer';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';

export async function PUT(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is a manager
    if (!session || !session.user || session.user.role !== 'beheerder') {
      return NextResponse.json(
        { error: "Alleen beheerders kunnen vrijwilligers afwijzen" }, 
        { status: 403 }
      );
    }

    const { id } = context.params;

    await dbConnect();

    const volunteer = await Volunteer.findById(id);
    
    if (!volunteer) {
      return NextResponse.json(
        { error: 'Vrijwilliger niet gevonden.' },
        { status: 404 }
      );
    }

    // Update volunteer status
    volunteer.status = 'rejected';
    await volunteer.save();
    
    return NextResponse.json({
      message: "Vrijwilliger afgewezen"
    });
  } catch (error) {
    console.error('Fout bij afwijzen vrijwilliger:', error);
    return NextResponse.json(
      { error: 'Fout bij afwijzen vrijwilliger.' },
      { status: 500 }
    );
  }
}