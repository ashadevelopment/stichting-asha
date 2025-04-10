import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import User from '../../../lib/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../api/auth/[...nextauth]/route';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authorized
    if (!session || !session.user || !['beheerder', 'developer'].includes(session.user.role as string)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse form data
    const formData = await request.formData();
    const userId = formData.get('userId') as string;
    const profilePicture = formData.get('profilePicture') as File;
    
    if (!userId || !profilePicture) {
      return NextResponse.json(
        { error: 'User ID and profile picture are required' },
        { status: 400 }
      );
    }
    
    // Connect to database
    await dbConnect();
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Validate file type (allow only images)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(profilePicture.type)) {
      return NextResponse.json(
        { error: 'Only JPEG, PNG, GIF, and WebP images are allowed' },
        { status: 400 }
      );
    }
    
    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (profilePicture.size > maxSize) {
      return NextResponse.json(
        { error: 'Image size should be less than 2MB' },
        { status: 400 }
      );
    }
    
    // Convert the file to base64
    const arrayBuffer = await profilePicture.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString('base64');
    
    // Update user with profile picture
    user.profilePicture = {
      filename: profilePicture.name,
      contentType: profilePicture.type,
      data: base64Data
    };
    
    await user.save();
    
    // Return success response
    return NextResponse.json({ 
      message: 'Profile picture updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        function: user.function,
        phoneNumber: user.phoneNumber,
        profilePicture: {
          filename: user.profilePicture.filename,
          contentType: user.profilePicture.contentType
          // Don't send the base64 data back to reduce response size
        }
      }
    });
    
  } catch (error) {
    console.error('Error updating profile picture:', error);
    return NextResponse.json(
      { error: 'Failed to update profile picture' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve a user's profile picture by ID
export async function GET(request: NextRequest) {
    try {
      const { searchParams } = new URL(request.url);
      const userId = searchParams.get('userId');
  
      if (!userId) {
        return new NextResponse('User ID is required', { status: 400 });
      }
  
      await dbConnect();
  
      const user = await User.findById(userId).select('profilePicture');
  
      // If no user or no custom profile picture, return 204 No Content
      if (!user || !user.profilePicture?.data) {
        return new NextResponse(null, { status: 204 }); // 👈 No content, frontend can handle fallback
      }
  
      const buffer = Buffer.from(user.profilePicture.data, 'base64');
  
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': user.profilePicture.contentType,
          'Content-Length': buffer.length.toString(),
          'Cache-Control': 'public, max-age=86400'
        }
      });
  
    } catch (error) {
      console.error('Error retrieving profile picture:', error);
      return new NextResponse('Failed to retrieve profile picture', { status: 500 });
    }
  }
  