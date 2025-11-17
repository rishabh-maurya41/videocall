# Frequently Asked Questions (FAQ)

## General Questions

### Q: What is WebRTC?
**A:** WebRTC (Web Real-Time Communication) is a technology that enables peer-to-peer audio, video, and data sharing between browsers without requiring plugins or third-party software.

### Q: Do I need to pay for any external services?
**A:** No! This solution uses:
- Free Google STUN servers
- Self-hosted signaling server
- Your own MongoDB database
- Optional: Self-hosted TURN server (Coturn) for production

### Q: How many participants can join a call?
**A:** Currently supports 1-to-1 calls (doctor-patient). For multi-party calls, you'd need to implement a mesh or SFU (Selective Forwarding Unit) architecture.

### Q: Is the video call encrypted?
**A:** Yes! WebRTC uses DTLS-SRTP for end-to-end encryption of media streams. The video and audio never pass through your server unencrypted.

### Q: What's the difference between STUN and TURN servers?
**A:** 
- **STUN**: Helps discover your public IP address for direct peer-to-peer connections
- **TURN**: Relays media when direct connection fails (behind strict NATs/firewalls)

## Technical Questions

### Q: Why use Socket.io for signaling?
**A:** Socket.io provides:
- Real-time bidirectional communication
- Automatic reconnection
- Fallback to long-polling
- Room management
- Easy event-based architecture

### Q: Can I use this with React Native?
**A:** Yes, but you'll need to:
- Use `react-native-webrtc` library
- Adapt the Socket.io client for React Native
- Handle mobile-specific permissions
- Test on both iOS and Android

### Q: How do I scale this for thousands of users?
**A:** For large scale:
1. Use Redis adapter for Socket.io (multi-server support)
2. Implement load balancing with sticky sessions
3. Consider using a media server (Janus, Kurento, Mediasoup)
4. Use CDN for static assets
5. Horizontal scaling with Kubernetes

### Q: Can I record the video calls?
**A:** Yes, you can implement recording by:
1. Using MediaRecorder API (client-side)
2. Server-side recording with FFmpeg
3. Third-party services (AWS Kinesis Video Streams)

### Q: How much bandwidth does a video call use?
**A:** Approximate bandwidth per participant:
- Audio only: 50-100 Kbps
- Video (360p): 500 Kbps - 1 Mbps
- Video (720p): 1.5 - 3 Mbps
- Screen sharing: 500 Kbps - 2 Mbps

### Q: What happens if one user has poor internet?
**A:** WebRTC automatically:
- Adjusts video quality (adaptive bitrate)
- Prioritizes audio over video
- May drop video frames to maintain audio
- Uses TURN relay if direct connection fails

## Setup & Installation

### Q: I get "Cannot find module" errors
**A:** Make sure you've installed dependencies:
```bash
cd backend && npm install
cd ../frontend && npm install
```

### Q: MongoDB connection fails
**A:** Check:
1. MongoDB is running: `mongod` or `sudo systemctl status mongod`
2. Connection string in `.env` is correct
3. MongoDB port (27017) is not blocked
4. For MongoDB Atlas, check IP whitelist

### Q: Frontend can't connect to backend
**A:** Verify:
1. Backend is running on port 5000
2. `VITE_SOCKET_URL` in frontend/.env is correct
3. CORS is configured properly
4. Firewall allows connections

### Q: "Permission denied" for camera/microphone
**A:** 
1. Click lock icon in browser address bar
2. Allow camera and microphone
3. Refresh the page
4. In production, HTTPS is required for permissions

## Usage Questions

### Q: How do I integrate this with my existing portal?
**A:** 
1. Replace hardcoded user info in `App.jsx` with your auth system
2. Call `/api/create-meeting` when scheduling appointments
3. Link Meeting model with your Appointment model
4. Customize UI to match your brand
5. Add authentication middleware to API routes

### Q: Can patients join without creating an account?
**A:** Yes, you can implement guest access by:
1. Generating temporary user IDs
2. Allowing join with just a name
3. Storing minimal info in session
4. Cleaning up after call ends

### Q: How do I notify users when a call starts?
**A:** Implement notifications using:
1. Email notifications (Nodemailer)
2. SMS notifications (Twilio)
3. Push notifications (Firebase Cloud Messaging)
4. In-app notifications (Socket.io events)

### Q: Can I customize the video layout?
**A:** Yes! The UI is built with React and Tailwind CSS. You can:
- Change grid layout in `VideoCall.jsx`
- Modify colors in Tailwind config
- Add picture-in-picture mode
- Implement custom layouts (spotlight, grid, etc.)

## Troubleshooting

### Q: Video is black/not showing
**A:** Check:
1. Camera is not being used by another app
2. Browser has camera permission
3. Video track is enabled: `stream.getVideoTracks()[0].enabled`
4. Video element has correct srcObject
5. Try different browser

### Q: No audio in call
**A:** Check:
1. Microphone is not muted in system settings
2. Browser has microphone permission
3. Audio track is enabled
4. Remote user's speakers are working
5. Check browser console for errors

### Q: "ICE connection failed"
**A:** This usually means:
1. STUN server is unreachable (check firewall)
2. Both users are behind strict NAT (need TURN server)
3. Network blocks WebRTC traffic
4. Try different network or use VPN

### Q: Socket keeps disconnecting
**A:** Check:
1. Backend server is stable
2. Network connection is stable
3. No proxy/firewall blocking WebSocket
4. Increase Socket.io timeout settings
5. Check server logs for errors

### Q: Screen sharing not working
**A:** 
1. Only works on HTTPS (or localhost)
2. User must grant permission
3. Some browsers require user gesture (button click)
4. Check browser compatibility
5. Try different screen/window

### Q: Chat messages not appearing
**A:** Verify:
1. Socket connection is established
2. Both users are in same room
3. Check browser console for errors
4. Verify socket events are being emitted
5. Check backend logs

### Q: High CPU usage during call
**A:** Optimize by:
1. Reducing video resolution
2. Lowering frame rate
3. Disabling video when not needed
4. Closing other browser tabs
5. Using hardware acceleration

### Q: Call quality is poor
**A:** Improve by:
1. Close bandwidth-heavy apps
2. Use wired connection instead of WiFi
3. Reduce video quality
4. Check network speed (need 2+ Mbps)
5. Use TURN server if behind NAT

## Security Questions

### Q: Is this HIPAA compliant?
**A:** To be HIPAA compliant, you need:
1. Business Associate Agreement (BAA) with hosting provider
2. End-to-end encryption (WebRTC provides this)
3. Access controls and authentication
4. Audit logging
5. Data encryption at rest
6. Regular security audits
7. Consult with legal/compliance team

### Q: How do I add authentication?
**A:** Implement JWT authentication:
```javascript
// Backend middleware
const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Protect routes
app.use('/api', authenticate);
```

### Q: Can someone join a call without permission?
**A:** Currently, anyone with the room ID can join. To prevent this:
1. Implement authentication
2. Add waiting room with approval
3. Generate one-time join tokens
4. Verify user against appointment records
5. Add password protection

### Q: How do I prevent unauthorized access?
**A:** 
1. Implement user authentication
2. Validate room access permissions
3. Use short-lived room IDs
4. Add rate limiting
5. Monitor for suspicious activity
6. Implement IP whitelisting if needed

## Performance Questions

### Q: How many concurrent calls can my server handle?
**A:** Depends on:
- Server resources (CPU, RAM)
- Network bandwidth
- Database performance
- Typically: 100-500 concurrent calls per server
- Use load balancing for more

### Q: Does video go through my server?
**A:** No! WebRTC is peer-to-peer. Only signaling messages go through your server. This means:
- Lower server bandwidth costs
- Better video quality
- Lower latency
- More privacy

### Q: How do I optimize for mobile?
**A:** 
1. Reduce video resolution on mobile
2. Implement adaptive bitrate
3. Optimize bundle size
4. Use lazy loading
5. Test on actual devices
6. Handle orientation changes
7. Manage battery usage

## Deployment Questions

### Q: Can I deploy this on shared hosting?
**A:** Not recommended. You need:
- Node.js support
- WebSocket support
- MongoDB access
- Sufficient resources
- Use VPS (DigitalOcean, AWS, etc.) instead

### Q: Do I need a TURN server?
**A:** 
- **Development**: No, STUN is enough
- **Production**: Yes, recommended for users behind strict NATs/firewalls
- About 10-20% of connections need TURN

### Q: How much does it cost to run?
**A:** Approximate monthly costs:
- VPS (DigitalOcean): $5-20
- MongoDB Atlas (free tier): $0
- Domain + SSL: $10-15
- TURN server: Included in VPS
- **Total**: $15-35/month for small scale

### Q: Can I use serverless (AWS Lambda)?
**A:** Challenging because:
- Lambda has 15-minute timeout
- WebSocket support is limited
- Better to use:
  - AWS Fargate for containers
  - AWS EC2 for traditional VPS
  - AWS ECS for orchestration

## Feature Requests

### Q: Can you add virtual backgrounds?
**A:** Yes! You can implement using:
- TensorFlow.js for body segmentation
- Canvas API for background replacement
- Pre-built libraries like @tensorflow-models/body-pix

### Q: Can I add call recording?
**A:** Yes, implement using:
```javascript
const mediaRecorder = new MediaRecorder(stream);
const chunks = [];

mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
mediaRecorder.onstop = () => {
  const blob = new Blob(chunks, { type: 'video/webm' });
  // Upload to server or download
};

mediaRecorder.start();
```

### Q: Can I add AI transcription?
**A:** Yes, integrate:
- Google Cloud Speech-to-Text
- AWS Transcribe
- Azure Speech Services
- Web Speech API (browser-based)

### Q: Can I add waiting room?
**A:** Yes, modify the flow:
1. Patient joins waiting room
2. Doctor receives notification
3. Doctor approves entry
4. Patient enters call

## Support

### Q: Where can I get help?
**A:** 
1. Check this FAQ
2. Review TESTING.md for troubleshooting
3. Check browser console for errors
4. Review server logs
5. Open GitHub issue
6. Check WebRTC documentation

### Q: How do I report a bug?
**A:** Include:
1. Steps to reproduce
2. Expected vs actual behavior
3. Browser and version
4. Console errors
5. Network conditions
6. Screenshots/videos if applicable

### Q: Can I contribute?
**A:** Yes! Contributions welcome:
1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## Best Practices

### Q: What are the recommended settings for production?
**A:** 
1. Use HTTPS everywhere
2. Configure TURN server
3. Enable rate limiting
4. Implement authentication
5. Use environment variables
6. Enable logging and monitoring
7. Set up automated backups
8. Use CDN for static assets
9. Implement error tracking
10. Regular security audits

### Q: How often should I update dependencies?
**A:** 
- Security updates: Immediately
- Minor updates: Monthly
- Major updates: Quarterly (with testing)
- Run `npm audit` weekly

### Q: What metrics should I monitor?
**A:** 
1. Connection success rate
2. Average call duration
3. ICE connection failures
4. API response times
5. Server resource usage
6. Error rates
7. User satisfaction scores

## Still Have Questions?

If your question isn't answered here:
1. Check the README.md for setup instructions
2. Review ARCHITECTURE.md for technical details
3. See DEPLOYMENT.md for production setup
4. Read TESTING.md for troubleshooting
5. Open an issue on GitHub

Happy coding! 🚀
