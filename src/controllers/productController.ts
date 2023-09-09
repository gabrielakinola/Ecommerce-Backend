import { Request, Response, NextFunction } from "express";
import { asyncErrorHandler } from "./errorController";
import { Iproduct, Product } from "../models/productModel";
import { IUser } from "../models/userModel";
import { CustomEndpointError } from "../classes/errorClasses";

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

const getProducts = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name } = req.query;

    if (name) {
      const products: Iproduct[] = await Product.find({
        name,
      });

      const productNotStrict: Iproduct[] = await Product.find({
        name: { $regex: name, $options: "i" },
      });
      if (products.length === 0 && productNotStrict.length === 0) {
        throw new CustomEndpointError("No result matches your query", 404);
      } else if (products.length > 0) {
        res.status(200).json({ products });
      } else if (productNotStrict.length > 0) {
        res.status(200).json({ products: productNotStrict });
      }
    } else {
      const products: Iproduct[] = await Product.find();

      if (products.length > 0) {
        res.status(200).json({ products });
      } else {
        throw new CustomEndpointError("Not Found", 404);
      }
    }
  }
);

const updateProduct = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { price, quantity } = req.body;
    const user = req.user as IUser;

    const product = await Product.findById(id);

    if (!product) {
      throw new CustomEndpointError("Not Found, invalid id", 404);
    } else if (product.sellerId.toString() === user._id.toString()) {
      product.price = price;
      product.quantity = quantity;
      const updatedProduct = await product.save();

      res.status(200).json({ message: "Succesful", updatedProduct });
    } else {
      throw new CustomEndpointError(
        "Not authourized to update this resource",
        400
      );
    }
  }
);

const deleteProduct = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const user = req.user as IUser;
    const product = await Product.findById(id);

    if (!product) {
      throw new CustomEndpointError("Not Found, invalid id", 404);
    } else if (product.sellerId.toString() === user._id.toString()) {
      const deletedProduct = await Product.findByIdAndDelete(id);

      res.status(200).json({ message: "Succesful", deletedProduct });
    } else {
      throw new CustomEndpointError(
        "Not authourized to update this resource",
        400
      );
    }
  }
);

export { addProduct, getProducts, updateProduct, deleteProduct };
