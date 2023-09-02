import { Request, Response, NextFunction } from "express";
import { asyncErrorHandler } from "./errorController";
import User from "../models/userModel";
import { CustomEndpointError } from "../classes/errorClasses";
import { sendTestEmail } from "./utils/nodemailer";
import { generateAuthToken } from "./utils/token";
import jwt, { JwtPayload } from "jsonwebtoken";

const registerUser = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists && !userExists.isVerified) {
      const userId = userExists._id.toString();
      const testUrl = await sendTestEmail(res, userId, next);
      res.status(200).json({
        message: "User already exist but is unverified",
        verificationUrl: testUrl,
      });
      return;
    } else if (userExists && userExists.isVerified) {
      throw new CustomEndpointError("User already exists", 400);
    }
    const user = await User.create({ name, email, password });
    const userId = user._id.toString();

    if (user) {
      generateAuthToken(res, userId);
      const testUrl = await sendTestEmail(res, userId, next);
      res.status(200).json({
        message: "Please check email for verification",
        verificationUrl: testUrl,
      });
    }
  }
);

const registerAdmin = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists && !userExists.isVerified) {
      const userId = userExists._id.toString();
      const testUrl = await sendTestEmail(res, userId, next);
      res.status(200).json({
        message: "User already exist but is unverified",
        verificationUrl: testUrl,
      });
      return;
    } else if (userExists && userExists.isVerified) {
      throw new CustomEndpointError("User already exists", 400);
    }
    const user = await User.create({ name, email, password, isAdmin: true });

    const userId = user._id.toString();

    if (user) {
      generateAuthToken(res, userId);
      const testUrl = await sendTestEmail(res, userId, next);
      res.status(200).json({
        message: "Please check email for verification",
        verificationUrl: testUrl,
      });
    }
  }
);

const verifyEmail = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.params;
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY2
    ) as JwtPayload;
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      throw new CustomEndpointError("User not found", 404);
    } else if (user.isVerified) {
      res.status(200).json({ message: "User already verified" });
      return;
    }
    user.isVerified = true;
    const updatedUser = await User.findByIdAndUpdate(user._id, {
      isVerified: true,
    });
    res.status(200).json({ message: "User verfied successfully", user });
  }
);

const loginUser = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      generateAuthToken(res, user._id);
      res.status(200).json({ message: "Login succesful" });
    } else {
      throw new CustomEndpointError("Invalid email or password", 400);
    }
  }
);

const protectedRoute = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({ user: req.user });
  }
);

export { registerUser, registerAdmin, verifyEmail, loginUser, protectedRoute };
