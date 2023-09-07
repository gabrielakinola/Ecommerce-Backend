import { Request, Response, NextFunction } from "express";
import { asyncErrorHandler } from "./errorController";
import { Product } from "../models/productModel";
import { IUser } from "../models/userModel";

const addProduct = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const imagePath = req.file?.path;
    const user = req.user as IUser;
    const sellerId = user._id;

    const { name, description, quantity, price } = req.body;

    const product = await Product.create({
      name,
      description,
      quantity,
      price,
      sellerId,
      imagePath,
    });

    if (product) {
      res.status(200).json({ message: "Product added successfully", product });
    }
  }
);

export { addProduct };
