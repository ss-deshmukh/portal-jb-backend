/**
 * Authentication Middleware
 * 
 * Verifies Auth.js (NextAuth.js) session cookies using the shared AUTH_SECRET.
 * Extracts user information from the session and adds it to the request object.
 */

const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

// Get AUTH_SECRET from environment variables
const AUTH_SECRET = process.env.AUTH_SECRET;
if (!AUTH_SECRET) {
  throw new Error('AUTH_SECRET environment variable is required');
}

const auth = async (req, res, next) => {
  try {
    // Get the session cookie
    const sessionCookie = req.cookies['next-auth.session-token'];
    if (!sessionCookie) {
      return res.status(401).json({ message: 'No session cookie found' });
    }

    // Decrypt the session cookie
    const session = jwt.verify(sessionCookie, AUTH_SECRET);
    
    // Verify session is valid and not expired
    if (!session || !session.user) {
      return res.status(401).json({ message: 'Invalid session' });
    }

    // Add the user info to the request object
    req.user = {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role || 'user',
      permissions: session.user.permissions || []
    };

    // For debugging during development
    logger.debug('Authenticated user:', {
      userId: session.user.id,
      email: session.user.email,
      role: session.user.role
    });

    next();
  } catch (error) {
    logger.error('Auth error:', error);
    return res.status(401).json({ message: 'Invalid or expired session' });
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