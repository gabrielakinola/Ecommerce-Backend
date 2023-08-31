import { Schema, model, Document } from "mongoose";
import bcrypt from "bcryptjs";

interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  isAdmin: boolean;
  matchPassword(password: string): boolean;
}

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      validate: {
        validator: function (value: string) {
          return value.match(
            /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
          );
        },
        message: "Email is invalid",
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (value: string) {
          return value.match(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
          );
        },
        message:
          "Password must be at least 8-32 characters and include at least a lowercase, uppercase and a special character",
      },
    },
    isAdmin: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = model("user", userSchema);

export default User;
