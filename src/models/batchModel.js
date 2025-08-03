// src/models/batchModel.js
const db = require('../config/db');

const Batch = {
  create: (batchName, startDate, endDate) => {
    const sql = 'INSERT INTO batches (batch_name, start_date, end_date) VALUES (?, ?, ?)';
    return db.query(sql, [batchName, startDate, endDate]);
  },

  findAll: () => {
    const sql = 'SELECT * FROM batches ORDER BY start_date DESC';
    return db.query(sql);
  },
  update: (id, batchName, startDate, endDate) => {
    const sql = 'UPDATE batches SET batch_name = ?, start_date = ?, end_date = ? WHERE id = ?';
    return db.query(sql, [batchName, startDate, endDate, id]);
  },

  remove: (id) => {
    const sql = 'DELETE FROM batches WHERE id = ?';
    return db.query(sql, [id]);
  }
};

module.exports = Batch;