import mongoose, { Schema, Document, models } from 'mongoose';

export interface IPasswordReset extends Document {
  email: string;
  token: string;
  expires: Date;
  used: boolean;
}

const PasswordResetSchema = new Schema<IPasswordReset>({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
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
}, {
  timestamps: true,
});

export default models.PasswordReset || mongoose.model<IPasswordReset>('PasswordReset', PasswordResetSchema);
