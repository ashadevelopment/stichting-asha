import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Notice from '../../../lib/models/Notice';

export async function GET() {
  try {
    await dbConnect();
    
    // Find the most recent active notice
    const notice = await Notice.findOne({ isActive: true })
      .sort({ createdAt: -1 })
      .lean();
    
    if (!notice) {
      return NextResponse.json(null);
    }
    
    return NextResponse.json(notice);
  } catch (error) {
    console.error('Error fetching latest notice:', error);
    return NextResponse.json(
      { error: 'Failed to fetch latest notice' },
      { status: 500 }
    );
  }
}