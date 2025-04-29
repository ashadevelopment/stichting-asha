import mongoose, { Schema } from "mongoose"

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
      }
    },
    author: { 
      type: String, 
      required: true 
    },
    displayOrder: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
)

export default mongoose.models.Media || mongoose.model("Media", MediaSchema)