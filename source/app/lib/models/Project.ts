// lib/models/Project.ts
import mongoose, { Schema } from "mongoose"

const ProjectSchema = new Schema(
  {
    title: String,
    description: String,
    imageUrl: String,
    documentUrl: String,
    author: String,
  },
  { timestamps: true }
)

export default mongoose.models.Project || mongoose.model("Project", ProjectSchema)
