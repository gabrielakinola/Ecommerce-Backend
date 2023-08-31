import { Router } from "express";
import {
  registerUser,
  verifyEmail,
  registerAdmin,
} from "../controllers/userController";

const router = Router();

router.post("/signup", registerUser);

router.post("/signup/admin", registerAdmin);

router.put("/verify/:token", verifyEmail);

export default router;
