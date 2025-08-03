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

// Middleware
app.use(cors()); 
app.use(express.json());
app.use(express.static('public/intern'));

// HTTP Server & Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // ⚠️ Use a specific origin in production
    methods: ["GET", "POST"]
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/intern', internRoutes);

// Socket.IO handlers
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('joinRoom', (userId) => {
    socket.join(String(userId));
    console.log(`User ${socket.id} joined room: ${userId}`);
  });

  socket.on('privateMessage', async ({ senderId, receiverId, message }) => {
    try {
      await Chat.create(senderId, receiverId, message);

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

// Start the server (Render will provide the PORT)
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
