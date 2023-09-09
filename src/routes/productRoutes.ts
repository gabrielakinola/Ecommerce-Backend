import { Router } from "express";
import { addProduct, getProducts } from "../controllers/productController";
import { ensureIsAuthenicated, isAdmin } from "../middlewares/authentication";
import { upload } from "../middlewares/multer";

const router = Router();

router.post("/add-product", ensureIsAuthenicated, isAdmin, upload, addProduct);

router.get("/get-product", getProducts);

export default router;
