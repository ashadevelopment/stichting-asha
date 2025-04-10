import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../lib/mongodb';
import User from '../../lib/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../api/auth/[...nextauth]/route';

// GET endpoint to retrieve users
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authorized (beheerder or developer)
    if (!session || !session.user || !['beheerder', 'developer'].includes(session.user.role as string)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await dbConnect();
    
    // Get all users with relevant fields
    const users = await User.find({}, 'firstName lastName name email role function phoneNumber profilePicture');
    
    // Transform the users data to include virtual fields
    const transformedUsers = users.map(user => {
      const userData = user.toJSON();
      if (userData.profilePicture && userData.profilePicture.data) {
        userData.profilePicture = {
          ...userData.profilePicture,
          data: userData.profilePicture.data ? true : null // Just indicate if there's data
        };
      }
      return userData;
    });
    
    return NextResponse.json({ users: transformedUsers });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}