import { NextRequest, NextResponse } from 'next/server';
import { Session } from 'next-auth';
import { getServerSession } from 'next-auth/next';
import dbConnect from '../mongodb';
import Activity from '../models/Activity';

// Define action types
export type ActionType = 'create' | 'update' | 'delete' | 'details';

// Define entity types
export type EntityType = 'user' | 'volunteer' | 'project' | 'media' | 'event' | 'notice' | 'contactSettings' | 'details';

// Define the handler function type
type ApiHandler = (req: NextRequest) => Promise<NextResponse>;

// Define the entity info getter function type
type GetEntityInfoFn = (req: NextRequest, response: NextResponse) => Promise<{
  type: ActionType;
  entityId: string;
  entityName: string;
}>;

// Function to record activities
export async function recordActivity({
  type,
  entityType,
  entityId,
  entityName,
  performedBy,
  performedByName,
  details,
}: {
  type: ActionType;
  entityType: EntityType;
  entityId: string;
  entityName: string;
  performedBy: string;
  performedByName: string;
  details?: string;
}) {
  try {
    await dbConnect();
    
    await Activity.create({
      type,
      entityType,
      entityId,
      entityName,
      performedBy,
      performedByName,
      details 
    });
    
  } catch (error) {
    console.error('Error recording activity:', error);
  }
}

// Reusable middleware for tracking activities in API routes
export async function withActivityTracking(
  handler: ApiHandler,
  req: NextRequest,
  entityType: EntityType,
  getEntityInfo: GetEntityInfoFn,
  authOptions: any // Pass authOptions directly
): Promise<NextResponse> {
  try {
    // Call the original handler
    const response = await handler(req);
    
    // Only track successful operations
    if (response.status >= 200 && response.status < 300) {
      // Clone the response to read its body
      const clonedResponse = response.clone();
      
      // Get entity information
      const { type, entityId, entityName } = await getEntityInfo(req, response);
      
      // Get user information from the session
      const session = await getServerSession(authOptions) as Session | null;
      const userId = session?.user?.id || 'system';
      const userName = session?.user?.name || 'System';
      
      // Record the activity
      await recordActivity({
        type,
        entityType,
        entityId,
        entityName,
        performedBy: userId,
        performedByName: userName,
      });
    }
    
    return response;
  } catch (error) {
    console.error('Error in activity tracking middleware:', error);
    // Continue with the original response if already generated
    if (error instanceof NextResponse) {
      return error;
    }
    // Return error response
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}