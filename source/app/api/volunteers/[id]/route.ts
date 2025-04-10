import { NextResponse } from "next/server";
import connectDB from "../../../lib/mongodb";
import Volunteer from "../../../lib/models/Volunteer";
import User from "../../../lib/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { hash } from "bcryptjs";

// GET a specific volunteer
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is a manager
    if (!session || !session.user || session.user.role !== 'beheerder') {
      return NextResponse.json(
        { error: "Alleen beheerders kunnen vrijwilligersgegevens bekijken" }, 
        { status: 403 }
      );
    }
    
    await connectDB();
    
    const volunteer = await Volunteer.findById(params.id);
    
    if (!volunteer) {
      return NextResponse.json(
        { error: "Vrijwilliger niet gevonden" }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json(volunteer);
  } catch (error) {
    console.error("Error fetching volunteer:", error);
    return NextResponse.json(
      { error: "Fout bij ophalen van vrijwilliger" }, 
      { status: 500 }
    );
  }
}

// PUT to approve a volunteer
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
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
    
    await connectDB();
    
    const body = await req.json();
    const { action } = body;
    
    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: "Ongeldige actie" }, 
        { status: 400 }
      );
    }
    
    const volunteer = await Volunteer.findById(params.id);
    
    if (!volunteer) {
      return NextResponse.json(
        { error: "Vrijwilliger niet gevonden" }, 
        { status: 404 }
      );
    }
    
    if (action === 'approve') {
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
    } else {
      // Reject the volunteer
      volunteer.status = 'rejected';
      await volunteer.save();
      
      return NextResponse.json({
        message: "Vrijwilliger afgewezen"
      });
    }
  } catch (error) {
    console.error("Error updating volunteer:", error);
    return NextResponse.json(
      { error: "Fout bij bijwerken van vrijwilliger" }, 
      { status: 500 }
    );
  }
}

// DELETE a volunteer
export async function DELETE(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is a manager
    if (!session || !session.user || session.user.role !== 'beheerder') {
      return NextResponse.json(
        { error: "Alleen beheerders kunnen vrijwilligers verwijderen" }, 
        { status: 403 }
      );
    }
    
    await connectDB();
    
    const volunteer = await Volunteer.findByIdAndDelete(context.params.id);
    
    if (!volunteer) {
      return NextResponse.json(
        { error: "Vrijwilliger niet gevonden" }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: "Vrijwilliger succesvol verwijderd"
    });
  } catch (error) {
    console.error("Error deleting volunteer:", error);
    return NextResponse.json(
      { error: "Fout bij verwijderen van vrijwilliger" }, 
      { status: 500 }
    );
  }
}