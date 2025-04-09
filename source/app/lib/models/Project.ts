// lib/models/Project.ts
import mongoose, { Schema } from "mongoose"

const ProjectSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    longDescription: {
      type: String
    },
    image: {
      filename: String,
      contentType: String,
      data: String  // Base64 encoded
    },
    document: {
      filename: String,
      contentType: String,
      data: String  // Base64 encoded
    },
    projectDate: {
      type: mongoose.Schema.Types.Mixed,
      default: () => new Date()
    },
    author: {
      type: String,
      required: true
    },
    tags: [{
      type: String
    }]
  },
  { timestamps: true }
)

export default mongoose.models.Project || mongoose.model("Project", ProjectSchema)