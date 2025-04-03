/**
 * Authentication Middleware
 * 
 * Verifies JWT tokens from NextAuth in the Bearer Authorization header using AUTH_SECRET.
 * Extracts user role and information from the JWT and adds it to the request object.
 */

const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

// Get AUTH_SECRET from environment variables - must match NextAuth secret
const AUTH_SECRET = process.env.AUTH_SECRET;
if (!AUTH_SECRET) {
  throw new Error('AUTH_SECRET environment variable is required');
}

/**
 * Authentication middleware
 * Verifies JWT token from Authorization header
 */
const auth = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No authentication token found' });
    }
    
    const token = authHeader.substring(7);
    
    // Verify token from NextAuth
    const decoded = jwt.verify(token, AUTH_SECRET);
    
    // Extract user info from NextAuth JWT format
    // NextAuth typically includes a 'sub' field for user ID
    // and may nest user data in different structures
    let userId, role, permissions;
    
    if (decoded.sub) {
      // Standard NextAuth format
      userId = decoded.sub;
      // Role and permissions might be in different locations depending on your NextAuth config
      role = decoded.role || (decoded.user && decoded.user.role) || 'user';
      permissions = decoded.permissions || (decoded.user && decoded.user.permissions) || [];
    } else if (decoded.id) {
      // Our custom format
      userId = decoded.id;
      role = decoded.role || 'user';
      permissions = decoded.permissions || [];
    } else {
      return res.status(401).json({ message: 'Invalid token format: missing user identifier' });
    }

    // Add user info to request object
    req.user = {
      id: userId,
      role: role,
      permissions: permissions
    };

    logger.debug('Authenticated user:', {
      userId: userId,
      role: role
    });

    next();
  } catch (error) {
    logger.error('Auth error:', error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

/**
 * Role-based Authorization Middleware
 * 
 * Checks if the authenticated user has the required role to access specific routes.
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient role permissions' });
    }

    next();
  };
};

/**
 * Permission-based Authorization Middleware
 * 
 * Checks if the authenticated user has specific permissions to access certain resources.
 */
const hasPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!req.user.permissions.includes(permission)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
};

module.exports = {
  auth,
  authorize,
  hasPermission
}; 