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
    startTime: {
      type: String,
      required: true
    },
    endTime: {
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
    },
      repeatType: { 
      type: String, 
      enum: ['single', 'standard', 'daily', 'weekly', 'monthly'], 
      default: 'single' 
    },
    repeatCount: { type: Number, default: 1 },
    isRepeatedEvent: { type: Boolean, default: false },
    originalEventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    selectedDayOfWeek: { type: Number, min: 0, max: 6 }
  },
  { timestamps: true }
)

export default mongoose.models.Event || mongoose.model("Event", EventSchema)