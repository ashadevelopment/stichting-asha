import mongoose, { Schema } from "mongoose"

const NewsletterSchema = new Schema(
  {
    title: { 
      type: String, 
      required: true 
    },
    description: { 
      type: String, 
      required: true 
    },
    content: { 
      type: String 
    },
    type: {
      type: String,
      enum: ['article', 'video'],
      default: 'article'
    },
    link: { 
      type: String 
    },
    videoUrl: { 
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
    }
  },
  { timestamps: true }
)

export default mongoose.models.Newsletter || mongoose.model("Newsletter", NewsletterSchema)