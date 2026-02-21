const dns = require("node:dns/promises");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

dotenv.config();

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow frontend domain here in production
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

app.use(cors());
app.use(express.json());
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Expose socket.io to the req object for broadcasting from controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Define Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/cases', require('./routes/caseRoutes'));

io.on('connection', (socket) => {
  console.log('User connected socket ID:', socket.id);
  
  // Users join rooms based on their user ID to receive targeted notifications
  socket.on('join_user_room', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their personal room.`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// App Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Server Error' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
