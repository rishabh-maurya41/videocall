# Testing with Two Users - Fixed! ✅

## Problem Solved
Both browsers were showing the same user, so the system thought only one person was in the room. Now each browser gets a unique user ID automatically!

## How to Test (Simple Method)

### Step 1: Create Meeting (Browser 1)
1. Open **Chrome** (normal window)
2. Go to: **http://localhost:5173**
3. Click **"Create New Meeting"**
4. You'll see a **waiting room** (this is normal!)
5. **Copy the URL** - it looks like: `http://localhost:5173/call/room-appt-1234567890`

### Step 2: Join Meeting (Browser 2)
1. Open **Chrome Incognito** (Ctrl+Shift+N) or **Firefox**
2. Go to: **http://localhost:5173**
3. Look at the URL from Browser 1 and find the appointment ID
   - Example URL: `http://localhost:5173/call/room-appt-1234567890`
   - Appointment ID is: `appt-1234567890`
4. Enter **just the appointment ID** in the input field: `appt-1234567890`
5. Click **"Join Existing Meeting"**

### Step 3: Grant Permissions
Both browsers will ask for camera and microphone:
- Click **"Allow"** ✅

### Step 4: Video Call Starts!
- ✅ Browser 1 should now see Browser 2's video
- ✅ Browser 2 should see Browser 1's video
- ✅ Both should show "Connected" status
- ✅ Call duration timer starts

---

## Alternative: Use URL Parameters (Advanced)

You can also specify user details in the URL:

### Browser 1 (Doctor):
```
http://localhost:5173/call/room-test-123?userName=Dr.Smith&userType=doctor
```

### Browser 2 (Patient):
```
http://localhost:5173/call/room-test-123?userName=John&userType=patient
```

Both will join the same room with different identities!

---

## What Was Fixed

### Before:
```javascript
// Everyone had the same ID
const userId = 'user-123';
const userName = 'Dr. Smith';
const userType = 'doctor';
```

### After:
```javascript
// Each browser gets a unique ID
const userId = `user-${Math.random().toString(36).substr(2, 9)}`;
const userName = `User ${Math.floor(Math.random() * 1000)}`;
const userType = Math.random() > 0.5 ? 'doctor' : 'patient';
```

---

## Quick Test Checklist

- [ ] Browser 1: Create meeting → See waiting room
- [ ] Browser 2: Join meeting → See waiting room briefly
- [ ] Both: Grant camera/mic permissions
- [ ] Both: See each other's video ✅
- [ ] Both: See "Connected" status ✅
- [ ] Both: See different user names in video streams
- [ ] Test: Mute audio in Browser 1
- [ ] Test: Turn off camera in Browser 2
- [ ] Test: Open chat and send messages
- [ ] Test: End call from Browser 1

---

## Troubleshooting

### "Still showing waiting room on both"
**Check backend console** - you should see:
```
User <name> (doctor/patient) joined room: room-appt-123
User <name> (doctor/patient) joined room: room-appt-123
```

If you only see ONE join message, the second browser didn't connect.

**Solution:**
1. Check browser console (F12) for errors
2. Make sure Socket.io is connecting
3. Restart both servers

### "Can't see the other person's video"
1. Check both browsers granted camera permissions
2. Open browser console (F12) and look for errors
3. Check Network tab for WebSocket connection (status 101)
4. Make sure both are in the SAME room ID

### "Socket not connecting"
**Browser console should show:**
```
Socket connected: <socket-id>
User joined room: room-appt-123
```

If not:
1. Check backend is running on port 5000
2. Check frontend/.env has correct VITE_SOCKET_URL
3. Clear browser cache and refresh

---

## Visual Guide

```
Browser 1 (Chrome)                    Browser 2 (Incognito/Firefox)
─────────────────                     ──────────────────────────────

1. Create Meeting                     1. Go to home page
   ↓                                     ↓
2. See waiting room                   2. Enter appointment ID
   "Waiting for patient..."              ↓
   ↓                                  3. Click "Join Meeting"
3. Copy room ID                          ↓
   ↓                                  4. Grant permissions
4. Wait...                               ↓
   ↓                                  5. Connecting...
5. Other user joins!                     ↓
   ↓                                  6. Connected!
6. Video call starts! ✅              7. Video call starts! ✅

Both see each other's video
Both can chat, share screen, etc.
```

---

## Example Test Flow

### Browser 1 (Chrome):
```
1. Open http://localhost:5173
2. Click "Create New Meeting"
3. URL becomes: http://localhost:5173/call/room-appt-1731849600000
4. Grant camera/mic permissions
5. See waiting room: "Waiting for patient to join..."
6. Wait for Browser 2...
```

### Browser 2 (Incognito):
```
1. Open http://localhost:5173
2. Enter: appt-1731849600000
3. Click "Join Existing Meeting"
4. Grant camera/mic permissions
5. See waiting room briefly
6. Connection established!
```

### Both Browsers:
```
✅ See each other's video
✅ See "Connected" status
✅ Can chat, mute, share screen
✅ Call duration timer running
```

---

## Backend Logs to Check

When both users join, you should see:
```
User User 123 (doctor) joined room: room-appt-1731849600000
User User 456 (patient) joined room: room-appt-1731849600000
Offer sent in room room-appt-1731849600000
Answer sent in room room-appt-1731849600000
```

---

## Success! 🎉

If you can see both video streams, the system is working perfectly!

**Next:** Test all features (mute, camera, screen share, chat, end call)

---

## Need Help?

- **RESTART-GUIDE.md** - How to restart servers
- **TESTING.md** - Comprehensive testing guide
- **FAQ.md** - Common questions

**Happy testing!** 🚀
