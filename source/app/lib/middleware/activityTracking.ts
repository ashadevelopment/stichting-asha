import { NextRequest, NextResponse } from 'next/server';
import { recordActivity, ActionType, EntityType } from '../utils/activityUtils';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../api/auth/[...nextauth]/route';

// Define the handler function type
type ApiHandler = (req: NextRequest) => Promise<NextResponse>;

// Define the entity info getter function type
type GetEntityInfoFn = (req: NextRequest, response: NextResponse) => Promise<{
  type: ActionType;
  entityId: string;
  entityName: string;
}>;

// Reusable middleware for tracking activities in API routes
export async function withActivityTracking(
  handler: ApiHandler,
  req: NextRequest,
  entityType: EntityType,
  getEntityInfo: GetEntityInfoFn
): Promise<NextResponse> {
  try {
    // Call the original handler
    const response = await handler(req);
    
    // Only track successful operations
    if (response.status >= 200 && response.status < 300) {
      // Get entity information
      const { type, entityId, entityName } = await getEntityInfo(req, response);
      
      // Get user information from the session
      const session = await getServerSession(authOptions);
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