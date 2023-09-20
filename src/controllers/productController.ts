import { Request, Response, NextFunction } from "express";
import { asyncErrorHandler } from "./errorController";
import { IProduct, Product } from "../models/productModel";
import User, { IUser } from "../models/userModel";
import { CustomEndpointError } from "../classes/errorClasses";

const addProduct = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const image = req.file?.path;
    const user = req.user as IUser;
    const sellerId = user._id;
    const business = user.sellerProfile?.business;

    const { name, description, quantity, price } = req.body;

    const product = await Product.create({
      name,
      description,
      quantity,
      price,
      sellerId,
      business,
      image,
    });

    if (product) {
      res.status(200).json({ message: "Product added successfully", product });
    }
  }
);

const getProducts = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { product, business } = req.query;

    if (product) {
      const products: IProduct[] = await Product.find({
        name: product,
      });
      console.log(products);

      const productNotStrict: IProduct[] = await Product.find({
        name: { $regex: product, $options: "i" },
      });
      if (products.length === 0 && productNotStrict.length === 0) {
        throw new CustomEndpointError("No result matches your query", 404);
      } else if (products.length > 0) {
        res.status(200).json({ products });
      } else {
        res.status(200).json({ products: productNotStrict });
      }
      return;
    }
    if (business) {
      const exactProducts: IProduct[] = await Product.find({ business });
      const regexProducts: IProduct[] = await Product.find({
        business: { $regex: business, $options: "i" },
      });

      console.log(regexProducts);

      if (exactProducts.length === 0 && regexProducts.length === 0) {
        throw new CustomEndpointError(
          "Not found, no businesses matches your query",
          404
        );
      } else if (exactProducts.length > 0) {
        res.status(200).json({ products: exactProducts });
      } else {
        res.status(200).json({ products: regexProducts });
      }
      return;
    } else {
      const products: IProduct[] = await Product.find();

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
