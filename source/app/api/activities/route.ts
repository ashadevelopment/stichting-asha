import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../lib/mongodb';
import Activity from '../../lib/models/Activity';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Connect to database first
    await dbConnect();
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Get activities
    const activities = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(limit);
    
    // Convert MongoDB documents to plain objects and stringify ObjectIds
    const plainActivities = activities.map(activity => {
      const plainObj = activity.toObject();
      plainObj._id = plainObj._id.toString();
      plainObj.entityId = plainObj.entityId.toString();
      plainObj.performedBy = plainObj.performedBy.toString();
      return plainObj;
    });
    
    return NextResponse.json(plainActivities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}