// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../lib/mongodb';
import User from '../../lib/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../api/auth/[...nextauth]/route';

// GET endpoint to retrieve users
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authorized (beheerder or developer)
    if (!session || !session.user || !['Beheerder', 'Developer'].includes(session.user.role as string)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await dbConnect();
    
    // Get all users (for contact selection)
    const users = await User.find({}, 'firstName lastName name email function phoneNumber profilePicture');
    
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}