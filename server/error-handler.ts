import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const handleAsyncErrors = (fn: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const globalErrorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Always log the full error for server-side debugging, regardless of environment
  console.error(`[globalErrorHandler] ${err.message || 'Unknown error'}`);
  if (err.stack) {
    console.error(err.stack);
  }

  const statusCode = err.statusCode || err.status || 500;

  // Handle specific error types
  let userMessage = 'Internal server error';
  if (err.name === 'ValidationError' || err.isOperational) {
    userMessage = err.message || 'Invalid input data';
  } else if (err.code === 'ECONNREFUSED') {
    userMessage = 'Service temporarily unavailable';
  }

  // Build response
  const response: Record<string, any> = {
    error: userMessage,
  };

  // Temporary debug: include error details to diagnose Vercel 400 errors
  // TODO: Remove after debugging
  if (process.env.NODE_ENV !== 'development') {
    response._debug = {
      message: err.message,
      name: err.name,
      code: err.code,
      statusCode: err.statusCode,
      status: err.status,
      isOperational: err.isOperational,
    };
  }

  if (process.env.NODE_ENV === 'development') {
    response.message = err.message;
    response.stack = err.stack;
  }

  // Don't attempt to send if headers already sent
  if (!res.headersSent) {
    res.status(typeof statusCode === 'number' ? statusCode : 500).json(response);
  }
};