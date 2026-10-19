import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes - JWT verification & user active status check
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication token missing or invalid. Please log in.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'localserv_hackathon_secret_key_2026');
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'The account associated with this token no longer exists.',
      });
    }

    if (!req.user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated by an administrator. Access revoked.',
      });
    }

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Token expired or signature invalid. Please log in again.',
    });
  }
};

// Grant access to specific roles (RBAC)
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user ? req.user.role : 'unauthorized'}' is not allowed to access this resource.`,
      });
    }
    next();
  };
};

// Granular admin permission enforcement
export const checkAdminPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Admin access required.' });
    }

    // Root Super Admin bypasses all sub-permission restrictions
    const rootEmails = ['admin@localserve.com', 'admin2@localserve.com'];
    const rootUsernames = ['sh1vam', 'sangamgautam'];
    if (
      req.user.isSuperAdmin ||
      rootEmails.includes(req.user.email) ||
      rootUsernames.includes(req.user.username)
    ) {
      return next();
    }

    // Check specific sub-admin permission flag
    if (req.user.adminPermissions && req.user.adminPermissions[permission]) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access Denied: Your admin profile lacks the required '${permission}' authority.`,
    });
  };
};
