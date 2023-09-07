import mongoose, { Schema, model, Document, Types } from "mongoose";

export interface Iproduct extends Document {
  name: string;
  description: string;
  quantity: number;
  price: number;
  sellerId: Types.ObjectId;
  imagePath: string;
}

const productSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  sellerId: {
    type: Types.ObjectId,
    ref: "User",
    required: true,
  },
  imagePath: {
    type: String,
    required: true,
  },
});

export const Product = model("product", productSchema);
