import mongoose, { Schema } from "mongoose"

const NoticeSchema = new Schema(
  {
    title: { 
      type: String, 
      required: true 
    },
    message: { 
      type: String, 
      required: true 
    },
    expirationDate: { 
      type: Date, 
      required: true 
    },
    author: { 
      type: String, 
      required: true 
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
)

export default mongoose.models.Notice || mongoose.model("Notice", NoticeSchema)