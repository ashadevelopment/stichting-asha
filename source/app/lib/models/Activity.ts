// source/app/lib/models/Activity.ts
import mongoose, { Schema, Document } from "mongoose";

// Define the Activity document interface
export interface IActivity extends Document {
  type: 'create' | 'update' | 'delete';
  entityType: 'user' | 'volunteer' | 'project' | 'photo' | 'event' | 'notice' | 'contactSettings';
  entityId: mongoose.Types.ObjectId;
  entityName: string;
  performedBy: mongoose.Types.ObjectId;
  performedByName: string;
  createdAt: Date;
  updatedAt: Date;
}

// Check if Activity model exists already to prevent recompilation errors
const ActivityModel = mongoose.models.Activity || mongoose.model<IActivity>(
  "Activity",
  new Schema(
    {
      type: {
        type: String,
        enum: ['create', 'update', 'delete'],
        required: true
      },
      entityType: {
        type: String,
        enum: ['user', 'volunteer', 'project', 'photo', 'event', 'notice', 'contactSettings'],
        required: true
      },
      entityId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      },
      entityName: {
        type: String,
        required: true
      },
      performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      performedByName: {
        type: String,
        required: true
      }
    },
    { 
      timestamps: true, // This adds createdAt and updatedAt fields
      expires: '30d' // Optional: automatically delete activities after 30 days
    }
  )
);

export default ActivityModel;