import { NextResponse } from "next/server";
import connectDB from "../../../lib/mongodb";
import Volunteer from "../../../lib/models/Volunteer";

export async function POST(req: Request) {
  try {
    await connectDB();
    
    const formData = await req.formData();
    
    // Get form fields
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const phoneNumber = formData.get("phoneNumber") as string;
    const message = formData.get("message") as string;
    
    // Validate required fields
    if (!firstName || !lastName || !email || !phoneNumber || !message) {
      return NextResponse.json(
        { error: "Alle velden zijn verplicht" }, 
        { status: 400 }
      );
    }
    
    // Process CV file
    const cvFile = formData.get("cv") as File;
    let cvData = null;
    if (cvFile) {
      const cvBytes = await cvFile.arrayBuffer();
      const cvBuffer = Buffer.from(cvBytes);
      cvData = {
        filename: cvFile.name,
        contentType: cvFile.type,
        data: cvBuffer.toString('base64')
      };
    } else {
      return NextResponse.json(
        { error: "CV is verplicht" }, 
        { status: 400 }
      );
    }
    
    // Process Motivation Letter file
    const motivationFile = formData.get("motivationLetter") as File;
    let motivationData = null;
    if (motivationFile) {
      const motivationBytes = await motivationFile.arrayBuffer();
      const motivationBuffer = Buffer.from(motivationBytes);
      motivationData = {
        filename: motivationFile.name,
        contentType: motivationFile.type,
        data: motivationBuffer.toString('base64')
      };
    } else {
      return NextResponse.json(
        { error: "Motivatiebrief is verplicht" }, 
        { status: 400 }
      );
    }
    
    // Check if email is already used
    const existingVolunteer = await Volunteer.findOne({ email });
    if (existingVolunteer) {
      return NextResponse.json(
        { error: "Dit e-mailadres is al gebruikt voor een aanmelding" }, 
        { status: 400 }
      );
    }
    
    // Create new volunteer application
    const volunteer = await Volunteer.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      message,
      cv: cvData,
      motivationLetter: motivationData,
      status: 'pending'
    });
    
    return NextResponse.json(
      { message: "Aanmelding succesvol ontvangen" }, 
      { status: 201 }
    );
  } catch (err) {
    console.error("Volunteer application error:", err);
    return NextResponse.json(
      { error: "Er is een fout opgetreden bij het verwerken van je aanmelding" }, 
      { status: 500 }
    );
  }
}