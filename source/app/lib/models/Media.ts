import { Schema, model, models } from "mongoose";
import { dbConnectMedia } from "../mongodb";

const MediaSchema = new Schema(
  {
    title: { 
      type: String, 
      required: true 
    },
    description: { 
      type: String 
    },
    media: {
      filename: String,
      contentType: String,
      data: String,  // Base64 encoded
      type: {
        type: String,
        enum: ['image', 'video'],
        required: true
      },
      // Add size tracking for better memory management
      size: {
        type: Number,
        default: 0
      }
    },
    author: { 
      type: String, 
      required: true 
    },
    displayOrder: {
      type: Number,
      default: 0
    },
    // Add thumbnail for better performance
    thumbnail: {
      data: String,  // Smaller base64 encoded thumbnail
      contentType: String
    }
  },
  { 
    timestamps: true,
    // Add collection name explicitly
    collection: 'media'
  }
);

// Create indexes for better performance
MediaSchema.index({ createdAt: -1 });
MediaSchema.index({ author: 1 });
MediaSchema.index({ 'media.type': 1 });

// Method to get media with size limit checking
MediaSchema.statics.findWithSizeLimit = async function(limit = 50) {
  return this.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('title description media.type media.contentType author createdAt updatedAt thumbnail')
    .lean(); // Use lean() for better performance
};

// Method to get full media item (with data) by ID
MediaSchema.statics.findFullById = async function(id: string) {
  return this.findById(id).lean();
};

// Create model with separate connection
let MediaModel: any;

export async function getMediaModel() {
  if (!MediaModel) {
    const mediaConnection = await dbConnectMedia();
    MediaModel = mediaConnection.models.Media || mediaConnection.model('Media', MediaSchema);
  }
  return MediaModel;
}

export default MediaModel;