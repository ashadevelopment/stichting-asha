// source/app/api/activities/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../lib/mongodb';
import Activity from '../../lib/models/Activity';
import User from '../../lib/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../lib/authOptions';

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await dbConnect();
    console.log("Database connected in activities API route");
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Validate user session (optional, but recommended for admin pages)
    const session = await getServerSession(authOptions);
    console.log("Session in activities API route:", session?.user?.email || "No session");
    
    // If no session, return unauthorized
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get activities with populated user information
    console.log(`Fetching up to ${limit} activities...`);
    const activities = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('performedBy', 'firstName lastName name')
      .exec();
    
    console.log(`Found ${activities.length} activities`);
    
    // Convert MongoDB documents to plain objects and stringify ObjectIds
    const plainActivities = activities.map(activity => {
      const plainObj = activity.toObject();
      
      // Convert ObjectIds to strings
      plainObj._id = plainObj._id.toString();
      plainObj.entityId = plainObj.entityId.toString();
      plainObj.performedBy = plainObj.performedBy._id.toString();
      
      // Get the user's full name
      const user = activity.performedBy as any;
      if (user && user.firstName && user.lastName) {
        plainObj.performedByName = `${user.firstName} ${user.lastName}`;
      } else if (user && user.name) {
        plainObj.performedByName = user.name;
      } else if (user && user.firstName) {
        plainObj.performedByName = user.firstName;
      } else {
        plainObj.performedByName = 'Onbekende gebruiker';
      }
      
      return plainObj;
    });
    
    // Return as JSON
    return NextResponse.json(plainActivities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}