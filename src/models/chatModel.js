// src/models/chatModel.js
const db = require('../config/db');

const Chat = {
  create: (senderId, receiverId, message) => {
    const sql = 'INSERT INTO chat_messages (sender_id, receiver_id, message_text) VALUES (?, ?, ?)';
    return db.query(sql, [senderId, receiverId, message]);
  }
};

module.exports = Chat;