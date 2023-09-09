import { Router } from "express";
import {
  addProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from "../controllers/productController";
import { ensureIsAuthenicated, isAdmin } from "../middlewares/authentication";
import { upload } from "../middlewares/multer";

const router = Router();

router.post("/add-product", ensureIsAuthenicated, isAdmin, upload, addProduct);

router.get("/get-product", getProducts);

router.patch(
  "/update-product/:id",
  ensureIsAuthenicated,
  isAdmin,
  updateProduct
);

router.delete(
  "/delete-product/:id",
  ensureIsAuthenicated,
  isAdmin,
  deleteProduct
);

export default router;
