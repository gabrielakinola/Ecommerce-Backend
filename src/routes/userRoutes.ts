import { Router } from "express";
import {
  registerUser,
  verifyEmail,
  loginUser,
  createSeller,
  forgotPasswordHandler,
  verifyResetPasswordEmail,
  resetPassword,
  getUser,
  getUsers,
} from "../controllers/userController";
import { ensureIsAuthenicated } from "../middlewares/authentication";
import { upload } from "../middlewares/multer";

const router = Router();

router.post("/signup", registerUser);

// router.post(`${process.env.ADMIN_ROUTE}`, registerAdmin);

router.get("/verify/:token", verifyEmail);

router.post("/login", loginUser);

router.post(
  "/seller/create",
  ensureIsAuthenicated,
  upload.fields([
    { name: "idCard", maxCount: 1 },
    { name: "businessImage", maxCount: 1 },
  ]),
  createSeller
);

router.post("/forgot-password", forgotPasswordHandler);

router.get("/reset-password", verifyResetPasswordEmail);

router.post("/reset-password", resetPassword);

// router.get("/get-user/:userId", ensureIsAuthenicated, isAdmin, getUser);

// router.get("/get-users", ensureIsAuthenicated, isAdmin, getUsers);

export default router;
