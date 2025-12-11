import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError | ZodError | Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation error',
      details: err.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  const statusCode = (err as AppError).statusCode || 500;
  const message = err.message || 'Internal server error';

  if (process.env.NODE_ENV === 'production') {
    res.status(statusCode).json({
      error: statusCode === 500 ? 'Internal server error' : message,
    });
  } else {
    res.status(statusCode).json({
      error: message,
      stack: err.stack,
    });
  }
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
};

