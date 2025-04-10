import mongoose, { Schema } from "mongoose"

const ContactSettingsSchema = new Schema(
  {
    contactPersons: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: true
    }],
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: String,
      required: true
    }
  }
)

export default mongoose.models.ContactSettings || mongoose.model("ContactSettings", ContactSettingsSchema)