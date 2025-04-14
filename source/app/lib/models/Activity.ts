import mongoose, { Schema, Document } from "mongoose";

// Define the Activity document interface
export interface IActivity extends Document {
  type: 'create' | 'update' | 'delete';
  entityType: 'user' | 'volunteer' | 'project' | 'photo' | 'event' | 'notice' | 'contactSettings';
  entityId: mongoose.Types.ObjectId;
  entityName: string;
  performedBy: mongoose.Types.ObjectId;
  performedByName: string;
  expiresAt: Date;
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
      },
      expiresAt: {
        type: Date,
        default: () => {
          const date = new Date();
          date.setDate(date.getDate() + 30);
          return date;
        },
        required: true
      }
    },
    { timestamps: true }
  )
);

export default ActivityModel;