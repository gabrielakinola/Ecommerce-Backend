import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    username: { type: String, required: true, trim: true, unique: true },
    email: { type: String, required: true, trim: true, unique: true },
    password: { type: String, rquired: true, trim: true },
    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User = model("user", userSchema);

export default User;
