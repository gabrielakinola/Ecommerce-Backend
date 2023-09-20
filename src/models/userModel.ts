import { Schema, model, Document } from "mongoose";
import bcrypt from "bcryptjs";

interface IComment {
  user: string;
  comment: string;
  timestamp: string;
}

export interface ISellerProfile {
  business: string;
  address: string;
  phone: number;
  businessImageUrl: string;
  idImageUrl: string;
  succesfulTransactions?: number;
  likes?: string[];
  dislikes?: string[];
  comments?: IComment[];
}

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  isSeller: boolean;
  isVerified: boolean;
  sellerProfile?: ISellerProfile;
  matchPassword(password: string): Promise<boolean>;
}

const userSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    username: { type: String, unique: true, trim: true, required: true },
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

    isSeller: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    sellerProfile: {
      type: {
        business: { type: String, trim: true, required: true },
        address: { type: String, trim: true, required: true },
        phone: { type: String, required: true },
        businessImageUrl: { type: String, required: true },
        idImageUrl: { type: String, required: true },
        succesfulTransactions: { type: Number, default: 0 },
        likes: { type: [String], default: [] },
        dislikes: { type: [String], default: [] },
        comments: [
          {
            user: { type: String },
            comment: { type: String },
            timestamp: { type: Date },
          },
        ],
      },
      required: false,
    },
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

userSchema.pre("save", function (next) {
  const user = this;

  if (user.sellerProfile) {
    user.sellerProfile.comments.forEach((comment) => {
      if (!comment.timestamp) {
        comment.timestamp = new Date();
      }
    });
  }
  next();
});

userSchema.methods.matchPassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

const User = model<IUser>("user", userSchema);

export default User;
