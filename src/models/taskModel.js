// src/models/taskModel.js
const db = require('../config/db');

const Task = {
  create: (taskDetails) => {
    const { title, description, assigned_to, assigned_by, deadline_date } = taskDetails;
    const sql = 'INSERT INTO tasks (title, description, assigned_to, assigned_by, deadline_date) VALUES (?, ?, ?, ?, ?)';
    return db.query(sql, [title, description, assigned_to, assigned_by, deadline_date]);
  },

  findByInternId: (internId) => {
    const sql = `
      SELECT t.id, t.title, t.description, t.deadline_date, t.status, m.name as mentor_name
      FROM tasks t
      JOIN mentors m ON t.assigned_by = m.id
      WHERE t.assigned_to = ?
      ORDER BY t.deadline_date ASC
    `;
    return db.query(sql, [internId]);
  },

  updateStatus: (taskId, internId, status) => {
    const sql = 'UPDATE tasks SET status = ? WHERE id = ? AND assigned_to = ?';
    return db.query(sql, [status, taskId, internId]);
  },
};

module.exports = Task;