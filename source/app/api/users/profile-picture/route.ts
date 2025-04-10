// app/api/users/profile-picture/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import User from '../../../lib/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../api/auth/[...nextauth]/route';

// GET endpoint to retrieve a user's profile picture
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Connect to database
    await dbConnect();
    
    // Find the user by ID
    const user = await User.findById(userId, 'profilePicture');
    
    if (!user || !user.profilePicture || !user.profilePicture.data) {
      return NextResponse.json(
        { error: 'Profile picture not found' },
        { status: 404 }
      );
    }
    
    // Return the profile picture data
    const contentType = user.profilePicture.contentType || 'image/jpeg';
    
    // Create a response with the image data
    const response = new NextResponse(
      Buffer.from(user.profilePicture.data, 'base64'),
      {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=86400' // Cache for 1 day
        }
      }
    );
    
    return response;
  } catch (error) {
    console.error('Error retrieving profile picture:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve profile picture' },
      { status: 500 }
    );
  }
}

// POST endpoint to upload a profile picture
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
    
    // Get the form data
    const formData = await request.formData();
    const userId = formData.get('userId') as string;
    const profilePicture = formData.get('profilePicture') as File;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    if (!profilePicture) {
      return NextResponse.json(
        { error: 'Profile picture is required' },
        { status: 400 }
      );
    }
    
    // Connect to database
    await dbConnect();
    
    // Allow users to update their own picture, or admins/developers to update any picture
    const isAdmin = ['beheerder', 'developer'].includes(session.user.role as string);
    const isSelf = session.user.id === userId;
    
    if (!isAdmin && !isSelf) {
      return NextResponse.json(
        { error: 'Unauthorized to update this profile picture' },
        { status: 403 }
      );
    }
    
    // Read the file as buffer and convert to base64
    const buffer = Buffer.from(await profilePicture.arrayBuffer());
    const base64Data = buffer.toString('base64');
    
    // Update user with profile picture
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        $set: { 
          'profilePicture.data': base64Data,
          'profilePicture.contentType': profilePicture.type,
          'profilePicture.filename': profilePicture.name
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
      message: 'Profile picture uploaded successfully'
    });
    
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    return NextResponse.json(
      { error: 'Failed to upload profile picture' },
      { status: 500 }
    );
  }
}