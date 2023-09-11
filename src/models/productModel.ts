import mongoose, { Schema, model, Document, Types } from "mongoose";

export interface IProduct extends Document {
  name: string;
  description: string;
  quantity: number;
  price: number;
  sellerId: Types.ObjectId;
  business: string;
  image: string;
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
  business: {
    type: String,
    ref: "User",
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
});

export const Product = model("product", productSchema);
