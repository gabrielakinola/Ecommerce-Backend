import { Request, Response, NextFunction } from "express";
import { asyncErrorHandler } from "./errorController";
const registerUser = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.json({ message: "route is active" });
  }
);

export { registerUser };
