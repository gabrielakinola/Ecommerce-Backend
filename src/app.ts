import dotenv from "dotenv";
dotenv.config();
import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import {
  globalErrorHandler,
  notFoundHandler,
} from "./controllers/errorController";
import userRoutes from "./routes/userRoutes";
import connectDB from "./config/db";
import passport from "passport";

connectDB();

const app = express();

const PORT = process.env.PORT;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

app.use("/api/v1/users", userRoutes);
app.all("*", notFoundHandler);
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
