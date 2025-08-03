// src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// @route   POST api/admin/batches
// @desc    Create a new batch
router.post('/batches', adminController.createBatch);

// @route   GET api/admin/batches
// @desc    Get all batches
router.get('/batches', adminController.getAllBatches);

router.post('/interns', adminController.addIntern);

// @route   GET api/admin/interns
// @desc    Get all interns
router.get('/interns', adminController.getAllInterns);

// @route   PUT api/admin/interns/:id
// @desc    Update an intern
router.put('/interns/:id', adminController.updateIntern);

// @route   DELETE api/admin/interns/:id
// @desc    Delete an intern
router.delete('/interns/:id', adminController.deleteIntern);

// @route   POST api/admin/tasks
// @desc    Assign a new task to an intern
router.post('/tasks', adminController.assignTask);

module.exports = router;