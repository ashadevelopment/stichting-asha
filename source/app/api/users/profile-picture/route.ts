// app/api/users/profile-picture/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import User from '../../../lib/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/authOptions';

// GET profile picture for a user
export async function GET(req: NextRequest) {
  try {
    // Connect to database
    await dbConnect();

    // Get user ID from query parameters
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Find the user
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has a profile picture
    if (!user.profilePicture || !user.profilePicture.data) {
      return NextResponse.json({ error: 'No profile picture found' }, { status: 404 });
    }

    // Return the profile picture
    return NextResponse.json({
      filename: user.profilePicture.filename,
      contentType: user.profilePicture.contentType,
      data: user.profilePicture.data
    });
  } catch (error) {
    console.error('Error fetching profile picture:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile picture' }, 
      { status: 500 }
    );
  }
}

// POST method for uploading profile picture
export async function POST(req: NextRequest) {
  try {
    // Verify user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database
    await dbConnect();

    // Parse multipart form data
    const formData = await req.formData();
    const userId = formData.get('userId') as string;
    const profilePicture = formData.get('profilePicture') as File;

    // Validate inputs
    if (!userId || !profilePicture) {
      return NextResponse.json({ error: 'User ID and profile picture are required' }, { status: 400 });
    }

    // Find the user
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Read file data
    const bytes = await profilePicture.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Update user's profile picture
    user.profilePicture = {
      filename: profilePicture.name,
      contentType: profilePicture.type,
      data: buffer.toString('base64')
    };

    // Save the user
    await user.save();

    return NextResponse.json({ message: 'Profile picture uploaded successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    return NextResponse.json(
      { error: 'Failed to upload profile picture' }, 
      { status: 500 }
    );
  }
}

// DELETE method for removing profile picture
export async function DELETE(req: NextRequest) {
  try {
    // Verify user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database
    await dbConnect();

    // Parse the request body
    const body = await req.json();
    const { userId } = body;

    // Validate input
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Find the user
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Remove profile picture
    user.profilePicture = {
      filename: null,
      contentType: null,
      data: null
    };

    // Save the user
    await user.save();

    return NextResponse.json({ message: 'Profile picture removed successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting profile picture:', error);
    return NextResponse.json(
      { error: 'Failed to delete profile picture' }, 
      { status: 500 }
    );
  }
}
