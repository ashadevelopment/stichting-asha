// source/app/lib/models/Activity.ts
import mongoose, { Schema, Document } from "mongoose";

// Define the Activity document interface
export interface IActivity extends Document {
  type: 'create' | 'update' | 'delete';
  entityType: 'user' | 'volunteer' | 'project' | 'media' | 'event' | 'notice' | 'contactSettings';
  entityId: mongoose.Types.ObjectId | string;
  entityName: string;
  performedBy: mongoose.Types.ObjectId | string;
  performedByName: string;
  createdAt: Date;
  updatedAt: Date;
}

// Check if Activity model exists already to prevent recompilation errors
const ActivitySchema = new Schema(
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
      type: Schema.Types.ObjectId,
      required: true
    },
    entityName: {
      type: String,
      required: true
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    performedByName: {
      type: String,
      required: true
    },
    details: { 
      type: String 
    }
  },
  { 
    timestamps: true, // This adds createdAt and updatedAt fields
  }
);

const ActivityModel = mongoose.models.Activity || mongoose.model<IActivity>("Activity", ActivitySchema);

export default ActivityModel;