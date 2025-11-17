# Quick Start Guide

Get your telehealth video calling system running in 5 minutes!

## Prerequisites
- Node.js installed (v16+)
- MongoDB installed and running

## Step 1: Start MongoDB

**Windows:**
```cmd
mongod
```

**Mac/Linux:**
```bash
sudo systemctl start mongod
```

Or use MongoDB Atlas (cloud) - update MONGODB_URI in .env

## Step 2: Setup Backend

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

Backend should now be running on http://localhost:5000

## Step 3: Setup Frontend

Open a new terminal:

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Frontend should now be running on http://localhost:5173

## Step 4: Test the Video Call

1. Open http://localhost:5173 in Chrome/Firefox
2. Click "Create New Meeting"
3. Copy the room ID from the URL (e.g., room-appt-123)
4. Open a new incognito/private window
5. Go to http://localhost:5173
6. Enter the appointment ID (the number after "room-")
7. Click "Join Existing Meeting"
8. Grant camera/microphone permissions in both windows
9. You should now see both video streams!

## Testing Features

### Mute/Unmute
Click the microphone icon to toggle audio

### Camera On/Off
Click the video camera icon to toggle video

### Screen Share
Click the monitor icon to share your screen

### Chat
Click the message icon to open the chat panel

### End Call
Click the red phone icon to end the call

## Troubleshooting

### "Failed to connect to server"
- Make sure backend is running on port 5000
- Check if MongoDB is running

### "Permission denied" for camera/mic
- Click the lock icon in browser address bar
- Allow camera and microphone permissions
- Refresh the page

### Video not showing
- Check if another app is using your camera
- Try a different browser
- Make sure you're using HTTPS in production

### Socket connection issues
- Check CORS settings in backend/.env
- Verify VITE_SOCKET_URL in frontend/.env
- Check firewall settings

## Production Deployment Checklist

- [ ] Set up HTTPS for both frontend and backend
- [ ] Configure TURN server (Coturn) for NAT traversal
- [ ] Update MONGODB_URI to production database
- [ ] Set NODE_ENV=production
- [ ] Update CORS_ORIGIN to production domain
- [ ] Implement user authentication
- [ ] Add rate limiting
- [ ] Set up monitoring and logging
- [ ] Test on different networks and devices

## Integration with Your Portal

To integrate this into your existing telehealth portal:

1. **Authentication**: Replace hardcoded userId, userName, userType in App.jsx with your auth system
2. **API Integration**: Call the create-meeting API when scheduling appointments
3. **Database**: Link Meeting model with your existing Appointment model
4. **Styling**: Customize Tailwind classes to match your brand
5. **Routes**: Integrate the /call/:roomId route into your existing router

## Next Steps

- Add recording functionality
- Implement waiting room with approval
- Add virtual backgrounds
- Integrate with calendar systems
- Add prescription/notes sharing during call
- Implement call quality indicators
- Add breakout rooms for group consultations

## Support

If you encounter issues:
1. Check the browser console for errors
2. Check backend terminal for server errors
3. Verify all environment variables are set correctly
4. Ensure MongoDB is running and accessible

Happy coding! 🚀
