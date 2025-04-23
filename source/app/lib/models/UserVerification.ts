import mongoose, { Schema } from 'mongoose';

const UserVerificationSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, default: 'user' },
  function: { type: String },
  phoneNumber: { type: String },
  profilePicture: {
    filename: { type: String },
    contentType: { type: String },
    data: { type: String }
  },
  verificationToken: { type: String, required: true },
  expires: { type: Date, required: true },
  verified: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.UserVerification || mongoose.model('UserVerification', UserVerificationSchema);