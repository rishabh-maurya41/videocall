const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meetingController');

router.post('/create-meeting', meetingController.createMeeting);
router.get('/meeting/:roomId', meetingController.getMeeting);
router.put('/meeting/:roomId/status', meetingController.updateMeetingStatus);
router.post('/meeting/:roomId/participant', meetingController.addParticipant);

module.exports = router;
