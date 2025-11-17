# Debug Guide - Waiting Room Issue

## Quick Debug Steps

### Step 1: Check Backend Console
When both users join, you should see:
```
User <name> (<type>) joined room: room-appt-123
User <name> (<type>) joined room: room-appt-123
```

If you only see ONE message, the second user isn't connecting.

### Step 2: Check Browser Console (F12)

**Browser 1 should show:**
```
Socket connected: <socket-id>
Initialization complete
User joined room: room-appt-123
Current users in room: [{userId: "user-xxx", ...}]
User joined: <other-user-name>
Received offer from: <socket-id>
```

**Browser 2 should show:**
```
Socket connected: <socket-id>
Initialization complete
User joined room: room-appt-123
Current users in room: [{userId: "user-xxx", ...}, {userId: "user-yyy", ...}]
Received answer
```

### Step 3: Check Network Tab (F12 → Network)

Look for:
- ✅ WebSocket connection (status 101)
- ✅ Socket.io polling requests (status 200)

### Step 4: Add Console Logs

Open `frontend/src/components/VideoCall/VideoCall.jsx` and add this after line 18:

```javascript
console.log('VideoCall render:', {
  userId,
  userName,
  userType,
  hasRemoteUser,
  isConnected,
  remoteUserInfo
});
```

This will show you what's happening on each render.

---

## Common Issues

### Issue 1: Both users have same userId
**Check:** Browser console should show DIFFERENT userIds
```
Browser 1: userId: "user-abc123"
Browser 2: userId: "user-xyz789"
```

If they're the same, the App.jsx fix didn't apply.

**Solution:** Hard refresh both browsers (Ctrl+Shift+R)

### Issue 2: Socket not connecting
**Check:** Browser console for "Socket connected"

**Solution:**
1. Check backend is running
2. Check frontend/.env has correct VITE_SOCKET_URL
3. Restart both servers

### Issue 3: Users in different rooms
**Check:** Both browsers should have the SAME roomId in URL

**Solution:** Make sure Browser 2 enters the correct appointment ID

---

## Manual Test Commands

### Check if users are in the same room (Backend)
Add this to `backend/socket/signalingServer.js` after line 10:
```javascript
console.log('Current rooms:', Array.from(rooms.keys()));
console.log('Users in rooms:', Array.from(rooms.entries()).map(([room, users]) => ({
  room,
  userCount: users.size,
  users: Array.from(users.values())
})));
```

---

## Quick Fix: Force Connection

If debugging doesn't help, try this temporary fix in `VideoCall.jsx`:

Replace line 19:
```javascript
const [hasRemoteUser, setHasRemoteUser] = useState(false);
```

With:
```javascript
const [hasRemoteUser, setHasRemoteUser] = useState(true); // Force show call UI
```

This will skip the waiting room and show the call UI immediately.

---

## What to Check

1. **Backend logs** - Are both users joining?
2. **Browser console** - Any errors?
3. **Network tab** - Is WebSocket connected?
4. **User IDs** - Are they different?
5. **Room IDs** - Are they the same?

---

## Next Steps

Please check the browser console (F12) and share:
1. Any error messages
2. The console.log output when both users join
3. The Network tab WebSocket status

This will help me identify the exact issue!
