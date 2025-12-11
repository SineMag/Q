import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    role: 'admin' | 'patient';
  };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET is not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const decoded = jwt.verify(token, jwtSecret) as { id: number; role: 'admin' | 'patient' };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const requireRole = (roles: ('admin' | 'patient')[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

export const requireOwnershipOrAdmin = (patientIdParam: string = 'patientId') => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.role === 'admin') {
      return next();
    }

    if (req.user.role === 'patient') {
      const { pool } = await import('../db/index.js');
      const requestedPatientId = parseInt(req.params[patientIdParam]);
      
      if (isNaN(requestedPatientId)) {
        return res.status(400).json({ error: 'Invalid patient ID' });
      }

      const userResult = await pool.query('SELECT email FROM users WHERE id = $1', [req.user.id]);
      if (userResult.rows.length === 0) {
        return res.status(401).json({ error: 'User not found' });
      }

      const patientResult = await pool.query('SELECT id FROM patients WHERE email = $1 OR id = $2', [
        userResult.rows[0].email,
        requestedPatientId,
      ]);

      if (patientResult.rows.length === 0 || patientResult.rows[0].id !== requestedPatientId) {
        return res.status(403).json({ error: 'Access denied: You can only access your own data' });
      }
    }

    next();
  };
};

