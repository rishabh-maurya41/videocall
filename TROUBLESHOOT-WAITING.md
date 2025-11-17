# Troubleshooting: Stuck on Waiting Room

## I've Added Debug Logging!

The code now has detailed console logging to help us figure out what's happening.

## Steps to Debug

### 1. Restart Frontend
```bash
# Stop frontend (Ctrl+C)
cd frontend
npm run dev
```

### 2. Open Browser Console (F12)

**Browser 1 (Create Meeting):**
1. Open http://localhost:5173
2. Open Console (F12)
3. Click "Create New Meeting"

**You should see:**
```
🎭 VideoCallWrapper - Generated user info: {userId: "user-abc123", ...}
VideoCall render: {userId: "user-abc123", hasRemoteUser: false, ...}
Socket connected: <socket-id>
📋 Current users in room: [{userId: "user-abc123", ...}]
📋 My userId: user-abc123
📋 Users count: 1
⏳ Only one user in room, waiting...
```

**Browser 2 (Join Meeting):**
1. Open http://localhost:5173 (incognito)
2. Open Console (F12)
3. Enter appointment ID and join

**You should see:**
```
🎭 VideoCallWrapper - Generated user info: {userId: "user-xyz789", ...}
VideoCall render: {userId: "user-xyz789", hasRemoteUser: false, ...}
Socket connected: <socket-id>
📋 Current users in room: [{userId: "user-abc123", ...}, {userId: "user-xyz789", ...}]
📋 My userId: user-xyz789
📋 Users count: 2
✅ Multiple users detected, setting hasRemoteUser = true
✅ Found other user: {userId: "user-abc123", ...}
```

**Browser 1 should then show:**
```
👤 User joined: User 789
👤 Joined userId: user-xyz789
👤 My userId: user-abc123
👤 Are they different? true
✅ Different user! Setting hasRemoteUser = true
📞 Creating offer for: <socket-id>
```

---

## What to Look For

### ✅ Good Signs:
- Different userIds in each browser
- "Multiple users detected" message
- "Different user! Setting hasRemoteUser = true"
- "Creating offer for:" message

### ❌ Bad Signs:
- Same userId in both browsers
- "Only one user in room" in both browsers
- No "user-joined" event
- Socket connection errors

---

## Common Problems & Solutions

### Problem 1: Same userId in both browsers
**Console shows:**
```
Browser 1: userId: "user-abc123"
Browser 2: userId: "user-abc123"  ← SAME!
```

**Solution:**
1. Hard refresh both browsers (Ctrl+Shift+R)
2. Clear browser cache
3. Try different browsers (Chrome + Firefox)

### Problem 2: Only one user in room
**Console shows:**
```
📋 Users count: 1
⏳ Only one user in room, waiting...
```

**Possible causes:**
- Backend not running
- Socket not connecting
- Different room IDs

**Solution:**
1. Check backend console for "User joined" messages
2. Check both browsers have same roomId in URL
3. Check Network tab for WebSocket connection (status 101)

### Problem 3: No socket connection
**Console shows:**
```
Socket connection error: ...
```

**Solution:**
1. Check backend is running on port 5000
2. Check frontend/.env has `VITE_SOCKET_URL=http://localhost:5000`
3. Restart both servers

### Problem 4: Users in different rooms
**Check URLs:**
```
Browser 1: http://localhost:5173/call/room-appt-123
Browser 2: http://localhost:5173/call/room-appt-456  ← DIFFERENT!
```

**Solution:**
Make sure Browser 2 enters the correct appointment ID from Browser 1

---

## Backend Check

**Backend console should show:**
```
User User 123 (doctor) joined room: room-appt-1234567890
User User 456 (patient) joined room: room-appt-1234567890
```

If you only see ONE line, the second user didn't connect.

---

## Quick Test

### Test 1: Check User IDs
Open both browsers and check console:
```
Browser 1: userId: "user-abc123"
Browser 2: userId: "user-xyz789"
```
They MUST be different!

### Test 2: Check Room IDs
Check URLs in both browsers:
```
Browser 1: /call/room-appt-1234567890
Browser 2: /call/room-appt-1234567890
```
They MUST be the same!

### Test 3: Check Socket Connection
Both browsers should show:
```
Socket connected: <socket-id>
```

### Test 4: Check Users Count
Browser 2 should show:
```
📋 Users count: 2
✅ Multiple users detected
```

---

## Still Not Working?

### Share These Logs

Please share the console output from both browsers:

**Browser 1:**
```
[Paste console output here]
```

**Browser 2:**
```
[Paste console output here]
```

**Backend:**
```
[Paste backend console output here]
```

This will help me identify the exact issue!

---

## Emergency Fix

If nothing works, try this temporary fix:

In `frontend/src/components/VideoCall/VideoCall.jsx`, line 19, change:
```javascript
const [hasRemoteUser, setHasRemoteUser] = useState(false);
```

To:
```javascript
const [hasRemoteUser, setHasRemoteUser] = useState(true);
```

This will skip the waiting room entirely and show the call UI immediately.

---

## Next Steps

1. Restart frontend
2. Open browser console (F12) in both browsers
3. Follow the test steps above
4. Share the console output if still not working

The debug logs will tell us exactly what's happening! 🔍
