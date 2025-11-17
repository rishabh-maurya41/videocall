# System Architecture

## Overview

This telehealth video calling system uses WebRTC for peer-to-peer video communication with Socket.io for signaling. The architecture follows a client-server model where the server acts as a signaling intermediary.

## Architecture Diagram

```
┌─────────────────┐                    ┌─────────────────┐
│   Doctor's      │                    │   Patient's     │
│   Browser       │                    │   Browser       │
│                 │                    │                 │
│  ┌───────────┐  │                    │  ┌───────────┐  │
│  │  React    │  │                    │  │  React    │  │
│  │  App      │  │                    │  │  App      │  │
│  └─────┬─────┘  │                    │  └─────┬─────┘  │
│        │        │                    │        │        │
│  ┌─────▼─────┐  │                    │  ┌─────▼─────┐  │
│  │ Socket.io │  │                    │  │ Socket.io │  │
│  │  Client   │  │                    │  │  Client   │  │
│  └─────┬─────┘  │                    │  └─────┬─────┘  │
│        │        │                    │        │        │
│  ┌─────▼─────┐  │                    │  ┌─────▼─────┐  │
│  │  WebRTC   │  │◄───────────────────┼──┤  WebRTC   │  │
│  │Peer Conn. │  │  P2P Media Stream  │  │Peer Conn. │  │
│  └───────────┘  │                    │  └───────────┘  │
└────────┬────────┘                    └────────┬────────┘
         │                                      │
         │         Signaling Messages           │
         │              (Socket.io)             │
         └──────────────────┬───────────────────┘
                            │
                    ┌───────▼────────┐
                    │   Node.js      │
                    │   Express      │
                    │   Server       │
                    │                │
                    │  ┌──────────┐  │
                    │  │Socket.io │  │
                    │  │ Server   │  │
                    │  └────┬─────┘  │
                    │       │        │
                    │  ┌────▼─────┐  │
                    │  │  REST    │  │
                    │  │   API    │  │
                    │  └────┬─────┘  │
                    └───────┼────────┘
                            │
                    ┌───────▼────────┐
                    │   MongoDB      │
                    │   Database     │
                    └────────────────┘
```

## Component Breakdown

### Frontend (React)

**1. Components**
- `VideoCall.jsx` - Main orchestrator component
- `VideoStream.jsx` - Displays video streams
- `VideoControls.jsx` - Call control buttons
- `ChatPanel.jsx` - In-call messaging
- `WaitingRoom.jsx` - Pre-call waiting state

**2. Hooks**
- `useSocket.js` - Manages Socket.io connection with auto-reconnect
- `useWebRTC.js` - Handles all WebRTC logic (peer connection, media streams, ICE)

**3. Utils**
- `webrtcConfig.js` - WebRTC configuration (STUN/TURN servers, media constraints)

### Backend (Node.js)

**1. Server Layer**
- `server.js` - Express server setup, middleware, Socket.io initialization

**2. Socket Layer**
- `signalingServer.js` - WebRTC signaling logic
  - Room management
  - Offer/Answer exchange
  - ICE candidate relay
  - User join/leave handling

**3. API Layer**
- `meetingRoutes.js` - REST API routes
- `meetingController.js` - Business logic for meetings

**4. Data Layer**
- `Meeting.js` - Mongoose schema for meeting data
- `db.js` - MongoDB connection

## Data Flow

### 1. Meeting Creation Flow

```
User → Frontend → POST /api/create-meeting → Backend
                                              ↓
                                         MongoDB (save)
                                              ↓
                                         Return roomId
                                              ↓
Frontend ← roomId ← Backend
    ↓
Navigate to /call/:roomId
```

### 2. WebRTC Connection Flow

```
User A joins room
    ↓
Socket: join-room event
    ↓
Initialize media (camera/mic)
    ↓
Create RTCPeerConnection
    ↓
Wait for User B...

User B joins room
    ↓
Socket: join-room event
    ↓
Server notifies User A: user-joined
    ↓
User A creates offer
    ↓
Socket: offer event → Server → User B
    ↓
User B receives offer
    ↓
User B creates answer
    ↓
Socket: answer event → Server → User A
    ↓
Exchange ICE candidates
    ↓
Socket: ice-candidate events (bidirectional)
    ↓
P2P connection established
    ↓
Media streams flow directly between peers
```

### 3. ICE Candidate Exchange

```
User A                    Server                    User B
  │                         │                         │
  ├─ Generate ICE ─────────►│                         │
  │  candidate              │                         │
  │                         ├─ Forward candidate ────►│
  │                         │                         │
  │                         │◄─ Generate ICE ─────────┤
  │                         │   candidate             │
  │◄─ Forward candidate ────┤                         │
  │                         │                         │
  └─────────────────────────┴─────────────────────────┘
           Direct P2P connection established
```

## WebRTC Signaling Events

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `join-room` | `{ roomId, userId, userType, userName }` | Join a video call room |
| `offer` | `{ roomId, offer, targetSocketId }` | Send WebRTC offer |
| `answer` | `{ roomId, answer, targetSocketId }` | Send WebRTC answer |
| `ice-candidate` | `{ roomId, candidate, targetSocketId }` | Send ICE candidate |
| `leave-call` | `{ roomId, userId }` | Leave the call |
| `chat-message` | `{ roomId, message, userName, userType }` | Send chat message |
| `screen-share-toggle` | `{ roomId, isSharing, userName }` | Toggle screen sharing |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `room-users` | `[{ userId, userType, userName }]` | Current users in room |
| `user-joined` | `{ socketId, userId, userType, userName }` | New user joined |
| `user-left` | `{ socketId, userId, userName, userType }` | User left |
| `offer` | `{ offer, socketId }` | Receive WebRTC offer |
| `answer` | `{ answer, socketId }` | Receive WebRTC answer |
| `ice-candidate` | `{ candidate, socketId }` | Receive ICE candidate |
| `chat-message` | `{ message, userName, userType, timestamp }` | Receive chat message |
| `screen-share-toggle` | `{ socketId, isSharing, userName }` | Screen share status |

## Database Schema

### Meeting Collection

```javascript
{
  appointmentId: String,      // Unique appointment identifier
  roomId: String,             // Unique room identifier (room-{appointmentId})
  doctorId: String,           // Doctor's user ID
  patientId: String,          // Patient's user ID
  scheduledTime: Date,        // Scheduled start time
  startTime: Date,            // Actual start time
  endTime: Date,              // Actual end time
  status: String,             // scheduled | active | completed | cancelled
  participants: [{
    userId: String,
    userType: String,         // doctor | patient
    joinedAt: Date,
    leftAt: Date
  }],
  duration: Number,           // Call duration in seconds
  createdAt: Date,
  updatedAt: Date
}
```

## Security Considerations

### 1. Media Stream Security
- Encrypted by default (DTLS-SRTP)
- Peer-to-peer reduces server load
- No media passes through server

### 2. Signaling Security
- Use WSS (WebSocket Secure) in production
- Implement authentication middleware
- Validate all socket events
- Rate limit socket connections

### 3. API Security
- CORS configuration
- Input validation
- Authentication/Authorization
- Rate limiting
- HTTPS only in production

### 4. Database Security
- Connection string in environment variables
- Mongoose schema validation
- Index sensitive fields
- Regular backups

## Scalability Considerations

### Horizontal Scaling
- Use Redis adapter for Socket.io
- Load balance with sticky sessions
- Separate signaling and API servers

### Media Server (Optional)
For large-scale deployments, consider:
- Janus WebRTC Server
- Kurento Media Server
- Mediasoup

### CDN Integration
- Serve static assets via CDN
- Reduce latency for global users

## Performance Optimization

### Frontend
- Lazy load components
- Optimize video resolution based on bandwidth
- Implement adaptive bitrate
- Use Web Workers for heavy processing

### Backend
- Connection pooling for MongoDB
- Cache frequently accessed data
- Implement rate limiting
- Use PM2 for process management

### Network
- Use TURN server for NAT traversal
- Implement bandwidth estimation
- Quality of Service (QoS) monitoring

## Monitoring & Logging

### Metrics to Track
- Connection success rate
- Average call duration
- ICE connection failures
- Socket disconnections
- API response times
- Database query performance

### Logging Strategy
- Structured logging (JSON)
- Log levels (error, warn, info, debug)
- Centralized logging (ELK stack, CloudWatch)
- Real-time alerts for critical errors

## Future Enhancements

1. **Recording**: Server-side recording with FFmpeg
2. **AI Features**: Real-time transcription, translation
3. **Analytics**: Call quality metrics, user engagement
4. **Virtual Backgrounds**: Background blur/replacement
5. **Multi-party Calls**: Support for 3+ participants
6. **Mobile Apps**: React Native implementation
7. **Breakout Rooms**: Separate consultation spaces
8. **File Sharing**: Share documents during call
