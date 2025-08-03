// src/routes/internRoutes.js
const express = require('express');
const router = express.Router();
const internController = require('../controllers/internController');
const authMiddleware = require('../middleware/authMiddleware');

// Protect all intern routes
router.use(authMiddleware);

// @route   GET api/intern/dashboard
// @desc    Get dashboard data for logged-in intern
router.get('/dashboard', internController.getDashboard);

// @route   PUT api/intern/tasks/:id/status
// @desc    Update the status of a task
router.put('/tasks/:id/status', internController.updateTaskStatus);

module.exports = router;