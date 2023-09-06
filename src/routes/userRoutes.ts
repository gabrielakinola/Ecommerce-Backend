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
  getUser,
  getUsers,
} from "../controllers/userController";
import { ensureIsAuthenicated, isAdmin } from "../middlewares/authentication";

const router = Router();

router.post("/signup", registerUser);

router.post(`${process.env.ADMIN_ROUTE}`, registerAdmin);

router.get("/verify/:token", verifyEmail);

router.post("/login", loginUser);

router.get("/protected", ensureIsAuthenicated, protectedRoute);

router.get("/get-user/:userId", ensureIsAuthenicated, isAdmin, getUser);

router.get("/get-users", ensureIsAuthenicated, isAdmin, getUsers);

router.post("/forgot-password", forgotPasswordHandler);

router.get("/reset-password", verifyResetPasswordEmail);

router.post("/reset-password", resetPassword);

export default router;
