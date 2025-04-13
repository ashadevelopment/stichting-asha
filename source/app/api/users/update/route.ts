import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import User from '../../../lib/models/User';
import bcrypt from 'bcryptjs';

export async function PUT(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    const userId = formData.get('userId') as string;
    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Update basic fields
    user.name = formData.get('name') as string || user.name;
    user.firstName = formData.get('firstName') as string || user.firstName;
    user.lastName = formData.get('lastName') as string || user.lastName;
    user.email = formData.get('email') as string || user.email;
    user.role = formData.get('role') as string || user.role;
    user.function = formData.get('function') as string || user.function;
    user.phoneNumber = formData.get('phoneNumber') as string || user.phoneNumber;
    
    // Update password if provided
    const password = formData.get('password') as string;
    if (password && password.trim() !== '') {
      user.password = await bcrypt.hash(password, 10);
    }
    
    // Handle profile picture
    const profilePicture = formData.get('profilePicture') as File;
    const removeProfilePicture = formData.get('removeProfilePicture') === 'true';
    
    if (removeProfilePicture) {
      // If user wants to remove their profile picture
      user.profilePicture = {
        filename: null,
        contentType: null,
        data: null
      };
    } else if (profilePicture) {
      // If user uploaded a new profile picture
      user.profilePicture = {
        filename: profilePicture.name,
        contentType: profilePicture.type,
        data: Buffer.from(await profilePicture.arrayBuffer()).toString('base64')
      };
    }
    
    await user.save();
    
    return NextResponse.json(
      { message: 'User updated successfully', user },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { message: 'Error updating user' },
      { status: 500 }
    );
  }
}