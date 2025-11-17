require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const meetingRoutes = require('./routes/meetingRoutes');
const setupSignalingServer = require('./socket/signalingServer');

const app = express();
const server = http.createServer(app);

// FIXED CORS
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
}));

app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api', meetingRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

setupSignalingServer(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
