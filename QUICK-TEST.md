# ⚡ Quick Test Guide - Two Users

## The Fix
✅ Each browser now gets a **unique user ID** automatically!

## Test in 3 Minutes

### 🖥️ Browser 1 (Chrome)
```
1. Open: http://localhost:5173
2. Click: "Create New Meeting"
3. Grant: Camera + Microphone permissions
4. See: Waiting room
5. Copy: The appointment ID from URL
   Example: room-appt-1731849600000
   Copy just: appt-1731849600000
```

### 🖥️ Browser 2 (Incognito or Firefox)
```
1. Open: http://localhost:5173
2. Paste: appt-1731849600000 (the ID you copied)
3. Click: "Join Existing Meeting"
4. Grant: Camera + Microphone permissions
5. See: Video call starts!
```

### ✅ Success!
Both browsers should now show:
- Your own video
- The other person's video
- "Connected" status
- Call controls working

---

## Copy-Paste Example

### Step 1: Browser 1 creates meeting
URL will be something like:
```
http://localhost:5173/call/room-appt-1731849600000
```

### Step 2: Copy just the appointment ID
```
appt-1731849600000
```

### Step 3: Browser 2 pastes and joins
Paste `appt-1731849600000` in the input field and click "Join"

---

## What You Should See

### Browser 1 (Before Browser 2 joins):
```
┌─────────────────────────────┐
│   Waiting for patient...    │
│                             │
│   [Your video preview]      │
│                             │
│   You're in the waiting     │
│   room. Call will start     │
│   when other user joins.    │
└─────────────────────────────┘
```

### Both Browsers (After joining):
```
┌──────────────┬──────────────┐
│ Remote Video │ Your Video   │
│              │              │
│ [Other user] │ [You]        │
│              │              │
└──────────────┴──────────────┘
     [Mute] [Camera] [Share] [Chat] [End]
```

---

## Troubleshooting

### Problem: Both still showing waiting room
**Solution:** Make sure you're using **different browsers** or **incognito mode**

### Problem: "Cannot connect"
**Solution:** 
1. Check backend is running: `cd backend && npm run dev`
2. Check frontend is running: `cd frontend && npm run dev`
3. Restart both servers

### Problem: "Permission denied"
**Solution:** Click "Allow" for camera and microphone in BOTH browsers

---

## Quick Commands

### Start Backend:
```bash
cd backend
npm run dev
```

### Start Frontend:
```bash
cd frontend
npm run dev
```

### Test Backend:
```bash
curl http://localhost:5000/health
```

---

## That's It!

The system now automatically:
- ✅ Generates unique user IDs
- ✅ Assigns random names
- ✅ Assigns random user types (doctor/patient)
- ✅ Connects users in the same room

**Just create and join - it works!** 🎉

---

**More details:** See [TWO-USER-TEST.md](TWO-USER-TEST.md)
