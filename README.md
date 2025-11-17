# Telehealth WebRTC Video Calling Module

A complete, production-ready WebRTC-based video calling solution for telehealth portals. Built with React, Node.js, Socket.io, and MongoDB.

## Features

✅ **WebRTC Video Calling**
- Peer-to-peer video and audio communication
- HD video quality (720p)
- Echo cancellation and noise suppression

✅ **Call Controls**
- Mute/Unmute audio
- Camera on/off
- Screen sharing
- End call

✅ **Real-time Features**
- In-call text chat
- Connection status indicators
- Call duration timer
- User join/leave notifications

✅ **Production Ready**
- Auto-reconnect on socket disconnection
- Graceful error handling
- Permission error handling
- Clean resource cleanup
- Waiting room UI

## Tech Stack

**Frontend:**
- React 18
- Tailwind CSS
- Socket.io Client
- React Router
- Lucide Icons

**Backend:**
- Node.js
- Express
- Socket.io
- MongoDB (Mongoose)

## Project Structure

```
telehealth-video-call/
├── backend/
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── models/
│   │   └── Meeting.js               # Meeting schema
│   ├── controllers/
│   │   └── meetingController.js     # Meeting API logic
│   ├── routes/
│   │   └── meetingRoutes.js         # API routes
│   ├── socket/
│   │   └── signalingServer.js       # WebRTC signaling
│   ├── server.js                    # Main server file
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── VideoCall/
│   │   │       ├── VideoCall.jsx    # Main call component
│   │   │       ├── VideoControls.jsx
│   │   │       ├── VideoStream.jsx
│   │   │       ├── ChatPanel.jsx
│   │   │       └── WaitingRoom.jsx
│   │   ├── hooks/
│   │   │   ├── useWebRTC.js         # WebRTC logic
│   │   │   └── useSocket.js         # Socket connection
│   │   ├── utils/
│   │   │   └── webrtcConfig.js      # WebRTC config
│   │   ├── pages/
│   │   │   └── Home.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (running locally or remote)
- Modern browser with WebRTC support

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/telehealth
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

5. Start MongoDB (if running locally):
```bash
mongod
```

6. Start the backend server:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
VITE_SOCKET_URL=http://localhost:5000
VITE_API_URL=http://localhost:5000/api
```

5. Start the development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## Usage

### Creating a Meeting

1. Open `http://localhost:5173` in your browser
2. Enter an appointment ID (optional) or leave blank for auto-generation
3. Click "Create New Meeting"
4. Share the room ID with the other participant

### Joining a Meeting

1. Open `http://localhost:5173` in another browser/tab
2. Enter the appointment ID
3. Click "Join Existing Meeting"
4. Grant camera and microphone permissions

### API Endpoints

**Create Meeting**
```http
POST /api/create-meeting
Content-Type: application/json

{
  "appointmentId": "appt-123",
  "doctorId": "doctor-456",
  "patientId": "patient-789",
  "scheduledTime": "2024-01-15T10:00:00Z"
}
```

**Get Meeting**
```http
GET /api/meeting/:roomId
```

**Update Meeting Status**
```http
PUT /api/meeting/:roomId/status
Content-Type: application/json

{
  "status": "completed",
  "endTime": "2024-01-15T10:30:00Z"
}
```

## WebRTC Configuration

### STUN Server
Currently using Google's public STUN servers:
- `stun:stun.l.google.com:19302`
- `stun:stun1.l.google.com:19302`

### TURN Server (Production)
For production, configure a TURN server (Coturn) in `frontend/src/utils/webrtcConfig.js`:

```javascript
{
  urls: 'turn:your-turn-server.com:3478',
  username: 'your-username',
  credential: 'your-password'
}
```

### Installing Coturn (Ubuntu/Debian)
```bash
sudo apt-get install coturn
sudo nano /etc/turnserver.conf
```

Basic Coturn configuration:
```
listening-port=3478
fingerprint
lt-cred-mech
user=username:password
realm=yourdomain.com
```

## Socket.io Events

### Client → Server
- `join-room` - Join a video call room
- `offer` - Send WebRTC offer
- `answer` - Send WebRTC answer
- `ice-candidate` - Send ICE candidate
- `leave-call` - Leave the call
- `chat-message` - Send chat message
- `screen-share-toggle` - Toggle screen sharing

### Server → Client
- `room-users` - List of users in room
- `user-joined` - New user joined
- `user-left` - User left the call
- `offer` - Receive WebRTC offer
- `answer` - Receive WebRTC answer
- `ice-candidate` - Receive ICE candidate
- `chat-message` - Receive chat message
- `screen-share-toggle` - Screen share status

## Production Deployment

### Environment Variables
Update for production:
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/telehealth
CORS_ORIGIN=https://yourdomain.com
```

### Security Considerations
1. Use HTTPS for both frontend and backend
2. Configure TURN server for NAT traversal
3. Implement authentication/authorization
4. Add rate limiting
5. Validate all inputs
6. Use secure WebSocket (wss://)

### Build Frontend
```bash
cd frontend
npm run build
```

Deploy the `dist` folder to your hosting service.

### Deploy Backend
Use PM2 for process management:
```bash
npm install -g pm2
pm2 start server.js --name telehealth-api
pm2 save
pm2 startup
```

## Troubleshooting

### Camera/Microphone Not Working
- Check browser permissions
- Ensure HTTPS in production
- Verify device availability

### Connection Issues
- Check firewall settings
- Verify STUN/TURN server configuration
- Check network connectivity

### Socket Disconnection
- Auto-reconnect is enabled
- Check server logs
- Verify CORS settings

## Browser Support
- Chrome 74+
- Firefox 66+
- Safari 12.1+
- Edge 79+

## License
MIT

## Support
For issues and questions, please open an issue on GitHub.
