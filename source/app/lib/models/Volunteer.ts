import mongoose, { Schema } from "mongoose"

const FileSchema = new Schema({
  filename: String,
  contentType: String,
  data: String 
});

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
      type: FileSchema,
      required: true
    },
    motivationLetter: {
      type: FileSchema,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    }
  },
  { timestamps: true }
);

// Voeg individuele indexen toe op een consistente manier
// We gebruiken alleen schema.index() en geen index: true in de velden
VolunteerSchema.index({ email: 1 });
VolunteerSchema.index({ status: 1 });

export default mongoose.models.Volunteer || mongoose.model("Volunteer", VolunteerSchema)