// source/app/api/volunteers/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Volunteer from '../../../lib/models/Volunteer';
import User from '../../../lib/models/User'; // Import User model
import { sendVolunteerStatusEmail } from '../../../lib/utils/email';
import bcrypt from 'bcryptjs'; // For password hashing

// Utility to extract [id] from URL
function extractIdFromRequest(req: NextRequest): string {
  return req.nextUrl.pathname.split('/')[3]; // /api/volunteers/[id] → index 4 = [id]
}

// Function to generate a random password
function generateRandomPassword(length: number = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

// Function to create user from approved volunteer
async function createUserFromVolunteer(volunteer: any): Promise<{ user: any; tempPassword: string } | null> {
  try {
    // Check if user already exists with this email
    const existingUser = await User.findOne({ email: volunteer.email.toLowerCase() });
    if (existingUser) {
      console.log(`User with email ${volunteer.email} already exists`);
      return null;
    }

    // Generate temporary password
    const tempPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    // Create user document
    const userData = {
      firstName: volunteer.firstName,
      lastName: volunteer.lastName,
      name: `${volunteer.firstName} ${volunteer.lastName}`,
      email: volunteer.email.toLowerCase(),
      password: hashedPassword,
      role: 'vrijwilliger',
      function: 'vrijwilliger',
      phoneNumber: volunteer.phoneNumber || '',
      isVerified: true, // Auto-verify since they went through volunteer approval
      createdFromVolunteer: true,
      volunteerId: volunteer._id
    };

    const newUser = await User.create(userData);
    console.log(`Created user account for approved volunteer: ${volunteer.email}`);

    return { user: newUser, tempPassword };
  } catch (error) {
    console.error('Error creating user from volunteer:', error);
    return null;
  }
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

    // If approved, create user account
    let userCreationResult = null;
    if (status === 'approved') {
      userCreationResult = await createUserFromVolunteer(volunteer);
    }

    // Get updated volunteer without file data
    const updatedVolunteer = await Volunteer.findById(id)
      .select('-cv.data -motivationLetter.data');

    // Send notification email based on status
    try {
      await sendVolunteerStatusEmail(
        volunteer.email,
        `${volunteer.firstName} ${volunteer.lastName}`,
        status === 'approved' ? 'approved' : 'rejected',
        userCreationResult?.tempPassword // Include temp password if user was created
      );
      console.log(`Status notification email sent to ${volunteer.email}`);
    } catch (emailError) {
      console.error('Failed to send status update email:', emailError);
      // Continue with the response, even if email sending fails
    }

    const responseMessage = status === 'approved' 
      ? userCreationResult 
        ? 'Vrijwilliger goedgekeurd en gebruikersaccount aangemaakt'
        : 'Vrijwilliger goedgekeurd (gebruikersaccount bestond al)'
      : 'Vrijwilliger afgewezen';

    return NextResponse.json({
      message: responseMessage,
      volunteer: updatedVolunteer,
      userCreated: !!userCreationResult
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

    // Also delete associated user if it exists
    try {
      const associatedUser = await User.findOne({ 
        email: volunteer.email.toLowerCase(),
        createdFromVolunteer: true 
      });
      
      if (associatedUser) {
        await User.findByIdAndDelete(associatedUser._id);
        console.log(`Also deleted associated user account for: ${volunteer.email}`);
      }
    } catch (userDeleteError) {
      console.error('Error deleting associated user:', userDeleteError);
      // Continue even if user deletion fails
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