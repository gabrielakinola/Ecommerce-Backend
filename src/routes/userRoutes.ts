import { Router } from "express";
import {
  registerUser,
  verifyEmail,
  registerAdmin,
  loginUser,
  protectedRoute,
  forgotPasswordHandler,
  verifyResetPasswordEmail,
  resetPassword,
} from "../controllers/userController";
import { ensureIsAuthenicated } from "../middlewares/authentication";

const router = Router();

router.post("/signup", registerUser);

router.post(`${process.env.ADMIN_ROUTE}`, registerAdmin);

router.get("/verify/:token", verifyEmail);

router.post("/login", loginUser);

router.get("/protected", ensureIsAuthenicated, protectedRoute);

router.post("/forgot-password", forgotPasswordHandler);

router.get("/reset-password", verifyResetPasswordEmail);

router.post("/reset-password", resetPassword);

export default router;
