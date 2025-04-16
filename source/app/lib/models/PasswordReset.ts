import mongoose, { Schema, models, model } from 'mongoose';

const PasswordResetSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  expires: {
    type: Date,
    required: true,
  },
  used: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

const PasswordReset = models.PasswordReset || model('PasswordReset', PasswordResetSchema);
export default PasswordReset;