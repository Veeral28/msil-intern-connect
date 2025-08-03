// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware'); // Import the middleware

// @route   POST api/auth/register
router.post('/register', authController.registerMentor);

// @route   POST api/auth/login
router.post('/login', authController.login);

// @route   GET api/auth/me
// @desc    Get logged in user's info
// @access  Private (notice the authMiddleware is added here)
router.get('/me', authMiddleware, authController.getLoggedInUser);

module.exports = router;