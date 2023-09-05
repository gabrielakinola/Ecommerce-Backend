import { NextFunction, Response } from "express";
import { generateVerificationToken } from "./token";
import {
  createTransport,
  createTestAccount,
  getTestMessageUrl,
} from "nodemailer";
import { asyncErrorHandler } from "../errorController";
import { CustomEndpointError } from "../../classes/errorClasses";
import User from "../../models/userModel";

const sendTestEmail = async (
  userId: string,
  email: string,
  next: NextFunction
) => {
  try {
    const token = generateVerificationToken(userId);

    const verificationLink = `http://localhost:3000/api/v1/users/verify/${token}`;

    const testAccount = await createTestAccount();

    const transporter = createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const info = await transporter.sendMail({
      from: "sender@example.com",
      to: email,
      subject: "Test Verification Email",
      html: `Click on the following link to verify your email: <a href= "${verificationLink}">Verify Email<a/>`,
    });

    const url = getTestMessageUrl(info);
    if (url) {
      return url;
    } else {
      throw new CustomEndpointError("Email delivery failed", 400);
    }
  } catch (err) {
    next(err);
  }
};

const sendResetPasswordEMail = async (
  userId: string,
  email: string,
  next: NextFunction
) => {
  try {
    const resetToken = generateVerificationToken(userId);
    const resetLink = `http://localhost:3000/api/v1/users/reset-password?token=${resetToken}`;
    const testAccount = await createTestAccount();

    const transporter = createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const info = await transporter.sendMail({
      from: "sender@example.com",
      to: email,
      subject: "Test Verification Email",
      html: `Click on the following link to reset your password: <a href= "${resetLink}">Reset Password<a/>`,
    });

    const url = getTestMessageUrl(info);
    if (url) {
      return url;
    } else {
      throw new CustomEndpointError("Email delivery failed", 400);
    }
  } catch (err) {
    next(err);
  }
};

export { sendTestEmail, sendResetPasswordEMail };
