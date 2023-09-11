import { Request, Response, NextFunction } from "express";
import { asyncErrorHandler } from "./errorController";
import User from "../models/userModel";
import { CustomEndpointError } from "../classes/errorClasses";
import { sendResetPasswordEMail, sendTestEmail } from "./utils/nodemailer";
import { generateAuthToken } from "./utils/token";
import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcryptjs";

const registerUser = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists && !userExists.isVerified) {
      const userId = userExists._id.toString();
      const testUrl = await sendTestEmail(userId, email, next);
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
      const testUrl = await sendTestEmail(userId, email, next);
      res.status(200).json({
        message: "Please check email for verification",
        verificationUrl: testUrl,
      });
    }
  }
);

const registerAdmin = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, business, password } = req.body;
    if (!business) {
      throw new CustomEndpointError(
        "AdminERR, business is a required field",
        400
      );
    }
    const userExists = await User.findOne({ email });

    if (userExists && !userExists.isVerified) {
      const userId = userExists._id.toString();
      const testUrl = await sendTestEmail(userId, email, next);
      res.status(200).json({
        message: "User already exist but is unverified",
        verificationUrl: testUrl,
      });
      return;
    } else if (userExists && userExists.isVerified) {
      throw new CustomEndpointError("User already exists", 400);
    }

    const user = await User.create({
      name,
      email,
      business,
      password,
      isAdmin: true,
    });

    const userId = user._id.toString();

    if (user) {
      generateAuthToken(res, userId);
      const testUrl = await sendTestEmail(userId, email, next);
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

const getUser = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;

    const user = await User.findById(userId).select("-password");
    if (user) {
      res.status(200).json({ message: "Sucess", user });
    } else {
      throw new CustomEndpointError("User not found", 404);
    }
  }
);

const getUsers = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await User.find({}, "-password");
    if (users) {
      res.status(200).json({ message: "Sucess", users });
    } else {
      throw new CustomEndpointError("User not found", 404);
    }
  }
);

const forgotPasswordHandler = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      const passwordResetUrl = await sendResetPasswordEMail(
        user._id,
        email,
        next
      );
      res.status(200).json({ passwordReset: passwordResetUrl });
    } else {
      throw new CustomEndpointError("Invalid User", 400);
    }
  }
);

const verifyResetPasswordEmail = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.query.token as string;

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY2
    ) as JwtPayload;

    const user = await User.findById(decoded.userId);

    if (user) {
      res.status(200).json({ message: "Email verified" });
    } else {
      throw new CustomEndpointError("Invalid or expired token", 400);
    }
  }
);

const resetPassword = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { token, newPassword } = req.body;

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY2
    ) as JwtPayload;

    const user = await User.findById(decoded.userId);

    if (user && (await user.matchPassword(newPassword))) {
      throw new CustomEndpointError(
        "New Password cannot be the same the previous one",
        400
      );
    } else if (user && !(await user.matchPassword(newPassword))) {
      user.password = newPassword;
      await user.save();
      res.status(200).json({ message: "Password Reset Succesful" });
    } else {
      throw new CustomEndpointError("Invalid or epired token", 404);
    }
  }
);

export {
  registerUser,
  registerAdmin,
  verifyEmail,
  loginUser,
  protectedRoute,
  forgotPasswordHandler,
  verifyResetPasswordEmail,
  resetPassword,
  getUser,
  getUsers,
};
