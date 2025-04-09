import mongoose, { Schema } from "mongoose"

const PhotoSchema = new Schema(
  {
    title: { 
      type: String, 
      required: true 
    },
    description: { 
      type: String 
    },
    image: {
      filename: String,
      contentType: String,
      data: String  // Base64 encoded
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

export default mongoose.models.Photo || mongoose.model("Photo", PhotoSchema)