// src/models/mentorModel.js
const db = require('../config/db');

const Mentor = {
  create: (name, email, hashedPassword, role = 'mentor') => {
    const sql = 'INSERT INTO mentors (name, email, password, role) VALUES (?, ?, ?, ?)';
    return db.query(sql, [name, email, hashedPassword, role]);
  },

  findByEmail: (email) => {
    const sql = 'SELECT * FROM mentors WHERE email = ?';
    return db.query(sql, [email]);
  }
};

module.exports = Mentor;