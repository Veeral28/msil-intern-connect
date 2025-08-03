require('dotenv').config();

const express = require('express');
const http = require('http'); 
const { Server } = require("socket.io");
const cors = require('cors');
const Chat = require('./src/models/chatModel');

const authRoutes = require('./src/routes/authRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const internRoutes = require('./src/routes/internRoutes');

const app = express();

// Use middleware
app.use(cors()); 
app.use(express.json());
app.use(express.static('public'));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // For development, allow any origin. For production, restrict this.
    methods: ["GET", "POST"]
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/intern', internRoutes);

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // User joins a private room based on their own ID
  socket.on('joinRoom', (userId) => {
    socket.join(String(userId)); // Join room with string name
    console.log(`User ${socket.id} joined room: ${userId}`);
  });

  // Listen for a private message
  socket.on('privateMessage', async ({ senderId, receiverId, message }) => {
    try {
      // 1. Save message to the database
      await Chat.create(senderId, receiverId, message);

      // 2. Send the message to the recipient's room
      io.to(String(receiverId)).emit('message', {
        sender: senderId,
        text: message
      });
    } catch (error) {
      console.error('Error handling private message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Get the port from environment variables, with a default value
const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});