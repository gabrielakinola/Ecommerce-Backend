import jwt from "jsonwebtoken";
import { Response } from "express";

const generateAuthToken = (res: Response, userId: string): void => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET_KEY, {
    expiresIn: "30d",
  });
  res.header("Authorization", `Bearer ${token}`);
};

const generateVerificationToken = (userId: string): string => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET_KEY2, {
    expiresIn: "30m",
  });
  return token;
};

export { generateAuthToken, generateVerificationToken };
