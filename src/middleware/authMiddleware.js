// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Get token from header
  const token = req.header('Authorization');

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const tokenParts = token.split(' ');
  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Token is not valid' });
  }

  const actualToken = tokenParts[1];

  // Verify token
  try {
    const decoded = jwt.verify(actualToken, process.env.JWT_SECRET);
    req.user = decoded.user; 
    next(); 
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};