const Meeting = require('../models/Meeting');

const rooms = new Map(); // roomId -> Set of socket IDs

const setupSignalingServer = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join room
    socket.on('join-room', async ({ roomId, userId, userType, userName }) => {
      try {
        console.log(`📥 Join room request:`, { roomId, userId, userType, userName, socketId: socket.id });
        
        socket.join(roomId);
        
        // Initialize room if doesn't exist
        if (!rooms.has(roomId)) {
          console.log(`🆕 Creating new room: ${roomId}`);
          rooms.set(roomId, new Map());
        }
        
        // Store user info
        rooms.get(roomId).set(socket.id, { userId, userType, userName });
        console.log(`✅ User stored in room. Room now has ${rooms.get(roomId).size} user(s)`);
        
        // Update meeting in database
        await Meeting.findOneAndUpdate(
          { roomId },
          {
            $push: {
              participants: {
                userId,
                userType,
                joinedAt: new Date()
              }
            },
            $set: { status: 'active' }
          }
        );

        // Get all users in room
        const usersInRoom = Array.from(rooms.get(roomId).values());
        console.log(`👥 Users in room ${roomId}:`, usersInRoom);
        
        // Notify others in room
        socket.to(roomId).emit('user-joined', {
          socketId: socket.id,
          userId,
          userType,
          userName,
          usersInRoom
        });
        console.log(`📢 Notified other users in room about new user`);

        // Send current users to the new joiner
        socket.emit('room-users', usersInRoom);
        console.log(`📤 Sent room-users to ${userName}`);

        console.log(`✅ User ${userName} (${userType}) joined room: ${roomId}`);
      } catch (error) {
        console.error('Join room error:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // WebRTC signaling: offer
    socket.on('offer', ({ roomId, offer, targetSocketId }) => {
      socket.to(targetSocketId).emit('offer', {
        offer,
        socketId: socket.id
      });
      console.log(`Offer sent in room ${roomId}`);
    });

    // WebRTC signaling: answer
    socket.on('answer', ({ roomId, answer, targetSocketId }) => {
      socket.to(targetSocketId).emit('answer', {
        answer,
        socketId: socket.id
      });
      console.log(`Answer sent in room ${roomId}`);
    });

    // WebRTC signaling: ICE candidate
    socket.on('ice-candidate', ({ roomId, candidate, targetSocketId }) => {
      socket.to(targetSocketId).emit('ice-candidate', {
        candidate,
        socketId: socket.id
      });
    });

    // In-call chat message
    socket.on('chat-message', ({ roomId, message, userName, userType }) => {
      io.to(roomId).emit('chat-message', {
        message,
        userName,
        userType,
        timestamp: new Date(),
        socketId: socket.id
      });
    });

    // Screen sharing toggle
    socket.on('screen-share-toggle', ({ roomId, isSharing, userName }) => {
      socket.to(roomId).emit('screen-share-toggle', {
        socketId: socket.id,
        isSharing,
        userName
      });
    });

    // Leave call
    socket.on('leave-call', async ({ roomId, userId }) => {
      await handleUserLeave(socket, roomId, userId);
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.id}`);
      
      // Find which room the user was in
      for (const [roomId, users] of rooms.entries()) {
        if (users.has(socket.id)) {
          const userInfo = users.get(socket.id);
          await handleUserLeave(socket, roomId, userInfo.userId);
          break;
        }
      }
    });
  });

  // Helper function to handle user leaving
  async function handleUserLeave(socket, roomId, userId) {
    try {
      if (!rooms.has(roomId)) {
        console.log(`Room ${roomId} not found, user may have already left`);
        return;
      }

      const room = rooms.get(roomId);
      const userInfo = room.get(socket.id);
      room.delete(socket.id);

      // Notify others
      socket.to(roomId).emit('user-left', {
        socketId: socket.id,
        userId,
        userName: userInfo?.userName,
        userType: userInfo?.userType
      });

      socket.leave(roomId);

      // Update database
      await Meeting.findOneAndUpdate(
        { roomId, 'participants.userId': userId },
        {
          $set: { 'participants.$.leftAt': new Date() }
        }
      );

      // If room is empty, mark meeting as completed
      if (room.size === 0) {
        rooms.delete(roomId);
        await Meeting.findOneAndUpdate(
          { roomId },
          {
            status: 'completed',
            endTime: new Date()
          }
        );
        console.log(`Room ${roomId} is now empty and marked as completed`);
      } else {
        console.log(`Room ${roomId} still has ${room.size} user(s)`);
      }

      console.log(`User ${userId} left room: ${roomId}`);
    } catch (error) {
      console.error('Leave call error:', error);
    }
  }
};

module.exports = setupSignalingServer;
