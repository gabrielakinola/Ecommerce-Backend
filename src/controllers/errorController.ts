import { Request, Response, NextFunction } from "express";
import { CustomEndpointError } from "../classes/errorClasses";

const globalErrorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof CustomEndpointError) {
    res.status(error.statusCode).json({
      message: error.message,
      status: error.statusCode,
      stackTrace: error.stack,
      error,
    });
  } else {
    res.status(500).json({
      message: error.message,
      status: 500,
      stackTrace: error.stack,
      error,
    });
  }
};

const asyncErrorHandler = (
  func: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    func(req, res, next).catch((err) => next(err));
  };
};

const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new CustomEndpointError(`Not found - ${req.originalUrl}`, 404);
  next(error);
};

export { globalErrorHandler, asyncErrorHandler, notFoundHandler };
