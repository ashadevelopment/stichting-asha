import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Volunteer from '../../../../lib/models/Volunteer';
import User from '../../../../lib/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { hash } from 'bcryptjs';

export async function PUT(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is a manager
    if (!session || !session.user || session.user.role !== 'beheerder') {
      return NextResponse.json(
        { error: "Alleen beheerders kunnen vrijwilligers goedkeuren" }, 
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
    volunteer.status = 'approved';
    await volunteer.save();
    
    // Create a user account for the volunteer
    const password = Math.random().toString(36).slice(-8); // Generate random password
    const hashedPassword = await hash(password, 12);
    
    const user = await User.create({
      name: `${volunteer.firstName} ${volunteer.lastName}`,
      email: volunteer.email.toLowerCase(),
      password: hashedPassword,
      role: 'vrijwilliger'
    });
    
    return NextResponse.json({
      message: "Vrijwilliger goedgekeurd en account aangemaakt",
      temporaryPassword: password
    });
  } catch (error) {
    console.error('Fout bij goedkeuren vrijwilliger:', error);
    return NextResponse.json(
      { error: 'Fout bij goedkeuren vrijwilliger.' },
      { status: 500 }
    );
  }
}