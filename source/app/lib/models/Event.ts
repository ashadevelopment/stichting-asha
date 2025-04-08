// lib/models/Event.ts
import mongoose, { Schema } from "mongoose"

const EventSchema = new Schema(
  {
    title: { 
      type: String, 
      required: true 
    },
    description: { 
      type: String, 
      required: true 
    },
    date: { 
      type: String, 
      required: true  // Format: YYYY-MM-DD
    },
    time: { 
      type: String, 
      required: true 
    },
    location: { 
      type: String, 
      required: true 
    },
    author: { 
      type: String, 
      required: true 
    }
  },
  { timestamps: true }
)

export default mongoose.models.Event || mongoose.model("Event", EventSchema)