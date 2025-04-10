import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongodb";
import Volunteer from "../../../../lib/models/Volunteer";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";

export async function GET(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is a manager
    if (!session || !session.user || session.user.role !== 'beheerder') {
      return NextResponse.json(
        { error: "Alleen beheerders kunnen vrijwilligersdocumenten bekijken" }, 
        { status: 403 }
      );
    }
    
    await connectDB();
    
    // Get the file type from query params
    const url = new URL(req.url);
    const fileType = url.searchParams.get('type');
    
    if (!['cv', 'motivationLetter'].includes(fileType || '')) {
      return NextResponse.json(
        { error: "Ongeldig bestandstype" }, 
        { status: 400 }
      );
    }
    
    const volunteer = await Volunteer.findById(context.params.id);
    
    if (!volunteer) {
      return NextResponse.json(
        { error: "Vrijwilliger niet gevonden" }, 
        { status: 404 }
      );
    }
    
    const file = fileType === 'cv' ? volunteer.cv : volunteer.motivationLetter;
    
    if (!file || !file.data) {
      return NextResponse.json(
        { error: "Bestand niet gevonden" }, 
        { status: 404 }
      );
    }
    
    // Return file data
    return NextResponse.json({
      filename: file.filename,
      contentType: file.contentType,
      data: file.data
    });
  } catch (error) {
    console.error("Error fetching volunteer file:", error);
    return NextResponse.json(
      { error: "Fout bij ophalen van bestand" }, 
      { status: 500 }
    );
  }
}