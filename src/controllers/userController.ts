import { Request, Response, NextFunction } from "express";
import { asyncErrorHandler } from "./errorController";
import User, { ISellerProfile, IUser } from "../models/userModel";
import { CustomEndpointError } from "../classes/errorClasses";
import { sendResetPasswordEMail, sendTestEmail } from "./utils/nodemailer";
import { generateAuthToken } from "./utils/token";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Types } from "mongoose";
import bcrypt from "bcryptjs";

const ObjectId = Types.ObjectId;

const registerUser = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { firstName, lastName, username, email, password } = req.body;

    const userNameExist = await User.findOne({ username });
    if (userNameExist) {
      throw new CustomEndpointError("username is in use", 500);
    }
    const userExists = await User.findOne({ email });
    if (userExists && !userExists.isVerified) {
      const userId = userExists._id.toString();
      const testUrl = await sendTestEmail(userId, email, next);
      res.status(200).json({
        message: "UserEmail already has an account but is unverified",
        verificationUrl: testUrl,
      });
      return;
    } else if (userExists && userExists.isVerified) {
      throw new CustomEndpointError("User has an account, please log in", 400);
    }

    const user = await User.create({
      email,
      password,
      lastName,
      firstName,
      username,
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

const createSeller = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { business, address, phone } = req.body;
    const user = req.user as IUser;
    const idImageUrl = (req as any).files["idCard"][0].path;
    const businessImageUrl = (req as any).files["businessImage"][0].path;

    const phoneNumber = phone.toString();

    if (user.isSeller) {
      throw new CustomEndpointError("User is already a seller", 400);
    }

    const updateObject = {
      isSeller: true,
      sellerProfile: {
        business,
        address,
        phone: phoneNumber,
        idImageUrl,
        businessImageUrl,
      },
    };

    await User.findByIdAndUpdate(user._id, { $set: updateObject });

    const updatedUser = await User.findById(user._id).select("-password");

    if (updatedUser?.sellerProfile) {
      res
        .status(200)
        .json({ message: "Seller profile created succesfully", updatedUser });
    } else {
      throw new CustomEndpointError(
        "Failed to create user seller profile",
        400
      );
    }
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
  createSeller,
  verifyEmail,
  loginUser,
  forgotPasswordHandler,
  verifyResetPasswordEmail,
  resetPassword,
  getUser,
  getUsers,
};
