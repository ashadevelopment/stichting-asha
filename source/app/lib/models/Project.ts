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
    image: {
      filename: String,
      contentType: String,
      data: Buffer
    },
    documents: [{
      filename: String,
      contentType: String,
      data: Buffer
    }],
    projectDate: {
      type: Date,
      default: Date.now
    },
    author: {
      type: String,
      required: true
    },
    pinned: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
)

export default mongoose.models.Project || mongoose.model("Project", ProjectSchema)