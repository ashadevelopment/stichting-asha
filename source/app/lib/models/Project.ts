// app/lib/models/Project.ts
import mongoose, { Schema, Document } from 'mongoose';

interface FileData {
  filename: string;
  contentType: string;
  data: string;
}

export interface IProject extends Document {
  title: string;
  description: string;
  longDescription?: string;
  author: string;
  projectDate: Date;
  tags?: string[];
  image?: FileData;
  documents?: FileData[]; // Array of documents
  pinned?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const FileSchema = new Schema({
  filename: { type: String, required: true },
  contentType: { type: String, required: true },
  data: { type: String, required: true }
}, { _id: false });

const ProjectSchema = new Schema<IProject>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  longDescription: { type: String },
  author: { type: String, required: true },
  projectDate: { type: Date, default: Date.now },
  tags: [{ type: String }],
  image: FileSchema,
  documents: [FileSchema], // Array of file documents with max 3
  pinned: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Add validation to ensure max 3 documents
ProjectSchema.pre('save', function(next) {
  if (this.documents && this.documents.length > 3) {
    const error = new Error('Maximum 3 documents allowed per project');
    return next(error);
  }
  next();
});

// Add validation for updates too
ProjectSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate() as any;
  if (update.documents && update.documents.length > 3) {
    const error = new Error('Maximum 3 documents allowed per project');
    return next(error);
  }
  next();
});

export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);