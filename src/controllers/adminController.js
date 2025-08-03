// src/controllers/adminController.js
const Batch = require('../models/batchModel');
const Intern = require('../models/internModel');
const bcrypt = require('bcryptjs');
const Task = require('../models/taskModel');

// --- Create a new Batch ---
exports.createBatch = async (req, res) => {
  // Authorization check
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admins only.' });
  }

  const { batch_name, start_date, end_date } = req.body;
  if (!batch_name || !start_date || !end_date) {
    return res.status(400).json({ message: 'Please provide all required fields.' });
  }

  try {
    await Batch.create(batch_name, start_date, end_date);
    res.status(201).json({ message: 'Batch created successfully!' });
  } catch (error) {
    console.error('Error creating batch:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// --- Get all Batches ---
exports.getAllBatches = async (req, res) => {
  try {
    const [batches] = await Batch.findAll();
    res.json(batches);
  } catch (error) {
    console.error('Error fetching batches:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.addIntern = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admins only.' });
  }

  const internDetails = req.body;
  const { email, password } = internDetails;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    // Hash the intern's password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the intern in the database
    await Intern.create(internDetails, hashedPassword);
    res.status(201).json({ message: 'Intern added successfully!' });

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'An intern with this email already exists.' });
    }
    console.error('Error adding intern:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getAllInterns = async (req, res) => {
  try {
    const [interns] = await Intern.findAll();
    res.json(interns);
  } catch (error) {
    console.error('Error fetching interns:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.updateIntern = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admins only.' });
  }
  try {
    await Intern.update(req.params.id, req.body);
    res.json({ message: 'Intern updated successfully.' });
  } catch (error) {
    console.error('Error updating intern:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.deleteIntern = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admins only.' });
  }
  try {
    await Intern.remove(req.params.id);
    res.json({ message: 'Intern deleted successfully.' });
  } catch (error) {
    console.error('Error deleting intern:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.assignTask = async (req, res) => {
  // The ID of the mentor/admin assigning the task
  const assigned_by = req.user.id;

  // The rest of the details from the request body
  const { title, description, deadline_date, assigned_to } = req.body;

  if (!title || !deadline_date || !assigned_to) {
    return res.status(400).json({ message: 'Title, deadline, and assigned_to are required.' });
  }

  try {
    await Task.create({ title, description, deadline_date, assigned_to, assigned_by });
    res.status(201).json({ message: 'Task assigned successfully!' });
  } catch (error) {
    console.error('Error assigning task:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};