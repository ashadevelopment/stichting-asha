import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: {
    type: String,
    enum: ["beheerder", "developer", "vrijwilliger", "stagiare", "gebruiker"],
    default: "gebruiker",
  },
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
