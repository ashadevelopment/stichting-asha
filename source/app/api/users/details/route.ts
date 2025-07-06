// Create this file: source/app/api/users/details/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/authOptions';
import dbConnect from '../../../lib/mongodb';
import User from '../../../lib/models/User';

export async function GET(request: NextRequest) {
  try {
    // Get session to ensure user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database
    await dbConnect();

    // Get userId from query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Find user by ID
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return user details
    return NextResponse.json({
      id: user._id.toString(),
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      name: user.name || '',
      email: user.email || '',
      role: user.role || '',
      function: user.function || '',
      phoneNumber: user.phoneNumber || ''
    });

  } catch (error) {
    console.error('Error fetching user details:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}