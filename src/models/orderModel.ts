import { Schema, model, Types } from "mongoose";

const orderSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        productId: {
          type: Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          reuired: true,
          min: 1,
        },
      },
    ],
    status: {
      type: String,
      enum: ["pending", "delivering", "delivered"],
      default: "pending",
    },
    totalPrice: { type: Number, requred: true },
  },
  { timestamps: true }
);

const Order = model("order", orderSchema);

export default Order;
