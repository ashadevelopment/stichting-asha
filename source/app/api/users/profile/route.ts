import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import User from '../../../lib/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/authOptions';

// Update user profile
export async function PUT(req: NextRequest) {
  try {
    // Verify user is authenticated and updating their own profile
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const formData = await req.formData();
    
    const userId = formData.get('userId') as string;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string;
    const phoneNumber = formData.get('phoneNumber') as string;
    
    // Ensure user can only update their own profile
    if (userId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only update your own profile' },
        { status: 403 }
      );
    }
    
    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }
    
    await dbConnect();
    
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Check if email is being changed and if it already exists
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser && existingUser._id.toString() !== userId) {
        return NextResponse.json(
          { message: 'Email already in use' },
          { status: 400 }
        );
      }
    }
    
    // Update user data
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email.toLowerCase();
    if (phoneNumber) user.phoneNumber = phoneNumber;
    
    // Update the name field for NextAuth compatibility
    user.name = `${firstName} ${lastName}`.trim();
    
    // Save the updated user
    await user.save();
    
    return NextResponse.json(
      { 
        message: 'Profiel succesvol bijgewerkt',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber
        }
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { message: 'Er is een fout opgetreden bij het bijwerken van uw profiel' },
      { status: 500 }
    );
  }
}