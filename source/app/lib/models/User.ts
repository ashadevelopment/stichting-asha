import mongoose, { Schema, models, model } from 'mongoose'

const UserSchema = new Schema({
  name: String,
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String,
  role: {
    type: String,
    enum: ['beheerder', 'developer', 'vrijwilliger', 'stagiair', 'user'],
    default: 'user',
  },
  function: String,
  phoneNumber: String,
  profilePicture: {
    filename: { type: String, default: null },
    contentType: { type: String, default: null },
    data: { type: String, default: null }
  },
});

// 👇 Add this!
UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });

UserSchema.virtual('fullName').get(function () {
  return `${this.firstName || ''} ${this.lastName || ''}`.trim() || this.name;
});

UserSchema.virtual('initial').get(function () {
  const firstChar =
    (this.firstName?.charAt(0) || this.lastName?.charAt(0) || this.name?.charAt(0) || 'U');
  return firstChar.toUpperCase();
});

const User = models.User || model('User', UserSchema)
export default User
