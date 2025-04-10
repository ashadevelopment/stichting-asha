import mongoose, { Schema } from "mongoose"

const VolunteerSchema = new Schema(
  {
    firstName: { 
      type: String, 
      required: true 
    },
    lastName: { 
      type: String, 
      required: true 
    },
    email: { 
      type: String, 
      required: true,
      unique: true
    },
    phoneNumber: { 
      type: String, 
      required: true 
    },
    message: { 
      type: String, 
      required: true 
    },
    cv: {
      filename: String,
      contentType: String,
      data: String  // Base64 encoded
    },
    motivationLetter: {
      filename: String,
      contentType: String,
      data: String  // Base64 encoded
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    }
  },
  { timestamps: true }
)

export default mongoose.models.Volunteer || mongoose.model("Volunteer", VolunteerSchema)