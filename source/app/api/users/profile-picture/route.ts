import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import User from '../../../lib/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../api/auth/[...nextauth]/route';

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
    
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Connect to database
    await dbConnect();
    
    // Allow users to delete their own picture, or admins/developers to delete any picture
    const isAdmin = ['beheerder', 'developer'].includes(session.user.role as string);
    const isSelf = session.user.id === userId;
    
    if (!isAdmin && !isSelf) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this profile picture' },
        { status: 403 }
      );
    }
    
    // Update user to remove profile picture
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        $set: { 
          'profilePicture.data': null,
          'profilePicture.contentType': null,
          'profilePicture.filename': null
        } 
      },
      { new: true }
    );
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      message: 'Profile picture deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting profile picture:', error);
    return NextResponse.json(
      { error: 'Failed to delete profile picture' },
      { status: 500 }
    );
  }
}