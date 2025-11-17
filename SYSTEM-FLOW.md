# System Flow Diagrams

Visual representation of how the telehealth video calling system works.

## 1. Complete System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        TELEHEALTH PORTAL                        │
│                                                                 │
│  ┌──────────────┐                        ┌──────────────┐      │
│  │   Doctor's   │                        │  Patient's   │      │
│  │   Browser    │                        │   Browser    │      │
│  │              │                        │              │      │
│  │  React App   │                        │  React App   │      │
│  └──────┬───────┘                        └──────┬───────┘      │
│         │                                       │              │
│         │  WebRTC (P2P)                        │              │
│         │  Video/Audio ◄═══════════════════════┤              │
│         │                                       │              │
│         │  Socket.io                            │              │
│         │  Signaling                            │              │
│         └───────────┬───────────────────────────┘              │
│                     │                                          │
└─────────────────────┼──────────────────────────────────────────┘
                      │
                      ▼
            ┌─────────────────┐
            │   Node.js       │
            │   Express       │
            │   Server        │
            │                 │
            │  ┌───────────┐  │
            │  │Socket.io  │  │
            │  │ Server    │  │
            │  └─────┬─────┘  │
            │        │        │
            │  ┌─────▼─────┐  │
            │  │  REST API │  │
            │  └─────┬─────┘  │
            └────────┼────────┘
                     │
                     ▼
            ┌─────────────────┐
            │    MongoDB      │
            │    Database     │
            └─────────────────┘
```

## 2. Meeting Creation Flow

```
User Action                 Frontend                Backend              Database
    │                          │                       │                    │
    │  Click "Create Meeting"  │                       │                    │
    ├─────────────────────────►│                       │                    │
    │                          │                       │                    │
    │                          │  POST /create-meeting │                    │
    │                          ├──────────────────────►│                    │
    │                          │                       │                    │
    │                          │                       │  Save Meeting      │
    │                          │                       ├───────────────────►│
    │                          │                       │                    │
    │                          │                       │  Return Meeting    │
    │                          │                       │◄───────────────────┤
    │                          │                       │                    │
    │                          │  { roomId, ... }      │                    │
    │                          │◄──────────────────────┤                    │
    │                          │                       │                    │
    │  Navigate to /call/:id   │                       │                    │
    │◄─────────────────────────┤                       │                    │
    │                          │                       │                    │
```

## 3. WebRTC Connection Establishment

```
Doctor (User A)              Server              Patient (User B)
      │                        │                        │
      │  join-room             │                        │
      ├───────────────────────►│                        │
      │                        │                        │
      │  Initialize Media      │                        │
      │  (camera + mic)        │                        │
      │                        │                        │
      │                        │  join-room             │
      │                        │◄───────────────────────┤
      │                        │                        │
      │  user-joined           │                        │
      │◄───────────────────────┤                        │
      │                        │                        │
      │  Create Offer          │                        │
      │                        │                        │
      │  offer                 │                        │
      ├───────────────────────►│                        │
      │                        │  offer                 │
      │                        ├───────────────────────►│
      │                        │                        │
      │                        │  Create Answer         │
      │                        │                        │
      │                        │  answer                │
      │                        │◄───────────────────────┤
      │  answer                │                        │
      │◄───────────────────────┤                        │
      │                        │                        │
      │  ICE Candidates        │  ICE Candidates        │
      │◄──────────────────────►│◄──────────────────────►│
      │                        │                        │
      │                                                 │
      │◄═══════════════════════════════════════════════►│
      │         P2P Connection Established              │
      │         (Video + Audio Streaming)               │
      │                                                 │
```

## 4. ICE Candidate Exchange

```
Peer A                    STUN Server              Peer B
  │                            │                      │
  │  Discover Public IP        │                      │
  ├───────────────────────────►│                      │
  │                            │                      │
  │  Public IP: 1.2.3.4:5678   │                      │
  │◄───────────────────────────┤                      │
  │                            │                      │
  │                            │  Discover Public IP  │
  │                            │◄─────────────────────┤
  │                            │                      │
  │                            │  Public IP: 5.6.7.8  │
  │                            ├─────────────────────►│
  │                            │                      │
  │  Send ICE Candidate        │                      │
  │  (via signaling server)    │                      │
  ├────────────────────────────┼─────────────────────►│
  │                            │                      │
  │                            │  Send ICE Candidate  │
  │◄────────────────────────────┼─────────────────────┤
  │                            │                      │
  │  Try Direct Connection     │                      │
  │◄═══════════════════════════════════════════════════►│
  │                            │                      │
```

## 5. Call State Machine

```
                    ┌──────────┐
                    │   NEW    │
                    └────┬─────┘
                         │
                         │ initializeMedia()
                         ▼
                  ┌─────────────┐
                  │ CONNECTING  │
                  └──────┬──────┘
                         │
                         │ createPeerConnection()
                         ▼
                  ┌─────────────┐
                  │   WAITING   │◄──────┐
                  └──────┬──────┘       │
                         │              │
                         │ user-joined  │ reconnecting
                         ▼              │
                  ┌─────────────┐       │
                  │   CALLING   │───────┘
                  └──────┬──────┘
                         │
                         │ connection established
                         ▼
                  ┌─────────────┐
                  │  CONNECTED  │
                  └──────┬──────┘
                         │
                         │ end-call / user-left
                         ▼
                  ┌─────────────┐
                  │    ENDED    │
                  └─────────────┘
```

## 6. Socket.io Event Flow

```
Client A                    Server                    Client B
   │                           │                          │
   │  emit: join-room          │                          │
   ├──────────────────────────►│                          │
   │                           │                          │
   │                           │  Store in room           │
   │                           │                          │
   │                           │  emit: user-joined       │
   │                           ├─────────────────────────►│
   │                           │                          │
   │  emit: offer              │                          │
   ├──────────────────────────►│                          │
   │                           │  emit: offer             │
   │                           ├─────────────────────────►│
   │                           │                          │
   │                           │  emit: answer            │
   │                           │◄─────────────────────────┤
   │  emit: answer             │                          │
   │◄──────────────────────────┤                          │
   │                           │                          │
   │  emit: ice-candidate      │                          │
   ├──────────────────────────►│                          │
   │                           │  emit: ice-candidate     │
   │                           ├─────────────────────────►│
   │                           │                          │
   │                           │  emit: ice-candidate     │
   │                           │◄─────────────────────────┤
   │  emit: ice-candidate      │                          │
   │◄──────────────────────────┤                          │
   │                           │                          │
```

## 7. Chat Message Flow

```
User A                    Frontend A              Server              Frontend B              User B
  │                           │                      │                      │                    │
  │  Type message             │                      │                      │                    │
  ├──────────────────────────►│                      │                      │                    │
  │                           │                      │                      │                    │
  │  Click send               │                      │                      │                    │
  ├──────────────────────────►│                      │                      │                    │
  │                           │                      │                      │                    │
  │                           │  emit: chat-message  │                      │                    │
  │                           ├─────────────────────►│                      │                    │
  │                           │                      │                      │                    │
  │                           │                      │  broadcast to room   │                    │
  │                           │                      ├─────────────────────►│                    │
  │                           │                      │                      │                    │
  │                           │  on: chat-message    │                      │  on: chat-message  │
  │                           │◄─────────────────────┤                      │◄───────────────────┤
  │                           │                      │                      │                    │
  │  Display message          │                      │                      │  Display message   │
  │◄──────────────────────────┤                      │                      ├───────────────────►│
  │                           │                      │                      │                    │
```

## 8. Screen Sharing Flow

```
User                    Frontend                WebRTC              Remote User
  │                        │                       │                      │
  │  Click share screen    │                       │                      │
  ├───────────────────────►│                       │                      │
  │                        │                       │                      │
  │                        │  getDisplayMedia()    │                      │
  │                        ├──────────────────────►│                      │
  │                        │                       │                      │
  │  Select screen         │                       │                      │
  ├───────────────────────►│                       │                      │
  │                        │                       │                      │
  │                        │  Screen stream        │                      │
  │                        │◄──────────────────────┤                      │
  │                        │                       │                      │
  │                        │  replaceTrack()       │                      │
  │                        ├──────────────────────►│                      │
  │                        │                       │                      │
  │                        │                       │  Screen stream       │
  │                        │                       ├─────────────────────►│
  │                        │                       │                      │
  │                        │                       │  Display screen      │
  │                        │                       │                      │
  │  Click stop sharing    │                       │                      │
  ├───────────────────────►│                       │                      │
  │                        │                       │                      │
  │                        │  replaceTrack()       │                      │
  │                        │  (back to camera)     │                      │
  │                        ├──────────────────────►│                      │
  │                        │                       │                      │
  │                        │                       │  Camera stream       │
  │                        │                       ├─────────────────────►│
  │                        │                       │                      │
```

## 9. Error Handling Flow

```
                    ┌──────────────┐
                    │  User Action │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  Try Action  │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │   Success?   │
                    └──┬────────┬──┘
                       │        │
                   Yes │        │ No
                       │        │
                       ▼        ▼
              ┌─────────────┐  ┌──────────────┐
              │  Continue   │  │ Catch Error  │
              └─────────────┘  └──────┬───────┘
                                      │
                                      ▼
                              ┌───────────────┐
                              │ Log Error     │
                              └───────┬───────┘
                                      │
                                      ▼
                              ┌───────────────┐
                              │ Show User     │
                              │ Friendly Msg  │
                              └───────┬───────┘
                                      │
                                      ▼
                              ┌───────────────┐
                              │ Retry Logic?  │
                              └───┬───────┬───┘
                                  │       │
                              Yes │       │ No
                                  │       │
                                  ▼       ▼
                          ┌──────────┐  ┌──────────┐
                          │  Retry   │  │  Fail    │
                          └──────────┘  │ Graceful │
                                        └──────────┘
```

## 10. Database Operations

```
API Request              Controller              Model              MongoDB
    │                        │                      │                   │
    │  POST /create-meeting  │                      │                   │
    ├───────────────────────►│                      │                   │
    │                        │                      │                   │
    │                        │  Validate Input      │                   │
    │                        │                      │                   │
    │                        │  Meeting.create()    │                   │
    │                        ├─────────────────────►│                   │
    │                        │                      │                   │
    │                        │                      │  insertOne()      │
    │                        │                      ├──────────────────►│
    │                        │                      │                   │
    │                        │                      │  Document         │
    │                        │                      │◄──────────────────┤
    │                        │                      │                   │
    │                        │  Meeting Object      │                   │
    │                        │◄─────────────────────┤                   │
    │                        │                      │                   │
    │  { success, data }     │                      │                   │
    │◄───────────────────────┤                      │                   │
    │                        │                      │                   │
```

## 11. Component Hierarchy

```
App
 │
 ├─ Router
 │   │
 │   ├─ Home
 │   │   └─ Create/Join Meeting Form
 │   │
 │   └─ VideoCall
 │       │
 │       ├─ useSocket (hook)
 │       │
 │       ├─ useWebRTC (hook)
 │       │
 │       ├─ WaitingRoom
 │       │   └─ Loading Indicator
 │       │
 │       ├─ VideoStream (Local)
 │       │   ├─ Video Element
 │       │   └─ User Info Overlay
 │       │
 │       ├─ VideoStream (Remote)
 │       │   ├─ Video Element
 │       │   └─ User Info Overlay
 │       │
 │       ├─ VideoControls
 │       │   ├─ Mute Button
 │       │   ├─ Video Button
 │       │   ├─ Screen Share Button
 │       │   ├─ Chat Button
 │       │   └─ End Call Button
 │       │
 │       └─ ChatPanel (conditional)
 │           ├─ Message List
 │           ├─ Message Input
 │           └─ Send Button
```

## 12. Data Flow in Application

```
┌─────────────────────────────────────────────────────────────┐
│                         User Action                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    React Component                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Event Handler (onClick, onChange, etc.)             │   │
│  └────────────────────┬─────────────────────────────────┘   │
└───────────────────────┼─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    Custom Hook                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  useWebRTC / useSocket                               │   │
│  │  - Business Logic                                    │   │
│  │  - State Management                                  │   │
│  └────────────────────┬─────────────────────────────────┘   │
└───────────────────────┼─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    API / Socket                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  HTTP Request / Socket Event                         │   │
│  └────────────────────┬─────────────────────────────────┘   │
└───────────────────────┼─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend Server                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Route Handler / Socket Handler                      │   │
│  └────────────────────┬─────────────────────────────────┘   │
└───────────────────────┼─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  MongoDB Query                                        │   │
│  └────────────────────┬─────────────────────────────────┘   │
└───────────────────────┼─────────────────────────────────────┘
                        │
                        │ (Response flows back up)
                        ▼
```

## Legend

```
─────►  Unidirectional flow
◄─────►  Bidirectional flow
═════►  P2P connection (WebRTC)
┌────┐  Component/System
│    │
└────┘
```

## Notes

- **P2P Connection**: Video and audio streams flow directly between peers, not through the server
- **Signaling**: Only connection setup messages go through the server
- **STUN/TURN**: Used for NAT traversal when direct connection isn't possible
- **Socket.io**: Provides reliable, real-time bidirectional communication
- **MongoDB**: Stores meeting metadata, not media streams

## Performance Considerations

1. **Media Streams**: Never pass through server (P2P)
2. **Signaling**: Minimal data, only during connection setup
3. **Chat**: Small text messages, negligible bandwidth
4. **Database**: Only metadata, not real-time data

This architecture ensures:
- Low latency for video/audio
- Scalable signaling server
- Minimal server bandwidth usage
- High-quality peer-to-peer communication
