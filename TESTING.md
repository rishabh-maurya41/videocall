# Testing Guide

Comprehensive testing guide for the telehealth video calling system.

## Prerequisites

- Backend running on http://localhost:5000
- Frontend running on http://localhost:5173
- MongoDB running
- Two browsers or devices for testing

## 1. API Testing

### Using cURL

**Create Meeting**
```bash
curl -X POST http://localhost:5000/api/create-meeting \
  -H "Content-Type: application/json" \
  -d '{
    "appointmentId": "appt-123",
    "doctorId": "doctor-456",
    "patientId": "patient-789",
    "scheduledTime": "2024-01-15T10:00:00Z"
  }'
```

**Get Meeting**
```bash
curl http://localhost:5000/api/meeting/room-appt-123
```

**Update Meeting Status**
```bash
curl -X PUT http://localhost:5000/api/meeting/room-appt-123/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "active",
    "startTime": "2024-01-15T10:00:00Z"
  }'
```

### Using Test Script

Make the script executable:
```bash
chmod +x test-api.sh
```

Run tests:
```bash
./test-api.sh
```

## 2. WebRTC Testing

### Basic Connection Test

1. **Open Browser 1 (Doctor)**
   - Navigate to http://localhost:5173
   - Click "Create New Meeting"
   - Note the room ID in URL

2. **Open Browser 2 (Patient)**
   - Navigate to http://localhost:5173
   - Enter the appointment ID
   - Click "Join Existing Meeting"

3. **Verify**
   - Both users should see each other's video
   - Connection status should show "Connected"
   - Call duration timer should start

### Feature Testing Checklist

#### Audio Controls
- [ ] Mute audio on User A
- [ ] Verify mute indicator appears
- [ ] Verify User B cannot hear User A
- [ ] Unmute audio on User A
- [ ] Verify User B can hear User A again

#### Video Controls
- [ ] Turn off camera on User A
- [ ] Verify avatar/placeholder appears
- [ ] Verify User B sees placeholder
- [ ] Turn on camera on User A
- [ ] Verify video resumes

#### Screen Sharing
- [ ] Click screen share on User A
- [ ] Select screen/window to share
- [ ] Verify User B sees shared screen
- [ ] Stop screen sharing
- [ ] Verify camera video resumes

#### Chat
- [ ] Open chat panel on User A
- [ ] Send message from User A
- [ ] Verify message appears on User B
- [ ] Send message from User B
- [ ] Verify message appears on User A
- [ ] Verify timestamps are correct
- [ ] Verify user names/types are correct

#### Call Management
- [ ] End call on User A
- [ ] Verify User B receives "user left" notification
- [ ] Verify User A redirects to home page
- [ ] Verify meeting status updates to "completed"

## 3. Socket.io Testing

### Connection Testing

Open browser console and check for:
```javascript
// Should see these logs
Socket connected: <socket-id>
User joined room: room-appt-123
```

### Event Testing

Test socket events manually in console:
```javascript
// Get socket instance (add to window in development)
const socket = window.socket;

// Test join room
socket.emit('join-room', {
  roomId: 'room-test-123',
  userId: 'user-123',
  userType: 'doctor',
  userName: 'Dr. Smith'
});

// Listen for events
socket.on('user-joined', (data) => {
  console.log('User joined:', data);
});
```

## 4. Error Handling Testing

### Permission Errors

1. **Deny Camera Permission**
   - Block camera in browser settings
   - Try to join call
   - Verify error message appears
   - Verify user-friendly error text

2. **Deny Microphone Permission**
   - Block microphone in browser settings
   - Try to join call
   - Verify error message appears

### Network Errors

1. **Disconnect Backend**
   - Stop backend server
   - Try to create meeting
   - Verify error message: "Failed to connect to server"

2. **Socket Disconnection**
   - During active call, stop backend
   - Verify auto-reconnect attempts
   - Restart backend
   - Verify reconnection succeeds

### ICE Connection Failures

1. **Block STUN Server**
   - Modify firewall to block Google STUN
   - Try to establish connection
   - Verify fallback behavior

## 5. Browser Compatibility Testing

Test on multiple browsers:

| Browser | Version | Video | Audio | Screen Share | Chat |
|---------|---------|-------|-------|--------------|------|
| Chrome  | 90+     | ✓     | ✓     | ✓            | ✓    |
| Firefox | 88+     | ✓     | ✓     | ✓            | ✓    |
| Safari  | 14+     | ✓     | ✓     | ✓            | ✓    |
| Edge    | 90+     | ✓     | ✓     | ✓            | ✓    |

## 6. Mobile Testing

### iOS Safari
- [ ] Camera/microphone permissions
- [ ] Video quality
- [ ] Audio quality
- [ ] Screen orientation changes
- [ ] Background/foreground transitions

### Android Chrome
- [ ] Camera/microphone permissions
- [ ] Video quality
- [ ] Audio quality
- [ ] Screen orientation changes
- [ ] Background/foreground transitions

## 7. Network Condition Testing

### Simulate Poor Network

Use Chrome DevTools:
1. Open DevTools (F12)
2. Go to Network tab
3. Select throttling profile:
   - Fast 3G
   - Slow 3G
   - Offline

### Test Scenarios

1. **High Latency**
   - Set to Slow 3G
   - Verify video continues (may be choppy)
   - Verify audio continues
   - Verify chat messages deliver

2. **Packet Loss**
   - Use network emulation tools
   - Verify graceful degradation
   - Verify reconnection

3. **Bandwidth Limitation**
   - Limit to 1 Mbps
   - Verify video quality adjusts
   - Verify call remains stable

## 8. Load Testing

### Socket.io Load Test

Create multiple connections:
```javascript
// load-test.js
const io = require('socket.io-client');

const NUM_CLIENTS = 100;
const clients = [];

for (let i = 0; i < NUM_CLIENTS; i++) {
  const socket = io('http://localhost:5000');
  
  socket.on('connect', () => {
    console.log(`Client ${i} connected`);
    socket.emit('join-room', {
      roomId: `room-test-${i}`,
      userId: `user-${i}`,
      userType: 'doctor',
      userName: `User ${i}`
    });
  });
  
  clients.push(socket);
}

// Cleanup after 60 seconds
setTimeout(() => {
  clients.forEach(socket => socket.disconnect());
  process.exit(0);
}, 60000);
```

Run:
```bash
node load-test.js
```

### API Load Test

Using Apache Bench:
```bash
ab -n 1000 -c 10 -p meeting.json -T application/json \
  http://localhost:5000/api/create-meeting
```

meeting.json:
```json
{
  "appointmentId": "load-test",
  "doctorId": "doctor-123",
  "patientId": "patient-456"
}
```

## 9. Security Testing

### CORS Testing
```bash
# Should be blocked
curl -H "Origin: http://evil.com" \
  -H "Access-Control-Request-Method: POST" \
  -X OPTIONS http://localhost:5000/api/create-meeting
```

### Input Validation
```bash
# Test with invalid data
curl -X POST http://localhost:5000/api/create-meeting \
  -H "Content-Type: application/json" \
  -d '{
    "appointmentId": "<script>alert(1)</script>",
    "doctorId": "",
    "patientId": null
  }'
```

### Rate Limiting
```bash
# Send 200 requests rapidly
for i in {1..200}; do
  curl -X POST http://localhost:5000/api/create-meeting \
    -H "Content-Type: application/json" \
    -d '{"appointmentId":"test-'$i'","doctorId":"doc","patientId":"pat"}' &
done
```

## 10. Performance Testing

### Metrics to Monitor

1. **Frontend**
   - Time to first video frame
   - Video frame rate (should be 30fps)
   - Audio latency (< 150ms ideal)
   - Memory usage
   - CPU usage

2. **Backend**
   - API response time (< 200ms)
   - Socket connection time (< 100ms)
   - Memory usage
   - CPU usage
   - Database query time

### Chrome Performance Profiling

1. Open DevTools
2. Go to Performance tab
3. Click Record
4. Perform actions (join call, toggle video, etc.)
5. Stop recording
6. Analyze:
   - Long tasks (> 50ms)
   - Memory leaks
   - Excessive re-renders

## 11. Automated Testing

### Unit Tests (Example)

```javascript
// backend/tests/meeting.test.js
const request = require('supertest');
const app = require('../server');

describe('Meeting API', () => {
  it('should create a meeting', async () => {
    const res = await request(app)
      .post('/api/create-meeting')
      .send({
        appointmentId: 'test-123',
        doctorId: 'doctor-456',
        patientId: 'patient-789'
      });
    
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.roomId).toBe('room-test-123');
  });
});
```

### Integration Tests

```javascript
// frontend/tests/VideoCall.test.jsx
import { render, screen } from '@testing-library/react';
import { VideoCall } from '../components/VideoCall/VideoCall';

test('renders video call component', () => {
  render(<VideoCall userId="123" userName="Test" userType="doctor" />);
  expect(screen.getByText(/Video Call/i)).toBeInTheDocument();
});
```

## 12. Regression Testing

Before each release, run through:

1. **Critical Path**
   - Create meeting → Join meeting → Video call → End call

2. **All Features**
   - Audio controls
   - Video controls
   - Screen sharing
   - Chat
   - Connection status

3. **Error Scenarios**
   - Permission denied
   - Network failure
   - Server unavailable

## 13. User Acceptance Testing (UAT)

### Test Scenarios

1. **Doctor schedules appointment**
   - Create meeting via API
   - Receive room ID
   - Share with patient

2. **Patient joins appointment**
   - Receive room ID
   - Navigate to call page
   - Grant permissions
   - Join call

3. **Consultation**
   - Doctor and patient communicate
   - Doctor shares screen (medical records)
   - Use chat for notes
   - End call

### Feedback Collection

- Video quality rating (1-5)
- Audio quality rating (1-5)
- Ease of use (1-5)
- Any issues encountered
- Feature requests

## 14. Continuous Testing

### CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    - uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: |
        cd backend && npm install
        cd ../frontend && npm install
    
    - name: Run backend tests
      run: cd backend && npm test
    
    - name: Run frontend tests
      run: cd frontend && npm test
```

## Troubleshooting Common Issues

### Video Not Showing
- Check camera permissions
- Verify getUserMedia() succeeds
- Check video element srcObject
- Verify peer connection state

### Audio Not Working
- Check microphone permissions
- Verify audio tracks are enabled
- Check audio element muted property
- Test with different browsers

### Connection Fails
- Verify STUN server reachable
- Check ICE candidate gathering
- Verify signaling messages
- Check firewall/NAT settings

### High Latency
- Check network conditions
- Verify TURN server if behind NAT
- Monitor bandwidth usage
- Check server resources

## Conclusion

Regular testing ensures:
- Features work as expected
- Performance remains optimal
- Security vulnerabilities are caught
- User experience is smooth
- Bugs are caught early

Run tests before every deployment!
