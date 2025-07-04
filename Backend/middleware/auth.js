import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { verifyFirebaseToken } from '../config/firebase.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    let decoded;
    let user;

    try {
      // Try to verify as JWT token first
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      user = await User.findById(decoded.id);
    } catch (jwtError) {
      try {
        // If JWT verification fails, try Firebase token
        const firebaseUser = await verifyFirebaseToken(token);
        user = await User.findOne({ firebaseUid: firebaseUser.uid });
      } catch (firebaseError) {
        return res.status(401).json({ success: false, message: 'Invalid token.' });
      }
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }

    if (user.status === 'inactive') {
      return res.status(401).json({ success: false, message: 'Account is inactive.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token.' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Access denied.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions.' });
    }

    next();
  };
};