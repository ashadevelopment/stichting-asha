import { NextResponse } from "next/server";
import connectDB from "../../lib/mongodb";
import Volunteer from "../../lib/models/Volunteer";
import User from "../../lib/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { hash } from "bcryptjs";

// GET all volunteers
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is a manager
    if (!session || !session.user || session.user.role !== 'beheerder') {
      return NextResponse.json(
        { error: "Alleen beheerders kunnen vrijwilligersaanmeldingen bekijken" }, 
        { status: 403 }
      );
    }
    
    await connectDB();
    
    // Get filter parameter
    const url = new URL(req.url);
    const status = url.searchParams.get('status') || 'pending';
    
    // Find volunteers based on status
    const volunteers = await Volunteer.find({ status }).select('-cv.data -motivationLetter.data');
    
    return NextResponse.json(volunteers);
  } catch (error) {
    console.error("Error fetching volunteers:", error);
    return NextResponse.json(
      { error: "Fout bij ophalen van vrijwilligers" }, 
      { status: 500 }
    );
  }
}