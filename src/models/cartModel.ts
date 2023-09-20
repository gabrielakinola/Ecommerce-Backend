import mongoose, { Schema, model } from "mongoose";

const cartSchema = new Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [
    {
      productId: {
        type: mongoose.Types.ObjectId,
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
});

const Cart = model("Cart", cartSchema);

export default Cart;
