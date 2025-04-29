import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import User from '../../../lib/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/authOptions';

// Get user details - protected route that only returns details for the current user
export async function GET(req: NextRequest) {
  try {
    // Verify user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user ID from query parameters
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    
    // Ensure user can only access their own details
    if (userId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only access your own profile details' },
        { status: 403 }
      );
    }
    
    await dbConnect();
    
    // Find the user
    const user = await User.findById(userId).select(
      'firstName lastName email phoneNumber role function'
    );
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Return user details
    return NextResponse.json({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      role: user.role || '',
      function: user.function || ''
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user details' }, 
      { status: 500 }
    );
  }
}