import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../lib/mongodb';
import User from '../../lib/models/User';

// Get all users
export async function GET() {
  try {
    await connectDB();
    const users = await User.find({});
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { message: 'Error fetching users' },
      { status: 500 }
    );
  }
}