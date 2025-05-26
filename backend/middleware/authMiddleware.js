const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Adjust path as necessary

const authMiddleware = async (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  const tokenParts = authHeader.split(' ');
  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Access denied. Token format is "Bearer <token>".' });
  }

  const token = tokenParts[1];

  try {
    // IMPORTANT: Use the same JWT_SECRET as used in login
    const jwtSecret = process.env.JWT_SECRET || 'YOUR_VERY_SECRET_KEY_REPLACE_IN_PROD';
    if (jwtSecret === 'YOUR_VERY_SECRET_KEY_REPLACE_IN_PROD' && process.env.NODE_ENV === 'production') {
        console.error('CRITICAL: Using default JWT_SECRET in production! Set a strong secret in environment variables.');
        // Potentially block access or log critically in a real production scenario
    }

    const decoded = jwt.verify(token, jwtSecret);

    // Attach user to request object
    // Optionally, fetch fresh user data from DB to ensure user still exists/is active
    // For this example, we'll use the decoded payload directly if it contains enough info
    // If only user ID is in token, you MUST fetch from DB:
    // req.user = await User.findByPk(decoded.user.id, { attributes: { exclude: ['password_hash'] } });
    // if (!req.user) return res.status(401).json({ message: 'Access denied. User not found.' });

    req.user = decoded.user; // Assuming 'user' object in payload (id, username)
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Access denied. Invalid token payload.' });
    }

    next(); // Proceed to the next middleware or route handler
  } catch (ex) {
    if (ex.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Access denied. Token expired.' });
    }
    if (ex.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Access denied. Invalid token.' });
    }
    console.error("Auth middleware error:", ex);
    res.status(400).json({ message: 'Invalid token.' }); // Generic error for other JWT issues
  }
};

module.exports = authMiddleware;
