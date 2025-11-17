# Port 6000 Issue - Fixed! ✅

## Problem

Chrome and other browsers block port 6000 as it's considered an "unsafe port" for security reasons.

**Error:**
```
POST http://localhost:6000/api/create-meeting net::ERR_UNSAFE_PORT
```

## Solution

Changed backend to use **port 5000** instead.

## What Was Fixed

### 1. Backend Port (backend/.env)
```env
PORT=5000  # Changed from 6000
```

### 2. Frontend Configuration (frontend/.env)
```env
VITE_SOCKET_URL=http://localhost:5000
VITE_API_URL=http://localhost:5000/api
```

### 3. Frontend Code (frontend/src/pages/Home.jsx)
```javascript
// Now uses environment variable
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const response = await fetch(`${apiUrl}/create-meeting`, {
```

## Unsafe Ports (Blocked by Browsers)

These ports are blocked by Chrome, Firefox, and other browsers:
- 6000 ❌
- 6665-6669 ❌
- 6697 ❌
- And many others...

## Safe Ports to Use

✅ **Recommended ports:**
- 3000 (common for React)
- 4000
- 5000 ✅ (we're using this)
- 8000
- 8080
- 3001-3999
- 5001-5999
- 8001-8079

## How to Apply the Fix

### Step 1: Stop All Servers
Press `Ctrl+C` in both terminal windows

### Step 2: Update Backend
```bash
cd backend

# The .env file has been created with PORT=5000
# If you need to create it manually:
# echo PORT=5000 > .env
# echo MONGODB_URI=your_mongodb_uri >> .env
# echo CORS_ORIGIN=http://localhost:5173 >> .env
# echo NODE_ENV=development >> .env

npm run dev
```

You should see:
```
Server running on port 5000
```

### Step 3: Update Frontend
```bash
cd frontend

# The .env file has been created with correct URLs
# If you need to create it manually:
# echo VITE_SOCKET_URL=http://localhost:5000 > .env
# echo VITE_API_URL=http://localhost:5000/api >> .env

npm run dev
```

### Step 4: Test
1. Open http://localhost:5173
2. Click "Create New Meeting"
3. Should work without errors! ✅

## Verification

### Check Backend
```bash
curl http://localhost:5000/health
```

Should return:
```json
{"status":"ok","message":"Server is running"}
```

### Check Frontend Console
Open browser DevTools (F12) → Console

**Before Fix:**
```
❌ POST http://localhost:6000/api/create-meeting net::ERR_UNSAFE_PORT
```

**After Fix:**
```
✅ No errors
✅ Meeting created successfully
```

## Environment Files Created

### backend/.env
```env
PORT=5000
MONGODB_URI=mongodb+srv://rishabh:rishabh123@cluster0.xsoyur1.mongodb.net/telehealth?retryWrites=true&w=majority&appName=Cluster0
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

### frontend/.env
```env
VITE_SOCKET_URL=http://localhost:5000
VITE_API_URL=http://localhost:5000/api
```

## If You Need a Different Port

### Option 1: Use Port 8000
```env
# backend/.env
PORT=8000

# frontend/.env
VITE_SOCKET_URL=http://localhost:8000
VITE_API_URL=http://localhost:8000/api
```

### Option 2: Use Port 3000
```env
# backend/.env
PORT=3000

# frontend/.env
VITE_SOCKET_URL=http://localhost:3000
VITE_API_URL=http://localhost:3000/api
```

## Troubleshooting

### "Port 5000 is already in use"

**Check what's using the port:**
```bash
# Windows
netstat -ano | findstr :5000

# Mac/Linux
lsof -i :5000
```

**Kill the process:**
```bash
# Windows (replace PID with actual process ID)
taskkill /PID <PID> /F

# Mac/Linux
kill -9 <PID>
```

**Or use a different port:**
```env
PORT=8000
```

### "Cannot connect to server"

1. Make sure backend is running on port 5000
2. Check backend terminal for errors
3. Verify .env files are correct
4. Restart both servers

### "Still getting ERR_UNSAFE_PORT"

1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+F5)
3. Check frontend/.env has correct port
4. Restart frontend dev server

## Summary

✅ **Backend now runs on port 5000** (safe port)  
✅ **Frontend configured to use port 5000**  
✅ **Environment variables properly set**  
✅ **No more ERR_UNSAFE_PORT errors**  

**You can now create meetings and start video calls!**

---

**Next Steps:**
1. Restart backend: `cd backend && npm run dev`
2. Restart frontend: `cd frontend && npm run dev`
3. Test at http://localhost:5173

**Need help?** Check [CORS-FIX.md](CORS-FIX.md) or [FAQ.md](FAQ.md)
