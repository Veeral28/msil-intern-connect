// src/models/internModel.js
const db = require('../config/db');

const Intern = {
  create: (internDetails, hashedPassword) => {
    const { name, age, email, start_date, end_date, department, mentor_id, batch_id } = internDetails;
    const sql = 'INSERT INTO interns (name, age, email, password, start_date, end_date, department, mentor_id, batch_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    return db.query(sql, [name, age, email, hashedPassword, start_date, end_date, department, mentor_id, batch_id]);
  },

  findByEmail: (email) => {
    const sql = 'SELECT * FROM interns WHERE email = ?';
    return db.query(sql, [email]);
  },

  findAll: () => {
    const sql = 'SELECT id, name, email, department, start_date, end_date FROM interns';
    return db.query(sql);
  },

  update: (id, internDetails) => {
    const { name, age, department } = internDetails;
    const sql = 'UPDATE interns SET name = ?, age = ?, department = ? WHERE id = ?';
    return db.query(sql, [name, age, department, id]);
  },

  remove: (id) => {
    const sql = 'DELETE FROM interns WHERE id = ?';
    return db.query(sql, [id]);
  },

  findDetailsById: (internId) => {
    const sql = `
      SELECT i.id, i.name, i.email, i.department, i.mentor_id, m.name as mentor_name
      FROM interns i
      LEFT JOIN mentors m ON i.mentor_id = m.id
      WHERE i.id = ?
    `;
    return db.query(sql, [internId]);
  }
};

module.exports = Intern;