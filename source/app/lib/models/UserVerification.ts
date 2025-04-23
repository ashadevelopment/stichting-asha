import mongoose from 'mongoose';

const UserVerificationSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  originalPassword: {
    type: String,  // This will store the plain password to be sent via email
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'beheerder', 'developer', 'vrijwilliger', 'stagiair'],
    default: 'user',
  },
  function: {
    type: String,
  },
  phoneNumber: {
    type: String,
  },
  profilePicture: {
    filename: String,
    contentType: String,
    data: String,
  },
  verificationToken: {
    type: String,
    required: true,
  },
  expires: {
    type: Date,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true
});

delete mongoose.models['UserVerification'];

export default mongoose.models.UserVerification || 
  mongoose.model('UserVerification', UserVerificationSchema);