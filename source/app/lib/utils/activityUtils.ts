'use server';  // Mark this as server-side only

import dbConnect from '../../lib/mongodb';
import Activity from '../../lib/models/Activity';
import mongoose from 'mongoose';

type ActivityType = 'create' | 'update' | 'delete';
type EntityType = 'user' | 'volunteer' | 'project' | 'photo' | 'event' | 'notice' | 'contactSettings';

interface RecordActivityParams {
  type: ActivityType;
  entityType: EntityType;
  entityId: string | mongoose.Types.ObjectId;
  entityName: string;
  performedBy: string | mongoose.Types.ObjectId;
  performedByName: string;
}

export async function recordActivity({
  type,
  entityType,
  entityId,
  entityName,
  performedBy,
  performedByName,
}: RecordActivityParams) {
  try {
    await dbConnect();
    
    // Convert string IDs to ObjectIds if needed
    const entityIdObj = typeof entityId === 'string' 
      ? new mongoose.Types.ObjectId(entityId) 
      : entityId;
      
    const performedByObj = typeof performedBy === 'string' 
      ? new mongoose.Types.ObjectId(performedBy) 
      : performedBy;
    
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30); // 30 days TTL
    
    await Activity.create({
      type,
      entityType,
      entityId: entityIdObj,
      entityName,
      performedBy: performedByObj,
      performedByName,
      expiresAt: expiryDate
    });
    
  } catch (error) {
    console.error('Error recording activity:', error);
  }
}

// Only expose fetch functionality if needed from client components
export async function fetchRecentActivities(limit = 5) {
  try {
    await dbConnect();
    
    const activities = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(limit);
    
    return activities.map(activity => {
      const plainObj = activity.toObject();
      // Convert ObjectIds to strings for serialization
      plainObj._id = plainObj._id.toString();
      plainObj.entityId = plainObj.entityId.toString();
      plainObj.performedBy = plainObj.performedBy.toString();
      return plainObj;
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return [];
  }
}