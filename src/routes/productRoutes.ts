import { Router } from "express";
import {
  addProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from "../controllers/productController";
import { ensureIsAuthenicated, isSeller } from "../middlewares/authentication";
import { upload } from "../middlewares/multer";

const router = Router();

router.post(
  "/add-product",
  ensureIsAuthenicated,
  isSeller,
  upload.single("products"),
  addProduct
);

router.get("/get-product", getProducts);

router.patch(
  "/update-product/:id",
  ensureIsAuthenicated,
  isSeller,
  updateProduct
);

router.delete(
  "/delete-product/:id",
  ensureIsAuthenicated,
  isSeller,
  deleteProduct
);

export default router;
