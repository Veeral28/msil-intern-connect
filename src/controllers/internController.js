// src/controllers/internController.js
const Intern = require('../models/internModel');
const Task = require('../models/taskModel');

exports.getDashboard = async (req, res) => {
  try {
    const internId = req.user.id;

    const [internDetails] = await Intern.findDetailsById(internId);
    const [tasks] = await Task.findByInternId(internId);

    if (internDetails.length === 0) {
      return res.status(404).json({ message: 'Intern not found.' });
    }

    res.json({
      details: internDetails[0],
      tasks: tasks
    });

  } catch (error) {
    console.error('Error fetching intern dashboard:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.updateTaskStatus = async (req, res) => {
  const { status } = req.body;
  const taskId = req.params.id;
  const internId = req.user.id; 

  const validStatuses = ['Not Started', 'In Progress', 'Completed'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status provided.' });
  }

  try {
    const [result] = await Task.updateStatus(taskId, internId, status);

    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Task not found or you do not have permission to update it.' });
    }

    res.json({ message: 'Task status updated successfully.' });
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};