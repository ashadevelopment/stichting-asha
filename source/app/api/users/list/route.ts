import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import User from '../../../lib/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../api/auth/[...nextauth]/route';
import Avatar from '../../../../components/Avatar';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await dbConnect();
    
    // Get minimal user data for selection lists
    const users = await User.find({}, '_id firstName lastName name email role');
    
    // Transform the users data to include virtual fields but minimize payload
    const usersList = users.map(user => {
      const userData = user.toJSON();
      return {
        _id: userData._id,
        fullName: userData.fullName,
        email: userData.email,
        role: userData.role
      };
    });
    
    return NextResponse.json({ users: usersList });
  } catch (error) {
    console.error('Error fetching users list:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users list' },
      { status: 500 }
    );
  }
}