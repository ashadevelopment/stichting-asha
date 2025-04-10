import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import User from '../../../lib/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../api/auth/[...nextauth]/route';
import bcrypt from 'bcryptjs';
import Avatar from '../../../../components/Avatar';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authorized
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get form data
    const formData = await request.formData();
    
    const userId = formData.get('userId') as string;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string;
    const role = formData.get('role') as string;
    const functionTitle = formData.get('function') as string;
    const phoneNumber = formData.get('phoneNumber') as string;
    const password = formData.get('password') as string;
    const profilePicture = formData.get('profilePicture') as File | null;
    const deleteProfilePicture = formData.get('deleteProfilePicture') === 'true';
    
    // Validate required fields
    if (!userId || !firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'Verplichte velden ontbreken' },
        { status: 400 }
      );
    }
    
    // Connect to database
    await dbConnect();
    
    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'Gebruiker niet gevonden' },
        { status: 404 }
      );
    }
    
    // Allow users to update their own information, or admins/developers to update any user
    const isAdmin = ['beheerder', 'developer'].includes(session.user.role as string);
    const isSelf = session.user.id === userId;
    
    if (!isAdmin && !isSelf) {
      return NextResponse.json(
        { error: 'Je hebt geen toestemming om deze gebruiker te wijzigen' },
        { status: 403 }
      );
    }
    
    // Only administrators can change roles
    if (role !== user.role && !['beheerder'].includes(session.user.role as string)) {
      return NextResponse.json(
        { error: 'Je hebt geen toestemming om de rol van deze gebruiker te wijzigen' },
        { status: 403 }
      );
    }
    
    // Check if the email is already in use by another user
    if (email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== userId) {
        return NextResponse.json(
          { error: 'Email is al in gebruik' },
          { status: 400 }
        );
      }
    }
    
    // Update user data
    const updateData: any = {
      name: `${firstName} ${lastName}`,
      firstName,
      lastName,
      email,
      role: isAdmin ? role : user.role, // Only admin can change roles
      function: functionTitle || null,
      phoneNumber: phoneNumber || null,
    };
    
    // Update password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    
    // Process profile picture if exists
    if (profilePicture) {
      const buffer = Buffer.from(await profilePicture.arrayBuffer());
      const base64Data = buffer.toString('base64');
      
      updateData.profilePicture = {
        data: base64Data,
        contentType: profilePicture.type,
        filename: profilePicture.name
      };
    } else if (deleteProfilePicture) {
      updateData.profilePicture = {
        data: null,
        contentType: null,
        filename: null
      };
    }
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    );
    
    return NextResponse.json({ 
      message: 'Gebruiker succesvol bijgewerkt',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
      }
    });
    
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Fout bij bijwerken van gebruiker' },
      { status: 500 }
    );
  }
}