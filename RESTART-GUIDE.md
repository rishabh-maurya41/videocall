# Quick Restart Guide 🚀

## Issues Fixed
✅ CORS errors  
✅ Port 6000 unsafe port error  
✅ Environment configuration  

## Restart Instructions

### Step 1: Stop Everything
In all terminal windows, press:
```
Ctrl + C
```

### Step 2: Start Backend
```bash
cd backend
npm run dev
```

**Wait for:**
```
Server running on port 5000
Environment: development
CORS enabled for: http://localhost:5173
MongoDB Connected: cluster0.xsoyur1.mongodb.net
```

### Step 3: Start Frontend (New Terminal)
```bash
cd frontend
npm run dev
```

**Wait for:**
```
VITE v5.0.8  ready in XXX ms

➜  Local:   http://localhost:5173/
```

### Step 4: Test
1. Open: http://localhost:5173
2. Click "Create New Meeting"
3. Should work! ✅

## Quick Test Commands

### Test Backend Health
```bash
curl http://localhost:5000/health
```

**Expected:**
```json
{"status":"ok","message":"Server is running"}
```

### Test API
```bash
curl -X POST http://localhost:5000/api/create-meeting \
  -H "Content-Type: application/json" \
  -d '{"appointmentId":"test-123","doctorId":"doc-1","patientId":"pat-1"}'
```

## Troubleshooting

### "Port 5000 already in use"
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or use different port in backend/.env
PORT=8000
```

### "Cannot connect to MongoDB"
Check your MongoDB connection string in `backend/.env`

### "CORS errors still appearing"
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+F5)
3. Check [CORS-FIX.md](CORS-FIX.md)

### "Frontend can't reach backend"
Verify `frontend/.env` has:
```env
VITE_SOCKET_URL=http://localhost:5000
VITE_API_URL=http://localhost:5000/api
```

## Success Indicators

### Backend Console
```
✅ Server running on port 5000
✅ MongoDB Connected
✅ No error messages
```

### Frontend Console (F12)
```
✅ No CORS errors
✅ No ERR_UNSAFE_PORT errors
✅ Socket connected: <socket-id>
```

### Browser
```
✅ Page loads at http://localhost:5173
✅ Can create meetings
✅ Can join meetings
✅ Video call works
```

## Files to Check

### backend/.env
```env
PORT=5000
MONGODB_URI=mongodb+srv://...
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

### frontend/.env
```env
VITE_SOCKET_URL=http://localhost:5000
VITE_API_URL=http://localhost:5000/api
```

## Complete Reset (If Needed)

```bash
# Stop all servers (Ctrl+C)

# Backend
cd backend
rm -rf node_modules
npm install
npm run dev

# Frontend (new terminal)
cd frontend
rm -rf node_modules
npm install
npm run dev
```

## All Fixed! 🎉

Your telehealth video calling system is now ready to use!

**Next:** Test creating and joining a video call.

---

**Documentation:**
- [FIXES-APPLIED.md](FIXES-APPLIED.md) - What was fixed
- [CORS-FIX.md](CORS-FIX.md) - CORS details
- [PORT-FIX.md](PORT-FIX.md) - Port details
- [FAQ.md](FAQ.md) - Common questions
