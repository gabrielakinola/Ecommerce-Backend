import { Router } from "express";
import { addProduct } from "../controllers/productController";
import { ensureIsAuthenicated, isAdmin } from "../middlewares/authentication";
import { upload } from "../middlewares/multer";

const router = Router();

router.post("/add-product", ensureIsAuthenicated, isAdmin, upload, addProduct);

export default router;
